import { useState, useEffect } from "react";
import C from "../tokens/colors.js";
import { addSubmission } from "../utils/store.js";
import { isValidEmail, isValidPhone } from "../utils/validators.js";
import { Input, DarkInput, SectionTag, DarkSectionTag } from "../components/common/FormElements.jsx";
import { ValidationMsg } from "../components/common/ValidationMsg.jsx";
import { PrivacyConsent } from "../components/common/PrivacyConsent.jsx";
import { PrivacyPolicyModal } from "../components/common/PrivacyPolicyModal.jsx";

const API_BASE = "https://hwayul-backend-production-96cf.up.railway.app/api";

function sendConfirmEmail(form) {
  if (!form.email) return;
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, ".");
  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:'Noto Sans KR',sans-serif;color:#333;line-height:1.8;">
      <div style="background:#0A1628;padding:28px 24px;border-radius:12px 12px 0 0;">
        <h2 style="color:#F4F1EB;margin:0;font-size:18px;">화율인사이드</h2>
        <p style="color:rgba(244,241,235,0.6);margin:4px 0 0;font-size:12px;">직장내 괴롭힘 & 조직문화 전문 플랫폼</p>
      </div>
      <div style="padding:28px 24px;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;">
        <p style="font-size:15px;font-weight:700;margin-bottom:16px;">${form.name}님, 안녕하세요.</p>
        <p>화율인사이드 <strong>심층 상담 신청</strong>이 정상적으로 접수되었습니다.</p>

        <div style="background:#f8f7f5;padding:16px 18px;border-radius:8px;margin:20px 0;">
          <p style="font-size:13px;font-weight:700;color:#0A1628;margin:0 0 8px;">📋 신청 정보</p>
          <p style="font-size:13px;margin:4px 0;">• 성명: ${form.name}</p>
          <p style="font-size:13px;margin:4px 0;">• 연락처: ${form.phone}</p>
          ${form.company ? `<p style="font-size:13px;margin:4px 0;">• 회사명: ${form.company}</p>` : ""}
          <p style="font-size:13px;margin:4px 0;">• 신청일: ${today}</p>
        </div>

        <div style="background:#f8f7f5;padding:16px 18px;border-radius:8px;margin:20px 0;">
          <p style="font-size:13px;font-weight:700;color:#0A1628;margin:0 0 8px;">📞 진행 절차</p>
          <p style="font-size:13px;margin:4px 0;">1. 담당 노무사가 영업일 1일 내 연락드립니다</p>
          <p style="font-size:13px;margin:4px 0;">2. 1차 전화 상담 → 2차 서류 검토(1일) → 3차 대면 상담</p>
        </div>

        <div style="background:#FFF8E7;padding:16px 18px;border-radius:8px;border:1px solid #F0E6C8;margin:20px 0;">
          <p style="font-size:13px;font-weight:700;color:#8B7A40;margin:0 0 8px;">💳 입금 안내</p>
          <p style="font-size:13px;margin:4px 0;">• 금액: <strong>22만원 (VAT 포함)</strong></p>
          <p style="font-size:13px;margin:4px 0;">• 계좌: <strong>하나은행 824-910010-97104 (화율랩스)</strong></p>
          <p style="font-size:13px;margin:4px 0;">• 입금 확인 후 1차 전화 상담이 예약됩니다</p>
        </div>

        <p style="font-size:13px;margin-top:20px;">궁금한 점은 <strong>02-2088-1767</strong>로 연락 주세요. (평일 09:00~18:00)</p>
        <p style="font-size:13px;color:#999;margin-top:24px;padding-top:16px;border-top:1px solid #eee;">본 메일은 발신 전용이며, 상담 내용은 노무사법 제37조에 따라 비밀이 유지됩니다.</p>
      </div>
    </div>
  `;
  fetch(`${API_BASE}/send-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: form.email,
      subject: "[화율인사이드] 심층 상담 신청이 접수되었습니다",
      html,
    }),
  }).catch(e => console.log("확인 이메일 발송 실패(무시):", e.message));
}

