import { useEffect } from "react";

// 특정 meta 태그의 content 값을 세팅 (없으면 생성), 기존 값 반환
function setMeta(selector, attrName, attrValue, content) {
  let el = document.head.querySelector(selector);
  const prev = el ? el.getAttribute("content") : null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
  return prev;
}

// ── 페이지별 SEO/OG 메타 태그 동적 적용 훅 ──────────────────────────────
// 사용: usePageMeta({ title, description, url, image })
// - title: 브라우저 탭 제목 ("자가진단 | 화율인사이드" 등)
// - description: 페이지 설명 (160자 이내 권장)
// - url: 절대 URL (https://hwayul.kr/xxx)
// - image: (선택) og:image 절대 URL. 없으면 기본 og-image.png 사용
export function usePageMeta({ title, description, url, image = "https://hwayul.kr/og-image.png" }) {
  useEffect(() => {
    if (!title && !description && !url) return;
    const desc = (description || "").replace(/\s+/g, " ").trim().slice(0, 160);
    const prevTitle = document.title;
    const prevDesc = description ? setMeta('meta[name="description"]', "name", "description", desc) : null;
    const prevOgTitle = title ? setMeta('meta[property="og:title"]', "property", "og:title", title) : null;
    const prevOgDesc = description ? setMeta('meta[property="og:description"]', "property", "og:description", desc) : null;
    const prevOgUrl = url ? setMeta('meta[property="og:url"]', "property", "og:url", url) : null;
    const prevOgImage = image ? setMeta('meta[property="og:image"]', "property", "og:image", image) : null;
    const prevTwTitle = title ? setMeta('meta[name="twitter:title"]', "name", "twitter:title", title) : null;
    const prevTwDesc = description ? setMeta('meta[name="twitter:description"]', "name", "twitter:description", desc) : null;
    const prevTwImage = image ? setMeta('meta[name="twitter:image"]', "name", "twitter:image", image) : null;
    if (title) document.title = title;

    return () => {
      document.title = prevTitle;
      if (prevDesc !== null) setMeta('meta[name="description"]', "name", "description", prevDesc);
      if (prevOgTitle !== null) setMeta('meta[property="og:title"]', "property", "og:title", prevOgTitle);
      if (prevOgDesc !== null) setMeta('meta[property="og:description"]', "property", "og:description", prevOgDesc);
      if (prevOgUrl !== null) setMeta('meta[property="og:url"]', "property", "og:url", prevOgUrl);
      if (prevOgImage !== null) setMeta('meta[property="og:image"]', "property", "og:image", prevOgImage);
      if (prevTwTitle !== null) setMeta('meta[name="twitter:title"]', "name", "twitter:title", prevTwTitle);
      if (prevTwDesc !== null) setMeta('meta[name="twitter:description"]', "name", "twitter:description", prevTwDesc);
      if (prevTwImage !== null) setMeta('meta[name="twitter:image"]', "name", "twitter:image", prevTwImage);
    };
  }, [title, description, url, image]);
}
