import { useState, useEffect } from "react";
import C from "../tokens/colors.js";

// ── 네비게이션 탭 정의 ────────────────────────────────────────────────────────
export const TABS = [
  { id:"home",    label:"홈" },
  { id:"intro",   label:"소개" },
  { id:"content", label:"콘텐츠" },
  { id:"checklist",label:"진단" },
  { id:"culture", label:"조직문화" },
  { id:"report",  label:"익명 제보" },
  { id:"biz",     label:"심층상담" },
  { id:"relief",  label:"해결 의뢰" },
];

export function Nav({ active, setActive }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const handleTab = (id) => { setActive(id); setMenuOpen(false); };

  const NavLogo = () => (
    <div onClick={() => handleTab("home")} style={{ display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}>
      <div style={{ width:42, height:42 }}>
        <svg width="42" height="42" viewBox="0 0 100 100" style={{ filter:"drop-shadow(0 2px 8px rgba(13,115,119,0.15))" }}>
          <defs>
            <linearGradient id="nN" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0A1628" /><stop offset="100%" stopColor="#1E3A5F" />
            </linearGradient>
            <linearGradient id="nM" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0D7377" /><stop offset="100%" stopColor="#4ECDC4" />
            </linearGradient>
          </defs>
          <line x1="18" y1="10" x2="18" y2="90" stroke="url(#nN)" strokeWidth="10" strokeLinecap="round" />
          <line x1="50" y1="10" x2="50" y2="55" stroke="url(#nN)" strokeWidth="10" strokeLinecap="round" />
          <line x1="78" y1="52" x2="78" y2="90" stroke="url(#nN)" strokeWidth="10" strokeLinecap="round" />
          <path d="M18,46 C28,46 32,33 40,33 C48,33 44,46 50,46" stroke="url(#nM)" strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d="M50,12 C52,30 60,42 70,48 C74,50 78,52 78,52" stroke="url(#nM)" strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d="M96,12 C94,28 88,40 82,47 C80,50 78,52 78,52" stroke="url(#nM)" strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d="M18,90 C34,82 62,82 78,90" stroke="url(#nM)" strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.45" />
          <circle cx="50" cy="46" r="3" fill="#4ECDC4" opacity="0.5" />
          <circle cx="78" cy="52" r="3" fill="#4ECDC4" opacity="0.5" />
        </svg>
      </div>
      <div>
        <div style={{ fontFamily:"'BrandFont', 'Noto Sans KR', sans-serif", fontSize:18, fontWeight:800, letterSpacing:"-0.3px", lineHeight:1.2 }}>
          <span className="wiham" style={{ color:C.cream }}>WIHAM</span><span style={{ color:C.tealLight, marginLeft:6 }}>인사이드</span>
        </div>
        <div style={{ fontSize:9, color:C.gold, letterSpacing:"2px", marginTop:2, fontFamily:"'Noto Sans KR', sans-serif", fontWeight:700 }}>WIHAM INSIDE LABS</div>
        <div style={{ fontSize:9, color:"rgba(244,241,235,0.7)", letterSpacing:"0.5px", marginTop:2, fontFamily:"'Noto Sans KR', sans-serif" }}>직장내괴롭힘 & 조직문화 플랫폼</div>
      </div>
    </div>
  );

  return (
    <>
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        background: scrolled ? "rgba(10,22,40,0.97)" : "rgba(10,22,40,0.88)",
        backdropFilter:"blur(14px)",
        borderBottom: scrolled ? `1px solid rgba(201,168,76,0.25)` : "1px solid transparent",
        transition:"all 0.3s",
      }}>
        <div style={{ maxWidth:1240, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:62, padding:"0 20px" }}>
          <NavLogo />

          {/* PC 탭 — 768px 이상에서만 표시 */}
          <div className="nav-tabs-desktop" style={{ display:"flex", gap:2 }}>
            {TABS.map(tab => {
              const isRelief = tab.id === "relief";
              const isBiz = tab.id === "biz";
              const isCulture = tab.id === "culture";
              const isActive = active === tab.id;
              return (
                <button key={tab.id} onClick={() => handleTab(tab.id)} style={{
                  padding:"6px 14px", borderRadius:6, border: isRelief ? `1px solid rgba(192,57,43,0.5)` : isBiz ? `1px solid rgba(201,168,76,0.4)` : isCulture ? `1px solid rgba(13,115,119,0.4)` : "none",
                  cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight: isActive ? 700 : 400,
                  background: isActive ? (isRelief ? C.red : isBiz ? C.gold : isCulture ? C.teal : C.gold) : (isRelief ? "rgba(192,57,43,0.12)" : isBiz ? "rgba(201,168,76,0.1)" : isCulture ? "rgba(13,115,119,0.1)" : "transparent"),
                  color: isActive ? (isRelief ? "white" : isCulture ? "white" : C.navy) : (isRelief ? "#FF8A80" : isBiz ? C.goldLight : isCulture ? C.tealLight : C.cream),
                  transition:"all 0.2s",
                }}>{tab.label}</button>
              );
            })}
          </div>

          {/* 햄버거 버튼 — 768px 미만에서만 표시 */}
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(o => !o)}
            style={{ display:"none", flexDirection:"column", gap:5, padding:"8px", background:"none", border:"none", cursor:"pointer" }}
            aria-label="메뉴 열기"
          >
            <span style={{ display:"block", width:22, height:2, background: menuOpen ? C.tealLight : C.cream, transition:"all 0.3s",
              transform: menuOpen ? "rotate(45deg) translate(5px,5px)" : "none" }} />
            <span style={{ display:"block", width:22, height:2, background: menuOpen ? "transparent" : C.cream, transition:"all 0.3s" }} />
            <span style={{ display:"block", width:22, height:2, background: menuOpen ? C.tealLight : C.cream, transition:"all 0.3s",
              transform: menuOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
          </button>
        </div>
      </nav>

      {/* 모바일 드롭다운 메뉴 */}
      {menuOpen && (
        <div style={{
          position:"fixed", top:62, left:0, right:0, zIndex:99,
          background:"rgba(10,22,40,0.98)", backdropFilter:"blur(14px)",
          borderBottom:`1px solid rgba(201,168,76,0.2)`,
          display:"flex", flexDirection:"column", padding:"12px 0",
        }}>
          {TABS.map(tab => {
            const isRelief = tab.id === "relief";
            const isBiz = tab.id === "biz";
            const isCulture = tab.id === "culture";
            const isActive = active === tab.id;
            return (
              <button key={tab.id} onClick={() => handleTab(tab.id)} style={{
                padding:"14px 24px", border:"none", cursor:"pointer", fontFamily:"inherit",
                fontSize:15, fontWeight: isActive ? 700 : 400, textAlign:"left",
                background: isActive ? "rgba(201,168,76,0.12)" : "transparent",
                borderLeft: isActive ? `3px solid ${isRelief ? C.red : isBiz ? C.gold : isCulture ? C.tealLight : C.gold}` : "3px solid transparent",
                color: isRelief ? "#FF8A80" : isBiz ? C.goldLight : isCulture ? C.tealLight : C.cream,
              }}>
                {tab.label}
                {isActive && <span style={{ marginLeft:8, fontSize:11, opacity:0.6 }}>●</span>}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
