import { useState, useEffect } from "react";
import C from "../tokens/colors.js";
import { _contents, useStore } from "../utils/store.js";
import { ContentDetailView } from "../components/ContentDetailView.jsx";
import { SectionTag } from "../components/common/FormElements.jsx";
import { usePageMeta } from "../utils/usePageMeta.js";

// ── ContentSection ─────────────────────────────────────────────────────────────────
export function ContentSection({ contentId = null, setContentDetail, setActive }) {
  // 목록 페이지일 때만 메타 적용 (상세는 ContentDetailView에서 처리)
  usePageMeta(contentId ? {} : {
    title: "콘텐츠 — 판례·뉴스·자료 | 화율인사이드",
    description: "직장내 괴롭힘·산재 관련 최신 판례, 뉴스, 교육 영상, 실무 자료를 한곳에서 확인하세요.",
    url: "https://hwayul.kr/content",
  });
  useStore(); // _contents 변경 시 리렌더 (DB 비동기 로드 대응)
  const [filter, setFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);
  const typeIcon  = { news:"📰", video:"▶", resource:"📎", column:"✏️" };
  const typeColor = { news:C.teal, video:C.red, resource:C.gold, column:C.purple };
  const SANJAE_TAGS = ["산재통계","산재사례","판례"];
  const visibleNews = _contents.filter(n => !n.hidden);
  const allFiltered = filter === "all" ? visibleNews : filter === "sanjae" ? visibleNews.filter(n => SANJAE_TAGS.includes(n.tag)) : visibleNews.filter(n => n.type === filter);
  const filtered = showAll ? allFiltered : allFiltered.slice(0, 6);
  const hasMore = allFiltered.length > 6 && !showAll;

  // URL의 contentId로 선택된 아이템 결정
  const selectedItem = contentId != null ? _contents.find(n => n.id === contentId) : null;

  // 관련 콘텐츠에서 상세보기로 이동 — URL 기반 네비게이션 사용
  useEffect(() => {
    window.__safeworkOpenDetail = (id) => {
      if (typeof setContentDetail === "function") setContentDetail(id);
    };
    return () => { delete window.__safeworkOpenDetail; };
  }, [setContentDetail]);

  // 상세 보기 모드 — URL에 id는 있는데 아이템을 아직 못 찾음 (DB 로드 중)
  if (contentId != null && !selectedItem) {
    return (
      <section style={{ padding:"120px 32px", background:C.cream, minHeight:"100vh", textAlign:"center" }}>
        <div style={{ color:C.gray, fontSize:14 }}>콘텐츠를 불러오는 중입니다...</div>
      </section>
    );
  }

  // 상세 보기 모드
  if (selectedItem) {
    return <ContentDetailView item={selectedItem} onBack={() => setActive && setActive("content")} />;
  }

  return (
    <section style={{ padding:"80px 32px", background:C.cream, minHeight:"100vh" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <SectionTag>CONTENT ARCHIVE</SectionTag>
        <h2 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:"2rem", fontWeight:800, color:C.navy, marginTop:8, marginBottom:8 }}>콘텐츠 아카이브</h2>
        <p style={{ color:C.gray, marginBottom:32 }}>산업재해 판례·산재 승인 사례·뉴스·교육영상·서식자료를 한 곳에서 확인하세요.</p>

        <div style={{ display:"flex", gap:8, marginBottom:32, flexWrap:"wrap" }}>
          {[{ id:"all", label:"전체" }, { id:"sanjae", label:"⚖️ 산업재해·판례" }, { id:"news", label:"📰 뉴스·정책" }, { id:"video", label:"▶ 교육영상" }, { id:"resource", label:"📎 자료" }, { id:"column", label:"✏️ 칼럼" }].map(f => (
            <button key={f.id} onClick={() => { setFilter(f.id); setShowAll(false); }} style={{
              padding:"8px 20px", borderRadius:100,
              border:`2px solid ${filter === f.id ? (f.id === "sanjae" ? C.teal : C.navy) : "rgba(10,22,40,0.15)"}`,
              background:filter === f.id ? (f.id === "sanjae" ? C.teal : C.navy) : "white",
              color:filter === f.id ? "white" : (f.id === "sanjae" ? C.teal : C.navy),
              fontWeight:filter === f.id ? 700 : (f.id === "sanjae" ? 600 : 400), fontSize:13, cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s",
            }}>{f.label}{f.id === "sanjae" && <span style={{ marginLeft:6, padding:"1px 7px", borderRadius:100, background:filter === f.id ? "rgba(255,255,255,0.25)" : `${C.teal}18`, fontSize:10, fontWeight:700, color:filter === f.id ? "white" : C.teal }}>{visibleNews.filter(n => SANJAE_TAGS.includes(n.tag)).length}</span>}</button>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(320px, 1fr))", gap:22 }}>
          {filtered.map(item => (
            <article key={item.id} style={{ background:"white", borderRadius:12, padding:26, cursor:"pointer", border:"1px solid rgba(10,22,40,0.07)", boxShadow:"0 2px 10px rgba(10,22,40,0.05)", transition:"all 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(10,22,40,0.11)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 10px rgba(10,22,40,0.05)"; }}
              onClick={() => { if (setContentDetail) setContentDetail(item.id); }}
            >
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                <span style={{ padding:"3px 10px", borderRadius:4, background:typeColor[item.type]+"18", color:typeColor[item.type], fontSize:11, fontWeight:700 }}>
                  {typeIcon[item.type]} {item.tag}
                </span>
                <span style={{ fontSize:11, color:C.gray }}>{item.date}</span>
              </div>
              <h3 style={{ fontSize:14, fontWeight:700, color:C.navy, lineHeight:1.55, marginBottom:10 }}>{item.title}</h3>
              <p style={{ fontSize:13, color:C.gray, lineHeight:1.65, marginBottom:14 }}>{item.summary}</p>
              <div style={{ display:"flex", justifyContent:"space-between", paddingTop:12, borderTop:"1px solid rgba(10,22,40,0.07)" }}>
                <span style={{ fontSize:12, color:C.gray }}>👁 {item.views.toLocaleString()}</span>
                <button onClick={(e) => { e.stopPropagation(); if (setContentDetail) setContentDetail(item.id); }} style={{ fontSize:12, color:C.teal, fontWeight:700, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>자세히 보기 →</button>
              </div>
            </article>
          ))}
        </div>

        {hasMore && (
          <div style={{ textAlign:"center", marginTop:44 }}>
            <button onClick={() => setShowAll(true)} style={{ padding:"13px 38px", borderRadius:8, border:`2px solid ${C.navy}`, background:"transparent", color:C.navy, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = C.navy; e.currentTarget.style.color = "white"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.navy; }}
            >
              더 많은 콘텐츠 보기 ↓
            </button>
          </div>
        )}

        {showAll && allFiltered.length > 6 && (
          <div style={{ textAlign:"center", marginTop:44 }}>
            <button onClick={() => { setShowAll(false); window.scrollTo({ top:0, behavior:"smooth" }); }} style={{ padding:"13px 38px", borderRadius:8, border:`2px solid ${C.gray}`, background:"transparent", color:C.gray, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = C.gray; e.currentTarget.style.color = "white"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.gray; }}
            >
              접기 ↑
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// ── 무료 상담 연결 배너 (공통 컴포넌트) ────────────────────────────────────────
// variant: "dark" (체크리스트 결과, 네이비 배경) | "light" (조직문화 결과, 흰 배경)
// context: "checklist" | "culture" | "compliance" | "workers"
