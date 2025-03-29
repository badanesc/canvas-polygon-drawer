import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons"
import styles from "./camera.module.css"

import AnnotationsList from "./components/AnnotationsList/AnnotationsList"

export default function CameraPage() {
  return (
    <div className={styles.cameraPage}>
      <AnnotationsList />

      <div className={styles.workbench}>
        <div className={styles.workbenchHeader}>
          <button>
            <ArrowLeftIcon />
            <span>Prev Camera</span>
          </button>
          <h1>Workbench</h1>
          <button>
            <ArrowRightIcon />
            <span>Next Camera</span>
          </button>
        </div>

        <div>
          <img src="https://picsum.photos/300/200" alt="Working surface" />
        </div>
      </div>
    </div>
  );
}
