import C from "../tokens/colors.js";
import { prerequisiteItems, behaviorCategories, impactItems, continuityOptions } from "../data/checklistData.js";
import { accusedRelationItems, accusedSuperiorityItems, accusedBehaviorCategories, accusedJustificationQuestions, accusedRepetitionQuestions, accusedImpactItems } from "../data/accusedChecklistData.js";
import { sanjaeTypeOptions, sanjaeMedicalOptions, sanjaeWorkConditions } from "../data/sanjaeCheckData.js";
import { companyReportStatus, companyOrgStatus, companyCurrentActions } from "../data/companyCheckData.js";

// ── 진단 결과 출력 시스템 ────────────────────────────────────────────────────
const PRINT_HEADER = `
  <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #0D7377;padding-bottom:18px;margin-bottom:24px;flex-wrap:wrap;gap:12px">
    <div style="display:flex;align-items:center;gap:14px;white-space:nowrap">
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
        <div style="font-size:24px;font-weight:800;color:#0A1628;font-family:'Gowun Batang','Noto Sans KR',sans-serif"><span style="font-family:'Inter','Helvetica Neue','Arial Black',sans-serif;font-weight:900;letter-spacing:-0.04em">WIHAM</span><span style="color:#C9A84C;font-family:'Noto Sans KR',sans-serif;font-weight:700;font-size:0.55em;letter-spacing:-0.03em;margin-left:3px">위함</span> <span style="color:#0D7377;font-family:'Noto Sans KR',sans-serif;font-weight:900;letter-spacing:-0.03em">인사이드</span></div>
        <div style="font-size:9px;color:#8B8680;margin-top:1px;letter-spacing:1.5px">WIHAM Inside Labs</div>
        <div style="font-size:8px;color:#B0ADA6;letter-spacing:0.5px">직장내괴롭힘 & 조직문화 플랫폼</div>
      </div>
    </div>
    <div style="text-align:right;font-size:11px;color:#8B8680;line-height:1.8;white-space:nowrap">
      <div><strong style="color:#0A1628;font-family:'Gowun Batang','Noto Sans KR',sans-serif;font-size:14px">WIHAM 인사이드</strong></div>
      <div>Tel. 02-2088-1767</div>
      <div>Email. wihaminside@gmail.com</div>
      <div>Web. www.wiham.kr</div>
    </div>
  </div>
`;
const PRINT_FOOTER = `
  <div style="margin-top:36px;border-top:2px solid #E8E5DE;padding-top:18px;text-align:center">
    <div style="font-size:10px;color:#8B8680;line-height:1.8">
      본 진단 결과는 참고용이며 법적 효력이 없습니다. 최종 판단은 전문 노무사와 확인하시기 바랍니다.<br/>
      © 2025 WIHAM 인사이드 | Tel. 02-2088-1767 | wihaminside@gmail.com
    </div>
    <div style="margin-top:12px;padding:10px;background:#0A1628;border-radius:8px">
      <div style="font-size:12px;color:#C9A84C;font-weight:700">💡 전문가 상담이 필요하신가요?</div>
      <div style="font-size:11px;color:rgba(244,241,235,0.6);margin-top:4px">
        WIHAM 인사이드의 전문 노무사에게 맞춤형 상담을 받아보세요. 초기 상담은 무료입니다.
      </div>
    </div>
  </div>
`;
const PRINT_STYLE = `<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700;800;900&family=Gowun+Batang:wght@400;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Noto Sans KR','Apple SD Gothic Neo',sans-serif; color:#0A1628; background:#F5F3EF; font-size:13px; line-height:1.75; word-break:keep-all; }
  .q-wrap { max-width:780px; margin:0 auto; padding:32px; background:white; box-shadow:0 4px 20px rgba(10,22,40,0.06); }
  @media print {
    body { background:white !important; padding:0 !important; }
    .q-wrap { box-shadow:none !important; padding:20px !important; max-width:100% !important; }
    @page { margin:15mm; }
  }
  @media (max-width:600px) {
    .q-wrap { padding:20px 16px !important; }
    body { font-size:12px; }
    h2 { font-size:15px !important; }
    h3 { font-size:13px !important; }
  }
  .section { margin-bottom:48px; }
  .section + .section { margin-top:24px; padding-top:8px; }
  .card { border:1px solid #E8E5DE; border-radius:10px; padding:22px; margin-bottom:16px; }
  .badge { display:inline-block; padding:3px 12px; border-radius:100px; font-size:11px; font-weight:700; }
  /* 번호 매긴 메인 섹션 — 공식 서류 스타일 */
  h2 { font-size:17px; font-weight:900; margin-bottom:20px; margin-top:8px; color:#0A1628; padding:12px 0 12px 16px; border-left:5px solid #0D7377; background:#F5F3EF; border-radius:0 6px 6px 0; }
  h3 { font-size:14px; font-weight:800; margin-bottom:10px; margin-top:4px; color:#0A1628; }
  /* 체크박스 스타일 — 시인성 강화 (이메일·인쇄용 인라인 SVG-like 박스) */
  .chk-box { display:inline-block; width:18px; height:18px; border:2px solid #0A1628; border-radius:3px; text-align:center; line-height:14px; font-size:13px; font-weight:900; vertical-align:middle; }
  .chk-on  { background:#0D7377; color:#fff; border-color:#0D7377; }
  .chk-off { background:#fff; color:transparent; border-color:#B0ADA6; }
  /* 행 구분 강화 */
  td.tdcheck { width:42px; text-align:center; padding:14px 10px !important; }
  tr.row-on  td { background:#F0F8F8; }
  tr.row-off td { background:#FAFAF7; color:#8B8680; }
  .bar-bg { height:8px; background:#E8E5DE; border-radius:4px; overflow:hidden; }
  .bar-fill { height:100%; border-radius:4px; }
  table { width:100%; border-collapse:collapse; margin-top:8px; }
  th { background:#F5F3EF; padding:10px 14px; font-size:11px; font-weight:700; text-align:left; border-bottom:2px solid #E8E5DE; }
  td { padding:10px 14px; font-size:12px; border-bottom:1px solid #F0EDE6; vertical-align:top; line-height:1.7; }
  .check { color:#1A7A4A; font-weight:700; }
  .uncheck { color:#C0C0C0; }
  /* 4개 통계 박스 — 테이블로 (이메일 호환 최고) */
  .stat-row { display:table; width:100%; table-layout:fixed; border-collapse:separate; border-spacing:8px 0; margin-bottom:16px; }
  .stat-cell { display:table-cell; width:25%; border:1px solid #E8E5DE; border-radius:10px; padding:14px 8px; text-align:center; vertical-align:middle; background:white; }
  .stat-cell .lab { font-size:11px; color:#8B8680; margin-bottom:6px; white-space:nowrap; }
  .stat-cell .val { font-size:20px; font-weight:900; line-height:1.2; }
  @media (max-width:600px) {
    .stat-row { border-spacing:4px 0; }
    .stat-cell { padding:10px 4px; }
    .stat-cell .val { font-size:16px; }
    .stat-cell .lab { font-size:10px; }
  }
</style>`;

