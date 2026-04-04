const fs = require('fs');
const file = 'src/components/react-bits/lanyard-profile.tsx';
let content = fs.readFileSync(file, 'utf8');

// 만약 이미지가 좌우/상하로 반전되어 보이는 문제가 있다면, canvas 렌더링에 scale을 적용해야 합니다.
// 이전 사용자가 "아직도 이상하게 나오는데?"라고 했고, 처음 사진에서 글자가 반전되어 있었습니다.
// texture.flipY = false를 유지하되, 만약 canvas 자체를 flip해야 한다면 여기에 적용.
// 일단 좌우 반전은 translate(width, 0); scale(-1, 1)로 적용합니다.
const start = content.indexOf('if (image) {');
const end = content.indexOf('} else {');

const newImageDraw = `if (image) {
    const scale = Math.max(canvas.width / image.width, canvas.height / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    
    // 만약 이미지가 반전되어 나타난다면, 아래 주석을 풀고 사용하세요.
    // context.translate(canvas.width, 0);
    // context.scale(-1, 1);
    
    context.drawImage(image, 0, 0, drawWidth, drawHeight);
  `;

content = content.substring(0, start) + newImageDraw + content.substring(end);
fs.writeFileSync(file, content);
