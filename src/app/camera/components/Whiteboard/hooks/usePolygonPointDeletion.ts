import {useEffect} from 'react';
import {Shape} from '../types';
import {PolygonPointHit} from '@/app/utils/hitTest';

export const usePolygonPointDeletion = (
  shapes: Shape[],
  selectedShape: Shape | null,
  selectedPoint: PolygonPointHit,
  setShapes: (shapes: Shape[]) => void,
  setSelectedShape: (shape: Shape | null) => void,
  setSelectedPoint: (point: PolygonPointHit) => void,
) => {
  useEffect(() => {
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
          setSelectedShape({
            ...selectedShape,
            points: newPoints,
          });
        }
        setSelectedPoint(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    shapes,
    selectedShape,
    selectedPoint,
    setShapes,
    setSelectedShape,
    setSelectedPoint,
  ]);
};