export function generateChecklistPrintHtml(prereq, behavior, impact, continuity, result) {
  const now = new Date().toLocaleString("ko-KR");
  const prereqRows = prerequisiteItems.map(p => {
    const on = !!prereq[p.id];
    return `
    <tr class="${on?'row-on':'row-off'}">
      <td class="tdcheck"><span class="chk-box ${on?'chk-on':'chk-off'}">${on?'✓':''}</span></td>
      <td><strong>${p.req}</strong></td>
      <td>${p.label}${on?'':' <span style="color:#C0C0C0;font-size:11px">(미충족)</span>'}</td>
    </tr>`;
  }).join("");
  const behaviorRows = behaviorCategories.map(cat => {
    const checked = cat.items.filter(i => behavior[i.id]);
    if (checked.length === 0) return "";
    return `<div class="card"><h3>${cat.icon} ${cat.category} <span class="badge" style="background:${cat.color}20;color:${cat.color}">${checked.length}건 해당</span></h3>
      <div style="font-size:11px;color:#8B8680;margin-bottom:10px">법적 근거: ${cat.basis}</div>
      ${checked.map(i => `<div style="padding:9px 0;font-size:12px;display:flex;align-items:flex-start;gap:10px"><span class="chk-box chk-on" style="flex-shrink:0;margin-top:1px">✓</span><span>${i.text}</span></div>`).join("")}
    </div>`;
  }).join("");
  const impactRows = impactItems.map(cat => {
    const checked = cat.items.filter(i => impact[i.id]);
    return checked.length > 0 ? `<div style="margin-bottom:18px;padding:14px 16px;background:#FAFAF7;border-left:3px solid #C9A84C;border-radius:0 6px 6px 0"><strong style="font-size:12px;color:#0A1628">${cat.category}</strong>${checked.map(i => `<div style="padding:7px 0 0;font-size:12px;display:flex;align-items:flex-start;gap:10px"><span class="chk-box chk-on" style="flex-shrink:0;margin-top:1px">✓</span><span>${i.text}</span></div>`).join("")}</div>` : "";
  }).join("");
  const contLabel = continuity ? continuityOptions.find(c => c.id === continuity)?.label || "-" : "-";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>직장내 괴롭힘 진단 결과 - WIHAM 인사이드</title>${PRINT_STYLE}</head><body>
    <div style="max-width:780px;margin:0 auto;padding:32px;background:white;box-shadow:0 4px 20px rgba(10,22,40,0.06)">
    ${PRINT_HEADER}
    <div style="text-align:center;margin-bottom:24px">
      <h2>직장내 괴롭힘 진단 결과 보고서</h2>
      <div style="font-size:11px;color:#8B8680">진단일시: ${now} | WIHAM 인사이드 자동 생성</div>
    </div>
    <div class="card" style="text-align:center;border-color:${result.color};border-width:2px">
      <div style="font-size:32px;margin-bottom:8px">${result.emoji}</div>
      <div class="badge" style="background:${result.color}20;color:${result.color};font-size:13px;padding:6px 20px;margin-bottom:10px">${result.level}</div>
      <h3 style="font-size:15px;margin-bottom:8px">${result.title}</h3>
      <p style="font-size:12px;color:#8B8680;line-height:1.7">${result.summary}</p>
    </div>
    <div class="section">
      <table style="width:100%;table-layout:fixed;border-collapse:separate;border-spacing:6px 0;margin-bottom:16px">
        <tr>
          <td style="width:25%;border:1px solid #E8E5DE;border-radius:10px;padding:14px 6px;text-align:center;background:white;vertical-align:middle">
            <div style="font-size:11px;color:#8B8680;margin-bottom:6px;white-space:nowrap">3대 요건 충족</div>
            <div style="font-size:20px;font-weight:900;line-height:1.2;color:${result.prereqMet>=2?C.red:C.green}">${result.prereqMet}/3</div>
          </td>
          <td style="width:25%;border:1px solid #E8E5DE;border-radius:10px;padding:14px 6px;text-align:center;background:white;vertical-align:middle">
            <div style="font-size:11px;color:#8B8680;margin-bottom:6px;white-space:nowrap">행위유형 점수</div>
            <div style="font-size:20px;font-weight:900;line-height:1.2;color:#C9A84C">${result.behaviorScore}점</div>
          </td>
          <td style="width:25%;border:1px solid #E8E5DE;border-radius:10px;padding:14px 6px;text-align:center;background:white;vertical-align:middle">
            <div style="font-size:11px;color:#8B8680;margin-bottom:6px;white-space:nowrap">피해 영향도</div>
            <div style="font-size:20px;font-weight:900;line-height:1.2;color:#D4740A">${result.impactScore}점</div>
          </td>
          <td style="width:25%;border:1px solid #E8E5DE;border-radius:10px;padding:14px 6px;text-align:center;background:white;vertical-align:middle">
            <div style="font-size:11px;color:#8B8680;margin-bottom:6px;white-space:nowrap">반복성</div>
            <div style="font-size:14px;font-weight:900;line-height:1.2;color:#0A1628">${contLabel}</div>
          </td>
        </tr>
      </table>
    </div>
    <div class="section"><h2>1. 사전요건 (3대 요건) 점검</h2><table><thead><tr><th style="width:40px"></th><th style="width:80px">요건</th><th>내용</th></tr></thead><tbody>${prereqRows}</tbody></table></div>
    <div class="section"><h2>2. 해당 행위유형 상세</h2>${behaviorRows || '<div style="color:#8B8680;padding:12px">해당 없음</div>'}</div>
    <div class="section"><h2>3. 피해 영향도</h2>${impactRows || '<div style="color:#8B8680;padding:12px">해당 없음</div>'}</div>
    <div class="section"><h2>4. 권고 조치</h2><div class="card" style="border-left:5px solid ${result.color};background:#FAFAF7">${result.actions.map((a,i) => `<div style="padding:10px 0;font-size:13px;display:flex;align-items:flex-start;gap:12px;border-bottom:${i<result.actions.length-1?'1px dashed #E8E5DE':'none'}"><span style="display:inline-block;flex-shrink:0;width:24px;height:24px;line-height:24px;text-align:center;border-radius:50%;background:${result.color};color:#fff;font-size:11px;font-weight:900">${i+1}</span><span style="flex:1;line-height:1.7">${a}</span></div>`).join("")}</div></div>
    ${PRINT_FOOTER}
    </div>
    <script>window.onload = function() { try { window.print(); } catch(e){} }</script>
  </body></html>`;
}

export function generateCulturePrintHtml(totalRisk, catResults, highRiskItems, answers, orgInfo, getRiskGrade) {
  const now = new Date().toLocaleString("ko-KR");
  const grade = getRiskGrade(totalRisk);
  // 5점 척도 응답을 시각적 박스로 표현 — 0(전혀 아니다)~4(매우 그렇다)
  // 선택된 칸만 컬러로 채워서 한눈에 응답 강도 파악 가능
  const scaleBoxes = (v, color) => {
    const labels = ["전혀","아니","보통","그렇","매우"];
    return Array.from({length:5}, (_,i) => {
      const on = i === v;
      const isHigh = i >= 3;
      const fillColor = isHigh ? "#C0392B" : i === 2 ? "#D4740A" : "#1A7A4A";
      return `<span style="display:inline-block;width:30px;height:22px;line-height:18px;text-align:center;font-size:9px;font-weight:${on?900:500};margin-right:3px;border:1.5px solid ${on?fillColor:'#D8D5CE'};border-radius:4px;background:${on?fillColor:'#fff'};color:${on?'#fff':'#B0ADA6'};vertical-align:middle">${labels[i]}</span>`;
    }).join("");
  };

  const catRows = catResults.map((cat, ci) => `
    <div class="card" style="margin-bottom:24px;border-left:4px solid ${cat.grade.color}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">
        <h3 style="margin:0;font-size:15px">${cat.icon} ${cat.title}</h3>
        <span class="badge" style="background:${cat.grade.color};color:#fff;font-size:12px;padding:5px 14px">${cat.score}점 · ${cat.grade.label}</span>
      </div>
      <div class="bar-bg" style="height:10px"><div class="bar-fill" style="width:${cat.score}%;background:${cat.grade.color}"></div></div>
      <div style="font-size:11px;color:#5A5550;margin:10px 0 16px;padding:10px 14px;background:#FAFAF7;border-radius:6px;border-left:3px solid ${cat.color}">📌 ${cat.riskFactor}</div>
      <table style="margin-top:8px;border-collapse:separate;border-spacing:0">
        <thead><tr>
          <th style="width:46px;text-align:center">No.</th>
          <th>문항</th>
          <th style="width:200px;text-align:center">응답 (5점 척도)</th>
        </tr></thead>
        <tbody>
        ${cat.items.map((item,idx) => {
          const v = answers[item.id];
          const isCore = item.risk === "high";
          const isHighRisk = v >= 3;
          return `<tr style="background:${isHighRisk?'#FDF4F2':(idx%2?'#FAFAF7':'#fff')}">
            <td style="text-align:center;font-size:12px;color:${cat.color};font-weight:800;padding:14px 8px">Q${idx+1}</td>
            <td style="padding:14px 12px;line-height:1.6">${item.text}${isCore?' <span style="font-size:9px;color:#C0392B;font-weight:700;border:1px solid #C0392B30;padding:1px 5px;border-radius:3px;margin-left:4px;background:#fff">핵심</span>':""}</td>
            <td style="padding:14px 8px;text-align:center;white-space:nowrap">${scaleBoxes(v, cat.color)}</td>
          </tr>`;
        }).join("")}
      </tbody></table>
    </div>
  `).join("");
  const riskItemsHtml = highRiskItems.length > 0 ? `
    <div class="section"><h2>🚩 핵심 위험 신호 (${highRiskItems.length}건)</h2>
      <div class="card" style="border-left:5px solid #C0392B;background:#FDF4F2">
        ${highRiskItems.map((i,idx) => `<div style="padding:11px 0;font-size:13px;display:flex;align-items:flex-start;gap:12px;border-bottom:${idx<highRiskItems.length-1?'1px dashed #F0CFC9':'none'}">
          <span style="display:inline-block;flex-shrink:0;width:24px;height:24px;line-height:24px;text-align:center;border-radius:4px;background:#C0392B;color:#fff;font-size:11px;font-weight:900">${idx+1}</span>
          <div style="flex:1;line-height:1.7">
            <strong style="color:${i.catColor};font-size:11px;display:inline-block;padding:2px 8px;border-radius:3px;background:${i.catColor}15;margin-right:6px">[${i.catTitle}]</strong>
            ${i.text}
          </div>
        </div>`).join("")}
      </div>
    </div>` : "";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>조직문화 진단 결과 - WIHAM 인사이드</title>${PRINT_STYLE}</head><body>
    <div style="max-width:780px;margin:0 auto;padding:32px;background:white;box-shadow:0 4px 20px rgba(10,22,40,0.06)">
    ${PRINT_HEADER}
    <div style="text-align:center;margin-bottom:24px">
      <h2>직장내 괴롭힘 발생 위험도 진단 보고서</h2>
      <div style="font-size:11px;color:#8B8680">진단일시: ${now}${orgInfo.name ? " | 조직: "+orgInfo.name : ""}${orgInfo.size ? " ("+orgInfo.size+")" : ""} | WIHAM 인사이드 자동 생성</div>
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
    </div>
    <script>window.onload = function() { try { window.print(); } catch(e){} }</script>
  </body></html>`;
}

