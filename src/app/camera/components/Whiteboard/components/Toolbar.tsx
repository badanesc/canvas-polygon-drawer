import React from 'react';
import {CanvasMode} from '../types';
import styles from '../Whiteboard.module.css';

interface ToolbarProps {
  currentMode: CanvasMode;
  onModeChange: (mode: CanvasMode) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentMode,
  onModeChange,
}) => {
  return (
    <div className={styles.toolbar}>
      <button
        className={`${styles.toolButton} ${currentMode === 'select' ? styles.active : ''}`}
        onClick={() => onModeChange('select')}
      >
        Select
      </button>
      <button
        className={`${styles.toolButton} ${currentMode === 'arrow' ? styles.active : ''}`}
        onClick={() => onModeChange('arrow')}
      >
        Arrow
      </button>
      <button
        className={`${styles.toolButton} ${currentMode === 'polygon' ? styles.active : ''}`}
        onClick={() => onModeChange('polygon')}
      >
        Polygon
      </button>
    </div>
  );
};
