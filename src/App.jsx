import { useState, useEffect, useRef } from "react";
import C from "./tokens/colors.js";

// ── 컴포넌트 ──────────────────────────────────────────────────────────────────
import { Nav } from "./components/Nav.jsx";
import { SideRequestPanel } from "./components/SideRequestPanel.jsx";
import { NewsletterSection } from "./components/NewsletterSection.jsx";
import { NewFeaturesHub } from "./components/NewFeaturesHub.jsx";
import { PrivacyPolicyModal } from "./components/common/PrivacyPolicyModal.jsx";

import CasesManager from "./components/CasesManager.jsx";
import { loadContentsFromDB } from "./utils/store.js";
// ── 페이지 ────────────────────────────────────────────────────────────────────
import { HeroSection } from "./pages/HeroSection.jsx";
import { IntroSection } from "./pages/IntroSection.jsx";
import { ContentSection } from "./pages/ContentSection.jsx";
import { ChecklistSection } from "./pages/ChecklistSection.jsx";
import { CultureSection } from "./pages/CultureSection.jsx";
import { ReportSection } from "./pages/ReportSection.jsx";
import { BizSection } from "./pages/BizSection.jsx";
import { ReliefSection } from "./pages/ReliefSection.jsx";
import { AdminSection } from "./pages/AdminSection.jsx";
import { DifferentiationSection } from "./pages/DifferentiationSection.jsx";

