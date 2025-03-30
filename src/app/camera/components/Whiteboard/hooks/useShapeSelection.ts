import {useState} from 'react';
import {Shape, CanvasMode} from '../types';
import {
  getHitElement,
  getHitPolygonPoint,
  PolygonPointHit,
  getHitArrowHandle,
  ArrowHandleHit,
} from '@/app/utils/hitTest';

export const useShapeSelection = (shapes: Shape[]) => {
  const [selectedShape, setSelectedShape] = useState<Shape | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({x: 0, y: 0});
  const [selectedPoint, setSelectedPoint] = useState<PolygonPointHit>(null);
  const [resizingHandle, setResizingHandle] = useState<ArrowHandleHit>(null);

  const handlePointerDown = (
    event: React.PointerEvent<HTMLCanvasElement>,
    currentMode: CanvasMode,
  ) => {
    if (currentMode !== 'select') return;

    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;

    // If we have a selected polygon, check for point hits first
    if (selectedShape?.type === 'polygon') {
      const hitPoint = getHitPolygonPoint(canvasX, canvasY, selectedShape);
      if (hitPoint) {
        setSelectedPoint(hitPoint);
        setIsDragging(true);
        return;
      } else {
        // If we clicked outside a point but on the same polygon, just reset the point selection
        setSelectedPoint(null);
      }
    }

    // If we have a selected arrow, check for handle hits first
    if (selectedShape?.type === 'arrow') {
      const handleHit = getHitArrowHandle(canvasX, canvasY, selectedShape);
      if (handleHit) {
        setResizingHandle(handleHit);
        setIsDragging(true);
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
      setResizingHandle(null);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setResizingHandle(null);
  };

  return {
    selectedShape,
    setSelectedShape,
    isDragging,
    dragOffset,
    selectedPoint,
    setSelectedPoint,
    resizingHandle,
    setResizingHandle,
    handlePointerDown,
    handlePointerUp,
  };
};
