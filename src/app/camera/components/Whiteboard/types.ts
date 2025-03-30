export type CanvasMode = 'arrow' | 'polygon' | 'select';

export type Arrow = {
  id: string;
  type: 'arrow';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

export type Polygon = {
  id: string;
  type: 'polygon';
  points: {x: number; y: number}[];
};

export type Shape = Arrow | Polygon;
