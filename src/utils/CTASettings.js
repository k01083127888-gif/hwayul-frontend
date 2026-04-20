// ── CTA 설정 관리 유틸 ─────────────────────────────────────────────────────
// localStorage 기반 CTA 표시 설정 (인라인 박스, 스티키 배너)
// 설정 변경 시 "hwayul-cta-settings-changed" 커스텀 이벤트로 전역 구독 가능

const STORAGE_KEY = "hwayul_cta_settings";
const DEFAULTS = { showInlineCTA: true, showStickyCTA: true };

// 설정 불러오기 (실패 시 기본값 반환)
export function getCTASettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}

// 설정 저장 + 커스텀 이벤트 발생
export function setCTASettings(settings) {
  try {
    const merged = { ...getCTASettings(), ...settings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent("hwayul-cta-settings-changed", { detail: merged }));
    return merged;
  } catch {
    return getCTASettings();
  }
}

// 콘텐츠 item의 type/tag에 따라 맞춤 CTA 메시지 반환
// 반환: { headline, subtext }
export function getCTAMessage(item) {
  if (!item) {
    return {
      headline: "지금 당신의 상황은 어떤가요?",
      subtext: "3분 무료 AI 진단으로 내 상황을 정확히 확인하세요",
    };
  }

  const tag = item.tag || "";
  const type = item.type || "";

  // 1) 산재 관련 (태그 기반)
  if (tag === "산재사례" || tag === "산재통계" || tag === "산재") {
    return {
      headline: "산재로 인정받을 수 있을까?",
      subtext: "당신의 상황, 3분 만에 산재 해당 여부를 확인하세요",
    };
  }

  // 2) 판례
  if (tag === "판례") {
    return {
      headline: "혹시 비슷한 상황이신가요?",
      subtext: "당신의 고통도 법적 근거가 됩니다. 3분 무료 진단으로 확인하세요",
    };
  }

  // 3) 칼럼 (type 또는 tag)
  if (type === "column" || tag === "칼럼") {
    return {
      headline: "당신의 고민도 법적으로 인정될 수 있습니다",
      subtext: "3분 무료 AI 진단으로 지금 당장 확인해보세요",
    };
  }

  // 4) 영상
  if (type === "video") {
    return {
      headline: "실제 내 상황은 어떨까?",
      subtext: "영상 내용이 내 상황과 비슷한지, 3분 진단으로 확인하세요",
    };
  }

  // 5) 뉴스
  if (type === "news") {
    return {
      headline: "이 뉴스, 남의 일 같지 않으신가요?",
      subtext: "당신의 상황도 법적 근거가 될 수 있습니다. 무료 진단받기",
    };
  }

  // 6) 자료
  if (type === "resource") {
    return {
      headline: "자료만 보고 끝내지 마세요",
      subtext: "당신의 실제 상황은 어떤지, 3분 무료 진단으로 확인하세요",
    };
  }

  // 기본값
  return {
    headline: "지금 당신의 상황은 어떤가요?",
    subtext: "3분 무료 AI 진단으로 내 상황을 정확히 확인하세요",
  };
}
