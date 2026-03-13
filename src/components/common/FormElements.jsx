import C from "../../tokens/colors.js";

// ── 공통 UI 컴포넌트 ──────────────────────────────────────────────────────────
export function Input({ label, value, onChange, placeholder, type="text", required=false }) {
  return (
    <div>
      <label style={{ display:"block", fontSize:12, fontWeight:700, color:C.gray, marginBottom:6, letterSpacing:"0.5px", textTransform:"uppercase" }}>
        {label}{required && <span style={{ color:C.red, marginLeft:3 }}>*</span>}
      </label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} style={{
        width:"100%", padding:"11px 14px", borderRadius:8,
        border:`2px solid ${C.grayLight}`, fontSize:14, fontFamily:"inherit",
        outline:"none", boxSizing:"border-box", transition:"border 0.2s",
        background:"white", color:C.navy,
      }}
        onFocus={e => e.target.style.borderColor = C.teal}
        onBlur={e => e.target.style.borderColor = C.grayLight}
      />
    </div>
  );
}

export function DarkInput({ label, value, onChange, placeholder, type="text", required=false }) {
  return (
    <div>
      <label style={{ display:"block", fontSize:12, fontWeight:700, color:"rgba(244,241,235,0.55)", marginBottom:6, letterSpacing:"0.5px", textTransform:"uppercase" }}>
        {label}{required && <span style={{ color:"#FF8A80", marginLeft:3 }}>*</span>}
      </label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} style={{
        width:"100%", padding:"11px 14px", borderRadius:8,
        border:`2px solid rgba(255,255,255,0.12)`, fontSize:14, fontFamily:"inherit",
        outline:"none", boxSizing:"border-box", background:"rgba(255,255,255,0.05)", color:C.cream,
      }}
        onFocus={e => e.target.style.borderColor = C.tealLight}
        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
      />
    </div>
  );
}

export function SectionTag({ children }) {
  return <span style={{ fontSize:10, letterSpacing:"3px", textTransform:"uppercase", fontWeight:700, color:C.teal }}>{children}</span>;
}

export function DarkSectionTag({ children }) {
  return <span style={{ fontSize:10, letterSpacing:"3px", textTransform:"uppercase", fontWeight:700, color:C.gold }}>{children}</span>;
}
