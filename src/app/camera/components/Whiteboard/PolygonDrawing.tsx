import React, {useRef, useState, useEffect} from 'react';
import {clearCanvas, drawPolygonPreview} from '@/app/utils/draw';
import {Polygon} from './types';

type PolygonDrawingProps = {
  width: number;
  height: number;
  onComplete: (shape: Polygon) => void;
};

const SNAP_DISTANCE = 20; // Distance in pixels to snap to start point

export default function PolygonDrawing({
  width,
  height,
  onComplete,
}: PolygonDrawingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [polygonPoints, setPolygonPoints] = useState<{x: number; y: number}[]>(
    [],
  );
  const [currentPoint, setCurrentPoint] = useState({x: 0, y: 0});

  // Handle escape key to cancel polygon drawing
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && polygonPoints.length > 0) {
        setPolygonPoints([]);
        if (canvasRef.current) {
          clearCanvas(canvasRef.current);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [polygonPoints.length]);

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if we're near the start point
    const startPoint = polygonPoints[0];
    if (startPoint) {
      const distance = Math.sqrt(
        Math.pow(x - startPoint.x, 2) + Math.pow(y - startPoint.y, 2),
      );
      if (distance < SNAP_DISTANCE) {
        // Complete the polygon
        const newShape = {
          id: crypto.randomUUID(),
          type: 'polygon' as const,
          points: [...polygonPoints],
        };
        onComplete(newShape);
        setPolygonPoints([]);
        if (canvasRef.current) {
          clearCanvas(canvasRef.current);
        }
        return;
      }
    }
    setPolygonPoints((prev) => [...prev, {x, y}]);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setCurrentPoint({x, y});
  };

  const onDoubleClick = () => {
    if (polygonPoints.length >= 3) {
      const newShape = {
        id: crypto.randomUUID(),
        type: 'polygon' as const,
        points: [...polygonPoints],
      };
      onComplete(newShape);
      setPolygonPoints([]);
      if (canvasRef.current) {
        clearCanvas(canvasRef.current);
      }
    }
  };

  const onContextMenu = (event: React.MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    if (polygonPoints.length >= 3) {
      const newShape = {
        id: crypto.randomUUID(),
        type: 'polygon' as const,
        points: [...polygonPoints],
      };
      onComplete(newShape);
      setPolygonPoints([]);
      if (canvasRef.current) {
        clearCanvas(canvasRef.current);
      }
    }
  };

  // Effect to draw the preview
  useEffect(() => {
    if (!canvasRef.current) return;
    clearCanvas(canvasRef.current);
    drawPolygonPreview(
      canvasRef.current,
      polygonPoints,
      currentPoint,
      SNAP_DISTANCE,
    );
  }, [polygonPoints, currentPoint]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
    />
  );
}
