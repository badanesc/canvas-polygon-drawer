'use client';

import {ArrowLeftIcon, ArrowRightIcon} from '@radix-ui/react-icons';
import styles from './page.module.css';
import AnnotationsList from './camera/components/AnnotationsList/AnnotationsList';
import Whiteboard from './camera/components/Whiteboard/Whiteboard';

export default function Home() {
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
            src="https://picsum.photos/400/200"
            alt="Working surface"
          />
          <Whiteboard />
        </div>
      </div>
    </div>
  );
}
