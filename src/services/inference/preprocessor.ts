/**
 * Image preprocessing for Quick Draw model inference.
 * Must match the Python training preprocessing exactly:
 * - Grayscale input
 * - Normalized to [-1, 1]
 * - Black background with white strokes
 */

export interface PreprocessOptions {
  inputSize: number;
  invert?: boolean; // True for webcam/upload, false for canvas
  threshold?: number; // 0-255, pixels below become black (default: 40)
  whiteLevel?: number; // 0-255, pixels above threshold (default: 255)
}

/**
 * Preprocess ImageData for model inference
 */
export function preprocessImageData(
  imageData: ImageData,
  options: PreprocessOptions
): Float32Array {
  const { inputSize, invert = false, threshold, whiteLevel = 255 } = options;
  const { data, width, height } = imageData;

  // Step 1: Convert to grayscale
  const gray = new Uint8Array(width * height);
  for (let i = 0; i < gray.length; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    // Standard luminance formula
    gray[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  }

  // Step 2: Invert if needed (webcam/upload has white background)
  if (invert) {
    for (let i = 0; i < gray.length; i++) {
      gray[i] = 255 - gray[i];
    }
  }

  // Step 3: Optional thresholding for noise removal
  if (threshold !== undefined) {
    for (let i = 0; i < gray.length; i++) {
      gray[i] = gray[i] < threshold ? 0 : whiteLevel;
    }
  }

  // Step 4: Resize using bilinear interpolation
  const resized = resizeGrayscale(gray, width, height, inputSize, inputSize);

  // Step 5: Normalize to [-1, 1] matching training
  const normalized = new Float32Array(inputSize * inputSize);
  for (let i = 0; i < normalized.length; i++) {
    normalized[i] = resized[i] / 127.5 - 1.0;
  }

  return normalized;
}

/**
 * Resize grayscale image using bilinear interpolation
 */
function resizeGrayscale(
  src: Uint8Array,
  srcW: number,
  srcH: number,
  dstW: number,
  dstH: number
): Uint8Array {
  const dst = new Uint8Array(dstW * dstH);
  const xRatio = srcW / dstW;
  const yRatio = srcH / dstH;

  for (let y = 0; y < dstH; y++) {
    for (let x = 0; x < dstW; x++) {
      const srcX = x * xRatio;
      const srcY = y * yRatio;

      const x0 = Math.floor(srcX);
      const y0 = Math.floor(srcY);
      const x1 = Math.min(x0 + 1, srcW - 1);
      const y1 = Math.min(y0 + 1, srcH - 1);

      const xFrac = srcX - x0;
      const yFrac = srcY - y0;

      const tl = src[y0 * srcW + x0];
      const tr = src[y0 * srcW + x1];
      const bl = src[y1 * srcW + x0];
      const br = src[y1 * srcW + x1];

      const top = tl + (tr - tl) * xFrac;
      const bottom = bl + (br - bl) * xFrac;

      dst[y * dstW + x] = Math.round(top + (bottom - top) * yFrac);
    }
  }

  return dst;
}

/**
 * Preprocess canvas for inference (drawings are already white-on-black)
 */
export function preprocessCanvas(
  canvas: HTMLCanvasElement,
  inputSize: number
): Float32Array {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  return preprocessImageData(imageData, {
    inputSize,
    invert: false, // Canvas is already white-on-black
  });
}

/**
 * Preprocess webcam/uploaded image (white background needs inversion)
 */
export function preprocessWebcamFrame(
  imageData: ImageData,
  inputSize: number
): Float32Array {
  return preprocessImageData(imageData, {
    inputSize,
    invert: true, // White bg -> black bg
    threshold: 40, // Match Python: cv2.threshold(gray, 40, 255, ...)
    whiteLevel: 255,
  });
}

/**
 * Create ImageData from video frame
 */
export function getVideoFrameData(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement
): ImageData {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  // Draw video frame to canvas
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);

  // Crop to square (center)
  const size = Math.min(video.videoWidth, video.videoHeight);
  const startX = (video.videoWidth - size) / 2;
  const startY = (video.videoHeight - size) / 2;

  return ctx.getImageData(startX, startY, size, size);
}

/**
 * Load image from file and get ImageData
 */
export async function loadImageAsImageData(
  file: File
): Promise<{ imageData: ImageData; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Make square (crop to center)
      const size = Math.min(img.width, img.height);
      const startX = (img.width - size) / 2;
      const startY = (img.height - size) / 2;

      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, startX, startY, size, size, 0, 0, size, size);

      resolve({
        imageData: ctx.getImageData(0, 0, size, size),
        width: size,
        height: size,
      });
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}
