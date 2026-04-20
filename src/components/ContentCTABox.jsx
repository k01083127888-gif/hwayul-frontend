import { useState, useEffect } from "react";
import C from "../tokens/colors.js";
import { getCTASettings, getCTAMessage } from "../utils/CTASettings.js";

// ── 콘텐츠 본문 하단 인라인 CTA 박스 ──────────────────────────────────────
export function ContentCTABox({ item }) {
  const [settings, setSettings] = useState(() => getCTASettings());

  useEffect(() => {
    const handler = () => setSettings(getCTASettings());
    window.addEventListener("hwayul-cta-settings-changed", handler);
    return () => window.removeEventListener("hwayul-cta-settings-changed", handler);
  }, []);

  if (!settings.showInlineCTA) return null;

  const { headline, subtext } = getCTAMessage(item);

  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("hwayul-goto", { detail: "checklist" }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{
      background: "#FAF6EF",
      borderRadius: 14,
      border: `2px solid ${C.teal}22`,
      borderLeft: `5px solid ${C.teal}`,
      padding: "28px 32px",
      marginBottom: 28,
      boxShadow: "0 4px 20px rgba(13,115,119,0.08)",
      textAlign: "left",
    }}>
      {/* 헤드라인 */}
      <h3 style={{
        fontFamily: "'Noto Serif KR', Georgia, serif",
        fontWeight: 900,
        color: C.navy,
        fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)",
        lineHeight: 1.45,
        marginBottom: 10,
        letterSpacing: "-0.3px",
      }}>
        {headline}
      </h3>

      {/* 서브텍스트 */}
      <p style={{
        fontSize: 13,
        color: C.gray,
        lineHeight: 1.6,
        marginBottom: 20,
      }}>
        {subtext}
      </p>

      {/* CTA 버튼 */}
      <button
        onClick={handleClick}
        style={{
          padding: "14px 36px",
          borderRadius: 100,
          background: C.gold,
          color: C.navy,
          border: "none",
          fontWeight: 900,
          fontSize: 14,
          cursor: "pointer",
          fontFamily: "inherit",
          boxShadow: "0 4px 14px rgba(201,168,76,0.35)",
          transition: "all 0.25s",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 22px rgba(201,168,76,0.5)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "";
          e.currentTarget.style.boxShadow = "0 4px 14px rgba(201,168,76,0.35)";
        }}
      >
        🔍 무료 진단 시작 →
      </button>
    </div>
  );
}
