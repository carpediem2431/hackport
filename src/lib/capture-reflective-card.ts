/**
 * Captures a ReflectiveCard rendered offscreen into canvas data URLs.
 * Used to produce textures for the 3D lanyard that match the 2D card exactly.
 */
import { toCanvas } from "html-to-image";

export interface CaptureReflectiveCardOptions {
  /** The DOM element (the ReflectiveCard container) to capture */
  element: HTMLElement;
  /** Pixel width of the output (should match or exceed card texture needs) */
  width?: number;
  /** Pixel height of the output */
  height?: number;
}

/**
 * Captures a DOM element to a canvas, then returns a data URL.
 * The element should already be rendered in the DOM (possibly offscreen).
 */
export async function captureCardToDataUrl(
  options: CaptureReflectiveCardOptions,
): Promise<string | null> {
  const { element, width = 900, height = 1280 } = options;

  try {
    const canvas = await toCanvas(element, {
      width: element.offsetWidth,
      height: element.offsetHeight,
      canvasWidth: width,
      canvasHeight: height,
      pixelRatio: 1,
      // Include all styles
      includeQueryParams: true,
      // SVG filter workaround: render as raster
      skipAutoScale: true,
    });

    return canvas.toDataURL("image/png");
  } catch (error) {
    console.error("[capture-reflective-card] Failed to capture:", error);
    return null;
  }
}
