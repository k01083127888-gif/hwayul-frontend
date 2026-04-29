import { useState } from "react";
import C from "../tokens/colors.js";
import { usePageMeta } from "../utils/usePageMeta.js";
import { useCaseCount } from "../utils/useCaseCount.js";

// ── HeroSection ─────────────────────────────────────────────────────────────────
export function HeroSection({ setActive }) {
  const { label: caseCountLabel } = useCaseCount();
  usePageMeta({
    title: "WIHAM 인사이드 — 직장 내 괴롭힘 & 조직문화 전문 플랫폼",
    description: `20년 노무 전문성과 ${caseCountLabel} 실제 판례 DB. 피해자 구제·피지목인 항변·산재 신청·조직문화 개선을 전문 노무사가 함께합니다.`,
    url: "https://wiham.kr/",
  });

  // 실적 기반 통계 (허위 자동증가 카운터 제거)
  const stats = [
    { n:"675건+",  l:"산재 승인 누적 (2019~2024)", icon:"⚖️" },
    { n:"60~80%",  l:"산재 승인률",                icon:"📊" },
    { n:"12,253건",  l:"2024년 노동부 신고 (5년만 5.8배↑)",  icon:"📋" },
    { n:"10배↑",   l:"정신질환 산재 승인 증가",    icon:"📈" },
  ];

  return (
    <>
    <section className="hero-section" style={{
      minHeight:"100vh", background:`linear-gradient(160deg, ${C.navy} 0%, #0D2140 55%, #071225 100%)`,
      display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center",
      textAlign:"center", padding:"120px 32px 80px", position:"relative", overflow:"hidden",
    }}>
      {/* 서울 야간 위성 사진 (NASA 퍼블릭 도메인) */}
      <div className="hero-bg-satellite" style={{ position:"absolute", inset:0, backgroundImage:"url('/seoul-satellite.jpg')", backgroundSize:"cover", backgroundPosition:"center 75%", opacity:0.45, backgroundColor:"#071225" }} />
      <style>{`
        @media (max-width: 768px) {
          .hero-bg-satellite { background-position: 60% 85% !important; }
        }
      `}</style>
      {/* 그라데이션 오버레이 */}
      <div style={{ position:"absolute", inset:0, background:`linear-gradient(180deg, ${C.navy}AA 0%, ${C.navy}66 40%, ${C.navy}BB 100%)` }} />
      <div style={{ position:"absolute", top:"12%", right:"6%", width:440, height:440, background:`radial-gradient(circle, rgba(13,115,119,0.13) 0%, transparent 70%)`, borderRadius:"50%" }} />
      <div style={{ position:"absolute", bottom:"8%", left:"4%", width:320, height:320, background:`radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)`, borderRadius:"50%" }} />
      <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize:"48px 48px" }} />

      <div style={{ position:"relative", maxWidth:820 }}>
        <h1 style={{ fontFamily:"'Noto Serif KR', Georgia, serif", fontSize:"clamp(2rem, 5vw, 3.4rem)", fontWeight:900, color:C.cream, lineHeight:1.28, marginBottom:22, letterSpacing:"-1px" }}>
          직장내 괴롭힘,<br />
          <span style={{ color:C.tealLight, whiteSpace:"nowrap" }}>예방부터 해결까지 함께합니다</span>
        </h1>

        <p style={{ fontSize:"clamp(0.95rem, 2vw, 1.1rem)", color:"rgba(244,241,235,0.62)", lineHeight:1.85, marginBottom:18, maxWidth:580, margin:"0 auto 18px" }}>
          직장내 괴롭힘 예방대응 & 조직문화 전문 플랫폼<br />
          피해 근로자의 권리 회복, 기업의 리스크 관리 — 전문 노무사가 함께합니다.
        </p>

        {/* ★ NEW: 차별화 한 줄 ★ */}
        <p style={{
          fontSize:"clamp(0.95rem, 2vw, 1.1rem)",
          color:C.gold,
          fontWeight:600,
          lineHeight:1.7,
          marginBottom:52,
          maxWidth:640,
          margin:"0 auto 52px",
          letterSpacing:"-0.3px",
        }}>
          {`"${caseCountLabel}의 판례를 학습한 AI가 20년 전문가의 시선으로 답변합니다"`}
        </p>

        {/* 4개 고객 유형 CTA */}
        <div style={{ fontSize:11, fontWeight:700, color:"rgba(244,241,235,0.4)", letterSpacing:"2px", textAlign:"center", marginBottom:14 }}>어떤 상황이신가요?</div>
        <div className="hero-cta-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:14, maxWidth:920, margin:"0 auto 64px" }}>
          {[
            { id:"checklist", icon:"😟", title:"괴롭힘을 당하고 있어요", desc:"혼자 감당하지 않아도 됩니다", bg:C.gold, tc:C.navy, border:"none", badge:"무료 자가진단" },
            { id:"checklist-accused", icon:"😰", title:"가해자로 지목됐어요", desc:"적정 절차를 받도록 도와드립니다", bg:"transparent", tc:C.cream, border:`2px solid rgba(201,168,76,0.5)`, badge:"무료 자가진단" },
            { id:"checklist-sanjae", icon:"🩺", title:"산재를 신청하고 싶어요", desc:"업무로 인한 질병, 보상받을 수 있습니다", bg:"transparent", tc:C.cream, border:`2px solid rgba(13,115,119,0.5)`, badge:"무료 자가진단" },
            { id:"checklist-company", icon:"🏛️", title:"사내 신고가 접수됐어요", desc:"법적 절차를 지키는 것이 회사를 지킵니다", bg:"transparent", tc:C.cream, border:`2px solid rgba(61,90,128,0.5)`, badge:"무료 자가진단" },
          ].map(cta => (
            <button key={cta.id} onClick={() => setActive(cta.id)} style={{
              padding:"22px 14px", borderRadius:14, background:cta.bg, border:cta.border,
              color:cta.tc, cursor:"pointer", fontFamily:"inherit", textAlign:"center",
              transition:"all 0.25s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.filter = "brightness(1.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.filter = ""; }}
            >
              {cta.badge && <div style={{ fontSize:10, fontWeight:700, color:"#fff", background:C.teal, borderRadius:20, padding:"2px 10px", display:"inline-block", marginBottom:6 }}>{cta.badge}</div>}
              <div style={{ fontSize:30, marginBottom:10 }}>{cta.icon}</div>
              <div style={{ fontWeight:800, fontSize:15, marginBottom:6 }}>{cta.title}</div>
              <div style={{ fontSize:12, opacity:0.72, lineHeight:1.5 }}>{cta.desc}</div>
            </button>
          ))}
        </div>

        {/* 통계 - 공식 고용노동부·근로복지공단 자료 기반 */}
        <div className="stats-flex" style={{ display:"flex", gap:48, justifyContent:"center", paddingTop:40, borderTop:"1px solid rgba(255,255,255,0.08)", flexWrap:"wrap" }}>
          {stats.map(s => (
            <div key={s.l} style={{ textAlign:"center", animation:"countUp 0.8s ease-out" }}>
              <div style={{ fontSize:16, marginBottom:4 }}>{s.icon}</div>
              <div style={{ fontFamily:"'Noto Serif KR', serif", fontSize:"1.7rem", fontWeight:900, color:C.gold, textShadow:"0 0 24px rgba(201,168,76,0.2)" }}>{s.n}</div>
              <div style={{ fontSize:11, color:"rgba(244,241,235,0.45)", marginTop:4 }}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign:"center", marginTop:10, fontSize:10, color:"rgba(244,241,235,0.2)" }}>
          ※ 출처: 국회 환경노동위원회·근로복지공단 공식 자료 (2024.10.22)
        </div>

        {/* 고용노동부 신고 건수 추이 */}
        <div style={{ marginTop:56, padding:"28px 28px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(201,168,76,0.2)", borderRadius:14, maxWidth:820, marginLeft:"auto", marginRight:"auto" }}>
          <div style={{ textAlign:"center", marginBottom:20 }}>
            <div style={{ fontSize:10, fontWeight:700, color:C.gold, letterSpacing:"2px", marginBottom:6 }}>MINISTRY OF EMPLOYMENT & LABOR</div>
            <div style={{ fontFamily:"'Noto Serif KR', serif", fontSize:15, fontWeight:800, color:C.cream }}>고용노동부 직장 내 괴롭힘 신고 건수 추이</div>
            <div style={{ fontSize:10, color:"rgba(244,241,235,0.4)", marginTop:4 }}>2019년 시행 이후 매년 꾸준히 증가 — 5년 만에 5.8배</div>
          </div>

          {/* 막대 그래프 */}
          <div style={{ display:"flex", alignItems:"flex-end", gap:"clamp(4px, 1.5vw, 14px)", height:140, padding:"0 4px 8px", borderBottom:"1px solid rgba(255,255,255,0.08)", marginBottom:14 }}>
            {[
              { year:"2019", count:2130, change:"7월 시행" },
              { year:"2020", count:5823, change:"+173%" },
              { year:"2021", count:7774, change:"+33%" },
              { year:"2022", count:8961, change:"+15%" },
              { year:"2023", count:11038, change:"+23%" },
              { year:"2024", count:12253, change:"+11%", highlight:true },
            ].map(d => {
              const max = 12253;
              const heightPct = (d.count / max) * 100;
              return (
                <div key={d.year} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6, height:"100%" }}>
                  <div style={{ fontSize:10, fontWeight:700, color:d.highlight?C.gold:"rgba(244,241,235,0.6)", whiteSpace:"nowrap" }}>{d.count.toLocaleString()}</div>
                  <div style={{ flex:1, width:"100%", display:"flex", alignItems:"flex-end" }}>
                    <div style={{
                      width:"100%",
                      height:`${heightPct}%`,
                      background:d.highlight
                        ? `linear-gradient(180deg, ${C.goldLight}, ${C.gold})`
                        : `linear-gradient(180deg, rgba(13,115,119,0.6), rgba(13,115,119,0.3))`,
                      borderRadius:"4px 4px 0 0",
                      transition:"all 0.3s",
                      minHeight:8,
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display:"flex", gap:"clamp(4px, 1.5vw, 14px)", padding:"0 4px" }}>
            {[
              { year:"2019", change:"시행" },
              { year:"2020", change:"+173%" },
              { year:"2021", change:"+33%" },
              { year:"2022", change:"+15%" },
              { year:"2023", change:"+23%" },
              { year:"2024", change:"+11%", highlight:true },
            ].map(d => (
              <div key={d.year} style={{ flex:1, textAlign:"center" }}>
                <div style={{ fontSize:11, fontWeight:700, color:d.highlight?C.goldLight:C.cream }}>{d.year}</div>
                <div style={{ fontSize:9, color:"rgba(244,241,235,0.4)", marginTop:2 }}>{d.change}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign:"center", marginTop:14, fontSize:10, color:"rgba(244,241,235,0.3)" }}>
            ※ 출처: 고용노동부 연도별 통계 — 2019년 7월 시행일 이후
          </div>
        </div>

      </div>
    </section>

    {/* 📖 이용 안내 풀섹션 — SEO 강화용 (키워드 풍부, 헤딩 계층) */}
    {/* 별로면 이 <section> 통째로 삭제 가능. */}
    <section style={{ background:C.cream, padding:"96px 32px", borderBottom:`1px solid ${C.gold}22` }}>
      <div style={{ maxWidth:980, margin:"0 auto" }}>
        {/* 헤더 */}
        <div style={{ textAlign:"center", marginBottom:56 }}>
          <div style={{ fontSize:11, letterSpacing:"3px", color:C.gold, fontWeight:700, marginBottom:10 }}>USAGE GUIDE</div>
          <h2 style={{ fontFamily:"'Noto Serif KR', Georgia, serif", fontSize:"clamp(1.6rem, 3.4vw, 2.2rem)", fontWeight:900, color:C.navy, marginBottom:18, letterSpacing:"-0.5px", lineHeight:1.4 }}>
            직장 내 괴롭힘, <span style={{ color:C.teal }}>혼자 고민하지 마세요</span>
          </h2>
          <p style={{ fontSize:15, color:C.gray, lineHeight:1.85, maxWidth:680, margin:"0 auto" }}>
            WIHAM 인사이드는 <strong style={{ color:C.navy }}>20년 경력의 전문 노무사</strong>가 만든
            직장 내 괴롭힘·산재·조직문화 전문 플랫폼입니다.<br/>
            아래 3단계를 따라 진행하시면 본인 상황에 가장 정확한 답변을 받으실 수 있습니다.
          </p>
        </div>

        {/* STEP 1 */}
        <div style={{ background:"white", borderRadius:14, padding:"40px 36px", marginBottom:24, borderLeft:`6px solid ${C.teal}`, boxShadow:"0 2px 12px rgba(10,22,40,0.05)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18, flexWrap:"wrap" }}>
            <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:46, height:46, borderRadius:"50%", background:C.teal, color:"white", fontSize:18, fontWeight:900, fontFamily:"'Noto Serif KR', serif" }}>1</span>
            <h3 style={{ fontFamily:"'Noto Serif KR', Georgia, serif", fontSize:22, fontWeight:900, color:C.navy, margin:0, letterSpacing:"-0.3px" }}>비슷한 사례부터 찾아보세요</h3>
          </div>
          <p style={{ fontSize:14, color:C.gray, lineHeight:1.85, marginBottom:18 }}>
            <strong style={{ color:C.navy }}>313건의 실제 판례·산재 인정 사례·고용노동부 자료</strong>가 정리되어 있습니다.
            폭언·따돌림·과도한 업무 부여·인격 모욕·사적 심부름 등 유형별로 분류돼있어
            본인이 겪고 있는 상황과 가장 비슷한 케이스를 빠르게 확인할 수 있습니다.
          </p>
          <p style={{ fontSize:14, color:C.gray, lineHeight:1.85, marginBottom:14 }}>
            각 콘텐츠 안에는 <strong style={{ color:C.navy }}>"혹시 이런 상황이신가요?" 체크리스트</strong>가 있어,
            본인이 해당하는 항목을 체크해두면 다음 단계 상담 시 자동으로 참고됩니다.
          </p>
          <div style={{ marginTop:22, padding:"14px 18px", background:"#FAFAF7", borderRadius:8, fontSize:13, color:"#5A5550", lineHeight:1.7 }}>
            <strong style={{ color:C.teal }}>💡 활용 TIP</strong> — 산재(우울증·적응장애 등) 인정 사례, 부당해고 구제, 손해배상 판례 등
            본인 상황과 가까운 키워드로 검색해보세요.
          </div>
          <button onClick={() => { if (typeof setActive === "function") setActive("content"); window.scrollTo({ top:0, behavior:"smooth" }); }}
            style={{ marginTop:24, padding:"11px 26px", borderRadius:100, background:C.teal, color:"white", border:"none", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
            📚 콘텐츠 아카이브 둘러보기 →
          </button>
        </div>

        {/* STEP 2 */}
        <div style={{ background:"white", borderRadius:14, padding:"40px 36px", marginBottom:24, borderLeft:`6px solid ${C.gold}`, boxShadow:"0 2px 12px rgba(10,22,40,0.05)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18, flexWrap:"wrap" }}>
            <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:46, height:46, borderRadius:"50%", background:C.gold, color:C.navy, fontSize:18, fontWeight:900, fontFamily:"'Noto Serif KR', serif" }}>2</span>
            <h3 style={{ fontFamily:"'Noto Serif KR', Georgia, serif", fontSize:22, fontWeight:900, color:C.navy, margin:0, letterSpacing:"-0.3px" }}>객관적 진단으로 사건을 정리하세요</h3>
          </div>
          <p style={{ fontSize:14, color:C.gray, lineHeight:1.85, marginBottom:18 }}>
            <strong style={{ color:C.navy }}>고용노동부 직장내 괴롭힘 판단 매뉴얼</strong>을 기반으로 한 무료 자가진단입니다.
            괴롭힘 성립 3대 요건(<strong>지위·관계 우위, 업무상 적정범위 초과, 신체·정신적 고통</strong>)을 차례로
            체크하여 본인 사건의 성립 가능성과 위험도를 객관적으로 평가받을 수 있습니다.
          </p>
          <p style={{ fontSize:14, color:C.gray, lineHeight:1.85, marginBottom:14 }}>
            진단은 <strong style={{ color:C.navy }}>4가지 유형</strong>으로 제공됩니다:
          </p>
          <ul style={{ fontSize:13.5, color:C.gray, lineHeight:2, marginBottom:18, paddingLeft:22 }}>
            <li><strong style={{ color:C.navy }}>피해자 진단</strong> — 괴롭힘 피해를 입은 근로자용</li>
            <li><strong style={{ color:C.navy }}>피지목인 진단</strong> — 가해자로 지목됐을 때 방어 검토용</li>
            <li><strong style={{ color:C.navy }}>산재 진단</strong> — 우울증·적응장애 등 정신질환 산재 신청 검토</li>
            <li><strong style={{ color:C.navy }}>기업·HR 진단</strong> — 사내 신고 접수 시 조사 절차 점검</li>
          </ul>
          <div style={{ padding:"14px 18px", background:"#FAFAF7", borderRadius:8, fontSize:13, color:"#5A5550", lineHeight:1.7 }}>
            <strong style={{ color:"#8B7A40" }}>💡 활용 TIP</strong> — 진단 결과지는 PDF·이메일로 받을 수 있어
            노동청 진정·노동위원회 구제신청 시 첨부 자료로도 활용 가능합니다.
          </div>
          <button onClick={() => { if (typeof setActive === "function") setActive("checklist"); window.scrollTo({ top:0, behavior:"smooth" }); }}
            style={{ marginTop:24, padding:"11px 26px", borderRadius:100, background:C.gold, color:C.navy, border:"none", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
            🔍 무료 진단 시작하기 →
          </button>
        </div>

        {/* STEP 3 */}
        <div style={{ background:"white", borderRadius:14, padding:"40px 36px", marginBottom:24, borderLeft:`6px solid ${C.navy}`, boxShadow:"0 2px 12px rgba(10,22,40,0.05)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18, flexWrap:"wrap" }}>
            <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:46, height:46, borderRadius:"50%", background:C.navy, color:"white", fontSize:18, fontWeight:900, fontFamily:"'Noto Serif KR', serif" }}>3</span>
            <h3 style={{ fontFamily:"'Noto Serif KR', Georgia, serif", fontSize:22, fontWeight:900, color:C.navy, margin:0, letterSpacing:"-0.3px" }}>전문가 상담으로 해결책을 받으세요</h3>
          </div>
          <p style={{ fontSize:14, color:C.gray, lineHeight:1.85, marginBottom:18 }}>
            <strong style={{ color:C.navy }}>AI 상담</strong>은 1,000건+ 판례 DB와 위에서 모은 사례·진단 결과를
            모두 참고하여 일반 AI와 차원이 다른 답변을 제공합니다.
            더 깊은 검토가 필요하면 <strong style={{ color:C.navy }}>20년 경력 노무사의 심층 상담</strong>으로
            바로 연결됩니다.
          </p>
          <p style={{ fontSize:14, color:C.gray, lineHeight:1.85, marginBottom:14 }}>
            제공되는 상담 영역:
          </p>
          <ul style={{ fontSize:13.5, color:C.gray, lineHeight:2, marginBottom:18, paddingLeft:22 }}>
            <li><strong style={{ color:C.navy }}>증거수집·신고 전략</strong> — 카톡·녹취·일지 정리법</li>
            <li><strong style={{ color:C.navy }}>노동청 진정 / 노동위원회 구제신청</strong> 대리</li>
            <li><strong style={{ color:C.navy }}>산재 신청·재해조사</strong> 대응</li>
            <li><strong style={{ color:C.navy }}>피지목인 항변·징계 대응</strong> (블루오션 영역)</li>
            <li><strong style={{ color:C.navy }}>기업 사내조사 대행·취업규칙 정비</strong></li>
          </ul>
          <div style={{ padding:"14px 18px", background:"#FAFAF7", borderRadius:8, fontSize:13, color:"#5A5550", lineHeight:1.7 }}>
            <strong style={{ color:C.navy }}>💡 활용 TIP</strong> — 1·2단계에서 표시한 사례와 진단 결과는 자동 전달됩니다.
            상담 시 같은 설명을 반복할 필요가 없어 시간이 절약됩니다.
          </div>
          <div style={{ display:"flex", gap:10, marginTop:24, flexWrap:"wrap" }}>
            <button onClick={() => { if (typeof setActive === "function") setActive("biz"); window.scrollTo({ top:0, behavior:"smooth" }); }}
              style={{ padding:"11px 26px", borderRadius:100, background:C.navy, color:"white", border:"none", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
              💬 심층 상담 신청 →
            </button>
            <button onClick={() => { if (typeof setActive === "function") setActive("relief"); window.scrollTo({ top:0, behavior:"smooth" }); }}
              style={{ padding:"11px 26px", borderRadius:100, background:"transparent", color:C.navy, border:`1.5px solid ${C.navy}`, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
              🛡️ 해결 의뢰 →
            </button>
          </div>
        </div>

        {/* 추천 대상 */}
        <div style={{ marginTop:48, padding:"32px 36px", background:`linear-gradient(135deg, ${C.navy} 0%, #0D2140 100%)`, borderRadius:14, color:C.cream }}>
          <h3 style={{ fontFamily:"'Noto Serif KR', Georgia, serif", fontSize:18, fontWeight:900, marginBottom:18, color:C.goldLight, letterSpacing:"-0.3px" }}>이런 분들께 WIHAM 인사이드를 추천합니다</h3>
          <ul style={{ fontSize:13.5, lineHeight:2, paddingLeft:22, color:"rgba(244,241,235,0.85)" }}>
            <li>직장 내 괴롭힘으로 정신적·신체적 고통을 겪고 있는 <strong style={{ color:C.cream }}>피해 근로자</strong></li>
            <li>업무 스트레스로 우울증·적응장애 <strong style={{ color:C.cream }}>산재 신청</strong>을 고려 중인 분</li>
            <li>괴롭힘 가해자로 지목돼 <strong style={{ color:C.cream }}>징계·해고 절차</strong>에 대응해야 하는 분</li>
            <li>사내 신고를 접수받아 <strong style={{ color:C.cream }}>조사 절차·증거 검토</strong>가 필요한 HR·인사 담당자</li>
            <li>조직문화 진단으로 <strong style={{ color:C.cream }}>괴롭힘 발생 위험을 사전 점검</strong>하려는 경영진</li>
          </ul>
        </div>
      </div>
    </section>
    </>
  );
}

// ── 소개 ──────────────────────────────────────────────────────────────────────
