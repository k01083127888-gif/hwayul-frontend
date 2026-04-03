import C from "../tokens/colors.js";

export function DifferentiationSection({ setActive }) {
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
        }}>WHY HWAYUL INSIDE</div>

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
          marginBottom: 40,
        }}>
          <strong style={{ color: "rgba(244,241,235,0.8)" }}>일반 AI</strong>에 물어보면 "일반적인 답"이 나옵니다.<br />
          화율인사이드는 <strong style={{ color: "rgba(244,241,235,0.8)" }}>실제 판결문을 근거로</strong> 답합니다.
        </p>

        {/* 3개 카드 */}
        <div className="hero-cta-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 18,
          marginBottom: 40,
          maxWidth: 900,
          marginLeft: "auto",
          marginRight: "auto",
        }}>
          {[
            {
              icon: "⚖️",
              num: "1,000건+",
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
        }}>일반 AI vs 화율인사이드</div>

        {/* 비교 테이블 */}
        <div className="content-grid-2col" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          maxWidth: 750,
          marginLeft: "auto",
          marginRight: "auto",
          marginBottom: 32,
          textAlign: "left",
        }}>
          {/* 일반 AI */}
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.04)",
            borderRadius: 12,
            padding: "20px 22px",
          }}>
            <div style={{
              fontSize: 13,
              fontWeight: 700,
              color: "rgba(244,241,235,0.35)",
              marginBottom: 14,
            }}>● 일반 AI</div>
            {[
              "일반적인 법률 지식으로 답변",
              "한국 판례를 모르거나 부정확",
              "현장 경험 없는 교과서적 답변",
              "\"변호사와 상담하세요\"로 끝남",
            ].map((t, i) => (
              <div key={i} style={{
                fontSize: 13,
                color: "rgba(244,241,235,0.35)",
                lineHeight: 2.2,
                paddingLeft: 16,
                position: "relative",
              }}>
                <span style={{
                  position: "absolute",
                  left: 0,
                  top: 10,
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "rgba(244,241,235,0.15)",
                  display: "inline-block",
                }} />
                {t}
              </div>
            ))}
          </div>

          {/* 화율인사이드 */}
          <div style={{
            background: "rgba(201,168,76,0.05)",
            border: `1px solid rgba(201,168,76,0.18)`,
            borderRadius: 12,
            padding: "20px 22px",
          }}>
            <div style={{
              fontSize: 13,
              fontWeight: 700,
              color: C.gold,
              marginBottom: 14,
            }}>★ 화율인사이드</div>
            {[
              "1,000건+ 실제 판례 기반 답변",
              "한국 법원 판결문 직접 분석",
              "20년 노무사 현장 경험 반영",
              "구체적 대응 방향 + 판례 근거 제시",
            ].map((t, i) => (
              <div key={i} style={{
                fontSize: 13,
                color: "rgba(244,241,235,0.65)",
                lineHeight: 2.2,
                paddingLeft: 16,
                position: "relative",
              }}>
                <span style={{
                  position: "absolute",
                  left: 0,
                  top: 10,
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: C.gold,
                  display: "inline-block",
                }} />
                {t}
              </div>
            ))}
          </div>
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
