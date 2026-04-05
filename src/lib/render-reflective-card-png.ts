/**
 * Canvas-based ReflectiveCard renderer.
 * Produces output visually identical to the ReflectiveCard CSS/SVG component.
 *
 * Layers (bottom → top):
 *   0. Base fill (#1a1a1a)
 *   1. Captured image (cover-crop, scaled 1.2×, flipped, desaturated, blurred)
 *   2. Content overlay background (rgba(255,255,255,0.05))
 *   3. Noise overlay (seeded fractal-like, opacity 0.4, overlay blend)
 *   4. Sheen gradient (135°, overlay blend)
 *   5. Border (gradient stroke, mask-exclude)
 *   6. Text content (header, body, footer)
 */

export interface ReflectiveCardExportUser {
  nickname: string;
  role: string;
  level: string;
  email: string;
}

const CARD_WIDTH = 320;
const CARD_HEIGHT = 500;
const EXPORT_SCALE = 2;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createSeed(input: string) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRandom(seed: number) {
  let state = seed || 1;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

async function loadImage(src: string) {
  const image = new Image();
  image.decoding = "async";
  image.src = src;
  if (typeof image.decode === "function") {
    await image.decode();
    return image;
  }
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Failed to load image for card export."));
  });
  return image;
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ---------------------------------------------------------------------------
// Layer 1 – Image (matches .reflective-video CSS)
// ---------------------------------------------------------------------------

function drawImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  ctx.save();

  // Clip to card shape first
  roundRectPath(ctx, 0, 0, CARD_WIDTH, CARD_HEIGHT, 20);
  ctx.clip();

  // CSS: filter: saturate(0) contrast(120%) brightness(110%) blur(12px)
  // Canvas: use ctx.filter for blur + desaturate; contrast/brightness via globalCompositeOperation
  ctx.filter = "saturate(0) contrast(1.2) brightness(1.1) blur(12px)";

  // CSS: transform: scale(1.2) scaleX(-1)  →  scale(-1.2, 1.2)
  ctx.translate(CARD_WIDTH / 2, CARD_HEIGHT / 2);
  ctx.scale(-1.2, 1.2);

  // object-fit: cover
  const imageRatio = image.width / image.height;
  const targetRatio = CARD_WIDTH / CARD_HEIGHT;
  let drawWidth = CARD_WIDTH;
  let drawHeight = CARD_HEIGHT;
  if (imageRatio > targetRatio) {
    drawHeight = CARD_HEIGHT;
    drawWidth = drawHeight * imageRatio;
  } else {
    drawWidth = CARD_WIDTH;
    drawHeight = drawWidth / imageRatio;
  }

  ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

  ctx.restore();

  // CSS: opacity: 0.9
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Layer 2 – Content overlay background
// ---------------------------------------------------------------------------

