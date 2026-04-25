import C from "../tokens/colors.js";
import { useCaseCount } from "../utils/useCaseCount.js";

export function DifferentiationSection({ setActive }) {
  const { label: caseCountLabel } = useCaseCount();
  return (
    <section style={{
      background: C.navy,
      padding: "80px 32px",
      borderTop: "1px solid rgba(201,168,76,0.12)",
      borderBottom: "1px solid rgba(201,168,76,0.12)",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>

        {/* 뱃지 */}
        <div style={{
          display: "inline-block",
          fontSize: 11,
          color: C.gold,
          border: `1px solid rgba(201,168,76,0.3)`,
          padding: "4px 16px",
          borderRadius: 20,
          marginBottom: 14,
          letterSpacing: "1px",
        }}>WHAT MAKES US DIFFERENT</div>

        {/* 소제목 */}
        <div style={{
          fontSize: 12,
          color: C.gold,
          letterSpacing: "3px",
          marginBottom: 8,
        }}>WHY WIHAM INSIDE LABS</div>

        {/* 메인 타이틀 */}
        <h2 style={{
          fontFamily: "'Noto Serif KR', serif",
          fontSize: "clamp(24px, 4vw, 36px)",
          fontWeight: 800,
          color: "#fff",
          marginBottom: 8,
          lineHeight: 1.3,
        }}>
          일반 AI와는 <span style={{ color: C.gold }}>차원이 다릅니다</span>
        </h2>

        {/* 설명 */}
        <p style={{
          fontSize: "clamp(13px, 2vw, 16px)",
          color: "rgba(244,241,235,0.55)",
          lineHeight: 1.8,
          marginBottom: 32,
        }}>
          <strong style={{ color: "rgba(244,241,235,0.8)" }}>일반 AI</strong>에 물어보면 "일반적인 답"이 나옵니다.<br />
          WIHAM 인사이드는 <strong style={{ color: "rgba(244,241,235,0.8)" }}>실제 판결문을 근거로</strong> 답합니다.
        </p>

        {/* ★ NEW: 강화 카피 박스 ★ */}
        <div style={{
          background: "rgba(201,168,76,0.06)",
          border: `1px solid rgba(201,168,76,0.3)`,
          borderRadius: 14,
          padding: "26px 24px",
          maxWidth: 760,
          marginLeft: "auto",
          marginRight: "auto",
          marginBottom: 40,
        }}>
          <div style={{
            fontFamily: "'Noto Serif KR', serif",
            fontSize: "clamp(15px, 2.2vw, 19px)",
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.6,
            marginBottom: 18,
          }}>
            "일반 AI가 모르는 <span style={{ color: C.gold }}>{caseCountLabel}의 진짜 판례</span>,<br />
            <span style={{ color: C.gold }}>20년 노무 전문가</span>가 직접 분석했습니다"
          </div>
          <div className="form-grid-2" style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px 24px",
            maxWidth: 580,
            margin: "0 auto",
            textAlign: "left",
          }}>
            {[
              { strong: `${caseCountLabel}의 실제 법원 판례`, desc: "사건번호까지 인용해서 답변" },
              { strong: "20년 경력 노무사가 직접 분석", desc: "단순 데이터가 아닌 전문가의 해석" },
              { strong: "직장 내 괴롭힘 특화", desc: "폭언·해고·산재·성희롱 모든 분야 커버" },
              { strong: "사실관계 기반 매칭", desc: "당신의 상황과 가장 비슷한 판례를 찾아줌" },
            ].map((item, i) => (
              <div key={i} style={{ fontSize: 12, lineHeight: 1.5 }}>
                <span style={{ color: C.gold, marginRight: 6 }}>✓</span>
                <span style={{ color: "rgba(244,241,235,0.85)", fontWeight: 600 }}>{item.strong}</span>
                <div style={{ color: "rgba(244,241,235,0.4)", fontSize: 11, marginLeft: 16, marginTop: 2 }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3개 카드 */}
        <div className="hero-cta-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 18,
          marginBottom: 48,
          maxWidth: 900,
          marginLeft: "auto",
          marginRight: "auto",
        }}>
          {[
            {
              icon: "⚖️",
              num: caseCountLabel,
              label: "판례 데이터베이스",
              desc: "직장내 괴롭힘과 그로 인한\n부당해고, 산재 실제 법원\n판결문을 AI가 분석·학습",
            },
            {
              icon: "💼",
              num: "20년",
              label: "노무 현장 경력",
              desc: "교과서가 아닌 현장에서 쌓은\n실전 경험이 AI의 판단 기준",
            },
            {
              icon: "🔍",
              num: "판례 기반",
              label: "근거 있는 답변",
              desc: "추측이 아닌 실제 판결 결과를\n근거로 상담 방향을 제시",
            },
          ].map((item, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14,
              padding: "28px 16px",
              textAlign: "center",
              transition: "border-color 0.3s",
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}
            >
              <div style={{ fontSize: 28, marginBottom: 14 }}>{item.icon}</div>
              <div style={{
                fontSize: "clamp(22px, 3vw, 30px)",
                fontWeight: 800,
                color: C.gold,
                marginBottom: 4,
              }}>{item.num}</div>
              <div style={{
                fontSize: 13,
                color: "rgba(244,241,235,0.7)",
                fontWeight: 600,
                marginBottom: 12,
              }}>{item.label}</div>
              <div style={{
                fontSize: 12,
                color: "rgba(244,241,235,0.35)",
                lineHeight: 1.7,
                whiteSpace: "pre-line",
              }}>{item.desc}</div>
            </div>
          ))}
        </div>

        {/* 비교 테이블 제목 */}
        <div style={{
          fontSize: 14,
          color: "rgba(244,241,235,0.4)",
          marginBottom: 16,
        }}>일반 AI vs WIHAM 인사이드</div>

        {/* ★ NEW: 5행 비교표 ★ */}
        <div style={{
          maxWidth: 820,
          marginLeft: "auto",
          marginRight: "auto",
          marginBottom: 40,
          background: "rgba(255,255,255,0.02)",
          border: `1px solid rgba(201,168,76,0.25)`,
          borderRadius: 14,
          overflow: "hidden",
        }}>
          {/* 헤더 행 */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1.3fr 1fr 1.5fr",
            background: "rgba(201,168,76,0.1)",
            padding: "14px 18px",
            fontSize: 13,
            fontWeight: 700,
            textAlign: "center",
          }}>
            <div style={{ color: C.gold, textAlign: "left" }}>구분</div>
            <div style={{ color: "rgba(244,241,235,0.5)" }}>일반 AI</div>
            <div style={{ color: C.gold }}>WIHAM 인사이드 AI</div>
          </div>

          {/* 데이터 행 */}
          {[
            { label: "답변 근거", general: "일반 상식", hwayul: `실제 법원 판례 ${caseCountLabel}`, icon: false },
            { label: "사건번호 인용", general: "✕", hwayul: "✓ 정확한 사건번호", icon: true },
            { label: "전문가 분석", general: "✕", hwayul: "✓ 20년 경력 노무사", icon: true },
            { label: "직장내 괴롭힘 특화", general: "✕", hwayul: "✓ 전문 플랫폼", icon: true },
            { label: "한국 노동법", general: "일반 정보", hwayul: "판례 기반 정확한 답변", icon: false },
          ].map((row, i) => (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: "1.3fr 1fr 1.5fr",
              padding: "14px 18px",
              fontSize: 13,
              borderTop: "1px solid rgba(201,168,76,0.1)",
              textAlign: "center",
              alignItems: "center",
            }}>
              <div style={{ color: "rgba(244,241,235,0.85)", textAlign: "left", fontWeight: 600 }}>
                {row.label}
              </div>
              <div style={{
                color: row.icon ? "#e57373" : "rgba(244,241,235,0.4)",
                fontSize: row.icon ? 16 : 13,
                fontWeight: row.icon ? 700 : 400,
              }}>
                {row.general}
              </div>
              <div style={{
                color: row.icon ? "#7fc99e" : "rgba(244,241,235,0.85)",
                fontWeight: 600,
              }}>
                {row.hwayul}
              </div>
            </div>
          ))}
        </div>

        {/* CTA 버튼 */}
        <button
          onClick={() => setActive("checklist")}
          style={{
            background: C.gold,
            color: C.navy,
            fontSize: 15,
            fontWeight: 700,
            padding: "14px 40px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            letterSpacing: "0.5px",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          무료 AI 상담 시작하기 →
        </button>
      </div>
    </section>
  );
}
