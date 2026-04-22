// "뷰" 로고 디자인 시안 8종 비교 이미지 생성
// 실행: node scripts/gen-view-variants.js
// 결과: /tmp/view-variants.png (1600×900)
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const W = 1600, H = 900;
const NAVY = "#0A1628";
const NAVY_DEEP = "#06101F";
const GOLD = "#C9A84C";
const TEAL = "#0D7377";
const TEAL_LIGHT = "#4ECDC4";
const CREAM = "#F4F1EB";

// 8개 시안 배치 (4열 × 2행)
const GRID_COLS = 4, GRID_ROWS = 2;
const CELL_W = W / GRID_COLS;
const CELL_H = H / GRID_ROWS;

const variants = [
  // 1행
  {
    name: "1. 클래식 세리프",
    sub: "Noto Serif KR, 굵음",
    render: (cx, cy) => `
      <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
            fill="${CREAM}" font-family="'Malgun Gothic','Noto Serif KR',serif"
            font-size="120" font-weight="900" letter-spacing="-3">뷰</text>
    `,
  },
  {
    name: "2. 모던 고딕",
    sub: "Sans, 큰 중량감",
    render: (cx, cy) => `
      <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
            fill="${CREAM}" font-family="'Malgun Gothic',sans-serif"
            font-size="120" font-weight="900" letter-spacing="-5">뷰</text>
    `,
  },
  {
    name: "3. 언더라인 골드",
    sub: "중심선 강조",
    render: (cx, cy) => `
      <text x="${cx}" y="${cy - 15}" text-anchor="middle" dominant-baseline="middle"
            fill="${CREAM}" font-family="'Malgun Gothic','Noto Serif KR',serif"
            font-size="105" font-weight="900">뷰</text>
      <rect x="${cx - 50}" y="${cy + 50}" width="100" height="5" fill="${GOLD}"/>
    `,
  },
  {
    name: "4. 골드 채움",
    sub: "프리미엄",
    render: (cx, cy) => `
      <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
            fill="${GOLD}" font-family="'Malgun Gothic','Noto Serif KR',serif"
            font-size="120" font-weight="900" letter-spacing="-3">뷰</text>
    `,
  },
  // 2행
  {
    name: "5. 아웃라인",
    sub: "미니멀 외곽선",
    render: (cx, cy) => `
      <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
            fill="none" stroke="${CREAM}" stroke-width="2.5"
            font-family="'Malgun Gothic',sans-serif"
            font-size="120" font-weight="900" letter-spacing="-3">뷰</text>
    `,
  },
  {
    name: "6. 이중 레이어",
    sub: "입체감, 섀도우",
    render: (cx, cy) => `
      <text x="${cx + 5}" y="${cy + 5}" text-anchor="middle" dominant-baseline="middle"
            fill="${TEAL}" font-family="'Malgun Gothic','Noto Serif KR',serif"
            font-size="120" font-weight="900" letter-spacing="-3" opacity="0.75">뷰</text>
      <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
            fill="${CREAM}" font-family="'Malgun Gothic','Noto Serif KR',serif"
            font-size="120" font-weight="900" letter-spacing="-3">뷰</text>
    `,
  },
  {
    name: "7. 눈 아이콘",
    sub: "VIEW 의미 시각화",
    render: (cx, cy) => `
      <text x="${cx}" y="${cy + 5}" text-anchor="middle" dominant-baseline="middle"
            fill="${CREAM}" font-family="'Malgun Gothic','Noto Serif KR',serif"
            font-size="100" font-weight="900" letter-spacing="-3">뷰</text>
      <ellipse cx="${cx}" cy="${cy - 70}" rx="30" ry="12" fill="none" stroke="${GOLD}" stroke-width="2.5"/>
      <circle cx="${cx}" cy="${cy - 70}" r="6" fill="${GOLD}"/>
    `,
  },
  {
    name: "8. 좌측 바 강조",
    sub: "저널·뉴스 톤",
    render: (cx, cy) => `
      <rect x="${cx - 70}" y="${cy - 55}" width="5" height="110" fill="${GOLD}"/>
      <text x="${cx + 5}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
            fill="${CREAM}" font-family="'Malgun Gothic','Noto Serif KR',serif"
            font-size="120" font-weight="900" letter-spacing="-3">뷰</text>
    `,
  },
];

function cellSvg(variant, col, row) {
  const cellX = col * CELL_W;
  const cellY = row * CELL_H;
  const cx = cellX + CELL_W / 2;
  const cy = cellY + CELL_H / 2 - 20;

  return `
    <!-- 구분선 -->
    ${col > 0 ? `<line x1="${cellX}" y1="${cellY + 40}" x2="${cellX}" y2="${cellY + CELL_H - 40}" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>` : ""}
    ${row > 0 ? `<line x1="${cellX + 30}" y1="${cellY}" x2="${cellX + CELL_W - 30}" y2="${cellY}" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>` : ""}

    <!-- 번호·제목 -->
    <text x="${cx}" y="${cellY + 40}" text-anchor="middle"
          fill="${GOLD}" font-family="'Malgun Gothic',sans-serif"
          font-size="13" font-weight="700" letter-spacing="1">${variant.name}</text>

    <!-- 뷰 글자 -->
    ${variant.render(cx, cy)}

    <!-- 설명 -->
    <text x="${cx}" y="${cellY + CELL_H - 30}" text-anchor="middle"
          fill="rgba(244,241,235,0.5)" font-family="'Malgun Gothic',sans-serif"
          font-size="12" font-weight="400">${variant.sub}</text>
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

const outPath = "C:/Users/User/AppData/Local/Temp/view-variants.png";
sharp(Buffer.from(svg), { density: 300 })
  .resize(W, H)
  .png({ compressionLevel: 9, quality: 95 })
  .toFile(outPath)
  .then(info => {
    console.log(`✓ ${outPath}`);
    console.log(`  ${info.width}×${info.height}`);
  })
  .catch(err => {
    console.error("✗", err.message);
    process.exit(1);
  });
