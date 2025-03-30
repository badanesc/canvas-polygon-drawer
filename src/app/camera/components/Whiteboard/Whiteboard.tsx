'use client';
import React, {useRef, useState, useEffect, useLayoutEffect} from 'react';

import styles from './Whiteboard.module.css';

import {drawArrow, drawPolygon} from '@/app/utils/draw';

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

export default function Whiteboard() {
  const whiteboardRef = useRef<HTMLDivElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const [bgCanvasSize, setBgCanvasSize] = useState({width: 0, height: 0});
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({x: 0, y: 0});
  const [currentPoint, setCurrentPoint] = useState({x: 0, y: 0});
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [currentMode, setCurrentMode] = useState<DrawingMode>('arrow');
  const [polygonPoints, setPolygonPoints] = useState<{x: number; y: number}[]>(
    [],
  );

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
    if (!bgCanvasRef.current) return;
    const canvas = bgCanvasRef.current;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, bgCanvasSize.width, bgCanvasSize.height);

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

  const drawShape = (
    canvas: HTMLCanvasElement,
    start: {x: number; y: number},
    end: {x: number; y: number},
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    switch (currentMode) {
      case 'arrow':
        drawArrow(canvas, start, end);
        break;
      case 'polygon':
        drawPolygon(canvas, polygonPoints);
        break;
    }
  };

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (currentMode === 'polygon') {
      setPolygonPoints((prev) => [...prev, {x, y}]);
      return;
    }

    setIsDrawing(true);
    setStartPoint({x, y});
    setCurrentPoint({x, y});
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setCurrentPoint({x, y});
  };

  const onPointerUp = () => {
    if (!isDrawing && currentMode !== 'polygon') return;

    const newShape: Shape = (() => {
      switch (currentMode) {
        case 'arrow':
          return {
            id: crypto.randomUUID(),
            type: 'arrow',
            startX: startPoint.x,
            startY: startPoint.y,
            endX: currentPoint.x,
            endY: currentPoint.y,
          };
        case 'polygon':
          return {
            id: crypto.randomUUID(),
            type: 'polygon',
            points: [...polygonPoints, currentPoint],
          };
      }
    })();

    setShapes((prev) => [...prev, newShape]);
    setPolygonPoints([]);

    // Clear the drawing canvas
    if (drawingCanvasRef.current) {
      const ctx = drawingCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(
          0,
          0,
          drawingCanvasRef.current.width,
          drawingCanvasRef.current.height,
        );
      }
    }

    setIsDrawing(false);
  };

  // Effect to draw the shape while dragging
  useEffect(() => {
    if (!isDrawing || !drawingCanvasRef.current) return;
    drawShape(drawingCanvasRef.current, startPoint, currentPoint);
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
      ></canvas>
    </div>
  );
}
