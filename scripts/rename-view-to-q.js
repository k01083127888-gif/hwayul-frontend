// "뷰" → "Q" 브랜드 글자 교체 + "View Inside" → "Q Inside Labs"
// 브랜드 문맥만 정확히 잡도록 타겟 치환
// 실행: node scripts/rename-view-to-q.js
// 되돌리기: git revert [이 커밋]

const fs = require("fs");
const path = require("path");

const files = [
  "index.html",
  "scripts/gen-og.js",
  "README.md",
  "src/utils/usePageMeta.js",
  "src/utils/printTemplates.js",
  "src/pages/BizSection.jsx",
  "src/pages/AdminSection.jsx",
  "src/pages/ReportSection.jsx",
  "src/pages/CultureSection.jsx",
  "src/pages/ReliefSection.jsx",
  "src/pages/IntroSection.jsx",
  "src/pages/CulturePromoSection.jsx",
  "src/pages/HeroSection.jsx",
  "src/pages/ContentSection.jsx",
  "src/pages/DifferentiationSection.jsx",
  "src/pages/ChecklistSection.jsx",
  "src/App.jsx",
  "src/components/DiagnosisChatBot.jsx",
  "src/components/ContentDetailView.jsx",
  "src/components/common/PrivacyPolicyModal.jsx",
  "src/components/SideRequestPanel.jsx",
  "src/components/Nav.jsx",
  "src/components/AIChatBot.jsx",
  "src/components/ReportWriter.jsx",
  "src/components/PrintModal.jsx",
  "src/components/ReportForm.jsx",
  "src/components/AdminEmailComposer.jsx",
];

const root = path.join(__dirname, "..");
let totalReplacements = 0;
let fileChanges = [];

// 치환 규칙 (순서 중요 — 긴 문자열 먼저)
const rules = [
  // 브랜드 한글 — 가장 구체적 패턴부터
  { from: /뷰인사이드/g, to: "Q인사이드", label: "뷰인사이드→Q인사이드" },
  // 로고 분리 형태: `>뷰</span>` 혹은 `>뷰 ` 직후 인사이드 관련 — 브랜드 로고 컨텍스트
  { from: />뷰<\/span>/g, to: ">Q</span>", label: ">뷰</span>→>Q</span>" },
  { from: /">뷰 <span/g, to: '">Q <span', label: '">뷰 <span→">Q <span' },
  // 영문 브랜드
  { from: /View Inside/g, to: "Q Inside Labs", label: "View Inside→Q Inside Labs" },
  { from: /VIEW INSIDE/g, to: "Q INSIDE LABS", label: "VIEW INSIDE→Q INSIDE LABS" },
];

for (const relPath of files) {
  const absPath = path.join(root, relPath);
  if (!fs.existsSync(absPath)) {
    console.warn(`skip (not found): ${relPath}`);
    continue;
  }

  let content = fs.readFileSync(absPath, "utf8");
  const before = content;
  const perFileChanges = {};

  for (const rule of rules) {
    const matches = content.match(rule.from);
    if (matches) {
      perFileChanges[rule.label] = matches.length;
      content = content.replace(rule.from, rule.to);
    }
  }

  if (content !== before) {
    fs.writeFileSync(absPath, content, "utf8");
    const fileTotal = Object.values(perFileChanges).reduce((a, b) => a + b, 0);
    totalReplacements += fileTotal;
    fileChanges.push({ file: relPath, changes: perFileChanges, total: fileTotal });
  }
}

console.log("\n✓ 완료");
console.log(`  파일 수: ${fileChanges.length}`);
console.log(`  총 치환: ${totalReplacements}곳\n`);
fileChanges.forEach(({ file, changes, total }) => {
  console.log(`${total.toString().padStart(3)}곳  ${file}`);
  Object.entries(changes).forEach(([k, v]) => console.log(`       └ ${v}곳: ${k}`));
});
