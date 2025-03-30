'use client';
import React, {useRef, useState, useLayoutEffect} from 'react';

import styles from './Whiteboard.module.css';
import ArrowDrawing from './ArrowDrawing';
import PolygonDrawing from './PolygonDrawing';
import {Toolbar} from './components/Toolbar';
import {useShapeSelection} from './hooks/useShapeSelection';
import {useShapeManipulation} from './hooks/useShapeManipulation';
import {usePolygonPointDeletion} from './hooks/usePolygonPointDeletion';
import {usePolygonPointAddition} from './hooks/usePolygonPointAddition';
import {useCanvasResize} from './hooks/useCanvasResize';
import {PolygonPointHit, ArrowHandleHit} from '@/app/utils/hitTest';

import {
  clearCanvas,
  drawArrow,
  drawPolygon,
  drawArrowSelection,
  drawPolygonSelection,
  drawPolygonPoints,
} from '@/app/utils/draw';
import {Shape, CanvasMode} from './types';

export default function Whiteboard() {
  const whiteboardRef = useRef<HTMLDivElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const bgCanvasSize = useCanvasResize(whiteboardRef);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [currentMode, setCurrentMode] = useState<CanvasMode>('select');

  // Use custom hooks for shape manipulation
  const {
    selectedShape,
    setSelectedShape,
    isDragging,
    dragOffset,
    selectedPoint,
    setSelectedPoint,
    resizingHandle,
    handlePointerDown,
    handlePointerUp,
  } = useShapeSelection(shapes);

  const {handlePointerMove} = useShapeManipulation(
    shapes,
    setShapes,
    selectedShape,
    setSelectedShape,
    dragOffset,
    selectedPoint,
    setSelectedPoint,
    resizingHandle,
    isDragging,
  );

  usePolygonPointDeletion(
    shapes,
    selectedShape,
    selectedPoint,
    setShapes,
    setSelectedShape,
    setSelectedPoint,
  );

  const {handleDoubleClick} = usePolygonPointAddition(
    shapes,
    selectedShape,
    setShapes,
    setSelectedShape,
  );

  // Effect to redraw all shapes when canvas size changes or selection changes
  useLayoutEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;

    clearCanvas(canvas);

    // Redraw all shapes
    shapes.forEach((shape) => {
      switch (shape.type) {
        case 'arrow':
          drawArrow(
            canvas,
            {x: shape.startX, y: shape.startY},
            {x: shape.endX, y: shape.endY},
          );
          // Draw selection outline if this shape is selected
          if (selectedShape?.id === shape.id) {
            drawArrowSelection(
              canvas,
              {x: shape.startX, y: shape.startY},
              {x: shape.endX, y: shape.endY},
            );
          }
          break;
        case 'polygon':
          drawPolygon(canvas, shape.points);
          // Draw selection outline if this shape is selected
          if (selectedShape?.id === shape.id) {
            drawPolygonSelection(canvas, shape.points);
            // Draw points if polygon is selected
            drawPolygonPoints(canvas, shape.points, selectedPoint?.pointIndex);
          }
          break;
      }
    });
  }, [bgCanvasSize, shapes, selectedShape, selectedPoint]);

  const handleShapeComplete = (shape: Shape) => {
    setShapes((prev) => [...prev, shape]);
  };

  return (
    <div className={styles.whiteboard} ref={whiteboardRef}>
      <Toolbar currentMode={currentMode} onModeChange={setCurrentMode} />

      <canvas
        id="background-canvas"
        ref={bgCanvasRef}
        width={bgCanvasSize.width}
        height={bgCanvasSize.height}
        onPointerDown={(e) => handlePointerDown(e, currentMode)}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onDoubleClick={handleDoubleClick}
      />

      {currentMode === 'arrow' && (
        <ArrowDrawing
          width={bgCanvasSize.width}
          height={bgCanvasSize.height}
          onComplete={handleShapeComplete}
        />
      )}

      {currentMode === 'polygon' && (
        <PolygonDrawing
          width={bgCanvasSize.width}
          height={bgCanvasSize.height}
          onComplete={handleShapeComplete}
        />
      )}
    </div>
  );
}
