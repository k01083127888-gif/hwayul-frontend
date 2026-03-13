import { useState } from "react";
import C from "../tokens/colors.js";
import { AIChatBot } from "./AIChatBot.jsx";
import { EvidenceHelper } from "./EvidenceHelper.jsx";
import { WorkersCompCalculator } from "./WorkersCompCalculator.jsx";
import { TimelineRecorder } from "./TimelineRecorder.jsx";
import { ComplianceChecker } from "./ComplianceChecker.jsx";

export function NewFeaturesHub({ isAdmin }) {
  const [open, setOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [showChat, setShowChat] = useState(false);

  // 일반 사용자: AI 상담, 산재 계산기, 컴플라이언스
  // 관리자 전용: 증거 수집, 타임라인 추가 표시
  const publicFeatures = [
    { id:"chat",       icon:"🤖", label:"AI 상담",      color:C.teal,     onClick:()=>{ setShowChat(true);           setOpen(false); } },
    { id:"comp",       icon:"⚖️", label:"산재 계산기",   color:"#8E44AD",  onClick:()=>{ setActiveModal("comp");       setOpen(false); } },
    { id:"compliance", icon:"🏢", label:"컴플라이언스",  color:C.navy,     onClick:()=>{ setActiveModal("compliance"); setOpen(false); } },
  ];
  const adminOnlyFeatures = [
    { id:"evidence",   icon:"📋", label:"증거 수집",     color:"#2980B9",  onClick:()=>{ setActiveModal("evidence");   setOpen(false); } },
    { id:"timeline",   icon:"📅", label:"타임라인",      color:C.orange,   onClick:()=>{ setActiveModal("timeline");   setOpen(false); } },
  ];

  const visibleFeatures = isAdmin ? [...publicFeatures, ...adminOnlyFeatures] : publicFeatures;

  // 관리자 전용 기능을 클릭하려 할 때 잠금 안내
  const [lockNotice, setLockNotice] = useState(false);

  return (
    <>
      {/* 관리자 전용 잠금 안내 (혹시 모를 경우 대비, 현재는 미표시) */}
      {lockNotice && (
        <div style={{ position:"fixed", bottom:100, right:28, zIndex:9995, background:C.navy, border:`1px solid rgba(201,168,76,0.3)`, borderRadius:12, padding:"12px 18px", fontSize:12, color:C.cream, boxShadow:"0 8px 32px rgba(10,22,40,0.4)", maxWidth:220 }}>
          🔒 관리자 로그인 후 이용 가능합니다.
          <button onClick={()=>setLockNotice(false)} style={{ display:"block", marginTop:8, fontSize:11, color:C.tealLight, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", padding:0 }}>닫기</button>
        </div>
      )}

      {/* 플로팅 메뉴 */}
      <div style={{ position:"fixed", bottom:28, right:28, zIndex:9990, display:"flex", flexDirection:"column", alignItems:"flex-end", gap:10 }}>
        {open && (
          <>
            {visibleFeatures.map((f, i) => (
              <div key={f.id} onClick={f.onClick} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", animation:`slideUp 0.2s ease ${i*0.05}s both` }}>
                <div style={{ padding:"6px 12px", borderRadius:100, background:"white", boxShadow:"0 4px 16px rgba(10,22,40,0.18)", fontSize:12, fontWeight:700, color:C.navy, whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:6 }}>
                  {f.label}
                  {/* 관리자 전용 배지 */}
                  {adminOnlyFeatures.find(a=>a.id===f.id) && (
                    <span style={{ fontSize:9, padding:"1px 5px", borderRadius:100, background:`${C.gold}20`, color:C.gold, fontWeight:800, border:`1px solid ${C.gold}40` }}>관리자</span>
                  )}
                </div>
                <div style={{ width:44, height:44, borderRadius:"50%", background:f.color, boxShadow:"0 4px 16px rgba(10,22,40,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{f.icon}</div>
              </div>
            ))}
            {/* 관리자 미로그인 시 잠긴 기능 안내 */}
            {!isAdmin && (
              <div style={{ padding:"8px 14px", borderRadius:100, background:"rgba(10,22,40,0.75)", border:"1px solid rgba(201,168,76,0.2)", fontSize:11, color:"rgba(244,241,235,0.45)", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:6, animation:`slideUp 0.2s ease ${publicFeatures.length*0.05}s both` }}>
                🔒 <span>증거 수집·타임라인은 관리자 전용</span>
              </div>
            )}
            <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
          </>
        )}
        {/* 메인 버튼 */}
        <div onClick={()=>setOpen(o=>!o)} style={{ width:56, height:56, borderRadius:"50%", background:open?`rgba(10,22,40,0.85)`:`linear-gradient(135deg,${C.teal},${C.tealLight})`, boxShadow:"0 6px 24px rgba(13,115,119,0.45)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.25s", border:"2px solid rgba(255,255,255,0.2)", position:"relative" }}>
          <span style={{ fontSize:24, transition:"transform 0.25s", transform:open?"rotate(45deg)":"rotate(0)" }}>{open?"✕":"✨"}</span>
          {/* 관리자 로그인 시 골드 점 표시 */}
          {isAdmin && !open && (
            <div style={{ position:"absolute", top:2, right:2, width:12, height:12, borderRadius:"50%", background:C.gold, border:"2px solid white", boxShadow:"0 0 6px rgba(201,168,76,0.6)" }} />
          )}
        </div>
      </div>

      {/* 모달 렌더링 */}
      {showChat && <AIChatBot onClose={()=>setShowChat(false)} isAdmin={isAdmin} />}
      {activeModal==="comp"       && <WorkersCompCalculator onClose={()=>setActiveModal(null)} />}
      {activeModal==="compliance" && <ComplianceChecker     onClose={()=>setActiveModal(null)} />}
      {/* 관리자 전용 모달 — isAdmin일 때만 렌더링 */}
      {isAdmin && activeModal==="evidence" && <EvidenceHelper    onClose={()=>setActiveModal(null)} />}
      {isAdmin && activeModal==="timeline" && <TimelineRecorder  onClose={()=>setActiveModal(null)} />}
    </>
  );
}

// ── 앱 진입점 ─────────────────────────────────────────────────────────────────
