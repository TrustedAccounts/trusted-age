import { useRef } from "react";
import Webcam from "react-webcam";
import { useCameraSelection } from "./useCameraSelection.hook";
import { useCaptureControl } from "./useCaptureControl.hook";

export const usePassportScanner = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const selectedDeviceId = useCameraSelection();
  const { capturedImage, handleRetry, capturing, statusMessage, status } =
    useCaptureControl(webcamRef, canvasRef);

  const videoConstraints = {
    width: 1280,
    height: 720,
    deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
    facingMode: "environment",
  };

  return {
    webcamRef,
    canvasRef,
    capturedImage,
    status,
    statusMessage,
    handleRetry,
    videoConstraints,
    selectedDeviceId,
  };
};
