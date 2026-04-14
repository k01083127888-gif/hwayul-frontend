import { useState } from "react";
import C from "../tokens/colors.js";
import { addSubmission } from "../utils/store.js";
import { isValidEmail } from "../utils/validators.js";
import { ReportForm } from "./ReportForm.jsx";

export function FreeConsultBanner({ variant = "dark", context = "checklist", setActive, getResultHtml = null }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", phone:"", message:"" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const isDark = variant === "dark";
  const bg         = isDark ? "rgba(201,168,76,0.08)" : "rgba(201,168,76,0.07)";
  const border     = isDark ? "rgba(201,168,76,0.35)" : "rgba(201,168,76,0.4)";
  const titleColor = isDark ? C.gold : C.navy;
  const textColor  = isDark ? "rgba(244,241,235,0.55)" : C.gray;
  const inputStyle = { width:"100%", padding:"9px 12px", borderRadius:7, border:`1px solid ${isDark?"rgba(255,255,255,0.12)":"rgba(10,22,40,0.15)"}`, background:isDark?"rgba(255,255,255,0.05)":"white", color:isDark?C.cream:C.navy, fontSize:12, fontFamily:"inherit", outline:"none", boxSizing:"border-box" };

  const contextMsg = {
    checklist: "진단 결과에 대한 궁금한 점을 노무사에게 이메일로 문의해 보세요. 차분히 상황을 정리해서 보내주시면 검토 후 답변드립니다.",
    culture:   "조직문화 진단 결과에 대한 궁금한 점을 노무사에게 이메일로 문의해 보세요.",
    compliance:"컴플라이언스 점검 결과 중 불확실한 부분을 노무사에게 이메일로 문의해 보세요.",
    workers:   "산재 가능성 분석 결과에 대한 궁금한 점을 노무사에게 이메일로 문의해 보세요.",
  }[context] || "궁금한 점을 노무사에게 이메일로 문의해 보세요.";

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim()) { setError("성함과 이메일은 필수입니다."); return; }
    if (!isValidEmail(form.email)) { setError("올바른 이메일 형식이 아닙니다."); return; }
    if (!form.message.trim()) { setError("문의 내용을 입력해 주세요."); return; }
    addSubmission("consulting", {
      name: form.name, phone: form.phone, email: form.email,
      prefDate: "", prefTime: "",
      detail: `[무료 이메일 문의 - ${context}]\n${form.message}`,
      orgName: "", orgSize: "", position: "", userType: "individual",
      consent: true, marketing: false, source: `free_email_${context}`,
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
              ✉️ 무료 이메일 문의 <span style={{ fontSize:10, fontWeight:600, opacity:0.7 }}>(24~48h 내 답변)</span>
            </div>
            <div style={{ fontSize:12, color:textColor, lineHeight:1.65 }}>{contextMsg}</div>
          </div>
          <button
            onClick={() => setOpen(true)}
            style={{ padding:"12px 22px", borderRadius:10, background:C.gold, border:"none", color:C.navy, fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap", boxShadow:`0 4px 14px rgba(201,168,76,0.35)`, flexShrink:0 }}
          >
            ✉️ 이메일로 문의하기
          </button>
        </div>
      ) : sent ? (
        <div style={{ textAlign:"center", padding:"10px 0" }}>
          <div style={{ fontSize:28, marginBottom:8 }}>📮</div>
          <div style={{ fontSize:14, fontWeight:800, color:titleColor, marginBottom:6 }}>이메일 문의가 접수되었습니다</div>
          <div style={{ display:"inline-block", padding:"8px 18px", background:isDark?"rgba(201,168,76,0.1)":"rgba(201,168,76,0.08)", border:`1px solid ${isDark?"rgba(201,168,76,0.3)":"rgba(201,168,76,0.25)"}`, borderRadius:8, marginBottom:10 }}>
            <div style={{ fontSize:12, fontWeight:700, color:isDark?C.gold:"#A0720A" }}>
              📧 {form.email}
            </div>
          </div>
          <div style={{ fontSize:12, color:textColor, lineHeight:1.7 }}>
            노무사가 사안을 검토한 뒤 <strong style={{ color:titleColor }}>영업일 기준 1~2일 내</strong>에 답변드립니다.<br/>
            <span style={{ fontSize:11, opacity:0.65 }}>더 심층적인 상담이 필요한 경우 유료 심층 상담(22만원) 안내도 함께 제공됩니다.</span>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ fontSize:13, fontWeight:800, color:titleColor }}>✉️ 무료 이메일 문의</div>
            <button onClick={() => setOpen(false)} style={{ background:"none", border:"none", color:textColor, cursor:"pointer", fontSize:16 }}>✕</button>
          </div>

          {/* 안내 */}
          <div style={{ padding:"10px 12px", background:isDark?"rgba(13,115,119,0.12)":"rgba(13,115,119,0.06)", border:`1px solid ${isDark?"rgba(13,115,119,0.3)":"rgba(13,115,119,0.2)"}`, borderRadius:8, marginBottom:12, fontSize:11, color:isDark?C.tealLight:C.teal, lineHeight:1.65 }}>
            💡 <strong>이메일 문의가 더 효과적입니다.</strong> 말하기 어려운 내용을 차분히 정리할 수 있고, 노무사가 사안을 검토한 후 정확한 답변을 드립니다. 답변 내용은 추후 기록으로도 활용하실 수 있습니다.
          </div>

          {/* 성함·이메일 */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:textColor, marginBottom:4 }}>성함 <span style={{ color:C.red }}>*</span></div>
              <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="홍길동" style={inputStyle} />
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:textColor, marginBottom:4 }}>이메일 <span style={{ color:C.red }}>*</span></div>
              <input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="example@email.com" type="email" style={inputStyle} />
            </div>
          </div>

          {/* 연락처 선택 */}
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:11, fontWeight:700, color:textColor, marginBottom:4 }}>연락처 (선택)</div>
            <input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="긴급 시 연락이 필요한 경우만 기재" style={inputStyle} />
          </div>

          {/* 문의 내용 */}
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, fontWeight:700, color:textColor, marginBottom:4 }}>문의 내용 <span style={{ color:C.red }}>*</span></div>
            <textarea
              value={form.message}
              onChange={e=>setForm(f=>({...f,message:e.target.value}))}
              placeholder={`예시) 진단 결과 '보통 위험'으로 나왔는데, 상사의 반복되는 욕설이 괴롭힘에 해당하는지 궁금합니다. 증거로 녹음 파일이 있는데 쓸 수 있나요?`}
              rows={5}
              style={{ ...inputStyle, resize:"vertical", lineHeight:1.6, padding:"11px 12px" }}
            />
            <div style={{ textAlign:"right", fontSize:10, color:textColor, opacity:0.5, marginTop:3 }}>{form.message.length}자</div>
          </div>

          {error && <div style={{ fontSize:11, color:C.red, marginBottom:8 }}>⚠️ {error}</div>}
          <button onClick={handleSubmit} style={{ width:"100%", padding:"12px", borderRadius:9, background:C.gold, border:"none", color:C.navy, fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
            ✉️ 문의 보내기
          </button>
          <div style={{ marginTop:8, fontSize:10, color:textColor, textAlign:"center", opacity:0.7 }}>
            수집한 정보는 문의 답변 목적으로만 사용되며, 답변 완료 후 안전하게 관리됩니다.
          </div>
        </div>
      )}
    </div>
  );
}

// ── 진단 체크리스트 ───────────────────────────────────────────────────────────
