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
      position: "relative",
      background: `linear-gradient(135deg, ${C.teal} 0%, ${C.navy} 100%)`,
      borderRadius: 16,
      padding: "36px 32px",
      marginBottom: 28,
      boxShadow: "0 8px 32px rgba(13,115,119,0.25)",
      overflow: "hidden",
      textAlign: "center",
    }}>
      {/* 장식: 우상단 원형 배경 */}
      <div style={{
        position: "absolute",
        top: -60,
        right: -60,
        width: 220,
        height: 220,
        borderRadius: "50%",
        background: "rgba(201,168,76,0.22)",
        filter: "blur(20px)",
        pointerEvents: "none",
      }} />
      {/* 장식: 좌하단 원형 배경 */}
      <div style={{
        position: "absolute",
        bottom: -80,
        left: -80,
        width: 240,
        height: 240,
        borderRadius: "50%",
        background: "rgba(201,168,76,0.15)",
        filter: "blur(24px)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* 상단 라벨 */}
        <div style={{
          fontSize: 11,
          letterSpacing: "3px",
          color: C.gold,
          fontWeight: 800,
          textTransform: "uppercase",
          marginBottom: 14,
        }}>
          ✨ 무료 AI 진단
        </div>

        {/* 헤드라인 */}
        <h3 style={{
          fontFamily: "'Noto Serif KR', Georgia, serif",
          fontWeight: 900,
          color: "white",
          fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)",
          lineHeight: 1.4,
          marginBottom: 14,
          letterSpacing: "-0.5px",
        }}>
          {headline}
        </h3>

        {/* 서브텍스트 */}
        <p style={{
          fontSize: 14,
          color: "rgba(255,255,255,0.85)",
          lineHeight: 1.7,
          marginBottom: 22,
        }}>
          {subtext}
        </p>

        {/* 혜택 3가지 */}
        <div style={{
          display: "flex",
          gap: 16,
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: 26,
        }}>
          {["✅ 괴롭힘 해당 여부", "✅ 증거 수집 방법", "✅ 다음 행동 가이드"].map(b => (
            <span key={b} style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.92)",
              fontWeight: 600,
            }}>{b}</span>
          ))}
        </div>

        {/* CTA 버튼 */}
        <button
          onClick={handleClick}
          style={{
            padding: "16px 40px",
            borderRadius: 100,
            background: C.gold,
            color: C.navy,
            border: "none",
            fontWeight: 900,
            fontSize: 15,
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 4px 16px rgba(201,168,76,0.35)",
            transition: "all 0.25s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(201,168,76,0.5)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "";
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(201,168,76,0.35)";
          }}
        >
          🔍 3분 무료 AI 진단 시작하기 →
        </button>

        {/* 보조문구 */}
        <div style={{
          marginTop: 16,
          fontSize: 11,
          color: "rgba(255,255,255,0.55)",
          letterSpacing: "0.3px",
        }}>
          · 개인정보 입력 없이 바로 시작 · 결과는 즉시 확인 가능 ·
        </div>
      </div>
    </div>
  );
}
