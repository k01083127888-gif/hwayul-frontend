import { useState, useEffect } from "react";
import C from "../tokens/colors.js";
import { saveCulture, loadCulture } from "../utils/storage.js";
import { generateCulturePrintHtml } from "../utils/printTemplates.js";
import { PrintModal } from "../components/PrintModal.jsx";
import { ReportForm } from "../components/ReportForm.jsx";
import { DarkSectionTag, SectionTag, Input } from "../components/common/FormElements.jsx";
import { usePageMeta } from "../utils/usePageMeta.js";

let _savedCulture = loadCulture();

const cultureCategories = [
  { id:"struct", icon:"🏗️", title:"조직 구조·권력 집중도", color:"#C0392B",
    riskFactor:"권한이 특정인에게 집중되고 견제 장치가 없는 조직일수록 괴롭힘 발생 확률이 높습니다.",
    basis:"고용노동부 실태조사 — 수직적 위계 강한 조직의 괴롭힘 발생률 2.4배",
    items:[
      { id:"s1", text:"업무 지시와 평가 권한이 한 사람(직속 상사)에게 집중되어 있다", risk:"high" },
      { id:"s2", text:"상사의 결정에 이의를 제기하거나 거절하기 어려운 분위기다", risk:"high" },
      { id:"s3", text:"직급·연차에 따른 서열 문화가 강하게 작용한다", risk:"mid" },
      { id:"s4", text:"부서 이동이나 인사 배치가 특정 관리자의 재량으로 결정된다", risk:"mid" },
      { id:"s5", text:"비정규직·파견직 등 고용형태에 따른 위계가 존재한다", risk:"mid" },
    ]},
  { id:"comm", icon:"🔇", title:"소통 부재·폐쇄성", color:"#E74C3C",
    riskFactor:"의견을 말할 수 없는 환경은 부당행위가 은폐되고 반복되는 토양이 됩니다.",
    basis:"근로기준법 제76조의2 — 직장내 괴롭힘 은폐 조직의 재발률 78%",
    items:[
      { id:"c1", text:"문제가 있어도 '말해봐야 소용없다'는 분위기가 있다", risk:"high" },
      { id:"c2", text:"직원 간 갈등이나 불만이 공식 채널이 아닌 뒷담화로 해소된다", risk:"mid" },
      { id:"c3", text:"관리자가 부하직원에게 고함이나 감정적 언행을 해도 제지하는 사람이 없다", risk:"high" },
      { id:"c4", text:"회의에서 반대 의견을 내면 불이익을 받거나 분위기가 불편해진다", risk:"mid" },
      { id:"c5", text:"중요한 정보가 일부 사람에게만 공유되고 나머지는 배제된다", risk:"mid" },
    ]},
  { id:"norm", icon:"⚠️", title:"괴롭힘 인식·감수성 부족", color:"#E67E22",
    riskFactor:"'원래 그런 거'라는 인식은 괴롭힘을 정상화하고 피해자를 고립시킵니다.",
    basis:"고용노동부 2024 실태조사 — 괴롭힘 미인지 피해자 비율 41.2%",
    items:[
      { id:"n1", text:"'선배가 후배를 혼내는 건 당연하다'는 인식이 있다", risk:"high" },
      { id:"n2", text:"'농담'이나 '애정 표현'이라는 이름으로 상대를 불쾌하게 하는 언행이 용인된다", risk:"high" },
      { id:"n3", text:"야근·특근을 거부하면 '팀워크가 없다', '열정이 부족하다'는 평가를 받는다", risk:"mid" },
      { id:"n4", text:"직장내 괴롭힘 예방을 위한 교육이 형식적이거나, 실시된 적이 없다", risk:"mid" },
      { id:"n5", text:"'요즘 세대는 예민하다', '그 정도는 참아야 한다'는 말을 자주 듣는다", risk:"mid" },
    ]},
  { id:"report", icon:"🚪", title:"신고·구제 체계 부재", color:"#8E44AD",
    riskFactor:"괴롭힘 발생 후 안전하게 신고하고 구제받을 수 있는 시스템이 없으면 피해가 장기화됩니다.",
    basis:"근로기준법 제76조의3 — 사업주 조사·보호조치 의무",
    items:[
      { id:"r1", text:"괴롭힘 신고 채널(핫라인, 온라인 접수 등)이 없거나, 있어도 알려져 있지 않다", risk:"high" },
      { id:"r2", text:"신고하면 '조직을 흔드는 사람'으로 낙인찍힐 것 같다", risk:"high" },
      { id:"r3", text:"과거 괴롭힘이 신고된 후에도 행위자에 대한 조치가 없었거나 미흡했다", risk:"high" },
      { id:"r4", text:"고충처리위원회나 조사위원회가 구성되어 있지 않다", risk:"mid" },
      { id:"r5", text:"피해자보다 행위자(가해자)의 편을 들거나 무마하려는 경향이 있다", risk:"high" },
    ]},
  { id:"work", icon:"🔥", title:"과도한 업무 압박·경쟁", color:"#2980B9",
    riskFactor:"극심한 성과 압박과 내부 경쟁은 구성원 간 공격적 행위의 직접적 원인이 됩니다.",
    basis:"산업안전보건법 — 직무 스트레스에 의한 건강장해 예방 의무",
    items:[
      { id:"w1", text:"비현실적인 목표가 부여되고, 미달성 시 공개적으로 질책을 받는다", risk:"high" },
      { id:"w2", text:"구성원 간 과도한 실적 경쟁이 조장되고, 협력보다 경쟁이 강조된다", risk:"mid" },
      { id:"w3", text:"야근·주말 근무가 일상화되어 있고, 거부하면 불이익이 따른다", risk:"mid" },
      { id:"w4", text:"실수나 실패에 대한 책임 추궁이 과도하고, 보복성 인사가 발생한다", risk:"high" },
      { id:"w5", text:"업무 성과가 낮은 직원을 공개적으로 모욕하거나 따돌리는 행위가 있다", risk:"high" },
    ]},
  { id:"group", icon:"👥", title:"집단 동조·방관 문화", color:"#16A085",
    riskFactor:"다수가 침묵하거나 동조하는 문화는 가해행위를 강화하고 피해자를 고립시킵니다.",
    basis:"고용노동부 매뉴얼 — 집단적 행위 시 괴롭힘 가중 판단 기준",
    items:[
      { id:"g1", text:"특정인을 팀에서 배제하거나 무시하는 행위에 다수가 동조하는 경향이 있다", risk:"high" },
      { id:"g2", text:"누군가 부당한 대우를 받아도 '나서면 나만 손해'라는 인식이 있다", risk:"mid" },
      { id:"g3", text:"회식·단체 행사에서 불참하거나 다른 의견을 내면 소외당한다", risk:"mid" },
      { id:"g4", text:"'우리끼리' 문화가 강해 외부인이나 신규 입사자가 적응하기 어렵다", risk:"mid" },
      { id:"g5", text:"괴롭힘 목격자가 있어도 증언하거나 도움을 주는 사람이 거의 없다", risk:"high" },
    ]},
];

