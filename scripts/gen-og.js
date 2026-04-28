// OG 이미지 생성 스크립트 (1200×630 PNG)
// 실행: node scripts/gen-og.js
// 결과: public/og-image.png 덮어쓰기
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const opentype = require("opentype.js");

const W = 1200, H = 630;
const NAVY = "#0A1628";
const NAVY_DEEP = "#06101F";
const GOLD = "#C9A84C";
const TEAL = "#0D7377";
const TEAL_LIGHT = "#4ECDC4";
const CREAM = "#F4F1EB";

// ── 브랜드 로고 폰트: Hahmlet (바꾸려면 아래 BRAND_FONT_ID 수정)
// 옵션: "Hahmlet" | "GowunBatang" | "BlackHanSans" | "Jua" | "Hahmlet" 등
const BRAND_FONT_ID = "GowunBatang";
const brandFontPath = path.join(__dirname, "..", "public", "fonts", `${BRAND_FONT_ID}.ttf`);
const brandFont = fs.existsSync(brandFontPath) ? opentype.loadSync(brandFontPath) : null;

function brandText(text, x, y, size, color) {
  if (!brandFont) {
    return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle"
              fill="${color}" font-family="'Malgun Gothic','Noto Serif KR',serif"
              font-size="${size}" font-weight="900" letter-spacing="-2">${text}</text>`;
  }
  const p = brandFont.getPath(text, 0, 0, size);
  const bb = p.getBoundingBox();
  const tx = x - bb.x1 - (bb.x2 - bb.x1) / 2;
  const ty = y - bb.y1 - (bb.y2 - bb.y1) / 2;
  return `<path d="${p.toPathData()}" fill="${color}" transform="translate(${tx} ${ty})"/>`;
}

// 메트릭만 반환 (좌측 정렬용)
function textMetrics(text, size) {
  if (!brandFont) return { width: text.length * size * 0.5, height: size, x1: 0, y1: -size };
  const p = brandFont.getPath(text, 0, 0, size);
  const bb = p.getBoundingBox();
  return { path: p.toPathData(), width: bb.x2 - bb.x1, height: bb.y2 - bb.y1, x1: bb.x1, y1: bb.y1 };
}

// 임의 좌표에 path 그리기
function drawPathAt(pathData, x, y, fill) {
  return `<path d="${pathData}" fill="${fill}" transform="translate(${x} ${y})"/>`;
}

// 로고 SVG 아이콘 (네비와 동일)
function logoIcon(x, y, size) {
  const s = size / 100;
  const scale = `scale(${s})`;
  return `
    <g transform="translate(${x} ${y}) ${scale}">
      <defs>
        <linearGradient id="oN" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#1E3A5F"/>
          <stop offset="100%" stop-color="#2A4A70"/>
        </linearGradient>
        <linearGradient id="oM" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${TEAL}"/>
          <stop offset="100%" stop-color="${TEAL_LIGHT}"/>
        </linearGradient>
      </defs>
      <line x1="18" y1="10" x2="18" y2="90" stroke="url(#oN)" stroke-width="10" stroke-linecap="round"/>
      <line x1="50" y1="10" x2="50" y2="55" stroke="url(#oN)" stroke-width="10" stroke-linecap="round"/>
      <line x1="78" y1="52" x2="78" y2="90" stroke="url(#oN)" stroke-width="10" stroke-linecap="round"/>
      <path d="M18,46 C28,46 32,33 40,33 C48,33 44,46 50,46" stroke="url(#oM)" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M50,12 C52,30 60,42 70,48 C74,50 78,52 78,52" stroke="url(#oM)" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M96,12 C94,28 88,40 82,47 C80,50 78,52 78,52" stroke="url(#oM)" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M18,90 C34,82 62,82 78,90" stroke="url(#oM)" stroke-width="4.5" fill="none" stroke-linecap="round" opacity="0.45"/>
      <circle cx="50" cy="46" r="3" fill="${TEAL_LIGHT}" opacity="0.5"/>
      <circle cx="78" cy="52" r="3" fill="${TEAL_LIGHT}" opacity="0.5"/>
    </g>
  `;
}

// 메인 타이틀: 로고 + WIHAM(크림) + 인사이드(티얼) 센터 정렬
function mainTitle(centerX, centerY, fontSize, logoSize) {
  const gap = 28;             // 로고와 텍스트 사이
  const textGap = 22;         // WIHAM과 인사이드 사이
  const wihamM = textMetrics("WIHAM", fontSize);
  const insideM = textMetrics("인사이드", fontSize);
  const totalW = logoSize + gap + wihamM.width + textGap + insideM.width;
  const startX = centerX - totalW / 2;

  const logoX = startX;
  const logoY = centerY - logoSize / 2;

  const wihamX = startX + logoSize + gap - wihamM.x1;
  const wihamY = centerY - wihamM.y1 - wihamM.height / 2;

  const insideX = wihamX + wihamM.x1 + wihamM.width + textGap - insideM.x1;
  const insideY = centerY - insideM.y1 - insideM.height / 2;

  return `
    ${logoIcon(logoX, logoY, logoSize)}
    ${drawPathAt(wihamM.path, wihamX, wihamY, CREAM)}
    ${drawPathAt(insideM.path, insideX, insideY, TEAL_LIGHT)}
  `;
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${NAVY}"/>
      <stop offset="100%" stop-color="${NAVY_DEEP}"/>
    </linearGradient>
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- 배경 -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- 골드 코너 장식 -->
  <path d="M 70 70 L 70 140 M 70 70 L 140 70" stroke="${GOLD}" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.9"/>
  <path d="M ${W-70} ${H-70} L ${W-70} ${H-140} M ${W-70} ${H-70} L ${W-140} ${H-70}" stroke="${GOLD}" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.9"/>

  <!-- 상단 브랜드 태그 -->
  <text x="${W/2}" y="120" text-anchor="middle"
        fill="${GOLD}" font-family="'Malgun Gothic','Noto Sans KR',sans-serif"
        font-size="22" font-weight="700" letter-spacing="8">WIHAM INSIDE LABS</text>
  <circle cx="${W/2-14}" cy="145" r="2.5" fill="${GOLD}"/>
  <circle cx="${W/2}"    cy="145" r="2.5" fill="${GOLD}"/>
  <circle cx="${W/2+14}" cy="145" r="2.5" fill="${GOLD}"/>

  <!-- 메인 타이틀: 로고 + Q(크림) + 인사이드(티얼) -->
  ${mainTitle(W/2, 250, 96, 100)}

  <!-- 태그라인 -->
  <text x="${W/2}" y="320" text-anchor="middle"
        fill="${CREAM}" font-family="'Malgun Gothic','Noto Sans KR',sans-serif"
        font-size="28" font-weight="600" opacity="0.92">직장 내 괴롭힘 &amp; 조직문화 전문 플랫폼</text>

  <!-- 구분선 -->
  <line x1="${W/2-60}" y1="358" x2="${W/2+60}" y2="358" stroke="${GOLD}" stroke-width="2" opacity="0.85"/>

  <!-- 3개 알약 배지 — 대비 강한 디자인 -->
  <!-- 배지 1: 골드 채움 + 네이비 텍스트 -->
  <g filter="url(#softShadow)">
    <rect x="150" y="420" width="260" height="56" rx="28" fill="${GOLD}"/>
    <text x="280" y="456" text-anchor="middle"
          fill="${NAVY}" font-family="'Malgun Gothic','Noto Sans KR',sans-serif"
          font-size="22" font-weight="800">판례 1,300건+ DB</text>
  </g>
  <!-- 배지 2: 티얼 채움 + 크림 텍스트 -->
  <g filter="url(#softShadow)">
    <rect x="${(W-260)/2}" y="420" width="260" height="56" rx="28" fill="${TEAL}"/>
    <text x="${W/2}" y="456" text-anchor="middle"
          fill="${CREAM}" font-family="'Malgun Gothic','Noto Sans KR',sans-serif"
          font-size="22" font-weight="800">20년 전문 노무사</text>
  </g>
  <!-- 배지 3: 아웃라인 + 크림 텍스트 -->
  <g>
    <rect x="${W-410}" y="420" width="260" height="56" rx="28"
          fill="none" stroke="${GOLD}" stroke-width="2.5"/>
    <text x="${W-280}" y="456" text-anchor="middle"
          fill="${CREAM}" font-family="'Malgun Gothic','Noto Sans KR',sans-serif"
          font-size="22" font-weight="800">괴롭힘·산재·항변</text>
  </g>

  <!-- 하단 카피 -->
  <text x="${W/2}" y="555" text-anchor="middle"
        fill="${CREAM}" font-family="'Malgun Gothic','Noto Sans KR',sans-serif"
        font-size="22" font-weight="500" opacity="0.75">일반 AI와는 차원이 다른 전문 노무 상담</text>

</svg>`;

const outPath = path.join(__dirname, "..", "public", "og-image.png");
sharp(Buffer.from(svg), { density: 300 })
  .resize(W, H)
  .png({ compressionLevel: 9, quality: 95 })
  .toFile(outPath)
  .then(info => {
    console.log(`✓ 생성 완료: ${outPath}`);
    console.log(`  ${info.width}×${info.height}, ${(info.size/1024).toFixed(1)} KB`);
  })
  .catch(err => {
    console.error("✗ 실패:", err.message);
    process.exit(1);
  });
