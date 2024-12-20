import { useCallback } from "react";
import Webcam from "react-webcam";

export const useCanvasDrawing = (
  webcamRef: React.RefObject<Webcam>,
  canvasRef: React.RefObject<HTMLCanvasElement>
) => {
  return useCallback(() => {
    if (webcamRef.current && canvasRef.current) {
      const webcamCanvas = webcamRef.current.getCanvas();

      if (webcamCanvas) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          // Original dimensions
          const originalWidth = webcamCanvas.width;
          const originalHeight = webcamCanvas.height;

          // Desired aspect ratio
          const targetAspectRatio = 4 / 2.8;

          // Calculate target dimensions
          let targetWidth = originalWidth;
          let targetHeight = originalHeight;

          if (originalWidth / originalHeight > targetAspectRatio) {
            // Crop width if the current aspect ratio is wider than the target aspect ratio
            targetWidth = Math.floor(originalHeight * targetAspectRatio);
          } else {
            // Crop height if the current aspect ratio is taller than the target aspect ratio
            targetHeight = Math.floor(originalWidth / targetAspectRatio);
          }

          // Calculate the top-left corner to start the crop, to center the crop
          const xOffset = Math.floor((originalWidth - targetWidth) / 2);
          const yOffset = Math.floor((originalHeight - targetHeight) / 2);

          // Resize the canvas to match the target dimensions
          canvasRef.current.width = targetWidth;
          canvasRef.current.height = targetHeight;

          // Clear the canvas and draw the cropped image
          ctx.clearRect(0, 0, targetWidth, targetHeight);
          ctx.drawImage(
            webcamCanvas,
            xOffset,
            yOffset,
            targetWidth,
            targetHeight,
            0,
            0,
            targetWidth,
            targetHeight
          );

          return {
            imageData: ctx.getImageData(0, 0, targetWidth, targetHeight),
            canvas: canvasRef.current,
          };
        }
      }
    }
  }, [webcamRef, canvasRef]);
};
