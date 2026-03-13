import { useState, useRef } from "react";
import C from "../tokens/colors.js";
import { FreeConsultBanner } from "./FreeConsultBanner.jsx";

export function ComplianceChecker({ onClose }) {
  const [size, setSize] = useState("");
  const [checked, setChecked] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const modalBodyRef = useRef(null);
  const resultRef = useRef(null);

  const sizeOptions = [
    { id:"under5", label:"5인 미만", sub:"소규모 사업장" },
    { id:"5to30", label:"5~29인", sub:"소규모" },
    { id:"30to100", label:"30~99인", sub:"중소기업" },
    { id:"100to300", label:"100~299인", sub:"중견기업" },
    { id:"over300", label:"300인 이상", sub:"대기업" },
  ];

  const allItems = {
    under5: [
      { id:"u1", text:"직장내 괴롭힘 금지 조항이 취업규칙에 명시되어 있다", mandatory:false },
      { id:"u2", text:"피해 발생 시 신고 경로(담당자)가 정해져 있다", mandatory:false },
    ],
    "5to30": [
      { id:"s1", text:"취업규칙에 직장내 괴롭힘 금지 및 처리 절차가 명시되어 있다", mandatory:true },
      { id:"s2", text:"사내 고충처리 담당자가 지정되어 있다", mandatory:true },
      { id:"s3", text:"직장내 괴롭힘 예방을 위한 교육을 연 1회 이상 실시하고 있다", mandatory:false },
      { id:"s4", text:"피해자 보호조치(근무장소 분리 등) 절차가 마련되어 있다", mandatory:true },
    ],
    "30to100": [
      { id:"m1", text:"취업규칙에 직장내 괴롭힘 금지 및 처리 절차가 명시되어 있다", mandatory:true },
      { id:"m2", text:"고충처리위원회 또는 담당자가 지정되어 있다", mandatory:true },
      { id:"m3", text:"연 1회 이상 전체 직원 대상 예방 목적의 교육을 실시하고 있다", mandatory:true },
      { id:"m4", text:"피해자 보호조치 및 행위자 분리 절차가 수립되어 있다", mandatory:true },
      { id:"m5", text:"조사 결과에 따른 징계 기준이 취업규칙에 명시되어 있다", mandatory:true },
      { id:"m6", text:"신고자·피해자에 대한 불이익 금지 조항이 있다", mandatory:true },
      { id:"m7", text:"사건 기록 및 보관 체계가 갖추어져 있다", mandatory:false },
    ],
    "100to300": [
      { id:"l1", text:"취업규칙에 직장내 괴롭힘 관련 조항이 명시되어 있다", mandatory:true },
      { id:"l2", text:"독립적인 고충처리위원회(외부위원 포함)가 운영되고 있다", mandatory:true },
      { id:"l3", text:"연 1회 이상 전체 직원 대상 예방 목적의 교육을 실시하고 있다", mandatory:true },
      { id:"l4", text:"관리자(팀장급 이상) 별도 심화 교육을 실시하고 있다", mandatory:false },
      { id:"l5", text:"익명 신고 채널이 운영되고 있다", mandatory:false },
      { id:"l6", text:"피해자 보호조치 및 행위자 분리 절차가 수립되어 있다", mandatory:true },
      { id:"l7", text:"조사 절차, 징계 기준이 내규에 상세히 규정되어 있다", mandatory:true },
      { id:"l8", text:"신고자·피해자에 대한 불이익 금지 조항이 있다", mandatory:true },
      { id:"l9", text:"사건 기록 및 최소 3년 보관 체계가 갖추어져 있다", mandatory:false },
    ],
    over300: [
      { id:"xl1", text:"취업규칙에 직장내 괴롭힘 관련 조항이 명시되어 있다", mandatory:true },
      { id:"xl2", text:"독립적인 고충처리위원회(외부 법조인·노무사 포함)가 운영된다", mandatory:true },
      { id:"xl3", text:"연 1회 이상 전체 직원 대상 예방 목적의 교육 및 관리자 심화 교육을 실시하고 있다", mandatory:true },
      { id:"xl4", text:"익명 신고 시스템(온라인 포함)이 운영된다", mandatory:true },
      { id:"xl5", text:"피해자 보호조치(유급휴가·근무분리) 및 지원 체계가 있다", mandatory:true },
      { id:"xl6", text:"조사 절차·징계 기준·불이익 금지가 내규에 상세히 규정된다", mandatory:true },
      { id:"xl7", text:"산업안전보건위원회 또는 이에 준하는 협의 기구가 있다", mandatory:false },
      { id:"xl8", text:"정기적인 조직문화 진단(연 1회 이상)을 실시하고 있다", mandatory:false },
      { id:"xl9", text:"사건 기록 및 최소 5년 보관 체계가 갖추어져 있다", mandatory:false },
    ]
  };

  const currentItems = size ? (allItems[size] || []) : [];
  const mandatoryItems = currentItems.filter(i=>i.mandatory);
  const checkedMandatory = mandatoryItems.filter(i=>checked[i.id]).length;
  const totalChecked = currentItems.filter(i=>checked[i.id]).length;

  const toggle = id => setChecked(p=>({...p,[id]:!p[id]}));

  // ── 버그 수정 1: 안전한 JSON 파싱 (설명 텍스트 앞뒤 제거) ──
  const safeParseJson = (raw) => {
    let s = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const start = s.indexOf("{");
    const end = s.lastIndexOf("}");
    if (start !== -1 && end !== -1) s = s.slice(start, end + 1);
    return JSON.parse(s);
  };

  // ── 버그 수정 2: risk/priority 값 정규화 (AI가 다르게 반환해도 처리) ──
  const normalizeRisk = (v) => {
    if (!v) return "보통";
    const s = String(v).trim();
    if (s.includes("매우") || s.toLowerCase().includes("very") || s.includes("심각")) return "매우높음";
    if (s.includes("높") || s.toLowerCase().includes("high")) return "높음";
    if (s.includes("낮") || s.toLowerCase().includes("low")) return "낮음";
    return "보통";
  };
  const normalizePriority = (v) => {
    if (!v) return "단기";
    const s = String(v).trim();
    if (s.includes("즉") || s.toLowerCase().includes("immed") || s.includes("긴급")) return "즉시";
    if (s.includes("중") || s.toLowerCase().includes("mid") || s.includes("3개월") || s.includes("6개월")) return "중기";
    return "단기";
  };

  const analyze = async () => {
    if (!size || currentItems.length === 0) return;
    setLoading(true);
    setResult(null);
    setErrorMsg("");
    const sLabel = sizeOptions.find(s => s.id === size)?.label || "";
    const unchecked = currentItems.filter(i => !checked[i.id]).map(i => `[${i.mandatory ? "필수" : "권장"}] ${i.text}`).join("\n");
    const checkedList = currentItems.filter(i => checked[i.id]).map(i => i.text).join("\n");
    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1200,
          // ── 버그 수정 3: system prompt 명확화 (파이프 표기 제거, 선택지 명시) ──
          system: `당신은 기업 HR 컴플라이언스 전문 노무사입니다.
아래 JSON 구조로만 응답하세요. 마크다운·설명 없이 순수 JSON만 반환하세요:
{"risk":"[값]","risks":["위험1","위험2"],"actions":[{"priority":"[값]","action":"조치내용"}],"summary":"2문장 요약"}

risk 필드는 반드시 다음 중 하나만: 낮음 / 보통 / 높음 / 매우높음
priority 필드는 반드시 다음 중 하나만: 즉시 / 단기 / 중기`,
          messages: [{
            role: "user",
            content: `사업장 규모: ${sLabel}\n\n이행 완료 항목:\n${checkedList || "없음"}\n\n미이행 항목:\n${unchecked || "없음"}\n\n법적 위험도(risk), 주요 위험(risks 2~3개), 우선순위별 조치(actions 3~5개), 요약(summary)을 JSON으로만 분석하세요.`
          }]
        })
      });

      // ── 버그 수정 2: HTTP 오류 및 API 오류 별도 처리 ──
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        let msg = `HTTP ${res.status}`;
        try { msg += ": " + JSON.parse(errText)?.error?.message; } catch {}
        throw new Error(msg);
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error.message || "API 오류");

      const raw = data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
      if (!raw.trim()) throw new Error("AI 응답이 비어 있습니다.");

      const parsed = safeParseJson(raw);
      if (!parsed?.risk) throw new Error("응답 형식이 올바르지 않습니다. 다시 시도해주세요.");

      // ── 버그 수정 3: risk/priority 정규화 적용 ──
      parsed.risk = normalizeRisk(parsed.risk);
      if (Array.isArray(parsed.actions)) {
        parsed.actions = parsed.actions.map(a => ({ ...a, priority: normalizePriority(a.priority) }));
      }

      setResult(parsed);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior:"smooth", block:"nearest" }), 60);
    } catch(err) {
      setErrorMsg(err.message || "알 수 없는 오류가 발생했습니다.");
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior:"smooth", block:"nearest" }), 60);
    }
    setLoading(false);
  };

  const riskColor = { "낮음":C.green, "보통":C.orange, "높음":"#C0392B", "매우높음":"#8E0000" };
  const riskBg   = { "낮음":"rgba(26,122,74,0.12)", "보통":"rgba(230,126,34,0.12)", "높음":"rgba(192,57,43,0.12)", "매우높음":"rgba(142,0,0,0.15)" };
  const priorityColor = { "즉시":C.red, "단기":C.orange, "중기":C.blue };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(10,22,40,0.8)", backdropFilter:"blur(8px)", zIndex:10050, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} ref={modalBodyRef} style={{ background:"white", borderRadius:20, maxWidth:700, width:"100%", maxHeight:"92vh", overflow:"auto", boxShadow:"0 24px 80px rgba(10,22,40,0.4)" }}>
        <div style={{ padding:"24px 32px", borderBottom:"1px solid rgba(10,22,40,0.06)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:10, letterSpacing:"2px", color:C.teal, fontWeight:700 }}>COMPLIANCE CHECK</div>
            <h3 style={{ fontFamily:"'Noto Serif KR',serif", fontSize:20, fontWeight:900, color:C.navy, marginTop:4 }}>🏢 기업 컴플라이언스 체커</h3>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:22, color:C.gray, cursor:"pointer" }}>✕</button>
        </div>

        <div style={{ padding:"24px 32px" }}>
          {/* 규모 선택 */}
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.navy, marginBottom:12 }}>사업장 규모를 선택하세요</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {sizeOptions.map(s => (
                <button key={s.id} onClick={()=>{ setSize(s.id); setChecked({}); setResult(null); setErrorMsg(""); }} style={{ padding:"10px 18px", borderRadius:100, border:`2px solid ${size===s.id?C.teal:"rgba(10,22,40,0.12)"}`, background:size===s.id?`${C.teal}10`:"white", color:size===s.id?C.teal:C.navy, fontWeight:size===s.id?800:400, fontSize:13, cursor:"pointer", fontFamily:"inherit", transition:"all 0.18s" }}>
                  <span>{s.label}</span><span style={{ fontSize:10, color:size===s.id?C.teal:C.gray, marginLeft:4 }}>{s.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {size && currentItems.length > 0 && (
            <>
              {/* 진행률 */}
              <div style={{ padding:"12px 16px", background:`${C.teal}08`, borderRadius:10, marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ fontSize:13, color:C.navy }}>
                  <strong>필수 항목:</strong> {checkedMandatory}/{mandatoryItems.length} &nbsp;·&nbsp; <strong>전체:</strong> {totalChecked}/{currentItems.length}
                </div>
                <div style={{ fontSize:13, fontWeight:800, color:checkedMandatory===mandatoryItems.length?C.green:C.orange }}>
                  {checkedMandatory===mandatoryItems.length?"✅ 필수 완료":"⚠️ 필수 미비"}
                </div>
              </div>

              {/* 체크리스트 */}
              <div style={{ marginBottom:20 }}>
                {currentItems.map(item => (
                  <div key={item.id} onClick={()=>toggle(item.id)} style={{ display:"flex", gap:12, padding:"13px 16px", borderRadius:10, cursor:"pointer", marginBottom:8, border:`1px solid ${checked[item.id]?"rgba(13,115,119,0.25)":"rgba(10,22,40,0.08)"}`, background:checked[item.id]?`${C.teal}06`:"white", transition:"all 0.15s", alignItems:"center" }}>
                    <div style={{ width:20, height:20, borderRadius:5, border:`2px solid ${checked[item.id]?C.teal:"rgba(10,22,40,0.15)"}`, background:checked[item.id]?C.teal:"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      {checked[item.id] && <span style={{ color:"white", fontSize:11, fontWeight:900 }}>✓</span>}
                    </div>
                    <span style={{ fontSize:13, color:checked[item.id]?C.navy:"#5A5550", flex:1, lineHeight:1.5 }}>{item.text}</span>
                    {item.mandatory && <span style={{ padding:"2px 7px", borderRadius:4, background:"rgba(192,57,43,0.1)", border:"1px solid rgba(192,57,43,0.2)", fontSize:10, color:C.red, fontWeight:700, flexShrink:0 }}>필수</span>}
                  </div>
                ))}
              </div>

              <button onClick={analyze} disabled={loading} style={{ width:"100%", padding:"14px", borderRadius:10, background:loading?"rgba(10,22,40,0.12)":C.gold, border:"none", color:loading?C.gray:C.navy, fontWeight:800, fontSize:15, cursor:loading?"not-allowed":"pointer", fontFamily:"inherit", marginBottom: errorMsg||result ? 16 : 0 }}>
                {loading ? "🔄 AI 분석 중…" : "🔍 법적 위험도 AI 분석하기"}
              </button>

              {/* 결과 스크롤 앵커 */}
              <div ref={resultRef} />

              {/* ── 버그 수정 4: 오류 메시지 UI (오류 상태를 result 대신 별도 상태로) ── */}
              {errorMsg && (
                <div style={{ padding:"16px 18px", background:"rgba(192,57,43,0.07)", border:"1px solid rgba(192,57,43,0.2)", borderRadius:10, marginBottom:16 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.red, marginBottom:6 }}>⚠️ 분석 실패</div>
                  <div style={{ fontSize:12, color:"#5A3530", lineHeight:1.7, marginBottom:10 }}>{errorMsg}</div>
                  <button onClick={analyze} disabled={loading} style={{ padding:"8px 18px", borderRadius:7, background:C.teal, border:"none", color:"white", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>🔄 다시 시도</button>
                </div>
              )}

              {/* 분석 결과 */}
              {result && !errorMsg && (
                <div style={{ marginTop:8 }}>
                  <div style={{ textAlign:"center", padding:"24px 20px", background:`linear-gradient(135deg,${C.navy},#0D2140)`, borderRadius:14, marginBottom:16 }}>
                    <div style={{ fontSize:11, color:"rgba(244,241,235,0.45)", marginBottom:10, letterSpacing:"1px" }}>법적 위험도</div>
                    <div style={{ display:"inline-block", padding:"8px 28px", borderRadius:100, background: riskBg[result.risk]||"rgba(255,255,255,0.08)", border:`2px solid ${riskColor[result.risk]||C.orange}40`, marginBottom:10 }}>
                      <span style={{ fontSize:26, fontWeight:900, color:riskColor[result.risk]||C.orange }}>{result.risk}</span>
                    </div>
                    <div style={{ fontSize:13, color:"rgba(244,241,235,0.65)", lineHeight:1.75 }}>{result.summary}</div>
                  </div>

                  {Array.isArray(result.risks) && result.risks.length > 0 && (
                    <div style={{ marginBottom:14, padding:"14px 18px", background:"rgba(192,57,43,0.05)", borderRadius:10, border:"1px solid rgba(192,57,43,0.15)" }}>
                      <div style={{ fontSize:12, fontWeight:800, color:C.red, marginBottom:10 }}>⚠️ 주요 법적 위험</div>
                      {result.risks.map((r,i) => <div key={i} style={{ fontSize:13, color:"#3A3530", lineHeight:1.6, marginBottom:5 }}>• {r}</div>)}
                    </div>
                  )}

                  {Array.isArray(result.actions) && result.actions.length > 0 && (
                    <div style={{ padding:"14px 18px", background:"#F8F9FD", borderRadius:10 }}>
                      <div style={{ fontSize:12, fontWeight:800, color:C.navy, marginBottom:12 }}>📋 우선순위별 조치 계획</div>
                      {result.actions.map((a,i) => (
                        <div key={i} style={{ display:"flex", gap:10, marginBottom:10, alignItems:"flex-start" }}>
                          <span style={{ padding:"3px 10px", borderRadius:100, background:`${priorityColor[a.priority]||C.blue}18`, color:priorityColor[a.priority]||C.blue, fontSize:10, fontWeight:800, flexShrink:0, marginTop:2, border:`1px solid ${priorityColor[a.priority]||C.blue}30` }}>{a.priority}</span>
                          <span style={{ fontSize:13, color:"#3A3530", lineHeight:1.6 }}>{a.action}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <FreeConsultBanner variant="light" context="compliance" />

                  <button onClick={()=>{ setResult(null); setErrorMsg(""); }} style={{ width:"100%", marginTop:4, padding:"10px", borderRadius:8, background:"rgba(10,22,40,0.05)", border:"none", color:C.gray, fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                    🔄 다시 분석하기
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 신기능 플로팅 버튼 (우하단 고정)
// ══════════════════════════════════════════════════════════════════════════════
