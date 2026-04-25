import { useState, useEffect, useRef } from "react";
import C from "../tokens/colors.js";
import { prerequisiteItems, behaviorCategories, impactItems, continuityOptions } from "../data/checklistData.js";
import { saveChecklist, loadChecklist } from "../utils/storage.js";
import { calcResult } from "../utils/calcResult.js";
import { generateChecklistPrintHtml } from "../utils/printTemplates.js";
import { PrintModal } from "../components/PrintModal.jsx";
import { DiagnosisChatBot } from "../components/DiagnosisChatBot.jsx";
import { AccusedChecklistSection } from "./AccusedChecklistSection.jsx";
import { SanjaeCheckSection } from "./SanjaeCheckSection.jsx";
import { CompanyCheckSection } from "./CompanyCheckSection.jsx";
import { SectionTag, DarkSectionTag } from "../components/common/FormElements.jsx";
import { usePageMeta } from "../utils/usePageMeta.js";
import { useCaseCount } from "../utils/useCaseCount.js";

const TAB_META = {
  victim:   { title:"괴롭힘 피해자 자가진단 | WIHAM 인사이드",   desc:"직장내 괴롭힘 피해자 자가진단. 고용노동부 판단 매뉴얼 기반으로 3대 요건·행위유형·피해영향도를 무료로 진단받으세요.", url:"https://hwayul.kr/diagnosis?type=victim" },
  accused:  { title:"피지목인 자가진단 | WIHAM 인사이드",       desc:"괴롭힘 가해자로 지목됐을 때 자가진단. 행위의 업무 적정성과 성립 가능성을 객관적 기준으로 검토해보세요.", url:"https://hwayul.kr/diagnosis?type=accused" },
  sanjae:   { title:"산재 상담 필요성 체크 | WIHAM 인사이드",    desc:"업무 스트레스·정신질환·과로로 산재 신청을 고민 중이신가요? 상담이 필요한 상황인지 무료로 체크해보세요.", url:"https://hwayul.kr/diagnosis?type=sanjae" },
  company:  { title:"사내 괴롭힘 조사 체크 | WIHAM 인사이드",    desc:"사내 괴롭힘 신고를 접수한 HR 담당자를 위한 조사 필요성 체크. 사업주 법적 의무와 조사 절차를 확인하세요.", url:"https://hwayul.kr/diagnosis?type=company" },
};

