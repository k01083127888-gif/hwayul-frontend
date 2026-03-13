import { useState } from "react";
import C from "../tokens/colors.js";
import { FreeConsultBanner } from "./FreeConsultBanner.jsx";

export function WorkersCompCalculator({ onClose }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const questions = [
    { id:"q1", text:"정신건강의학과(또는 신경정신과)에서 진단을 받으셨나요?", options:["예, 공식 진단을 받았습니다", "받지 않았지만 증상이 있습니다", "아직 병원에 가지 않았습니다"], scores:[3,1,0] },
    { id:"q2", text:"진단명 또는 주된 증상은 무엇인가요?", options:["적응장애", "우울증(우울병 에피소드)", "PTSD / 불안장애", "기타 / 모름"], scores:[3,3,2,1] },
    { id:"q3", text:"괴롭힘이 시작된 후 증상이 발생하기까지 얼마나 걸렸나요?", options:["1개월 이내 (시간적 인과관계 강력)", "1~3개월", "3~6개월", "6개월 이상"], scores:[3,2,1,1] },
    { id:"q4", text:"증거 자료를 보유하고 있나요?", options:["메신저·이메일·녹음 등 직접 증거 있음", "목격자 진술이 있음", "증거가 부족하거나 없음"], scores:[3,2,0] },
    { id:"q5", text:"회사에 공식 신고하거나 신고 기록이 있나요?", options:["사내 신고 기록 있음", "신고는 안 했으나 동료들이 알고 있음", "신고 없음"], scores:[2,1,0] },
    { id:"q6", text:"현재 직장을 그만뒀거나 병가 중인가요?", options:["산재 병가(요양급여) 중", "일반 병가 중", "퇴직했음", "재직 중"], scores:[3,2,1,1] },
  ];

  const totalScore = Object.values(answers).reduce((s,v)=>s+v,0);
  const maxScore = questions.reduce((s,q)=>s+Math.max(...q.scores),0);

  const calcProb = () => {
    const ratio = totalScore / maxScore;
    if (ratio >= 0.8) return { pct:85, grade:"매우 높음", color:C.green, emoji:"🟢" };
    if (ratio >= 0.6) return { pct:65, grade:"높음", color:C.teal, emoji:"🔵" };
    if (ratio >= 0.4) return { pct:45, grade:"보통", color:C.orange, emoji:"🟡" };
    return { pct:20, grade:"낮음 (추가 준비 필요)", color:C.red, emoji:"🔴" };
  };

  const generateResult = async () => {
    setLoading(true);
    const prob = calcProb();
    const qaSummary = questions.map((q,i) => {
      const aIdx = answers[q.id] !== undefined ? q.scores.indexOf(answers[q.id]) : -1;
      return `${q.text} → ${aIdx>=0 ? q.options[aIdx] : "미응답"}`;
    }).join("\n");
    try {
      const res = await fetch("/api/claude", {
        method:"POST",
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:`당신은 산업재해 전문 노무사입니다. 아래 JSON 형식으로만 반환하세요. 마크다운·설명 없이 JSON만:
{"strength":["강점1","강점2"],"weakness":["보완1","보완2"],"docs":["서류1","서류2","서류3"],"advice":"핵심 조언 2~3문장"}`,
          messages:[{ role:"user", content:`산재 신청 가능성 평가:\n${qaSummary}\n\n총점: ${totalScore}/${maxScore} (가능성: ${prob.grade})\n\n강점, 보완사항, 필요서류, 핵심조언을 JSON으로만 주세요.` }]
        })
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const raw = data.content?.filter(b=>b.type==="text").map(b=>b.text).join("") || "";
      let s = raw.replace(/```json\s*/gi,"").replace(/```\s*/g,"").trim();
      const si = s.indexOf("{"), ei = s.lastIndexOf("}");
      if (si !== -1 && ei !== -1) s = s.slice(si, ei+1);
      setResult({ ...JSON.parse(s), prob });
    } catch {
      setResult({ prob, strength:[], weakness:[], docs:["공식 진단서 (종합병원급 정신건강의학과)","재해경위서 (6하 원칙 작성)","증거 자료 (메신저·녹음 등)","목격자 진술서"], advice:"산재 신청 전 전문 노무사와 상담하여 구체적인 전략을 수립하세요." });
    }
    setLoading(false);
  };

  const currentQ = questions[step];
  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(10,22,40,0.8)", backdropFilter:"blur(8px)", zIndex:10050, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"white", borderRadius:20, maxWidth:600, width:"100%", maxHeight:"90vh", overflow:"auto", boxShadow:"0 24px 80px rgba(10,22,40,0.4)" }}>
        <div style={{ padding:"28px 32px", borderBottom:"1px solid rgba(10,22,40,0.06)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontSize:10, letterSpacing:"2px", color:C.teal, fontWeight:700 }}>WORKERS' COMP</div>
              <h3 style={{ fontFamily:"'Noto Serif KR',serif", fontSize:22, fontWeight:900, color:C.navy, marginTop:4 }}>⚖️ 산재 승인 가능성 계산기</h3>
            </div>
            <button onClick={onClose} style={{ background:"none", border:"none", fontSize:22, color:C.gray, cursor:"pointer" }}>✕</button>
          </div>
          {/* 진행 바 */}
          <div style={{ marginTop:16, height:6, background:"rgba(10,22,40,0.07)", borderRadius:3, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${((step+1)/questions.length)*100}%`, background:C.teal, borderRadius:3, transition:"width 0.3s" }} />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:11, color:C.gray }}>
            <span>{step+1} / {questions.length} 문항</span>
            <span>총점: {totalScore}/{maxScore}</span>
          </div>
        </div>

        <div style={{ padding:"28px 32px" }}>
          {!result ? (
            <div>
              <div style={{ padding:"18px 22px", background:"#F8F9FD", borderRadius:12, marginBottom:20, minHeight:80, display:"flex", alignItems:"center" }}>
                <p style={{ fontSize:16, fontWeight:700, color:C.navy, lineHeight:1.6, margin:0 }}>{currentQ.text}</p>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:24 }}>
                {currentQ.options.map((opt, i) => {
                  const sel = answers[currentQ.id] === currentQ.scores[i];
                  return (
                    <button key={i} onClick={() => { setAnswers(p=>({...p,[currentQ.id]:currentQ.scores[i]})); if(step<questions.length-1) setTimeout(()=>setStep(s=>s+1),200); }} style={{ padding:"14px 18px", borderRadius:10, border:`2px solid ${sel?C.teal:"rgba(10,22,40,0.1)"}`, background:sel?`${C.teal}10`:"white", color:sel?C.teal:C.navy, fontWeight:sel?700:400, fontSize:14, cursor:"pointer", fontFamily:"inherit", textAlign:"left", transition:"all 0.18s" }}>
                      {sel?"✓ ":""}{opt}
                    </button>
                  );
                })}
              </div>
              <div style={{ display:"flex", gap:10 }}>
                {step>0 && <button onClick={()=>setStep(s=>s-1)} style={{ padding:"12px 24px", borderRadius:10, background:"rgba(10,22,40,0.06)", border:"none", color:C.navy, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>← 이전</button>}
                {step<questions.length-1 && <button onClick={()=>setStep(s=>s+1)} disabled={answers[currentQ.id]===undefined} style={{ flex:1, padding:"12px", borderRadius:10, background:answers[currentQ.id]!==undefined?C.teal:"rgba(10,22,40,0.06)", border:"none", color:answers[currentQ.id]!==undefined?"white":C.gray, fontWeight:800, fontSize:14, cursor:answers[currentQ.id]!==undefined?"pointer":"not-allowed", fontFamily:"inherit" }}>다음 →</button>}
                {step===questions.length-1 && <button onClick={generateResult} disabled={!allAnswered||loading} style={{ flex:1, padding:"12px", borderRadius:10, background:allAnswered&&!loading?C.gold:"rgba(10,22,40,0.06)", border:"none", color:allAnswered&&!loading?C.navy:C.gray, fontWeight:800, fontSize:14, cursor:allAnswered&&!loading?"pointer":"not-allowed", fontFamily:"inherit" }}>
                  {loading?"분석 중...":"⚖️ 산재 가능성 분석하기"}
                </button>}
              </div>
            </div>
          ) : (
            <div>
              {/* 결과 게이지 */}
              <div style={{ textAlign:"center", padding:"24px 0", background:`linear-gradient(135deg,${C.navy},#0D2140)`, borderRadius:16, marginBottom:20 }}>
                <div style={{ position:"relative", width:140, height:140, margin:"0 auto 16px" }}>
                  <svg width="140" height="140" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
                    <circle cx="70" cy="70" r="58" fill="none" stroke={result.prob.color} strokeWidth="12" strokeLinecap="round"
                      strokeDasharray={`${(result.prob.pct/100)*364} 364`} transform="rotate(-90 70 70)" />
                  </svg>
                  <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ fontSize:36, fontWeight:900, color:result.prob.color }}>{result.prob.pct}%</div>
                    <div style={{ fontSize:10, color:"rgba(244,241,235,0.4)" }}>승인 가능성</div>
                  </div>
                </div>
                <div style={{ fontSize:16, fontWeight:800, color:C.cream }}>{result.prob.emoji} {result.prob.grade}</div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
                {result.strength?.length>0 && <div style={{ padding:"14px 16px", background:"rgba(26,122,74,0.06)", borderRadius:10, border:"1px solid rgba(26,122,74,0.15)" }}>
                  <div style={{ fontSize:12, fontWeight:800, color:C.green, marginBottom:8 }}>✅ 강점</div>
                  {result.strength.map((s,i)=><div key={i} style={{ fontSize:12, color:"#3A3530", lineHeight:1.6, marginBottom:4 }}>• {s}</div>)}
                </div>}
                {result.weakness?.length>0 && <div style={{ padding:"14px 16px", background:"rgba(230,126,34,0.06)", borderRadius:10, border:"1px solid rgba(230,126,34,0.15)" }}>
                  <div style={{ fontSize:12, fontWeight:800, color:C.orange, marginBottom:8 }}>⚠️ 보완 필요</div>
                  {result.weakness.map((s,i)=><div key={i} style={{ fontSize:12, color:"#3A3530", lineHeight:1.6, marginBottom:4 }}>• {s}</div>)}
                </div>}
              </div>

              {result.docs?.length>0 && <div style={{ padding:"14px 18px", background:"#F8F9FD", borderRadius:10, marginBottom:14 }}>
                <div style={{ fontSize:12, fontWeight:800, color:C.navy, marginBottom:10 }}>📄 필요 서류</div>
                {result.docs.map((d,i)=><div key={i} style={{ display:"flex", gap:8, marginBottom:6, fontSize:12, color:"#3A3530" }}><span style={{ color:C.teal, fontWeight:700 }}>{i+1}.</span>{d}</div>)}
              </div>}

              {result.advice && <div style={{ padding:"14px 18px", background:`${C.teal}08`, borderRadius:10, borderLeft:`4px solid ${C.teal}`, marginBottom:16, fontSize:13, color:C.navy, lineHeight:1.7 }}><strong>💡 노무사 조언</strong><br/>{result.advice}</div>}

              <FreeConsultBanner variant="light" context="workers" />

              <button onClick={()=>{setResult(null);setAnswers({});setStep(0);}} style={{ width:"100%", padding:"12px", borderRadius:10, background:"rgba(10,22,40,0.06)", border:"none", color:C.navy, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>다시 계산하기</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ④ 타임라인 기록 도구
// ══════════════════════════════════════════════════════════════════════════════
