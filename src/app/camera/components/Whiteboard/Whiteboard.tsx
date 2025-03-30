'use client';
import React, {useRef, useState, useEffect, useLayoutEffect} from 'react';

import styles from './Whiteboard.module.css';

import {
  clearCanvas,
  drawArrow,
  drawPolygon,
  drawPolygonPreview,
} from '@/app/utils/draw';

type DrawingMode = 'arrow' | 'polygon';

type Arrow = {
  id: string;
  type: 'arrow';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

type Polygon = {
  id: string;
  type: 'polygon';
  points: {x: number; y: number}[];
};

type Shape = Arrow | Polygon;

const SNAP_DISTANCE = 20; // Distance in pixels to snap to start point

export default function Whiteboard() {
  const whiteboardRef = useRef<HTMLDivElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const [bgCanvasSize, setBgCanvasSize] = useState({width: 0, height: 0});
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({x: 0, y: 0});
  const [currentPoint, setCurrentPoint] = useState({x: 0, y: 0});
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [currentMode, setCurrentMode] = useState<DrawingMode>('polygon');
  const [polygonPoints, setPolygonPoints] = useState<{x: number; y: number}[]>(
    [],
  );

  // Handle escape key to cancel polygon drawing
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === 'Escape' &&
        currentMode === 'polygon' &&
        polygonPoints.length > 0
      ) {
        setPolygonPoints([]);
        if (drawingCanvasRef.current) {
          clearCanvas(drawingCanvasRef.current);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentMode, polygonPoints.length]);

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

  // Effect to redraw all shapes when canvas size changes
  useEffect(() => {
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
          break;
        case 'polygon':
          drawPolygon(canvas, shape.points);
          break;
      }
    });
  }, [bgCanvasSize, shapes]);

  const drawPreviewShape = (
    canvas: HTMLCanvasElement,
    start: {x: number; y: number},
    end: {x: number; y: number},
  ) => {
    clearCanvas(canvas);

    switch (currentMode) {
      case 'arrow':
        drawArrow(canvas, start, end);
        break;
      case 'polygon':
        drawPolygonPreview(canvas, polygonPoints, end, SNAP_DISTANCE);
        break;
    }
  };

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (currentMode === 'polygon') {
      // Check if we're near the start point
      const startPoint = polygonPoints[0];
      if (startPoint) {
        const distance = Math.sqrt(
          Math.pow(x - startPoint.x, 2) + Math.pow(y - startPoint.y, 2),
        );
        if (distance < SNAP_DISTANCE) {
          // Complete the polygon
          const newShape: Polygon = {
            id: crypto.randomUUID(),
            type: 'polygon',
            points: [...polygonPoints],
          };
          setShapes((prev) => [...prev, newShape]);
          setPolygonPoints([]);
          if (drawingCanvasRef.current) {
            clearCanvas(drawingCanvasRef.current);
          }
          return;
        }
      }
      setPolygonPoints((prev) => [...prev, {x, y}]);
      return;
    }

    setIsDrawing(true);
    setStartPoint({x, y});
    setCurrentPoint({x, y});
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing && currentMode !== 'polygon') return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setCurrentPoint({x, y});
  };

  const onPointerUp = () => {
    if (!isDrawing && currentMode !== 'polygon') return;

    if (currentMode === 'arrow') {
      const newShape: Arrow = {
        id: crypto.randomUUID(),
        type: 'arrow',
        startX: startPoint.x,
        startY: startPoint.y,
        endX: currentPoint.x,
        endY: currentPoint.y,
      };
      setShapes((prev) => [...prev, newShape]);
      setIsDrawing(false);
    }
  };

  const onDoubleClick = () => {
    if (currentMode === 'polygon' && polygonPoints.length >= 3) {
      const newShape: Polygon = {
        id: crypto.randomUUID(),
        type: 'polygon',
        points: [...polygonPoints],
      };
      setShapes((prev) => [...prev, newShape]);
      setPolygonPoints([]);
      if (drawingCanvasRef.current) {
        clearCanvas(drawingCanvasRef.current);
      }
    }
  };

  const onContextMenu = (event: React.MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    if (currentMode === 'polygon' && polygonPoints.length >= 3) {
      const newShape: Polygon = {
        id: crypto.randomUUID(),
        type: 'polygon',
        points: [...polygonPoints],
      };
      setShapes((prev) => [...prev, newShape]);
      setPolygonPoints([]);

      // Clear the drawing canvas
      if (drawingCanvasRef.current) {
        clearCanvas(drawingCanvasRef.current);
      }
    }
  };

  // Effect to draw the shape while dragging
  useEffect(() => {
    if (!isDrawing && currentMode !== 'polygon') return;
    if (!drawingCanvasRef.current) return;
    drawPreviewShape(drawingCanvasRef.current, startPoint, currentPoint);
  }, [isDrawing, startPoint, currentPoint, currentMode, polygonPoints]);

  return (
    <div className={styles.whiteboard} ref={whiteboardRef}>
      <canvas
        id="background-canvas"
        ref={bgCanvasRef}
        width={bgCanvasSize.width}
        height={bgCanvasSize.height}
      ></canvas>
      <canvas
        id="drawing-canvas"
        ref={drawingCanvasRef}
        width={bgCanvasSize.width}
        height={bgCanvasSize.height}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onContextMenu={onContextMenu}
        onDoubleClick={onDoubleClick}
      ></canvas>
    </div>
  );
}
