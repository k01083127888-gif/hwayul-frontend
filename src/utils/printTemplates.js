import C from "../tokens/colors.js";
import { prerequisiteItems, behaviorCategories, impactItems, continuityOptions } from "../data/checklistData.js";

// ── 진단 결과 출력 시스템 ────────────────────────────────────────────────────
const PRINT_HEADER = `
  <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #0D7377;padding-bottom:18px;margin-bottom:24px">
    <div style="display:flex;align-items:center;gap:14px">
      <svg width="46" height="46" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="pN" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#0A1628"/><stop offset="100%" stop-color="#1E3A5F"/></linearGradient>
          <linearGradient id="pM" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0D7377"/><stop offset="100%" stop-color="#4ECDC4"/></linearGradient>
        </defs>
        <line x1="18" y1="10" x2="18" y2="90" stroke="url(#pN)" stroke-width="10" stroke-linecap="round"/>
        <line x1="50" y1="10" x2="50" y2="55" stroke="url(#pN)" stroke-width="10" stroke-linecap="round"/>
        <line x1="78" y1="52" x2="78" y2="90" stroke="url(#pN)" stroke-width="10" stroke-linecap="round"/>
        <path d="M18,46 C28,46 32,33 40,33 C48,33 44,46 50,46" stroke="url(#pM)" stroke-width="7" fill="none" stroke-linecap="round"/>
        <path d="M50,12 C52,30 60,42 70,48 C74,50 78,52 78,52" stroke="url(#pM)" stroke-width="7" fill="none" stroke-linecap="round"/>
        <path d="M96,12 C94,28 88,40 82,47 C80,50 78,52 78,52" stroke="url(#pM)" stroke-width="7" fill="none" stroke-linecap="round"/>
        <path d="M18,90 C34,82 62,82 78,90" stroke="url(#pM)" stroke-width="4.5" fill="none" stroke-linecap="round" opacity="0.45"/>
        <circle cx="50" cy="46" r="3" fill="#4ECDC4" opacity="0.5"/>
        <circle cx="78" cy="52" r="3" fill="#4ECDC4" opacity="0.5"/>
      </svg>
      <div>
        <div style="font-size:22px;font-weight:800;color:#0A1628;font-family:'Noto Sans KR',sans-serif">화율 <span style="color:#0D7377">인사이드</span></div>
        <div style="font-size:9px;color:#8B8680;margin-top:1px;letter-spacing:1.5px">Hwayul Inside</div>
        <div style="font-size:8px;color:#B0ADA6;letter-spacing:0.5px">직장내괴롭힘 & 조직문화 플랫폼</div>
      </div>
    </div>
    <div style="text-align:right;font-size:11px;color:#8B8680;line-height:1.8">
      <div><strong style="color:#0A1628">화율인사이드</strong></div>
      <div>Tel. 02-2088-1767</div>
      <div>Email. hwayulinside@gmail.com</div>
      <div>Web. www.hwayul.kr</div>
    </div>
  </div>
`;
const PRINT_FOOTER = `
  <div style="margin-top:36px;border-top:2px solid #E8E5DE;padding-top:18px;text-align:center">
    <div style="font-size:10px;color:#8B8680;line-height:1.8">
      본 진단 결과는 참고용이며 법적 효력이 없습니다. 최종 판단은 전문 노무사와 확인하시기 바랍니다.<br/>
      © 2025 화율인사이드 | Tel. 02-2088-1767 | hwayulinside@gmail.com
    </div>
    <div style="margin-top:12px;padding:10px;background:#0A1628;border-radius:8px">
      <div style="font-size:12px;color:#C9A84C;font-weight:700">💡 전문가 상담이 필요하신가요?</div>
      <div style="font-size:11px;color:rgba(244,241,235,0.6);margin-top:4px">
        화율인사이드의 전문 노무사에게 맞춤형 상담을 받아보세요. 초기 상담은 무료입니다.
      </div>
    </div>
  </div>
`;
const PRINT_STYLE = `<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700;800;900&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Noto Sans KR',sans-serif; color:#0A1628; background:white; padding:32px; max-width:800px; margin:0 auto; font-size:13px; line-height:1.7; }
  @media print { body { padding:20px; } @page { margin:15mm; } }
  .section { margin-bottom:22px; }
  .card { border:1px solid #E8E5DE; border-radius:10px; padding:18px; margin-bottom:14px; }
  .badge { display:inline-block; padding:3px 12px; border-radius:100px; font-size:11px; font-weight:700; }
  h2 { font-size:18px; font-weight:900; margin-bottom:12px; }
  h3 { font-size:14px; font-weight:800; margin-bottom:8px; }
  .bar-bg { height:8px; background:#E8E5DE; border-radius:4px; overflow:hidden; }
  .bar-fill { height:100%; border-radius:4px; }
  table { width:100%; border-collapse:collapse; margin-top:8px; }
  th { background:#F5F3EF; padding:8px 12px; font-size:11px; font-weight:700; text-align:left; border-bottom:2px solid #E8E5DE; }
  td { padding:8px 12px; font-size:12px; border-bottom:1px solid #F0EDE6; }
  .check { color:#1A7A4A; font-weight:700; }
  .uncheck { color:#C0C0C0; }
</style>`;

