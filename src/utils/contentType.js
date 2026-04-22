import C from "../tokens/colors.js";

// ── 콘텐츠 5개 카테고리 ───────────────────────────────────────────────
// id: DB의 type 컬럼 값으로도 사용
// label: 화면 노출 라벨 (필터 탭/배지/옵션)
// icon: 이모지
// color: 테마 컬러
export const CONTENT_TYPES = [
  { id: "case",     label: "판례사례",  icon: "⚖️", color: C.teal },
  { id: "sanjae",   label: "산재사례",  icon: "🏥", color: "#1A7A4A" },
  { id: "news",     label: "뉴스",      icon: "📰", color: C.blue },
  { id: "resource", label: "자료",      icon: "📎", color: C.gold },
  { id: "column",   label: "칼럼",      icon: "✏️", color: C.purple },
];

// 빠른 조회용 맵
export const CONTENT_TYPE_MAP = CONTENT_TYPES.reduce((acc, t) => { acc[t.id] = t; return acc; }, {});

// ── 기존 DB 값을 신규 카테고리로 자동 매핑 ─────────────────────────
// DB에 아직 남아 있는 레거시 type 값(news/video/resource/column)과 기타 tag를
// 5개 카테고리로 자동 정규화한다. 실제 DB 값은 건드리지 않고 표시에만 사용.
export function normalizeContentType(item) {
  if (!item) return "news";
  const type = (item.type || "").toLowerCase();

  // 이미 신규 카테고리면 그대로
  if (type === "case" || type === "sanjae" || type === "news" || type === "resource" || type === "column") {
    // news 중에서도 tag에 판례/산재가 있으면 재분류
    if (type === "news") {
      const tag = (item.tag || "").toLowerCase();
      if (tag.includes("판례")) return "case";
      if (tag.includes("산재")) return "sanjae";
      return "news";
    }
    return type;
  }

  // 레거시: video → resource 로 흡수 (교육영상 카테고리 제거)
  if (type === "video") return "resource";

  return "news"; // fallback
}

// 편의 getter
export const getContentTypeMeta = (item) => CONTENT_TYPE_MAP[normalizeContentType(item)] || CONTENT_TYPE_MAP.news;
