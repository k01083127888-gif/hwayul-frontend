import { useState, useEffect } from "react";
import C from "../tokens/colors.js";
import { addSubmission } from "../utils/store.js";
import { isValidEmail, isValidPhone } from "../utils/validators.js";
import { DarkInput, DarkSectionTag } from "../components/common/FormElements.jsx";
import { ValidationMsg } from "../components/common/ValidationMsg.jsx";
import { PrivacyConsent } from "../components/common/PrivacyConsent.jsx";
import { PrivacyPolicyModal } from "../components/common/PrivacyPolicyModal.jsx";

// ── 3개 트랙 서비스 정의 ─────────────────────────────────────────────────
const TRACKS = [
  {
    id: "victim",
    no: "트랙 1",
    icon: "🛡️",
    title: "피해자 구제",
    subtitle: "괴롭힘 피해 신고·조사 대응",
    accent: C.teal,
    accentLight: C.tealLight,
    badge: null,
    services: [
      "증거수집 컨설팅",
      "사내 신고서 작성 대행",
      "노동청 진정 대리",
      "노동위원회 구제신청",
      "산재 신청",
      "내용증명 발송",
    ],
    fees: [
      { label: "노동청 진정 / 노동위 구제신청", value: "착수금 50만원 + 성공보수 150만원" },
      { label: "산재 신청",                   value: "착수금 50만원 + 성공보수 10%" },
      { label: "내용증명 발송",                value: "별도 문의" },
      { label: "증거수집 컨설팅",              value: "별도 문의" },
    ],
    differentiator: "가격 투명성 · AI 진단 무료 연계",
    formLabel: "피해 내용",
    formPlaceholder: "언제, 누구로부터, 어떤 행위를 당했는지 최대한 구체적으로 적어주세요. 작성 내용은 담당 노무사만 확인하며 비밀이 보장됩니다.",
    ctaText: "피해자 구제 신청하기",
  },
  {
    id: "accused",
    no: "트랙 2",
    icon: "⚖️",
    title: "피지목인 항변",
    subtitle: "신고당한 사람의 방어 지원",
    accent: C.gold,
    accentLight: C.goldLight,
    badge: "블루오션",
    services: [
      "사건 경위의견서 작성",
      "사내 조사 동행대리",
      "2차 가해 방어",
      "징계 대응·소명",
      "무고·명예훼손 역대응 검토",
    ],
    fees: [
      { label: "기본 대응 수임료",              value: "300만원" },
      { label: "민사·형사 대응",               value: "별도 협의" },
    ],
    differentiator: "전용 플랫폼 희소 · 커리어 보호 최우선",
    formLabel: "지목 상황 및 소명 포인트",
    formPlaceholder: "언제, 어떤 행위로 지목되셨는지, 본인이 생각하는 상황과 소명 포인트를 적어주세요. 작성 내용은 담당 노무사만 확인하며 비밀이 보장됩니다.",
    ctaText: "피지목인 항변 신청하기",
  },
  {
    id: "company",
    no: "트랙 3",
    icon: "🏛️",
    title: "회사 조사처리",
    subtitle: "사용자(회사)의 법정 조사의무 대행",
    accent: "#3D5A80",
    accentLight: "#6B8CB8",
    badge: null,
    services: [
      "외부 중립 조사관 파견",
      "조사보고서 작성",
      "징계결정 자문",
      "재발방지 교육",
      "취업규칙 정비",
    ],
    fees: [
      { label: "단일 사안 조사",                value: "건당 300~800만원" },
      { label: "기준",                        value: "규모·복잡도에 따라 산정" },
    ],
    differentiator: "노무사 네트워크 기반 B2B 루트",
    formLabel: "사안 개요 및 조직 규모",
    formPlaceholder: "신고 접수 현황, 조직 규모(인원수), 업종, 의뢰 희망 범위(조사 / 징계자문 / 재발방지 등)를 적어주세요.",
    ctaText: "회사 조사처리 신청하기",
  },
];

const PROCESS_STEPS = [
  { step:1, icon:"📝", title:"신청서 접수",   desc:"성명·연락처·사안 내용 제출" },
  { step:2, icon:"📞", title:"초기 상담",     desc:"노무사 전화 상담 (48h 내)" },
  { step:3, icon:"🔍", title:"사안 분석",     desc:"증거 검토 · 법적 성립 판단" },
  { step:4, icon:"⚖️", title:"대응 전략 수립", desc:"트랙별 최적 경로 설계" },
  { step:5, icon:"🛡️", title:"대리 실행",     desc:"진정·조사·소송 연계 지원" },
];

