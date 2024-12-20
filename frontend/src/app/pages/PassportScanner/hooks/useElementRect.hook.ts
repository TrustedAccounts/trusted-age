import { useEffect, useState, RefObject } from "react";

export const useElementRect = (elementRef: RefObject<HTMLElement>) => {
  const [rect, setRect] = useState<DOMRect | null>(null);

  const updateRect = () => {
    // Block IOS rubber band effect
    if (elementRef.current) {
      if (window.scrollY < 0) {
        return;
      }
      if (window.scrollY > 5) {
        return;
      }

      setRect(elementRef.current.getBoundingClientRect());
    }
  };

  useEffect(() => {
    updateRect();

    window.addEventListener("touchstart", updateRect);
    window.addEventListener("touchend", updateRect);
    window.addEventListener("touchcancel", updateRect);
    window.addEventListener("touchmove", updateRect);

    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect);

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
    };
  }, [elementRef]);

  return { rect, updateRect };
};
