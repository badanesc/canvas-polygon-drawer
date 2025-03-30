import {useLayoutEffect, useState} from 'react';

export const useCanvasResize = (
  containerRef: React.RefObject<HTMLDivElement | null>,
) => {
  const [canvasSize, setCanvasSize] = useState({width: 0, height: 0});

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const {width, height} = entry.contentRect;
        setCanvasSize({width, height});
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  return canvasSize;
};
