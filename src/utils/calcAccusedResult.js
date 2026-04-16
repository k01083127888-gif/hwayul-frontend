import C from "../tokens/colors.js";
import { accusedBehaviorCategories, accusedImpactItems } from "../data/accusedChecklistData.js";

// ── 피지목인 자가진단 결과 계산 ──────────────────────────────────────────
export function calcAccusedResult(relation, superiority, behavior, justification, repetition, impact) {
  // 1. 관계 우위 점수
  const relScore = Object.values(relation).reduce((s, w) => s + (w || 0), 0);
  const supScore = Object.values(superiority).reduce((s, w) => s + (w || 0), 0);
  const positionScore = Math.min(relScore + supScore, 10); // 최대 10점

  // 2. 행위 점수
  let behaviorScore = 0;
  let behaviorCount = 0;
  accusedBehaviorCategories.forEach(cat => cat.items.forEach(item => {
    if (behavior[item.id]) {
      behaviorScore += item.weight;
      behaviorCount++;
    }
  }));

  // 3. 업무 적정성 점수 (높을수록 정당성 부족)
  const justScore = Object.values(justification).reduce((s, w) => s + (w || 0), 0);

  // 4. 반복성 점수
  const repScore = Object.values(repetition).reduce((s, w) => s + (w || 0), 0);

  // 5. 영향도 점수
  let impactScore = 0;
  accusedImpactItems.forEach(item => {
    if (impact[item.id] && item.weight > 0) impactScore += item.weight;
  });

  const total = behaviorScore + justScore + repScore + impactScore;

  // 해당 행위 카테고리
  const hitCats = accusedBehaviorCategories.filter(cat => cat.items.some(i => behavior[i.id]));

  let level, color, emoji, title, summary, actions;

  if (behaviorCount === 0 || (total <= 4 && positionScore <= 2)) {
    level = "성립 가능성 낮음";
    color = C.green;
    emoji = "✅";
    title = "현 시점 괴롭힘 성립 가능성이 낮습니다";
    summary = "해당 행위가 업무상 적정범위 내에 있거나, 우위를 이용한 행위로 보기 어려울 수 있습니다. 다만 상대방이 다르게 느꼈을 수 있으므로, 소통 방식에 주의를 기울이시길 권합니다.";
    actions = [
      "상대방과의 소통 방식 점검",
      "조직문화 관점에서 셀프 리뷰",
      "필요 시 상대방에게 의도 설명",
    ];
  } else if (total <= 10 && justScore <= 3) {
    level = "주의 단계 — 일부 요소 해당";
    color = "#F0B429";
    emoji = "⚠️";
    title = "일부 행위가 괴롭힘으로 볼 수 있는 여지가 있습니다";
    summary = "업무상 필요에 의한 행위였더라도, 방식이나 정도가 과도했을 수 있습니다. 지금부터 행동을 개선하면 상황 악화를 방지할 수 있습니다. 조사가 진행 중이라면 전문가 자문을 권장합니다.";
    actions = [
      "해당 행동 즉시 중단 또는 방식 개선",
      "상대방의 입장에서 상황 돌아보기",
      "조사 대비 심층 상담(22만원) 검토",
      "향후 업무지시는 서면(메일 등)으로 기록",
    ];
  } else if (total <= 18) {
    level = "중위험 — 성립 가능성 높음";
    color = C.orange;
    emoji = "🔶";
    title = "괴롭힘으로 인정될 가능성이 높습니다";
    summary = "행위의 유형·반복성·영향도를 종합하면 괴롭힘 성립 요건을 상당 부분 충족할 수 있습니다. 조사 진행 시 소명 전략이 필요하며, 징계 대응 준비를 병행하시기 바랍니다.";
    actions = [
      "전문 노무사 심층 상담 즉시 권장",
      "경위의견서 작성 준비 (사실관계 정리)",
      "진술 전 유의사항 확인",
      "징계 시 노동위원회 구제신청 가능 여부 검토",
    ];
  } else {
    level = "고위험 — 성립 가능성 매우 높음";
    color = C.red;
    emoji = "🚨";
    title = "괴롭힘으로 인정될 가능성이 매우 높습니다";
    summary = "복수의 행위유형에서 높은 점수가 확인되며, 상대방에게 실질적 피해가 발생한 것으로 보입니다. 징계·민사·형사 리스크가 있으므로 즉시 전문가 상담이 필요합니다.";
    actions = [
      "전문 노무사 긴급 상담 (즉시)",
      "해당 행동 즉시 중단",
      "경위의견서 작성 및 소명 자료 준비",
      "징계 통보 시 대응 전략 수립",
      "민·형사 리스크 검토 (해결 의뢰 트랙2)",
    ];
  }

  return {
    level, color, emoji, title, summary, actions,
    positionScore, behaviorScore, behaviorCount, justScore, repScore, impactScore, total,
    hitCats,
  };
}
