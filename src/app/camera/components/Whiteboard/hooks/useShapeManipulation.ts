import {Shape} from '../types';
import {PolygonPointHit, ArrowHandleHit} from '@/app/utils/hitTest';

export const useShapeManipulation = (
  shapes: Shape[],
  setShapes: (shapes: Shape[]) => void,
  selectedShape: Shape | null,
  setSelectedShape: (shape: Shape | null) => void,
  dragOffset: {x: number; y: number},
  selectedPoint: PolygonPointHit,
  setSelectedPoint: (point: PolygonPointHit) => void,
  resizingHandle: ArrowHandleHit,
  isDragging: boolean,
) => {
  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!selectedShape || !isDragging) return;

    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;

    if (selectedShape.type === 'polygon' && selectedPoint) {
      // Handle polygon point resizing
      const newPoints = [...selectedShape.points];
      newPoints[selectedPoint.pointIndex] = {x: canvasX, y: canvasY};

      // Update shape position and maintain selection
      setShapes(
        shapes.map((shape: Shape) =>
          shape.id === selectedShape.id
            ? {
                ...shape,
                points: newPoints,
              }
            : shape,
        ),
      );
      // Update selected shape to match new position
      setSelectedShape({
        ...selectedShape,
        points: newPoints,
      });
      // Update selected point to match new position
      setSelectedPoint({
        ...selectedPoint,
        point: {x: canvasX, y: canvasY},
      });
    } else if (selectedShape.type === 'arrow') {
      if (resizingHandle) {
        // Handle resizing
        if (resizingHandle.handle === 'start') {
          // Update shape position and maintain selection
          setShapes(
            shapes.map((shape: Shape) =>
              shape.id === selectedShape.id
                ? {
                    ...shape,
                    startX: canvasX,
                    startY: canvasY,
                  }
                : shape,
            ),
          );
          // Update selected shape to match new position
          setSelectedShape({
            ...selectedShape,
            startX: canvasX,
            startY: canvasY,
          });
        } else if (resizingHandle.handle === 'end') {
          // Update shape position and maintain selection
          setShapes(
            shapes.map((shape: Shape) =>
              shape.id === selectedShape.id
                ? {
                    ...shape,
                    endX: canvasX,
                    endY: canvasY,
                  }
                : shape,
            ),
          );
          // Update selected shape to match new position
          setSelectedShape({
            ...selectedShape,
            endX: canvasX,
            endY: canvasY,
          });
        }
      } else {
        // Handle dragging
        // Calculate new position
        const newStartX = canvasX - dragOffset.x;
        const newStartY = canvasY - dragOffset.y;
        const dx = selectedShape.endX - selectedShape.startX;
        const dy = selectedShape.endY - selectedShape.startY;

        // Update shape position and maintain selection
        setShapes(
          shapes.map((shape: Shape) =>
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
        setSelectedShape({
          ...selectedShape,
          startX: newStartX,
          startY: newStartY,
          endX: newStartX + dx,
          endY: newStartY + dy,
        });
      }
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
      setShapes(
        shapes.map((shape: Shape) =>
          shape.id === selectedShape.id
            ? {
                ...shape,
                points: newPoints,
              }
            : shape,
        ),
      );
      // Update selected shape to match new position
      setSelectedShape({
        ...selectedShape,
        points: newPoints,
      });
    }
  };

  return {handlePointerMove};
};
