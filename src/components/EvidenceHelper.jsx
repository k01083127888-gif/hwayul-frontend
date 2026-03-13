import { useState } from "react";
import C from "../tokens/colors.js";

export function EvidenceHelper({ onClose }) {
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [situation, setSituation] = useState("");
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(false);

  const evidenceTypes = [
    { id:"message", icon:"💬", label:"메신저·문자", desc:"카카오톡, 슬랙, 문자 등" },
    { id:"email", icon:"📧", label:"이메일", desc:"업무 이메일, 사내 메일" },
    { id:"voice", icon:"🎙️", label:"음성 녹음", desc:"대화, 회의 녹음" },
    { id:"cctv", icon:"📹", label:"CCTV·영상", desc:"사업장 내 영상" },
    { id:"witness", icon:"👤", label:"목격자", desc:"동료, 주변인 진술" },
    { id:"medical", icon:"🏥", label:"의료 기록", desc:"진단서, 치료 기록" },
    { id:"work", icon:"📁", label:"업무 기록", desc:"근태, 인사평가, 지시 메일" },
    { id:"photo", icon:"📷", label:"사진·캡처", desc:"화면 캡처, 현장 사진" },
  ];

  const toggle = id => setSelectedTypes(p => p.includes(id) ? p.filter(x=>x!==id) : [...p, id]);

  const [errorMsg, setErrorMsg] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const safeParseJson = (raw) => {
    let s = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const start = s.indexOf("{");
    const end = s.lastIndexOf("}");
    if (start !== -1 && end !== -1) s = s.slice(start, end + 1);
    return JSON.parse(s);
  };

  const generate = async () => {
    if (selectedTypes.length === 0) return;
    setLoading(true);
    setGuide(null);
    setErrorMsg("");
    try {
      const typeLabels = selectedTypes.map(id => evidenceTypes.find(e=>e.id===id)?.label).join(", ");
      // max_tokens: 유형 수 × 400토큰, 최소 1500 최대 4000
      const dynamicTokens = Math.min(4000, Math.max(1500, selectedTypes.length * 500));

      const res = await fetch("/api/claude", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: dynamicTokens,
          system: `당신은 직장내 괴롭힘 사건 증거 수집 전문가입니다. 한국 법률 기반으로 안내하세요.

아래 JSON 구조로만 응답하세요. 마크다운·설명 없이 순수 JSON만:
{"items":[{"type":"증거유형명","steps":["단계1","단계2","단계3"],"caution":"주의사항","legal":"법적 근거"}]}

규칙:
- steps는 정확히 3개
- caution과 legal은 각 한 문장
- 선택된 증거 유형 각각에 대해 item 하나씩 생성`,
          messages: [{
            role: "user",
            content: `증거 유형 ${selectedTypes.length}개: ${typeLabels}\n상황: ${situation || "(없음)"}\n\n각 유형별 수집 가이드를 JSON으로 반환하세요.`
          }]
        })
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        let errMsg = `HTTP ${res.status}`;
        try { errMsg += ": " + JSON.parse(errText)?.error?.message; } catch {}
        throw new Error(errMsg);
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error.message || "API 오류");

      // stop_reason이 max_tokens면 응답이 잘린 것
      if (data.stop_reason === "max_tokens") {
        throw new Error("응답이 너무 길어 잘렸습니다. 증거 유형 수를 줄여서 다시 시도해 주세요.");
      }

      const raw = data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
      if (!raw.trim()) throw new Error("AI 응답이 비어 있습니다.");

      const parsed = safeParseJson(raw);
      if (!parsed?.items || !Array.isArray(parsed.items) || parsed.items.length === 0) {
        throw new Error("응답 형식이 올바르지 않습니다. 다시 시도해 주세요.");
      }

      setGuide(parsed);
      setRetryCount(0);
    } catch(err) {
      setErrorMsg(err.message || "알 수 없는 오류");
      setRetryCount(r => r + 1);
    }
    setLoading(false);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(10,22,40,0.8)", backdropFilter:"blur(8px)", zIndex:10050, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"white", borderRadius:20, maxWidth:680, width:"100%", maxHeight:"90vh", overflow:"auto", boxShadow:"0 24px 80px rgba(10,22,40,0.4)" }}>
        <div style={{ padding:"28px 32px 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
            <div>
              <div style={{ fontSize:10, letterSpacing:"2px", color:C.teal, fontWeight:700 }}>EVIDENCE GUIDE</div>
              <h3 style={{ fontFamily:"'Noto Serif KR',serif", fontSize:22, fontWeight:900, color:C.navy, marginTop:4 }}>📋 증거 수집 도우미</h3>
              <p style={{ fontSize:13, color:C.gray, marginTop:6, lineHeight:1.6 }}>수집 가능한 증거 유형을 선택하면 AI가 맞춤형 수집 방법을 안내해 드립니다.</p>
            </div>
            <button onClick={onClose} style={{ background:"none", border:"none", fontSize:22, color:C.gray, cursor:"pointer", marginLeft:16 }}>✕</button>
          </div>
        </div>

        <div style={{ padding:"20px 32px 32px" }}>
          {/* 증거 유형 선택 */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.navy, marginBottom:12 }}>보유하고 있거나 수집 가능한 증거 유형을 선택하세요</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
              {evidenceTypes.map(e => {
                const sel = selectedTypes.includes(e.id);
                return (
                  <div key={e.id} onClick={()=>toggle(e.id)} style={{ padding:"12px 10px", borderRadius:10, border:`2px solid ${sel?C.teal:"rgba(10,22,40,0.1)"}`, background:sel?`${C.teal}08`:"white", cursor:"pointer", textAlign:"center", transition:"all 0.18s" }}>
                    <div style={{ fontSize:22, marginBottom:4 }}>{e.icon}</div>
                    <div style={{ fontSize:12, fontWeight:700, color:sel?C.teal:C.navy }}>{e.label}</div>
                    <div style={{ fontSize:10, color:C.gray, marginTop:2 }}>{e.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 상황 설명 */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.navy, marginBottom:8 }}>상황을 간략히 설명해 주세요 (선택)</div>
            <textarea value={situation} onChange={e=>setSituation(e.target.value)} placeholder="예: 팀장이 매일 회의 중 폭언을 하고, 슬랙 메시지로 위협적인 메시지를 보냅니다." rows={3} style={{ width:"100%", padding:"11px 14px", borderRadius:8, border:"2px solid rgba(10,22,40,0.1)", fontSize:13, fontFamily:"inherit", outline:"none", resize:"vertical", boxSizing:"border-box", lineHeight:1.6 }} />
          </div>

          <button onClick={generate} disabled={selectedTypes.length===0||loading} style={{ width:"100%", padding:"14px", borderRadius:10, background:selectedTypes.length>0&&!loading?C.teal:"rgba(10,22,40,0.08)", border:"none", color:selectedTypes.length>0&&!loading?"white":C.gray, fontWeight:800, fontSize:15, cursor:selectedTypes.length>0&&!loading?"pointer":"not-allowed", fontFamily:"inherit", marginBottom: errorMsg||guide ? 16 : 24 }}>
            {loading ? `🔄 AI 가이드 생성 중… (${selectedTypes.length}개 유형)` : `📋 ${selectedTypes.length}개 유형 수집 가이드 생성하기`}
          </button>

          {/* 오류 메시지 */}
          {errorMsg && (
            <div style={{ padding:"16px 18px", background:"rgba(192,57,43,0.07)", border:"1px solid rgba(192,57,43,0.2)", borderRadius:10, marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.red, marginBottom:6 }}>⚠️ 가이드 생성 실패</div>
              <div style={{ fontSize:12, color:"#5A3530", lineHeight:1.7, marginBottom:12 }}>{errorMsg}</div>
              {retryCount >= 2 && selectedTypes.length > 4 && (
                <div style={{ fontSize:12, color:C.navy, background:"rgba(13,115,119,0.07)", padding:"8px 12px", borderRadius:7, marginBottom:10 }}>
                  💡 <strong>팁:</strong> 증거 유형을 4개 이하로 줄이면 더 안정적으로 생성됩니다.
                </div>
              )}
              <button onClick={generate} disabled={loading} style={{ padding:"8px 18px", borderRadius:7, background:C.teal, border:"none", color:"white", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                🔄 다시 시도
              </button>
            </div>
          )}

          {/* 결과 */}
          {guide && guide.items && (
            <div>
              <div style={{ fontSize:12, fontWeight:800, color:C.navy, marginBottom:14, paddingBottom:10, borderBottom:`2px solid ${C.teal}` }}>📌 맞춤형 증거 수집 가이드</div>
              {guide.items.map((item, i) => (
                <div key={i} style={{ marginBottom:18, padding:"18px 20px", background:"#F8F9FD", borderRadius:12, border:"1px solid rgba(10,22,40,0.07)", borderLeft:`4px solid ${C.teal}` }}>
                  <div style={{ fontSize:14, fontWeight:800, color:C.navy, marginBottom:10 }}>{item.type}</div>
                  <div style={{ marginBottom:10 }}>
                    {item.steps?.map((s, j) => (
                      <div key={j} style={{ display:"flex", gap:10, marginBottom:7, alignItems:"flex-start" }}>
                        <div style={{ width:20, height:20, borderRadius:"50%", background:C.teal, color:"white", fontSize:10, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>{j+1}</div>
                        <span style={{ fontSize:13, color:"#3A3530", lineHeight:1.6 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                  {item.caution && <div style={{ padding:"8px 12px", background:"rgba(230,126,34,0.08)", borderRadius:8, fontSize:12, color:C.orange, marginBottom:6 }}>⚠️ {item.caution}</div>}
                  {item.legal && <div style={{ fontSize:11, color:C.teal, fontWeight:600 }}>📌 {item.legal}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ③ 산재 가능성 계산기
// ══════════════════════════════════════════════════════════════════════════════
