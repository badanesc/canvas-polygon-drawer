'use client';
import React, {useRef, useState, useEffect, useLayoutEffect} from 'react';

import styles from './Whiteboard.module.css';

export default function Whiteboard() {
  const whiteboardRef = useRef<HTMLDivElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const [bgCanvasSize, setBgCanvasSize] = useState({width: 0, height: 0});
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({x: 0, y: 0});
  const [currentPoint, setCurrentPoint] = useState({x: 0, y: 0});

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

  const drawRect = (
    canvas: HTMLCanvasElement,
    start: {x: number; y: number},
    end: {x: number; y: number},
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = end.x - start.x;
    const height = end.y - start.y;

    ctx.fillStyle = 'red';
    ctx.fillRect(start.x, start.y, width, height);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

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
    if (!isDrawing) return;

    // Draw the final rectangle on the background canvas
    if (bgCanvasRef.current) {
      drawRect(bgCanvasRef.current, startPoint, currentPoint);
    }

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

  // Effect to draw the rectangle while dragging
  useEffect(() => {
    if (!isDrawing || !drawingCanvasRef.current) return;

    const ctx = drawingCanvasRef.current.getContext('2d');
    if (!ctx) return;

    // Clear previous drawing
    ctx.clearRect(
      0,
      0,
      drawingCanvasRef.current.width,
      drawingCanvasRef.current.height,
    );

    // Draw new rectangle
    drawRect(drawingCanvasRef.current, startPoint, currentPoint);
  }, [isDrawing, startPoint, currentPoint]);

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
