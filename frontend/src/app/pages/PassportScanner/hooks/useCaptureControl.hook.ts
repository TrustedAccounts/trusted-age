import { useState, useEffect } from "react";
import Webcam from "react-webcam";
import { useCanvasDrawing } from "./useCanvasDrawing.hook";
import {
  CaptureStatus,
  CaptureStatusMessages,
  useImageAnalysis,
} from "./useImageAnalysis.hook";

export const useCaptureControl = (
  webcamRef: React.RefObject<Webcam>,
  canvasRef: React.RefObject<HTMLCanvasElement>
) => {
  const { analyzeImage } = useImageAnalysis();
  const [capturedImage, setCapturedImage] = useState<File | null>(null);
  const [capturing, setCapturing] = useState(true);
  const [lastImageData, setLastImageData] = useState<ImageData | null>(null);
  const [status, setStatus] = useState<CaptureStatus | undefined>(
    CaptureStatus.LOADING
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false); // Track whether analysis is in progress
  const drawToCanvas = useCanvasDrawing(webcamRef, canvasRef);

  const handleRetry = () => {
    setCapturedImage(null);
    setLastImageData(null);
    setCapturing(true);
  };

  const getCaptureAsFile = async () => {
    const base64Image = webcamRef.current?.getScreenshot();

    if (!base64Image) {
      return null;
    }

    const response = await fetch(base64Image);
    const blob = await response.blob();
    return new File([blob], "passport-photo.webp", { type: "image/webp" });
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      const drawAttempt = drawToCanvas();

      if (capturing && window.cv && !isAnalyzing && drawAttempt) {
        const newImageData = drawAttempt?.imageData;
        const canvas = drawAttempt?.canvas;
        if (newImageData && canvasRef.current) {
          setStatus(CaptureStatus.ANALYZING);
          setIsAnalyzing(true); // Set analysis in progress
          try {
            const status = await analyzeImage(
              newImageData,
              lastImageData,
              canvas
            );
            setStatus(status);
            if (status === CaptureStatus.SUCCESS) {
              const file = await getCaptureAsFile();
              setCapturedImage(file);
              setCapturing(false);
            }
            setLastImageData(newImageData);
          } finally {
            setIsAnalyzing(false); // Reset analysis flag
          }
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [capturing, analyzeImage, lastImageData, canvasRef, isAnalyzing]);

  // Human-friendly status message
  const statusMessage = status ? CaptureStatusMessages[status] : undefined;

  return {
    capturedImage,
    handleRetry,
    capturing,
    status,
    statusMessage,
  };
};
