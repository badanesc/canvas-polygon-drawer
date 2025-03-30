'use client';

import {ArrowLeftIcon, ArrowRightIcon} from '@radix-ui/react-icons';
import styles from './camera.module.css';
// import {useCallback, useState} from 'react';
import AnnotationsList from './components/AnnotationsList/AnnotationsList';
import Whiteboard from './components/Whiteboard/Whiteboard';
// import {WhiteboardContext} from './components/WhiteboardContext';
// type ImageState = {
//   naturalWidth: number;
//   naturalHeight: number;
// };

export default function CameraPage() {
  // const [imageState, setImageState] = useState<ImageState>({
  //   naturalWidth: 0,
  //   naturalHeight: 0,
  // });

  // const handleImageLoad = useCallback(
  //   (event: React.SyntheticEvent<HTMLImageElement>) => {
  //     const img = event.target as HTMLImageElement;
  //     setImageState({
  //       naturalWidth: img.naturalWidth,
  //       naturalHeight: img.naturalHeight,
  //     });
  //   },
  //   [],
  // );

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
            // onLoad={handleImageLoad}
          />
          <Whiteboard />
        </div>
      </div>
    </div>
  );
}
