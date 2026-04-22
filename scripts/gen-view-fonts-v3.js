// "뷰" 글씨체 시안 — TTF를 opentype.js로 파싱해 SVG path로 변환
// 이 방식은 sharp 렌더링 한계 우회. 실제 폰트 모양 그대로 나옴
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const opentype = require("opentype.js");

const W = 1600, H = 900;
const NAVY = "#0A1628";
const NAVY_DEEP = "#06101F";
const GOLD = "#C9A84C";
const CREAM = "#F4F1EB";

const GRID_COLS = 4, GRID_ROWS = 2;
const CELL_W = W / GRID_COLS;
const CELL_H = H / GRID_ROWS;

const FONT_DIR = path.join(__dirname, "..", "public", "fonts");

const variants = [
  { id: "BlackHanSans",   name: "1. Black Han Sans",  sub: "강력·임팩트 (블랙한산스)",  size: 150 },
  { id: "Hahmlet",        name: "2. Hahmlet",         sub: "현대적 세리프 (햄릿)",      size: 135 },
  { id: "GowunBatang",    name: "3. Gowun Batang",    sub: "단아한 세리프 (고운 바탕)", size: 130 },
  { id: "Jua",            name: "4. Jua",             sub: "둥글·친근 (주아체)",        size: 135 },
  { id: "Gugi",           name: "5. Gugi",            sub: "캘리그라피 (구기체)",       size: 140 },
  { id: "SingleDay",      name: "6. Single Day",      sub: "손글씨 감성 (싱글데이)",    size: 150 },
  { id: "EastSeaDokdo",   name: "7. East Sea Dokdo",  sub: "붓글씨·힘 (동해독도)",      size: 150 },
  { id: "NanumPenScript", name: "8. Nanum Pen",       sub: "펜글씨·자유 (나눔 펜)",     size: 155 },
];

function glyphPath(fontPath, text, cx, cy, size) {
  const font = opentype.loadSync(fontPath);
  const p = font.getPath(text, 0, 0, size);
  const bb = p.getBoundingBox();
  const w = bb.x2 - bb.x1;
  const h = bb.y2 - bb.y1;
  // 중앙 정렬: 글자 바운딩 박스를 셀 중심에 배치
  const tx = cx - bb.x1 - w / 2;
  const ty = cy - bb.y1 - h / 2;
  return `<path d="${p.toPathData()}" fill="${CREAM}" transform="translate(${tx} ${ty})"/>`;
}

function cellSvg(v, col, row) {
  const cellX = col * CELL_W;
  const cellY = row * CELL_H;
  const cx = cellX + CELL_W / 2;
  const cy = cellY + CELL_H / 2 - 20;

  const fontPath = path.join(FONT_DIR, `${v.id}.ttf`);
  let glyph = "";
  try {
    glyph = glyphPath(fontPath, "뷰", cx, cy, v.size);
  } catch (e) {
    glyph = `<text x="${cx}" y="${cy}" text-anchor="middle" fill="red" font-size="20">로드 실패: ${e.message}</text>`;
  }

  return `
    ${col > 0 ? `<line x1="${cellX}" y1="${cellY + 40}" x2="${cellX}" y2="${cellY + CELL_H - 40}" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>` : ""}
    ${row > 0 ? `<line x1="${cellX + 30}" y1="${cellY}" x2="${cellX + CELL_W - 30}" y2="${cellY}" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>` : ""}
    <text x="${cx}" y="${cellY + 40}" text-anchor="middle"
          fill="${GOLD}" font-family="'Malgun Gothic',sans-serif"
          font-size="13" font-weight="700" letter-spacing="1">${v.name}</text>
    ${glyph}
    <text x="${cx}" y="${cellY + CELL_H - 30}" text-anchor="middle"
          fill="rgba(244,241,235,0.5)" font-family="'Malgun Gothic',sans-serif"
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
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  ${cells}
</svg>`;

const outPath = "C:/Users/User/AppData/Local/Temp/view-fonts-v3.png";
sharp(Buffer.from(svg), { density: 200 })
  .resize(W, H)
  .png({ compressionLevel: 9, quality: 95 })
  .toFile(outPath)
  .then(info => { console.log(`✓ ${outPath}  ${info.width}x${info.height}`); })
  .catch(err => { console.error("✗", err.message); process.exit(1); });