// ── BizSection ─────────────────────────────────────────────────────────────────
export function BizSection() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name:"", company:"", phone:"", email:"", position:"", size:"", consultType:"", note:"", date:"", time:"", consent:false });
  const F = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth <= 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const TIMES = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
  const SIZES = ["10인 미만", "10~49인", "50~299인", "300인 이상"];

  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim()) e.name = "성명을 입력해 주세요.";
    if (!form.phone.trim()) e.phone = "연락처를 입력해 주세요.";
    else if (!isValidPhone(form.phone)) e.phone = "올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)";
    if (!form.email.trim()) e.email = "이메일을 입력해 주세요.";
    else if (!isValidEmail(form.email)) e.email = "올바른 이메일 형식이 아닙니다.";
    if (!form.consent) e.consent = "개인정보 수집·이용에 동의해 주세요.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const infoComplete = form.name && form.phone && form.email && form.consent;

  if (done) return (
    <section style={{ padding:"80px 32px", background:C.navyMid, minHeight:"100vh", display:"flex", alignItems:"center" }}>
      <div style={{ maxWidth:600, margin:"0 auto", textAlign:"center" }}>
        <div style={{ fontSize:56, marginBottom:20 }}>💼✅</div>
        <h3 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:"1.5rem", fontWeight:800, color:C.cream, marginBottom:12 }}>심층 상담 신청이 완료되었습니다</h3>
        <p style={{ color:"rgba(244,241,235,0.6)", lineHeight:1.8, marginBottom:28 }}>입력하신 연락처로 영업일 1일 이내 담당 노무사가 연락드립니다.<br/>확인 이메일이 발송되었습니다.</p>
        <div style={{ padding:"14px 18px", background:"rgba(201,168,76,0.1)", border:"1px solid rgba(201,168,76,0.28)", borderRadius:10, marginBottom:22, lineHeight:1.8, textAlign:"left" }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.gold, marginBottom:4 }}>💳 입금 계좌 안내 (VAT 포함 22만원)</div>
          <div style={{ fontSize:13, fontWeight:800, color:C.cream }}>하나은행 824-910010-97104</div>
          <div style={{ fontSize:12, color:"rgba(244,241,235,0.6)" }}>예금주: 화율랩스 · 입금 확인 후 1차 전화 상담 예약</div>
        </div>
        <div style={{ padding:"18px 24px", background:"rgba(201,168,76,0.1)", border:"1px solid rgba(201,168,76,0.25)", borderRadius:10, marginBottom:28 }}>
          <div style={{ fontSize:13, color:C.gold, fontWeight:700 }}>신청 정보</div>
          <div style={{ fontSize:13, color:"rgba(244,241,235,0.7)", marginTop:8, lineHeight:1.7 }}>
            {form.name} 님{form.company ? ` (${form.company})` : ""}{form.date && form.time ? <><br/>{form.date} {form.time}</> : <><br/><span style={{ fontSize:12, color:"rgba(244,241,235,0.45)" }}>일정은 담당 노무사와 별도 조율</span></>}
          </div>
        </div>
        <button onClick={() => { setDone(false); setStep(1); setForm({ name:"", company:"", phone:"", email:"", position:"", size:"", consultType:"", note:"", date:"", time:"" }); }} style={{ padding:"12px 32px", borderRadius:8, border:`2px solid rgba(255,255,255,0.2)`, background:"transparent", color:C.cream, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>새 예약하기</button>
      </div>
    </section>
  );

  return (
    <section style={{ padding:"80px 32px", background:C.navyMid, minHeight:"100vh" }}>
      <div style={{ maxWidth:820, margin:"0 auto" }}>
        <div style={{ marginBottom:28, textAlign:"center" }}>
          <DarkSectionTag>IN-DEPTH CONSULTATION</DarkSectionTag>
          <h2 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:"clamp(1.6rem, 3vw, 2.1rem)", fontWeight:800, color:C.cream, marginTop:8, letterSpacing:"-0.5px" }}>심층 상담 신청</h2>
          <p style={{ color:"rgba(244,241,235,0.55)", marginTop:8, fontSize:14 }}>개인·기업 모두 이용 가능. 사안을 깊이 들여다보고 최적 경로를 제안하는 유료 전문 상담입니다.</p>
        </div>

        {/* 심층 상담 패키지 안내 카드 */}
        <div style={{ marginBottom:30, padding:"22px 24px", background:"rgba(201,168,76,0.08)", border:"1.5px solid rgba(201,168,76,0.32)", borderRadius:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14, flexWrap:"wrap" }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.gold, letterSpacing:"1.5px" }}>심층 상담 패키지</div>
            <div style={{ display:"inline-flex", alignItems:"baseline", gap:5, padding:"4px 12px", background:"rgba(201,168,76,0.15)", borderRadius:100, border:"1px solid rgba(201,168,76,0.35)" }}>
              <span style={{ fontSize:16, fontWeight:900, color:C.goldLight }}>22만원</span>
              <span style={{ fontSize:10, color:"rgba(244,241,235,0.5)" }}>(VAT 포함)</span>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap:12, marginBottom:14 }}>
            {[
              { no:"1", icon:"📞", title:"1차 전화 상담", desc:"사안 청취 및 필요 서류 안내 (약 30분)" },
              { no:"2", icon:"📂", title:"2차 서류 검토", desc:"노무사 직접 검토 (1영업일 소요)" },
              { no:"3", icon:"🤝", title:"3차 대면 상담", desc:"검토 결과 기반 맞춤 대응 전략 제시" },
            ].map(p => (
              <div key={p.no} style={{ padding:"14px 14px", background:"rgba(10,22,40,0.55)", border:"1px solid rgba(201,168,76,0.2)", borderRadius:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                  <div style={{ width:22, height:22, borderRadius:"50%", background:C.gold, color:C.navy, fontSize:11, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" }}>{p.no}</div>
                  <span style={{ fontSize:18 }}>{p.icon}</span>
                  <span style={{ fontSize:13, fontWeight:800, color:C.cream }}>{p.title}</span>
                </div>
                <div style={{ fontSize:11, color:"rgba(244,241,235,0.55)", lineHeight:1.6 }}>{p.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ padding:"10px 14px", background:"rgba(13,115,119,0.15)", border:"1px dashed rgba(20,160,165,0.4)", borderRadius:8, fontSize:12, color:C.tealLight, lineHeight:1.6 }}>
            💡 <strong>해결 의뢰 전환 시 혜택:</strong> 상담 후 해결 의뢰로 전환하시면 상담료 22만원 전액을 착수금에서 차감해 드립니다.
          </div>
        </div>

        {/* 스텝 */}
        <div style={{ display:"flex", justifyContent:"center", gap:0, marginBottom:36 }}>
          {["신청자 정보", "상담 내용", "일정 선택 (선택)"].map((s, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center" }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                <div style={{ width:30, height:30, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", background:step > i + 1 ? C.gold : step === i + 1 ? "rgba(201,168,76,0.25)" : "rgba(255,255,255,0.07)", border:`2px solid ${step >= i + 1 ? C.gold : "rgba(255,255,255,0.1)"}`, color:step > i + 1 ? C.navy : step === i + 1 ? C.gold : "rgba(255,255,255,0.3)", fontWeight:800, fontSize:12 }}>
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span style={{ fontSize:10, color:step === i + 1 ? C.gold : "rgba(244,241,235,0.3)" }}>{s}</span>
              </div>
              {i < 2 && <div style={{ width:70, height:2, background:step > i + 1 ? C.gold : "rgba(255,255,255,0.08)", margin:"0 8px", marginBottom:20 }} />}
            </div>
          ))}
        </div>

        <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:16, padding:36, border:"1px solid rgba(255,255,255,0.07)" }}>

          {/* STEP 1 — 신청자 정보 (필수) */}
          {step === 1 && (
            <div>
              <div style={{ padding:"12px 16px", background:"rgba(192,57,43,0.12)", border:"1px solid rgba(192,57,43,0.3)", borderRadius:8, marginBottom:28 }}>
                <span style={{ fontSize:13, color:"#FF8A80" }}>⚠️ <strong>성명, 연락처, 이메일은 필수 입력 항목입니다.</strong> 담당 노무사가 직접 연락드립니다.</span>
              </div>
              <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:16, marginBottom:16 }}>
                <DarkInput label="성명" value={form.name} onChange={F("name")} placeholder="홍길동" required />
                <DarkInput label="직책·직급" value={form.position} onChange={F("position")} placeholder="인사팀장, HR담당자 등" />
                <DarkInput label="연락처" value={form.phone} onChange={F("phone")} placeholder="010-0000-0000" type="tel" required />
                <DarkInput label="이메일" value={form.email} onChange={F("email")} placeholder="hr@company.com" type="email" required />
                <DarkInput label="회사명 (선택)" value={form.company} onChange={F("company")} placeholder="개인이신 경우 비워두셔도 됩니다" />
                <div>
                  <label style={{ display:"block", fontSize:12, fontWeight:700, color:"rgba(244,241,235,0.55)", marginBottom:6, letterSpacing:"0.5px", textTransform:"uppercase" }}>사업장 규모</label>
                  <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:8 }}>
                    {SIZES.map(s => (
                      <button key={s} onClick={() => setForm(f => ({ ...f, size:s }))} style={{ padding:"9px", borderRadius:7, border:`2px solid ${form.size === s ? C.gold : "rgba(255,255,255,0.1)"}`, background:form.size === s ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.02)", color:form.size === s ? C.gold : "rgba(244,241,235,0.55)", fontWeight:form.size === s ? 700 : 400, fontSize:12, cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s" }}>{s}</button>
                    ))}
                  </div>
                </div>
              </div>
              <ValidationMsg show={errors.name} msg={errors.name} />
              <ValidationMsg show={errors.phone} msg={errors.phone} />
              <ValidationMsg show={errors.email} msg={errors.email} />
              <PrivacyConsent checked={form.consent} onChange={() => setForm(f => ({ ...f, consent:!f.consent }))} dark={true} onViewPolicy={() => setShowPrivacy(true)} />
              <ValidationMsg show={errors.consent} msg={errors.consent} />
              <button onClick={() => { if(validateStep1()) setStep(2); }} style={{ width:"100%", padding:"14px", background:infoComplete ? C.gold : "rgba(255,255,255,0.08)", border:"none", borderRadius:8, color:infoComplete ? C.navy : "rgba(255,255,255,0.28)", fontWeight:800, fontSize:15, cursor:infoComplete ? "pointer" : "not-allowed", fontFamily:"inherit", marginTop:8 }}>
                {infoComplete ? "다음 단계 →" : "필수 항목을 모두 입력해 주세요"}
              </button>
              <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} dark={true} />
            </div>
          )}

          {/* STEP 2 — 상담 내용 작성 */}
          {step === 2 && (
            <div>
              <h3 style={{ color:C.cream, fontWeight:700, marginBottom:8 }}>어떤 상황인지 알려주세요</h3>
              <p style={{ fontSize:12, color:"rgba(244,241,235,0.45)", marginBottom:22, lineHeight:1.7 }}>
                작성해주신 내용을 바탕으로 담당 노무사가 사전에 사안을 검토합니다.<br/>
                구체적으로 적어주실수록 1차 전화 상담 시간이 효율적으로 활용됩니다.
              </p>
              <div style={{ marginBottom:24 }}>
                <label style={{ display:"block", fontSize:12, fontWeight:700, color:"rgba(244,241,235,0.55)", marginBottom:8, letterSpacing:"0.5px", textTransform:"uppercase" }}>상담 요청 내용</label>
                <textarea
                  value={form.note}
                  onChange={F("note")}
                  placeholder={`예시) 상사의 부당지시와 폭언이 반복되어 직장내 괴롭힘에 해당하는지 판단받고 싶습니다. 관련 메시지 캡처가 있는데 증거로 쓸 수 있는지도 검토가 필요합니다.

또는) 사내에서 괴롭힘 신고가 접수됐는데 조사위원회 구성과 처리 절차, 사업주 법적 의무에 대해 상담받고 싶습니다.`}
                  rows={8}
                  style={{ width:"100%", padding:"14px", borderRadius:8, border:"2px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.04)", color:C.cream, fontSize:14, fontFamily:"inherit", outline:"none", resize:"vertical", lineHeight:1.7, boxSizing:"border-box" }}
                  onFocus={e => e.target.style.borderColor = C.goldLight}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                />
                <div style={{ textAlign:"right", fontSize:11, color:"rgba(244,241,235,0.3)", marginTop:4 }}>{(form.note || "").length}자</div>
              </div>
              <div style={{ display:"flex", gap:12 }}>
                <button onClick={() => setStep(1)} style={{ padding:"14px 22px", background:"rgba(255,255,255,0.06)", border:"none", borderRadius:8, color:"rgba(244,241,235,0.65)", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>← 이전</button>
                <button onClick={() => form.note.trim() && setStep(3)} style={{ flex:1, padding:"14px", background:form.note.trim() ? C.gold : "rgba(255,255,255,0.08)", border:"none", borderRadius:8, color:form.note.trim() ? C.navy : "rgba(255,255,255,0.28)", fontWeight:800, fontSize:14, cursor:form.note.trim() ? "pointer" : "not-allowed", fontFamily:"inherit" }}>일정 선택 →</button>
              </div>
              {form.note.trim() && (
                <div style={{ textAlign:"center", marginTop:10 }}>
                  <button onClick={() => { const diagData = (() => { try { const d = localStorage.getItem("hwayul_diag_for_biz"); localStorage.removeItem("hwayul_diag_for_biz"); return d || ""; } catch { return ""; } })(); addSubmission("biz", {...form, diagResult: diagData}); sendConfirmEmail(form); setDone(true); }} style={{ fontSize:12, color:"rgba(244,241,235,0.4)", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", textDecoration:"underline" }}>일정 선택 없이 바로 신청하기 →</button>
                </div>
              )}
            </div>
          )}

          {/* STEP 3 — 일정 */}
          {step === 3 && (
            <div>
              <h3 style={{ color:C.cream, fontWeight:700, marginBottom:22 }}>희망 일정을 선택하세요 <span style={{ fontSize:12, fontWeight:400, color:"rgba(244,241,235,0.4)" }}>(선택사항)</span></h3>
              <div style={{ marginBottom:20 }}>
                <label style={{ display:"block", fontSize:12, fontWeight:700, color:"rgba(244,241,235,0.55)", marginBottom:8, letterSpacing:"0.5px", textTransform:"uppercase" }}>날짜</label>
                <input type="date" value={form.date} onChange={F("date")} style={{ padding:"11px 14px", borderRadius:8, border:"2px solid rgba(255,255,255,0.13)", background:"rgba(255,255,255,0.05)", color:C.cream, fontSize:14, fontFamily:"inherit", outline:"none" }} />
              </div>
              <div style={{ marginBottom:28 }}>
                <label style={{ display:"block", fontSize:12, fontWeight:700, color:"rgba(244,241,235,0.55)", marginBottom:10, letterSpacing:"0.5px", textTransform:"uppercase" }}>시간</label>
                <div style={{ display:"grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap:9 }}>
                  {TIMES.map(t => (
                    <button key={t} onClick={() => setForm(f => ({ ...f, time:t }))} style={{ padding:"11px", borderRadius:8, border:`2px solid ${form.time === t ? C.gold : "rgba(255,255,255,0.1)"}`, background:form.time === t ? "rgba(201,168,76,0.14)" : "rgba(255,255,255,0.02)", color:form.time === t ? C.gold : "rgba(244,241,235,0.55)", fontWeight:form.time === t ? 700 : 400, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>{t}</button>
                  ))}
                </div>
              </div>
              {form.date && form.time && (
                <div style={{ padding:"14px 18px", background:"rgba(201,168,76,0.08)", border:"1px solid rgba(201,168,76,0.2)", borderRadius:8, marginBottom:22 }}>
                  <div style={{ fontSize:13, color:C.gold }}>📅 예약 요약: {form.name} 님{form.company ? ` (${form.company})` : ""} · {form.date} {form.time}</div>
                </div>
              )}
              <div style={{ display:"flex", gap:12 }}>
                <button onClick={() => setStep(2)} style={{ padding:"14px 22px", background:"rgba(255,255,255,0.06)", border:"none", borderRadius:8, color:"rgba(244,241,235,0.65)", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>← 이전</button>
                <button onClick={() => { const diagData = (() => { try { const d = localStorage.getItem("hwayul_diag_for_biz"); localStorage.removeItem("hwayul_diag_for_biz"); return d || ""; } catch { return ""; } })(); addSubmission("biz", {...form, diagResult: diagData}); sendConfirmEmail(form); setDone(true); }} style={{ flex:1, padding:"14px", background:C.gold, border:"none", borderRadius:8, color:C.navy, fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>{form.date && form.time ? "예약 확정하기 ✓" : "일정 없이 상담 신청하기 →"}</button>
              </div>
              {!form.date && !form.time && (
                <div style={{ textAlign:"center", fontSize:11, color:"rgba(244,241,235,0.35)", marginTop:10 }}>일정을 선택하지 않으시면 담당 노무사가 연락하여 일정을 조율합니다.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── 피해자 구제 ───────────────────────────────────────────────────────────────
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

