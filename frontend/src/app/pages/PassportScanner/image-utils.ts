export const cropToAspectRatio = (
  imageData: ImageData,
  aspectWidth: number,
  aspectHeight: number
): ImageData => {
  const { width, height } = imageData;
  const desiredAspectRatio = aspectWidth / aspectHeight;
  const currentAspectRatio = width / height;

  let newWidth = width;
  let newHeight = height;

  if (currentAspectRatio > desiredAspectRatio) {
    // Image is wider than desired aspect ratio, crop width
    newWidth = Math.floor(height * desiredAspectRatio);
  } else {
    // Image is taller than desired aspect ratio, crop height
    newHeight = Math.floor(width / desiredAspectRatio);
  }

  const xOffset = Math.floor((width - newWidth) / 2);
  const yOffset = Math.floor((height - newHeight) / 2);

  const canvas = document.createElement("canvas");
  canvas.width = newWidth;
  canvas.height = newHeight;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.putImageData(imageData, -xOffset, -yOffset);
    const croppedImageData = ctx.getImageData(0, 0, newWidth, newHeight);
    return croppedImageData;
  }

  return imageData;
};