// ── CultureSection ─────────────────────────────────────────────────────────────────
export function CultureSection() {
  usePageMeta({
    title: "조직문화 진단 — 6개 영역 무료 자가진단 | 화율인사이드",
    description: "조직 구조·소통·공정성·심리적 안전감·제도·교육 6개 영역을 무료로 진단하고, 전문 노무사의 맞춤 리포트(33만원)로 조직문화 개선 방향을 받아보세요.",
    url: "https://hwayul.kr/culture",
  });
  const [answers, setAnswers] = useState(_savedCulture?.answers || {});
  const [showResult, setShowResult] = useState(_savedCulture?.showResult || false);
  const [orgInfo, setOrgInfo] = useState(_savedCulture?.orgInfo || { name:"", size:"", industry:"" });
  const [showPrintModal, setShowPrintModal] = useState(false);

  // 중간저장
  useEffect(() => { const d = { answers, orgInfo, showResult }; _savedCulture = d; saveCulture(d); }, [answers, orgInfo, showResult]);
  // 결과 화면 전환 시 스크롤 맨 위로 (모바일 UX)
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [showResult]);

  const totalQ = cultureCategories.reduce((a, c) => a + c.items.length, 0);
  const answeredQ = Object.keys(answers).length;
  const pct = Math.round((answeredQ / totalQ) * 100);
  const setAnswer = (id, val) => setAnswers(prev => ({ ...prev, [id]: val }));

  // 위험도 계산: 높을수록 괴롭힘 발생 위험이 높음
  const calcCategoryRisk = (cat) => {
    const scored = cat.items.filter(i => answers[i.id] !== undefined);
    if (scored.length === 0) return 0;
    return Math.round(scored.reduce((s, i) => {
      const base = answers[i.id]; // 0~4 (전혀아니다~매우그렇다)
      const weight = i.risk === "high" ? 1.4 : 1.0;
      return s + (base * weight);
    }, 0) / (scored.length * (1.4 * 4)) * 100);
  };

  const totalRisk = (() => {
    if (answeredQ === 0) return 0;
    let sum = 0, maxSum = 0;
    cultureCategories.forEach(cat => cat.items.forEach(i => {
      if (answers[i.id] !== undefined) {
        const w = i.risk === "high" ? 1.4 : 1.0;
        sum += answers[i.id] * w;
        maxSum += 4 * w;
      }
    }));
    return Math.round((sum / maxSum) * 100);
  })();

  const getRiskGrade = (score) => {
    if (score >= 75) return { label:"매우 높음", color:C.red, emoji:"🚨", level:4, desc:"직장내 괴롭힘이 발생했거나 발생할 가능성이 매우 높습니다. 즉각적인 전문가 개입과 조직 전반의 구조적 개선이 시급합니다." };
    if (score >= 55) return { label:"높음", color:C.orange, emoji:"🔶", level:3, desc:"괴롭힘 발생 위험 요인이 다수 존재합니다. 조기 개입을 통한 예방 조치와 제도적 정비가 필요합니다." };
    if (score >= 35) return { label:"보통", color:"#F0B429", emoji:"⚠️", level:2, desc:"일부 위험 요인이 감지됩니다. 예방적 차원에서 조직문화 개선과 인식 제고 교육을 권장합니다." };
    return { label:"낮음", color:C.green, emoji:"✅", level:1, desc:"현재 조직 환경에서 괴롭힘 발생 위험이 낮은 편입니다. 현 수준을 유지하며 정기적 모니터링을 지속하세요." };
  };

  const reset = () => { setAnswers({}); setShowResult(false); setOrgInfo({ name:"", size:"", industry:"" }); _savedCulture = null; saveCulture(null); };

  // ── 결과 화면 ──
  if (showResult) {
    const grade = getRiskGrade(totalRisk);
    const catResults = cultureCategories.map(cat => ({
      ...cat,
      score: calcCategoryRisk(cat),
      grade: getRiskGrade(calcCategoryRisk(cat)),
    })).sort((a, b) => b.score - a.score);

    const highRiskItems = [];
    cultureCategories.forEach(cat => cat.items.forEach(i => {
      if (answers[i.id] >= 3 && i.risk === "high") highRiskItems.push({ ...i, catTitle:cat.title, catIcon:cat.icon, catColor:cat.color });
    }));

    return (
      <section style={{ padding:"80px 32px", background:"#EDF4FA", minHeight:"100vh" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <SectionTag>RISK ASSESSMENT RESULT</SectionTag>
          <h2 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:"clamp(1.6rem, 3vw, 2.2rem)", fontWeight:900, color:C.navy, marginTop:8, marginBottom:32 }}>직장내 괴롭힘 발생 위험도 진단 결과</h2>

          {/* 종합 위험도 */}
          <div style={{ background:C.navy, borderRadius:20, padding:40, marginBottom:28, textAlign:"center" }}>
            <div style={{ fontSize:13, color:"rgba(244,241,235,0.5)", fontWeight:600, marginBottom:12 }}>{orgInfo.name ? `${orgInfo.name} ` : ""}직장내 괴롭힘 발생 위험도</div>
            <div style={{ position:"relative", width:180, height:180, margin:"0 auto 20px" }}>
              <svg width="180" height="180" viewBox="0 0 180 180">
                <circle cx="90" cy="90" r="78" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
                <circle cx="90" cy="90" r="78" fill="none" stroke={grade.color} strokeWidth="14" strokeLinecap="round"
                  strokeDasharray={`${(totalRisk / 100) * 490} 490`}
                  transform="rotate(-90 90 90)"
                  style={{ transition:"stroke-dasharray 1s ease" }} />
              </svg>
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                <div style={{ fontSize:48, fontWeight:900, color:grade.color, fontFamily:"'Noto Serif KR', serif" }}>{totalRisk}</div>
                <div style={{ fontSize:11, color:"rgba(244,241,235,0.4)" }}>/ 100</div>
              </div>
            </div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"10px 24px", background:`${grade.color}20`, borderRadius:100, border:`1px solid ${grade.color}40`, marginBottom:16 }}>
              <span style={{ fontSize:16 }}>{grade.emoji}</span>
              <span style={{ fontSize:15, color:grade.color, fontWeight:800 }}>괴롭힘 발생 위험 : {grade.label}</span>
            </div>
            <p style={{ fontSize:14, color:"rgba(244,241,235,0.65)", lineHeight:1.8, maxWidth:560, margin:"0 auto" }}>{grade.desc}</p>
          </div>

          {/* 영역별 위험도 */}
          <div style={{ background:"white", borderRadius:20, padding:36, boxShadow:"0 4px 24px rgba(41,128,185,0.1)", border:"1px solid rgba(41,128,185,0.1)", marginBottom:28 }}>
            <h3 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:18, fontWeight:800, color:C.navy, marginBottom:6 }}>영역별 위험 요인 분석</h3>
            <p style={{ fontSize:12, color:C.gray, marginBottom:24 }}>점수가 높을수록 해당 영역에서 괴롭힘이 발생할 위험이 큽니다.</p>
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              {catResults.map((cat, idx) => (
                <div key={cat.id}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      {idx === 0 && <span style={{ padding:"2px 8px", background:`${C.red}16`, border:`1px solid ${C.red}30`, borderRadius:4, fontSize:9, color:C.red, fontWeight:700 }}>최고위험</span>}
                      <span style={{ fontSize:20 }}>{cat.icon}</span>
                      <span style={{ fontSize:14, fontWeight:700, color:C.navy }}>{cat.title}</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:20, fontWeight:900, color:cat.grade.color }}>{cat.score}</span>
                      <span style={{ padding:"3px 10px", borderRadius:100, background:`${cat.grade.color}16`, color:cat.grade.color, fontSize:11, fontWeight:700 }}>{cat.grade.label}</span>
                    </div>
                  </div>
                  <div style={{ height:10, background:"rgba(10,22,40,0.05)", borderRadius:5, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${cat.score}%`, background:cat.grade.color, borderRadius:5, transition:"width 0.8s ease" }} />
                  </div>
                  <div style={{ fontSize:11, color:C.gray, marginTop:5, fontStyle:"italic" }}>📌 {cat.riskFactor}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 핵심 위험 신호 */}
          {highRiskItems.length > 0 && (
            <div style={{ background:"white", borderRadius:20, padding:36, boxShadow:"0 4px 24px rgba(10,22,40,0.07)", border:`2px solid ${C.red}20`, marginBottom:28 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                <span style={{ fontSize:22 }}>🚩</span>
                <div>
                  <h3 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:18, fontWeight:800, color:C.red }}>핵심 위험 신호 감지 ({highRiskItems.length}건)</h3>
                  <p style={{ fontSize:12, color:C.gray, margin:0 }}>아래 항목은 괴롭힘 발생과 직접적으로 연관된 고위험 지표입니다.</p>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {highRiskItems.map(item => (
                  <div key={item.id} style={{ padding:"14px 18px", background:"rgba(192,57,43,0.04)", border:"1px solid rgba(192,57,43,0.12)", borderRadius:10, display:"flex", gap:12, alignItems:"flex-start" }}>
                    <span style={{ fontSize:16, flexShrink:0, marginTop:1 }}>{item.catIcon}</span>
                    <div>
                      <div style={{ fontSize:10, color:item.catColor, fontWeight:700, marginBottom:3 }}>{item.catTitle}</div>
                      <div style={{ fontSize:13, color:C.navy, fontWeight:600, lineHeight:1.5 }}>{item.text}</div>
                    </div>
                    <span style={{ padding:"2px 8px", background:`${C.red}14`, border:`1px solid ${C.red}28`, borderRadius:4, fontSize:9, color:C.red, fontWeight:700, flexShrink:0, marginTop:2 }}>고위험</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 법적 근거 기반 권고 */}
          <div style={{ background:"white", borderRadius:20, padding:36, boxShadow:"0 4px 24px rgba(41,128,185,0.1)", border:"1px solid rgba(41,128,185,0.1)", marginBottom:28 }}>
            <h3 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:18, fontWeight:800, color:C.navy, marginBottom:20 }}>위험 수준별 권고 조치</h3>
            {grade.level >= 4 && (
              <div style={{ padding:"18px 22px", background:"rgba(192,57,43,0.06)", borderLeft:`4px solid ${C.red}`, borderRadius:"0 12px 12px 0", marginBottom:14 }}>
                <div style={{ fontWeight:800, color:C.red, fontSize:14, marginBottom:6 }}>🚨 긴급 — 즉각적 대응이 필요합니다</div>
                <div style={{ fontSize:13, color:"#3A3530", lineHeight:1.8 }}>
                  • 외부 전문 노무사를 통한 긴급 조직 진단 실시<br/>
                  • 익명 신고 채널 즉시 개설 및 전 직원 안내<br/>
                  • 괴롭힘 행위 발생 여부 즉시 확인 및 피해자 보호조치 (근로기준법 제76조의3)<br/>
                  • 사업주의 조사 의무 이행 여부 점검 (미이행 시 과태료 최대 2,000만원)
                </div>
              </div>
            )}
            {grade.level >= 3 && (
              <div style={{ padding:"18px 22px", background:"rgba(230,126,34,0.06)", borderLeft:`4px solid ${C.orange}`, borderRadius:"0 12px 12px 0", marginBottom:14 }}>
                <div style={{ fontWeight:800, color:C.orange, fontSize:14, marginBottom:6 }}>🔶 적극 개입 — 예방 체계 정비가 시급합니다</div>
                <div style={{ fontSize:13, color:"#3A3530", lineHeight:1.8 }}>
                  • 직장내 괴롭힘 예방을 위한 교육 전 직원 대상 즉시 실시 (예방 조치)<br/>
                  • 사내 괴롭힘 신고·처리 절차 수립 및 취업규칙 반영<br/>
                  • 관리자 대상 리더십·인식 개선 교육 별도 실시<br/>
                  • 고충처리위원회 구성 및 운영 규정 마련
                </div>
              </div>
            )}
            {grade.level >= 2 && (
              <div style={{ padding:"18px 22px", background:"rgba(240,180,41,0.06)", borderLeft:`4px solid #F0B429`, borderRadius:"0 12px 12px 0", marginBottom:14 }}>
                <div style={{ fontWeight:800, color:"#C89B20", fontSize:14, marginBottom:6 }}>⚠️ 주의 — 선제적 예방 조치를 권장합니다</div>
                <div style={{ fontSize:13, color:"#3A3530", lineHeight:1.8 }}>
                  • 정기적 조직문화 진단 실시 (분기 1회 권장)<br/>
                  • 소통 활성화 프로그램 도입 (타운홀 미팅, 1:1 면담 등)<br/>
                  • 괴롭힘 예방 가이드라인 전 직원 배포<br/>
                  • 관리자 피드백 스킬 교육 실시
                </div>
              </div>
            )}
            {grade.level <= 1 && (
              <div style={{ padding:"18px 22px", background:"rgba(26,122,74,0.06)", borderLeft:`4px solid ${C.green}`, borderRadius:"0 12px 12px 0", marginBottom:14 }}>
                <div style={{ fontWeight:800, color:C.green, fontSize:14, marginBottom:6 }}>✅ 양호 — 현재 수준을 유지하세요</div>
                <div style={{ fontSize:13, color:"#3A3530", lineHeight:1.8 }}>
                  • 정기적 모니터링 지속 (반기 1회 재진단 권장)<br/>
                  • 연례 예방교육 충실 이행<br/>
                  • 신규 입사자·부서 이동자 대상 조직문화 안내<br/>
                  • 구성원 만족도 조사 병행
                </div>
              </div>
            )}
          </div>

          {/* 자가진단 무료 / 노무사 검토 유료 안내 */}
          <div style={{ display:"flex", gap:12, marginBottom:20 }}>
            <div style={{ flex:1, padding:"14px 16px", background:"rgba(13,115,119,0.06)", border:"1px solid rgba(13,115,119,0.2)", borderRadius:10, textAlign:"center" }}>
              <div style={{ fontSize:11, color:C.gray, marginBottom:4 }}>자가진단 결과</div>
              <div style={{ fontSize:16, fontWeight:800, color:C.teal }}>무료</div>
            </div>
            <div style={{ flex:1, padding:"14px 16px", background:"rgba(201,168,76,0.06)", border:"1px solid rgba(201,168,76,0.25)", borderRadius:10, textAlign:"center" }}>
              <div style={{ fontSize:11, color:C.gray, marginBottom:4 }}>노무사 검토 리포트</div>
              <div style={{ fontSize:16, fontWeight:800, color:"#A0720A" }}>330,000원 <span style={{ fontSize:10, fontWeight:400 }}>(VAT 포함)</span></div>
            </div>
          </div>

          {/* 결과지 보기 */}
          <div style={{ padding:"18px", background:"rgba(41,128,185,0.08)", border:"1px solid rgba(41,128,185,0.18)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:C.navy, marginBottom:3 }}>📄 진단 결과를 문서로 받아보세요</div>
              <div style={{ fontSize:11, color:C.gray }}>영역별 점수, 응답 상세, 위험 신호가 포함된 보고서를 확인할 수 있습니다.</div>
            </div>
            <button onClick={() => setShowPrintModal(true)} style={{ padding:"10px 22px", borderRadius:8, background:C.teal, border:"none", color:"white", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>📄 진단결과지 보기</button>
          </div>
          <PrintModal isOpen={showPrintModal} onClose={() => setShowPrintModal(false)} type="culture" getHtml={() => generateCulturePrintHtml(totalRisk, catResults, highRiskItems, answers, orgInfo, getRiskGrade)} />

          {/* ── 해석 코멘트 ── */}
          <div style={{ padding:"16px 18px", background:"rgba(201,168,76,0.07)", border:"1px solid rgba(201,168,76,0.3)", borderRadius:10, marginBottom:18 }}>
            <div style={{ fontSize:11, fontWeight:800, color:"#A0720A", marginBottom:8, letterSpacing:"0.5px" }}>📌 노무사 해석 안내</div>
            <div style={{ fontSize:12, color:"#5A4A30", lineHeight:1.85 }}>
              이 결과는 일반적 기준에 따른 <strong>자가 진단</strong>입니다. 조직문화 위험도는 응답자의 인식과 실제 발생 가능성이 다를 수 있으며,
              <strong style={{ color:"#A0720A" }}> 동일한 점수라도 산업군·조직 규모·구조에 따라 전혀 다른 대응 전략이 필요합니다.</strong><br /><br />
              특히 고위험 영역은 내부 조사만으로는 원인 파악에 한계가 있으며, 전문가의 현장 진단이 필요한 경우가 많습니다.
            </div>
          </div>

          {/* 리포트 받기 */}
          <ReportForm type="culture" resultData={{ totalRisk, catResults: catResults.map(c => ({ title:c.title, score:c.score, grade:c.grade.label })), highRiskCount: highRiskItems.length }} dark={false} getResultHtml={() => generateCulturePrintHtml(totalRisk, catResults, highRiskItems, answers, orgInfo, getRiskGrade)} />

          <div style={{ height:20 }} />
          <div style={{ display:"flex", gap:14, justifyContent:"center" }}>
            <button onClick={reset} style={{ padding:"14px 36px", borderRadius:8, border:`2px solid ${C.navy}`, background:"white", color:C.navy, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>다시 진단하기</button>
          </div>
          <div style={{ textAlign:"center", marginTop:20, fontSize:11, color:C.gray, lineHeight:1.7 }}>
            본 진단은 직장내 괴롭힘 발생 가능성을 사전에 점검하기 위한 간이 도구이며 법적 효력이 없습니다.<br/>
            정밀 조직 진단이 필요하신 경우 '기업상담' 메뉴를 통해 전문 노무사 상담을 받으시기 바랍니다.
          </div>
        </div>
      </section>
    );
  }

  // ── 진단 입력 화면 ──
  return (
    <section style={{ padding:"80px 32px", background:"#EDF4FA", minHeight:"100vh" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <SectionTag>BULLYING RISK ASSESSMENT</SectionTag>
          <h2 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:"clamp(1.6rem, 3vw, 2.2rem)", fontWeight:900, color:C.navy, marginTop:8, marginBottom:8 }}>직장내 괴롭힘 발생 위험도 진단</h2>
          <p style={{ color:C.gray, fontSize:14, lineHeight:1.7, maxWidth:620, margin:"0 auto" }}>
            우리 조직에서 직장내 괴롭힘이 발생할 가능성이 있는지 6개 영역, 30개 문항으로 사전 점검합니다.<br/>
            현재 조직의 상태를 솔직하게 응답해 주세요.
          </p>
        </div>

        {/* 안내 배너 */}
        <div style={{ padding:"16px 22px", background:"rgba(41,128,185,0.08)", border:"1px solid rgba(41,128,185,0.18)", borderRadius:12, marginBottom:28, display:"flex", gap:14, alignItems:"flex-start" }}>
          <span style={{ fontSize:20, flexShrink:0 }}>💡</span>
          <div style={{ fontSize:13, color:"#3A3530", lineHeight:1.7 }}>
            <strong style={{ color:C.teal }}>이 진단은 '역방향'으로 작동합니다.</strong><br/>
            각 문항에 '매우 그렇다'로 응답할수록 해당 위험 요인이 높다는 의미입니다. 즉, 점수가 높을수록 괴롭힘 발생 위험이 높은 조직입니다.
          </div>
        </div>

        {/* 진행률 */}
        <div style={{ background:"rgba(237,244,250,0.95)", backdropFilter:"blur(10px)", borderRadius:12, padding:"16px 24px", boxShadow:"0 2px 12px rgba(10,22,40,0.08)", border:"1px solid rgba(41,128,185,0.12)", marginBottom:28, display:"flex", alignItems:"center", gap:20, position:"sticky", top:70, zIndex:50 }}>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontSize:12, fontWeight:700, color:C.navy }}>진행률</span>
              <span style={{ fontSize:12, fontWeight:700, color:C.teal }}>{answeredQ} / {totalQ} 문항 ({pct}%)</span>
            </div>
            <div style={{ height:8, background:"rgba(10,22,40,0.06)", borderRadius:4, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg, ${C.teal}, ${C.gold})`, borderRadius:4, transition:"width 0.3s" }} />
            </div>
          </div>
          <button onClick={() => { if (answeredQ >= 18) { setShowResult(true); window.scrollTo({ top:0, behavior:"smooth" }); } }} disabled={answeredQ < 18}
            style={{ padding:"10px 24px", borderRadius:8, background:answeredQ >= 18 ? C.gold : "rgba(10,22,40,0.06)", border:"none", color:answeredQ >= 18 ? C.navy : C.gray, fontWeight:800, fontSize:13, cursor:answeredQ >= 18 ? "pointer" : "not-allowed", fontFamily:"inherit", whiteSpace:"nowrap" }}>
            결과 보기
          </button>
        </div>

        {/* 조직 정보 */}
        <div style={{ background:"white", borderRadius:16, padding:28, boxShadow:"0 2px 12px rgba(41,128,185,0.08)", border:"1px solid rgba(41,128,185,0.1)", marginBottom:28 }}>
          <div style={{ fontSize:10, letterSpacing:"2px", color:C.gold, fontWeight:700, textTransform:"uppercase", marginBottom:12 }}>OPTIONAL</div>
          <div style={{ fontSize:14, fontWeight:700, color:C.navy, marginBottom:16 }}>조직 정보 <span style={{ fontSize:11, fontWeight:400, color:C.gray }}>(선택 — 미입력 시에도 진단 가능)</span></div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
            <Input label="조직/회사명" value={orgInfo.name} onChange={e => setOrgInfo(v => ({ ...v, name:e.target.value }))} placeholder="(선택)" />
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:C.gray, marginBottom:6, letterSpacing:"0.5px", textTransform:"uppercase" }}>조직 규모</label>
              <select value={orgInfo.size} onChange={e => setOrgInfo(v => ({ ...v, size:e.target.value }))} style={{ width:"100%", padding:"11px 14px", borderRadius:8, border:`2px solid ${C.grayLight}`, fontSize:14, fontFamily:"inherit", outline:"none", background:"white", color:orgInfo.size ? C.navy : C.gray }}>
                <option value="">-- 선택 --</option>
                <option value="5미만">5인 미만</option>
                <option value="5-30">5~30인</option>
                <option value="30-100">30~100인</option>
                <option value="100-300">100~300인</option>
                <option value="300+">300인 이상</option>
              </select>
            </div>
            <Input label="업종" value={orgInfo.industry} onChange={e => setOrgInfo(v => ({ ...v, industry:e.target.value }))} placeholder="예: IT, 제조, 서비스" />
          </div>
        </div>

        {/* 진단 문항 */}
        {cultureCategories.map(cat => {
          const catAnswered = cat.items.filter(i => answers[i.id] !== undefined).length;
          return (
            <div key={cat.id} style={{ background:"white", borderRadius:16, overflow:"hidden", boxShadow:"0 2px 12px rgba(41,128,185,0.08)", border:"1px solid rgba(41,128,185,0.1)", marginBottom:22 }}>
              <div style={{ padding:"18px 28px", background:`${cat.color}0A`, borderBottom:`1px solid ${cat.color}18`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:24 }}>{cat.icon}</span>
                  <div>
                    <div style={{ fontSize:15, fontWeight:800, color:C.navy }}>{cat.title}</div>
                    <div style={{ fontSize:11, color:C.gray, marginTop:2 }}>📌 {cat.basis}</div>
                  </div>
                </div>
                <span style={{ fontSize:12, fontWeight:700, color:cat.color }}>{catAnswered} / {cat.items.length}</span>
              </div>
              <div style={{ padding:"6px 28px 20px" }}>
                {cat.items.map((item, idx) => (
                  <div key={item.id} style={{ padding:"16px 0", borderBottom:idx < cat.items.length - 1 ? "1px solid rgba(10,22,40,0.06)" : "none" }}>
                    <div style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:12 }}>
                      <span style={{ color:cat.color, fontWeight:800, fontSize:13, flexShrink:0 }}>Q{idx + 1}.</span>
                      <span style={{ fontSize:13, color:C.navy, fontWeight:600, lineHeight:1.6, flex:1 }}>{item.text}</span>
                      {item.risk === "high" && <span style={{ padding:"2px 6px", background:`${C.red}10`, border:`1px solid ${C.red}25`, borderRadius:4, fontSize:8, color:C.red, fontWeight:700, flexShrink:0, marginTop:2 }}>핵심지표</span>}
                    </div>
                    <div style={{ display:"flex", gap:6 }}>
                      {["전혀 아니다", "아니다", "보통이다", "그렇다", "매우 그렇다"].map((label, si) => {
                        const selected = answers[item.id] === si;
                        const dangerLevel = si >= 3 ? `${C.red}` : si >= 2 ? C.orange : C.green;
                        const activeColor = selected ? dangerLevel : "transparent";
                        return (
                          <button key={si} onClick={() => setAnswer(item.id, si)} style={{
                            flex:1, padding:"9px 4px", borderRadius:8,
                            border:`2px solid ${selected ? activeColor : "rgba(10,22,40,0.08)"}`,
                            background:selected ? `${activeColor}14` : "rgba(10,22,40,0.01)",
                            color:selected ? (si >= 3 ? C.red : si >= 2 ? "#B8860B" : C.green) : C.gray,
                            fontWeight:selected ? 700 : 400, fontSize:11, cursor:"pointer",
                            fontFamily:"inherit", transition:"all 0.15s", textAlign:"center", lineHeight:1.3,
                          }}>{label}</button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div style={{ textAlign:"center", marginTop:12, marginBottom:20 }}>
          <button onClick={() => { if (answeredQ >= 18) { setShowResult(true); window.scrollTo({ top:0, behavior:"smooth" }); } }} disabled={answeredQ < 18}
            style={{ padding:"16px 52px", borderRadius:10, background:answeredQ >= 18 ? C.gold : "rgba(10,22,40,0.08)", border:"none", color:answeredQ >= 18 ? C.navy : C.gray, fontWeight:800, fontSize:15, cursor:answeredQ >= 18 ? "pointer" : "not-allowed", fontFamily:"inherit" }}>
            {answeredQ < 18 ? `📊 최소 18문항 이상 응답 필요 (${answeredQ}/${totalQ})` : "📊 괴롭힘 발생 위험도 결과 보기"}
          </button>
        </div>
        <div style={{ textAlign:"center", fontSize:11, color:C.gray, lineHeight:1.7 }}>
          본 진단은 직장내 괴롭힘 발생 가능성을 사전에 점검하기 위한 간이 도구이며, 법적 효력은 없습니다.
        </div>
      </div>
    </section>
  );
}


// ── 익명 제보 ─────────────────────────────────────────────────────────────────
