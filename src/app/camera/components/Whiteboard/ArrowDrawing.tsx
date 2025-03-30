import React, {useRef, useState, useEffect} from 'react';
import {clearCanvas, drawArrow} from '@/app/utils/draw';
import {Arrow} from './types';

type ArrowDrawingProps = {
  width: number;
  height: number;
  onComplete: (shape: Arrow) => void;
};

export default function ArrowDrawing({
  width,
  height,
  onComplete,
}: ArrowDrawingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({x: 0, y: 0});
  const [currentPoint, setCurrentPoint] = useState({x: 0, y: 0});

  const drawPreviewShape = (
    canvas: HTMLCanvasElement,
    start: {x: number; y: number},
    end: {x: number; y: number},
  ) => {
    clearCanvas(canvas);
    drawArrow(canvas, start, end);
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

    const newShape = {
      id: crypto.randomUUID(),
      type: 'arrow' as const,
      startX: startPoint.x,
      startY: startPoint.y,
      endX: currentPoint.x,
      endY: currentPoint.y,
    };

    onComplete(newShape);
    setIsDrawing(false);
  };

  // Effect to draw the shape while dragging
  useEffect(() => {
    if (!isDrawing) return;
    if (!canvasRef.current) return;
    drawPreviewShape(canvasRef.current, startPoint, currentPoint);
  }, [isDrawing, startPoint, currentPoint]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    />
  );
}
