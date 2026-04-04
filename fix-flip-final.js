const fs = require('fs');
const file = 'src/components/react-bits/lanyard-profile.tsx';

let content = `
function createBadgeTexture({
  image,
  user,
  side,
}: {
  image: HTMLImageElement | null;
  user: {
    nickname: string;
    role: string;
    level: string;
    email: string;
  } | null;
  side: "front" | "back";
}) {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 1280;
  const context = canvas.getContext("2d");

  if (!context) {
    return new THREE.Texture();
  }

  if (image) {
    // 꽉 차게 (cover), 왼쪽 위 기준 (top-left)
    const scale = Math.max(canvas.width / image.width, canvas.height / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    
    // (0,0)에 그리면 원본 이미지의 왼쪽 위를 기준으로 캔버스를 채웁니다.
    context.drawImage(image, 0, 0, drawWidth, drawHeight);
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

  const texture = new THREE.CanvasTexture(canvas);
  // UV 매핑이 뒤집혀 있는 문제를 해결하기 위해 텍스처 레벨에서 상하좌우를 올바르게 보정합니다.
  texture.flipY = false; // 상하 반전 해결
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.x = -1; // 좌우 반전(거울상) 해결
  
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}
`;

const originalContent = fs.readFileSync(file, 'utf8');
const start = originalContent.indexOf('function createBadgeTexture({');
const end = originalContent.indexOf('useGLTF.preload("/card.glb");');

const newContent = originalContent.substring(0, start) + content + originalContent.substring(end);
fs.writeFileSync(file, newContent);
console.log('Final texture fix applied.');
