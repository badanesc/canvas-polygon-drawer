import {ArrowLeftIcon, ArrowRightIcon} from '@radix-ui/react-icons';
import styles from './camera.module.css';

import AnnotationsList from './components/AnnotationsList/AnnotationsList';
import Whiteboard from './components/Whiteboard/Whiteboard';

export default function CameraPage() {
  return (
    <div className={styles.cameraPage}>
      <AnnotationsList />

      <div className={styles.workbench}>
        <div className={styles.workbenchHeader}>
          <button className={styles.workbenchButton}>
            <ArrowLeftIcon />
            <span>Prev Camera</span>
          </button>
          <button className={styles.workbenchButton}>
            <span>Next Camera</span>
            <ArrowRightIcon />
          </button>
        </div>

        <div className={styles.imageWrapper}>
          <img
            className={styles.image}
            src="https://picsum.photos/300/200"
            alt="Working surface"
          />
          <Whiteboard />
        </div>
      </div>
    </div>
  );
}