export function generateChecklistPrintHtml(prereq, behavior, impact, continuity, result) {
  const now = new Date().toLocaleString("ko-KR");
  const prereqRows = prerequisiteItems.map(p => `
    <tr><td class="${prereq[p.id]?"check":"uncheck"}">${prereq[p.id]?"✅":"⬜"}</td><td><strong>${p.req}</strong></td><td>${p.label}</td></tr>
  `).join("");
  const behaviorRows = behaviorCategories.map(cat => {
    const checked = cat.items.filter(i => behavior[i.id]);
    if (checked.length === 0) return "";
    return `<div class="card"><h3>${cat.icon} ${cat.category} <span class="badge" style="background:${cat.color}20;color:${cat.color}">${checked.length}건 해당</span></h3>
      <div style="font-size:11px;color:#8B8680;margin-bottom:8px">법적 근거: ${cat.basis}</div>
      ${checked.map(i => `<div style="padding:4px 0;font-size:12px">✅ ${i.text}</div>`).join("")}
    </div>`;
  }).join("");
  const impactRows = impactItems.map(cat => {
    const checked = cat.items.filter(i => impact[i.id]);
    return checked.length > 0 ? `<div style="margin-bottom:8px"><strong style="font-size:12px">${cat.category}</strong>${checked.map(i => `<div style="padding:2px 0;font-size:12px">✅ ${i.text}</div>`).join("")}</div>` : "";
  }).join("");
  const contLabel = continuity ? continuityOptions.find(c => c.id === continuity)?.label || "-" : "-";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>직장내 괴롭힘 진단 결과 - 화율인사이드</title>${PRINT_STYLE}</head><body>
    ${PRINT_HEADER}
    <div style="text-align:center;margin-bottom:24px">
      <h2>직장내 괴롭힘 진단 결과 보고서</h2>
      <div style="font-size:11px;color:#8B8680">진단일시: ${now} | 화율인사이드 자동 생성</div>
    </div>
    <div class="card" style="text-align:center;border-color:${result.color};border-width:2px">
      <div style="font-size:32px;margin-bottom:8px">${result.emoji}</div>
      <div class="badge" style="background:${result.color}20;color:${result.color};font-size:13px;padding:6px 20px;margin-bottom:10px">${result.level}</div>
      <h3 style="font-size:15px;margin-bottom:8px">${result.title}</h3>
      <p style="font-size:12px;color:#8B8680">${result.summary}</p>
    </div>
    <div class="section"><div style="display:flex;gap:12px;margin-bottom:16px">
      <div class="card" style="flex:1;text-align:center"><div style="font-size:11px;color:#8B8680">3대 요건 충족</div><div style="font-size:22px;font-weight:900;color:${result.prereqMet>=2?C.red:C.green}">${result.prereqMet}/3</div></div>
      <div class="card" style="flex:1;text-align:center"><div style="font-size:11px;color:#8B8680">행위유형 점수</div><div style="font-size:22px;font-weight:900;color:#C9A84C">${result.behaviorScore}점</div></div>
      <div class="card" style="flex:1;text-align:center"><div style="font-size:11px;color:#8B8680">피해 영향도</div><div style="font-size:22px;font-weight:900;color:#D4740A">${result.impactScore}점</div></div>
      <div class="card" style="flex:1;text-align:center"><div style="font-size:11px;color:#8B8680">반복성</div><div style="font-size:22px;font-weight:900;color:#0A1628">${contLabel}</div></div>
    </div></div>
    <div class="section"><h2>1. 사전요건 (3대 요건) 점검</h2><table><thead><tr><th style="width:40px"></th><th style="width:80px">요건</th><th>내용</th></tr></thead><tbody>${prereqRows}</tbody></table></div>
    <div class="section"><h2>2. 해당 행위유형 상세</h2>${behaviorRows || '<div style="color:#8B8680;padding:12px">해당 없음</div>'}</div>
    <div class="section"><h2>3. 피해 영향도</h2>${impactRows || '<div style="color:#8B8680;padding:12px">해당 없음</div>'}</div>
    <div class="section"><h2>4. 권고 조치</h2><div class="card">${result.actions.map((a,i) => `<div style="padding:4px 0"><strong style="color:${result.color}">${i+1}.</strong> ${a}</div>`).join("")}</div></div>
    <div class="section"><h2>5. 관련 법령</h2><div class="card"><table><tbody>
      ${[["근거 법령","근로기준법 제76조의2~4"],["신고 기관","고용노동부 지방관서, 노동위원회"],["조사 의무","사업주 즉시 조사 의무(14일 내)"],["피해자 보호","불이익 처우 금지 (제76조의3 ⑥)"]].map(([l,v]) => `<tr><td style="width:120px;font-weight:700">${l}</td><td>${v}</td></tr>`).join("")}
    </tbody></table></div></div>
    ${PRINT_FOOTER}
    <script>window.onload = function() { window.print(); }</script>
  </body></html>`;
}

export function generateCulturePrintHtml(totalRisk, catResults, highRiskItems, answers, orgInfo, getRiskGrade) {
  const now = new Date().toLocaleString("ko-KR");
  const grade = getRiskGrade(totalRisk);
  const catRows = catResults.map(cat => `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <h3 style="margin:0">${cat.icon} ${cat.title}</h3>
        <span class="badge" style="background:${cat.grade.color}20;color:${cat.grade.color}">${cat.score}점 · ${cat.grade.label}</span>
      </div>
      <div class="bar-bg"><div class="bar-fill" style="width:${cat.score}%;background:${cat.grade.color}"></div></div>
      <div style="font-size:11px;color:#8B8680;margin-top:6px">📌 ${cat.riskFactor}</div>
      <table style="margin-top:8px"><thead><tr><th style="width:40px"></th><th>문항</th><th style="width:80px">응답</th></tr></thead><tbody>
        ${cat.items.map((item,idx) => {
          const v = answers[item.id];
          const label = v !== undefined ? ["전혀 아니다","아니다","보통이다","그렇다","매우 그렇다"][v] : "-";
          const cls = v >= 3 ? "color:#C0392B;font-weight:700" : v >= 2 ? "color:#D4740A" : "color:#1A7A4A";
          return `<tr><td style="font-size:11px;color:${cat.color};font-weight:700">Q${idx+1}</td><td>${item.text}${item.risk==="high"?' <span style="font-size:9px;color:#C0392B;font-weight:700;border:1px solid #C0392B30;padding:1px 4px;border-radius:3px">핵심</span>':""}</td><td style="${cls}">${label}</td></tr>`;
        }).join("")}
      </tbody></table>
    </div>
  `).join("");
  const riskItemsHtml = highRiskItems.length > 0 ? `
    <div class="section"><h2>핵심 위험 신호 (${highRiskItems.length}건)</h2>
      ${highRiskItems.map(i => `<div style="padding:6px 0;border-bottom:1px solid #F0EDE6">🚩 <strong style="color:${i.catColor}">[${i.catTitle}]</strong> ${i.text}</div>`).join("")}
    </div>` : "";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>조직문화 진단 결과 - 화율인사이드</title>${PRINT_STYLE}</head><body>
    ${PRINT_HEADER}
    <div style="text-align:center;margin-bottom:24px">
      <h2>직장내 괴롭힘 발생 위험도 진단 보고서</h2>
      <div style="font-size:11px;color:#8B8680">진단일시: ${now}${orgInfo.name ? " | 조직: "+orgInfo.name : ""}${orgInfo.size ? " ("+orgInfo.size+")" : ""} | 화율인사이드 자동 생성</div>
    </div>
    <div class="card" style="text-align:center;border-color:${grade.color};border-width:2px">
      <div style="font-size:32px;margin-bottom:6px">${grade.emoji}</div>
      <div style="font-size:42px;font-weight:900;color:${grade.color}">${totalRisk}<span style="font-size:14px;color:#8B8680"> / 100</span></div>
      <div class="badge" style="background:${grade.color}20;color:${grade.color};font-size:13px;padding:6px 20px;margin:10px 0">괴롭힘 발생 위험 : ${grade.label}</div>
      <p style="font-size:12px;color:#8B8680;max-width:500px;margin:0 auto">${grade.desc}</p>
    </div>
    <div class="section"><h2>영역별 위험 분석 및 응답 상세</h2>${catRows}</div>
    ${riskItemsHtml}
    ${PRINT_FOOTER}
    <script>window.onload = function() { window.print(); }</script>
  </body></html>`;
}

