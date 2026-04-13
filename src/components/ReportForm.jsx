import { useState } from "react";
import C from "../tokens/colors.js";
import { isValidEmail, isValidPhone } from "../utils/validators.js";
import { addSubmission } from "../utils/store.js";
import { Input, DarkInput } from "./common/FormElements.jsx";
import { ValidationMsg } from "./common/ValidationMsg.jsx";
import { PrivacyPolicyModal } from "./common/PrivacyPolicyModal.jsx";

// ── 리포트 받기 공통 컴포넌트 ────────────────────────────────────────────────
export function ReportForm({ type, resultData, dark = false, resultHtml = "", getResultHtml = null }) {
  // type: "checklist" | "culture"
  const [form, setForm] = useState({ email:"", name:"", phone:"", userType:"individual", orgName:"", orgSize:"", position:"", consent:false, marketing:false, detail:"" });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPrivacy, setShowPrivacy] = useState(false);
  const F = k => e => setForm(f => ({ ...f, [k]: typeof e === "string" ? e : e.target.value }));

  const isValid = form.email && form.name && form.consent && isValidEmail(form.email);
  const price = type === "checklist" ? "99,000" : "330,000";

  const validateReport = () => {
    const e = {};
    if (!form.name.trim()) e.name = "성명을 입력해 주세요.";
    if (!form.email.trim()) e.email = "이메일을 입력해 주세요.";
    else if (!isValidEmail(form.email)) e.email = "올바른 이메일 형식이 아닙니다.";
    if (form.phone && !isValidPhone(form.phone)) e.phone = "올바른 전화번호 형식이 아닙니다.";
    if (!form.consent) e.consent = "개인정보 수집·이용에 동의해 주세요.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validateReport()) return;
    const payload = {
      ...form,
      type,
      resultData: typeof resultData === "object" ? JSON.stringify(resultData) : resultData,
      resultHtml: getResultHtml ? getResultHtml() : resultHtml,
      submittedAt: new Date().toISOString(),
      source: "resultView",
    };
    // 결과지 발송 (즉시)
    addSubmission("resultEmails", { ...payload, status: "발송완료" });
    // 노무사 검토 요청 접수 (관리자 패널에서 검토 후 의견서 발송)
    addSubmission("reviewRequests", { ...payload, status: "신규" });
    setSubmitted(true);
  };

  if (submitted) {
    const bg = dark ? "rgba(13,115,119,0.12)" : "rgba(13,115,119,0.06)";
    const border = dark ? "rgba(13,115,119,0.3)" : "rgba(13,115,119,0.2)";
    const textColor = dark ? "rgba(244,241,235,0.8)" : "#3A3530";
    return (
      <div style={{ padding:32, background:bg, border:`2px solid ${border}`, borderRadius:16, textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
        <h4 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:18, fontWeight:800, color:dark ? C.cream : C.navy, marginBottom:10 }}>검토 리포트 신청이 접수되었습니다</h4>
        <div style={{ display:"inline-block", padding:"10px 20px", background:dark?"rgba(201,168,76,0.1)":"rgba(13,115,119,0.08)", border:`1px solid ${dark?"rgba(201,168,76,0.3)":"rgba(13,115,119,0.25)"}`, borderRadius:10, marginBottom:14 }}>
          <div style={{ fontSize:13, fontWeight:800, color:dark?C.gold:C.teal }}>📋 노무사 검토 리포트 신청 접수 ({price}원)</div>
          <div style={{ fontSize:12, color:dark?"rgba(244,241,235,0.6)":"#5A4A30", marginTop:3 }}>{form.email}</div>
        </div>
        <p style={{ fontSize:13, color:textColor, lineHeight:1.85, marginBottom:10 }}>
          결제 안내가 이메일로 발송되었습니다.<br/>
          결제 확인 후 전문 노무사가 진단 결과를 검토하여<br/>
          <strong style={{ color:dark?C.gold:"#A0720A" }}>맞춤형 검토 의견서를 영업일 2일 이내 이메일로 보내드립니다.</strong>
        </p>
        <div style={{ padding:"12px 18px", background:dark?"rgba(201,168,76,0.08)":"rgba(13,115,119,0.06)", border:`1px solid ${dark?"rgba(201,168,76,0.25)":"rgba(13,115,119,0.2)"}`, borderRadius:10, marginBottom:12, lineHeight:1.8 }}>
          <div style={{ fontSize:12, fontWeight:700, color:dark?C.gold:C.teal, marginBottom:4 }}>💳 입금 계좌 안내</div>
          <div style={{ fontSize:13, fontWeight:800, color:dark?C.cream:C.navy }}>하나은행 824-910010-97104</div>
          <div style={{ fontSize:12, color:dark?"rgba(244,241,235,0.6)":"#5A4A30" }}>예금주: 화율랩스</div>
        </div>
        <div style={{ padding:"10px 14px", background:dark?"rgba(255,255,255,0.04)":"rgba(10,22,40,0.03)", borderRadius:8, fontSize:11, color:dark?"rgba(244,241,235,0.4)":C.gray, lineHeight:1.7 }}>
          긴급한 사항은 <strong>02-2088-1767</strong>로 연락 주세요.<br/>
          평일 09:00~18:00 운영
        </div>
        {form.marketing && (
          <p style={{ fontSize:11, color:dark?"rgba(244,241,235,0.35)":C.gray, marginTop:10 }}>
            📬 직장내 괴롭힘 예방·대응 관련 유익한 정보도 정기적으로 보내드리겠습니다.
          </p>
        )}
      </div>
    );
  }

  const label = type === "checklist" ? "직장내 괴롭힘 진단" : "조직문화(괴롭힘 위험도) 진단";
  const cardBg = dark ? "rgba(255,255,255,0.04)" : "white";
  const cardBorder = dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(10,22,40,0.08)";
  const titleColor = dark ? C.cream : C.navy;
  const descColor = dark ? "rgba(244,241,235,0.55)" : C.gray;
  const tagColor = dark ? C.gold : C.teal;

  return (
    <div style={{ background:cardBg, borderRadius:16, padding:32, border:cardBorder, position:"relative", zIndex:1 }}>
      {/* 헤더 */}
      <div style={{ display:"flex", alignItems:"flex-start", gap:16, marginBottom:24 }}>
        <div style={{ width:52, height:52, borderRadius:14, background:dark ? "rgba(201,168,76,0.12)" : `${C.teal}12`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>📄</div>
        <div>
          <div style={{ fontSize:10, letterSpacing:"2px", color:tagColor, fontWeight:700, textTransform:"uppercase", marginBottom:4 }}>EXPERT REVIEW</div>
          <h4 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:17, fontWeight:800, color:titleColor, marginBottom:6 }}>전문 노무사 검토 리포트 받기 <span style={{ fontSize:12, fontWeight:600, color:dark ? C.gold : C.teal }}>(유료)</span></h4>
          <div style={{ display:"inline-flex", alignItems:"baseline", gap:6, padding:"6px 14px", background:dark ? "rgba(201,168,76,0.12)" : "rgba(13,115,119,0.08)", borderRadius:8, marginBottom:8 }}>
            <span style={{ fontSize:22, fontWeight:900, color:dark ? C.gold : C.teal }}>{price}원</span>
            <span style={{ fontSize:11, color:dark ? "rgba(244,241,235,0.5)" : C.gray }}>(VAT 포함)</span>
          </div>
          <p style={{ fontSize:13, color:descColor, lineHeight:1.7, margin:"0 0 8px 0" }}>
            진단 결과를 바탕으로 전문 노무사가 작성한 <strong style={{ color:titleColor }}>맞춤형 상세 리포트</strong>를 이메일로 받아보세요. {type === "checklist" ? "법적 판단 근거, 증거 수집 가이드, 구제 절차 안내가 포함됩니다." : "조직별 위험 요인 분석, 우선순위 개선 과제, 법적 의무사항이 포함됩니다."}
          </p>
          <div style={{ fontSize:12, color:descColor, lineHeight:2, margin:0 }}>
            <div>✔ 공인노무사가 1시간 이상 직접 검수하여 작성합니다</div>
            <div>✔ 신청일 기준 7일 이내 발송</div>
          </div>
        </div>
      </div>

      {/* 리포트에 포함되는 항목 */}
      <div style={{ padding:"14px 18px", background:dark ? "rgba(201,168,76,0.06)" : `${C.teal}06`, borderRadius:10, marginBottom:24, borderLeft:dark ? `3px solid ${C.gold}` : `3px solid ${C.teal}` }}>
        <div style={{ fontSize:11, fontWeight:700, color:tagColor, marginBottom:8 }}>📋 리포트 포함 내용</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
          {(type === "checklist" ? [
            "진단 결과 종합 분석", "법적 성립 가능성 상세 검토",
            "해당 행위유형별 법적 근거", "증거 수집·보관 실무 가이드",
            "단계별 구제 절차 안내", "전문 노무사 소견 및 권고"
          ] : [
            "조직 위험도 종합 분석", "6개 영역별 상세 진단",
            "핵심 위험 신호 분석", "법적 의무사항 체크리스트",
            "우선순위 개선 과제 제안", "맞춤형 예방교육 안내"
          ]).map(item => (
            <div key={item} style={{ display:"flex", gap:6, alignItems:"center" }}>
              <span style={{ color:C.green, fontSize:12 }}>✓</span>
              <span style={{ fontSize:12, color:dark ? "rgba(244,241,235,0.6)" : "#4A4540" }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 개인/기업 구분 */}
      <div style={{ marginBottom:18 }}>
        <label style={{ display:"block", fontSize:12, fontWeight:700, color:dark ? "rgba(244,241,235,0.55)" : C.gray, marginBottom:8, letterSpacing:"0.5px", textTransform:"uppercase" }}>
          이용 유형 <span style={{ color:C.red }}>*</span>
        </label>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {[
            { v:"individual", icon:"👤", l:"개인 (근로자)", d:"괴롭힘 피해 확인·대응 목적" },
            { v:"corporate",  icon:"🏢", l:"기업 (HR/관리자)", d:"조직 리스크 점검·예방 목적" },
          ].map(opt => {
            const sel = form.userType === opt.v;
            return (
              <button key={opt.v} onClick={() => setForm(f => ({ ...f, userType: opt.v }))} style={{
                padding:"16px", borderRadius:12, textAlign:"left", cursor:"pointer", fontFamily:"inherit",
                border:sel ? `2px solid ${dark ? C.gold : C.teal}` : `2px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(10,22,40,0.08)"}`,
                background:sel ? (dark ? "rgba(201,168,76,0.08)" : `${C.teal}08`) : (dark ? "rgba(255,255,255,0.02)" : "rgba(10,22,40,0.01)"),
                transition:"all 0.2s",
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                  <span style={{ fontSize:20 }}>{opt.icon}</span>
                  <span style={{ fontSize:14, fontWeight:sel ? 700 : 500, color:sel ? (dark ? C.gold : C.teal) : (dark ? C.cream : C.navy) }}>{opt.l}</span>
                </div>
                <div style={{ fontSize:11, color:dark ? "rgba(244,241,235,0.4)" : C.gray, paddingLeft:30 }}>{opt.d}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 입력 필드 */}
      <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:18 }}>
        <div className="form-grid-2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          {dark
            ? <DarkInput label="성명" value={form.name} onChange={F("name")} placeholder="홍길동" required />
            : <Input label="성명" value={form.name} onChange={F("name")} placeholder="홍길동" required />
          }
          {dark
            ? <DarkInput label="이메일" value={form.email} onChange={F("email")} placeholder="example@email.com" type="email" required />
            : <Input label="이메일" value={form.email} onChange={F("email")} placeholder="example@email.com" type="email" required />
          }
        </div>
        <div className="form-grid-2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          {dark
            ? <DarkInput label="연락처 (선택)" value={form.phone} onChange={F("phone")} placeholder="010-0000-0000" type="tel" />
            : <Input label="연락처 (선택)" value={form.phone} onChange={F("phone")} placeholder="010-0000-0000" type="tel" />
          }
          {form.userType === "corporate" ? (
            dark
              ? <DarkInput label="소속 기업/기관명" value={form.orgName} onChange={F("orgName")} placeholder="(주)화율인사이드" required />
              : <Input label="소속 기업/기관명" value={form.orgName} onChange={F("orgName")} placeholder="(주)화율인사이드" required />
          ) : (
            dark
              ? <DarkInput label="직위/직급 (선택)" value={form.position} onChange={F("position")} placeholder="예: 대리, 팀원 등" />
              : <Input label="직위/직급 (선택)" value={form.position} onChange={F("position")} placeholder="예: 대리, 팀원 등" />
          )}
        </div>
        {form.userType === "corporate" && (
          <div className="form-grid-2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:dark ? "rgba(244,241,235,0.55)" : C.gray, marginBottom:6, letterSpacing:"0.5px", textTransform:"uppercase" }}>기업 규모</label>
              <select value={form.orgSize} onChange={F("orgSize")} style={{ width:"100%", padding:"11px 14px", borderRadius:8, border:dark ? "2px solid rgba(255,255,255,0.12)" : `2px solid ${C.grayLight}`, fontSize:14, fontFamily:"inherit", outline:"none", background:dark ? "rgba(255,255,255,0.05)" : "white", color:dark ? (form.orgSize ? C.cream : "rgba(244,241,235,0.4)") : (form.orgSize ? C.navy : C.gray) }}>
                <option value="">-- 선택 --</option>
                <option value="5미만">5인 미만</option>
                <option value="5-30">5~30인</option>
                <option value="30-100">30~100인</option>
                <option value="100-300">100~300인</option>
                <option value="300+">300인 이상</option>
              </select>
            </div>
            {dark
              ? <DarkInput label="직위/부서" value={form.position} onChange={F("position")} placeholder="예: HR팀장, 인사담당 등" />
              : <Input label="직위/부서" value={form.position} onChange={F("position")} placeholder="예: HR팀장, 인사담당 등" />
            }
          </div>
        )}
      </div>

      {/* 구체적 내용 */}
      <div style={{ marginBottom:18 }}>
        <label style={{ display:"block", fontSize:12, fontWeight:700, color:dark ? "rgba(244,241,235,0.55)" : C.gray, marginBottom:6, letterSpacing:"0.5px", textTransform:"uppercase" }}>
          상세 내용 · 문의사항 <span style={{ fontSize:10, fontWeight:400 }}>(선택)</span>
        </label>
        <textarea value={form.detail} onChange={e => setForm(f => ({ ...f, detail: e.target.value }))} placeholder={type === "checklist" ? "괴롭힘 상황, 추가 문의사항, 리포트에 반영해 주셨으면 하는 내용 등을 자유롭게 작성해 주세요." : "조직의 특수한 상황, 개선이 시급한 영역, 추가 문의사항 등을 자유롭게 작성해 주세요."} rows={3} style={{
          width:"100%", padding:"12px 14px", borderRadius:8, fontSize:13, fontFamily:"inherit", outline:"none", resize:"vertical", lineHeight:1.7, boxSizing:"border-box",
          border:dark ? "2px solid rgba(255,255,255,0.12)" : "2px solid rgba(10,22,40,0.1)",
          background:dark ? "rgba(255,255,255,0.05)" : "white",
          color:dark ? C.cream : C.navy,
        }} />
      </div>

      {/* 동의 항목 */}
      <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:22 }}>
        <label onClick={() => setForm(f => ({ ...f, consent: !f.consent }))} style={{ display:"flex", gap:10, alignItems:"flex-start", cursor:"pointer", padding:"10px 14px", borderRadius:8, background:dark ? "rgba(255,255,255,0.02)" : "rgba(10,22,40,0.02)", border:dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(10,22,40,0.06)" }}>
          <div style={{ width:18, height:18, borderRadius:4, border:`2px solid ${form.consent ? C.teal : (dark ? "rgba(255,255,255,0.2)" : "rgba(10,22,40,0.15)")}`, background:form.consent ? C.teal : "transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
            {form.consent && <span style={{ color:"white", fontSize:10, fontWeight:900 }}>✓</span>}
          </div>
          <div>
            <span style={{ fontSize:12, fontWeight:600, color:dark ? C.cream : C.navy }}>[필수] 개인정보 수집·이용 동의</span>
            <div style={{ fontSize:11, color:dark ? "rgba(244,241,235,0.4)" : C.gray, marginTop:3, lineHeight:1.6 }}>
              수집 항목: 성명, 이메일, 연락처, 소속 정보 | 이용 목적: 진단 리포트 발송, 상담 연락 | 보유 기간: 수집 목적 달성 후 1년
            </div>
          </div>
        </label>
        <button onClick={e => { e.preventDefault(); e.stopPropagation(); setShowPrivacy(true); }} style={{ fontSize:11, color:C.teal, fontWeight:600, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", padding:"4px 0", marginTop:2, marginBottom:4 }}>📋 개인정보 처리방침 전문 보기 →</button>
        <ValidationMsg show={errors.email} msg={errors.email} />
        <ValidationMsg show={errors.name} msg={errors.name} />
        <ValidationMsg show={errors.phone} msg={errors.phone} />
        <ValidationMsg show={errors.consent} msg={errors.consent} />
        <label onClick={() => setForm(f => ({ ...f, marketing: !f.marketing }))} style={{ display:"flex", gap:10, alignItems:"flex-start", cursor:"pointer", padding:"10px 14px", borderRadius:8, background:dark ? "rgba(255,255,255,0.02)" : "rgba(10,22,40,0.02)", border:dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(10,22,40,0.06)" }}>
          <div style={{ width:18, height:18, borderRadius:4, border:`2px solid ${form.marketing ? C.gold : (dark ? "rgba(255,255,255,0.2)" : "rgba(10,22,40,0.15)")}`, background:form.marketing ? C.gold : "transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
            {form.marketing && <span style={{ color:C.navy, fontSize:10, fontWeight:900 }}>✓</span>}
          </div>
          <div>
            <span style={{ fontSize:12, fontWeight:600, color:dark ? C.cream : C.navy }}>[선택] 마케팅 정보 수신 동의</span>
            <div style={{ fontSize:11, color:dark ? "rgba(244,241,235,0.4)" : C.gray, marginTop:3, lineHeight:1.6 }}>
              직장내 괴롭힘 예방 교육 안내, 법령 개정 소식, 판례 업데이트, 세미나·강의 초대 등 유익한 정보를 이메일로 보내드립니다. 언제든 수신 거부할 수 있습니다.
            </div>
          </div>
        </label>
      </div>

      {/* 제출 */}
      <button onClick={handleSubmit} style={{
        width:"100%", padding:"16px", borderRadius:10,
        background:isValid ? (dark ? C.gold : C.teal) : (dark ? "rgba(255,255,255,0.12)" : "rgba(10,22,40,0.08)"),
        border:"none", color:isValid ? (dark ? C.navy : "white") : (dark ? "rgba(255,255,255,0.45)" : C.gray),
        fontWeight:800, fontSize:15, cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s",
      }}>
        📄 노무사 검토 리포트 신청 ({price}원)
      </button>
      <div style={{ textAlign:"center", fontSize:11, color:dark ? "rgba(244,241,235,0.35)" : "rgba(10,22,40,0.35)", marginTop:10, lineHeight:1.7 }}>
        * 신청 후 결제 안내가 이메일로 발송됩니다<br/>
        입력하신 정보는 노무사법 제37조에 따라 비밀이 유지됩니다
      </div>
      <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} dark={dark} />
    </div>
  );
}