// ── 피지목인 진단 결과지 (상세) ────────────────────────────────────────────
export function generateAccusedPrintHtml(relation, superiority, behavior, justification, repetition, impact, result) {
  const now = new Date().toLocaleString("ko-KR");
  const relationLabel = relation ? accusedRelationItems.find(r => r.id === relation.id)?.label || "-" : "-";
  const supChecked = accusedSuperiorityItems.filter(s => superiority[s.id]);
  const supHtml = supChecked.length > 0
    ? supChecked.map(s => `<div style="padding:5px 0;font-size:12px">✅ ${s.label}</div>`).join("")
    : `<div style="color:#8B8680;font-size:12px">해당 없음</div>`;

  const behaviorRows = accusedBehaviorCategories.map(cat => {
    const checked = cat.items.filter(i => behavior[i.id]);
    if (checked.length === 0) return "";
    return `<div class="card"><h3>${cat.icon} ${cat.category} <span class="badge" style="background:${cat.color}20;color:${cat.color}">${checked.length}건 해당</span></h3>
      ${checked.map(i => `<div style="padding:7px 0;font-size:12px">✅ ${i.text}</div>`).join("")}
    </div>`;
  }).join("");

  const justRows = accusedJustificationQuestions.map(q => {
    const selectedWeight = justification[q.id];
    const selected = q.options.find(o => o.weight === selectedWeight);
    return `<tr><td style="width:45%;font-weight:600">${q.question}</td><td>${selected ? selected.label : "-"}</td></tr>`;
  }).join("");

  const repRows = accusedRepetitionQuestions.map(q => {
    const selectedWeight = repetition[q.id];
    const selected = q.options.find(o => o.weight === selectedWeight);
    return `<tr><td style="width:45%;font-weight:600">${q.question}</td><td>${selected ? selected.label : "-"}</td></tr>`;
  }).join("");

  const impactChecked = accusedImpactItems.filter(i => impact[i.id]);
  const impactHtml = impactChecked.length > 0
    ? impactChecked.map(i => `<div style="padding:5px 0;font-size:12px">✅ ${i.text}</div>`).join("")
    : `<div style="color:#8B8680;font-size:12px">영향 없음 또는 미확인</div>`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>피지목인 자가진단 결과 - WIHAM 인사이드</title>${PRINT_STYLE}</head><body>
    <div style="max-width:780px;margin:0 auto;padding:32px;background:white;box-shadow:0 4px 20px rgba(10,22,40,0.06)">
    ${PRINT_HEADER}
    <div style="text-align:center;margin-bottom:24px">
      <h2>피지목인 자가진단 결과 보고서</h2>
      <div style="font-size:11px;color:#8B8680">진단일시: ${now} | WIHAM 인사이드 자동 생성</div>
    </div>
    <div class="card" style="text-align:center;border-color:${result.color};border-width:2px">
      <div style="font-size:32px;margin-bottom:8px">${result.emoji}</div>
      <div class="badge" style="background:${result.color}20;color:${result.color};font-size:13px;padding:6px 20px;margin-bottom:10px">${result.level}</div>
      <h3 style="font-size:15px;margin-bottom:8px">${result.title}</h3>
      <p style="font-size:12px;color:#8B8680;line-height:1.7">${result.summary}</p>
    </div>
    <div class="section">
      <table style="width:100%;table-layout:fixed;border-collapse:separate;border-spacing:5px 0;margin-bottom:16px">
        <tr>
          <td style="width:20%;border:1px solid #E8E5DE;border-radius:10px;padding:12px 4px;text-align:center;background:white;vertical-align:middle">
            <div style="font-size:10px;color:#8B8680;margin-bottom:4px;white-space:nowrap">관계 우위</div>
            <div style="font-size:18px;font-weight:900;line-height:1.2;color:#C9A84C">${result.positionScore}</div>
          </td>
          <td style="width:20%;border:1px solid #E8E5DE;border-radius:10px;padding:12px 4px;text-align:center;background:white;vertical-align:middle">
            <div style="font-size:10px;color:#8B8680;margin-bottom:4px;white-space:nowrap">행위 점수</div>
            <div style="font-size:18px;font-weight:900;line-height:1.2;color:#D4740A">${result.behaviorScore}</div>
          </td>
          <td style="width:20%;border:1px solid #E8E5DE;border-radius:10px;padding:12px 4px;text-align:center;background:white;vertical-align:middle">
            <div style="font-size:10px;color:#8B8680;margin-bottom:4px;white-space:nowrap">적정성</div>
            <div style="font-size:18px;font-weight:900;line-height:1.2;color:#C0392B">${result.justScore}</div>
          </td>
          <td style="width:20%;border:1px solid #E8E5DE;border-radius:10px;padding:12px 4px;text-align:center;background:white;vertical-align:middle">
            <div style="font-size:10px;color:#8B8680;margin-bottom:4px;white-space:nowrap">반복성</div>
            <div style="font-size:18px;font-weight:900;line-height:1.2;color:#0A1628">${result.repScore}</div>
          </td>
          <td style="width:20%;border:1px solid #E8E5DE;border-radius:10px;padding:12px 4px;text-align:center;background:white;vertical-align:middle">
            <div style="font-size:10px;color:#8B8680;margin-bottom:4px;white-space:nowrap">영향도</div>
            <div style="font-size:18px;font-weight:900;line-height:1.2;color:#8E44AD">${result.impactScore}</div>
          </td>
        </tr>
      </table>
    </div>
    <div class="section"><h2>1. 관계 확인</h2><div class="card">
      <div style="margin-bottom:10px"><strong>상대방과의 관계:</strong> ${relationLabel}</div>
      <div style="font-size:12px;font-weight:700;margin-bottom:6px">우위 요소 (복수 선택):</div>
      ${supHtml}
    </div></div>
    <div class="section"><h2>2. 해당 행위 유형</h2>${behaviorRows || '<div class="card" style="color:#8B8680">체크한 행위 없음</div>'}</div>
    <div class="section"><h2>3. 업무 적정성 판단</h2><table><tbody>${justRows}</tbody></table></div>
    <div class="section"><h2>4. 반복성·상대방 반응</h2><table><tbody>${repRows}</tbody></table></div>
    <div class="section"><h2>5. 상대방 영향도</h2><div class="card">${impactHtml}</div></div>
    <div class="section"><h2>6. 권고 조치</h2><div class="card">${result.actions.map((a,i) => `<div style="padding:7px 0"><strong style="color:${result.color}">${i+1}.</strong> ${a}</div>`).join("")}</div></div>
    <div class="section"><h2>7. 유의사항</h2><div class="card" style="background:#FFF8E7">
      <div style="font-size:12px;color:#8B5A00;line-height:1.8">
        • 본 진단은 참고용이며 법적 판단이 아닙니다<br/>
        • 조사 진행 중이라면 진술·소명 전 반드시 전문가 검토를 받으시기 바랍니다<br/>
        • 증거 인멸·회유·상대방 접촉은 2차 가해로 불이익을 초래합니다<br/>
        • 억울한 지목의 경우에도 노동위원회 구제신청 등 법적 절차가 있습니다
      </div>
    </div></div>
    ${PRINT_FOOTER}
    </div>
    <script>window.onload = function() { try { window.print(); } catch(e){} }</script>
  </body></html>`;
}

// ── 산재 상담 필요성 체크 결과지 (상세) ────────────────────────────────────
export function generateSanjaePrintHtml(situation, medical, workCond, result) {
  const now = new Date().toLocaleString("ko-KR");
  const situationHtml = situation
    ? `<div class="card"><div style="font-size:12px"><strong>선택:</strong> ${situation.label}</div><div style="font-size:11px;color:#8B8680;margin-top:4px">유형: ${situation.tag}</div></div>`
    : `<div class="card" style="color:#8B8680">선택 없음</div>`;

  const medicalChecked = sanjaeMedicalOptions.filter(m => medical[m.id]);
  const medicalHtml = medicalChecked.length > 0
    ? medicalChecked.map(m => `<div style="padding:5px 0;font-size:12px">✅ ${m.label}</div>`).join("")
    : `<div style="color:#8B8680;font-size:12px">해당 없음</div>`;

  const workChecked = sanjaeWorkConditions.filter(w => workCond[w.id]);
  const workHtml = workChecked.length > 0
    ? workChecked.map(w => `<div style="padding:5px 0;font-size:12px">✅ ${w.label}</div>`).join("")
    : `<div style="color:#8B8680;font-size:12px">해당 없음</div>`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>산재 상담 필요성 체크 결과 - WIHAM 인사이드</title>${PRINT_STYLE}</head><body>
    <div style="max-width:780px;margin:0 auto;padding:32px;background:white;box-shadow:0 4px 20px rgba(10,22,40,0.06)">
    ${PRINT_HEADER}
    <div style="text-align:center;margin-bottom:24px">
      <h2>산재 상담 필요성 체크 결과 보고서</h2>
      <div style="font-size:11px;color:#8B8680">진단일시: ${now} | WIHAM 인사이드 자동 생성</div>
    </div>
    <div class="card" style="text-align:center;border-color:${result.recommend ? C.teal : C.gold};border-width:2px">
      <div style="font-size:32px;margin-bottom:8px">${result.emoji}</div>
      <h3 style="font-size:15px;margin-bottom:8px">${result.title}</h3>
      <p style="font-size:12px;color:#8B8680">${result.summary}</p>
    </div>
    <div class="section"><h2>1. 상황 분류</h2>${situationHtml}</div>
    <div class="section"><h2>2. 현재 의료·건강 상태</h2><div class="card">${medicalHtml}</div></div>
    <div class="section"><h2>3. 근무 환경</h2><div class="card">${workHtml}</div></div>
    <div class="section"><h2>4. 권고 조치</h2><div class="card">${result.actions.map((a,i) => `<div style="padding:7px 0"><strong style="color:${result.recommend ? C.teal : C.gold}">${i+1}.</strong> ${a}</div>`).join("")}</div></div>
    <div class="section"><h2>5. 관련 법령·기관</h2><div class="card"><table><tbody>
      ${[["근거 법령","산업재해보상보험법"],["심사 기관","근로복지공단"],["신청 시효","업무상 재해 발생일로부터 3년"],["불승인 시","심사청구 → 재심사청구 → 행정소송"]].map(([l,v]) => `<tr><td style="width:130px;font-weight:700">${l}</td><td>${v}</td></tr>`).join("")}
    </tbody></table></div></div>
    <div class="section"><h2>6. 유의사항</h2><div class="card" style="background:#FFF8E7">
      <div style="font-size:12px;color:#8B5A00;line-height:1.8">
        • 본 체크는 상담 필요성 판단용이며 <strong>산재 승인 가능성을 판단하지 않습니다</strong><br/>
        • 실제 승인 여부는 근로복지공단의 심사에 따라 결정됩니다<br/>
        • 정확한 승인 가능성은 전문 노무사 심층 상담을 권장합니다
      </div>
    </div></div>
    ${PRINT_FOOTER}
    </div>
    <script>window.onload = function() { try { window.print(); } catch(e){} }</script>
  </body></html>`;
}

