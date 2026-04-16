import { useState, useEffect } from "react";
import C from "../tokens/colors.js";
import { accusedRelationItems, accusedSuperiorityItems, accusedBehaviorCategories, accusedJustificationQuestions, accusedRepetitionQuestions, accusedImpactItems } from "../data/accusedChecklistData.js";
import { calcAccusedResult } from "../utils/calcAccusedResult.js";
import { DiagnosisChatBot } from "../components/DiagnosisChatBot.jsx";

// ── 피지목인 자가진단 ─────────────────────────────────────────────────────
export function AccusedChecklistSection({ setActive }) {
  const STEPS = ["관계 확인", "행위 유형", "업무 적정성", "반복성 판단", "영향도 확인", "결과"];
  const [step, setStep] = useState(0);
  const [relation, setRelation] = useState(null);  // 단일 선택
  const [superiority, setSup] = useState({});       // 복수 선택
  const [behavior, setBehavior] = useState({});
  const [justification, setJust] = useState({});    // 질문별 단일 선택
  const [repetition, setRep] = useState({});        // 질문별 단일 선택
  const [impact, setImpact] = useState({});

  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [step]);

  const pct = step === 5 ? 100 : Math.round(step / 5 * 100);
  const result = step === 5 ? calcAccusedResult(
    relation ? { [relation.id]: relation.weight } : {},
    Object.fromEntries(Object.entries(superiority).filter(([,v]) => v).map(([k]) => {
      const item = accusedSuperiorityItems.find(i => i.id === k);
      return [k, item?.weight || 0];
    })),
    Object.fromEntries(Object.entries(behavior).filter(([,v]) => v).map(([k]) => {
      let w = 0;
      accusedBehaviorCategories.forEach(c => c.items.forEach(i => { if (i.id === k) w = i.weight; }));
      return [k, w];
    })),
    justification,
    repetition,
    Object.fromEntries(Object.entries(impact).filter(([,v]) => v).map(([k]) => {
      const item = accusedImpactItems.find(i => i.id === k);
      return [k, item?.weight || 0];
    })),
  ) : null;

  const reset = () => { setRelation(null); setSup({}); setBehavior({}); setJust({}); setRep({}); setImpact({}); setStep(0); };

  const toggleCheck = (setter, id) => setter(s => ({ ...s, [id]: !s[id] }));

  const cardStyle = { background:"rgba(255,255,255,0.04)", borderRadius:12, border:"1px solid rgba(255,255,255,0.07)", padding:"18px", marginBottom:12 };
  const checkStyle = (on) => ({ padding:"12px 16px", borderRadius:10, border:`2px solid ${on ? C.gold : "rgba(255,255,255,0.1)"}`, background:on ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.02)", color:on ? C.gold : "rgba(244,241,235,0.65)", fontWeight:on ? 700 : 400, fontSize:13, cursor:"pointer", fontFamily:"inherit", textAlign:"left", transition:"all 0.15s", width:"100%", display:"block" });
  const radioStyle = (on, color) => ({ padding:"12px 16px", borderRadius:10, border:`2px solid ${on ? (color||C.gold) : "rgba(255,255,255,0.1)"}`, background:on ? `${color||C.gold}15` : "rgba(255,255,255,0.02)", color:on ? (color||C.gold) : "rgba(244,241,235,0.65)", fontWeight:on ? 700 : 400, fontSize:13, cursor:"pointer", fontFamily:"inherit", textAlign:"left", transition:"all 0.15s", width:"100%" });

  // ── 결과 화면 ──
  if (step === 5 && result) {
    return (
      <div style={{ maxWidth:860, margin:"0 auto" }}>
        {/* 결과 카드 */}
        <div style={{ padding:36, background:`${result.color}12`, border:`2px solid ${result.color}40`, borderRadius:16, marginBottom:28, textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>{result.emoji}</div>
          <div style={{ fontSize:12, fontWeight:700, color:result.color, letterSpacing:"1.5px", marginBottom:8 }}>{result.level}</div>
          <h3 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:"clamp(1.1rem, 2.5vw, 1.4rem)", fontWeight:800, color:C.cream, lineHeight:1.5, marginBottom:14 }}>{result.title}</h3>
          <p style={{ fontSize:13, color:"rgba(244,241,235,0.7)", lineHeight:1.8, maxWidth:600, margin:"0 auto" }}>{result.summary}</p>
        </div>

        {/* 점수 요약 */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:10, marginBottom:24 }}>
          {[
            { label:"관계 우위", score:result.positionScore, max:10 },
            { label:"행위 점수", score:result.behaviorScore, max:20 },
            { label:"적정성", score:result.justScore, max:8 },
            { label:"반복성", score:result.repScore, max:6 },
            { label:"영향도", score:result.impactScore, max:12 },
          ].map(s => (
            <div key={s.label} style={{ textAlign:"center", padding:"14px 8px", ...cardStyle }}>
              <div style={{ fontSize:10, color:"rgba(244,241,235,0.45)", marginBottom:6 }}>{s.label}</div>
              <div style={{ fontSize:20, fontWeight:900, color:C.gold }}>{s.score}</div>
            </div>
          ))}
        </div>

        {/* 권장 조치 */}
        <div style={{ ...cardStyle, borderLeft:`3px solid ${result.color}`, marginBottom:24 }}>
          <div style={{ fontSize:11, fontWeight:700, color:result.color, letterSpacing:"1px", marginBottom:12 }}>권장 조치</div>
          {result.actions.map((a, i) => (
            <div key={i} style={{ display:"flex", gap:8, fontSize:13, color:"rgba(244,241,235,0.75)", lineHeight:1.6, marginBottom:6 }}>
              <span style={{ color:result.color, flexShrink:0 }}>✓</span>{a}
            </div>
          ))}
        </div>

        {/* 면책 고지 */}
        <div style={{ padding:"14px 18px", background:"rgba(230,126,34,0.1)", border:"1px solid rgba(230,126,34,0.3)", borderRadius:10, marginBottom:24 }}>
          <div style={{ fontSize:11, color:"rgba(244,241,235,0.7)", lineHeight:1.7 }}>
            ⚠️ 본 자가진단은 일반적 기준에 따른 참고용이며 <strong style={{ color:C.cream }}>법적 판단이 아닙니다.</strong><br/>
            실제 성립 여부는 구체적 사실관계와 증거에 따라 달라집니다. <strong style={{ color:"#E67E22" }}>전문 노무사 상담</strong>을 권장합니다.
          </div>
        </div>

        {/* AI 챗봇 (피지목인 모드) */}
        <DiagnosisChatBot resultData={result} setActive={setActive} />

        {/* 심층 상담 CTA */}
        <div style={{ padding:"20px 22px", background:"rgba(201,168,76,0.08)", border:"1.5px solid rgba(201,168,76,0.32)", borderRadius:14, marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:200 }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.gold, letterSpacing:"1.5px", marginBottom:6 }}>💼 전문가 검토가 필요하시다면</div>
            <div style={{ fontSize:14, fontWeight:800, color:C.cream, marginBottom:4 }}>전문 노무사 심층 상담 <span style={{ fontSize:13, color:C.goldLight }}>22만원 (VAT 포함)</span></div>
            <div style={{ fontSize:11, color:"rgba(244,241,235,0.6)", lineHeight:1.6 }}>1차 전화 상담 → 2차 서류 검토 → 3차 대면 상담 패키지<br/>해결 의뢰 전환 시 상담료 전액 착수금에서 차감</div>
          </div>
          <button onClick={() => setActive("biz")} style={{ padding:"12px 22px", borderRadius:10, background:C.gold, border:"none", color:C.navy, fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap", flexShrink:0 }}>
            💼 심층 상담 신청 →
          </button>
        </div>

        <div style={{ display:"flex", justifyContent:"center" }}>
          <button onClick={reset} style={{ padding:"13px 36px", background:"rgba(255,255,255,0.06)", border:"none", borderRadius:8, color:"rgba(244,241,235,0.65)", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>↺ 다시 진단하기</button>
        </div>
      </div>
    );
  }

  // ── 진단 스텝 ──
  return (
    <div style={{ maxWidth:860, margin:"0 auto" }}>
      {/* 진행률 */}
      <div style={{ marginBottom:28 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
          <span style={{ fontSize:11, color:"rgba(244,241,235,0.5)" }}>{STEPS[step]}</span>
          <span style={{ fontSize:11, color:C.gold }}>{pct}%</span>
        </div>
        <div style={{ height:4, background:"rgba(255,255,255,0.08)", borderRadius:2 }}>
          <div style={{ height:4, background:C.gold, borderRadius:2, width:`${pct}%`, transition:"width 0.3s" }} />
        </div>
      </div>

      {/* STEP 0: 관계 확인 */}
      {step === 0 && (
        <div>
          <h3 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:18, fontWeight:800, color:C.cream, marginBottom:8 }}>상대방과의 관계를 확인합니다</h3>
          <p style={{ fontSize:12, color:"rgba(244,241,235,0.5)", marginBottom:24 }}>괴롭힘 성립의 첫 번째 요건은 '지위·관계의 우위'입니다.</p>

          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.gold, marginBottom:12 }}>상대방은 나에게 어떤 관계인가요? (하나 선택)</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {accusedRelationItems.map(item => (
                <button key={item.id} onClick={() => setRelation(item)} style={radioStyle(relation?.id === item.id)}>
                  {relation?.id === item.id ? "● " : "○ "}{item.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.gold, marginBottom:12 }}>상대방보다 우위에 있는 요소가 있나요? (복수선택)</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {accusedSuperiorityItems.map(item => (
                <button key={item.id} onClick={() => toggleCheck(setSup, item.id)} style={checkStyle(superiority[item.id])}>
                  {superiority[item.id] ? "☑ " : "☐ "}{item.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => relation && setStep(1)} disabled={!relation} style={{ width:"100%", padding:"14px", background:relation ? C.gold : "rgba(255,255,255,0.08)", border:"none", borderRadius:8, color:relation ? C.navy : "rgba(255,255,255,0.25)", fontWeight:800, fontSize:15, cursor:relation ? "pointer" : "not-allowed", fontFamily:"inherit" }}>다음 →</button>
        </div>
      )}

      {/* STEP 1: 행위 유형 */}
      {step === 1 && (
        <div>
          <h3 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:18, fontWeight:800, color:C.cream, marginBottom:8 }}>내가 한 행동을 점검합니다</h3>
          <p style={{ fontSize:12, color:"rgba(244,241,235,0.5)", marginBottom:24 }}>해당하는 항목을 솔직하게 체크해 주세요. 정확한 결과를 위해 중요합니다.</p>

          {accusedBehaviorCategories.map(cat => (
            <div key={cat.id} style={{ ...cardStyle, marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                <span style={{ fontSize:20 }}>{cat.icon}</span>
                <span style={{ fontSize:14, fontWeight:800, color:C.cream }}>{cat.category}</span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {cat.items.map(item => (
                  <button key={item.id} onClick={() => toggleCheck(setBehavior, item.id)} style={checkStyle(behavior[item.id])}>
                    {behavior[item.id] ? "☑ " : "☐ "}{item.text}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div style={{ display:"flex", gap:12 }}>
            <button onClick={() => setStep(0)} style={{ padding:"14px 22px", background:"rgba(255,255,255,0.06)", border:"none", borderRadius:8, color:"rgba(244,241,235,0.65)", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>← 이전</button>
            <button onClick={() => setStep(2)} style={{ flex:1, padding:"14px", background:C.gold, border:"none", borderRadius:8, color:C.navy, fontWeight:800, fontSize:15, cursor:"pointer", fontFamily:"inherit" }}>다음 →</button>
          </div>
        </div>
      )}

      {/* STEP 2: 업무 적정성 */}
      {step === 2 && (
        <div>
          <h3 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:18, fontWeight:800, color:C.cream, marginBottom:8 }}>업무상 정당성을 판단합니다</h3>
          <p style={{ fontSize:12, color:"rgba(244,241,235,0.5)", marginBottom:24 }}>정당한 업무지시였는지, 대안이 있었는지를 확인합니다. 괴롭힘 성립의 핵심 요소입니다.</p>

          {accusedJustificationQuestions.map(q => (
            <div key={q.id} style={{ ...cardStyle, marginBottom:16 }}>
              <div style={{ fontSize:14, fontWeight:700, color:C.cream, marginBottom:14 }}>{q.question}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {q.options.map(opt => (
                  <button key={opt.id} onClick={() => setJust(s => ({ ...s, [q.id]: opt.weight }))} style={radioStyle(justification[q.id] === opt.weight)}>
                    {justification[q.id] === opt.weight ? "● " : "○ "}{opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div style={{ display:"flex", gap:12 }}>
            <button onClick={() => setStep(1)} style={{ padding:"14px 22px", background:"rgba(255,255,255,0.06)", border:"none", borderRadius:8, color:"rgba(244,241,235,0.65)", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>← 이전</button>
            <button onClick={() => setStep(3)} style={{ flex:1, padding:"14px", background:C.gold, border:"none", borderRadius:8, color:C.navy, fontWeight:800, fontSize:15, cursor:"pointer", fontFamily:"inherit" }}>다음 →</button>
          </div>
        </div>
      )}

      {/* STEP 3: 반복성 */}
      {step === 3 && (
        <div>
          <h3 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:18, fontWeight:800, color:C.cream, marginBottom:8 }}>반복성과 상대방 반응을 확인합니다</h3>
          <p style={{ fontSize:12, color:"rgba(244,241,235,0.5)", marginBottom:24 }}>1회성인지 반복적이었는지, 상대방의 반응을 알았는지가 중요합니다.</p>

          {accusedRepetitionQuestions.map(q => (
            <div key={q.id} style={{ ...cardStyle, marginBottom:16 }}>
              <div style={{ fontSize:14, fontWeight:700, color:C.cream, marginBottom:14 }}>{q.question}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {q.options.map(opt => (
                  <button key={opt.id} onClick={() => setRep(s => ({ ...s, [q.id]: opt.weight }))} style={radioStyle(repetition[q.id] === opt.weight)}>
                    {repetition[q.id] === opt.weight ? "● " : "○ "}{opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div style={{ display:"flex", gap:12 }}>
            <button onClick={() => setStep(2)} style={{ padding:"14px 22px", background:"rgba(255,255,255,0.06)", border:"none", borderRadius:8, color:"rgba(244,241,235,0.65)", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>← 이전</button>
            <button onClick={() => setStep(4)} style={{ flex:1, padding:"14px", background:C.gold, border:"none", borderRadius:8, color:C.navy, fontWeight:800, fontSize:15, cursor:"pointer", fontFamily:"inherit" }}>다음 →</button>
          </div>
        </div>
      )}

      {/* STEP 4: 영향도 */}
      {step === 4 && (
        <div>
          <h3 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:18, fontWeight:800, color:C.cream, marginBottom:8 }}>상대방에게 미친 영향을 확인합니다</h3>
          <p style={{ fontSize:12, color:"rgba(244,241,235,0.5)", marginBottom:24 }}>알고 있는 범위에서 체크해 주세요. 모르는 경우 마지막 항목을 선택하세요.</p>

          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
            {accusedImpactItems.map(item => (
              <button key={item.id} onClick={() => toggleCheck(setImpact, item.id)} style={checkStyle(impact[item.id])}>
                {impact[item.id] ? "☑ " : "☐ "}{item.text}
              </button>
            ))}
          </div>

          <div style={{ display:"flex", gap:12 }}>
            <button onClick={() => setStep(3)} style={{ padding:"14px 22px", background:"rgba(255,255,255,0.06)", border:"none", borderRadius:8, color:"rgba(244,241,235,0.65)", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>← 이전</button>
            <button onClick={() => setStep(5)} style={{ flex:1, padding:"14px", background:C.gold, border:"none", borderRadius:8, color:C.navy, fontWeight:800, fontSize:15, cursor:"pointer", fontFamily:"inherit" }}>결과 확인 →</button>
          </div>
        </div>
      )}
    </div>
  );
}