export default function App() {
  // URL ↔ 페이지 매핑
  const pageToPath = { home:"/", intro:"/intro", content:"/content", checklist:"/checklist", culture:"/culture", report:"/report", biz:"/biz", relief:"/relief", admin:"/admin", cases:"/cases" };
  const pathToPage = Object.fromEntries(Object.entries(pageToPath).map(([k,v])=>[v,k]));

  // 현재 URL에서 초기 페이지 결정
  const getPageFromURL = () => pathToPage[window.location.pathname] || "home";

  const [active, _setActive] = useState(getPageFromURL);
  const setActive = (page) => {
    const path = pageToPath[page] || "/";
    window.history.pushState({ page }, "", path);
    _setActive(page);
  };
  const [showFooterPrivacy, setShowFooterPrivacy] = useState(false);
  // 관리자 인증 상태를 전역으로 관리 → AdminSection과 NewFeaturesHub가 공유
  const [isAdmin, setIsAdmin] = useState(false);
  const adminTimerRef = useRef(null);
// 모바일 뒤로가기 지원
  const isPopState = useRef(false);
useEffect(() => {
    const path = pageToPath[getPageFromURL()] || "/";
    window.history.replaceState({ page: getPageFromURL() }, "", path);
  }, []);
  useEffect(() => {
    if (isPopState.current) {
      isPopState.current = false;
    }
    // 페이지 전환 시 스크롤 맨 위로 (모바일 UX)
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [active]);

  useEffect(() => {
   const handlePopState = (e) => {
      isPopState.current = true;
      if (e.state && e.state.page) {
        if (e.state.page !== "contentDetail") {
          _setActive(e.state.page);
        }
      } else {
        // URL에서 페이지 결정 (뒤로가기로 외부에서 돌아왔을 때)
        _setActive(getPageFromURL());
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  useEffect(() => {
    loadContentsFromDB();
  }, []);
  // 관리자 자동 로그아웃 (30분 비활동 시)
  useEffect(() => {
    if (!isAdmin) return;
    const TIMEOUT = 30 * 60 * 1000; // 30분
    const resetTimer = () => {
      if (adminTimerRef.current) clearTimeout(adminTimerRef.current);
      adminTimerRef.current = setTimeout(() => {
        setIsAdmin(false);
        setActive("home");
      }, TIMEOUT);
    };
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      if (adminTimerRef.current) clearTimeout(adminTimerRef.current);
    };
  }, [isAdmin]);

  // 관리자 진입 단축키 (Ctrl + Shift + F12)
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "F12") {
        e.preventDefault();
        setActive("admin");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // viewport meta 태그 주입 (모바일 반응형)
  useEffect(() => {
    if (!document.querySelector('meta[name="viewport"]')) {
      const meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content = "width=device-width, initial-scale=1, maximum-scale=1";
      document.head.appendChild(meta);
    }
  }, []);

  // AI 챗봇 CTA 버튼 → 탭 이동 이벤트 수신
  useEffect(() => {
    const handler = (e) => { if (e.detail) setActive(e.detail); };
    window.addEventListener("hwayul-goto", handler);
    return () => window.removeEventListener("hwayul-goto", handler);
  }, []);

  return (
    <div style={{ fontFamily:"'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700;800;900&family=Noto+Serif+KR:wght@700;900&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:${C.navy}; overflow-x: hidden; }
        html { overflow-x: hidden; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:${C.navy}; }
        ::-webkit-scrollbar-thumb { background:${C.gold}; border-radius:3px; }
        input::placeholder, textarea::placeholder { color:rgba(139,134,128,0.7); }
        select option { background:${C.navy}; color:${C.cream}; }
        @keyframes logoSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes countUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

        /* ══════════════════════════════════════════
           모바일 반응형 (클래스 기반, 안정적)
           ══════════════════════════════════════════ */

        /* ── 네비게이션: 햄버거 / 탭 전환 ── */
        @media (max-width: 768px) {
          .nav-tabs-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
          .side-panel-desktop { display: none !important; }
          .side-panel-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-hamburger { display: none !important; }
          .nav-tabs-desktop { display: flex !important; }
        }

        /* ── 메인 패딩: 모바일에서 좌우 여백 축소 ── */
        @media (max-width: 768px) {
          main { padding-top: 62px; }
          main > section {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
          /* 히어로 섹션 상하 패딩 줄이기 */
          .hero-section {
            padding-top: 90px !important;
            padding-bottom: 50px !important;
          }
        }

        /* ── 히어로 4열 CTA → 모바일 2열 ── */
        @media (max-width: 768px) {
          .hero-cta-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
        }
        @media (max-width: 400px) {
          .hero-cta-grid {
            grid-template-columns: 1fr !important;
          }
        }

        /* ── 콘텐츠 카드 그리드 ── */
        @media (max-width: 768px) {
          .content-grid-3,
          .content-grid-4,
          .content-grid-5 {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          .content-grid-auto-320 {
            grid-template-columns: 1fr !important;
          }
          .content-grid-2col {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .content-grid-3,
          .content-grid-4,
          .content-grid-5,
          .content-grid-2col {
            grid-template-columns: 1fr !important;
          }
        }

        /* ── 폼 내부 2열 그리드 → 1열 ── */
        @media (max-width: 600px) {
          .form-grid-2 {
            grid-template-columns: 1fr !important;
          }
        }

        /* ── 통계 flex wrap 간격 조정 ── */
        @media (max-width: 768px) {
          .stats-flex { gap: 24px !important; }
        }

        /* ── 푸터: 5열 → 1열 ── */
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          footer { padding: 32px 18px !important; }
          footer > div { text-align: left !important; }
        }

        /* ── 관리자 테이블: 가로 스크롤 ── */
        @media (max-width: 768px) {
          .admin-table-wrap { overflow-x: auto !important; -webkit-overflow-scrolling: touch; }
          table { font-size: 11px !important; min-width: 600px; }
          th, td { padding: 6px 8px !important; }
        }

        /* ── 모달: 모바일 꽉 채우기 ── */
        @media (max-width: 600px) {
          .modal-box {
            padding: 20px !important;
            border-radius: 12px !important;
          }
        }

        /* ── 플로팅 버튼 위치 ── */
        @media (max-width: 768px) {
          .features-hub-fixed { bottom: 16px !important; right: 16px !important; }
        }

        /* ── 각 섹션 공통 패딩 모바일 ── */
        @media (max-width: 768px) {
          .section-pad {
            padding: 60px 16px !important;
          }
          .section-pad-sm {
            padding: 40px 16px !important;
          }
        }

        /* ── 사이드 패널: 모바일에서 전체 너비 ── */
        @media (max-width: 768px) {
          .side-panel {
            width: 100% !important;
            max-width: 100% !important;
            right: 0 !important;
            border-radius: 16px 16px 0 0 !important;
            bottom: 0 !important;
            top: auto !important;
          }
        }

        /* ── 폰트 크기 유연하게 ── */
        @media (max-width: 480px) {
          h1 { font-size: 1.65rem !important; line-height: 1.3 !important; }
          h2 { font-size: 1.35rem !important; }
        }

        /* ── 전체 가로 넘침 방지 ── */
        * { max-width: 100%; box-sizing: border-box; }
        img, svg { max-width: 100%; height: auto; }
        input, select, textarea { max-width: 100%; }
        
      `}</style>

      <PrivacyPolicyModal isOpen={showFooterPrivacy} onClose={() => setShowFooterPrivacy(false)} />
      {active === "home" && <SideRequestPanel />}
      <NewFeaturesHub isAdmin={isAdmin} />
      <Nav active={active} setActive={setActive} />

      <main style={{ paddingTop:62 }}>
        {active === "home"      && <HeroSection    setActive={setActive} />}
        {active === "intro"     && <IntroSection />}
        {active === "content"   && <ContentSection />}
        {active === "checklist" && <ChecklistSection setActive={setActive} />}
        {active === "culture"  && <CultureSection />}
        {active === "report"    && <ReportSection />}
        {active === "biz"       && <BizSection />}
        {active === "relief"    && <ReliefSection />}
        {active === "admin"     && <AdminSection setActive={setActive} authed={isAdmin} setAuthed={setIsAdmin} />}
        {active === "cases"     && <CasesManager />}
      </main>

      {active === "home" && <DifferentiationSection setActive={setActive} />}
      {active === "home" && <NewsletterSection />}

      <footer style={{ background:C.navy, borderTop:`1px solid rgba(201,168,76,0.18)`, padding:"40px 32px" }}>
        <div className="footer-grid" style={{ maxWidth:1200, margin:"0 auto", display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", gap:28 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
              <svg width="38" height="38" viewBox="0 0 100 100" style={{ opacity:0.85 }}>
                <defs>
                  <linearGradient id="fN" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#1E3A5F" /><stop offset="100%" stopColor="#2A4A70" /></linearGradient>
                  <linearGradient id="fM" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#0D7377" /><stop offset="100%" stopColor="#4ECDC4" /></linearGradient>
                </defs>
                <line x1="18" y1="10" x2="18" y2="90" stroke="url(#fN)" strokeWidth="10" strokeLinecap="round" />
                <line x1="50" y1="10" x2="50" y2="55" stroke="url(#fN)" strokeWidth="10" strokeLinecap="round" />
                <line x1="78" y1="52" x2="78" y2="90" stroke="url(#fN)" strokeWidth="10" strokeLinecap="round" />
                <path d="M18,46 C28,46 32,33 40,33 C48,33 44,46 50,46" stroke="url(#fM)" strokeWidth="7" fill="none" strokeLinecap="round" />
                <path d="M50,12 C52,30 60,42 70,48 C74,50 78,52 78,52" stroke="url(#fM)" strokeWidth="7" fill="none" strokeLinecap="round" />
                <path d="M96,12 C94,28 88,40 82,47 C80,50 78,52 78,52" stroke="url(#fM)" strokeWidth="7" fill="none" strokeLinecap="round" />
                <path d="M18,90 C34,82 62,82 78,90" stroke="url(#fM)" strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.45" />
                <circle cx="50" cy="46" r="3" fill="#4ECDC4" opacity="0.5" />
                <circle cx="78" cy="52" r="3" fill="#4ECDC4" opacity="0.5" />
              </svg>
              <div>
                <div style={{ fontFamily:"'Noto Sans KR', sans-serif", fontSize:19, fontWeight:800 }}><span style={{ color:C.cream }}>화율</span> <span style={{ color:C.tealLight }}>인사이드</span></div>
                <div style={{ fontSize:9, color:"rgba(244,241,235,0.45)", letterSpacing:"1.5px", fontFamily:"'Noto Sans KR', sans-serif" }}>Hwayul Inside</div>
                <div style={{ fontSize:7, color:"rgba(244,241,235,0.28)", letterSpacing:"0.5px", marginTop:0 }}>직장내괴롭힘 & 조직문화 플랫폼</div>
              </div>
            </div>
            <div style={{ fontSize:12, color:"rgba(244,241,235,0.4)", lineHeight:1.8 }}>
              직장내 괴롭힘 예방대응 & 조직문화 전문 플랫폼<br/>
              전문 노무사가 운영하는 신뢰할 수 있는 서비스
            </div>
            <div style={{ marginTop:14, fontSize:11, color:"rgba(244,241,235,0.25)", lineHeight:1.7 }}>
              상담내용은 노무사법 제37조에 따른 비밀유지 의무 대상입니다.
            </div>
          </div>
          {[
            { title:"서비스", links:["소개", "콘텐츠", "진단 체크리스트", "조직문화 진단"] },
            { title:"지원",   links:["익명 제보", "해결 의뢰", "기업 상담"] },
            { title:"문의",   links:["이메일: hwayulinside@gmail.com", "전화: 02-2088-1767", "운영시간: 평일 09-18시"] },
            { title:"법적 고지", links:["개인정보 처리방침", "이용약관"] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontSize:12, fontWeight:700, color:C.gold, letterSpacing:"1px", marginBottom:14 }}>{col.title}</div>
              {col.links.map(l => (
                <div key={l} style={{ fontSize:12, color:"rgba(244,241,235,0.4)", marginBottom:8, lineHeight:1.5, cursor:l==="개인정보 처리방침"?"pointer":"default" }} onClick={() => { if(l==="개인정보 처리방침") setShowFooterPrivacy(true); }}
                  onMouseEnter={e => { if(l==="개인정보 처리방침") e.currentTarget.style.color = C.tealLight; }}
                  onMouseLeave={e => { if(l==="개인정보 처리방침") e.currentTarget.style.color = "rgba(244,241,235,0.4)"; }}
                >{l === "개인정보 처리방침" ? "📋 "+l : l}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ maxWidth:1200, margin:"24px auto 0", paddingTop:24, borderTop:"1px solid rgba(255,255,255,0.06)", textAlign:"center", fontSize:11, color:"rgba(244,241,235,0.22)" }}>
          © 2025 화율인사이드. 본 플랫폼의 진단 결과는 참고용이며 법적 효력이 없습니다. 최종 판단은 전문 노무사와 확인하시기 바랍니다.
        </div>
        <div style={{ textAlign:"center", marginTop:12, height:16 }}>
          <span onDoubleClick={() => setActive("admin")} style={{ fontSize:10, color:"rgba(244,241,235,0.06)", cursor:"default", userSelect:"none" }}>© HI</span>
        </div>
      </footer>
    </div>
  );
}
