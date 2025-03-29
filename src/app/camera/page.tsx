import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons"
import styles from "./camera.module.css"

const annotations = [
  {
    id: 1,
    name: "Face",
    description: "A face",
  },
  {
    id: 2,
    name: "Image",
    description: "An image",
  },
  {
    id: 3,
    name: "Sun",
    description: "A sun",
  },
];

export default function CameraPage() {
  return (
    <div className={styles.cameraPage}>
      <ul className={styles.annotations}>
        {annotations.map((annotation) => (
          <li key={annotation.id}>
            <h2>{annotation.name}</h2>
            <p>{annotation.description}</p>
          </li>
        ))}
      </ul>

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
