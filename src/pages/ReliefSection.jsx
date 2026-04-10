import { useState, useEffect } from "react";
import C from "../tokens/colors.js";
import { addSubmission } from "../utils/store.js";
import { isValidEmail, isValidPhone } from "../utils/validators.js";
import { DarkInput, DarkSectionTag } from "../components/common/FormElements.jsx";
import { ValidationMsg } from "../components/common/ValidationMsg.jsx";
import { PrivacyConsent } from "../components/common/PrivacyConsent.jsx";
import { PrivacyPolicyModal } from "../components/common/PrivacyPolicyModal.jsx";

const RELIEF_STEPS = [
  { step:1, icon:"📝", title:"신청서 접수",   desc:"성명·연락처·피해 내용 제출" },
  { step:2, icon:"📞", title:"초기 상담",     desc:"노무사 전화 상담 (48h 내)" },
  { step:3, icon:"🔍", title:"사안 분석",     desc:"증거 검토 · 법적 성립 판단" },
  { step:4, icon:"⚖️", title:"구제 전략 수립", desc:"진정·조정·소송 등 최적 경로" },
  { step:5, icon:"🛡️", title:"구제 실행",     desc:"고용노동부·법원 연계 지원" },
];

const RELIEF_METHODS = [
  { icon:"📮", title:"고용노동부 진정",        desc:"무료 · 가장 신속", tag:"추천", color:C.green,
    detail:"사업주의 직장내 괴롭힘 조사 의무 위반 시 과태료 부과 가능. 접수 후 14일 내 조사 착수 의무 있음. 온라인(민원24) 또는 지방관서 직접 접수 가능." },
  { icon:"⚖️", title:"노동위원회 구제신청",    desc:"부당징계·해고 연계 시", tag:"", color:C.blue,
    detail:"괴롭힘 피해 후 불이익 처우(징계·해고 등)를 받은 경우 노동위원회에 구제신청. 복직·임금지급·손해배상 명령 가능." },
  { icon:"💰", title:"민사 손해배상 청구",      desc:"정신적 피해 보상", tag:"", color:C.purple,
    detail:"민법 제750조 불법행위 손해배상. 정신적 피해에 대한 위자료 청구 가능. 형사소송과 병행 가능. 노무사·변호사 협력 연계 지원." },
  { icon:"🚨", title:"형사 고소",               desc:"폭행·모욕 등 중대행위", tag:"", color:C.red,
    detail:"폭행·상해·명예훼손·모욕죄 해당 시 형사 고소 가능. 증거 확보가 중요하며, 노무사와 변호사의 협력으로 진행. 합의·공탁 전략 수립." },
  { icon:"🤝", title:"노동청 조정·화해",        desc:"빠른 해결 원할 때", tag:"", color:C.teal,
    detail:"고용노동부 조정 절차를 통해 당사자 간 합의 도출. 평균 처리 기간 2~4주. 조정 성립 시 민사상 화해 효력 발생." },
];

