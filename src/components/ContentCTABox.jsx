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

      {/* 혜택 체크리스트 3개 */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 14,
        marginTop: 4,
        marginBottom: 18,
      }}>
        {["괴롭힘 해당 여부", "증거 수집 방법", "다음 행동 가이드"].map(label => (
          <span key={label} style={{
            fontSize: 12,
            color: C.navy,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "6px 12px",
            borderRadius: 100,
            background: "rgba(13,115,119,0.08)",
            border: "1px solid rgba(13,115,119,0.15)",
            whiteSpace: "nowrap",
          }}>
            <span style={{ color: C.teal, fontWeight: 900 }}>✓</span>
            <span>{label}</span>
          </span>
        ))}
      </div>

      {/* 진단 이용 안내 — 분류 선택 + 상세 작성 권장 */}
      <div style={{
        background: "white",
        border: "1px solid rgba(13,115,119,0.18)",
        borderRadius: 10,
        padding: "14px 18px",
        marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: C.teal, letterSpacing: "0.5px" }}>
            💡 진단을 정확히 받으시려면
          </span>
        </div>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 12.5, color: C.navy, lineHeight: 1.75 }}>
          <li style={{ marginBottom: 6 }}>
            상단 <strong style={{ color: C.teal }}>분류 탭</strong>을 먼저 선택하세요 —
            <span style={{ color: C.gray, marginLeft: 4 }}>
              😣 피해자 · 😥 피지목인 · 🩹 산재 · 🏛 사내조사 중 본인 상황에 맞는 것
            </span>
          </li>
          <li style={{ marginBottom: 6 }}>
            상담 내용은 <strong style={{ color: C.teal }}>구체적으로</strong> 작성해 주세요 —
            <span style={{ color: C.gray, marginLeft: 4 }}>
              언제·누가·어떤 행위·얼마나 반복되었는지 상세할수록 정확한 답변
            </span>
          </li>
          <li>
            <strong style={{ color: C.navy }}>판례 1,300건 + 실무 해설·칼럼</strong>을 근거로
            <span style={{ color: C.gray, marginLeft: 4 }}>
              AI가 사건번호를 인용하며 답변드립니다
            </span>
          </li>
        </ol>
      </div>

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
