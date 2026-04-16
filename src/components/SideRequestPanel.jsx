import { useState } from "react";
import C from "../tokens/colors.js";
import { addSubmission } from "../utils/store.js";
import { isValidEmail, isValidPhone } from "../utils/validators.js";
import { Input } from "./common/FormElements.jsx";
import { ValidationMsg } from "./common/ValidationMsg.jsx";
import { PrivacyPolicyModal } from "./common/PrivacyPolicyModal.jsx";
import { PrivacyConsent } from "./common/PrivacyConsent.jsx";

export function SideRequestPanel() {
  const [open, setOpen] = useState(null); // "lecture"|"advisory"|"consulting"|null
  const [form, setForm] = useState({ name:"", company:"", email:"", phone:"", date:"", detail:"" });
  const [done, setDone] = useState(false);
  const [collapsed, setCollapsed] = useState(typeof window !== "undefined" && window.innerWidth <= 768);
  const F = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const reset = () => { setForm({ name:"", company:"", email:"", phone:"", date:"", detail:"" }); setDone(false); };

  const PANELS = {
    lecture: {
      icon:"🎓", label:"강의 요청", color:"#2980B9", storeKey:"lectures",
      title:"전문 강의 신청",
      desc:"직장내 괴롭힘 예방교육, 조직문화 개선, 성희롱 예방교육, 산업안전보건교육 등 법정의무교육을 포함한 다양한 강의를 전문 노무사가 직접 진행합니다.",
      items:["직장내 괴롭힘 예방교육 (예방 조치)", "직장내 성희롱 예방교육 (법정의무)", "산업안전보건교육 (법정의무)", "조직문화 개선 워크숍", "관리자 리더십·소통 교육", "고충처리위원 실무 교육", "기타 맞춤형 교육"],
      hasDate: true,
    },
    advisory: {
      icon:"💼", label:"자문 요청", color:"#8E44AD", storeKey:"advisory",
      title:"노무 자문 신청",
      desc:"직장내 괴롭힘 사건 처리, 조직문화 개선, 노사관계 안정, 노동법 준수 등 전반적인 노무 자문을 제공합니다. 사안별 맞춤 자문으로 기업의 법적 리스크를 최소화합니다.",
      items:["직장내 괴롭힘 사건 처리 자문", "취업규칙·인사규정 자문", "노사관계·단체교섭 자문", "노동법 준수 컴플라이언스", "인사·징계 절차 자문", "기타 노무 자문"],
      hasDate: false,
    },
    consulting: {
      icon:"📚", label:"교육 요청", color:"#D35400", storeKey:"consulting",
      title:"맞춤형 예방교육 신청",
      desc:"단순 법정 의무교육을 넘어, 조직문화 전반을 분석하여 기업 맞춤형 직장내 괴롭힘 예방교육을 설계·진행합니다. 상급자·하급자별 교육방식과 매뉴얼이 다르고, 연령대·업무 특성·조직문화에 맞는 차별화된 교육이 종합 예방체계 구축으로 이어집니다.",
      items:["상급자(관리자) 맞춤 예방교육", "하급자(실무자) 맞춤 예방교육", "연령별·세대별 맞춤 교육", "업무 특성별 교육 매뉴얼 제작", "조직문화 기반 종합 예방체계 구축", "교육 후 사후관리 프로그램"],
      hasDate: true,
    },
  };

  const panel = open ? PANELS[open] : null;
  const isValid = form.name && form.company && form.email && isValidEmail(form.email);

  // 모달
  const renderModal = () => {
    if (!panel) return null;
    if (done) return (
      <div style={{ position:"fixed", inset:0, background:"rgba(10,22,40,0.7)", backdropFilter:"blur(6px)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:32 }} onClick={() => { setOpen(null); reset(); }}>
        <div onClick={e => e.stopPropagation()} style={{ background:"white", borderRadius:16, padding:36, maxWidth:480, width:"100%", textAlign:"center", boxShadow:"0 24px 80px rgba(10,22,40,0.25)" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
          <h3 style={{ fontSize:18, fontWeight:800, color:"#0A1628", marginBottom:8 }}>{panel.label}이 접수되었습니다</h3>
          <p style={{ fontSize:13, color:"#8B8680", lineHeight:1.7, marginBottom:20 }}>담당 노무사가 영업일 1~2일 이내 연락드립니다.</p>
          <button onClick={() => { setOpen(null); reset(); }} style={{ padding:"12px 32px", borderRadius:8, background:panel.color, border:"none", color:"white", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>확인</button>
        </div>
      </div>
    );
    return (
      <div style={{ position:"fixed", inset:0, background:"rgba(10,22,40,0.7)", backdropFilter:"blur(6px)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:32 }} onClick={() => setOpen(null)}>
        <div onClick={e => e.stopPropagation()} style={{ background:"white", borderRadius:16, padding:0, maxWidth:560, width:"100%", maxHeight:"90vh", overflow:"auto", boxShadow:"0 24px 80px rgba(10,22,40,0.25)" }}>
          {/* 헤더 */}
          <div style={{ padding:"28px 32px 20px", borderBottom:"1px solid rgba(10,22,40,0.06)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:42, height:42, borderRadius:12, background:panel.color+"14", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{panel.icon}</div>
                <div>
                  <div style={{ fontSize:10, letterSpacing:"2px", color:panel.color, fontWeight:700, textTransform:"uppercase" }}>REQUEST</div>
                  <h3 style={{ fontSize:18, fontWeight:800, color:"#0A1628" }}>{panel.title}</h3>
                </div>
              </div>
              <button onClick={() => setOpen(null)} style={{ background:"none", border:"none", fontSize:20, color:"#8B8680", cursor:"pointer" }}>✕</button>
            </div>
            <p style={{ fontSize:13, color:"#8B8680", lineHeight:1.7, margin:0 }}>{panel.desc}</p>
          </div>
          {/* 서비스 항목 */}
          <div style={{ padding:"16px 32px", background:"rgba(10,22,40,0.015)" }}>
            <div style={{ fontSize:11, fontWeight:700, color:panel.color, marginBottom:8 }}>제공 서비스</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {panel.items.map(item => (
                <span key={item} style={{ padding:"4px 12px", borderRadius:100, background:panel.color+"10", border:"1px solid "+panel.color+"25", fontSize:11, color:panel.color, fontWeight:500 }}>{item}</span>
              ))}
            </div>
          </div>
          {/* 신청 폼 */}
          <div style={{ padding:"24px 32px 32px" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
              <div>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#8B8680", marginBottom:4 }}>신청자명 <span style={{ color:"#C0392B" }}>*</span></label>
                <input value={form.name} onChange={F("name")} placeholder="홍길동" style={{ width:"100%", padding:"10px 12px", borderRadius:6, border:"2px solid rgba(10,22,40,0.1)", fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
              </div>
              <div>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#8B8680", marginBottom:4 }}>기업/기관명 <span style={{ color:"#C0392B" }}>*</span></label>
                <input value={form.company} onChange={F("company")} placeholder="(주)화율인사이드" style={{ width:"100%", padding:"10px 12px", borderRadius:6, border:"2px solid rgba(10,22,40,0.1)", fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
              <div>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#8B8680", marginBottom:4 }}>이메일 <span style={{ color:"#C0392B" }}>*</span></label>
                <input value={form.email} onChange={F("email")} type="email" placeholder="example@email.com" style={{ width:"100%", padding:"10px 12px", borderRadius:6, border:"2px solid rgba(10,22,40,0.1)", fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
              </div>
              <div>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#8B8680", marginBottom:4 }}>연락처</label>
                <input value={form.phone} onChange={F("phone")} placeholder="010-0000-0000" style={{ width:"100%", padding:"10px 12px", borderRadius:6, border:"2px solid rgba(10,22,40,0.1)", fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
              </div>
            </div>
            {panel.hasDate && (
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#8B8680", marginBottom:4 }}>강의 예상 날짜</label>
                <input value={form.date} onChange={F("date")} type="date" style={{ width:"100%", padding:"10px 12px", borderRadius:6, border:"2px solid rgba(10,22,40,0.1)", fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
              </div>
            )}
            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#8B8680", marginBottom:4 }}>요청 내용</label>
              <textarea value={form.detail} onChange={F("detail")} rows={3} placeholder="요청하실 내용을 자유롭게 적어주세요." style={{ width:"100%", padding:"10px 12px", borderRadius:6, border:"2px solid rgba(10,22,40,0.1)", fontSize:13, fontFamily:"inherit", outline:"none", resize:"vertical", lineHeight:1.6, boxSizing:"border-box" }} />
            </div>
            <button onClick={() => { if(isValid) { addSubmission(panel.storeKey, { ...form, requestType:open }); setDone(true); } }} style={{ width:"100%", padding:"14px", borderRadius:10, background:isValid ? panel.color : "rgba(10,22,40,0.06)", border:"none", color:isValid ? "white" : "#8B8680", fontWeight:800, fontSize:14, cursor:isValid ? "pointer" : "not-allowed", fontFamily:"inherit", transition:"all 0.2s" }}>
              {panel.icon} {panel.label} 제출하기
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 사이드바 버튼 - 데스크톱 */}
      <div className="side-panel-desktop" style={{ position:"fixed", right:0, top:"50%", transform:"translateY(-50%)", zIndex:90, display:"flex", flexDirection:"column", gap:0 }}>
        {collapsed ? (
          <button onClick={() => setCollapsed(false)} style={{ padding:"12px 6px", background:"#0A1628", border:"none", borderRadius:"8px 0 0 8px", cursor:"pointer", boxShadow:"-2px 0 12px rgba(10,22,40,0.2)" }}>
            <div style={{ writingMode:"vertical-rl", fontSize:11, fontWeight:700, color:"#F4F1EB", letterSpacing:"2px" }}>요청</div>
          </button>
        ) : (
          <div style={{ background:"#0A1628", borderRadius:"12px 0 0 12px", overflow:"hidden", boxShadow:"-4px 0 20px rgba(10,22,40,0.3)" }}>
            <button onClick={() => setCollapsed(true)} style={{ width:"100%", padding:"6px", background:"rgba(255,255,255,0.05)", border:"none", borderBottom:"1px solid rgba(255,255,255,0.06)", cursor:"pointer", fontSize:10, color:"rgba(244,241,235,0.3)" }}>✕</button>
            {[
              { key:"lecture", icon:"🎓", label:"강의", color:"#2980B9" },
              { key:"advisory", icon:"💼", label:"자문", color:"#8E44AD" },
              { key:"consulting", icon:"📚", label:"교육", color:"#D35400" },
            ].map(item => (
              <button key={item.key} onClick={() => { setOpen(item.key); reset(); }} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"14px 10px", width:58, background:"transparent", border:"none", borderBottom:"1px solid rgba(255,255,255,0.06)", cursor:"pointer", transition:"all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = item.color+"20"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ fontSize:20 }}>{item.icon}</span>
                <span style={{ fontSize:9, fontWeight:700, color:"#F4F1EB", letterSpacing:"0.5px" }}>{item.label}</span>
                <div style={{ width:16, height:2, borderRadius:1, background:item.color, marginTop:2 }} />
              </button>
            ))}
          </div>
        )}
      </div>
      {/* 모바일 플로팅 버튼 - 챗봇 위쪽에 배치 */}
      <div className="side-panel-mobile" style={{ display:"none", position:"fixed", right:16, bottom:90, zIndex:90, flexDirection:"column", gap:10 }}>
        {Object.entries(PANELS).map(([key, p]) => (
          <button key={key} onClick={() => setOpen(key)} title={p.label} style={{ width:48, height:48, borderRadius:"50%", background:p.color, border:"3px solid white", boxShadow:"0 4px 14px rgba(0,0,0,0.3)", fontSize:20, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            {p.icon}
          </button>
        ))}
      </div>
      {/* 모달 */}
      {renderModal()}
    </>
  );
}


// ── 뉴스레터 구독 ───────────────────────────────────────────────────────────