// ── ReliefSection ─────────────────────────────────────────────────────────────────
export function ReliefSection() {
  const [form, setForm] = useState({ name:"", phone:"", email:"", situation:"", method:"", urgency:"", consent:false });
  const [done, setDone] = useState(false);
  const [openMethod, setOpenMethod] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPrivacy, setShowPrivacy] = useState(false);
  // 모바일 감지 (768px 이하)
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth <= 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const F = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const validateRelief = () => {
    const e = {};
    if (!form.name.trim()) e.name = "성명을 입력해 주세요.";
    if (!form.phone.trim()) e.phone = "연락처를 입력해 주세요.";
    else if (!isValidPhone(form.phone)) e.phone = "올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)";
    if (!form.email.trim()) e.email = "이메일을 입력해 주세요.";
    else if (!isValidEmail(form.email)) e.email = "올바른 이메일 형식이 아닙니다.";
    if (!form.situation.trim()) e.situation = "피해 내용을 작성해 주세요.";
    if (!form.consent) e.consent = "개인정보 수집·이용에 동의해 주세요.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const infoComplete = form.name && form.phone && form.email && form.situation && form.consent;

  if (done) return (
    <section style={{ padding:"80px 32px", background:`linear-gradient(160deg, #1a0a0a 0%, #2d0e0e 50%, #0A1628 100%)`, minHeight:"100vh", display:"flex", alignItems:"center" }}>
      <div style={{ maxWidth:600, margin:"0 auto", textAlign:"center" }}>
        <div style={{ fontSize:56, marginBottom:20 }}>🛡️✅</div>
        <h3 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:"1.5rem", fontWeight:800, color:C.cream, marginBottom:12 }}>피해자 구제 신청이 접수되었습니다</h3>
        <p style={{ color:"rgba(244,241,235,0.65)", lineHeight:1.9, marginBottom:28 }}>
          담당 노무사가 <strong style={{ color:C.gold }}>48시간 내</strong>에 직접 연락드립니다.<br/>접수하신 이메일로 확인 메일이 발송됩니다.
        </p>
        <div style={{ padding:"20px 24px", background:"rgba(192,57,43,0.12)", border:"1px solid rgba(192,57,43,0.35)", borderRadius:10, marginBottom:28, textAlign:"left" }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#FF8A80", marginBottom:10 }}>🔐 지금 당장 해두어야 할 것</div>
          {["모든 관련 메시지·이메일을 캡처 또는 출력하여 보관하세요", "피해 사실을 날짜·시간·장소·발언 내용 중심으로 메모해 두세요", "목격자가 있다면 성명과 연락처를 기록해 두세요", "진료·상담 기록이 있다면 영수증·소견서를 보관하세요"].map((t, i) => (
            <div key={i} style={{ display:"flex", gap:10, fontSize:13, color:"rgba(244,241,235,0.7)", lineHeight:1.6, marginBottom:6 }}>
              <span style={{ color:"#FF8A80", flexShrink:0 }}>✓</span>{t}
            </div>
          ))}
        </div>
        <button onClick={() => { setDone(false); setForm({ name:"", phone:"", email:"", situation:"", method:"", urgency:"" }); }} style={{ padding:"12px 32px", borderRadius:8, border:`2px solid rgba(255,255,255,0.2)`, background:"transparent", color:C.cream, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>새로 신청하기</button>
      </div>
    </section>
  );

  return (
    <section style={{ padding:"80px 32px", background:`linear-gradient(160deg, #0f0a1a 0%, #1a0d26 40%, ${C.navy} 100%)`, minHeight:"100vh" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:56 }}>
          <DarkSectionTag>VICTIM RELIEF</DarkSectionTag>
          <h2 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:"clamp(1.7rem, 3vw, 2.4rem)", fontWeight:900, color:C.cream, marginTop:8, letterSpacing:"-0.5px" }}>피해자 구제 지원</h2>
          <p style={{ color:"rgba(244,241,235,0.55)", marginTop:10, fontSize:14, lineHeight:1.8, maxWidth:560, margin:"10px auto 0" }}>
            직장내 괴롭힘 피해를 입으셨나요? 혼자 감당하지 않아도 됩니다.<br/>
            노무사가 법적 구제 절차 전 과정을 함께 합니다.
          </p>
        </div>

        {/* 구제 절차 타임라인 */}
        <div style={{ marginBottom:56 }}>
          <div style={{ fontSize:11, letterSpacing:"2px", color:C.gold, fontWeight:700, textTransform:"uppercase", marginBottom:20 }}>구제 진행 절차</div>
          <div style={{ display:"flex", gap:0, overflowX:"auto", paddingBottom:8 }}>
            {RELIEF_STEPS.map((s, i) => (
              <div key={s.step} style={{ display:"flex", alignItems:"center", flexShrink:0 }}>
                <div style={{ textAlign:"center", padding:"18px 16px", background:"rgba(255,255,255,0.04)", borderRadius:12, border:"1px solid rgba(255,255,255,0.07)", minWidth:110 }}>
                  <div style={{ fontSize:26, marginBottom:8 }}>{s.icon}</div>
                  <div style={{ fontSize:12, fontWeight:800, color:C.cream, marginBottom:4 }}>{s.title}</div>
                  <div style={{ fontSize:10, color:"rgba(244,241,235,0.4)", lineHeight:1.5 }}>{s.desc}</div>
                </div>
                {i < RELIEF_STEPS.length - 1 && <div style={{ width:28, height:2, background:`linear-gradient(90deg, ${C.teal}, ${C.gold})`, flexShrink:0, margin:"0 6px" }} />}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 24 : 32, alignItems:"start" }}>

          {/* 좌: 구제 방법 */}
          <div>
            <div style={{ fontSize:11, letterSpacing:"2px", color:C.gold, fontWeight:700, textTransform:"uppercase", marginBottom:18 }}>법적 구제 방법</div>
            <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
              {RELIEF_METHODS.map(m => {
                const open = openMethod === m.title;
                return (
                  <div key={m.title} style={{ background:"rgba(255,255,255,0.04)", borderRadius:12, border:`1px solid ${open ? m.color + "40" : "rgba(255,255,255,0.07)"}`, overflow:"hidden", transition:"all 0.2s" }}>
                    <div onClick={() => setOpenMethod(open ? null : m.title)} style={{ padding:"16px 18px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <span style={{ fontSize:22 }}>{m.icon}</span>
                        <div>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <span style={{ fontWeight:800, color:C.cream, fontSize:14 }}>{m.title}</span>
                            {m.tag && <span style={{ padding:"2px 7px", background:`${m.color}25`, border:`1px solid ${m.color}50`, borderRadius:4, fontSize:9, color:m.color, fontWeight:700 }}>{m.tag}</span>}
                          </div>
                          <div style={{ fontSize:12, color:"rgba(244,241,235,0.45)", marginTop:2 }}>{m.desc}</div>
                        </div>
                      </div>
                      <span style={{ color:"rgba(244,241,235,0.35)", fontSize:12 }}>{open ? "▲" : "▼"}</span>
                    </div>
                    {open && (
                      <div style={{ padding:"0 18px 16px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                        <p style={{ fontSize:13, color:"rgba(244,241,235,0.6)", lineHeight:1.7, marginTop:14 }}>{m.detail}</p>
                        <button onClick={() => { setForm(f => ({ ...f, method: m.title })); document.getElementById("relief-form")?.scrollIntoView({ behavior:"smooth" }); }} style={{ marginTop:12, padding:"8px 18px", background:m.color, border:"none", borderRadius:6, color:"white", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>이 방법으로 신청하기 →</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 우: 신청서 */}
          <div id="relief-form">
            <div style={{ fontSize:11, letterSpacing:"2px", color:C.gold, fontWeight:700, textTransform:"uppercase", marginBottom:18 }}>피해자 구제 신청서</div>

            <div style={{ padding:"13px 16px", background:"rgba(192,57,43,0.12)", border:"1px solid rgba(192,57,43,0.28)", borderRadius:8, marginBottom:22 }}>
              <span style={{ fontSize:13, color:"#FF8A80" }}>🔐 <strong>성명, 연락처, 이메일은 필수 항목입니다.</strong> 수집된 정보는 담당 노무사만 열람하며, 제3자에게 제공되지 않습니다.</span>
            </div>

            <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:16, padding:28, border:"1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:18 }}>
                <DarkInput label="성명" value={form.name} onChange={F("name")} placeholder="홍길동" required />
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  <DarkInput label="연락처" value={form.phone} onChange={F("phone")} placeholder="010-0000-0000" type="tel" required />
                  <DarkInput label="이메일" value={form.email} onChange={F("email")} placeholder="example@email.com" type="email" required />
                </div>
              </div>

              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontSize:12, fontWeight:700, color:"rgba(244,241,235,0.55)", marginBottom:8, letterSpacing:"0.5px", textTransform:"uppercase" }}>긴급도</label>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:9 }}>
                  {[{ v:"normal", l:"일반", c:"rgba(255,255,255,0.1)" }, { v:"urgent", l:"⚡ 빠른 상담 요청", c:C.orange }, { v:"emergency", l:"🚨 즉각 대응 필요", c:C.red }].map(u => (
                    <button key={u.v} onClick={() => setForm(f => ({ ...f, urgency:u.v }))} style={{ padding:"9px 6px", borderRadius:7, border:`2px solid ${form.urgency === u.v ? u.c : "rgba(255,255,255,0.09)"}`, background:form.urgency === u.v ? u.c+"20" : "rgba(255,255,255,0.02)", color:form.urgency === u.v ? (u.v === "normal" ? C.cream : u.c) : "rgba(244,241,235,0.5)", fontWeight:form.urgency === u.v ? 700 : 400, fontSize:11, cursor:"pointer", fontFamily:"inherit", textAlign:"center", lineHeight:1.4 }}>{u.l}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontSize:12, fontWeight:700, color:"rgba(244,241,235,0.55)", marginBottom:8, letterSpacing:"0.5px", textTransform:"uppercase" }}>희망 구제 방법 (선택)</label>
                <select value={form.method} onChange={F("method")} style={{ width:"100%", padding:"11px 14px", borderRadius:8, border:"2px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)", color:form.method ? C.cream : "rgba(244,241,235,0.4)", fontSize:14, fontFamily:"inherit", outline:"none" }}>
                  <option value="">-- 선택 (모르면 공란) --</option>
                  {RELIEF_METHODS.map(m => <option key={m.title} value={m.title} style={{ background:C.navy }}>{m.icon} {m.title}</option>)}
                </select>
              </div>

              <div style={{ marginBottom:24 }}>
                <label style={{ display:"block", fontSize:12, fontWeight:700, color:"rgba(244,241,235,0.55)", marginBottom:8, letterSpacing:"0.5px", textTransform:"uppercase" }}>
                  피해 내용 <span style={{ color:"#FF8A80" }}>*</span>
                </label>
                <textarea value={form.situation} onChange={F("situation")} placeholder="언제, 누구로부터, 어떤 행위를 당했는지 최대한 구체적으로 적어주세요. 작성 내용은 담당 노무사만 확인하며 비밀이 보장됩니다." rows={5} style={{ width:"100%", padding:"13px 14px", borderRadius:8, border:"2px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.04)", color:C.cream, fontSize:14, fontFamily:"inherit", outline:"none", resize:"vertical", lineHeight:1.7, boxSizing:"border-box" }}
                  onFocus={e => e.target.style.borderColor = C.tealLight}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                />
                <div style={{ textAlign:"right", fontSize:11, color:"rgba(244,241,235,0.3)", marginTop:4 }}>{form.situation.length}자</div>
              </div>

              <ValidationMsg show={errors.name} msg={errors.name} />
              <ValidationMsg show={errors.phone} msg={errors.phone} />
              <ValidationMsg show={errors.email} msg={errors.email} />
              <ValidationMsg show={errors.situation} msg={errors.situation} />
              <PrivacyConsent checked={form.consent} onChange={() => setForm(f => ({ ...f, consent:!f.consent }))} dark={true} onViewPolicy={() => setShowPrivacy(true)} />
              <ValidationMsg show={errors.consent} msg={errors.consent} />
              <button onClick={() => { if(validateRelief()) { addSubmission("relief", {...form}); setDone(true); } }} disabled={!infoComplete} style={{ width:"100%", padding:"16px", background:infoComplete ? C.red : "rgba(255,255,255,0.08)", border:"none", borderRadius:8, color:infoComplete ? "white" : "rgba(255,255,255,0.25)", fontWeight:800, fontSize:15, cursor:infoComplete ? "pointer" : "not-allowed", fontFamily:"inherit", transition:"all 0.2s" }}>
                🛡️ 피해자 구제 신청하기
              </button>
              <div style={{ textAlign:"center", fontSize:11, color:"rgba(244,241,235,0.3)", marginTop:10, lineHeight:1.6 }}>수집 정보는 노무사법 제37조 비밀유지 의무 적용 대상입니다</div>
              <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} dark={true} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}



// ── 관리자 이메일 작성기 ─────────────────────────────────────────────────────
