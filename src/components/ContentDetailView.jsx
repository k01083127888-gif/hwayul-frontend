import C from "../tokens/colors.js";
import { _contents } from "../utils/store.js";
import { contentDetails } from "../data/contentDetails.js";
import { usePageMeta } from "../utils/usePageMeta.js";
import { ContentCTABox } from "./ContentCTABox.jsx";
import { getContentTypeMeta } from "../utils/contentType.js";

export function ContentDetailView({ item, onBack }) {
  const typeMeta = getContentTypeMeta(item);
  const detail = contentDetails[item.id] || { content: item.body, attachments: item.attachments };
  const relatedItems = detail?.related?.map(rid => _contents.find(n => n.id === rid)).filter(Boolean) || [];

  // ── 동적 SEO 메타태그 ──
  // description 우선순위: summary > body(HTML 태그 제거 후 첫 160자)
  const stripHtml = (html) => (html || "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  const bodyText = stripHtml(detail?.content || item.body || "");
  const description = (item.summary && item.summary.trim()) ? item.summary.trim() : bodyText;

  usePageMeta({
    title: `${item.title} | 화율인사이드`,
    description,
    url: `https://hwayul.kr/content/${item.id}`,
  });

  return (
    <section style={{ padding:"80px 32px", background:C.cream, minHeight:"100vh" }}>
      <div style={{ maxWidth:860, margin:"0 auto" }}>
        {/* 뒤로가기 */}
        <button onClick={onBack} style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"10px 20px", borderRadius:8, border:`2px solid rgba(10,22,40,0.12)`, background:"white", color:C.navy, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", marginBottom:32, transition:"all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = C.navy; e.currentTarget.style.color = "white"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = C.navy; }}
        >
          ← 콘텐츠 목록으로
        </button>

        {/* 헤더 */}
        <div style={{ background:"white", borderRadius:16, padding:36, boxShadow:"0 4px 24px rgba(10,22,40,0.08)", border:"1px solid rgba(10,22,40,0.06)", marginBottom:28 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
            <span style={{ padding:"5px 14px", borderRadius:6, background:typeMeta.color+"18", color:typeMeta.color, fontSize:12, fontWeight:700 }}>
              {typeMeta.icon} {typeMeta.label}
            </span>
            <span style={{ padding:"4px 12px", borderRadius:6, background:"rgba(10,22,40,0.06)", color:C.gray, fontSize:11, fontWeight:600 }}>
              {item.tag}
            </span>
          </div>

          <h1 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:"clamp(1.4rem, 2.5vw, 1.9rem)", fontWeight:900, color:C.navy, lineHeight:1.45, marginBottom:16, letterSpacing:"-0.3px" }}>
            {item.title}
          </h1>

          <div style={{ display:"flex", alignItems:"center", gap:20, paddingBottom:20, borderBottom:"1px solid rgba(10,22,40,0.08)" }}>
            <span style={{ fontSize:13, color:C.gray }}>📅 {item.date}</span>
            <span style={{ fontSize:13, color:C.gray }}>👁 조회 {item.views.toLocaleString()}</span>
          </div>

          <div style={{ marginTop:24, padding:"16px 20px", background:`${typeMeta.color}08`, borderLeft:`4px solid ${typeMeta.color}`, borderRadius:"0 10px 10px 0" }}>
            <p style={{ fontSize:14, color:C.navy, lineHeight:1.7, margin:0, fontWeight:600 }}>{item.summary}</p>
          </div>
        </div>

        {/* 본문 */}
        <div style={{ background:"white", borderRadius:16, padding:36, boxShadow:"0 4px 24px rgba(10,22,40,0.08)", border:"1px solid rgba(10,22,40,0.06)", marginBottom:28 }}>
          {(() => {
            const bodyText = detail?.content || detail?.body || "";
            // 마크다운 잔재 → HTML 변환 (# 헤딩, [ ]/[x] 체크박스)
            const H4 = (t) => `<h4 style="font-size:15px;font-weight:800;color:#0A1628;margin:18px 0 8px;">${t}</h4>`;
            const H3 = (t) => `<h3 style="font-size:17px;font-weight:800;color:#0A1628;margin:22px 0 10px;">${t}</h3>`;
            const H2 = (t) => `<h2 style="font-size:20px;font-weight:900;color:#0A1628;margin:26px 0 14px;line-height:1.4;">${t}</h2>`;
            const renderMarkdownSnippets = (html) => {
              return html
                // <p>### ...</p> 형태 (Quill이 감싼 케이스) — 먼저 처리
                .replace(/<p[^>]*>\s*###\s+([\s\S]*?)\s*<\/p>/gi, (_, t) => H4(t))
                .replace(/<p[^>]*>\s*##\s+([\s\S]*?)\s*<\/p>/gi, (_, t) => H3(t))
                .replace(/<p[^>]*>\s*#\s+([\s\S]*?)\s*<\/p>/gi, (_, t) => H2(t))
                // 줄머리 ### / ## / # (순수 텍스트 케이스)
                .replace(/^###\s+(.+)$/gm, (_, t) => H4(t))
                .replace(/^##\s+(.+)$/gm, (_, t) => H3(t))
                .replace(/^#\s+(.+)$/gm, (_, t) => H2(t))
                // [x] / [X] 체크된 체크박스 (클릭 가능)
                .replace(/\[\s*[xX]\s*\]/g, '<input type="checkbox" checked style="width:16px;height:16px;margin-right:8px;vertical-align:middle;accent-color:#0D7377;cursor:pointer;" />')
                // [ ] 빈 체크박스 (클릭 가능)
                .replace(/\[\s*\]/g, '<input type="checkbox" style="width:16px;height:16px;margin-right:8px;vertical-align:middle;accent-color:#0D7377;cursor:pointer;" />');
            };
            // HTML 태그가 하나라도 있으면 HTML + 마크다운 잔재 변환
            if (bodyText.includes("<") && bodyText.includes(">")) {
              return <div className="hwayul-content-body" style={{ fontSize:14, color:"#3A3530", lineHeight:1.9 }} dangerouslySetInnerHTML={{ __html: renderMarkdownSnippets(bodyText) }} />;
            }
            // 순수 텍스트인 경우 마크다운을 먼저 변환 후 줄바꿈을 <br>로
            const converted = renderMarkdownSnippets(bodyText)
              .split("\n\n")
              .map(p => `<p style="margin-bottom:16px;">${p.replace(/\n/g, "<br/>")}</p>`)
              .join("");
            return <div className="hwayul-content-body" style={{ fontSize:14, color:"#3A3530", lineHeight:1.9 }} dangerouslySetInnerHTML={{ __html: converted }} />;
          })()}
        </div>

        {/* 첨부파일 */}
        {detail?.attachments?.length > 0 && (
          <div style={{ background:"white", borderRadius:16, padding:36, boxShadow:"0 4px 24px rgba(10,22,40,0.08)", border:"1px solid rgba(10,22,40,0.06)", marginBottom:28 }}>
            <div style={{ fontSize:10, letterSpacing:"2px", color:C.gold, fontWeight:700, textTransform:"uppercase", marginBottom:16 }}>ATTACHMENTS</div>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {detail.attachments.map((att, idx) => {
                const ytId = att.url?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
                const isImg = /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(att.url);
                const isVid = /\.(mp4|webm|mov)(\?|$)/i.test(att.url);
                return (
                  <div key={idx}>
                    {ytId ? (
                      <div>
                        <div style={{ position:"relative", paddingBottom:"56.25%", height:0, borderRadius:12, overflow:"hidden", marginBottom:8 }}>
                          <iframe src={`https://www.youtube.com/embed/${ytId}`} title={att.label} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%", border:"none" }} />
                        </div>
                        <div style={{ fontSize:12, color:C.navy, fontWeight:600 }}>▶ {att.label}</div>
                      </div>
                    ) : isVid ? (
                      <div>
                        <video controls style={{ width:"100%", borderRadius:12, marginBottom:8 }} src={att.url} />
                        <div style={{ fontSize:12, color:C.navy, fontWeight:600 }}>🎬 {att.label}</div>
                      </div>
                    ) : isImg ? (
                      <div>
                        <img src={att.url} alt={att.label} style={{ width:"100%", maxHeight:400, objectFit:"contain", borderRadius:12, marginBottom:8 }} onError={e => { e.target.style.display = "none"; }} />
                        <div style={{ fontSize:12, color:C.navy, fontWeight:600 }}>🖼️ {att.label}</div>
                      </div>
                    ) : (
                      <a href={att.url} target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 18px", borderRadius:10, border:"1px solid rgba(10,22,40,0.1)", background:"rgba(10,22,40,0.02)", textDecoration:"none", transition:"all 0.2s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(13,115,119,0.06)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(10,22,40,0.02)"; }}
                      >
                        <span style={{ fontSize:22 }}>{/\.pdf/i.test(att.url)?"📎":/\.(doc|hwp|ppt|xls)/i.test(att.url)?"📄":"🔗"}</span>
                        <div>
                          <div style={{ fontSize:13, fontWeight:700, color:C.navy }}>{att.label}</div>
                          <div style={{ fontSize:11, color:C.teal }}>클릭하여 열기 →</div>
                        </div>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ★ 진단 유도 CTA 박스 (본문 + 첨부파일 다 본 후 노출) */}
        <ContentCTABox item={item} />

        {/* 관련 콘텐츠 */}
        {relatedItems.length > 0 && (
          <div style={{ background:"white", borderRadius:16, padding:36, boxShadow:"0 4px 24px rgba(10,22,40,0.08)", border:"1px solid rgba(10,22,40,0.06)" }}>
            <div style={{ fontSize:10, letterSpacing:"2px", color:C.gold, fontWeight:700, textTransform:"uppercase", marginBottom:6 }}>RELATED CONTENT</div>
            <h3 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:18, fontWeight:800, color:C.navy, marginBottom:20 }}>관련 콘텐츠</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {relatedItems.map(rel => (
                <div key={rel.id} onClick={() => { onBack(); setTimeout(() => { window.__safeworkOpenDetail?.(rel.id); }, 50); }} style={{ display:"flex", alignItems:"center", gap:16, padding:"14px 18px", borderRadius:10, border:"1px solid rgba(10,22,40,0.08)", cursor:"pointer", transition:"all 0.2s", background:"rgba(10,22,40,0.01)" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(13,115,119,0.06)"; e.currentTarget.style.borderColor = C.teal; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(10,22,40,0.01)"; e.currentTarget.style.borderColor = "rgba(10,22,40,0.08)"; }}
                >
                  <span style={{ fontSize:22, flexShrink:0 }}>{getContentTypeMeta(rel).icon}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:C.navy, lineHeight:1.4, marginBottom:3 }}>{rel.title}</div>
                    <div style={{ fontSize:11, color:C.gray }}>{rel.date} · 👁 {rel.views.toLocaleString()}</div>
                  </div>
                  <span style={{ fontSize:13, color:C.teal, fontWeight:700, flexShrink:0 }}>→</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ── 콘텐츠 아카이브 ──────────────────────────────────────────────────────────