// ── 사내 괴롭힘 조사 필요성 체크 결과지 (상세) ──────────────────────────────
export function generateCompanyPrintHtml(report, org, actions, result) {
  const now = new Date().toLocaleString("ko-KR");
  const reportChecked = companyReportStatus.filter(r => report[r.id]);
  const orgChecked = companyOrgStatus.filter(o => org[o.id]);
  const actionsChecked = companyCurrentActions.filter(a => actions[a.id]);

  const toList = (arr) => arr.length > 0
    ? arr.map(i => `<div style="padding:5px 0;font-size:12px">✅ ${i.label}</div>`).join("")
    : `<div style="color:#8B8680;font-size:12px">해당 없음</div>`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>사내 괴롭힘 조사 필요성 체크 결과 - WIHAM 인사이드</title>${PRINT_STYLE}</head><body>
    <div style="max-width:780px;margin:0 auto;padding:32px;background:white;box-shadow:0 4px 20px rgba(10,22,40,0.06)">
    ${PRINT_HEADER}
    <div style="text-align:center;margin-bottom:24px">
      <h2>사내 괴롭힘 조사 필요성 체크 결과 보고서</h2>
      <div style="font-size:11px;color:#8B8680">진단일시: ${now} | WIHAM 인사이드 자동 생성</div>
    </div>
    <div class="card" style="text-align:center;border-color:${result.color};border-width:2px">
      <div style="font-size:32px;margin-bottom:8px">${result.emoji}</div>
      <h3 style="font-size:15px;margin-bottom:8px">${result.title}</h3>
      <p style="font-size:12px;color:#8B8680">${result.summary}</p>
    </div>
    <div class="section"><h2>1. 신고·제보 접수 현황</h2><div class="card">${toList(reportChecked)}</div></div>
    <div class="section"><h2>2. 조직 상황</h2><div class="card">${toList(orgChecked)}</div></div>
    <div class="section"><h2>3. 현재 조치 상태</h2><div class="card">${toList(actionsChecked)}</div></div>
    <div class="section"><h2>4. 권고 조치</h2><div class="card" style="border-left:5px solid ${result.color};background:#FAFAF7">${result.actions.map((a,i) => `<div style="padding:10px 0;font-size:13px;display:flex;align-items:flex-start;gap:12px;border-bottom:${i<result.actions.length-1?'1px dashed #E8E5DE':'none'}"><span style="display:inline-block;flex-shrink:0;width:24px;height:24px;line-height:24px;text-align:center;border-radius:50%;background:${result.color};color:#fff;font-size:11px;font-weight:900">${i+1}</span><span style="flex:1;line-height:1.7">${a}</span></div>`).join("")}</div></div>
    <div class="section"><h2>5. 사업주 법적 의무</h2><div class="card"><table><tbody>
      ${[
        ["근거 법령","근로기준법 제76조의2·제76조의3"],
        ["조사 착수","신고 접수 후 지체 없이 (10일 내 권장)"],
        ["피해자 보호","조사 기간 중 분리·유급휴가 등"],
        ["비밀유지","위반 시 과태료 500만원 이하"],
        ["불리한 처우 금지","신고를 이유로 한 해고·전보 등 금지"],
        ["미조치 제재","사업주 과태료, 손해배상 책임"],
      ].map(([l,v]) => `<tr><td style="width:140px;font-weight:700">${l}</td><td>${v}</td></tr>`).join("")}
    </tbody></table></div></div>
    <div class="section"><h2>6. 유의사항</h2><div class="card" style="background:#FFF8E7">
      <div style="font-size:12px;color:#8B5A00;line-height:1.8">
        • 조사 절차의 법적 하자는 추후 분쟁 시 회사 측 불리 요인이 됩니다<br/>
        • 내부 조사자가 당사자와 이해관계가 있을 경우 외부 조사관 선임을 권장합니다<br/>
        • 조사보고서는 객관적 사실관계·증거·당사자 진술이 모두 담겨야 합니다<br/>
        • 징계 결정 시 양정·절차의 적법성이 중요합니다
      </div>
    </div></div>
    ${PRINT_FOOTER}
    </div>
    <script>window.onload = function() { try { window.print(); } catch(e){} }</script>
  </body></html>`;
}
