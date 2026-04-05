export interface ReflectiveCardExportUser {
  nickname: string;
  role: string;
  level: string;
  email: string;
}

const CARD_WIDTH = 320;
const CARD_HEIGHT = 500;
const EXPORT_SCALE = 2;

function createSeed(input: string) {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
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

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function fillNoise(ctx: CanvasRenderingContext2D, seedKey: string) {
  const random = createRandom(createSeed(seedKey));

  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = "#ffffff";

  for (let index = 0; index < 2200; index += 1) {
    const x = random() * CARD_WIDTH;
    const y = random() * CARD_HEIGHT;
    const size = 0.5 + random() * 1.8;
    ctx.fillRect(x, y, size, size);
  }

  ctx.restore();
}

function drawSheen(ctx: CanvasRenderingContext2D) {
  const gradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  gradient.addColorStop(0, "rgba(255,255,255,0.35)");
  gradient.addColorStop(0.25, "rgba(255,255,255,0.12)");
  gradient.addColorStop(0.5, "rgba(255,255,255,0)");
  gradient.addColorStop(0.72, "rgba(255,255,255,0.1)");
  gradient.addColorStop(1, "rgba(255,255,255,0.28)");

  ctx.save();
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  ctx.restore();
}

function drawBorder(ctx: CanvasRenderingContext2D) {
  const borderGradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  borderGradient.addColorStop(0, "rgba(255,255,255,0.85)");
  borderGradient.addColorStop(0.5, "rgba(255,255,255,0.24)");
  borderGradient.addColorStop(1, "rgba(255,255,255,0.6)");

  ctx.save();
  ctx.strokeStyle = borderGradient;
  ctx.lineWidth = 1.5;
  roundRectPath(ctx, 0.75, 0.75, CARD_WIDTH - 1.5, CARD_HEIGHT - 1.5, 20);
  ctx.stroke();
  ctx.restore();
}

function drawText(ctx: CanvasRenderingContext2D, user: ReflectiveCardExportUser) {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.96)";
  ctx.strokeStyle = "rgba(255,255,255,0.18)";

  ctx.font = '700 10px "Inter", "Geist", sans-serif';

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  roundRectPath(ctx, 24, 24, 88, 24, 5);
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.textBaseline = "middle";
  ctx.font = '700 10px "Inter", "Geist", sans-serif';
  ctx.fillText("보안 접근", 40, 36);

  ctx.beginPath();
  ctx.arc(CARD_WIDTH - 34, 36, 8, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(24, 64);
  ctx.lineTo(CARD_WIDTH - 24, 64);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.textAlign = "center";
  ctx.font = '700 24px "Inter", "Geist", sans-serif';
  ctx.shadowColor = "rgba(255,255,255,0.35)";
  ctx.shadowBlur = 3;
  ctx.fillText(user.nickname || "알 수 없음", CARD_WIDTH / 2, 336);

  ctx.shadowColor = "transparent";
  ctx.font = '500 12px "Inter", "Geist", sans-serif';
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillText(user.role || "역할 없음", CARD_WIDTH / 2, 358);

  ctx.textAlign = "left";
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.beginPath();
  ctx.moveTo(24, CARD_HEIGHT - 72);
  ctx.lineTo(CARD_WIDTH - 24, CARD_HEIGHT - 72);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.62)";
  ctx.font = '500 9px "Inter", "Geist", sans-serif';
  ctx.fillText("이메일", 24, CARD_HEIGHT - 48);

  ctx.fillStyle = "rgba(255,255,255,0.96)";
  ctx.font = '500 14px "SFMono-Regular", "Consolas", monospace';
  ctx.fillText(user.email || "-", 24, CARD_HEIGHT - 28);

  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.32)";
  ctx.font = '600 28px "Inter", "Geist", sans-serif';
  ctx.fillText("◌", CARD_WIDTH - 28, CARD_HEIGHT - 26);
  ctx.restore();
}

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

  if ("fonts" in document) {
    await document.fonts.ready;
  }

  const image = await loadImage(capturedImageSrc);

  ctx.scale(EXPORT_SCALE, EXPORT_SCALE);

  ctx.fillStyle = "#1a1a1a";
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 18;
  roundRectPath(ctx, 0, 0, CARD_WIDTH, CARD_HEIGHT, 20);
  ctx.fill();

  ctx.save();
  roundRectPath(ctx, 0, 0, CARD_WIDTH, CARD_HEIGHT, 20);
  ctx.clip();

  ctx.save();
  ctx.filter = "saturate(0) contrast(1.2) brightness(1.1) blur(12px)";
  ctx.translate(CARD_WIDTH / 2, CARD_HEIGHT / 2);
  ctx.scale(-1.2, 1.2);

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

  const overlayGradient = ctx.createLinearGradient(0, 0, 0, CARD_HEIGHT);
  overlayGradient.addColorStop(0, "rgba(255,255,255,0.06)");
  overlayGradient.addColorStop(1, "rgba(255,255,255,0.1)");
  ctx.fillStyle = overlayGradient;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  fillNoise(ctx, `${user.email}-${user.nickname}-${user.role}`);
  drawSheen(ctx);
  drawText(ctx, user);
  drawBorder(ctx);
  ctx.restore();

  return canvas.toDataURL("image/png");
}
