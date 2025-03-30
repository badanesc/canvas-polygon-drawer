export const drawArrow = (
  canvas: HTMLCanvasElement,
  start: {x: number; y: number},
  end: {x: number; y: number},
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Calculate the angle and length
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const length = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2),
  );

  // Arrow head parameters
  const headLength = Math.min(20, length / 3); // Arrow head length
  const headAngle = Math.PI / 6; // 30 degrees

  // Draw the main line
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);

  // Calculate arrow head points
  const x1 = end.x - headLength * Math.cos(angle - headAngle);
  const y1 = end.y - headLength * Math.sin(angle - headAngle);
  const x2 = end.x - headLength * Math.cos(angle + headAngle);
  const y2 = end.y - headLength * Math.sin(angle + headAngle);

  // Draw arrow head
  ctx.moveTo(end.x, end.y);
  ctx.lineTo(x1, y1);
  ctx.moveTo(end.x, end.y);
  ctx.lineTo(x2, y2);

  // Set line style and stroke
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.stroke();
};

export const drawPolygon = (
  canvas: HTMLCanvasElement,
  points: Array<{x: number; y: number}>,
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx || points.length < 3) return;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  // Draw lines between all points
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }

  // Close the polygon by connecting back to first point
  ctx.lineTo(points[0].x, points[0].y);

  // Set style and stroke
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.stroke();
};
