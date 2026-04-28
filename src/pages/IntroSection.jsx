import { useState } from "react";
import C from "../tokens/colors.js";
import { _members } from "../utils/store.js";
import { SectionTag } from "../components/common/FormElements.jsx";
import { usePageMeta } from "../utils/usePageMeta.js";
import { useCaseCount } from "../utils/useCaseCount.js";

// ── IntroSection ─────────────────────────────────────────────────────────────────
export function IntroSection() {
  const { label: caseCountLabel } = useCaseCount();
  usePageMeta({
    title: "소개 — 전문 노무사 팀 | WIHAM 인사이드",
    description: "20년 경력 노무사가 이끄는 WIHAM 인사이드. 직장내 괴롭힘·산재·조직문화 전문가 팀을 소개합니다.",
    url: "https://wiham.kr/intro",
  });
  const [selectedMember, setSelectedMember] = useState(null);
  const members = _members;

  // 전문가 상세 보기
  if (selectedMember) {
    const m = selectedMember;
    return (
      <section style={{ background:C.cream, minHeight:"100vh", padding:"80px 32px" }}>
        <div style={{ maxWidth:860, margin:"0 auto" }}>
          <button onClick={() => setSelectedMember(null)} style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"10px 20px", borderRadius:8, border:`2px solid rgba(10,22,40,0.12)`, background:"white", color:C.navy, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", marginBottom:32, transition:"all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = C.navy; e.currentTarget.style.color = "white"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = C.navy; }}
          >
            ← 소개 페이지로
          </button>

          {/* 프로필 헤더 */}
          <div style={{ background:"white", borderRadius:20, overflow:"hidden", boxShadow:"0 8px 40px rgba(10,22,40,0.1)", border:"1px solid rgba(10,22,40,0.06)", marginBottom:28 }}>
            <div style={{ height:8, background:`linear-gradient(90deg, ${C.teal}, ${C.gold})` }} />
            <div style={{ padding:"36px 40px" }}>
              <div style={{ display:"flex", gap:28, alignItems:"flex-start" }}>
                <div style={{ width:80, height:80, borderRadius:20, background:`linear-gradient(135deg, ${C.navyMid}, ${C.navyLight})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:38, flexShrink:0 }}>{m.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'Noto Serif KR', serif", fontSize:26, fontWeight:900, color:C.navy, marginBottom:6 }}>{m.name}</div>
                  <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:10, flexWrap:"wrap" }}>
                    <span style={{ padding:"4px 14px", borderRadius:6, background:`${C.teal}18`, color:C.teal, fontSize:13, fontWeight:700 }}>{m.title}</span>
                    <span style={{ padding:"4px 14px", borderRadius:6, background:`${C.gold}18`, color:"#8B7225", fontSize:12, fontWeight:600 }}>{m.exp}</span>
                    <span style={{ padding:"4px 14px", borderRadius:6, background:"rgba(10,22,40,0.06)", color:C.gray, fontSize:12, fontWeight:600 }}>{m.spec}</span>
                  </div>
                  <p style={{ fontSize:14, color:"#4A4540", lineHeight:1.8 }}>{m.fullBio}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 경력 & 전문분야 */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, marginBottom:28 }}>
            <div style={{ background:"white", borderRadius:16, padding:32, boxShadow:"0 4px 24px rgba(10,22,40,0.07)", border:"1px solid rgba(10,22,40,0.06)" }}>
              <div style={{ fontSize:10, letterSpacing:"2px", color:C.teal, fontWeight:700, textTransform:"uppercase", marginBottom:6 }}>CAREER</div>
              <h3 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:17, fontWeight:800, color:C.navy, marginBottom:18 }}>주요 경력</h3>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {m.career.map((c, i) => (
                  <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:C.teal, marginTop:7, flexShrink:0 }} />
                    <span style={{ fontSize:13, color:"#4A4540", lineHeight:1.6 }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background:"white", borderRadius:16, padding:32, boxShadow:"0 4px 24px rgba(10,22,40,0.07)", border:"1px solid rgba(10,22,40,0.06)" }}>
              <div style={{ fontSize:10, letterSpacing:"2px", color:C.gold, fontWeight:700, textTransform:"uppercase", marginBottom:6 }}>EXPERTISE</div>
              <h3 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:17, fontWeight:800, color:C.navy, marginBottom:18 }}>전문 분야</h3>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {m.expertise.map((e, i) => (
                  <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:C.gold, marginTop:7, flexShrink:0 }} />
                    <span style={{ fontSize:13, color:"#4A4540", lineHeight:1.6 }}>{e}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 한마디 */}
          <div style={{ background:C.navy, borderRadius:16, padding:36, boxShadow:"0 4px 24px rgba(10,22,40,0.12)" }}>
            <div style={{ fontSize:10, letterSpacing:"2px", color:C.gold, fontWeight:700, textTransform:"uppercase", marginBottom:12 }}>MESSAGE</div>
            <div style={{ fontSize:28, color:C.gold, fontFamily:"'Noto Serif KR', serif", lineHeight:1, marginBottom:16 }}>"</div>
            <p style={{ fontSize:15, color:"rgba(244,241,235,0.8)", lineHeight:1.9, fontStyle:"italic", marginBottom:4 }}>{m.message}</p>
            <div style={{ textAlign:"right", marginTop:16 }}>
              <span style={{ fontSize:13, color:C.gold, fontWeight:700 }}>— {m.name} {m.title}</span>
            </div>
          </div>

          {/* 다른 전문가 보기 */}
          <div style={{ marginTop:40 }}>
            <h3 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:17, fontWeight:800, color:C.navy, marginBottom:18 }}>다른 전문가</h3>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14 }}>
              {members.filter(o => o.name !== m.name).map(o => (
                <div key={o.name} onClick={() => { setSelectedMember(o); window.scrollTo({ top:0, behavior:"smooth" }); }} style={{ background:"white", borderRadius:12, padding:18, cursor:"pointer", border:"1px solid rgba(10,22,40,0.08)", transition:"all 0.2s", textAlign:"center" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(10,22,40,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ fontSize:28, marginBottom:8 }}>{o.icon}</div>
                  <div style={{ fontWeight:800, color:C.navy, fontSize:14, marginBottom:3 }}>{o.name}</div>
                  <div style={{ fontSize:11, color:C.teal, fontWeight:600 }}>{o.title}</div>
                  <div style={{ fontSize:10, color:C.gray, marginTop:4 }}>{o.spec}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={{ background:C.cream, minHeight:"100vh", padding:"80px 32px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>

        {/* 플랫폼 취지 */}
        <div style={{ marginBottom:80 }}>
          <SectionTag>ABOUT WIHAM 인사이드</SectionTag>
          <h2 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:"clamp(1.7rem, 3vw, 2.4rem)", fontWeight:900, color:C.navy, marginTop:10, marginBottom:24, letterSpacing:"-0.5px" }}>
            왜 WIHAM 인사이드인가요?
          </h2>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32, alignItems:"start" }}>
            <div>
              <p style={{ fontSize:15, color:"#4A4540", lineHeight:1.9, marginBottom:20 }}>
                직장내 괴롭힘은 <strong>2019년 7월 근로기준법 개정</strong> 이후 금지된 행위이지만, 피해 근로자 대부분은 '이게 괴롭힘인지 몰랐다'거나 '신고해도 달라질 게 없다'는 막막함 속에서 혼자 고통을 감내합니다.
              </p>
              <p style={{ fontSize:15, color:"#4A4540", lineHeight:1.9, marginBottom:20 }}>
                동시에 기업과 조직도 사건이 발생하면 <strong>법적 제재, 핵심 인력 이탈, 조직 신뢰 훼손</strong>이라는 실질적 피해를 입습니다. 사전에 예방하지 못했을 때의 비용은, 예방에 드는 비용보다 훨씬 큽니다.
              </p>
              <p style={{ fontSize:15, color:"#4A4540", lineHeight:1.9 }}>
                WIHAM 인사이드는 <strong>전문 노무사가 직접 운영하는 플랫폼</strong>으로, 피해 근로자의 권리 회복과 기업의 건강한 조직문화 구축, 이 두 가지를 함께 지원합니다. 어느 한쪽 편이 아닌, <strong>법과 사실에 근거한 정확한 판단</strong>이 저희의 원칙입니다.
              </p>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {[
                { icon:"🔍", title:"괴롭힘 진단", desc:"고용노동부 표준 기반 체크리스트로 괴롭힘 성립 여부를 정확히 판단합니다" },
                { icon:"🛡️", title:"피해자 구제", desc:"법적 절차 안내부터 고용노동부 진정, 민·형사 연계까지 전 과정을 지원합니다" },
                { icon:"🏢", title:"기업 리스크 관리", desc:"사건 발생 전 조직문화 진단과 예방교육으로 법적·조직적 리스크를 사전에 차단합니다" },
                { icon:"⚙️", title:"사건처리 프로세스", desc:"발생 이후에도 공정한 조사·처리 절차 구축으로 2차 피해와 법적 분쟁을 최소화합니다" },
              ].map(f => (
                <div key={f.title} style={{ display:"flex", gap:16, padding:"16px 20px", background:"white", borderRadius:12, boxShadow:"0 2px 12px rgba(10,22,40,0.06)", border:"1px solid rgba(10,22,40,0.06)" }}>
                  <div style={{ fontSize:24, flexShrink:0 }}>{f.icon}</div>
                  <div>
                    <div style={{ fontWeight:800, color:C.navy, fontSize:14, marginBottom:4 }}>{f.title}</div>
                    <div style={{ fontSize:13, color:C.gray, lineHeight:1.6 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 인사말 */}
        <div style={{ background:"rgba(255,255,255,0.5)", borderRadius:20, padding:"56px 48px", border:"1px solid rgba(10,22,40,0.06)" }}>
          <div style={{ textAlign:"center", marginBottom:14 }}>
            <span style={{ fontSize:11, letterSpacing:"3px", color:C.teal, fontWeight:700, textTransform:"uppercase" }}>Greetings &amp; Introduction</span>
          </div>
          <h2 style={{ textAlign:"center", fontFamily:"'Noto Serif KR', serif", fontSize:"clamp(1.5rem, 2.5vw, 2rem)", fontWeight:500, lineHeight:1.45, margin:"0 0 8px 0", color:C.navy }}>
            "Where the Workplace Heals."
          </h2>
          <p style={{ textAlign:"center", fontSize:15, color:"#5A5550", margin:"0 0 40px 0" }}>일터의 상처가 치유되는 곳</p>
          <div style={{ width:48, height:2, background:C.gold, margin:"0 auto 40px auto" }} />

          <div style={{ maxWidth:780, margin:"0 auto", fontSize:15, lineHeight:1.95, color:"#3A3530" }}>
            <p style={{ marginBottom:18 }}>노무사로 일하면서 가장 안타까웠던 건, 직장 내 괴롭힘의 피해가 결코 가볍지 않다는 사실이었습니다. 어떤 분들은 공황장애나 우울증을 평생의 짐으로 안고 살아가시고, 어떤 분들은 직장을 떠나서도 그 트라우마에서 벗어나지 못합니다. 반대로 가해자로 지목된 분의 인생도 한순간에 무너집니다. <strong style={{ color:C.navy }}>누구의 삶도 가벼운 사건이 아닙니다.</strong></p>

            <p style={{ marginBottom:32 }}>그런데도 권리구제는 여전히 부족합니다. 큰마음 먹고 진정을 넣어도 돌아오는 답은 "회사에 자체 조사를 명령했습니다"라는 한 줄뿐인 경우가 많습니다. <strong style={{ color:C.navy }}>피해자도, 억울한 가해자도, 제대로 보호받지 못합니다.</strong></p>

            <div style={{ width:36, height:1, background:"rgba(10,22,40,0.2)", margin:"0 auto 32px auto" }} />

            <p style={{ marginBottom:32 }}>문제는 이것이 개인의 일로 끝나지 않는다는 점입니다. 괴롭힘이 일상화된 조직에서는 침묵이 자리를 잡고, 솔직한 의견이 사라지며, 핵심 인재들이 조용히 회사를 떠납니다. <strong style={{ color:C.navy }}>저희가 지난 20년 가까이 현장에서 직접 보고 들은 것은 분명합니다. 건강한 조직문화를 가진 회사가 그렇지 않은 회사보다 생산성도, 이직률도, 위기 대응력도 압도적으로 앞선다는 것입니다.</strong> 조직문화는 추상적인 가치가 아닙니다. 그것은 곧 회사의 미래입니다.</p>

            <div style={{ width:36, height:1, background:"rgba(10,22,40,0.2)", margin:"0 auto 32px auto" }} />

            <p style={{ marginBottom:18 }}>WIHAM 인사이드는 바로 이 두 가지 현실 위에서 태어났습니다. <strong style={{ color:C.navy }}>제도가 닿지 못해 무너지는 개인을 위해, 그리고 자신도 모르는 사이에 무너져가는 조직을 위해.</strong></p>

            <p style={{ marginBottom:18 }}>저희 두 사람의 길은 서로 달랐습니다. <strong style={{ color:C.navy }}>한 사람은 오랜 시간 피해자 곁에서 직접 구제 절차를 진행해왔고, 또 한 사람은 기업의 조직문화 개선 프로젝트를 이끌어왔습니다.</strong> 피해자의 눈물과 기업의 고민을 양쪽에서 마주해온 두 시선이 만나는 자리, 그곳이 WIHAM 인사이드입니다.</p>

            <p style={{ marginBottom:18 }}>저희는 직접 분석한 {caseCountLabel}의 실제 판례를 데이터베이스로 구축했습니다. 일반 AI가 그럴듯한 말을 만들어낼 때, WIHAM 인사이드는 실제 사건번호와 법원의 판단을 근거로 답합니다.</p>

            <p style={{ marginBottom:18 }}>저희는 WIHAM 인사이드가 단순한 챗봇이 아니라, <strong style={{ color:C.navy }}>누군가의 일터가 무너지기 전에 닿을 수 있는 첫 번째 손</strong>이 되기를 원합니다. 정확한 분석으로, 그리고 끝까지 외면하지 않는 끈기로, 피해자와 기업 곁에 있겠습니다.</p>

            <p style={{ marginBottom:8 }}>여러분의 일터가 더 건강해지는 그날까지, WIHAM 인사이드는 곁에 있겠습니다. <strong style={{ color:C.navy }}>저희가 먼저 손을 내밀겠습니다.</strong></p>
          </div>

          <div style={{ maxWidth:780, margin:"48px auto 0 auto", paddingTop:28, borderTop:"1px solid rgba(10,22,40,0.12)" }}>
            <div style={{ fontSize:11, letterSpacing:"2px", color:C.teal, fontWeight:700, marginBottom:14, textTransform:"uppercase" }}>WIHAM 인사이드랩스 공동대표</div>
            <div style={{ display:"flex", alignItems:"flex-end", gap:32, flexWrap:"wrap" }}>
              <div>
                <div style={{ fontFamily:"'Noto Serif KR', serif", fontSize:26, fontWeight:500, color:C.navy, letterSpacing:"4px" }}>김 재 정</div>
                <div style={{ fontSize:12, color:"#5A5550", marginTop:4, letterSpacing:"1px" }}>노무사</div>
              </div>
              <div style={{ fontSize:20, color:C.gold, paddingBottom:6 }}>·</div>
              <div>
                <div style={{ fontFamily:"'Noto Serif KR', serif", fontSize:26, fontWeight:500, color:C.navy, letterSpacing:"4px" }}>강 설 희</div>
                <div style={{ fontSize:12, color:"#5A5550", marginTop:4, letterSpacing:"1px" }}>노무사</div>
              </div>
            </div>
          </div>
        </div>

        {/* 운영 원칙 */}
        <div style={{ marginTop:64, padding:40, background:C.navy, borderRadius:20, display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:24 }}>
          {[
            { icon:"🔒", title:"비밀 유지", desc:"모든 상담 내용은 노무사법 제37조에 따른 비밀유지 의무 대상입니다" },
            { icon:"⚖️", title:"중립적 전문성", desc:"감정이 아닌 법과 사실에 근거한 정확한 판단을 제공합니다" },
            { icon:"🤝", title:"양측 이익 균형", desc:"근로자의 권리 회복과 기업의 리스크 해소, 두 가지를 함께 추구합니다" },
          ].map(p => (
            <div key={p.title} style={{ textAlign:"center", padding:"8px 0" }}>
              <div style={{ fontSize:32, marginBottom:12 }}>{p.icon}</div>
              <div style={{ fontWeight:800, color:C.gold, fontSize:15, marginBottom:8 }}>{p.title}</div>
              <div style={{ fontSize:13, color:"rgba(244,241,235,0.6)", lineHeight:1.7 }}>{p.desc}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

// ── 콘텐츠 상세 보기 ─────────────────────────────────────────────────────────
