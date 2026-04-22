// "뷰" 로고 색상 시안 — 흰색 베이스 + 포인트 컬러 조합
// 실행: node scripts/gen-view-colors.js
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const W = 1600, H = 900;
const NAVY = "#0A1628";
const NAVY_DEEP = "#06101F";
const GOLD = "#C9A84C";
const GOLD_LIGHT = "#E5C56A";
const TEAL = "#0D7377";
const TEAL_LIGHT = "#4ECDC4";
const CREAM = "#F4F1EB";
const RED = "#C0392B";
const PURPLE = "#6B5B95";

const GRID_COLS = 4, GRID_ROWS = 2;
const CELL_W = W / GRID_COLS;
const CELL_H = H / GRID_ROWS;

// 공통 폰트 — 3번(언더라인 골드) 스타일 기반으로 색상만 변주
const variants = [
  // 1행
  {
    name: "A. 크림 + 골드 밑줄",
    sub: "현재 추천 스타일",
    render: (cx, cy) => `
      <text x="${cx}" y="${cy - 15}" text-anchor="middle" dominant-baseline="middle"
            fill="${CREAM}" font-family="'Malgun Gothic','Noto Serif KR',serif"
            font-size="105" font-weight="900">뷰</text>
      <rect x="${cx - 50}" y="${cy + 50}" width="100" height="5" fill="${GOLD}"/>
    `,
  },
  {
    name: "B. 크림 + 티얼 밑줄",
    sub: "안정감·신뢰",
    render: (cx, cy) => `
      <text x="${cx}" y="${cy - 15}" text-anchor="middle" dominant-baseline="middle"
            fill="${CREAM}" font-family="'Malgun Gothic','Noto Serif KR',serif"
            font-size="105" font-weight="900">뷰</text>
      <rect x="${cx - 50}" y="${cy + 50}" width="100" height="5" fill="${TEAL_LIGHT}"/>
    `,
  },
  {
    name: "C. 크림 + 골드 점",
    sub: "세련·미니멀",
    render: (cx, cy) => `
      <text x="${cx}" y="${cy - 10}" text-anchor="middle" dominant-baseline="middle"
            fill="${CREAM}" font-family="'Malgun Gothic','Noto Serif KR',serif"
            font-size="110" font-weight="900">뷰</text>
      <circle cx="${cx - 18}" cy="${cy + 58}" r="4" fill="${GOLD}"/>
      <circle cx="${cx}" cy="${cy + 58}" r="4" fill="${GOLD}"/>
      <circle cx="${cx + 18}" cy="${cy + 58}" r="4" fill="${GOLD}"/>
    `,
  },
  {
    name: "D. 크림 + 골드 괄호",
    sub: "꺾쇠, 인용 느낌",
    render: (cx, cy) => `
      <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
            fill="${CREAM}" font-family="'Malgun Gothic','Noto Serif KR',serif"
            font-size="105" font-weight="900">뷰</text>
      <path d="M ${cx - 80} ${cy - 55} L ${cx - 95} ${cy - 55} L ${cx - 95} ${cy + 55} L ${cx - 80} ${cy + 55}"
            fill="none" stroke="${GOLD}" stroke-width="3" stroke-linecap="round"/>
      <path d="M ${cx + 80} ${cy - 55} L ${cx + 95} ${cy - 55} L ${cx + 95} ${cy + 55} L ${cx + 80} ${cy + 55}"
            fill="none" stroke="${GOLD}" stroke-width="3" stroke-linecap="round"/>
    `,
  },
  // 2행
  {
    name: "E. 골드 그림자",
    sub: "입체·프리미엄",
    render: (cx, cy) => `
      <text x="${cx + 4}" y="${cy + 4}" text-anchor="middle" dominant-baseline="middle"
            fill="${GOLD}" font-family="'Malgun Gothic','Noto Serif KR',serif"
            font-size="110" font-weight="900" opacity="0.55">뷰</text>
      <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
            fill="${CREAM}" font-family="'Malgun Gothic','Noto Serif KR',serif"
            font-size="110" font-weight="900">뷰</text>
    `,
  },
  {
    name: "F. 티얼 그림자",
    sub: "깊이·신뢰",
    render: (cx, cy) => `
      <text x="${cx + 4}" y="${cy + 4}" text-anchor="middle" dominant-baseline="middle"
            fill="${TEAL}" font-family="'Malgun Gothic','Noto Serif KR',serif"
            font-size="110" font-weight="900" opacity="0.7">뷰</text>
      <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
            fill="${CREAM}" font-family="'Malgun Gothic','Noto Serif KR',serif"
            font-size="110" font-weight="900">뷰</text>
    `,
  },
  {
    name: "G. 크림 + 좌측 골드 바",
    sub: "저널·칼럼 스타일",
    render: (cx, cy) => `
      <rect x="${cx - 70}" y="${cy - 55}" width="5" height="110" fill="${GOLD}"/>
      <text x="${cx + 5}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
            fill="${CREAM}" font-family="'Malgun Gothic','Noto Serif KR',serif"
            font-size="115" font-weight="900">뷰</text>
    `,
  },
  {
    name: "H. 크림 + 양측 골드 선",
    sub: "대칭·균형",
    render: (cx, cy) => `
      <line x1="${cx - 90}" y1="${cy}" x2="${cx - 70}" y2="${cy}" stroke="${GOLD}" stroke-width="3" stroke-linecap="round"/>
      <line x1="${cx + 70}" y1="${cy}" x2="${cx + 90}" y2="${cy}" stroke="${GOLD}" stroke-width="3" stroke-linecap="round"/>
      <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
            fill="${CREAM}" font-family="'Malgun Gothic','Noto Serif KR',serif"
            font-size="115" font-weight="900">뷰</text>
    `,
  },
];

function cellSvg(variant, col, row) {
  const cellX = col * CELL_W;
  const cellY = row * CELL_H;
  const cx = cellX + CELL_W / 2;
  const cy = cellY + CELL_H / 2 - 20;

  return `
    ${col > 0 ? `<line x1="${cellX}" y1="${cellY + 40}" x2="${cellX}" y2="${cellY + CELL_H - 40}" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>` : ""}
    ${row > 0 ? `<line x1="${cellX + 30}" y1="${cellY}" x2="${cellX + CELL_W - 30}" y2="${cellY}" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>` : ""}
    <text x="${cx}" y="${cellY + 40}" text-anchor="middle"
          fill="${GOLD}" font-family="'Malgun Gothic',sans-serif"
          font-size="13" font-weight="700" letter-spacing="1">${variant.name}</text>
    ${variant.render(cx, cy)}
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

const outPath = "C:/Users/User/AppData/Local/Temp/view-colors.png";
sharp(Buffer.from(svg), { density: 300 })
  .resize(W, H)
  .png({ compressionLevel: 9, quality: 95 })
  .toFile(outPath)
  .then(info => { console.log(`✓ ${outPath}`); });
