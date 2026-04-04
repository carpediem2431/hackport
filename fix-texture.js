const fs = require('fs');
const file = 'src/components/react-bits/lanyard-profile.tsx';
const content = fs.readFileSync(file, 'utf8');

const start = content.indexOf('function createBadgeTexture({');
const end = content.indexOf('useGLTF.preload("/card.glb");');

const newFunction = `function createBadgeTexture({
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
    // 꽉 차게, 왼쪽 위 기준
    const scale = Math.max(canvas.width / image.width, canvas.height / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    
    // UV 맵에 맞춰서 좌우 반전이 필요할 수도 있으나 우선 정방향으로 그립니다.
    // 이전 코드는 이미지에만 translate와 scale(-1,1)을 적용했었습니다.
    // 모델의 기본 UV에 맞게 (0,0)에 그립니다.
    context.drawImage(image, 0, 0, drawWidth, drawHeight);
  } else {
    const fallback = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    fallback.addColorStop(0, "#f3f0eb");
    fallback.addColorStop(0.55, "#ece7de");
    fallback.addColorStop(1, "#dfd8cc");
    context.fillStyle = fallback;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.flipY = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

`;

const newContent = content.substring(0, start) + newFunction + content.substring(end);
fs.writeFileSync(file, newContent);
console.log('Fixed texture logic applied.');
