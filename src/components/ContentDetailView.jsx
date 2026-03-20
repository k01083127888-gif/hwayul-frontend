import C from "../tokens/colors.js";
import { _contents } from "../utils/store.js";
import { contentDetails } from "../data/contentDetails.js";

export function ContentDetailView({ item, onBack }) {
  const typeIcon  = { news:"📰", video:"▶", resource:"📎" };
  const typeColor = { news:C.teal, video:C.red, resource:C.gold };
  const typeLabel = { news:"뉴스·판례", video:"교육영상", resource:"자료·서식" };
  const detail = contentDetails[item.id] || { content: item.body, attachments: item.attachments };
  const relatedItems = detail?.related?.map(rid => _contents.find(n => n.id === rid)).filter(Boolean) || [];

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
            <span style={{ padding:"5px 14px", borderRadius:6, background:typeColor[item.type]+"18", color:typeColor[item.type], fontSize:12, fontWeight:700 }}>
              {typeIcon[item.type]} {typeLabel[item.type]}
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

          <div style={{ marginTop:24, padding:"16px 20px", background:`${typeColor[item.type]}08`, borderLeft:`4px solid ${typeColor[item.type]}`, borderRadius:"0 10px 10px 0" }}>
            <p style={{ fontSize:14, color:C.navy, lineHeight:1.7, margin:0, fontWeight:600 }}>{item.summary}</p>
          </div>
        </div>

        {/* 본문 */}
        <div style={{ background:"white", borderRadius:16, padding:36, boxShadow:"0 4px 24px rgba(10,22,40,0.08)", border:"1px solid rgba(10,22,40,0.06)", marginBottom:28 }}>
          <div style={{ fontSize:10, letterSpacing:"2px", color:C.teal, fontWeight:700, textTransform:"uppercase", marginBottom:16 }}>CONTENT DETAIL</div>
          {(detail?.content || detail?.body)?.split("\n\n").map((para, i) => (
            <p key={i} style={{ fontSize:14, color:"#3A3530", lineHeight:1.9, marginBottom:16, whiteSpace:"pre-wrap" }}>{para}</p>
          ))}
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
                  <span style={{ fontSize:22, flexShrink:0 }}>{typeIcon[rel.type]}</span>
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