// ── ChecklistSection ─────────────────────────────────────────────────────────────────
export function ChecklistSection({ setActive, initialTab = "victim" }) {
  const [diagTab, setDiagTab] = useState(initialTab);
  const { label: caseCountLabel } = useCaseCount();
  usePageMeta(TAB_META[diagTab] ? { title:TAB_META[diagTab].title, description:TAB_META[diagTab].desc, url:TAB_META[diagTab].url } : {});
  // 외부(App.jsx)에서 active가 바뀌어 initialTab이 달라지면 동기화 (뒤로가기/앞으로가기/URL 직접입력 대응)
  useEffect(() => { setDiagTab(initialTab); }, [initialTab]);
  // 탭 클릭 시 URL도 업데이트 (type 파라미터 반영)
  const tabToPage = { victim:"checklist", accused:"checklist-accused", sanjae:"checklist-sanjae", company:"checklist-company" };
  const handleTabClick = (tabId) => {
    setDiagTab(tabId);
    if (setActive && tabToPage[tabId]) setActive(tabToPage[tabId]);
  };
  const STEPS = ["사전요건 확인", "행위유형 진단", "피해 영향도", "반복성 판단", "결과 확인"];
  const _saved = loadChecklist();
  const [step, setStep] = useState(_saved?.step || 0);
  const [prereq, setPrereq] = useState(_saved?.prereq || {});
  const [behavior, setBehavior] = useState(_saved?.behavior || {});
  const [impact, setImpact] = useState(_saved?.impact || {});
  const [continuity, setContinuity] = useState(_saved?.continuity || null);
  const [exOpen, setExOpen] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // 중간저장: 상태 변경 시마다 저장
  useEffect(() => { const d = { step, prereq, behavior, impact, continuity }; saveChecklist(d); }, [step, prereq, behavior, impact, continuity]);
  // 단계 변경 시 스크롤 맨 위로 (모바일 UX 개선)
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [step]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [diagTab]);
  const pct = step === 4 ? 100 : Math.round(step / 4 * 100);
  const result = step === 4 ? calcResult(prereq, behavior, impact, continuity) : null;
  const reset = () => { setPrereq({}); setBehavior({}); setImpact({}); setContinuity(null); setStep(0); setExOpen(null); saveChecklist(null); };

  // ── 진단 결과를 텍스트 요약으로 localStorage에 저장 (24시간) ────────────
  // AI 상담 진입 시 자동으로 컨텍스트에 주입되어 사용자가 같은 얘기를 반복하지 않게 함
  useEffect(() => {
    if (!result) return;
    try {
      const continuityLabel = (continuityOptions || []).find(o => o.id === continuity)?.label || "";
      const hitCatTitles = (result.hitCats || []).map(c => c.title).filter(Boolean).join(", ");
      const summary = [
        `진단 유형: 직장내 괴롭힘 자가진단 (피해자)`,
        `결과 등급: ${result.level || ""}`,
        `판단: ${result.title || ""}`,
        `요약: ${result.summary || ""}`,
        `3대 요건 충족: ${result.prereqMet ?? 0}/3`,
        `행위유형 점수: ${result.behaviorScore ?? 0}점${hitCatTitles ? ` (해당: ${hitCatTitles})` : ""}`,
        `피해 영향도: ${result.impactScore ?? 0}점`,
        `반복성: ${continuityLabel || "-"}`,
        `총점: ${result.total ?? 0}점`,
      ].filter(Boolean).join("\n");
      localStorage.setItem("hwayul_diag_result", JSON.stringify({
        type: "checklist",
        summary,
        savedAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24시간
      }));
    } catch {}
  }, [result, continuity]);

  const CheckBox = ({ checked, color = C.teal }) => (
    <div style={{ width:20, height:20, borderRadius:5, border:`2px solid ${checked ? color : "rgba(255,255,255,0.22)"}`, background:checked ? color : "transparent", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
      {checked && <span style={{ color:"white", fontSize:11, fontWeight:900 }}>✓</span>}
    </div>
  );

  return (
    <section style={{ padding:"80px 32px", background:C.navy, minHeight:"100vh" }}>
      <div style={{ maxWidth:860, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <DarkSectionTag>DIAGNOSIS TOOL v2.0</DarkSectionTag>
          <h2 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:"clamp(1.6rem, 3vw, 2.1rem)", fontWeight:800, color:C.cream, marginTop:8, letterSpacing:"-0.5px" }}>직장내 괴롭힘 전문 진단</h2>
          <p style={{ color:"rgba(244,241,235,0.55)", marginTop:8, fontSize:13, lineHeight:1.7 }}>고용노동부 판단 매뉴얼 기반 · 근로기준법 제76조의2</p>
        </div>

        {/* ── 피해자 / 피지목인 / 산재 탭 ── */}
        <div className="diag-tabs" style={{ display:"flex", justifyContent:"center", gap:0, marginBottom:28, flexWrap:"wrap" }}>
          {[
            { id:"victim", label:"😟 피해자 진단", color:C.teal },
            { id:"accused", label:"😰 피지목인 진단", color:C.gold },
            { id:"sanjae", label:"🩺 산재 체크", color:C.teal },
            { id:"company", label:"🏛️ 사내조사 체크", color:"#3D5A80" },
          ].map((tab, i, arr) => (
            <button key={tab.id} onClick={() => handleTabClick(tab.id)} style={{
              padding:"12px 22px",
              borderRadius: i === 0 ? "10px 0 0 10px" : i === arr.length - 1 ? "0 10px 10px 0" : "0",
              fontSize:13, fontWeight:diagTab===tab.id?800:500, cursor:"pointer", fontFamily:"inherit",
              background:diagTab===tab.id?tab.color:"rgba(255,255,255,0.05)",
              border:diagTab===tab.id?`2px solid ${tab.color}`:"2px solid rgba(255,255,255,0.1)",
              color:diagTab===tab.id?(tab.color===C.gold?C.navy:"white"):"rgba(244,241,235,0.6)", transition:"all 0.2s",
              whiteSpace:"nowrap", wordBreak:"keep-all",
            }}>{tab.label}</button>
          ))}
        </div>

        {/* 진단 이용 안내 — 분류 선택 + 상세 작성 권장 (전체 탭 공통) */}
        <div style={{
          maxWidth: 760,
          margin: "0 auto 24px",
          padding: "14px 18px",
          background: "rgba(13,115,119,0.08)",
          border: "1px solid rgba(13,115,119,0.28)",
          borderRadius: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: C.gold, letterSpacing: "0.5px" }}>
              💡 진단을 정확히 받으시려면
            </span>
          </div>
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 12.5, color: "rgba(244,241,235,0.92)", lineHeight: 1.75 }}>
            <li style={{ marginBottom: 5 }}>
              위 <strong style={{ color: C.gold }}>분류 탭</strong>을 먼저 선택하세요 —
              <span style={{ color: "rgba(244,241,235,0.6)", marginLeft: 4 }}>
                😟 피해자 · 😰 피지목인 · 🩺 산재 · 🏛 사내조사 중 본인 상황에 맞는 것
              </span>
            </li>
            <li style={{ marginBottom: 5 }}>
              진단 후 상담 시 <strong style={{ color: C.gold }}>상담 내용은 상세히</strong> 작성해 주세요 —
              <span style={{ color: "rgba(244,241,235,0.6)", marginLeft: 4 }}>
                언제·누가·어떤 행위·얼마나 반복되었는지 상세할수록 정확한 답변
              </span>
            </li>
            <li>
              <strong style={{ color: "rgba(244,241,235,0.95)" }}>{caseCountLabel}의 판례·사례와 작성해 주신 진단결과지</strong>를 근거로
              <span style={{ color: "rgba(244,241,235,0.6)", marginLeft: 4 }}>
                답변드립니다
              </span>
            </li>
          </ol>
        </div>

        {/* 탭별 콘텐츠 렌더링 */}
        {diagTab === "accused" ? (
          <AccusedChecklistSection setActive={setActive} />
        ) : diagTab === "sanjae" ? (
          <SanjaeCheckSection setActive={setActive} />
        ) : diagTab === "company" ? (
          <CompanyCheckSection setActive={setActive} />
        ) : (
        <>
        <div style={{ textAlign:"center", marginBottom:12 }}>
          <p style={{ color:"rgba(244,241,235,0.45)", fontSize:12 }}>3대 요건 × 6개 행위유형 · 피해영향도 종합 분석</p>
        </div>

        {/* 스텝 표시 */}
        <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:0, marginBottom:36, padding:"0 8px", flexWrap:"nowrap", maxWidth:"100%", overflow:"hidden" }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", flexShrink:0 }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                <div style={{ width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", background:step > i ? C.gold : step === i ? "rgba(201,168,76,0.25)" : "rgba(255,255,255,0.07)", border:`2px solid ${step >= i ? C.gold : "rgba(255,255,255,0.1)"}`, color:step > i ? C.navy : step === i ? C.gold : "rgba(255,255,255,0.3)", fontWeight:800, fontSize:11 }}>
                  {step > i ? "✓" : i + 1}
                </div>
                <span style={{ fontSize:8, color:step === i ? C.gold : "rgba(244,241,235,0.28)", whiteSpace:"nowrap" }}>{s}</span>
              </div>
              {i < 4 && <div style={{ width:"clamp(12px, 5vw, 60px)", height:2, background:step > i ? C.gold : "rgba(255,255,255,0.08)", margin:"0 4px", marginBottom:18, flexShrink:1 }} />}
            </div>
          ))}
        </div>
        <div style={{ height:3, background:"rgba(255,255,255,0.06)", borderRadius:2, marginBottom:32 }}>
          <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg, ${C.teal}, ${C.gold})`, borderRadius:2, transition:"width 0.4s ease" }} />
        </div>
        {step > 0 && step < 4 && (
          <div style={{ textAlign:"center", padding:"8px 16px", background:"rgba(201,168,76,0.06)", border:"1px solid rgba(201,168,76,0.12)", borderRadius:8, marginBottom:20, marginTop:-16, fontSize:12, color:"rgba(201,168,76,0.7)" }}>
            💾 진행 상태가 자동 저장됩니다. 다른 페이지를 보고 돌아와도 이어서 진단할 수 있어요.
          </div>
        )}

        {/* STEP 0 - 사전요건 */}
        {step === 0 && (
          <div>
            <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:14, padding:28, border:"1px solid rgba(255,255,255,0.07)", marginBottom:24 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
                <span style={{ fontSize:20 }}>⚖️</span>
                <div>
                  <div style={{ fontSize:10, letterSpacing:"2px", color:C.gold, fontWeight:700, textTransform:"uppercase" }}>근로기준법 제76조의2</div>
                  <h3 style={{ color:C.cream, fontWeight:800, fontSize:16, marginTop:2 }}>3대 성립요건 사전 확인</h3>
                </div>
              </div>
              <div style={{ padding:"12px 16px", background:"rgba(201,168,76,0.08)", borderLeft:`3px solid ${C.gold}`, borderRadius:"0 8px 8px 0", marginBottom:22 }}>
                <p style={{ fontSize:13, color:"rgba(244,241,235,0.65)", lineHeight:1.7, margin:0 }}>직장내 괴롭힘은 아래 3가지 요건을 <strong style={{ color:C.gold }}>모두 또는 상당 부분</strong> 충족해야 법적으로 성립됩니다.</p>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {prerequisiteItems.map(p => {
                  const checked = !!prereq[p.id];
                  return (
                    <div key={p.id} onClick={() => setPrereq(v => ({ ...v, [p.id]: !v[p.id] }))} style={{ padding:18, borderRadius:10, cursor:"pointer", background:checked ? "rgba(13,115,119,0.14)" : "rgba(255,255,255,0.02)", border:`2px solid ${checked ? C.teal : "rgba(255,255,255,0.07)"}`, transition:"all 0.2s" }}>
                      <div style={{ display:"flex", gap:14 }}>
                        <CheckBox checked={checked} />
                        <div style={{ flex:1 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                            <span style={{ padding:"2px 8px", background:"rgba(201,168,76,0.13)", border:"1px solid rgba(201,168,76,0.3)", borderRadius:4, fontSize:10, color:C.gold, fontWeight:700 }}>{p.req}</span>
                            <span style={{ fontSize:14, fontWeight:700, color:checked ? C.tealLight : C.cream }}>{p.label}</span>
                          </div>
                          <p style={{ fontSize:13, color:"rgba(244,241,235,0.6)", lineHeight:1.6, margin:0 }}>{p.desc}</p>
                          <p style={{ fontSize:12, color:"rgba(244,241,235,0.38)", marginTop:8, padding:"7px 12px", background:"rgba(255,255,255,0.03)", borderRadius:6, lineHeight:1.5 }}>💡 {p.hint}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end" }}>
              <button onClick={() => setStep(1)} style={{ padding:"13px 34px", background:C.gold, border:"none", borderRadius:8, color:C.navy, fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>행위유형 진단 →</button>
            </div>
          </div>
        )}

        {/* STEP 1 - 행위유형 */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom:18, padding:"14px 20px", background:"rgba(255,255,255,0.03)", borderRadius:10, border:"1px solid rgba(255,255,255,0.07)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:10, letterSpacing:"2px", color:C.gold, fontWeight:700, textTransform:"uppercase" }}>STEP 2 — 6개 행위유형</div>
                <div style={{ fontSize:13, color:"rgba(244,241,235,0.55)", marginTop:3 }}>해당하는 경험에 모두 체크하세요.</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:22, fontWeight:900, color:C.gold }}>{Object.values(behavior).filter(Boolean).length}</div>
                <div style={{ fontSize:10, color:"rgba(244,241,235,0.38)" }}>항목 선택됨</div>
              </div>
            </div>
            {behaviorCategories.map(cat => {
              const catN = cat.items.filter(i => behavior[i.id]).length;
              return (
                <div key={cat.id} style={{ marginBottom:18, background:"rgba(255,255,255,0.02)", borderRadius:12, overflow:"hidden", border:"1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ padding:"14px 18px", background:`${cat.color}13`, borderBottom:`1px solid ${cat.color}28`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:18 }}>{cat.icon}</span>
                      <div>
                        <div style={{ fontSize:14, fontWeight:800, color:C.cream }}>{cat.category}</div>
                        <div style={{ fontSize:10, color:"rgba(244,241,235,0.38)", marginTop:1 }}>📌 {cat.basis}</div>
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      {cat.severity === "high" && <span style={{ padding:"2px 7px", background:"rgba(192,57,43,0.18)", border:"1px solid rgba(192,57,43,0.35)", borderRadius:4, fontSize:9, color:"#FF8A80", fontWeight:700 }}>중대행위</span>}
                      {catN > 0 && <span style={{ padding:"3px 10px", background:`${cat.color}28`, borderRadius:100, fontSize:11, color:cat.color, fontWeight:700 }}>{catN}개 선택</span>}
                    </div>
                  </div>
                  <div style={{ padding:"10px 14px", display:"flex", flexDirection:"column", gap:8 }}>
                    {cat.items.map(item => {
                      const checked = !!behavior[item.id];
                      const open = exOpen === item.id;
                      return (
                        <div key={item.id}>
                          <div onClick={() => setBehavior(v => ({ ...v, [item.id]: !v[item.id] }))} style={{ display:"flex", gap:12, cursor:"pointer", padding:"11px 13px", borderRadius:8, background:checked ? `${cat.color}16` : "rgba(255,255,255,0.02)", border:`1px solid ${checked ? cat.color + "48" : "rgba(255,255,255,0.04)"}`, transition:"all 0.18s" }}>
                            <CheckBox checked={checked} color={cat.color} />
                            <div style={{ flex:1, display:"flex", justifyContent:"space-between", gap:8 }}>
                              <span style={{ fontSize:13, color:checked ? C.cream : "rgba(244,241,235,0.6)", lineHeight:1.6, flex:1 }}>{item.text}</span>
                              <span style={{ fontSize:9, color:C.gold, flexShrink:0, marginTop:3 }}>가중 {item.weight}점</span>
                            </div>
                          </div>
                          <div style={{ paddingLeft:32 }}>
                            <button onClick={() => setExOpen(open ? null : item.id)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:10, color:"rgba(244,241,235,0.3)", fontFamily:"inherit", padding:"3px 0" }}>
                              {open ? "▲ 예시 숨기기" : "▼ 실제 사례 예시 보기"}
                            </button>
                            {open && <div style={{ padding:"7px 11px", background:"rgba(255,255,255,0.03)", borderRadius:6, borderLeft:`3px solid ${cat.color}50`, marginBottom:4 }}><span style={{ fontSize:12, color:"rgba(244,241,235,0.5)" }}>💬 {item.example}</span></div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <div style={{ display:"flex", gap:12 }}>
              <button onClick={() => setStep(0)} style={{ padding:"13px 22px", background:"rgba(255,255,255,0.06)", border:"none", borderRadius:8, color:"rgba(244,241,235,0.65)", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>← 이전</button>
              <button onClick={() => setStep(2)} style={{ flex:1, padding:"13px", background:C.gold, border:"none", borderRadius:8, color:C.navy, fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>피해 영향도 진단 →</button>
            </div>
          </div>
        )}

        {/* STEP 2 - 피해 영향도 */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom:22, padding:"14px 20px", background:"rgba(255,255,255,0.03)", borderRadius:10, border:"1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ fontSize:10, letterSpacing:"2px", color:C.gold, fontWeight:700, textTransform:"uppercase" }}>STEP 3 — 피해 영향도</div>
              <p style={{ fontSize:13, color:"rgba(244,241,235,0.55)", marginTop:5, lineHeight:1.6 }}>해당 행위로 인한 신체적·심리적·사회적 피해를 확인합니다. 피해 영향도는 손해배상 액수에 직접 영향을 미칩니다.</p>
            </div>
            {impactItems.map(cat => (
              <div key={cat.id} style={{ marginBottom:18, background:"rgba(255,255,255,0.02)", borderRadius:12, overflow:"hidden", border:"1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ padding:"13px 18px", background:"rgba(255,255,255,0.04)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ fontSize:14, fontWeight:800, color:C.cream }}>{cat.category}</span>
                </div>
                <div style={{ padding:"10px 14px", display:"flex", flexDirection:"column", gap:9 }}>
                  {cat.items.map(item => {
                    const checked = !!impact[item.id];
                    return (
                      <div key={item.id} onClick={() => setImpact(v => ({ ...v, [item.id]: !v[item.id] }))} style={{ display:"flex", gap:12, cursor:"pointer", padding:"11px 13px", borderRadius:8, background:checked ? "rgba(192,57,43,0.1)" : "rgba(255,255,255,0.02)", border:`1px solid ${checked ? "rgba(192,57,43,0.35)" : "rgba(255,255,255,0.04)"}`, transition:"all 0.18s" }}>
                        <CheckBox checked={checked} color={C.red} />
                        <div style={{ flex:1, display:"flex", justifyContent:"space-between", gap:8 }}>
                          <span style={{ fontSize:13, color:checked ? C.cream : "rgba(244,241,235,0.6)", lineHeight:1.6, flex:1 }}>{item.text}</span>
                          <span style={{ fontSize:9, color:C.gold, flexShrink:0, marginTop:3 }}>+{item.weight}점</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div style={{ display:"flex", gap:12 }}>
              <button onClick={() => setStep(1)} style={{ padding:"13px 22px", background:"rgba(255,255,255,0.06)", border:"none", borderRadius:8, color:"rgba(244,241,235,0.65)", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>← 이전</button>
              <button onClick={() => setStep(3)} style={{ flex:1, padding:"13px", background:C.gold, border:"none", borderRadius:8, color:C.navy, fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>반복성 판단 →</button>
            </div>
          </div>
        )}

        {/* STEP 3 - 반복성 */}
        {step === 3 && (
          <div>
            <div style={{ marginBottom:26, padding:"14px 20px", background:"rgba(255,255,255,0.03)", borderRadius:10, border:"1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ fontSize:10, letterSpacing:"2px", color:C.gold, fontWeight:700, textTransform:"uppercase" }}>STEP 4 — 반복성·지속성</div>
              <p style={{ fontSize:13, color:"rgba(244,241,235,0.55)", marginTop:5, lineHeight:1.6 }}>직장내 괴롭힘은 반드시 반복·지속될 필요는 없습니다. <strong style={{ color:C.cream }}>단 1회라도 행위의 강도가 중대하다면 성립</strong>될 수 있습니다.</p>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:13, marginBottom:30 }}>
              {continuityOptions.map(opt => (
                <div key={opt.id} onClick={() => setContinuity(opt.id)} style={{ padding:18, borderRadius:10, cursor:"pointer", background:continuity === opt.id ? "rgba(201,168,76,0.1)" : "rgba(255,255,255,0.02)", border:`2px solid ${continuity === opt.id ? C.gold : "rgba(255,255,255,0.07)"}`, transition:"all 0.2s" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ width:18, height:18, borderRadius:"50%", border:`2px solid ${continuity === opt.id ? C.gold : "rgba(255,255,255,0.2)"}`, background:continuity === opt.id ? C.gold : "transparent", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {continuity === opt.id && <span style={{ width:7, height:7, background:C.navy, borderRadius:"50%", display:"block" }} />}
                      </div>
                      <span style={{ fontSize:15, fontWeight:700, color:continuity === opt.id ? C.gold : C.cream }}>{opt.label}</span>
                    </div>
                    <span style={{ fontSize:11, color:C.gold }}>+{opt.score}점</span>
                  </div>
                  <p style={{ fontSize:13, color:"rgba(244,241,235,0.45)", marginTop:9, marginLeft:30, lineHeight:1.5 }}>{opt.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:12 }}>
              <button onClick={() => setStep(2)} style={{ padding:"13px 22px", background:"rgba(255,255,255,0.06)", border:"none", borderRadius:8, color:"rgba(244,241,235,0.65)", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>← 이전</button>
              <button onClick={() => continuity && setStep(4)} style={{ flex:1, padding:"13px", background:continuity ? C.gold : "rgba(255,255,255,0.08)", border:"none", borderRadius:8, color:continuity ? C.navy : "rgba(255,255,255,0.28)", fontWeight:800, fontSize:14, cursor:continuity ? "pointer" : "not-allowed", fontFamily:"inherit" }}>종합 진단 결과 보기 →</button>
            </div>
          </div>
        )}

        {/* STEP 4 - 결과 */}
        {step === 4 && result && (
          <div>
            <div style={{ textAlign:"center", padding:"36px 28px 28px", background:`${result.color}0e`, borderRadius:16, border:`2px solid ${result.color}38`, marginBottom:22 }}>
              <div style={{ fontSize:48, marginBottom:14 }}>{result.emoji}</div>
              <div style={{ display:"inline-flex", padding:"5px 20px", background:`${result.color}1e`, border:`1px solid ${result.color}55`, borderRadius:100, marginBottom:14 }}>
                <span style={{ color:result.color, fontWeight:800, fontSize:14 }}>{result.level}</span>
              </div>
              <h3 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:"1.18rem", fontWeight:800, color:C.cream, lineHeight:1.55, marginBottom:12 }}>{result.title}</h3>
              <p style={{ fontSize:13, color:"rgba(244,241,235,0.6)", lineHeight:1.8, maxWidth:520, margin:"0 auto" }}>{result.summary}</p>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12, marginBottom:20 }}>
              {[
                { label:"3대 요건 충족", value:`${result.prereqMet}/3`, color:result.prereqMet >= 2 ? C.red : C.green },
                { label:"행위유형 점수", value:`${result.behaviorScore}점`, color:C.gold },
                { label:"피해 영향도",   value:`${result.impactScore}점`, color:C.orange },
              ].map(s => (
                <div key={s.label} style={{ padding:16, background:"rgba(255,255,255,0.04)", borderRadius:10, border:"1px solid rgba(255,255,255,0.07)", textAlign:"center" }}>
                  <div style={{ fontSize:22, fontWeight:900, color:s.color, fontFamily:"'Noto Serif KR', serif" }}>{s.value}</div>
                  <div style={{ fontSize:11, color:"rgba(244,241,235,0.38)", marginTop:5 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {result.hitCats.length > 0 && (
              <div style={{ marginBottom:20, background:"rgba(255,255,255,0.03)", borderRadius:12, padding:18, border:"1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize:11, fontWeight:700, color:C.gold, marginBottom:12 }}>확인된 행위유형</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:9 }}>
                  {result.hitCats.map(cat => (
                    <div key={cat.id} style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 13px", background:`${cat.color}14`, border:`1px solid ${cat.color}38`, borderRadius:100 }}>
                      <span style={{ fontSize:13 }}>{cat.icon}</span>
                      <span style={{ fontSize:11, color:cat.color, fontWeight:700 }}>{cat.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom:20, background:"rgba(255,255,255,0.03)", borderRadius:12, padding:20, border:"1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize:11, fontWeight:700, color:C.gold, marginBottom:12 }}>✅ 권고 대응 절차</div>
              {result.actions.map((a, i) => (
                <div key={i} style={{ display:"flex", gap:12, padding:"10px 14px", background:"rgba(255,255,255,0.02)", borderRadius:8, border:"1px solid rgba(255,255,255,0.05)", marginBottom:8 }}>
                  <div style={{ width:20, height:20, borderRadius:"50%", background:result.color, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span style={{ fontSize:10, color:"white", fontWeight:900 }}>{i + 1}</span>
                  </div>
                  <span style={{ fontSize:13, color:"rgba(244,241,235,0.75)", lineHeight:1.6 }}>{a}</span>
                </div>
              ))}
            </div>

<div style={{ padding:"12px 18px", background:"rgba(255,255,255,0.02)", borderRadius:8, marginBottom:22, fontSize:11, color:"rgba(244,241,235,0.35)", lineHeight:1.7 }}>
              ⚠️ 본 결과는 참고용이며 법적 판단의 효력이 없습니다. 최종 성립 여부는 담당 노무사와 확인하세요.
            </div>

            {/* ── 해석 코멘트 ── */}
            <div style={{ padding:"16px 18px", background:"rgba(201,168,76,0.07)", border:"1px solid rgba(201,168,76,0.25)", borderRadius:10, marginBottom:18 }}>
              <div style={{ fontSize:11, fontWeight:800, color:C.gold, marginBottom:8, letterSpacing:"0.5px" }}>📌 노무사 해석 안내</div>
              <div style={{ fontSize:12, color:"rgba(244,241,235,0.7)", lineHeight:1.85 }}>
                이 결과는 일반적 기준에 따른 <strong style={{ color:C.cream }}>자가 진단</strong>입니다. 직장 내 괴롭힘 인정 여부는 구체적인 사실관계와 증거에 따라 달라지며,
                <strong style={{ color:C.gold }}> 동일한 점수라도 노무사의 해석에 따라 결론이 완전히 달라질 수 있습니다.</strong><br /><br />
                특히 ① 지위·관계의 우위성 판단, ② 업무 적정범위 초과 여부, ③ 증거의 법적 효력은
                개별 상황을 직접 검토해야 정확한 판단이 가능합니다.
              </div>
            </div>

            {/* 결과지 보기 */}
            <div style={{ padding:"18px", background:"rgba(13,115,119,0.08)", border:"1px solid rgba(13,115,119,0.2)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:C.tealLight, marginBottom:3 }}>📄 진단 결과를 문서로 받아보세요</div>
                <div style={{ fontSize:11, color:"rgba(244,241,235,0.4)" }}>선택 항목, 점수, 법적 근거가 포함된 보고서를 확인할 수 있습니다.</div>
              </div>
              <button onClick={() => setShowPrintModal(true)} style={{ padding:"10px 22px", borderRadius:8, background:C.teal, border:"none", color:"white", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>📄 진단결과지 보기</button>
            </div>
            <PrintModal isOpen={showPrintModal} onClose={() => setShowPrintModal(false)} type="checklist" getHtml={() => generateChecklistPrintHtml(prereq, behavior, impact, continuity, result)} />

            {/* ── AI 즉시 상담 (진단 결과 기반) ── */}
            <DiagnosisChatBot type="checklist" resultData={result} variant="dark" setActive={setActive} />

            {/* 심층 상담 안내 (유료 노무사 상담 유도) */}
            <div style={{ padding:"20px 22px", background:"rgba(201,168,76,0.08)", border:"1.5px solid rgba(201,168,76,0.32)", borderRadius:14, marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
              <div style={{ flex:1, minWidth:200 }}>
                <div style={{ fontSize:11, fontWeight:700, color:C.gold, letterSpacing:"1.5px", marginBottom:6 }}>💼 더 깊이 있는 검토가 필요하시다면</div>
                <div style={{ fontSize:14, fontWeight:800, color:C.cream, marginBottom:4 }}>전문 노무사 심층 상담 <span style={{ fontSize:13, color:C.goldLight }}>22만원 (VAT 포함)</span></div>
                <div style={{ fontSize:11, color:"rgba(244,241,235,0.6)", lineHeight:1.6 }}>1차 전화 상담 → 2차 서류 검토 → 3차 대면 상담 패키지<br/>해결 의뢰 전환 시 상담료 전액 착수금에서 차감</div>
              </div>
              <button onClick={() => { try { localStorage.setItem("hwayul_diag_for_biz", generateChecklistPrintHtml(prereq, behavior, impact, continuity, result)); } catch {} setActive("biz"); }} style={{ padding:"12px 22px", borderRadius:10, background:C.gold, border:"none", color:C.navy, fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap", flexShrink:0 }}>
                💼 심층 상담 신청 →
              </button>
            </div>

            <div style={{ height:20 }} />
            <div style={{ display:"flex", justifyContent:"center" }}>
              <button onClick={reset} style={{ padding:"13px 36px", background:"rgba(255,255,255,0.06)", border:"none", borderRadius:8, color:"rgba(244,241,235,0.65)", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>↺ 다시 진단하기</button>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </section>
  );
}

// ── 조직문화 진단 (괴롭힘 발생 위험도 진단) ──────────────────────────────────
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

