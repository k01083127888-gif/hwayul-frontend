// "화율" → "뷰" 한글 텍스트 일괄 치환 스크립트
// 인프라(도메인, 이메일, API URL, 파일명)는 손대지 않음
// 실행: node scripts/rename-hwayul-to-view.js
// 되돌리기: git revert [해당 커밋]

const fs = require("fs");
const path = require("path");

// 대상 파일 목록 (grep으로 추출한 27개)
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

for (const relPath of files) {
  const absPath = path.join(root, relPath);
  if (!fs.existsSync(absPath)) {
    console.warn(`skip (not found): ${relPath}`);
    continue;
  }

  let content = fs.readFileSync(absPath, "utf8");
  const matches = content.match(/화율/g);
  if (!matches) continue;

  const count = matches.length;
  // 단순 치환 — "화율"이 나오는 모든 위치를 "뷰"로
  //   - "화율인사이드" → "뷰인사이드"   (브랜드 메인)
  //   - "화율 <span>..." → "뷰 <span>..." (로고 스플릿)
  //   - "화율의/화율에서/화율을" → "뷰의/뷰에서/뷰를"
  //     (화율 = 받침 있음(ㄹ), 뷰 = 받침 없음 — 조사 자동 조정 생략.
  //      문법 어색한 경우 있으면 이후 수동 보정)
  content = content.replace(/화율/g, "뷰");

  fs.writeFileSync(absPath, content, "utf8");
  totalReplacements += count;
  fileChanges.push({ file: relPath, count });
}

console.log("\n✓ 완료");
console.log(`  파일 수: ${fileChanges.length}`);
console.log(`  총 치환: ${totalReplacements}곳`);
console.log("\n파일별 내역:");
fileChanges.forEach(({ file, count }) => console.log(`  ${count.toString().padStart(3)}곳  ${file}`));
