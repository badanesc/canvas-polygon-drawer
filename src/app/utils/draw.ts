export const clearCanvas = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

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

  // Fill the polygon with semi-transparent red
  ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
  ctx.fill();

  // Set style and stroke
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.stroke();
};

export const drawPolygonPoints = (
  canvas: HTMLCanvasElement,
  points: Array<{x: number; y: number}>,
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  points.forEach((point) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();
  });
};

export const drawPolygonLines = (
  canvas: HTMLCanvasElement,
  points: Array<{x: number; y: number}>,
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx || points.length === 0) return;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.forEach((point) => {
    ctx.lineTo(point.x, point.y);
  });
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.stroke();
};

export const drawPolygonPreview = (
  canvas: HTMLCanvasElement,
  points: Array<{x: number; y: number}>,
  currentPoint: {x: number; y: number},
  snapDistance: number = 20,
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx || points.length === 0) return;

  const startPoint = points[0];
  const distance = Math.sqrt(
    Math.pow(currentPoint.x - startPoint.x, 2) +
      Math.pow(currentPoint.y - startPoint.y, 2),
  );
  const isNearStart = distance < snapDistance;

  // Draw lines between points
  drawPolygonLines(canvas, points);

  // Draw line to current point or start point
  if (points.length > 0) {
    ctx.beginPath();
    ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
    if (isNearStart) {
      ctx.lineTo(startPoint.x, startPoint.y);
      ctx.strokeStyle = 'green';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Highlight start point
      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = 'green';
      ctx.fill();
    } else {
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // Draw points
  drawPolygonPoints(canvas, points);
};
