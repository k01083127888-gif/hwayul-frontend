import { useState, useEffect } from "react";
import C from "../tokens/colors.js";
import { _contents, useStore, loadSingleContentFromDB } from "../utils/store.js";
import { ContentDetailView } from "../components/ContentDetailView.jsx";
import { SectionTag } from "../components/common/FormElements.jsx";
import { usePageMeta } from "../utils/usePageMeta.js";
import { CONTENT_TAB_GROUPS, normalizeContentType, getContentTypeMeta, itemInGroup } from "../utils/contentType.js";
import { slugify } from "../utils/slugify.js";

// ── ContentSection ─────────────────────────────────────────────────────────────────
export function ContentSection({ contentId = null, setContentDetail, setActive }) {
  // 목록 페이지일 때만 메타 적용 (상세는 ContentDetailView에서 처리)
  usePageMeta(contentId ? {} : {
    title: "콘텐츠 — 판례·뉴스·자료 | WIHAM 인사이드",
    description: "직장내 괴롭힘·산재 관련 최신 판례, 뉴스, 교육 영상, 실무 자료를 한곳에서 확인하세요.",
    url: "https://hwayul.kr/content",
  });
  useStore(); // _contents 변경 시 리렌더 (DB 비동기 로드 대응)
  const [filter, setFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState("");
  const visibleNews = _contents.filter(n => !n.hidden);
  const byGroup = filter === "all" ? visibleNews : visibleNews.filter(n => itemInGroup(n, filter));
  // 공백 무시 검색: "직장내 괴롭힘" = "직장 내 괴롭힘" 같게 인식
  const normalize = (s) => (s || "").toLowerCase().replace(/\s+/g, "");
  const q = normalize(query);
  const searched = q
    ? byGroup.filter(n => normalize((n.title||"") + (n.summary||"") + (n.tag||"") + (n.case_number||"")).includes(q))
    : byGroup;
  const allFiltered = searched;
  const filtered = showAll ? allFiltered : allFiltered.slice(0, 6);
  // 그룹별 카운트 (탭 뒤 숫자)
  const countByGroup = CONTENT_TAB_GROUPS.reduce((acc, g) => { acc[g.id] = visibleNews.filter(n => itemInGroup(n, g.id)).length; return acc; }, {});
  const hasMore = allFiltered.length > 6 && !showAll;

  // URL의 contentId로 선택된 아이템 결정
  const selectedItem = contentId != null ? _contents.find(n => n.id === contentId) : null;

  // 관련 콘텐츠에서 상세보기로 이동 — URL 기반 네비게이션 사용
  useEffect(() => {
    window.__safeworkOpenDetail = (id) => {
      if (typeof setContentDetail === "function") {
        const item = _contents.find(n => n.id === id);
        setContentDetail(id, item ? slugify(item.title) : "");
      }
    };
    return () => { delete window.__safeworkOpenDetail; };
  }, [setContentDetail]);

  // /content/:id (slug 없는 URL)로 직접 진입 시, 아이템 로드되면 URL에 slug 붙여 교체
  // — 검색엔진과 사용자 모두 SEO URL을 보게 함 (history 기록은 남기지 않음)
  useEffect(() => {
    if (!selectedItem) return;
    const path = window.location.pathname;
    const m = path.match(/^\/content\/(\d+)(?:\/([^/]*))?$/);
    if (!m) return;
    const slug = slugify(selectedItem.title);
    if (!slug) return;
    const currentSlug = m[2] ? decodeURIComponent(m[2]) : "";
    if (currentSlug !== slug) {
      const newUrl = `/content/${selectedItem.id}/${encodeURIComponent(slug)}`;
      window.history.replaceState(window.history.state, "", newUrl);
    }
  }, [selectedItem]);

  // 콘텐츠 ID가 있는데 리스트에 없으면 단일 fetch 시도 (직접 URL 진입 대응)
  const [singleFetchTried, setSingleFetchTried] = useState(false);
  useEffect(() => {
    if (contentId != null && !selectedItem && !singleFetchTried) {
      setSingleFetchTried(true);
      loadSingleContentFromDB(contentId);
    }
  }, [contentId, selectedItem, singleFetchTried]);

  // 상세 보기 모드 — URL에 id는 있는데 아이템을 아직 못 찾음 (DB 로드 중 or 없는 ID)
  if (contentId != null && !selectedItem) {
    return (
      <section style={{ padding:"120px 32px", background:C.cream, minHeight:"100vh", textAlign:"center" }}>
        <div style={{ color:C.gray, fontSize:14 }}>
          {singleFetchTried ? "콘텐츠를 찾을 수 없습니다. 삭제되었거나 잘못된 링크일 수 있어요." : "콘텐츠를 불러오는 중입니다..."}
        </div>
        {singleFetchTried && (
          <button onClick={() => setActive && setActive("content")} style={{ marginTop:20, padding:"10px 24px", borderRadius:8, border:`2px solid ${C.navy}`, background:"white", color:C.navy, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
            ← 콘텐츠 목록으로
          </button>
        )}
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
        <p style={{ color:C.gray, marginBottom:32 }}>판례사례·산재사례·뉴스·서식자료·칼럼을 한 곳에서 확인하세요.</p>

        {/* 검색창 */}
        <div style={{ marginBottom:16, position:"relative", maxWidth:480 }}>
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setShowAll(false); }}
            placeholder="제목·요약·태그·판례번호로 검색"
            style={{ width:"100%", padding:"11px 40px 11px 16px", borderRadius:10, border:"1.5px solid rgba(10,22,40,0.12)", background:"white", fontSize:13, fontFamily:"inherit", outline:"none", color:C.navy }}
            onFocus={e => e.target.style.borderColor = C.teal}
            onBlur={e => e.target.style.borderColor = "rgba(10,22,40,0.12)"}
          />
          <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", fontSize:14, color:C.gray, pointerEvents:"none" }}>🔍</span>
          {q && <div style={{ marginTop:6, fontSize:11, color:C.gray }}>"{query}" 검색 결과 {searched.length}건</div>}
        </div>

        <div style={{ display:"flex", gap:8, marginBottom:32, flexWrap:"wrap" }}>
          {[{ id:"all", label:"전체", color:C.navy }, ...CONTENT_TAB_GROUPS.map(g => ({ id:g.id, label:`${g.icon} ${g.label}`, color:g.color }))].map(f => {
            const active = filter === f.id;
            const cnt = f.id === "all" ? visibleNews.length : countByGroup[f.id];
            return (
              <button key={f.id} onClick={() => { setFilter(f.id); setShowAll(false); }} style={{
                padding:"8px 20px", borderRadius:100,
                border:`2px solid ${active ? f.color : "rgba(10,22,40,0.15)"}`,
                background:active ? f.color : "white",
                color:active ? "white" : f.color,
                fontWeight:active ? 700 : 500, fontSize:13, cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s",
              }}>
                {f.label}
                <span style={{ marginLeft:6, padding:"1px 7px", borderRadius:100, background:active ? "rgba(255,255,255,0.25)" : `${f.color}18`, fontSize:10, fontWeight:700, color:active ? "white" : f.color }}>{cnt}</span>
              </button>
            );
          })}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(320px, 1fr))", gap:22 }}>
          {filtered.map(item => (
            <article key={item.id} style={{ background:"white", borderRadius:12, padding:26, cursor:"pointer", border:"1px solid rgba(10,22,40,0.07)", boxShadow:"0 2px 10px rgba(10,22,40,0.05)", transition:"all 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(10,22,40,0.11)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 10px rgba(10,22,40,0.05)"; }}
              onClick={() => { if (setContentDetail) setContentDetail(item.id, slugify(item.title)); }}
            >
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                {(() => {
                  const meta = getContentTypeMeta(item);
                  return (
                    <span style={{ padding:"3px 10px", borderRadius:4, background:meta.color+"18", color:meta.color, fontSize:11, fontWeight:700 }}>
                      {meta.icon} {meta.label}
                    </span>
                  );
                })()}
                <span style={{ fontSize:11, color:C.gray }}>{item.date}</span>
              </div>
              <h3 style={{ fontSize:14, fontWeight:700, color:C.navy, lineHeight:1.55, marginBottom:10 }}>{item.title}</h3>
              <p style={{ fontSize:13, color:C.gray, lineHeight:1.65, marginBottom:14 }}>{item.summary}</p>
              <div style={{ display:"flex", justifyContent:"space-between", paddingTop:12, borderTop:"1px solid rgba(10,22,40,0.07)" }}>
                <span style={{ fontSize:12, color:C.gray }}>👁 {item.views.toLocaleString()}</span>
                <button onClick={(e) => { e.stopPropagation(); if (setContentDetail) setContentDetail(item.id, slugify(item.title)); }} style={{ fontSize:12, color:C.teal, fontWeight:700, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>자세히 보기 →</button>
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
