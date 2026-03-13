import C from "../../tokens/colors.js";

export function PrivacyConsent({ checked, onChange, dark=false, onViewPolicy }) {
  const bg = checked ? C.teal : "transparent";
  const bdr = checked ? C.teal : (dark ? "rgba(255,255,255,0.2)" : "rgba(10,22,40,0.15)");
  return (
    <div style={{ marginBottom:16 }}>
      <label onClick={onChange} style={{ display:"flex", gap:10, alignItems:"flex-start", cursor:"pointer", padding:"12px 14px", borderRadius:8, background:dark ? "rgba(255,255,255,0.02)" : "rgba(10,22,40,0.02)", border:dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(10,22,40,0.06)" }}>
        <div style={{ width:18, height:18, borderRadius:4, border:`2px solid ${bdr}`, background:bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
          {checked && <span style={{ color:"white", fontSize:10, fontWeight:900 }}>✓</span>}
        </div>
        <div>
          <span style={{ fontSize:12, fontWeight:600, color:dark ? C.cream : C.navy }}>[필수] 개인정보 수집·이용 동의</span>
          <div style={{ fontSize:11, color:dark ? "rgba(244,241,235,0.4)" : C.gray, marginTop:3, lineHeight:1.6 }}>
            수집 항목: 성명, 이메일, 연락처 | 이용 목적: 상담·구제 연락 | 보유 기간: 목적 달성 후 1년
          </div>
        </div>
      </label>
      <button onClick={e => { e.preventDefault(); e.stopPropagation(); onViewPolicy(); }} style={{ fontSize:11, color:C.teal, fontWeight:600, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", padding:"4px 0", marginTop:4 }}>
        📋 개인정보 처리방침 전문 보기 →
      </button>
    </div>
  );
}
