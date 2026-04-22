import { useState, useEffect } from "react";
import C from "../tokens/colors.js";
import { getCTASettings, getCTAMessage } from "../utils/CTASettings.js";

// ── 콘텐츠 본문 하단 인라인 CTA 박스 ──────────────────────────────────────
export function ContentCTABox({ item }) {
  const [settings, setSettings] = useState(() => getCTASettings());
  const [attachThis, setAttachThis] = useState(true); // 기본값 체크 (이 사례 참조)

  useEffect(() => {
    const handler = () => setSettings(getCTASettings());
    window.addEventListener("hwayul-cta-settings-changed", handler);
    return () => window.removeEventListener("hwayul-cta-settings-changed", handler);
  }, []);

  if (!settings.showInlineCTA) return null;

  const { headline, subtext } = getCTAMessage(item);

  const handleClick = () => {
    // 이 사례를 참조하게 할지 선택 — 30분 TTL localStorage 플래그
    try {
      if (attachThis && item?.id) {
        localStorage.setItem("hwayul_attach_content", JSON.stringify({
          id: item.id,
          title: item.title || "",
          expiresAt: Date.now() + 30 * 60 * 1000,
        }));
      } else {
        localStorage.removeItem("hwayul_attach_content");
      }
    } catch {}
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
        marginBottom: 22,
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

      {/* 이 사례를 참조하여 상담받기 옵션 */}
      {item?.id && (
        <label style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          padding: "12px 14px",
          background: "white",
          border: `1.5px solid ${attachThis ? C.teal : "rgba(10,22,40,0.12)"}`,
          borderRadius: 10,
          cursor: "pointer",
          marginBottom: 16,
          transition: "border-color 0.15s",
        }}>
          <input
            type="checkbox"
            checked={attachThis}
            onChange={e => setAttachThis(e.target.checked)}
            style={{ width: 16, height: 16, marginTop: 2, accentColor: C.teal, cursor: "pointer", flexShrink: 0 }}
          />
          <div style={{ lineHeight: 1.55 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, marginBottom: 2 }}>
              진단 후 상담 시 이 사례를 함께 참조하기
            </div>
            <div style={{ fontSize: 11.5, color: C.gray }}>
              체크하시면 체크리스트 결과와 함께 「{(item.title || "").slice(0, 28)}{(item.title || "").length > 28 ? "…" : ""}」 내용을 상담에 반영합니다. 내 상황과 다르다 싶으면 체크를 해제하세요.
            </div>
          </div>
        </label>
      )}

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
