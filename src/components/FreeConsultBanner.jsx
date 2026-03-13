import { useState } from "react";
import C from "../tokens/colors.js";
import { addSubmission } from "../utils/store.js";
import { isValidEmail } from "../utils/validators.js";
import { ReportForm } from "./ReportForm.jsx";

export function FreeConsultBanner({ variant = "dark", context = "checklist", setActive, getResultHtml = null }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name:"", phone:"", email:"", prefDate:"", prefTime:"", message:"" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const isDark = variant === "dark";
  const bg         = isDark ? "rgba(201,168,76,0.08)" : "rgba(201,168,76,0.07)";
  const border     = isDark ? "rgba(201,168,76,0.35)" : "rgba(201,168,76,0.4)";
  const titleColor = isDark ? C.gold : C.navy;
  const textColor  = isDark ? "rgba(244,241,235,0.55)" : C.gray;
  const inputStyle = { width:"100%", padding:"9px 12px", borderRadius:7, border:`1px solid ${isDark?"rgba(255,255,255,0.12)":"rgba(10,22,40,0.15)"}`, background:isDark?"rgba(255,255,255,0.05)":"white", color:isDark?C.cream:C.navy, fontSize:12, fontFamily:"inherit", outline:"none", boxSizing:"border-box" };

  const contextMsg = {
    checklist: "진단 결과를 보고 궁금한 점, 지금 어떻게 해야 할지 — 노무사와 직접 통화로 확인하세요.",
    culture:   "조직문화 진단 결과를 바탕으로 우선 개선 방향을 노무사와 직접 통화로 확인하세요.",
    compliance:"컴플라이언스 점검 결과 중 불확실한 부분을 노무사와 직접 통화로 확인하세요.",
    workers:   "산재 가능성 분석 결과를 바탕으로 신청 가능 여부를 노무사와 직접 통화로 확인하세요.",
  }[context] || "궁금한 점을 노무사와 직접 통화로 확인하세요.";

  // 오늘 이후 날짜만 선택 가능하도록 min 값
  const todayStr = new Date().toISOString().slice(0,10);

  const timeSlots = ["09:00~10:00","10:00~11:00","11:00~12:00","14:00~15:00","15:00~16:00","16:00~17:00","17:00~18:00"];

  const handleSubmit = () => {
    if (!form.name.trim() || !form.phone.trim()) { setError("성함과 연락처는 필수입니다."); return; }
    addSubmission("consulting", {
      name: form.name, phone: form.phone, email: form.email,
      prefDate: form.prefDate, prefTime: form.prefTime,
      detail: `[무료 전화상담 예약 - ${context}]\n희망일: ${form.prefDate||"미지정"} / 시간대: ${form.prefTime||"미지정"}\n${form.message}`,
      orgName: "", orgSize: "", position: "", userType: "individual",
      consent: true, marketing: false, source: `free_consult_${context}`,
      resultHtml: getResultHtml ? getResultHtml() : "",
      diagType: context,
    });
    setSent(true);
    setError("");
  };

  return (
    <div style={{ margin:"0 0 20px", padding:"20px 22px", background:bg, border:`2px solid ${border}`, borderRadius:14 }}>
      {!open ? (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div style={{ flex:1, minWidth:200 }}>
            <div style={{ fontSize:13, fontWeight:800, color:titleColor, marginBottom:4 }}>
              📞 무료 전화상담 예약 <span style={{ fontSize:10, fontWeight:600, opacity:0.7 }}>(15분)</span>
            </div>
            <div style={{ fontSize:12, color:textColor, lineHeight:1.65 }}>{contextMsg}</div>
          </div>
          <button
            onClick={() => setOpen(true)}
            style={{ padding:"12px 22px", borderRadius:10, background:C.gold, border:"none", color:C.navy, fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap", boxShadow:`0 4px 14px rgba(201,168,76,0.35)`, flexShrink:0 }}
          >
            📅 전화상담 예약하기
          </button>
        </div>
      ) : sent ? (
        <div style={{ textAlign:"center", padding:"10px 0" }}>
          <div style={{ fontSize:28, marginBottom:8 }}>📅</div>
          <div style={{ fontSize:14, fontWeight:800, color:titleColor, marginBottom:6 }}>전화상담 예약이 완료되었습니다</div>
          {(form.prefDate || form.prefTime) && (
            <div style={{ display:"inline-block", padding:"8px 18px", background:isDark?"rgba(201,168,76,0.1)":"rgba(201,168,76,0.08)", border:`1px solid ${isDark?"rgba(201,168,76,0.3)":"rgba(201,168,76,0.25)"}`, borderRadius:8, marginBottom:10 }}>
              <div style={{ fontSize:12, fontWeight:700, color:isDark?C.gold:"#A0720A" }}>
                {form.prefDate && `📆 ${form.prefDate}`}{form.prefDate && form.prefTime && "  "}{form.prefTime && `🕐 ${form.prefTime}`}
              </div>
            </div>
          )}
          <div style={{ fontSize:12, color:textColor, lineHeight:1.7 }}>
            노무사가 희망하신 일정에 맞춰 연락드립니다.<br/>
            <span style={{ fontSize:11, opacity:0.65 }}>평일 09:00~18:00 운영 · 주말 및 공휴일 제외</span>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ fontSize:13, fontWeight:800, color:titleColor }}>📅 무료 전화상담 예약</div>
            <button onClick={() => setOpen(false)} style={{ background:"none", border:"none", color:textColor, cursor:"pointer", fontSize:16 }}>✕</button>
          </div>

          {/* 성함·연락처 */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:textColor, marginBottom:4 }}>성함 <span style={{ color:C.red }}>*</span></div>
              <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="홍길동" style={inputStyle} />
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:textColor, marginBottom:4 }}>연락처 <span style={{ color:C.red }}>*</span></div>
              <input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="010-0000-0000" style={inputStyle} />
            </div>
          </div>

          {/* 이메일 */}
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:11, fontWeight:700, color:textColor, marginBottom:4 }}>이메일 (선택)</div>
            <input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="example@email.com" style={inputStyle} />
          </div>

          {/* 희망 날짜·시간대 */}
          <div style={{ padding:"12px 14px", background:isDark?"rgba(255,255,255,0.03)":"rgba(10,22,40,0.02)", borderRadius:9, border:`1px solid ${isDark?"rgba(255,255,255,0.07)":"rgba(10,22,40,0.07)"}`, marginBottom:10 }}>
            <div style={{ fontSize:11, fontWeight:700, color:titleColor, marginBottom:10 }}>📅 희망 상담 일정 (선택)</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
              <div>
                <div style={{ fontSize:11, color:textColor, marginBottom:4 }}>희망 날짜</div>
                <input type="date" value={form.prefDate} min={todayStr} onChange={e=>setForm(f=>({...f,prefDate:e.target.value}))} style={inputStyle} />
              </div>
              <div>
                <div style={{ fontSize:11, color:textColor, marginBottom:4 }}>희망 시간대</div>
                <select value={form.prefTime} onChange={e=>setForm(f=>({...f,prefTime:e.target.value}))} style={{ ...inputStyle, appearance:"none" }}>
                  <option value="">시간대 선택</option>
                  {timeSlots.map(t=><option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div style={{ fontSize:10, color:textColor, opacity:0.65, lineHeight:1.5 }}>
              * 일정을 선택하지 않으시면 노무사가 직접 연락 후 일정을 조율합니다.
            </div>
          </div>

          {/* 상담 내용 */}
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, fontWeight:700, color:textColor, marginBottom:4 }}>상담 내용 (선택)</div>
            <textarea value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} placeholder="간략하게 상황을 적어주시면 더 빠른 안내가 가능합니다." rows={2} style={{ ...inputStyle, resize:"vertical", lineHeight:1.5 }} />
          </div>

          {error && <div style={{ fontSize:11, color:C.red, marginBottom:8 }}>⚠️ {error}</div>}
          <button onClick={handleSubmit} style={{ width:"100%", padding:"12px", borderRadius:9, background:C.gold, border:"none", color:C.navy, fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
            📅 전화상담 예약 완료하기
          </button>
          <div style={{ marginTop:8, fontSize:10, color:textColor, textAlign:"center", opacity:0.7 }}>
            수집한 정보는 상담 목적 외 사용되지 않으며, 상담 완료 후 즉시 파기됩니다.
          </div>
        </div>
      )}
    </div>
  );
}

// ── 진단 체크리스트 ───────────────────────────────────────────────────────────
