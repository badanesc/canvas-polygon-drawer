import {Shape, Arrow} from '@/app/camera/components/Whiteboard/types';

const HIT_THRESHOLD = 5; // pixels
const SELECTION_PADDING = 10; // pixels

function distanceToLineSegment(
  pointX: number,
  pointY: number,
  lineStartX: number,
  lineStartY: number,
  lineEndX: number,
  lineEndY: number,
): number {
  const dx = lineEndX - lineStartX;
  const dy = lineEndY - lineStartY;
  const length = Math.sqrt(dx * dx + dy * dy);

  // If line segment is just a point, return distance to that point
  if (length === 0) {
    return Math.sqrt(
      Math.pow(pointX - lineStartX, 2) + Math.pow(pointY - lineStartY, 2),
    );
  }

  // Calculate projection of point onto line
  const t =
    ((pointX - lineStartX) * dx + (pointY - lineStartY) * dy) /
    (length * length);

  // If projection is outside line segment, return distance to nearest endpoint
  if (t < 0) {
    return Math.sqrt(
      Math.pow(pointX - lineStartX, 2) + Math.pow(pointY - lineStartY, 2),
    );
  }
  if (t > 1) {
    return Math.sqrt(
      Math.pow(pointX - lineEndX, 2) + Math.pow(pointY - lineEndY, 2),
    );
  }

  // Calculate projection point
  const projX = lineStartX + t * dx;
  const projY = lineStartY + t * dy;

  // Return distance from point to projection
  return Math.sqrt(Math.pow(pointX - projX, 2) + Math.pow(pointY - projY, 2));
}

function isPointInArrowSelection(
  pointX: number,
  pointY: number,
  arrow: Arrow,
): boolean {
  // Calculate the angle and length
  const angle = Math.atan2(
    arrow.endY - arrow.startY,
    arrow.endX - arrow.startX,
  );
  const length = Math.sqrt(
    Math.pow(arrow.endX - arrow.startX, 2) +
      Math.pow(arrow.endY - arrow.startY, 2),
  );

  // Arrow head parameters
  const headLength = Math.min(20, length / 3);
  const headAngle = Math.PI / 6;

  // Calculate arrow head points
  const x1 = arrow.endX - headLength * Math.cos(angle - headAngle);
  const y1 = arrow.endY - headLength * Math.sin(angle - headAngle);
  const x2 = arrow.endX - headLength * Math.cos(angle + headAngle);
  const y2 = arrow.endY - headLength * Math.sin(angle + headAngle);

  // Calculate selection rectangle bounds
  const minX = Math.min(arrow.startX, arrow.endX, x1, x2) - SELECTION_PADDING;
  const maxX = Math.max(arrow.startX, arrow.endX, x1, x2) + SELECTION_PADDING;
  const minY = Math.min(arrow.startY, arrow.endY, y1, y2) - SELECTION_PADDING;
  const maxY = Math.max(arrow.startY, arrow.endY, y1, y2) + SELECTION_PADDING;

  // Check if point is inside the selection rectangle
  return pointX >= minX && pointX <= maxX && pointY >= minY && pointY <= maxY;
}

function isPointNearArrow(
  pointX: number,
  pointY: number,
  arrow: Arrow,
): boolean {
  // Check if point is near the arrow line or head
  const mainLineDistance = distanceToLineSegment(
    pointX,
    pointY,
    arrow.startX,
    arrow.startY,
    arrow.endX,
    arrow.endY,
  );

  if (mainLineDistance <= HIT_THRESHOLD) {
    return true;
  }

  // Calculate arrow head points
  const angle = Math.atan2(
    arrow.endY - arrow.startY,
    arrow.endX - arrow.startX,
  );
  const length = Math.sqrt(
    Math.pow(arrow.endX - arrow.startX, 2) +
      Math.pow(arrow.endY - arrow.startY, 2),
  );
  const headLength = Math.min(20, length / 3);
  const headAngle = Math.PI / 6;

  const x1 = arrow.endX - headLength * Math.cos(angle - headAngle);
  const y1 = arrow.endY - headLength * Math.sin(angle - headAngle);
  const x2 = arrow.endX - headLength * Math.cos(angle + headAngle);
  const y2 = arrow.endY - headLength * Math.sin(angle + headAngle);

  // Check left arrow head line
  const leftHeadDistance = distanceToLineSegment(
    pointX,
    pointY,
    arrow.endX,
    arrow.endY,
    x1,
    y1,
  );

  // Check right arrow head line
  const rightHeadDistance = distanceToLineSegment(
    pointX,
    pointY,
    arrow.endX,
    arrow.endY,
    x2,
    y2,
  );

  return (
    leftHeadDistance <= HIT_THRESHOLD || rightHeadDistance <= HIT_THRESHOLD
  );
}

export const getHitElement = (
  coordX: number,
  coordY: number,
  elements: Array<Shape>,
  selectedShape: Shape | null = null,
) => {
  // If we have a selected shape, check if the point is in its selection rectangle
  if (selectedShape && selectedShape.type === 'arrow') {
    if (isPointInArrowSelection(coordX, coordY, selectedShape)) {
      return selectedShape;
    }
  }

  // If no selected shape or point not in selection rectangle, do normal hit testing
  // but exclude the selected shape from the hit testing
  return elements
    .filter((element) => element.id !== selectedShape?.id)
    .reverse()
    .find((element) => {
      switch (element.type) {
        case 'arrow':
          return isPointNearArrow(coordX, coordY, element);
        // case 'polygon':
        //   return isPointInPolygon(coordX, coordY, element);
      }
    });
};
