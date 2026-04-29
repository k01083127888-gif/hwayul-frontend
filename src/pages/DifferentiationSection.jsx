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

        {/* 비교 테이블 제목 — 차별점 증명을 먼저 보여주고, 그 다음에 이용 흐름 안내 */}
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

        {/* 3단계 이용 가이드 카드 — 비교표(차별점)를 본 사용자가 그래서 어떻게 활용하는지 안내 */}
        <div style={{ fontSize:14, color:"rgba(244,241,235,0.4)", marginBottom:16 }}>WIHAM 인사이드 활용법</div>
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
            { icon:"📚", num:"STEP 01", label:"사례 찾기", desc:`${caseCountLabel}+ 콘텐츠 중\n본인 상황과 비슷한\n판례·산재 사례를 확인`, target:"content" },
            { icon:"🔍", num:"STEP 02", label:"무료 진단", desc:"고용노동부 기준으로\n3대 요건·행위유형을\n객관적으로 평가", target:"checklist" },
            { icon:"💬", num:"STEP 03", label:"전문 상담", desc:"사례 + 진단 결과를\n자동 반영해 노무사가\n맞춤 답변을 제공", target:"biz" },
          ].map((item, i) => (
            <div key={i}
              onClick={() => { if (typeof setActive === "function") setActive(item.target); window.scrollTo({ top:0, behavior:"smooth" }); }}
              style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:"28px 16px", textAlign:"center", transition:"all 0.3s", cursor:"pointer" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(255,255,255,0.025)"; }}>
              <div style={{ fontSize:28, marginBottom:14 }}>{item.icon}</div>
              <div style={{ fontSize:"clamp(14px, 1.4vw, 16px)", fontWeight:700, color:C.gold, marginBottom:6, letterSpacing:"1.5px" }}>{item.num}</div>
              <div style={{ fontSize:"clamp(18px, 2.4vw, 22px)", fontWeight:800, color:C.cream, marginBottom:12, fontFamily:"'Noto Serif KR', serif" }}>{item.label}</div>
              <div style={{ fontSize:12, color:"rgba(244,241,235,0.55)", lineHeight:1.7, whiteSpace:"pre-line" }}>{item.desc}</div>
            </div>
          ))}
        </div>

        {/* 4단계 사용자 여정 흐름도 — 사례·진단·AI·심층상담 전체 흐름 시각화 */}
        <div style={{ marginTop:24, fontSize:14, color:"rgba(244,241,235,0.4)", marginBottom:18 }}>전체 이용 흐름</div>
        <div style={{ display:"flex", alignItems:"stretch", justifyContent:"center", gap:0, flexWrap:"wrap", maxWidth:980, margin:"0 auto" }}>
          {[
            { icon:"📚", label:"사례 찾기·반영", target:"content" },
            { icon:"🔍", label:"자가 진단",     target:"checklist" },
            { icon:"🤖", label:"AI 상담",       target:null },
            { icon:"⚖️", label:"심층 전문 상담", target:"biz" },
          ].map((step, i, arr) => (
            <div key={i} style={{ display:"flex", alignItems:"center", flexShrink:0 }}>
              <div
                onClick={() => { if (step.target && typeof setActive === "function") { setActive(step.target); window.scrollTo({ top:0, behavior:"smooth" }); } }}
                style={{
                  display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                  minWidth:120, padding:"18px 14px", borderRadius:12,
                  background:"rgba(201,168,76,0.08)", border:"1.5px solid rgba(201,168,76,0.35)",
                  cursor: step.target ? "pointer" : "default",
                  transition:"all 0.25s",
                }}
                onMouseEnter={e => { if (step.target) { e.currentTarget.style.background="rgba(201,168,76,0.18)"; e.currentTarget.style.borderColor=C.gold; e.currentTarget.style.transform="translateY(-3px)"; } }}
                onMouseLeave={e => { e.currentTarget.style.background="rgba(201,168,76,0.08)"; e.currentTarget.style.borderColor="rgba(201,168,76,0.35)"; e.currentTarget.style.transform=""; }}>
                <div style={{ fontSize:24, marginBottom:8 }}>{step.icon}</div>
                <div style={{ fontSize:13, fontWeight:700, color:C.cream, whiteSpace:"nowrap" }}>{step.label}</div>
              </div>
              {i < arr.length - 1 && (
                <div style={{ padding:"0 12px", color:C.gold, fontSize:22, fontWeight:900, lineHeight:1 }}>›››</div>
              )}
            </div>
          ))}
        </div>
        <div style={{ marginTop:22, fontSize:12, color:"rgba(244,241,235,0.45)", letterSpacing:"0.3px" }}>
          앞 단계의 정보가 다음 단계로 자동 전달돼 정확도가 올라갑니다
        </div>
      </div>
    </section>
  );
}
