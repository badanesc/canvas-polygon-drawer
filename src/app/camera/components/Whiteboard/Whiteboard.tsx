'use client';
import React, {useRef, useState, useLayoutEffect} from 'react';

import styles from './Whiteboard.module.css';
import ArrowDrawing from './ArrowDrawing';
import PolygonDrawing from './PolygonDrawing';

import {clearCanvas, drawArrow, drawPolygon} from '@/app/utils/draw';
import {Shape, DrawingMode} from './types';

export default function Whiteboard() {
  const whiteboardRef = useRef<HTMLDivElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const [bgCanvasSize, setBgCanvasSize] = useState({width: 0, height: 0});
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [currentMode, setCurrentMode] = useState<DrawingMode>('arrow');

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
          break;
        case 'polygon':
          drawPolygon(canvas, shape.points);
          break;
      }
    });
  }, [bgCanvasSize, shapes]);

  const handleShapeComplete = (shape: Shape) => {
    setShapes((prev) => [...prev, shape]);
  };

  return (
    <div className={styles.whiteboard} ref={whiteboardRef}>
      <canvas
        id="background-canvas"
        ref={bgCanvasRef}
        width={bgCanvasSize.width}
        height={bgCanvasSize.height}
      />
      {currentMode === 'arrow' ? (
        <ArrowDrawing
          width={bgCanvasSize.width}
          height={bgCanvasSize.height}
          onComplete={handleShapeComplete}
        />
      ) : (
        <PolygonDrawing
          width={bgCanvasSize.width}
          height={bgCanvasSize.height}
          onComplete={handleShapeComplete}
        />
      )}
    </div>
  );
}
