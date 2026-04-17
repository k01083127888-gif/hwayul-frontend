import { useState, useEffect } from "react";
import C from "../tokens/colors.js";
import { sanjaeTypeOptions, sanjaeMedicalOptions, sanjaeWorkConditions } from "../data/sanjaeCheckData.js";
import { generateSanjaePrintHtml } from "../utils/printTemplates.js";
import { DiagnosisChatBot } from "../components/DiagnosisChatBot.jsx";
import { PrintModal } from "../components/PrintModal.jsx";
import { loadSanjae, saveSanjae } from "../utils/storage.js";

// ── 산재 상담 필요성 체크 ─────────────────────────────────────────────────
export function SanjaeCheckSection({ setActive }) {
  const _saved = loadSanjae();
  const [step, setStep] = useState(_saved?.step || 0);
  const [situation, setSituation] = useState(_saved?.situation || null);
  const [medical, setMedical] = useState(_saved?.medical || {});
  const [workCond, setWorkCond] = useState(_saved?.workCond || {});
  const [showPrintModal, setShowPrintModal] = useState(false);

  useEffect(() => { saveSanjae({ step, situation, medical, workCond }); }, [step, situation, medical, workCond]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [step]);

  const STEPS = ["상황 확인", "현재 상태", "근무 환경", "결과"];
  const pct = step === 3 ? 100 : Math.round(step / 3 * 100);

  const toggleCheck = (setter, id) => setter(s => ({ ...s, [id]: !s[id] }));
  const radioStyle = (on) => ({ padding:"14px 16px", borderRadius:10, border:`2px solid ${on ? C.gold : "rgba(255,255,255,0.1)"}`, background:on ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.02)", color:on ? C.gold : "rgba(244,241,235,0.65)", fontWeight:on ? 700 : 400, fontSize:13, cursor:"pointer", fontFamily:"inherit", textAlign:"left", transition:"all 0.15s", width:"100%" });
  const checkStyle = (on) => ({ padding:"12px 16px", borderRadius:10, border:`2px solid ${on ? C.teal : "rgba(255,255,255,0.1)"}`, background:on ? "rgba(13,115,119,0.12)" : "rgba(255,255,255,0.02)", color:on ? C.tealLight : "rgba(244,241,235,0.65)", fontWeight:on ? 700 : 400, fontSize:13, cursor:"pointer", fontFamily:"inherit", textAlign:"left", transition:"all 0.15s", width:"100%" });

  // 결과 계산
  const calcResult = () => {
    let score = 0;
    if (situation) score += situation.weight;
    sanjaeMedicalOptions.forEach(m => { if (medical[m.id]) score += m.weight; });
    sanjaeWorkConditions.forEach(w => { if (workCond[w.id]) score += w.weight; });

    const medicalChecked = Object.values(medical).filter(Boolean).length;
    const workChecked = Object.values(workCond).filter(Boolean).length;
    const hasDiagnosis = medical["sm1"] || medical["sm2"] || medical["sm3"];

    if (score >= 5 || hasDiagnosis) {
      return {
        recommend: true,
        emoji: "✅",
        title: "산재 상담을 받아보시는 것을 권장합니다",
        summary: situation
          ? `"${situation.tag}" 상황에서 업무 관련 건강 문제가 확인됩니다. 산재 승인 가능성을 전문 노무사와 함께 검토해 보시길 권합니다.`
          : "업무 관련 건강 문제가 확인됩니다. 산재 승인 가능성을 전문 노무사와 함께 검토해 보시길 권합니다.",
        actions: [
          "전문 노무사 심층 상담(22만원)에서 산재 가능성 검토",
          "진단서·치료 기록 등 의료 서류 준비",
          "업무 관련성 입증 자료 정리 (근무기록·메시지 등)",
          "근로복지공단 신청 절차 안내 받기",
        ],
      };
    } else {
      return {
        recommend: false,
        emoji: "⚠️",
        title: "추가 확인이 필요합니다",
        summary: "현재 확인된 정보만으로는 산재 해당 여부를 판단하기 어렵습니다. 증상이 있다면 먼저 병원 진료를 받으시고, 진단서를 확보한 후 상담을 받으시면 더 정확한 안내가 가능합니다.",
        actions: [
          "증상이 있다면 병원 진료부터 받기",
          "진단서 발급 후 산재 상담 재검토",
          "AI 챗봇으로 추가 상황 문의 가능",
          "궁금한 점은 심층 상담에서 확인",
        ],
      };
    }
  };

  const result = step === 3 ? calcResult() : null;
  const reset = () => { setSituation(null); setMedical({}); setWorkCond({}); setStep(0); saveSanjae(null); };

  // ── 결과 화면 ──
  if (step === 3 && result) {
    return (
      <div style={{ maxWidth:860, margin:"0 auto" }}>
        <div style={{ padding:36, background:result.recommend ? "rgba(13,115,119,0.12)" : "rgba(201,168,76,0.1)", border:`2px solid ${result.recommend ? "rgba(13,115,119,0.35)" : "rgba(201,168,76,0.35)"}`, borderRadius:16, marginBottom:28, textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>{result.emoji}</div>
          <h3 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:"clamp(1.1rem, 2.5vw, 1.4rem)", fontWeight:800, color:C.cream, lineHeight:1.5, marginBottom:14 }}>{result.title}</h3>
          <p style={{ fontSize:13, color:"rgba(244,241,235,0.7)", lineHeight:1.8, maxWidth:600, margin:"0 auto" }}>{result.summary}</p>
        </div>

        {/* 권장 조치 */}
        <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:12, border:"1px solid rgba(255,255,255,0.07)", padding:18, borderLeft:`3px solid ${result.recommend ? C.teal : C.gold}`, marginBottom:24 }}>
          <div style={{ fontSize:11, fontWeight:700, color:result.recommend ? C.tealLight : C.gold, letterSpacing:"1px", marginBottom:12 }}>권장 조치</div>
          {result.actions.map((a, i) => (
            <div key={i} style={{ display:"flex", gap:8, fontSize:13, color:"rgba(244,241,235,0.75)", lineHeight:1.6, marginBottom:6 }}>
              <span style={{ color:result.recommend ? C.tealLight : C.gold, flexShrink:0 }}>✓</span>{a}
            </div>
          ))}
        </div>

        {/* 면책 고지 */}
        <div style={{ padding:"14px 18px", background:"rgba(230,126,34,0.1)", border:"1px solid rgba(230,126,34,0.3)", borderRadius:10, marginBottom:24 }}>
          <div style={{ fontSize:11, color:"rgba(244,241,235,0.7)", lineHeight:1.7 }}>
            ⚠️ 본 체크는 상담 필요성을 확인하기 위한 참고용이며 <strong style={{ color:C.cream }}>산재 승인 가능성을 판단하는 것이 아닙니다.</strong><br/>
            실제 승인 여부는 근로복지공단의 심사에 의해 결정됩니다. <strong style={{ color:"#E67E22" }}>전문 노무사 상담</strong>을 권장합니다.
          </div>
        </div>

        {/* 결과지 보기 */}
        <div style={{ padding:"18px", background:"rgba(13,115,119,0.08)", border:"1px solid rgba(13,115,119,0.2)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:C.tealLight, marginBottom:3 }}>📄 체크 결과를 문서로 받아보세요</div>
            <div style={{ fontSize:11, color:"rgba(244,241,235,0.4)" }}>상담 필요성과 권장 조치가 포함된 보고서입니다.</div>
          </div>
          <button onClick={() => setShowPrintModal(true)} style={{ padding:"10px 22px", borderRadius:8, background:C.teal, border:"none", color:"white", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>📄 결과지 보기</button>
        </div>
        <PrintModal isOpen={showPrintModal} onClose={() => setShowPrintModal(false)} type="sanjae" getHtml={() => generateSanjaePrintHtml(situation, medical, workCond, result)} />

        {/* AI 챗봇 (산재 상담) */}
        <DiagnosisChatBot type="sanjae" resultData={{ ...result, situation: situation?.tag || "", medicalChecked: Object.keys(medical).filter(k => medical[k]), workChecked: Object.keys(workCond).filter(k => workCond[k]) }} variant="dark" setActive={setActive} />

        {/* 심층 상담 CTA */}
        <div style={{ padding:"20px 22px", background:"rgba(201,168,76,0.08)", border:"1.5px solid rgba(201,168,76,0.32)", borderRadius:14, marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:200 }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.gold, letterSpacing:"1.5px", marginBottom:6 }}>💼 산재 전문 상담이 필요하시다면</div>
            <div style={{ fontSize:14, fontWeight:800, color:C.cream, marginBottom:4 }}>전문 노무사 심층 상담 <span style={{ fontSize:13, color:C.goldLight }}>22만원 (VAT 포함)</span></div>
            <div style={{ fontSize:11, color:"rgba(244,241,235,0.6)", lineHeight:1.6 }}>산재 승인 675건+ 실적 · 정신질환 산재 전문<br/>해결 의뢰 전환 시 상담료 전액 착수금에서 차감</div>
          </div>
          <button onClick={() => { try { localStorage.setItem("hwayul_diag_for_biz", JSON.stringify(result)); } catch {} setActive("biz"); }} style={{ padding:"12px 22px", borderRadius:10, background:C.gold, border:"none", color:C.navy, fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap", flexShrink:0 }}>
            💼 심층 상담 신청 →
          </button>
        </div>

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
          <span style={{ fontSize:11, color:C.teal }}>{pct}%</span>
        </div>
        <div style={{ height:4, background:"rgba(255,255,255,0.08)", borderRadius:2 }}>
          <div style={{ height:4, background:C.teal, borderRadius:2, width:`${pct}%`, transition:"width 0.3s" }} />
        </div>
      </div>

      {/* STEP 0: 상황 확인 */}
      {step === 0 && (
        <div>
          <h3 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:18, fontWeight:800, color:C.cream, marginBottom:8 }}>어떤 상황이신가요?</h3>
          <p style={{ fontSize:12, color:"rgba(244,241,235,0.5)", marginBottom:24 }}>가장 가까운 상황을 하나 선택해 주세요.</p>

          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
            {sanjaeTypeOptions.map(opt => (
              <button key={opt.id} onClick={() => setSituation(opt)} style={radioStyle(situation?.id === opt.id)}>
                {situation?.id === opt.id ? "● " : "○ "}{opt.label}
              </button>
            ))}
          </div>

          <button onClick={() => situation && setStep(1)} disabled={!situation} style={{ width:"100%", padding:"14px", background:situation ? C.teal : "rgba(255,255,255,0.08)", border:"none", borderRadius:8, color:situation ? "white" : "rgba(255,255,255,0.25)", fontWeight:800, fontSize:15, cursor:situation ? "pointer" : "not-allowed", fontFamily:"inherit" }}>다음 →</button>
        </div>
      )}

      {/* STEP 1: 현재 상태 */}
      {step === 1 && (
        <div>
          <h3 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:18, fontWeight:800, color:C.cream, marginBottom:8 }}>현재 상태를 확인합니다</h3>
          <p style={{ fontSize:12, color:"rgba(244,241,235,0.5)", marginBottom:24 }}>해당하는 항목을 모두 선택해 주세요.</p>

          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
            {sanjaeMedicalOptions.map(opt => (
              <button key={opt.id} onClick={() => toggleCheck(setMedical, opt.id)} style={checkStyle(medical[opt.id])}>
                {medical[opt.id] ? "☑ " : "☐ "}{opt.label}
              </button>
            ))}
          </div>

          <div style={{ display:"flex", gap:12 }}>
            <button onClick={() => setStep(0)} style={{ padding:"14px 22px", background:"rgba(255,255,255,0.06)", border:"none", borderRadius:8, color:"rgba(244,241,235,0.65)", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>← 이전</button>
            <button onClick={() => setStep(2)} style={{ flex:1, padding:"14px", background:C.teal, border:"none", borderRadius:8, color:"white", fontWeight:800, fontSize:15, cursor:"pointer", fontFamily:"inherit" }}>다음 →</button>
          </div>
        </div>
      )}

      {/* STEP 2: 근무 환경 */}
      {step === 2 && (
        <div>
          <h3 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:18, fontWeight:800, color:C.cream, marginBottom:8 }}>근무 환경을 확인합니다</h3>
          <p style={{ fontSize:12, color:"rgba(244,241,235,0.5)", marginBottom:24 }}>해당하는 항목을 모두 선택해 주세요.</p>

          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
            {sanjaeWorkConditions.map(opt => (
              <button key={opt.id} onClick={() => toggleCheck(setWorkCond, opt.id)} style={checkStyle(workCond[opt.id])}>
                {workCond[opt.id] ? "☑ " : "☐ "}{opt.label}
              </button>
            ))}
          </div>

          <div style={{ display:"flex", gap:12 }}>
            <button onClick={() => setStep(1)} style={{ padding:"14px 22px", background:"rgba(255,255,255,0.06)", border:"none", borderRadius:8, color:"rgba(244,241,235,0.65)", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>← 이전</button>
            <button onClick={() => setStep(3)} style={{ flex:1, padding:"14px", background:C.teal, border:"none", borderRadius:8, color:"white", fontWeight:800, fontSize:15, cursor:"pointer", fontFamily:"inherit" }}>결과 확인 →</button>
          </div>
        </div>
      )}
    </div>
  );
}
