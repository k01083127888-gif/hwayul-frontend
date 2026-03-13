import { useState } from "react";
import C from "../tokens/colors.js";

// ── 관리자 비밀번호 ──────────────────────────────────────────────────────────
const ADMIN_SALT = "hwayul_salt_2025";

export function hashPw(pw) {
  const str = ADMIN_SALT + ":" + pw;
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const result = (h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0");
  return result;
}

const ADMIN_HASH_VALUE = "ce5d997bbbd54ae6";

export function checkAdminPw(pw) {
  const hash = hashPw(pw);
  if (hash.length !== ADMIN_HASH_VALUE.length) return false;
  let result = 0;
  for (let i = 0; i < hash.length; i++) {
    result |= hash.charCodeAt(i) ^ ADMIN_HASH_VALUE.charCodeAt(i);
  }
  return result === 0;
}
export const ADMIN_MAX_ATTEMPTS = 5;
export const LOCKOUT_KEY = "hwayul_admin_lockout";

// ── 통계 UI 컴포넌트 ─────────────────────────────────────────────────────────
export function StatCard({ icon, label, value, sub, color, onClick }) {
  return (
    <div onClick={onClick} style={{ padding:"14px 16px", background:"white", borderRadius:12, border:"1px solid rgba(10,22,40,0.08)", cursor:onClick?"pointer":"default", transition:"all 0.15s" }}
      onMouseEnter={e=>{ if(onClick) e.currentTarget.style.boxShadow="0 4px 16px rgba(10,22,40,0.1)"; }}
      onMouseLeave={e=>{ e.currentTarget.style.boxShadow=""; }}
    >
      <div style={{ fontSize:10, color:"#8B8680", marginBottom:5 }}>{icon} {label}</div>
      <div style={{ fontSize:24, fontWeight:900, color: color||C.navy, lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:10, color:"#8B8680", marginTop:4, lineHeight:1.5 }}>{sub}</div>}
    </div>
  );
}

export function BarChart({ items, total, color }) {
  if (!total) return <div style={{ fontSize:12, color:"#8B8680", padding:"8px 0" }}>데이터 없음</div>;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
      {items.map(it => {
        const pct = total ? Math.round((it.count/total)*100) : 0;
        return (
          <div key={it.label}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#5A4A30", marginBottom:3 }}>
              <span>{it.label}</span>
              <span style={{ fontWeight:700 }}>{it.count}건 ({pct}%)</span>
            </div>
            <div style={{ height:7, background:"rgba(10,22,40,0.06)", borderRadius:4, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${pct}%`, background: it.color||color||C.teal, borderRadius:4, transition:"width 0.6s ease" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function MiniTrend({ data, color }) {
  if (!data?.length) return <div style={{ fontSize:11, color:"#8B8680" }}>데이터 없음</div>;
  const max = Math.max(...data.map(d=>d.count), 1);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:48 }}>
      {data.map(d => (
        <div key={d.month} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
          <div style={{ fontSize:8, color:"#8B8680", fontWeight:700 }}>{d.count||""}</div>
          <div style={{ width:"100%", background: d.count ? (color||C.teal) : "rgba(10,22,40,0.06)", borderRadius:"3px 3px 0 0", height:`${Math.max((d.count/max)*40,2)}px`, transition:"height 0.4s" }} />
          <div style={{ fontSize:8, color:"#8B8680" }}>{d.month}</div>
        </div>
      ))}
    </div>
  );
}

export function StatusPie({ items, total }) {
  if (!total) return <div style={{ fontSize:11, color:"#8B8680" }}>데이터 없음</div>;
  return (
    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
      {items.map(it => (
        <div key={it.label} style={{ padding:"5px 11px", borderRadius:100, background:`${it.color}15`, border:`1px solid ${it.color}30`, fontSize:11, fontWeight:700, color:it.color }}>
          {it.label} {it.count}건 ({total?Math.round(it.count/total*100):0}%)
        </div>
      ))}
    </div>
  );
}

export function getMonthly(arr, n=6) {
  const now = new Date();
  return Array.from({length:n}, (_,i) => {
    const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    return { month:`${d.getMonth()+1}월`, count: arr.filter(r=>r.submittedAt?.startsWith(ym)).length };
  }).reverse();
}

export function StatSection({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom:16, border:"1px solid rgba(10,22,40,0.08)", borderRadius:14, overflow:"hidden" }}>
      <div onClick={()=>setOpen(o=>!o)} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"13px 18px", background:"rgba(10,22,40,0.02)", cursor:"pointer", userSelect:"none" }}>
        <div style={{ fontSize:13, fontWeight:800, color:C.navy }}>{title}</div>
        <span style={{ fontSize:13, color:"#8B8680", transform:open?"rotate(180deg)":"none", transition:"transform 0.2s" }}>▾</span>
      </div>
      {open && <div style={{ padding:"16px 18px", background:"white" }}>{children}</div>}
    </div>
  );
}

export function NlHistoryCard({ record: r }) {
  const [open, setOpen] = useState(false);
  const topicBadge = { "판례":"⚖️ 판례", "노동부뉴스":"📢 노동부", "지침변경":"📋 지침", "종합":"📰 종합" }[r.topic] || r.topic || "뉴스레터";
  return (
    <div style={{ border:"1px solid rgba(10,22,40,0.1)", borderRadius:12, overflow:"hidden" }}>
      <div
        onClick={()=>setOpen(o=>!o)}
        style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 18px", background:open?"rgba(13,115,119,0.04)":"white", cursor:"pointer", userSelect:"none" }}
      >
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:9, background:"rgba(13,115,119,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>📧</div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:"#0A1628", marginBottom:3 }}>{r.title||"(제목 없음)"}</div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <span style={{ fontSize:10, padding:"1px 7px", borderRadius:100, background:"rgba(13,115,119,0.1)", color:"#0D7377", fontWeight:700 }}>{topicBadge}</span>
              <span style={{ fontSize:11, color:"#8B8680" }}>{new Date(r.sentAt).toLocaleString("ko-KR")}</span>
              <span style={{ fontSize:11, color:"#8B8680" }}>· 발송 {r.recipientCount||0}명</span>
            </div>
          </div>
        </div>
        <span style={{ fontSize:14, color:"#8B8680", transition:"transform 0.2s", transform:open?"rotate(180deg)":"none" }}>▾</span>
      </div>

      {open && (
        <div style={{ padding:"16px 18px", borderTop:"1px solid rgba(10,22,40,0.07)", background:"#FAFAFA" }}>
          {r.greeting && <div style={{ fontSize:12, color:"#5A4A30", lineHeight:1.75, marginBottom:12, paddingBottom:12, borderBottom:"1px solid rgba(10,22,40,0.06)" }}>{r.greeting}</div>}
          <div style={{ fontSize:12.5, color:"#3A3530", lineHeight:1.9, whiteSpace:"pre-wrap", marginBottom:12 }}>{r.body}</div>
          {r.closing && <div style={{ fontSize:11, color:"#8B8680", lineHeight:1.75, paddingTop:10, borderTop:"1px solid rgba(10,22,40,0.06)" }}>{r.closing}</div>}
        </div>
      )}
    </div>
  );
}
