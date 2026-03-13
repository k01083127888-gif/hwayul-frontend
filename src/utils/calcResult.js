import C from "../tokens/colors.js";
import { prerequisiteItems, behaviorCategories, impactItems, continuityOptions } from "../data/checklistData.js";

// ── 진단 결과 계산 ──────────────────────────────────────────────────────────
export function calcResult(prereq, behavior, impact, continuity) {
  const prereqMet = prerequisiteItems.filter(p => prereq[p.id]).length;
  let behaviorScore = 0, highHit = false;
  behaviorCategories.forEach(cat => cat.items.forEach(item => {
    if (behavior[item.id]) { behaviorScore += item.weight; if (cat.severity === "high") highHit = true; }
  }));
  let impactScore = 0;
  impactItems.forEach(cat => cat.items.forEach(item => { if (impact[item.id]) impactScore += item.weight; }));
  const contScore = continuity ? (continuityOptions.find(c => c.id === continuity)?.score || 0) : 0;
  const total = behaviorScore + impactScore + contScore;
  const hitCats = behaviorCategories.filter(cat => cat.items.some(i => behavior[i.id]));

  let level, color, emoji, title, summary, actions;
  if (prereqMet < 2 && behaviorScore < 3) {
    level="성립 가능성 낮음"; color=C.green; emoji="✅";
    title="현 시점 직장내 괴롭힘 성립 가능성이 낮습니다";
    summary="근로기준법상 3대 요건 중 일부를 충족하지 않거나, 행위 강도가 법적 기준에 미달할 수 있습니다. 상황이 지속된다면 재진단을 권장합니다.";
    actions=["지속 모니터링 권장", "예방 교육 참여", "사내 고충처리 채널 확인"];
  } else if (total <= 8 && !highHit) {
    level="주의 단계"; color="#F0B429"; emoji="⚠️";
    title="직장내 괴롭힘 가능성이 있으며 주의가 필요합니다";
    summary="일부 요건이 충족되고 피해 행위가 확인됩니다. 전문가 상담을 통해 법적 성립 여부를 파악하고 증거 확보를 시작할 것을 권장합니다.";
    actions=["노무사 무료 초기 상담", "증거 수집 시작 (일시·내용 기록)", "사내 고충상담원 접촉"];
  } else if (total <= 16 || (prereqMet >= 2 && !highHit)) {
    level="중위험 — 성립 가능성 높음"; color=C.orange; emoji="🔶";
    title="직장내 괴롭힘 성립 가능성이 높습니다";
    summary="3대 요건 대부분을 충족하며 복수의 행위유형과 피해 영향이 확인됩니다. 고용노동부 진정 또는 사내 공식 신고를 통한 조사 개시를 검토하시기 바랍니다.";
    actions=["전문 노무사 즉시 상담", "사내 신고 또는 고용노동부 진정 검토", "증거자료 체계적 보관", "심리상담 연계 권장"];
  } else {
    level="고위험 — 즉각 개입 필요"; color=C.red; emoji="🚨";
    title="직장내 괴롭힘이 명백히 성립될 가능성이 매우 높습니다";
    summary="신체적·정신적 공격 등 중대 행위가 포함되어 있으며 피해 영향도도 심각합니다. 즉각적인 법적 보호 조치와 전문가 개입이 필요합니다.";
    actions=["노무사 긴급 상담 (당일)", "고용노동부 온라인 진정 즉시 제출", "피해 근무 분리 요청 (사업주 의무)", "의료·심리 치료 기록 확보", "형사고소 가능 여부 검토 (폭행·모욕죄)"];
  }
  return { level, color, emoji, title, summary, actions, prereqMet, behaviorScore, impactScore, total, hitCats, highHit };
}
