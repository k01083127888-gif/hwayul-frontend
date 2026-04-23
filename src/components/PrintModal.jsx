import { useState, useRef } from "react";
import C from "../tokens/colors.js";
import { isValidEmail } from "../utils/validators.js";
import { addSubmission } from "../utils/store.js";

// ── 출력 모달 ──────────────────────────────────────────────────────────────
export function PrintModal({ isOpen, onClose, getHtml, type }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [sent, setSent] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const iframeRef = useRef(null);

  if (!isOpen) return null;

  const handleSendEmail = () => {
    if (email && isValidEmail(email) && consent) {
      const html = getHtml().replace(/<script>window\.onload.*?<\/script>/g, '');
      // 1) DB에 접수 기록
      addSubmission("resultEmails", { email, type, userType:"unknown", name:"(결과지 요청)", marketing:true, consent:true, resultHtml:html, source:"resultView" });
      // 2) 실제 이메일 발송
      const typeLabel = type === "checklist" ? "직장내 괴롭힘 진단"
        : type === "accused" ? "피지목인 자가진단"
        : type === "sanjae" ? "산재 상담 필요성 체크"
        : type === "company" ? "사내 괴롭힘 조사 필요성 체크"
        : type === "culture" ? "조직문화 진단"
        : "진단";
      fetch("https://hwayul-backend-production-96cf.up.railway.app/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject: `[Q인사이드] ${typeLabel} 결과지`,
          html,
        }),
      }).catch(e => console.log("결과지 이메일 발송 실패(무시):", e.message));
      setSent(true);
    }
  };

  const handleViewReport = () => {
    setShowReport(true);
    setTimeout(() => {
      if (iframeRef.current) {
        const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
        // Remove the auto-print script
        const html = getHtml().replace(/<script>window\.onload.*?<\/script>/g, '');
        doc.open();
        doc.write(html);
        doc.close();
      }
    }, 100);
  };

  // 결과지 오버레이 뷰
  if (showReport) {
    return (
      <div style={{ position:"fixed", inset:0, zIndex:10000, background:"rgba(10,22,40,0.85)", backdropFilter:"blur(8px)", display:"flex", flexDirection:"column" }}>
        {/* 상단 바 */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 28px", background:C.navy, borderBottom:`1px solid rgba(201,168,76,0.2)` }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:18 }}>📄</span>
            <div>
              <div style={{ fontSize:14, fontWeight:800, color:C.cream }}>진단 결과 보고서</div>
              <div style={{ fontSize:10, color:"rgba(244,241,235,0.4)" }}>Q인사이드 · {type === "checklist" ? "직장내 괴롭힘 진단" : "조직문화 진단"}</div>
            </div>
          </div>
          <button onClick={() => setShowReport(false)} style={{ padding:"8px 20px", borderRadius:6, background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)", color:C.cream, fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>✕ 닫기</button>
        </div>
        {/* 보고서 iframe */}
        <div style={{ flex:1, display:"flex", justifyContent:"center", padding:"20px 20px 0", overflow:"auto", background:"rgba(10,22,40,0.5)" }}>
          <div style={{ width:"100%", maxWidth:860, background:"white", borderRadius:"12px 12px 0 0", boxShadow:"0 -4px 40px rgba(0,0,0,0.3)", overflow:"hidden" }}>
            <iframe ref={iframeRef} style={{ width:"100%", height:"100%", border:"none", minHeight:"80vh" }} title="진단결과보고서" />
          </div>
        </div>
      </div>
    );
  }

  // 이메일 입력 모달
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(10,22,40,0.7)", backdropFilter:"blur(6px)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:32 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:"white", borderRadius:20, padding:36, maxWidth:480, width:"100%", boxShadow:"0 24px 80px rgba(10,22,40,0.25)" }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📄</div>
          <h3 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:19, fontWeight:800, color:C.navy, marginBottom:6 }}>진단 결과지</h3>
          <p style={{ fontSize:13, color:C.gray, lineHeight:1.7 }}>이메일을 남겨주시면 결과를 이메일로도 전달해 드리고,<br/>직장내 괴롭힘과 조직문화 관련 유익한 정보도 보내드립니다.</p>
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={{ display:"block", fontSize:12, fontWeight:700, color:C.gray, marginBottom:6 }}>이메일 주소</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="example@email.com" style={{ width:"100%", padding:"12px 14px", borderRadius:8, border:"2px solid rgba(10,22,40,0.1)", fontSize:14, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
        </div>
        {email && (
          <label onClick={() => setConsent(!consent)} style={{ display:"flex", gap:10, alignItems:"flex-start", cursor:"pointer", padding:"10px 14px", borderRadius:8, background:"rgba(10,22,40,0.02)", border:"1px solid rgba(10,22,40,0.06)", marginBottom:20 }}>
            <div style={{ width:18, height:18, borderRadius:4, border:`2px solid ${consent ? C.teal : "rgba(10,22,40,0.15)"}`, background:consent ? C.teal : "transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
              {consent && <span style={{ color:"white", fontSize:10, fontWeight:900 }}>✓</span>}
            </div>
            <span style={{ fontSize:11, color:C.gray, lineHeight:1.6 }}>이메일로 진단 결과 및 괴롭힘 예방·대응 관련 정보 수신에 동의합니다.</span>
          </label>
        )}
        {sent && <div style={{ textAlign:"center", marginBottom:14, padding:"10px 16px", background:"rgba(26,122,74,0.08)", borderRadius:8, fontSize:13, color:C.green, fontWeight:600 }}>✅ 진단결과지가 발송되었습니다.</div>}
        <div className="print-modal-buttons" style={{ display:"flex", gap:10 }}>
          <button onClick={handleViewReport} style={{ flex:2, padding:"14px", borderRadius:10, background:C.teal, border:"none", color:"white", fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap", wordBreak:"keep-all" }}>
            📄 진단결과지 보기
          </button>
          <button onClick={handleSendEmail} disabled={!email || !isValidEmail(email) || !consent || sent} style={{ flex:1, padding:"14px", borderRadius:10, background:(!email || !isValidEmail(email) || !consent || sent) ? "rgba(10,22,40,0.05)" : C.gold, border:"2px solid " + ((!email || !isValidEmail(email) || !consent || sent) ? "rgba(10,22,40,0.08)" : C.gold), color:(!email || !isValidEmail(email) || !consent || sent) ? C.gray : C.navy, fontWeight:700, fontSize:14, cursor:(!email || !isValidEmail(email) || !consent || sent) ? "not-allowed" : "pointer", fontFamily:"inherit", whiteSpace:"nowrap", wordBreak:"keep-all" }}>
            {sent ? "✅ 전송완료" : "📧 이메일 보내기"}
          </button>
        </div>
      </div>
    </div>
  );
}