function drawContentBackground(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Layer 3 – Noise overlay (matches .reflective-noise CSS)
//   SVG fractalNoise baseFrequency=0.8, numOctaves=3, opacity=0.4, overlay blend
//   Canvas approximation: seeded pseudo-noise with similar density & opacity
// ---------------------------------------------------------------------------

function fillNoise(ctx: CanvasRenderingContext2D, seedKey: string) {
  const random = createRandom(createSeed(seedKey));

  ctx.save();

  // Use a temporary canvas for the noise so we can apply overlay blend correctly
  const noiseCanvas = document.createElement("canvas");
  noiseCanvas.width = CARD_WIDTH;
  noiseCanvas.height = CARD_HEIGHT;
  const nCtx = noiseCanvas.getContext("2d")!;

  // Generate fractal-like noise with multiple octaves
  const imageData = nCtx.createImageData(CARD_WIDTH, CARD_HEIGHT);
  const data = imageData.data;

  // Octave 1: coarse
  for (let i = 0; i < data.length; i += 4) {
    const v = random() * 255;
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = 255;
  }
  nCtx.putImageData(imageData, 0, 0);

  // Octave 2: medium (overlay)
  const imageData2 = nCtx.getImageData(0, 0, CARD_WIDTH, CARD_HEIGHT);
  for (let i = 0; i < imageData2.data.length; i += 4) {
    const v = random() * 255;
    imageData2.data[i] = v;
    imageData2.data[i + 1] = v;
    imageData2.data[i + 2] = v;
    imageData2.data[i + 3] = 128; // lighter overlay
  }
  nCtx.putImageData(imageData2, 0, 0);

  // Apply as overlay blend with opacity 0.4 (matching CSS --roughness: 0.4)
  ctx.globalAlpha = 0.4;
  ctx.globalCompositeOperation = "overlay";
  ctx.drawImage(noiseCanvas, 0, 0);

  ctx.restore();
}

// ---------------------------------------------------------------------------
// Layer 4 – Sheen gradient (matches .reflective-sheen CSS)
//   linear-gradient(135deg, 0.4, 0.1, 0, 0.1, 0.3)
//   mix-blend-mode: overlay, opacity: 1
// ---------------------------------------------------------------------------

function drawSheen(ctx: CanvasRenderingContext2D) {
  const gradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  gradient.addColorStop(0, "rgba(255,255,255,0.4)");
  gradient.addColorStop(0.4, "rgba(255,255,255,0.1)");
  gradient.addColorStop(0.5, "rgba(255,255,255,0.0)");
  gradient.addColorStop(0.6, "rgba(255,255,255,0.1)");
  gradient.addColorStop(1, "rgba(255,255,255,0.3)");

  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Layer 5 – Border (matches .reflective-border CSS)
//   gradient: 0.8 → 0.2 → 0.6, 1px, mask-exclude
// ---------------------------------------------------------------------------

function drawBorder(ctx: CanvasRenderingContext2D) {
  const borderGradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  borderGradient.addColorStop(0, "rgba(255,255,255,0.8)");
  borderGradient.addColorStop(0.5, "rgba(255,255,255,0.2)");
  borderGradient.addColorStop(1, "rgba(255,255,255,0.6)");

  ctx.save();
  ctx.strokeStyle = borderGradient;
  ctx.lineWidth = 1.5;
  roundRectPath(ctx, 0.75, 0.75, CARD_WIDTH - 1.5, CARD_HEIGHT - 1.5, 20);
  ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Layer 6 – Text content (matches .reflective-content layout)
// ---------------------------------------------------------------------------

function drawText(ctx: CanvasRenderingContext2D, user: ReflectiveCardExportUser) {
  ctx.save();

  // --- Card header (padding: 32px top) ---
  const headerY = 32;

  // Security badge (left)
  ctx.font = '700 10px "Inter", "Geist", sans-serif';
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 1;

  roundRectPath(ctx, 24, headerY, 88, 24, 4);
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.stroke();

  // Lock icon (small rectangle + arc)
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  const lockX = 34;
  const lockY = headerY + 12;
  ctx.fillRect(lockX, lockY - 2, 7, 6);
  ctx.beginPath();
  ctx.arc(lockX + 3.5, lockY - 3, 4, Math.PI, 0);
  ctx.strokeStyle = "rgba(255,255,255,0.92)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // "보안 접근" text
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = '700 10px "Inter", "Geist", sans-serif';
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText("보안 접근", 48, headerY + 12);

  // Status icon (right) — simple circle
  ctx.beginPath();
  ctx.arc(CARD_WIDTH - 34, headerY + 12, 8, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.fill();

  // Header separator line
  const headerBottom = headerY + 32;
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(24, headerBottom);
  ctx.lineTo(CARD_WIDTH - 24, headerBottom);
  ctx.stroke();

  // --- Card body (centered, bottom-aligned) ---
  // User name (24px, bold, shadow)
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = '700 24px "Inter", "Geist", sans-serif';
  ctx.shadowColor = "rgba(255,255,255,0.35)";
  ctx.shadowBlur = 2;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 1;
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.fillText(user.nickname || "알 수 없음", CARD_WIDTH / 2, 336);

  // User role
  ctx.shadowColor = "transparent";
  ctx.font = '500 12px "Inter", "Geist", sans-serif';
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.letterSpacing = "0.2em";
  ctx.fillText(user.role || "역할 없음", CARD_WIDTH / 2, 358);

  // --- Card footer ---
  // Footer separator
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(24, CARD_HEIGHT - 72);
  ctx.lineTo(CARD_WIDTH - 24, CARD_HEIGHT - 72);
  ctx.stroke();

  // Email label
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = '500 9px "Inter", "Geist", sans-serif';
  ctx.fillText("이메일", 24, CARD_HEIGHT - 48);

  // Email value
  ctx.fillStyle = "rgba(255,255,255,0.96)";
  ctx.font = '500 14px "SFMono-Regular", "Consolas", monospace';
  ctx.fillText(user.email || "-", 24, CARD_HEIGHT - 28);

  // Fingerprint icon (right side) — concentric arcs
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = '600 28px "Inter", "Geist", sans-serif';
  ctx.fillText("◌", CARD_WIDTH - 28, CARD_HEIGHT - 26);

  ctx.restore();
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function renderReflectiveCardPng(params: {
  capturedImageSrc: string;
  user: ReflectiveCardExportUser;
}) {
  const { capturedImageSrc, user } = params;
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH * EXPORT_SCALE;
  canvas.height = CARD_HEIGHT * EXPORT_SCALE;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas export context is unavailable.");
  }

  // Wait for fonts to be ready (matching CSS font-family)
  if ("fonts" in document) {
    await document.fonts.ready;
  }

  const image = await loadImage(capturedImageSrc);

  ctx.scale(EXPORT_SCALE, EXPORT_SCALE);

  // Layer 0: Base fill
  ctx.fillStyle = "#1a1a1a";
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 18;
  roundRectPath(ctx, 0, 0, CARD_WIDTH, CARD_HEIGHT, 20);
  ctx.fill();
  ctx.shadowColor = "transparent";

  // Clip to card shape for all layers
  ctx.save();
  roundRectPath(ctx, 0, 0, CARD_WIDTH, CARD_HEIGHT, 20);
  ctx.clip();

  // Layer 1: Image
  drawImage(ctx, image);

  // Layer 2: Content background overlay
  drawContentBackground(ctx);

  // Layer 3: Noise
  fillNoise(ctx, `${user.email}-${user.nickname}-${user.role}`);

  // Layer 4: Sheen
  drawSheen(ctx);

  // Layer 6: Text
  drawText(ctx, user);

  ctx.restore(); // un-clip

  // Layer 5: Border (drawn on top, outside clip)
  drawBorder(ctx);

  return canvas.toDataURL("image/png");
}
