import styles from './AnnotationsList.module.css';
import {useShapes} from '../../contexts/ShapesContext';
import {Shape} from '../Whiteboard/types';

function getShapeDescription(shape: Shape): string {
  switch (shape.type) {
    case 'arrow':
      return `Arrow from (${Math.round(shape.startX)}, ${Math.round(shape.startY)}) to (${Math.round(shape.endX)}, ${Math.round(shape.endY)})`;
    case 'polygon':
      return `Polygon with ${shape.points.length} points`;
    default:
      return 'Unknown shape';
  }
}

export default function AnnotationsList() {
  const {shapes} = useShapes();

  return (
    <ul className={styles.annotations}>
      {shapes.map((shape) => (
        <li className={styles.annotation} key={shape.id}>
          <h2 className={styles.annotationName}>{shape.type}</h2>
          <p className={styles.annotationDescription}>
            {getShapeDescription(shape)}
          </p>
        </li>
      ))}
    </ul>
  );
}
