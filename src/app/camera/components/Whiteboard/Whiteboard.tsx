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
  drawPolygonSelection,
  drawPolygonPoints,
} from '@/app/utils/draw';
import {Shape, CanvasMode} from './types';
import {
  getHitElement,
  getHitPolygonPoint,
  PolygonPointHit,
} from '@/app/utils/hitTest';

export default function Whiteboard() {
  const whiteboardRef = useRef<HTMLDivElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const [bgCanvasSize, setBgCanvasSize] = useState({width: 0, height: 0});
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [currentMode, setCurrentMode] = useState<CanvasMode>('select');
  const [selectedShape, setSelectedShape] = useState<Shape | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({x: 0, y: 0});
  const [selectedPoint, setSelectedPoint] = useState<PolygonPointHit>(null);

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

  // Handle keyboard events for point deletion
  useLayoutEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.key === 'Delete' || event.key === 'Backspace') &&
        selectedShape?.type === 'polygon' &&
        selectedPoint
      ) {
        // Remove the selected point
        const newPoints = selectedShape.points.filter(
          (_, index) => index !== selectedPoint.pointIndex,
        );

        // If we have at least 3 points, update the polygon
        if (newPoints.length >= 3) {
          setShapes((prev) =>
            prev.map((shape) =>
              shape.id === selectedShape.id
                ? {
                    ...shape,
                    points: newPoints,
                  }
                : shape,
            ),
          );
          setSelectedShape((prev) =>
            prev?.id === selectedShape.id
              ? {
                  ...prev,
                  points: newPoints,
                }
              : prev,
          );
        }
        setSelectedPoint(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedShape, selectedPoint]);

  const handleShapeComplete = (shape: Shape) => {
    setShapes((prev) => [...prev, shape]);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (currentMode === 'select') {
      const canvas = bgCanvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const canvasX = event.clientX - rect.left;
      const canvasY = event.clientY - rect.top;

      // If we have a selected polygon, check for point hits first
      if (selectedShape?.type === 'polygon') {
        const hitPoint = getHitPolygonPoint(canvasX, canvasY, selectedShape);
        if (hitPoint) {
          setSelectedPoint(hitPoint);
          return;
        }
      }

      const hitElement = getHitElement(canvasX, canvasY, shapes, selectedShape);

      if (hitElement) {
        setSelectedShape(hitElement);
        setIsDragging(true);
        if (hitElement.type === 'arrow') {
          setDragOffset({
            x: canvasX - hitElement.startX,
            y: canvasY - hitElement.startY,
          });
        } else if (hitElement.type === 'polygon') {
          setDragOffset({
            x: canvasX - hitElement.points[0].x,
            y: canvasY - hitElement.points[0].y,
          });
        }
      } else {
        setSelectedShape(null);
        setIsDragging(false);
        setSelectedPoint(null);
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
      } else if (selectedShape.type === 'polygon') {
        // Calculate new position
        const newStartX = canvasX - dragOffset.x;
        const newStartY = canvasY - dragOffset.y;
        const dx = newStartX - selectedShape.points[0].x;
        const dy = newStartY - selectedShape.points[0].y;

        // Update all points of the polygon
        const newPoints = selectedShape.points.map((point) => ({
          x: point.x + dx,
          y: point.y + dy,
        }));

        // Update shape position and maintain selection
        setShapes((prev) =>
          prev.map((shape) =>
            shape.id === selectedShape.id
              ? {
                  ...shape,
                  points: newPoints,
                }
              : shape,
          ),
        );
        // Update selected shape to match new position
        setSelectedShape((prev) =>
          prev?.id === selectedShape.id
            ? {
                ...prev,
                points: newPoints,
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
