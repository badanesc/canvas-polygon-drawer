import {Shape, Polygon} from '../types';
import {getHitPolygonLine} from '@/app/utils/hitTest';

export const usePolygonPointAddition = (
  shapes: Shape[],
  selectedShape: Shape | null,
  setShapes: (shapes: Shape[]) => void,
  setSelectedShape: (shape: Shape | null) => void,
) => {
  const handleDoubleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedShape || selectedShape.type !== 'polygon') return;

    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;

    // Check if we hit a polygon line
    const lineHit = getHitPolygonLine(
      canvasX,
      canvasY,
      selectedShape as Polygon,
    );
    if (lineHit) {
      // Insert the new point after the line's start point
      const newPoints = [...(selectedShape as Polygon).points];
      newPoints.splice(lineHit.lineIndex + 1, 0, lineHit.point);

      // Update shape with new point
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
      // Update selected shape to match
      setSelectedShape({
        ...selectedShape,
        points: newPoints,
      });
    }
  };

  return {handleDoubleClick};
};
