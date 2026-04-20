import { useState, useEffect } from "react";
import C from "../tokens/colors.js";
import { getCTASettings } from "../utils/CTASettings.js";

// ── 콘텐츠 상세 페이지 스크롤 50%+ 노출 고정 배너 ────────────────────────
const CONTENT_DETAIL_REGEX = /^\/content\/\d+$/;

export function StickyScrollCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [settings, setSettings] = useState(() => getCTASettings());
  const [isContentDetail, setIsContentDetail] = useState(
    () => CONTENT_DETAIL_REGEX.test(window.location.pathname)
  );

  // 설정 변경 구독
  useEffect(() => {
    const handler = () => setSettings(getCTASettings());
    window.addEventListener("hwayul-cta-settings-changed", handler);
    return () => window.removeEventListener("hwayul-cta-settings-changed", handler);
  }, []);

  // 경로 변경 시 상태 초기화 (popstate 대응)
  useEffect(() => {
    const handler = () => {
      setIsContentDetail(CONTENT_DETAIL_REGEX.test(window.location.pathname));
      setDismissed(false);
      setVisible(false);
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  // 스크롤 감지 (50% 이상)
  useEffect(() => {
    if (!isContentDetail) return;
    const onScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setVisible(pct >= 50);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [isContentDetail]);

  if (!settings.showStickyCTA) return null;
  if (!isContentDetail) return null;
  if (dismissed) return null;
  if (!visible) return null;

  const handleGoto = () => {
    window.dispatchEvent(new CustomEvent("hwayul-goto", { detail: "checklist" }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        @keyframes hwayul-sticky-slide-up {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9998,
          width: "calc(100% - 32px)",
          maxWidth: 560,
          background: `linear-gradient(135deg, ${C.teal} 0%, ${C.navy} 100%)`,
          borderRadius: 14,
          padding: "14px 16px",
          boxShadow: "0 12px 40px rgba(10,22,40,0.35)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          animation: "hwayul-sticky-slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* 아이콘 */}
        <div style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: C.gold,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          flexShrink: 0,
        }}>🔍</div>

        {/* 텍스트 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "white", lineHeight: 1.3, marginBottom: 2 }}>
            지금 당신의 상황은?
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", lineHeight: 1.4 }}>
            3분 무료 AI 진단받기
          </div>
        </div>

        {/* CTA 버튼 */}
        <button
          onClick={handleGoto}
          style={{
            padding: "9px 16px",
            borderRadius: 100,
            background: C.gold,
            color: C.navy,
            border: "none",
            fontWeight: 800,
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          진단 →
        </button>

        {/* 닫기 버튼 */}
        <button
          onClick={() => setDismissed(true)}
          aria-label="닫기"
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            border: "none",
            color: "white",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >✕</button>
      </div>
    </>
  );
}
