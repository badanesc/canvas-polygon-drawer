import styles from './AnnotationsList.module.css';

const annotations = [
  {
    id: 1,
    name: 'Face',
    description: 'A face',
  },
  {
    id: 2,
    name: 'Image',
    description: 'An image',
  },
  {
    id: 3,
    name: 'Sun',
    description: 'A sun',
  },
];

export default function AnnotationsList() {
  return (
    <ul className={styles.annotations}>
      {annotations.map((annotation) => (
        <li className={styles.annotation} key={annotation.id}>
          <h2 className={styles.annotationName}>{annotation.name}</h2>
          <p className={styles.annotationDescription}>
            {annotation.description}
          </p>
        </li>
      ))}
    </ul>
  );
}
