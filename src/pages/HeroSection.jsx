import { useState } from "react";
import C from "../tokens/colors.js";

// ── HeroSection ─────────────────────────────────────────────────────────────────
export function HeroSection({ setActive }) {
  // 실적 기반 통계 (허위 자동증가 카운터 제거)
  const stats = [
    { n:"675건+",  l:"산재 승인 누적 (2019~2024)", icon:"⚖️" },
    { n:"60~80%",  l:"산재 승인률",                icon:"📊" },
    { n:"2019년",  l:"직장내 괴롭힘 금지법 시행",  icon:"📋" },
    { n:"10배↑",   l:"정신질환 산재 승인 증가",    icon:"📈" },
  ];

  return (
    <section className="hero-section" style={{
      minHeight:"100vh", background:`linear-gradient(160deg, ${C.navy} 0%, #0D2140 55%, #071225 100%)`,
      display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center",
      textAlign:"center", padding:"120px 32px 80px", position:"relative", overflow:"hidden",
    }}>
      <div style={{ position:"absolute", top:"12%", right:"6%", width:440, height:440, background:`radial-gradient(circle, rgba(13,115,119,0.13) 0%, transparent 70%)`, borderRadius:"50%" }} />
      <div style={{ position:"absolute", bottom:"8%", left:"4%", width:320, height:320, background:`radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)`, borderRadius:"50%" }} />
      <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize:"48px 48px" }} />

      <div style={{ position:"relative", maxWidth:820 }}>
        <h1 style={{ fontFamily:"'Noto Serif KR', Georgia, serif", fontSize:"clamp(2rem, 5vw, 3.4rem)", fontWeight:900, color:C.cream, lineHeight:1.28, marginBottom:22, letterSpacing:"-1px" }}>
          직장내 괴롭힘,<br />
          <span style={{ color:C.tealLight, whiteSpace:"nowrap" }}>예방부터 해결까지 함께합니다</span>
        </h1>

        <p style={{ fontSize:"clamp(0.95rem, 2vw, 1.1rem)", color:"rgba(244,241,235,0.62)", lineHeight:1.85, marginBottom:52, maxWidth:580, margin:"0 auto 52px" }}>
          직장내 괴롭힘 예방대응 & 조직문화 전문 플랫폼<br />
          피해 근로자의 권리 회복, 기업의 리스크 관리 — 전문 노무사가 함께합니다.
        </p>

        {/* 4개 핵심 CTA */}
        <div className="hero-cta-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:14, maxWidth:860, margin:"0 auto 64px" }}>
          {[
            { id:"checklist", icon:"🔍", title:"무료 진단 시작하기",  desc:"직장내 괴롭힘 여부를 지금 바로 확인하세요", bg:C.gold, tc:C.navy, border:"none" },
            { id:"culture",   icon:"🏛️", title:"조직문화 진단",       desc:"괴롭힘 발생 위험을 사전에 점검하세요", bg:"transparent", tc:C.cream, border:`2px solid rgba(13,115,119,0.5)` },
            { id:"biz",       icon:"🏢", title:"기업 상담",           desc:"기업 HR 담당자를 위한 전문 컨설팅", bg:"transparent", tc:C.cream, border:`2px solid rgba(201,168,76,0.5)` },
            { id:"relief",    icon:"🛡️", title:"피해자 구제",          desc:"법적 구제 절차를 안내받으세요", bg:"rgba(192,57,43,0.18)", tc:"#FF8A80", border:`2px solid rgba(192,57,43,0.4)` },
          ].map(cta => (
            <button key={cta.id} onClick={() => setActive(cta.id)} style={{
              padding:"24px 16px", borderRadius:14, background:cta.bg, border:cta.border,
              color:cta.tc, cursor:"pointer", fontFamily:"inherit", textAlign:"center",
              transition:"all 0.25s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.filter = "brightness(1.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.filter = ""; }}
            >
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
      </div>
    </section>
  );
}

// ── 소개 ──────────────────────────────────────────────────────────────────────
