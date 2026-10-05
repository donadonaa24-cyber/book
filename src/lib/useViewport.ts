import { useEffect, useState } from "react";

export interface ViewportSize {
  width: number;
  height: number;
}

function read(): ViewportSize {
  const vv = window.visualViewport;
  return {
    width: Math.round(vv?.width ?? window.innerWidth),
    height: Math.round(vv?.height ?? window.innerHeight),
  };
}

/** ビューポートサイズ（リサイズはデバウンスして反映） */
export function useViewport(debounceMs = 150): ViewportSize {
  const [size, setSize] = useState<ViewportSize>(read);

  useEffect(() => {
    let timer: number | undefined;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const next = read();
        setSize((prev) => (prev.width === next.width && prev.height === next.height ? prev : next));
      }, debounceMs);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [debounceMs]);

  return size;
}
