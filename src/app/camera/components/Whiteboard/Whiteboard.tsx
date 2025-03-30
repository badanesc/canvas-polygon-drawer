'use client';
import React, {useRef, useState, useLayoutEffect} from 'react';

import styles from './Whiteboard.module.css';
import ArrowDrawing from './ArrowDrawing';
import PolygonDrawing from './PolygonDrawing';

import {
  clearCanvas,
  drawArrow,
  drawPolygon,
  drawArrowSelection,
} from '@/app/utils/draw';
import {Shape, CanvasMode} from './types';
import {getHitElement} from '@/app/utils/hitTest';

export default function Whiteboard() {
  const whiteboardRef = useRef<HTMLDivElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const [bgCanvasSize, setBgCanvasSize] = useState({width: 0, height: 0});
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [currentMode, setCurrentMode] = useState<CanvasMode>('select');
  const [selectedShape, setSelectedShape] = useState<Shape | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({x: 0, y: 0});

  // Effect to resize the canvas when the window is resized
  useLayoutEffect(() => {
    if (!whiteboardRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const {width, height} = entry.contentRect;
        setBgCanvasSize({width, height});
      }
    });

    resizeObserver.observe(whiteboardRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

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
          break;
      }
    });
  }, [bgCanvasSize, shapes, selectedShape]);

  const handleShapeComplete = (shape: Shape) => {
    setShapes((prev) => [...prev, shape]);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (currentMode === 'select') {
      const canvas = bgCanvasRef.current;
      if (!canvas) return;

      // Get canvas position and size
      const rect = canvas.getBoundingClientRect();

      // Convert viewport coordinates to canvas coordinates
      const canvasX = event.clientX - rect.left;
      const canvasY = event.clientY - rect.top;

      const hitElement = getHitElement(canvasX, canvasY, shapes, selectedShape);

      if (hitElement) {
        setSelectedShape(hitElement);
        setIsDragging(true);
        // Calculate offset between pointer and shape's start point
        if (hitElement.type === 'arrow') {
          setDragOffset({
            x: canvasX - hitElement.startX,
            y: canvasY - hitElement.startY,
          });
        }
      } else {
        setSelectedShape(null);
        setIsDragging(false);
      }
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDragging && selectedShape && currentMode === 'select') {
      const canvas = bgCanvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const canvasX = event.clientX - rect.left;
      const canvasY = event.clientY - rect.top;

      if (selectedShape.type === 'arrow') {
        // Calculate new position
        const newStartX = canvasX - dragOffset.x;
        const newStartY = canvasY - dragOffset.y;
        const dx = selectedShape.endX - selectedShape.startX;
        const dy = selectedShape.endY - selectedShape.startY;

        // Update shape position and maintain selection
        setShapes((prev) =>
          prev.map((shape) =>
            shape.id === selectedShape.id
              ? {
                  ...shape,
                  startX: newStartX,
                  startY: newStartY,
                  endX: newStartX + dx,
                  endY: newStartY + dy,
                }
              : shape,
          ),
        );
        // Update selected shape to match new position
        setSelectedShape((prev) =>
          prev?.id === selectedShape.id
            ? {
                ...prev,
                startX: newStartX,
                startY: newStartY,
                endX: newStartX + dx,
                endY: newStartY + dy,
              }
            : prev,
        );
      }
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div className={styles.whiteboard} ref={whiteboardRef}>
      <div className={styles.toolbar}>
        <button
          className={`${styles.toolButton} ${currentMode === 'select' ? styles.active : ''}`}
          onClick={() => setCurrentMode('select')}
        >
          Select
        </button>
        <button
          className={`${styles.toolButton} ${currentMode === 'arrow' ? styles.active : ''}`}
          onClick={() => setCurrentMode('arrow')}
        >
          Arrow
        </button>
        <button
          className={`${styles.toolButton} ${currentMode === 'polygon' ? styles.active : ''}`}
          onClick={() => setCurrentMode('polygon')}
        >
          Polygon
        </button>
      </div>

      <canvas
        id="background-canvas"
        ref={bgCanvasRef}
        width={bgCanvasSize.width}
        height={bgCanvasSize.height}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
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