// ── 공용 결과지 템플릿 (피지목인·산재·사내조사) ───────────────────────────
function genericPrintHtml({ title, subtitle, result, scoreCards = [], checkedItems = [] }) {
  const scoreCardsHtml = scoreCards.map(s => `
    <div style="flex:1;min-width:110px;padding:14px;background:#F8F7F5;border:1px solid #E8E5DE;border-radius:10px;text-align:center">
      <div style="font-size:10px;color:#8B8680;margin-bottom:4px">${s.label}</div>
      <div style="font-size:18px;font-weight:900;color:#C9A84C">${s.value}</div>
    </div>`).join("");

  const checkedHtml = checkedItems.length > 0 ? `
    <div class="section">
      <h2>체크한 항목</h2>
      <div style="background:#FAFAF8;padding:14px 16px;border-left:3px solid #0D7377;border-radius:8px">
        ${checkedItems.map(item => `<div style="font-size:12px;color:#3A3530;margin-bottom:4px">✓ ${item}</div>`).join("")}
      </div>
    </div>` : "";

  const actionsHtml = (result.actions || []).map(a => `<div style="font-size:12.5px;color:#3A3530;margin-bottom:6px">✓ ${a}</div>`).join("");

  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"/><title>${title} 결과지</title>${PRINT_STYLE}
    <style>
      h2 { font-size:14px; font-weight:800; color:#0A1628; margin-bottom:10px; padding-bottom:6px; border-bottom:1px solid #E8E5DE; }
      .section { margin-bottom:22px; }
      .result-card { padding:28px 24px; background:${result.color || "#C9A84C"}15; border:2px solid ${result.color || "#C9A84C"}40; border-radius:14px; text-align:center; margin-bottom:22px; }
    </style></head><body>
    ${PRINT_HEADER}
    <div style="text-align:center;margin-bottom:24px">
      <div style="font-size:10px;color:#0D7377;letter-spacing:2px;margin-bottom:4px">HWAYUL INSIDE DIAGNOSIS REPORT</div>
      <div style="font-family:'Noto Serif KR',serif;font-size:22px;font-weight:800;color:#0A1628">${title}</div>
      ${subtitle ? `<div style="font-size:11px;color:#8B8680;margin-top:4px">${subtitle}</div>` : ""}
      <div style="font-size:10px;color:#B0ADA6;margin-top:6px">진단일: ${new Date().toLocaleDateString("ko-KR")}</div>
    </div>
    <div class="result-card">
      <div style="font-size:40px;margin-bottom:10px">${result.emoji || "📋"}</div>
      <div style="font-size:11px;font-weight:700;color:${result.color || "#C9A84C"};letter-spacing:1px;margin-bottom:8px">${result.level || ""}</div>
      <div style="font-family:'Noto Serif KR',serif;font-size:18px;font-weight:800;color:#0A1628;margin-bottom:10px">${result.title || ""}</div>
      <p style="font-size:12px;color:#5A5550;line-height:1.8;max-width:580px;margin:0 auto">${result.summary || ""}</p>
    </div>
    ${scoreCards.length > 0 ? `<div class="section"><h2>점수 요약</h2><div style="display:flex;gap:10px;flex-wrap:wrap">${scoreCardsHtml}</div></div>` : ""}
    ${checkedHtml}
    <div class="section">
      <h2>권장 조치</h2>
      <div style="background:#FFF8E7;padding:14px 16px;border-left:3px solid ${result.color || "#C9A84C"};border-radius:8px">
        ${actionsHtml}
      </div>
    </div>
    ${PRINT_FOOTER}
    <script>window.onload = function() { window.print(); }</script>
  </body></html>`;
}

// ── 피지목인 진단 결과지 ───────────────────────────────────────────────────
export function generateAccusedPrintHtml(relation, superiority, behavior, justification, repetition, impact, result) {
  const scoreCards = [
    { label: "관계 우위", value: result.positionScore },
    { label: "행위 점수", value: result.behaviorScore },
    { label: "적정성", value: result.justScore },
    { label: "반복성", value: result.repScore },
    { label: "영향도", value: result.impactScore },
  ];
  return genericPrintHtml({
    title: "피지목인 자가진단 결과지",
    subtitle: "괴롭힘 지목 사안 성립 가능성 분석",
    result,
    scoreCards,
  });
}

// ── 산재 상담 필요성 체크 결과지 ───────────────────────────────────────────
export function generateSanjaePrintHtml(situation, medical, workCond, result) {
  return genericPrintHtml({
    title: "산재 상담 필요성 체크 결과지",
    subtitle: situation?.tag ? `상황 유형: ${situation.tag}` : "",
    result,
  });
}

// ── 사내 괴롭힘 조사 필요성 체크 결과지 ─────────────────────────────────────
export function generateCompanyPrintHtml(report, org, actions, result) {
  return genericPrintHtml({
    title: "사내 괴롭힘 조사 필요성 체크 결과지",
    subtitle: "기업의 법적 의무 이행 점검",
    result,
  });
}
