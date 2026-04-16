import { useState, useEffect } from "react";
import C from "../tokens/colors.js";
import { companyReportStatus, companyOrgStatus, companyCurrentActions } from "../data/companyCheckData.js";
import { DiagnosisChatBot } from "../components/DiagnosisChatBot.jsx";
import { loadCompany, saveCompany } from "../utils/storage.js";

// ── 사내 괴롭힘 조사 필요성 체크 ─────────────────────────────────────────
export function CompanyCheckSection({ setActive }) {
  const _saved = loadCompany();
  const [step, setStep] = useState(_saved?.step || 0);
  const [report, setReport] = useState(_saved?.report || {});
  const [org, setOrg] = useState(_saved?.org || {});
  const [actions, setActions] = useState(_saved?.actions || {});

  useEffect(() => { saveCompany({ step, report, org, actions }); }, [step, report, org, actions]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [step]);

  const STEPS = ["신고 현황", "조직 상황", "조치 상태", "결과"];
  const pct = step === 3 ? 100 : Math.round(step / 3 * 100);

  const toggleCheck = (setter, id) => setter(s => ({ ...s, [id]: !s[id] }));
  const checkStyle = (on) => ({ padding:"12px 16px", borderRadius:10, border:`2px solid ${on ? "#3D5A80" : "rgba(255,255,255,0.1)"}`, background:on ? "rgba(61,90,128,0.15)" : "rgba(255,255,255,0.02)", color:on ? "#6B8CB8" : "rgba(244,241,235,0.65)", fontWeight:on ? 700 : 400, fontSize:13, cursor:"pointer", fontFamily:"inherit", textAlign:"left", transition:"all 0.15s", width:"100%" });

  const calcResult = () => {
    let score = 0;
    companyReportStatus.forEach(r => { if (report[r.id]) score += r.weight; });
    companyOrgStatus.forEach(o => { if (org[o.id]) score += o.weight; });
    companyCurrentActions.forEach(a => { if (actions[a.id]) score += a.weight; });

    const hasLabor = report["cr5"]; // 고용노동부 통보
    const hasRetaliation = org["co6"]; // 2차 피해
    const overDeadline = actions["ca2"]; // 10일 초과

    const urgentFlags = [hasLabor, hasRetaliation, overDeadline].filter(Boolean).length;

    if (score >= 8 || urgentFlags >= 2) {
      return {
        level: "urgent",
        emoji: "🚨",
        title: "외부 전문가 조사를 즉시 의뢰하시는 것을 권장합니다",
        summary: "신고 접수 후 법적 조사 기한(10일 내 착수) 준수, 2차 피해 방지, 조사 공정성 확보를 위해 외부 중립 조사관 선임이 필요한 상황입니다. 미조치 시 사업주에게 과태료(500만원 이하)가 부과될 수 있습니다.",
        color: C.red,
        actions: [
          "외부 중립 조사관 파견 즉시 의뢰 (해결 의뢰 트랙4)",
          "신고인·피신고인 즉시 분리 조치 (근로기준법 제76조의3)",
          "비밀유지 서약 및 2차 피해 방지 조치",
          "조사 착수·종료 일정 수립 (접수 후 10일 내)",
        ],
      };
    } else if (score >= 4) {
      return {
        level: "recommend",
        emoji: "⚠️",
        title: "전문가 자문을 받아보시는 것을 권장합니다",
        summary: "사내 조사를 진행하더라도 절차의 적법성과 조사보고서 작성에 전문가 검토가 필요합니다. 조사 과정의 하자는 추후 소송에서 회사 불리하게 작용할 수 있습니다.",
        color: C.gold,
        actions: [
          "심층 상담(22만원)으로 조사 절차 자문",
          "조사위원회 구성 방법 안내",
          "당사자 분리·보호 조치 실시",
          "취업규칙 내 괴롭힘 규정 점검",
        ],
      };
    } else {
      return {
        level: "monitor",
        emoji: "✅",
        title: "현재 긴급한 조사 의뢰 상황은 아닙니다",
        summary: "아직 정식 신고 단계는 아니지만, 갈등 징후가 있다면 예방 차원에서 조직문화 진단과 예방 교육을 검토하시길 권합니다.",
        color: C.teal,
        actions: [
          "조직문화 진단으로 사전 위험 점검",
          "괴롭힘 예방 교육 실시",
          "사내 신고 절차·고충처리 채널 정비",
          "취업규칙에 괴롭힘 금지 규정 반영",
        ],
      };
    }
  };

  const result = step === 3 ? calcResult() : null;
  const reset = () => { setReport({}); setOrg({}); setActions({}); setStep(0); saveCompany(null); };

  // 결과에 넘길 데이터
  const resultData = result ? {
    ...result,
    reportChecked: Object.keys(report).filter(k => report[k]),
    orgChecked: Object.keys(org).filter(k => org[k]),
    actionsChecked: Object.keys(actions).filter(k => actions[k]),
  } : null;

  // ── 결과 화면 ──
  if (step === 3 && result) {
    return (
      <div style={{ maxWidth:860, margin:"0 auto" }}>
        <div style={{ padding:36, background:`${result.color}15`, border:`2px solid ${result.color}45`, borderRadius:16, marginBottom:28, textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>{result.emoji}</div>
          <h3 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:"clamp(1.1rem, 2.5vw, 1.4rem)", fontWeight:800, color:C.cream, lineHeight:1.5, marginBottom:14 }}>{result.title}</h3>
          <p style={{ fontSize:13, color:"rgba(244,241,235,0.7)", lineHeight:1.8, maxWidth:600, margin:"0 auto" }}>{result.summary}</p>
        </div>

        {/* 권장 조치 */}
        <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:12, border:"1px solid rgba(255,255,255,0.07)", padding:18, borderLeft:`3px solid ${result.color}`, marginBottom:24 }}>
          <div style={{ fontSize:11, fontWeight:700, color:result.color, letterSpacing:"1px", marginBottom:12 }}>권장 조치</div>
          {result.actions.map((a, i) => (
            <div key={i} style={{ display:"flex", gap:8, fontSize:13, color:"rgba(244,241,235,0.75)", lineHeight:1.6, marginBottom:6 }}>
              <span style={{ color:result.color, flexShrink:0 }}>✓</span>{a}
            </div>
          ))}
        </div>

        {/* 법적 근거 안내 */}
        <div style={{ padding:"14px 18px", background:"rgba(61,90,128,0.1)", border:"1px solid rgba(61,90,128,0.3)", borderRadius:10, marginBottom:24 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#6B8CB8", marginBottom:8 }}>📋 사업주 법적 의무 요약</div>
          <div style={{ fontSize:11, color:"rgba(244,241,235,0.65)", lineHeight:1.8 }}>
            • 신고 접수 후 <strong style={{ color:C.cream }}>지체 없이 조사 착수</strong> (근로기준법 제76조의3)<br/>
            • 조사 기간 중 <strong style={{ color:C.cream }}>피해자 보호 조치</strong> (분리·유급휴가 등)<br/>
            • <strong style={{ color:C.cream }}>비밀유지 의무</strong> 위반 시 과태료 500만원 이하<br/>
            • 신고를 이유로 한 <strong style={{ color:C.cream }}>불리한 처우 금지</strong> (해고·전보 등)
          </div>
        </div>

        {/* AI 챗봇 */}
        <DiagnosisChatBot type="company" resultData={resultData} variant="dark" setActive={setActive} />

        {/* CTA */}
        {result.level === "urgent" ? (
          <div style={{ padding:"20px 22px", background:"rgba(192,57,43,0.1)", border:"1.5px solid rgba(192,57,43,0.35)", borderRadius:14, marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
            <div style={{ flex:1, minWidth:200 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#FF8A80", letterSpacing:"1.5px", marginBottom:6 }}>🚨 즉시 조치 필요</div>
              <div style={{ fontSize:14, fontWeight:800, color:C.cream, marginBottom:4 }}>외부 조사관 파견 의뢰</div>
              <div style={{ fontSize:11, color:"rgba(244,241,235,0.6)", lineHeight:1.6 }}>조사보고서 작성·징계 자문·재발방지 교육 포함<br/>건당 300~800만원 (규모·복잡도 기준)</div>
            </div>
            <button onClick={() => setActive("relief")} style={{ padding:"12px 22px", borderRadius:10, background:C.red, border:"none", color:"white", fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap", flexShrink:0 }}>
              🏛️ 해결 의뢰 →
            </button>
          </div>
        ) : (
          <div style={{ padding:"20px 22px", background:"rgba(201,168,76,0.08)", border:"1.5px solid rgba(201,168,76,0.32)", borderRadius:14, marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
            <div style={{ flex:1, minWidth:200 }}>
              <div style={{ fontSize:11, fontWeight:700, color:C.gold, letterSpacing:"1.5px", marginBottom:6 }}>💼 전문가 자문이 필요하시다면</div>
              <div style={{ fontSize:14, fontWeight:800, color:C.cream, marginBottom:4 }}>전문 노무사 심층 상담 <span style={{ fontSize:13, color:C.goldLight }}>22만원 (VAT 포함)</span></div>
              <div style={{ fontSize:11, color:"rgba(244,241,235,0.6)", lineHeight:1.6 }}>조사 절차·조사보고서·징계 결정 자문<br/>해결 의뢰 전환 시 상담료 전액 착수금에서 차감</div>
            </div>
            <button onClick={() => setActive("biz")} style={{ padding:"12px 22px", borderRadius:10, background:C.gold, border:"none", color:C.navy, fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap", flexShrink:0 }}>
              💼 심층 상담 신청 →
            </button>
          </div>
        )}

        <div style={{ display:"flex", justifyContent:"center" }}>
          <button onClick={reset} style={{ padding:"13px 36px", background:"rgba(255,255,255,0.06)", border:"none", borderRadius:8, color:"rgba(244,241,235,0.65)", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>↺ 다시 체크하기</button>
        </div>
      </div>
    );
  }

  // ── 체크 스텝 ──
  return (
    <div style={{ maxWidth:860, margin:"0 auto" }}>
      {/* 진행률 */}
      <div style={{ marginBottom:28 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
          <span style={{ fontSize:11, color:"rgba(244,241,235,0.5)" }}>{STEPS[step]}</span>
          <span style={{ fontSize:11, color:"#6B8CB8" }}>{pct}%</span>
        </div>
        <div style={{ height:4, background:"rgba(255,255,255,0.08)", borderRadius:2 }}>
          <div style={{ height:4, background:"#3D5A80", borderRadius:2, width:`${pct}%`, transition:"width 0.3s" }} />
        </div>
      </div>

      {/* STEP 0: 신고 현황 */}
      {step === 0 && (
        <div>
          <h3 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:18, fontWeight:800, color:C.cream, marginBottom:8 }}>신고·제보 접수 현황을 확인합니다</h3>
          <p style={{ fontSize:12, color:"rgba(244,241,235,0.5)", marginBottom:24 }}>해당하는 항목을 모두 선택해 주세요.</p>

          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
            {companyReportStatus.map(opt => (
              <button key={opt.id} onClick={() => toggleCheck(setReport, opt.id)} style={checkStyle(report[opt.id])}>
                {report[opt.id] ? "☑ " : "☐ "}{opt.label}
              </button>
            ))}
          </div>

          <button onClick={() => setStep(1)} style={{ width:"100%", padding:"14px", background:"#3D5A80", border:"none", borderRadius:8, color:"white", fontWeight:800, fontSize:15, cursor:"pointer", fontFamily:"inherit" }}>다음 →</button>
        </div>
      )}

      {/* STEP 1: 조직 상황 */}
      {step === 1 && (
        <div>
          <h3 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:18, fontWeight:800, color:C.cream, marginBottom:8 }}>조직 상황을 확인합니다</h3>
          <p style={{ fontSize:12, color:"rgba(244,241,235,0.5)", marginBottom:24 }}>사건의 복잡도와 리스크를 판단하기 위한 항목입니다.</p>

          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
            {companyOrgStatus.map(opt => (
              <button key={opt.id} onClick={() => toggleCheck(setOrg, opt.id)} style={checkStyle(org[opt.id])}>
                {org[opt.id] ? "☑ " : "☐ "}{opt.label}
              </button>
            ))}
          </div>

          <div style={{ display:"flex", gap:12 }}>
            <button onClick={() => setStep(0)} style={{ padding:"14px 22px", background:"rgba(255,255,255,0.06)", border:"none", borderRadius:8, color:"rgba(244,241,235,0.65)", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>← 이전</button>
            <button onClick={() => setStep(2)} style={{ flex:1, padding:"14px", background:"#3D5A80", border:"none", borderRadius:8, color:"white", fontWeight:800, fontSize:15, cursor:"pointer", fontFamily:"inherit" }}>다음 →</button>
          </div>
        </div>
      )}

      {/* STEP 2: 조치 상태 */}
      {step === 2 && (
        <div>
          <h3 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:18, fontWeight:800, color:C.cream, marginBottom:8 }}>현재 조치 상태를 확인합니다</h3>
          <p style={{ fontSize:12, color:"rgba(244,241,235,0.5)", marginBottom:24 }}>사업주로서의 법적 의무 이행 여부를 점검합니다.</p>

          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
            {companyCurrentActions.map(opt => (
              <button key={opt.id} onClick={() => toggleCheck(setActions, opt.id)} style={checkStyle(actions[opt.id])}>
                {actions[opt.id] ? "☑ " : "☐ "}{opt.label}
              </button>
            ))}
          </div>

          <div style={{ display:"flex", gap:12 }}>
            <button onClick={() => setStep(1)} style={{ padding:"14px 22px", background:"rgba(255,255,255,0.06)", border:"none", borderRadius:8, color:"rgba(244,241,235,0.65)", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>← 이전</button>
            <button onClick={() => setStep(3)} style={{ flex:1, padding:"14px", background:"#3D5A80", border:"none", borderRadius:8, color:"white", fontWeight:800, fontSize:15, cursor:"pointer", fontFamily:"inherit" }}>결과 확인 →</button>
          </div>
        </div>
      )}
    </div>
  );
}
