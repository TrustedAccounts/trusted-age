import { useRef } from "react";
import { useElementRect } from "./useElementRect.hook";

export const useBlurredFrame = () => {
  const blurredFrameRef = useRef<HTMLDivElement>(null);
  const { rect: blurredFrameRect, updateRect } =
    useElementRect(blurredFrameRef);

  return { blurredFrameRef, blurredFrameRect, updateRect };
};
