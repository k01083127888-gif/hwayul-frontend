// "뷰" 디자이너 폰트 시안 8종 (Google Fonts Korean 다운로드본 사용)
// 실행: node scripts/gen-view-fonts-v2.js
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const W = 1600, H = 900;
const NAVY = "#0A1628";
const NAVY_DEEP = "#06101F";
const GOLD = "#C9A84C";
const CREAM = "#F4F1EB";

const GRID_COLS = 4, GRID_ROWS = 2;
const CELL_W = W / GRID_COLS;
const CELL_H = H / GRID_ROWS;

const FONT_DIR = path.join(__dirname, "..", "public", "fonts");

// 폰트 파일 읽어 base64로 인코딩
function loadFont(id) {
  const p = path.join(FONT_DIR, `${id}.ttf`);
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p).toString("base64");
}

const variants = [
  { id: "BlackHanSans", name: "1. Black Han Sans", sub: "강력·임팩트 (블랙한산스)", size: 150 },
  { id: "Hahmlet",      name: "2. Hahmlet",        sub: "현대적 세리프 (햄릿)", size: 135 },
  { id: "GowunBatang",  name: "3. Gowun Batang",   sub: "고운 바탕 (단아한 세리프)", size: 130 },
  { id: "Jua",          name: "4. Jua",            sub: "둥글·친근 (주아체)", size: 135 },
  { id: "Gugi",         name: "5. Gugi",           sub: "캘리그라피 (구기체)", size: 140 },
  { id: "SingleDay",    name: "6. Single Day",     sub: "손글씨·감성 (싱글데이)", size: 150 },
  { id: "EastSeaDokdo", name: "7. East Sea Dokdo", sub: "붓글씨·힘 (동해독도)", size: 150 },
  { id: "NanumPenScript", name: "8. Nanum Pen",    sub: "펜글씨·자유 (나눔 펜)", size: 155 },
];

// @font-face 정의 블록 생성
const fontFaces = variants
  .map(v => {
    const b64 = loadFont(v.id);
    if (!b64) return "";
    return `
      @font-face {
        font-family: '${v.id}';
        src: url('data:font/ttf;base64,${b64}') format('truetype');
      }`;
  })
  .join("");

function cellSvg(v, col, row) {
  const cellX = col * CELL_W;
  const cellY = row * CELL_H;
  const cx = cellX + CELL_W / 2;
  const cy = cellY + CELL_H / 2 - 20;

  return `
    ${col > 0 ? `<line x1="${cellX}" y1="${cellY + 40}" x2="${cellX}" y2="${cellY + CELL_H - 40}" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>` : ""}
    ${row > 0 ? `<line x1="${cellX + 30}" y1="${cellY}" x2="${cellX + CELL_W - 30}" y2="${cellY}" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>` : ""}
    <text x="${cx}" y="${cellY + 40}" text-anchor="middle"
          fill="${GOLD}" font-family="Arial"
          font-size="13" font-weight="700" letter-spacing="1">${v.name}</text>
    <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
          fill="${CREAM}" font-family="'${v.id}'"
          font-size="${v.size}">뷰</text>
    <text x="${cx}" y="${cellY + CELL_H - 30}" text-anchor="middle"
          fill="rgba(244,241,235,0.5)" font-family="Arial"
          font-size="12">${v.sub}</text>
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
    <style type="text/css">${fontFaces}</style>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  ${cells}
</svg>`;

const outPath = "C:/Users/User/AppData/Local/Temp/view-fonts-v2.png";
sharp(Buffer.from(svg), { density: 200 })
  .resize(W, H)
  .png({ compressionLevel: 9, quality: 95 })
  .toFile(outPath)
  .then(info => { console.log(`✓ ${outPath}`); })
  .catch(err => { console.error("✗", err.message); process.exit(1); });
