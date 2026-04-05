/**
 * Shared badge/card texture generator.
 * Produces identical canvas output for both 2D (flat card) and 3D (lanyard) modes.
 */

export interface BadgeUser {
  nickname: string;
  role: string;
  level: string;
  email: string;
}

export function loadBadgeImage(src: string | null): Promise<HTMLImageElement | null> {
  if (!src) {
    return Promise.resolve(null);
  }

  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

export function createBadgeCanvas({
  image,
  user,
  side,
}: {
  image: HTMLImageElement | null;
  user: BadgeUser | null;
  side: "front" | "back";
}): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 1280;
  const context = canvas.getContext("2d");

  if (!context) {
    return canvas;
  }

  void side;

  if (image) {
    // 꽉 차게 (cover), 중앙 정렬
    const scale = Math.max(canvas.width / image.width, canvas.height / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    const offsetX = (canvas.width - drawWidth) / 2;
    const offsetY = (canvas.height - drawHeight) / 2;

    context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

    // 1) Contrast & brightness boost
    context.save();
    context.globalCompositeOperation = "color-burn";
    context.fillStyle = "rgba(0,0,0,0.08)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();

    // 2) Sheen gradient overlay (135deg diagonal)
    context.save();
    context.globalCompositeOperation = "overlay";
    const sheen = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    sheen.addColorStop(0, "rgba(255,255,255,0.35)");
    sheen.addColorStop(0.4, "rgba(255,255,255,0.10)");
    sheen.addColorStop(0.5, "rgba(255,255,255,0.00)");
    sheen.addColorStop(0.6, "rgba(255,255,255,0.10)");
    sheen.addColorStop(1, "rgba(255,255,255,0.25)");
    context.fillStyle = sheen;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();

    // 3) Noise overlay
    context.save();
    context.globalCompositeOperation = "overlay";
    const noiseData = context.createImageData(canvas.width, canvas.height);
    for (let i = 0; i < noiseData.data.length; i += 4) {
      const v = Math.random() * 255;
      noiseData.data[i] = v;
      noiseData.data[i + 1] = v;
      noiseData.data[i + 2] = v;
      noiseData.data[i + 3] = 25;
    }
    context.putImageData(noiseData, 0, 0);
    context.globalCompositeOperation = "destination-over";
    context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    context.restore();

    // 4) Holographic color shift band
    context.save();
    context.globalCompositeOperation = "color-dodge";
    const holo = context.createLinearGradient(0, canvas.height * 0.3, canvas.width, canvas.height * 0.7);
    holo.addColorStop(0, "rgba(120,80,255,0.06)");
    holo.addColorStop(0.5, "rgba(80,200,255,0.08)");
    holo.addColorStop(1, "rgba(255,120,200,0.06)");
    context.fillStyle = holo;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();

    // 5) Border (gradient stroke)
    context.save();
    const borderGrad = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    borderGrad.addColorStop(0, "rgba(255,255,255,0.7)");
    borderGrad.addColorStop(0.5, "rgba(255,255,255,0.2)");
    borderGrad.addColorStop(1, "rgba(255,255,255,0.6)");
    context.strokeStyle = borderGrad;
    context.lineWidth = 6;
    context.roundRect(3, 3, canvas.width - 6, canvas.height - 6, 24);
    context.stroke();
    context.restore();
  } else {
    // 이미지가 없을 때의 Fallback
    const fallback = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    fallback.addColorStop(0, "#f3f0eb");
    fallback.addColorStop(0.55, "#ece7de");
    fallback.addColorStop(1, "#dfd8cc");
    context.fillStyle = fallback;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "rgba(18,18,18,0.96)";
    context.textAlign = "center";
    context.font = "700 72px Inter, Arial, sans-serif";
    context.fillText(user?.nickname ?? "HackPort User", canvas.width / 2, canvas.height / 2);
  }

  return canvas;
}
