import { useState } from "react";
import C from "../tokens/colors.js";

export function TimelineRecorder({ onClose }) {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ date:"", time:"", who:"", what:"", where:"", witness:"", evidence:"", emotion:"" });
  // 피해자 기본 정보 (진정서 작성용)
  const [victim, setVictim] = useState({ name:"", company:"", dept:"", position:"", startDate:"", phone:"" });
  const [showVictimForm, setShowVictimForm] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  // 두 문서 각각 독립 상태
  const [accidentGenerating, setAccidentGenerating] = useState(false);
  const [accidentReport, setAccidentReport] = useState("");
  const [accidentError, setAccidentError] = useState("");
  const [complaintGenerating, setComplaintGenerating] = useState(false);
  const [complaintReport, setComplaintReport] = useState("");
  const [complaintError, setComplaintError] = useState("");

  // 복사 완료 피드백
  const [copiedAccident, setCopiedAccident] = useState(false);
  const [copiedComplaint, setCopiedComplaint] = useState(false);

  const F  = k => e => setForm(f=>({...f,[k]:e.target.value}));
  const FV = k => e => setVictim(v=>({...v,[k]:e.target.value}));

  const whoOptions      = ["직속 상사","팀장","임원·대표","동료","후배","외부인(고객·협력사)"];
  const evidenceOptions = ["메신저 캡처","이메일","음성 녹음","목격자 있음","CCTV","없음"];
  const emotionOptions  = ["공포·위협감","수치심·모욕감","우울·무기력","분노","불안","기타"];

  const save = () => {
    if (!form.date || !form.what) return;
    if (editId !== null) {
      setEntries(p => p.map(e => e.id===editId ? {...form, id:editId} : e));
      setEditId(null);
    } else {
      setEntries(p => [...p, {...form, id:Date.now()}]);
    }
    setForm({ date:"", time:"", who:"", what:"", where:"", witness:"", evidence:"", emotion:"" });
    setShowForm(false);
  };

  const del       = id    => setEntries(p=>p.filter(e=>e.id!==id));
  const startEdit = entry => { setForm({...entry}); setEditId(entry.id); setShowForm(true); };

  // 타임라인 텍스트 공통 변환
  const buildTimeline = () =>
    [...entries].sort((a,b)=>a.date.localeCompare(b.date)).map(e =>
      `[${e.date}${e.time?" "+e.time:""}] 행위자: ${e.who||"미상"} / 장소: ${e.where||"미상"} / 내용: ${e.what} / 목격자: ${e.witness||"없음"} / 증거: ${e.evidence||"없음"} / 심리상태: ${e.emotion||"미기록"}`
    ).join("\n");

  // ── ① 재해경위서 생성 (근로복지공단 제출용) ──────────────────────────────
  const generateAccident = async () => {
    if (!entries.length) return;
    setAccidentGenerating(true);
    setAccidentReport("");
    setAccidentError("");
    try {
      const res = await fetch("https://hwayul-backend-production-96cf.up.railway.app/api/claude", {
        method:"POST",
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1600,
          system:`당신은 직장내 괴롭힘·업무상 재해 전문 노무사입니다.
근로복지공단에 제출하는 재해경위서를 아래 공식 양식에 맞게 작성하세요.

작성 원칙:
- 6하 원칙(누가·언제·어디서·무엇을·어떻게·왜)을 빠짐없이 서술
- 객관적·사실적 어조 (감정 표현 최소화)
- 반복성·지속성이 드러나도록 시간순 연결
- 법적 용어 사용: '업무상 스트레스로 인한 정신질환', '직장내 괴롭힘(근로기준법 제76조의2)', '행위자', '피해 근로자'
- 마지막 줄에 반드시: "이상의 내용이 사실임을 확인합니다."`,
          messages:[{ role:"user", content:
`피해 근로자 정보:
- 성명: ${victim.name||"○○○"}
- 소속 회사: ${victim.company||"○○○"}
- 부서·직위: ${victim.dept||"○○○"} / ${victim.position||"○○○"}
- 입사일: ${victim.startDate||"미기재"}
- 연락처: ${victim.phone||"미기재"}

사건 타임라인 (총 ${entries.length}건):
${buildTimeline()}

위 정보를 바탕으로 근로복지공단 제출용 재해경위서를 작성하세요.
형식:
1. 재해 개요 (2~3줄)
2. 재해 경위 (시간순 상세 서술, 반복성·지속성 강조)
3. 피해 결과 (신체적·정신적 피해)
4. 확인 서명란
총 500~800자.` }]
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();
      if (d.error) throw new Error(d.error.message);
      setAccidentReport(d.content?.filter(b=>b.type==="text").map(b=>b.text).join("")||"");
    } catch(e) {
      setAccidentError(e.message||"오류가 발생했습니다. 다시 시도해 주세요.");
    }
    setAccidentGenerating(false);
  };

  // ── ② 고용노동부 진정서 생성 ─────────────────────────────────────────────
  const generateComplaint = async () => {
    if (!entries.length) return;
    setComplaintGenerating(true);
    setComplaintReport("");
    setComplaintError("");
    try {
      const res = await fetch("https://hwayul-backend-production-96cf.up.railway.app/api/claude", {
        method:"POST",
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:2000,
          system:`당신은 직장내 괴롭힘 사건 전문 노무사입니다.
고용노동부 지방관서에 제출하는 진정서(직장내 괴롭힘)를 공식 양식에 맞게 작성하세요.

작성 원칙:
- 근로기준법 제76조의2(직장내 괴롭힘 금지) 위반 명시
- 피해 사실을 구체적·객관적으로 서술 (날짜·장소·발언 포함)
- 행위자의 지위·관계 우위, 업무 적정범위 초과, 신체·정신적 고통 3요소를 각각 입증
- 사업주의 조치 의무 위반(제76조의3) 해당 여부 기재
- '진정인', '피진정인' 용어 사용
- 어조: 법률 문서 수준의 공식체`,
          messages:[{ role:"user", content:
`진정인(피해 근로자) 정보:
- 성명: ${victim.name||"○○○"}
- 소속 회사(피진정인): ${victim.company||"○○○"}
- 부서·직위: ${victim.dept||"○○○"} / ${victim.position||"○○○"}
- 입사일: ${victim.startDate||"미기재"}
- 연락처: ${victim.phone||"미기재"}

사건 타임라인 (총 ${entries.length}건):
${buildTimeline()}

위 정보를 바탕으로 고용노동부 제출용 진정서를 작성하세요.
형식:
【 진 정 서 】(제목, 가운데 정렬 표시)

제목: 직장내 괴롭힘 행위에 대한 진정

1. 진정인 및 피진정인 (표 형식으로)
2. 진정 취지 (2~3줄, 요구사항 명시)
3. 진정 이유
   가. 당사자 관계 및 배경
   나. 괴롭힘 행위 사실 (시간순, 각 행위별 법적 요소 명시)
   다. 사업주 조치 의무 위반 여부
4. 입증 자료 목록
5. 결론 및 요청사항

총 700~1000자.` }]
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();
      if (d.error) throw new Error(d.error.message);
      setComplaintReport(d.content?.filter(b=>b.type==="text").map(b=>b.text).join("")||"");
    } catch(e) {
      setComplaintError(e.message||"오류가 발생했습니다. 다시 시도해 주세요.");
    }
    setComplaintGenerating(false);
  };

  const copyText = (text, setCopied) => {
    navigator.clipboard?.writeText(text).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false), 2000); });
  };

  const sorted = [...entries].sort((a,b)=>a.date.localeCompare(b.date));
  const canGenerate = entries.length > 0;

  // 공통 문서 결과 패널 렌더러
  const DocPanel = ({ icon, title, subtitle, accentColor, generating, report, error, onGenerate, btnLabel, copied, onCopy, onRegen }) => (
    <div style={{ flex:1, minWidth:280, padding:"20px", background:"white", borderRadius:14, border:`2px solid ${generating||report ? accentColor+"40" : "rgba(10,22,40,0.08)"}`, display:"flex", flexDirection:"column", gap:12, transition:"border-color 0.3s" }}>
      {/* 패널 헤더 */}
      <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
        <div style={{ width:40, height:40, borderRadius:10, background:`${accentColor}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{icon}</div>
        <div>
          <div style={{ fontSize:14, fontWeight:800, color:C.navy }}>{title}</div>
          <div style={{ fontSize:11, color:C.gray, marginTop:2, lineHeight:1.5 }}>{subtitle}</div>
        </div>
      </div>

      {/* 생성 버튼 */}
      {!report && !generating && (
        <button
          onClick={onGenerate}
          disabled={!canGenerate}
          style={{ padding:"12px", borderRadius:9, background: canGenerate ? `linear-gradient(135deg,${accentColor},${accentColor}CC)` : "rgba(10,22,40,0.06)", border:"none", color: canGenerate ? "white" : C.gray, fontWeight:800, fontSize:13, cursor: canGenerate ? "pointer" : "not-allowed", fontFamily:"inherit", transition:"all 0.2s" }}
        >
          {btnLabel}
        </button>
      )}

      {/* 생성 중 */}
      {generating && (
        <div style={{ padding:"20px", background:`${accentColor}06`, borderRadius:10, border:`1px dashed ${accentColor}40`, textAlign:"center" }}>
          <div style={{ fontSize:13, fontWeight:700, color:accentColor, marginBottom:6 }}>
            <span style={{ display:"inline-block", animation:"spin 1s linear infinite", marginRight:6 }}>⟳</span>
            AI 작성 중…
          </div>
          <div style={{ fontSize:11, color:C.gray, lineHeight:1.7 }}>타임라인을 분석하여 문서를 생성하고 있습니다.</div>
        </div>
      )}

      {/* 오류 */}
      {error && !generating && (
        <div style={{ padding:"12px 14px", background:"rgba(192,57,43,0.06)", border:"1px solid rgba(192,57,43,0.2)", borderRadius:8 }}>
          <div style={{ fontSize:12, color:"#C0392B", marginBottom:8 }}>⚠️ {error}</div>
          <button onClick={onGenerate} style={{ fontSize:12, padding:"6px 14px", borderRadius:6, background:"rgba(192,57,43,0.1)", border:"1px solid rgba(192,57,43,0.2)", color:"#C0392B", fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>↺ 다시 시도</button>
        </div>
      )}

      {/* 결과 */}
      {report && !generating && (
        <div style={{ display:"flex", flexDirection:"column", gap:8, flex:1 }}>
          <div style={{ padding:"14px 16px", background:"#F8F9FD", borderRadius:10, border:"1px solid rgba(10,22,40,0.08)", fontSize:12.5, color:"#3A3530", lineHeight:1.9, whiteSpace:"pre-wrap", maxHeight:340, overflowY:"auto" }}>{report}</div>
          <div style={{ display:"flex", gap:8 }}>
            <button
              onClick={onCopy}
              style={{ flex:2, padding:"9px", borderRadius:8, background: copied ? "rgba(26,122,74,0.1)" : `${accentColor}10`, border:`1px solid ${copied ? "rgba(26,122,74,0.25)" : accentColor+"30"}`, color: copied ? "#1A7A4A" : accentColor, fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s" }}
            >
              {copied ? "✅ 복사 완료!" : "📋 클립보드 복사"}
            </button>
            <button
              onClick={onRegen}
              disabled={generating}
              style={{ flex:1, padding:"9px", borderRadius:8, background:"rgba(10,22,40,0.04)", border:"1px solid rgba(10,22,40,0.1)", color:C.gray, fontWeight:600, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}
            >
              ↺ 재생성
            </button>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(10,22,40,0.8)", backdropFilter:"blur(8px)", zIndex:10050, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"white", borderRadius:20, maxWidth:900, width:"100%", maxHeight:"94vh", overflow:"auto", boxShadow:"0 24px 80px rgba(10,22,40,0.4)" }}>

        {/* ─ 헤더 ─ */}
        <div style={{ padding:"22px 28px", borderBottom:"1px solid rgba(10,22,40,0.07)", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:"white", zIndex:10 }}>
          <div>
            <div style={{ fontSize:10, letterSpacing:"2px", color:C.teal, fontWeight:700 }}>INCIDENT TIMELINE</div>
            <h3 style={{ fontFamily:"'Noto Serif KR',serif", fontSize:19, fontWeight:900, color:C.navy, marginTop:3 }}>📅 사건 타임라인 기록</h3>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>setShowVictimForm(v=>!v)} style={{ padding:"8px 14px", borderRadius:8, background: showVictimForm ? C.navy : "rgba(10,22,40,0.06)", border:"none", color: showVictimForm ? "white" : C.navy, fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>👤 진정인 정보</button>
            <button onClick={()=>{setShowForm(true);setEditId(null);}} style={{ padding:"8px 16px", borderRadius:8, background:C.teal, border:"none", color:"white", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>+ 사건 추가</button>
            <button onClick={onClose} style={{ background:"none", border:"none", fontSize:22, color:C.gray, cursor:"pointer" }}>✕</button>
          </div>
        </div>

        <div style={{ padding:"22px 28px" }}>

          {/* ─ 진정인 정보 입력 폼 ─ */}
          {showVictimForm && (
            <div style={{ background:"rgba(10,22,40,0.03)", borderRadius:14, padding:"18px 20px", marginBottom:20, border:"2px solid rgba(10,22,40,0.1)" }}>
              <div style={{ fontSize:13, fontWeight:800, color:C.navy, marginBottom:14 }}>👤 피해 근로자 정보 <span style={{ fontSize:11, color:C.gray, fontWeight:400 }}>(문서 자동 생성 시 반영)</span></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:10 }}>
                {[["name","성명","홍길동"],["company","회사명","(주)○○○"],["dept","부서","영업팀"]].map(([k,label,ph])=>(
                  <div key={k}>
                    <label style={{ fontSize:11, fontWeight:700, color:C.gray, display:"block", marginBottom:4 }}>{label}</label>
                    <input value={victim[k]} onChange={FV(k)} placeholder={ph} style={{ width:"100%", padding:"8px 10px", borderRadius:7, border:"1.5px solid rgba(10,22,40,0.12)", fontSize:12, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
                  </div>
                ))}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                {[["position","직위","대리"],["startDate","입사일","2020-03-02"],["phone","연락처","010-0000-0000"]].map(([k,label,ph])=>(
                  <div key={k}>
                    <label style={{ fontSize:11, fontWeight:700, color:C.gray, display:"block", marginBottom:4 }}>{label}</label>
                    <input value={victim[k]} onChange={FV(k)} placeholder={ph} style={{ width:"100%", padding:"8px 10px", borderRadius:7, border:"1.5px solid rgba(10,22,40,0.12)", fontSize:12, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─ 사건 입력 폼 ─ */}
          {showForm && (
            <div style={{ background:"#F8F9FD", borderRadius:14, padding:"20px 24px", marginBottom:20, border:`2px solid ${C.teal}` }}>
              <div style={{ fontSize:14, fontWeight:800, color:C.navy, marginBottom:14 }}>{editId!==null?"✏️ 사건 수정":"➕ 새 사건 기록"}</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                <div><label style={{ fontSize:11, fontWeight:700, color:C.gray, display:"block", marginBottom:5 }}>날짜 *</label><input type="date" value={form.date} onChange={F("date")} style={{ width:"100%", padding:"9px 12px", borderRadius:7, border:"2px solid rgba(10,22,40,0.1)", fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} /></div>
                <div><label style={{ fontSize:11, fontWeight:700, color:C.gray, display:"block", marginBottom:5 }}>시간 (선택)</label><input type="time" value={form.time} onChange={F("time")} style={{ width:"100%", padding:"9px 12px", borderRadius:7, border:"2px solid rgba(10,22,40,0.1)", fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} /></div>
              </div>
              <div style={{ marginBottom:12 }}>
                <label style={{ fontSize:11, fontWeight:700, color:C.gray, display:"block", marginBottom:5 }}>발생 내용 * (구체적으로)</label>
                <textarea value={form.what} onChange={F("what")} placeholder='예: 팀장이 회의 중 "넌 왜 이것도 못 하냐"며 서류를 집어던졌다' rows={3} style={{ width:"100%", padding:"9px 12px", borderRadius:7, border:"2px solid rgba(10,22,40,0.1)", fontSize:13, fontFamily:"inherit", outline:"none", resize:"vertical", boxSizing:"border-box", lineHeight:1.6 }} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:C.gray, display:"block", marginBottom:5 }}>행위자</label>
                  <select value={form.who} onChange={F("who")} style={{ width:"100%", padding:"9px 12px", borderRadius:7, border:"2px solid rgba(10,22,40,0.1)", fontSize:13, fontFamily:"inherit", outline:"none", background:"white" }}>
                    <option value="">-- 선택 --</option>
                    {whoOptions.map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
                <div><label style={{ fontSize:11, fontWeight:700, color:C.gray, display:"block", marginBottom:5 }}>장소</label><input value={form.where} onChange={F("where")} placeholder="예: 사무실, 회의실 3층" style={{ width:"100%", padding:"9px 12px", borderRadius:7, border:"2px solid rgba(10,22,40,0.1)", fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} /></div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:14 }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:C.gray, display:"block", marginBottom:5 }}>목격자</label>
                  <input value={form.witness} onChange={F("witness")} placeholder="예: 동료 A씨" style={{ width:"100%", padding:"9px 12px", borderRadius:7, border:"2px solid rgba(10,22,40,0.1)", fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:C.gray, display:"block", marginBottom:5 }}>증거 유형</label>
                  <select value={form.evidence} onChange={F("evidence")} style={{ width:"100%", padding:"9px 12px", borderRadius:7, border:"2px solid rgba(10,22,40,0.1)", fontSize:13, fontFamily:"inherit", outline:"none", background:"white" }}>
                    <option value="">-- 선택 --</option>
                    {evidenceOptions.map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:C.gray, display:"block", marginBottom:5 }}>심리 상태</label>
                  <select value={form.emotion} onChange={F("emotion")} style={{ width:"100%", padding:"9px 12px", borderRadius:7, border:"2px solid rgba(10,22,40,0.1)", fontSize:13, fontFamily:"inherit", outline:"none", background:"white" }}>
                    <option value="">-- 선택 --</option>
                    {emotionOptions.map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={save} disabled={!form.date||!form.what} style={{ flex:2, padding:"11px", borderRadius:8, background:form.date&&form.what?C.teal:"rgba(10,22,40,0.08)", border:"none", color:form.date&&form.what?"white":C.gray, fontWeight:800, fontSize:14, cursor:form.date&&form.what?"pointer":"not-allowed", fontFamily:"inherit" }}>💾 저장</button>
                <button onClick={()=>{setShowForm(false);setEditId(null);setForm({date:"",time:"",who:"",what:"",where:"",witness:"",evidence:"",emotion:""});}} style={{ flex:1, padding:"11px", borderRadius:8, background:"rgba(10,22,40,0.05)", border:"none", color:C.gray, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>취소</button>
              </div>
            </div>
          )}

          {/* ─ 타임라인 리스트 ─ */}
          {sorted.length === 0 ? (
            <div style={{ textAlign:"center", padding:"48px 0", color:C.gray }}>
              <div style={{ fontSize:40, marginBottom:12 }}>📅</div>
              <div style={{ fontSize:14, lineHeight:1.8 }}>아직 기록된 사건이 없습니다.<br/>위 "+ 사건 추가" 버튼으로 시작하세요.</div>
            </div>
          ) : (
            <>
              <div style={{ position:"relative", paddingLeft:32, marginBottom:24 }}>
                <div style={{ position:"absolute", left:10, top:0, bottom:0, width:2, background:`linear-gradient(to bottom,${C.teal},rgba(13,115,119,0.1))`, borderRadius:2 }} />
                {sorted.map((entry) => (
                  <div key={entry.id} style={{ position:"relative", marginBottom:16 }}>
                    <div style={{ position:"absolute", left:-26, top:6, width:14, height:14, borderRadius:"50%", background:C.teal, border:"3px solid white", boxShadow:"0 0 0 2px "+C.teal }} />
                    <div style={{ background:"#F8F9FD", borderRadius:12, padding:"13px 16px", border:"1px solid rgba(10,22,40,0.07)" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:7 }}>
                        <div style={{ display:"flex", gap:7, alignItems:"center", flexWrap:"wrap" }}>
                          <span style={{ fontSize:12, fontWeight:800, color:C.teal }}>{entry.date} {entry.time||""}</span>
                          {entry.who && <span style={{ padding:"2px 8px", background:`${C.navy}10`, borderRadius:100, fontSize:11, color:C.navy, fontWeight:600 }}>{entry.who}</span>}
                          {entry.evidence && entry.evidence!=="없음" && <span style={{ padding:"2px 8px", background:`${C.green}10`, borderRadius:100, fontSize:11, color:C.green, fontWeight:600 }}>📎 {entry.evidence}</span>}
                        </div>
                        <div style={{ display:"flex", gap:5, flexShrink:0 }}>
                          <button onClick={()=>startEdit(entry)} style={{ fontSize:11, color:C.teal, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>✏️</button>
                          <button onClick={()=>del(entry.id)} style={{ fontSize:11, color:C.red, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>🗑️</button>
                        </div>
                      </div>
                      <p style={{ fontSize:13, color:"#3A3530", lineHeight:1.6, margin:0 }}>{entry.what}</p>
                      {(entry.where||entry.witness||entry.emotion) && (
                        <div style={{ display:"flex", gap:10, marginTop:7, flexWrap:"wrap" }}>
                          {entry.where && <span style={{ fontSize:11, color:C.gray }}>📍 {entry.where}</span>}
                          {entry.witness && <span style={{ fontSize:11, color:C.gray }}>👤 {entry.witness}</span>}
                          {entry.emotion && <span style={{ fontSize:11, color:C.orange }}>💭 {entry.emotion}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* ─ 사건 건수 요약 + 안내 ─ */}
              <div style={{ padding:"12px 16px", background:"rgba(13,115,119,0.05)", borderRadius:10, border:"1px solid rgba(13,115,119,0.15)", marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ fontSize:22 }}>📊</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:C.navy }}>총 {entries.length}건의 사건이 기록되었습니다</div>
                  <div style={{ fontSize:11, color:C.gray, marginTop:2 }}>
                    재해가 인정되면 → 재해경위서(근로복지공단) &nbsp;|&nbsp; 재해 미인정 또는 병행 신청 → 노동부 진정서(고용노동부)
                  </div>
                </div>
              </div>

              {/* ─ 문서 생성 패널 2개 나란히 ─ */}
              <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                <DocPanel
                  icon="🏥"
                  title="재해경위서"
                  subtitle={"근로복지공단 제출용\n업무상 재해(산재) 신청 시 사용"}
                  accentColor={C.teal}
                  generating={accidentGenerating}
                  report={accidentReport}
                  error={accidentError}
                  onGenerate={generateAccident}
                  btnLabel="📋 재해경위서 자동 생성"
                  copied={copiedAccident}
                  onCopy={()=>copyText(accidentReport, setCopiedAccident)}
                  onRegen={()=>{setAccidentReport(""); generateAccident();}}
                />
                <DocPanel
                  icon="⚖️"
                  title="고용노동부 진정서"
                  subtitle={"고용노동부 지방관서 제출용\n직장내 괴롭힘 행정 조사 신청 시 사용"}
                  accentColor={C.gold}
                  generating={complaintGenerating}
                  report={complaintReport}
                  error={complaintError}
                  onGenerate={generateComplaint}
                  btnLabel="📜 진정서 자동 생성"
                  copied={copiedComplaint}
                  onCopy={()=>copyText(complaintReport, setCopiedComplaint)}
                  onRegen={()=>{setComplaintReport(""); generateComplaint();}}
                />
              </div>

              {/* ─ 전략 안내 박스 ─ */}
              <div style={{ marginTop:18, padding:"14px 18px", background:"rgba(201,168,76,0.06)", border:"1px solid rgba(201,168,76,0.25)", borderRadius:10 }}>
                <div style={{ fontSize:11, fontWeight:800, color:"#A0720A", marginBottom:8 }}>💡 어떤 문서를 선택해야 할까요?</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <div style={{ fontSize:11, color:"#5A4A30", lineHeight:1.75 }}>
                    <strong style={{ color:C.teal }}>🏥 재해경위서</strong>가 적합한 경우<br/>
                    • 우울증·공황장애 등 정신질환 진단을 받았거나 치료 중<br/>
                    • 업무와의 인과관계를 입증할 의무기록이 있을 때<br/>
                    • 산재 보험급여(치료비·휴업급여) 수령이 목적
                  </div>
                  <div style={{ fontSize:11, color:"#5A4A30", lineHeight:1.75 }}>
                    <strong style={{ color:"#A0720A" }}>⚖️ 진정서</strong>가 적합한 경우<br/>
                    • 재해 인정 요건은 미충족이나 명백한 괴롭힘 행위가 있을 때<br/>
                    • 사업주의 조치 의무 위반(미조사·불이익처우)을 문제 삼을 때<br/>
                    • 행정적 시정과 행위자 처벌을 원할 때
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ⑤ 기업 컴플라이언스 체커
// ══════════════════════════════════════════════════════════════════════════════
