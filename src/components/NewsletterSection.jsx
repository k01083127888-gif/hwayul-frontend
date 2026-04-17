import { useState } from "react";
import C from "../tokens/colors.js";
import { addSubmission, _store } from "../utils/store.js";
import { isValidEmail } from "../utils/validators.js";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);

  const handleSubscribe = () => {
    if (email && isValidEmail(email)) {
      // 중복 이메일 체크
      const existing = _store.submissions.newsletters.find(
        r => r.email?.toLowerCase() === email.toLowerCase()
      );
      if (existing) {
        setAlreadySubscribed(true);
        return;
      }
      addSubmission("newsletters", { email, type:"newsletter", name:"(뉴스레터 구독)", source:"newsletter", marketing:true, consent:true });
      setSubscribed(true);
      setAlreadySubscribed(false);
    }
  };

  return (
    <section style={{ padding:"64px 32px", background:`linear-gradient(135deg, ${C.navy} 0%, #0D2140 100%)`, textAlign:"center" }}>
      <div style={{ maxWidth:640, margin:"0 auto" }}>
        <div style={{ fontSize:28, marginBottom:14 }}>📬</div>
        <h3 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:"clamp(1.1rem, 2.5vw, 1.4rem)", fontWeight:800, color:C.cream, marginBottom:8 }}>
          직장내 괴롭힘·조직문화 최신 소식을 받아보세요
        </h3>
        <p style={{ fontSize:13, color:"rgba(244,241,235,0.5)", lineHeight:1.7, marginBottom:28 }}>
          새로운 판례, 법령 개정, 산재 승인 사례, 조직문화 개선 사례, 예방교육 정보를<br/>이메일로 정기적으로 보내드립니다.
        </p>
        {subscribed ? (
          <div style={{ padding:"16px 24px", background:"rgba(26,122,74,0.12)", border:"1px solid rgba(26,122,74,0.3)", borderRadius:12, display:"inline-block" }}>
            <div style={{ fontSize:13, color:C.green, fontWeight:700 }}>✅ 구독이 완료되었습니다!</div>
            <div style={{ fontSize:11, color:"rgba(244,241,235,0.4)", marginTop:4 }}>매주 유익한 소식을 보내드리겠습니다.</div>
          </div>
        ) : (
          <div style={{ display:"flex", gap:10, maxWidth:440, margin:"0 auto", flexDirection:"column" }}>
            <div style={{ display:"flex", gap:10 }}>
              <input value={email} onChange={e => { setEmail(e.target.value); setAlreadySubscribed(false); }} onKeyDown={e => { if(e.key==="Enter") handleSubscribe(); }} type="email" placeholder="이메일 주소를 입력하세요" style={{ flex:1, padding:"13px 16px", borderRadius:10, border:`2px solid ${alreadySubscribed ? "rgba(192,57,43,0.5)" : "rgba(255,255,255,0.12)"}`, background:"rgba(255,255,255,0.06)", color:C.cream, fontSize:14, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
              <button onClick={handleSubscribe} style={{ padding:"13px 28px", borderRadius:10, background:isValidEmail(email) ? C.gold : "rgba(255,255,255,0.08)", border:"none", color:isValidEmail(email) ? C.navy : "rgba(255,255,255,0.3)", fontWeight:800, fontSize:14, cursor:isValidEmail(email) ? "pointer" : "not-allowed", fontFamily:"inherit", whiteSpace:"nowrap", transition:"all 0.2s" }}>
                구독하기
              </button>
            </div>
            {alreadySubscribed && (
              <div style={{ padding:"10px 14px", background:"rgba(201,168,76,0.12)", border:"1px solid rgba(201,168,76,0.3)", borderRadius:8, fontSize:12, color:C.goldLight, textAlign:"center" }}>
                📬 이미 구독 중인 이메일입니다. 매주 소식을 보내드리고 있습니다.
              </div>
            )}
          </div>
        )}
        <div style={{ marginTop:16, fontSize:11, color:"rgba(244,241,235,0.25)" }}>
          구독은 무료이며, 언제든 수신 거부할 수 있습니다.
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ① AI 상담 챗봇
// ══════════════════════════════════════════════════════════════════════════════
