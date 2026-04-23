// Q인사이드 랩스 — 브랜드 레이아웃 3종 미리보기
// 실행: node scripts/gen-qinside-preview.js
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const opentype = require("opentype.js");

const W = 1600, H = 900;
const NAVY = "#0A1628";
const NAVY_DEEP = "#06101F";
const GOLD = "#C9A84C";
const TEAL = "#0D7377";
const TEAL_LIGHT = "#4ECDC4";
const CREAM = "#F4F1EB";

const FONT_DIR = path.join(__dirname, "..", "public", "fonts");
const gowun = opentype.loadSync(path.join(FONT_DIR, "GowunBatang.ttf"));

function drawText(font, text, cx, cy, size, color, anchor = "middle") {
  const p = font.getPath(text, 0, 0, size);
  const bb = p.getBoundingBox();
  const w = bb.x2 - bb.x1;
  const h = bb.y2 - bb.y1;
  let tx;
  if (anchor === "middle") tx = cx - bb.x1 - w / 2;
  else if (anchor === "start") tx = cx - bb.x1;
  else tx = cx - bb.x1 - w; // end
  const ty = cy - bb.y1 - h / 2;
  return { path: `<path d="${p.toPathData()}" fill="${color}" transform="translate(${tx} ${ty})"/>`, width: w, height: h };
}

// 로고 SVG 아이콘 (현재 사용 중인 것과 유사)
function logoIcon(x, y, scale = 1) {
  const s = (v) => v * scale;
  return `
    <g transform="translate(${x} ${y})">
      <defs>
        <linearGradient id="nN${scale}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#1E3A5F"/>
          <stop offset="100%" stop-color="#2A4A70"/>
        </linearGradient>
        <linearGradient id="nM${scale}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${TEAL}"/>
          <stop offset="100%" stop-color="${TEAL_LIGHT}"/>
        </linearGradient>
      </defs>
      <line x1="${s(18)}" y1="${s(10)}" x2="${s(18)}" y2="${s(90)}" stroke="url(#nN${scale})" stroke-width="${s(10)}" stroke-linecap="round"/>
      <line x1="${s(50)}" y1="${s(10)}" x2="${s(50)}" y2="${s(55)}" stroke="url(#nN${scale})" stroke-width="${s(10)}" stroke-linecap="round"/>
      <line x1="${s(78)}" y1="${s(52)}" x2="${s(78)}" y2="${s(90)}" stroke="url(#nN${scale})" stroke-width="${s(10)}" stroke-linecap="round"/>
      <path d="M${s(18)},${s(46)} C${s(28)},${s(46)} ${s(32)},${s(33)} ${s(40)},${s(33)} C${s(48)},${s(33)} ${s(44)},${s(46)} ${s(50)},${s(46)}" stroke="url(#nM${scale})" stroke-width="${s(7)}" fill="none" stroke-linecap="round"/>
      <path d="M${s(50)},${s(12)} C${s(52)},${s(30)} ${s(60)},${s(42)} ${s(70)},${s(48)} C${s(74)},${s(50)} ${s(78)},${s(52)} ${s(78)},${s(52)}" stroke="url(#nM${scale})" stroke-width="${s(7)}" fill="none" stroke-linecap="round"/>
      <path d="M${s(96)},${s(12)} C${s(94)},${s(28)} ${s(88)},${s(40)} ${s(82)},${s(47)} C${s(80)},${s(50)} ${s(78)},${s(52)} ${s(78)},${s(52)}" stroke="url(#nM${scale})" stroke-width="${s(7)}" fill="none" stroke-linecap="round"/>
    </g>
  `;
}

// 레이아웃 1: 옆에 작게 — "Q인사이드 랩스" (한 줄)
function layout1(cx, cy) {
  const main = drawText(gowun, "Q인사이드", cx - 60, cy, 72, CREAM, "middle");
  const labs = drawText(gowun, "랩스", cx + 140, cy + 18, 28, `${CREAM}99`, "start");
  return main.path + labs.path;
}

// 레이아웃 2: 아래에 작게 — Q인사이드 위, 랩스 아래
function layout2(cx, cy) {
  const main = drawText(gowun, "Q인사이드", cx, cy - 18, 74, CREAM, "middle");
  const labs = drawText(gowun, "랩스", cx, cy + 42, 22, `${GOLD}`, "middle");
  return main.path + labs.path;
}

// 레이아웃 3: 오른쪽 위 작게 (상첨자 느낌)
function layout3(cx, cy) {
  const main = drawText(gowun, "Q인사이드", cx - 40, cy, 72, CREAM, "middle");
  const labs = drawText(gowun, "랩스", cx + 150, cy - 25, 20, GOLD, "start");
  return main.path + labs.path;
}

// 각 레이아웃을 네비게이션 바 느낌으로 배치
function navPreview(cellX, cellY, cellW, cellH, title, layoutFn) {
  const iconX = cellX + 50;
  const iconY = cellY + cellH / 2 - 35;
  const textCx = cellX + 300;
  const textCy = cellY + cellH / 2;

  return `
    <!-- 라벨 -->
    <text x="${cellX + cellW/2}" y="${cellY + 40}" text-anchor="middle"
          fill="${GOLD}" font-family="Arial,sans-serif"
          font-size="14" font-weight="700" letter-spacing="1">${title}</text>

    <!-- 네비게이션 바 배경 -->
    <rect x="${cellX + 20}" y="${cellY + 70}" width="${cellW - 40}" height="110"
          fill="rgba(10,22,40,0.95)" stroke="rgba(201,168,76,0.15)" stroke-width="1" rx="8"/>

    <!-- 로고 아이콘 -->
    ${logoIcon(iconX, iconY + 5, 0.7)}

    <!-- 브랜드 텍스트 -->
    ${layoutFn(textCx, textCy + 35)}

    <!-- 작은 영문 태그 -->
    <text x="${textCx - 90}" y="${textCy + 75}" text-anchor="start"
          fill="rgba(244,241,235,0.5)" font-family="Arial,sans-serif"
          font-size="10" letter-spacing="1.5">Q Inside Labs</text>
  `;
}

// 3개 레이아웃 수직 배치
const content = `
  ${navPreview(0, 0, W, H/3, "A. 옆에 작게 — Q인사이드 랩스", layout1)}
  ${navPreview(0, H/3, W, H/3, "B. 아래에 작게 (2줄) — 랩스가 서브", layout2)}
  ${navPreview(0, 2*H/3, W, H/3, "C. 오른쪽 위 작게 (상첨자형)", layout3)}
`;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${NAVY}"/>
      <stop offset="100%" stop-color="${NAVY_DEEP}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  ${content}
</svg>`;

const outPath = "C:/Users/User/AppData/Local/Temp/qinside-preview.png";
sharp(Buffer.from(svg), { density: 200 })
  .resize(W, H)
  .png({ compressionLevel: 9, quality: 95 })
  .toFile(outPath)
  .then(info => { console.log(`✓ ${outPath}`); })
  .catch(err => { console.error("✗", err.message); process.exit(1); });
