import {useEffect} from 'react';
import {Shape} from '../types';

export const useElementDeletion = (
  selectedShape: Shape | null,
  shapes: Shape[],
  setShapes: (shapes: Shape[]) => void,
  setSelectedShape: (shape: Shape | null) => void,
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.key === 'Delete' || event.key === 'Backspace') &&
        selectedShape
      ) {
        // Remove the selected shape
        setShapes(shapes.filter((shape) => shape.id !== selectedShape.id));
        setSelectedShape(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedShape, shapes, setShapes, setSelectedShape]);
};