export function ReliefSection() {
  const [selectedTrack, setSelectedTrack] = useState("victim");
  const [form, setForm] = useState({ name:"", phone:"", email:"", situation:"", urgency:"", consent:false });
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const track = TRACKS.find(t => t.id === selectedTrack) || TRACKS[0];
  const F = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const selectTrack = (id) => {
    setSelectedTrack(id);
    setTimeout(() => {
      document.getElementById("relief-form")?.scrollIntoView({ behavior:"smooth", block:"start" });
    }, 50);
  };

  const validateForm = () => {
    const e = {};
    if (!form.name.trim()) e.name = "성명을 입력해 주세요.";
    if (!form.phone.trim()) e.phone = "연락처를 입력해 주세요.";
    else if (!isValidPhone(form.phone)) e.phone = "올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)";
    if (!form.email.trim()) e.email = "이메일을 입력해 주세요.";
    else if (!isValidEmail(form.email)) e.email = "올바른 이메일 형식이 아닙니다.";
    if (!form.situation.trim()) e.situation = "사안 내용을 작성해 주세요.";
    if (!form.consent) e.consent = "개인정보 수집·이용에 동의해 주세요.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const infoComplete = form.name && form.phone && form.email && form.situation && form.consent;

  if (done) return (
    <section style={{ padding:"80px 32px", background:`linear-gradient(160deg, ${C.navy} 0%, ${C.navyMid} 55%, #071225 100%)`, minHeight:"100vh", display:"flex", alignItems:"center" }}>
      <div style={{ maxWidth:600, margin:"0 auto", textAlign:"center" }}>
        <div style={{ fontSize:56, marginBottom:20 }}>{track.icon}✅</div>
        <h3 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:"1.5rem", fontWeight:800, color:C.cream, marginBottom:12 }}>{track.title} 신청이 접수되었습니다</h3>
        <p style={{ color:"rgba(244,241,235,0.65)", lineHeight:1.9, marginBottom:28 }}>
          담당 노무사가 <strong style={{ color:C.gold }}>48시간 내</strong>에 직접 연락드립니다.<br/>접수하신 이메일로 확인 메일이 발송됩니다.
        </p>
        <button onClick={() => { setDone(false); setForm({ name:"", phone:"", email:"", situation:"", urgency:"", consent:false }); }} style={{ padding:"12px 32px", borderRadius:8, border:`2px solid rgba(255,255,255,0.2)`, background:"transparent", color:C.cream, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>새로 신청하기</button>
      </div>
    </section>
  );

  return (
    <section style={{ padding:"80px 32px", background:`linear-gradient(160deg, ${C.navy} 0%, ${C.navyMid} 55%, #071225 100%)`, minHeight:"100vh" }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>

        {/* 헤더 */}
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <DarkSectionTag>CASE REPRESENTATION</DarkSectionTag>
          <h2 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:"clamp(1.8rem, 3.2vw, 2.5rem)", fontWeight:900, color:C.cream, marginTop:8, letterSpacing:"-0.5px" }}>해결 의뢰</h2>
          <p style={{ color:"rgba(244,241,235,0.55)", marginTop:12, fontSize:14, lineHeight:1.8, maxWidth:620, margin:"12px auto 0" }}>
            상황에 맞는 트랙을 선택해 전문 노무사에게 사건 해결을 의뢰하세요.<br/>
            <strong style={{ color:C.gold }}>가격 투명성</strong>을 원칙으로, 착수 전 수임료를 명확히 안내합니다.
          </p>
        </div>

        {/* 3개 트랙 카드 */}
        <div style={{
          display:"grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
          gap:20,
          marginBottom:56,
        }}>
          {TRACKS.map(t => {
            const isSelected = selectedTrack === t.id;
            return (
              <div key={t.id}
                onClick={() => selectTrack(t.id)}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: isSelected ? `1.5px solid ${t.accent}` : "1px solid rgba(201,168,76,0.18)",
                  borderRadius:14,
                  padding:"0 0 22px 0",
                  cursor:"pointer",
                  transition:"all 0.25s",
                  overflow:"hidden",
                  display:"flex", flexDirection:"column",
                  boxShadow: isSelected ? `0 8px 32px ${t.accent}22` : "0 4px 16px rgba(0,0,0,0.2)",
                  position:"relative",
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = `${t.accent}80`; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = "rgba(201,168,76,0.18)"; }}
              >
                {/* 상단 액센트 바 */}
                <div style={{ height:3, background:`linear-gradient(90deg, ${t.accent}, ${t.accentLight})` }} />

                {/* 배지 */}
                {t.badge && (
                  <div style={{ position:"absolute", top:14, right:14, padding:"4px 10px", background:"rgba(201,168,76,0.12)", border:`1px solid rgba(201,168,76,0.5)`, borderRadius:100, fontSize:10, fontWeight:700, color:C.goldLight, letterSpacing:"0.5px" }}>
                    ★ {t.badge}
                  </div>
                )}

                {/* 헤더 영역 */}
                <div style={{ padding:"24px 22px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize:10, fontWeight:700, color:t.accentLight, letterSpacing:"2px", marginBottom:8 }}>{t.no}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                    <div style={{ width:40, height:40, borderRadius:"50%", background:`${t.accent}20`, border:`1px solid ${t.accent}50`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{t.icon}</div>
                    <div style={{ fontFamily:"'Noto Serif KR', serif", fontSize:20, fontWeight:800, color:C.cream }}>{t.title}</div>
                  </div>
                  <div style={{ fontSize:12, color:"rgba(244,241,235,0.55)", lineHeight:1.65 }}>{t.subtitle}</div>
                </div>

                {/* 제공 서비스 */}
                <div style={{ padding:"20px 22px 16px" }}>
                  <div style={{ fontSize:10, fontWeight:700, color:C.gold, letterSpacing:"1.5px", marginBottom:12 }}>제공 서비스</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                    {t.services.map((s, i) => (
                      <div key={i} style={{ display:"flex", gap:8, fontSize:12.5, color:"rgba(244,241,235,0.78)", lineHeight:1.55 }}>
                        <span style={{ color:t.accentLight, flexShrink:0, fontWeight:700 }}>✓</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 권장 수임료 */}
                <div style={{ margin:"4px 22px 0", padding:"14px 16px", background:"rgba(10,22,40,0.55)", border:"1px solid rgba(201,168,76,0.18)", borderRadius:10 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:C.gold, letterSpacing:"1.5px", marginBottom:10 }}>권장 수임료</div>
                  {t.fees.map((f, i) => (
                    <div key={i} style={{ marginBottom: i < t.fees.length - 1 ? 10 : 0 }}>
                      <div style={{ fontSize:11, color:"rgba(244,241,235,0.5)", marginBottom:3 }}>{f.label}</div>
                      <div style={{ fontSize:13, fontWeight:700, color:C.goldLight, lineHeight:1.5 }}>{f.value}</div>
                    </div>
                  ))}
                  <div style={{ marginTop:10, paddingTop:8, borderTop:"1px dashed rgba(201,168,76,0.15)", fontSize:10, color:"rgba(244,241,235,0.35)" }}>VAT 별도 · 사안별 협의 가능</div>
                </div>

                {/* 차별 포인트 */}
                <div style={{ margin:"14px 22px 14px", padding:"10px 12px", background:`${t.accent}10`, border:`1px dashed ${t.accent}40`, borderRadius:8, fontSize:11, color:t.accentLight, lineHeight:1.55 }}>
                  💡 {t.differentiator}
                </div>

                {/* CTA 버튼 */}
                <button onClick={(e) => { e.stopPropagation(); selectTrack(t.id); }} style={{
                  margin:"0 22px", padding:"12px", borderRadius:8,
                  background: isSelected ? t.accent : "transparent",
                  border: `1.5px solid ${t.accent}`,
                  color: isSelected ? "white" : t.accentLight,
                  fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                  transition:"all 0.2s",
                }}>
                  {isSelected ? "✓ 선택됨 — 아래 폼에서 신청" : "이 트랙 신청하기 →"}
                </button>
              </div>
            );
          })}
        </div>

        {/* 진행 절차 */}
        <div style={{ marginBottom:40 }}>
          <div style={{ fontSize:11, letterSpacing:"2px", color:C.gold, fontWeight:700, textTransform:"uppercase", marginBottom:18, textAlign:"center" }}>진행 절차</div>
          <div style={{ display:"flex", gap:0, overflowX:"auto", paddingBottom:8, justifyContent: isMobile ? "flex-start" : "center" }}>
            {PROCESS_STEPS.map((s, i) => (
              <div key={s.step} style={{ display:"flex", alignItems:"center", flexShrink:0 }}>
                <div style={{ textAlign:"center", padding:"16px 14px", background:"rgba(255,255,255,0.04)", borderRadius:10, border:"1px solid rgba(255,255,255,0.07)", minWidth:104 }}>
                  <div style={{ fontSize:22, marginBottom:6 }}>{s.icon}</div>
                  <div style={{ fontSize:11.5, fontWeight:800, color:C.cream, marginBottom:3 }}>{s.title}</div>
                  <div style={{ fontSize:9.5, color:"rgba(244,241,235,0.4)", lineHeight:1.5 }}>{s.desc}</div>
                </div>
                {i < PROCESS_STEPS.length - 1 && <div style={{ width:20, height:2, background:`linear-gradient(90deg, ${C.teal}, ${C.gold})`, flexShrink:0, margin:"0 4px" }} />}
              </div>
            ))}
          </div>
        </div>

        {/* 신청 폼 */}
        <div id="relief-form" style={{ maxWidth:720, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:18 }}>
            <div style={{ fontSize:11, letterSpacing:"2px", color:track.accentLight, fontWeight:700, textTransform:"uppercase", marginBottom:6 }}>{track.no} · 신청서</div>
            <div style={{ fontFamily:"'Noto Serif KR', serif", fontSize:22, fontWeight:800, color:C.cream }}>{track.title} 신청</div>
            <div style={{ fontSize:12, color:"rgba(244,241,235,0.5)", marginTop:6 }}>{track.subtitle}</div>
          </div>

          <div style={{ padding:"13px 16px", background:`${track.accent}14`, border:`1px solid ${track.accent}40`, borderRadius:8, marginBottom:22 }}>
            <span style={{ fontSize:13, color:track.accentLight }}>🔐 <strong>성명, 연락처, 이메일은 필수 항목입니다.</strong> 수집된 정보는 담당 노무사만 열람하며, 제3자에게 제공되지 않습니다.</span>
          </div>

          <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:14, padding:28, border:`1px solid ${track.accent}30` }}>
            <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:18 }}>
              <DarkInput label="성명" value={form.name} onChange={F("name")} placeholder="홍길동" required />
              <div className="form-grid-2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <DarkInput label="연락처" value={form.phone} onChange={F("phone")} placeholder="010-0000-0000" type="tel" required />
                <DarkInput label="이메일" value={form.email} onChange={F("email")} placeholder="example@email.com" type="email" required />
              </div>
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:"rgba(244,241,235,0.55)", marginBottom:8, letterSpacing:"0.5px", textTransform:"uppercase" }}>긴급도</label>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:9 }}>
                {[{ v:"normal", l:"일반", c:"rgba(255,255,255,0.1)" }, { v:"urgent", l:"⚡ 빠른 상담", c:C.orange }, { v:"emergency", l:"🚨 즉각 대응", c:C.red }].map(u => (
                  <button key={u.v} onClick={() => setForm(f => ({ ...f, urgency:u.v }))} style={{ padding:"9px 6px", borderRadius:7, border:`2px solid ${form.urgency === u.v ? u.c : "rgba(255,255,255,0.09)"}`, background:form.urgency === u.v ? u.c+"20" : "rgba(255,255,255,0.02)", color:form.urgency === u.v ? (u.v === "normal" ? C.cream : u.c) : "rgba(244,241,235,0.5)", fontWeight:form.urgency === u.v ? 700 : 400, fontSize:11, cursor:"pointer", fontFamily:"inherit", textAlign:"center", lineHeight:1.4 }}>{u.l}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:24 }}>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:"rgba(244,241,235,0.55)", marginBottom:8, letterSpacing:"0.5px", textTransform:"uppercase" }}>
                {track.formLabel} <span style={{ color:track.accentLight }}>*</span>
              </label>
              <textarea value={form.situation} onChange={F("situation")} placeholder={track.formPlaceholder} rows={6} style={{ width:"100%", padding:"13px 14px", borderRadius:8, border:"2px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.04)", color:C.cream, fontSize:14, fontFamily:"inherit", outline:"none", resize:"vertical", lineHeight:1.7, boxSizing:"border-box" }}
                onFocus={e => e.target.style.borderColor = track.accentLight}
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
            <button onClick={() => { if(validateForm()) { addSubmission("relief", { ...form, trackId: track.id, trackTitle: track.title }); setDone(true); } }} disabled={!infoComplete} style={{ width:"100%", padding:"16px", background:infoComplete ? track.accent : "rgba(255,255,255,0.08)", border:"none", borderRadius:8, color:infoComplete ? "white" : "rgba(255,255,255,0.25)", fontWeight:800, fontSize:15, cursor:infoComplete ? "pointer" : "not-allowed", fontFamily:"inherit", transition:"all 0.2s" }}>
              {track.icon} {track.ctaText}
            </button>
            <div style={{ textAlign:"center", fontSize:11, color:"rgba(244,241,235,0.3)", marginTop:10, lineHeight:1.6 }}>수집 정보는 노무사법 제37조 비밀유지 의무 적용 대상입니다</div>
            <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} dark={true} />
          </div>
        </div>
      </div>
    </section>
  );
}



// ── 관리자 이메일 작성기 ─────────────────────────────────────────────────────
