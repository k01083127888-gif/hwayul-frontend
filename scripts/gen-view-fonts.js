// "뷰" 글씨체(폰트) 시안 8종
// 실행: node scripts/gen-view-fonts.js
const fs = require("fs");
const sharp = require("sharp");

const W = 1600, H = 900;
const NAVY = "#0A1628";
const NAVY_DEEP = "#06101F";
const GOLD = "#C9A84C";
const CREAM = "#F4F1EB";

const GRID_COLS = 4, GRID_ROWS = 2;
const CELL_W = W / GRID_COLS;
const CELL_H = H / GRID_ROWS;

// Windows 시스템에 기본 설치된 한글 폰트 + 변형
const variants = [
  {
    name: "1. 맑은 고딕",
    sub: "깔끔·현대 (시스템 기본)",
    fontFamily: "'Malgun Gothic', sans-serif",
    weight: 900,
    letterSpacing: -3,
    size: 120,
  },
  {
    name: "2. 바탕 세리프",
    sub: "전통·권위 (법률서)",
    fontFamily: "'Batang', '바탕', serif",
    weight: 900,
    letterSpacing: -3,
    size: 120,
  },
  {
    name: "3. 궁서체",
    sub: "붓글씨·고전 (도장 느낌)",
    fontFamily: "'Gungsuh', '궁서', serif",
    weight: 700,
    letterSpacing: -3,
    size: 120,
  },
  {
    name: "4. HY견명조",
    sub: "명조 + 굵은 획 (전문가)",
    fontFamily: "'HY견명조', 'HYGothic-Medium', serif",
    weight: 900,
    letterSpacing: -2,
    size: 120,
  },
  {
    name: "5. 돋움 콘덴스",
    sub: "압축형 (모던 편집)",
    fontFamily: "'Dotum', '돋움', sans-serif",
    weight: 900,
    letterSpacing: -5,
    size: 125,
    transform: "scale(0.85, 1.15)",
  },
  {
    name: "6. 이탤릭 세리프",
    sub: "역동·움직임",
    fontFamily: "'Batang','바탕',serif",
    weight: 900,
    letterSpacing: -3,
    size: 120,
    style: "italic",
  },
  {
    name: "7. 확대 세리프",
    sub: "웅장·고전미",
    fontFamily: "'Batang','바탕',serif",
    weight: 900,
    letterSpacing: -1,
    size: 120,
    transform: "scale(1.2, 1.0)",
  },
  {
    name: "8. 외곽 + 획감",
    sub: "디자이너 핸드그립",
    fontFamily: "'Malgun Gothic',sans-serif",
    weight: 900,
    letterSpacing: -3,
    size: 120,
    custom: (cx, cy) => `
      <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
            fill="none" stroke="${CREAM}" stroke-width="3"
            font-family="'Batang','바탕',serif"
            font-size="125" font-weight="900" letter-spacing="-3">뷰</text>
      <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
            fill="${CREAM}" font-family="'Batang','바탕',serif"
            font-size="125" font-weight="900" letter-spacing="-3" opacity="0.15">뷰</text>
    `,
  },
];

function cellSvg(v, col, row) {
  const cellX = col * CELL_W;
  const cellY = row * CELL_H;
  const cx = cellX + CELL_W / 2;
  const cy = cellY + CELL_H / 2 - 20;

  let text;
  if (v.custom) {
    text = v.custom(cx, cy);
  } else {
    const transform = v.transform ? ` transform="${v.transform}" transform-origin="${cx} ${cy}"` : "";
    const style = v.style ? ` font-style="${v.style}"` : "";
    text = `
      <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
            fill="${CREAM}" font-family="${v.fontFamily}"
            font-size="${v.size}" font-weight="${v.weight}"
            letter-spacing="${v.letterSpacing}"${style}${transform}>뷰</text>
    `;
  }

  return `
    ${col > 0 ? `<line x1="${cellX}" y1="${cellY + 40}" x2="${cellX}" y2="${cellY + CELL_H - 40}" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>` : ""}
    ${row > 0 ? `<line x1="${cellX + 30}" y1="${cellY}" x2="${cellX + CELL_W - 30}" y2="${cellY}" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>` : ""}
    <text x="${cx}" y="${cellY + 40}" text-anchor="middle"
          fill="${GOLD}" font-family="'Malgun Gothic',sans-serif"
          font-size="13" font-weight="700" letter-spacing="1">${v.name}</text>
    ${text}
    <text x="${cx}" y="${cellY + CELL_H - 30}" text-anchor="middle"
          fill="rgba(244,241,235,0.5)" font-family="'Malgun Gothic',sans-serif"
          font-size="12" font-weight="400">${v.sub}</text>
  `;
}

const cells = variants.map((v, i) => cellSvg(v, i % GRID_COLS, Math.floor(i / GRID_COLS))).join("");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${NAVY}"/>
      <stop offset="100%" stop-color="${NAVY_DEEP}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  ${cells}
</svg>`;

const outPath = "C:/Users/User/AppData/Local/Temp/view-fonts.png";
sharp(Buffer.from(svg), { density: 300 })
  .resize(W, H)
  .png({ compressionLevel: 9, quality: 95 })
  .toFile(outPath)
  .then(info => { console.log(`✓ ${outPath}`); });
