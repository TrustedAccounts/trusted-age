import Tesseract from "tesseract.js";
type Cv = typeof import("mirada/dist/src/types/opencv/_types");

const tessractLangDataUrl = `${process.env.PUBLIC_URL}/tessract/lang-data/`;

export const checkIfImageIsBlurry = async (
  cv: Cv,
  imageData: ImageData,
  threshold = 50
): Promise<boolean> => {
  const mat = cv.matFromImageData(imageData);
  const gray = new cv.Mat();
  cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY, 0);

  const laplacian = new cv.Mat();
  cv.Laplacian(gray, laplacian, cv.CV_64F);

  const mean = new cv.Mat();
  const stddev = new cv.Mat();
  cv.meanStdDev(laplacian, mean, stddev);

  const variance = stddev.data64F[0] ** 2;

  const isBlurry = variance < threshold;

  // Clean up
  mat.delete();
  gray.delete();
  laplacian.delete();
  mean.delete();
  stddev.delete();

  return isBlurry;
};

export const checkIfImageHasTextQuick = async (
  canvas: HTMLCanvasElement
): Promise<boolean> => {
  try {
    // Use Tesseract.js to detect text presence, orientation, and script
    const detection = await Tesseract.detect(canvas, {
      logger: (m) => console.log(m), // Optional logger to track the OCR progress
    });

    // console.log("Quick Detection:", detection);

    // Determine if any text is detected
    const hasText =
      detection.data.script && detection.data.script !== "unknown";
    // console.log("Text Detected:", hasText);

    return hasText;
  } catch (error) {
    // console.error("Error detecting text in the image:", error);
    return false;
  }
};

export const checkIfImageHasTextSlow = async (
  canvas: HTMLCanvasElement
): Promise<boolean> => {
  try {
    const detection = await Tesseract.recognize(canvas, "deu", {
      langPath: tessractLangDataUrl,
    });
    // Determine if we have at least 10 characters in german with a confidence of greater than 50%
    const hasText =
      (detection?.data?.words || [])
        .filter((w) => w.confidence > 50 && w.language === "deu")
        .map((w) => w.text)
        .join("").length > 10;

    console.log("Slow Detection:", detection);
    console.log("Text Detected:", hasText);

    return hasText;
  } catch (error) {
    console.error("Error detecting text in the image:", error);
    return false;
  }
};
export const isCameraStable = (
  currentImageData: ImageData | null,
  lastImageData: ImageData | null,
  thresholdPercentage: number = 10 // Percentage of the total possible difference
): boolean => {
  // Get the current image data from the canvas
  if (!currentImageData || !lastImageData) {
    return false;
  }

  // Calculate the total number of elements in the image data array (length)
  const arrayLength = currentImageData.data.length;

  // Calculate the sum of differences between the current and last image data
  let sum = 0;
  for (let i = 0; i < arrayLength; i += 4) {
    // Compare RGB values (ignoring alpha channel)
    const diff =
      Math.abs(currentImageData.data[i] - lastImageData.data[i]) + // Red
      Math.abs(currentImageData.data[i + 1] - lastImageData.data[i + 1]) + // Green
      Math.abs(currentImageData.data[i + 2] - lastImageData.data[i + 2]); // Blue

    sum += diff;
  }

  // Calculate the maximum possible sum difference
  const maxPossibleSum = (arrayLength / 4) * 255 * 3; // (Total pixels) * max difference per pixel (R, G, B)

  // Calculate the difference ratio as a percentage
  const differenceRatio = sum / maxPossibleSum;
  // Return whether the camera is stable based on the percentage threshold
  return differenceRatio < thresholdPercentage / 100;
};
