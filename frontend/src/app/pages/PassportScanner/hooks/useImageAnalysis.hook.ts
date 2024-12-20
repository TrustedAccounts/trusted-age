import { useCallback } from "react";
import {
  checkIfImageHasTextSlow,
  checkIfImageIsBlurry,
  isCameraStable,
} from "../passport-scanner.service";

export enum CaptureStatus {
  LOADING = "LOADING",
  CAMERA_MOVING = "CAMERA_MOVING",
  IMAGE_BLURRY = "IMAGE_BLURRY",
  NO_TEXT_DETECTED = "NO_TEXT_DETECTED",
  SUCCESS = "SUCCESS",
  ANALYZING = "ANALYZING",
}

export const CaptureStatusMessages: Record<CaptureStatus, string> = {
  [CaptureStatus.ANALYZING]: "Analyzing...",
  [CaptureStatus.LOADING]: "Loading...",
  [CaptureStatus.CAMERA_MOVING]: "Camera is moving",
  [CaptureStatus.IMAGE_BLURRY]: "Image is blurry",
  [CaptureStatus.NO_TEXT_DETECTED]: "No text detected",
  [CaptureStatus.SUCCESS]: "Capture successful!",
};

export const useImageAnalysis = () => {
  const analyzeImage = useCallback(
    async (
      imageData: ImageData,
      lastImageData: ImageData | null,
      canvas: HTMLCanvasElement
    ): Promise<CaptureStatus> => {
      const stable = isCameraStable(imageData, lastImageData);
      if (!stable) return CaptureStatus.CAMERA_MOVING;

      const blurry = await checkIfImageIsBlurry(window.cv, imageData);
      if (blurry) return CaptureStatus.IMAGE_BLURRY;

      const hasText = await checkIfImageHasTextSlow(canvas);
      if (!hasText) return CaptureStatus.NO_TEXT_DETECTED;

      return CaptureStatus.SUCCESS;
    },
    []
  );

  return { analyzeImage };
};
