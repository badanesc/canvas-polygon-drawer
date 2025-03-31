'use client';

import React, {createContext, useContext, useState} from 'react';
import {Shape} from '../components/Whiteboard/types';

interface ShapesContextType {
  shapes: Shape[];
  setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
}

const ShapesContext = createContext<ShapesContextType | undefined>(undefined);

export function ShapesProvider({children}: {children: React.ReactNode}) {
  const [shapes, setShapes] = useState<Shape[]>([]);

  return (
    <ShapesContext.Provider value={{shapes, setShapes}}>
      {children}
    </ShapesContext.Provider>
  );
}

export function useShapes() {
  const context = useContext(ShapesContext);
  if (context === undefined) {
    throw new Error('useShapes must be used within a ShapesProvider');
  }
  return context;
}
