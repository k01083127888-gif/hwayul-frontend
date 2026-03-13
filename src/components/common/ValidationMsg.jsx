import C from "../../tokens/colors.js";

export function ValidationMsg({ show, msg }) {
  if (!show) return null;
  return <div style={{ fontSize:11, color:C.red, marginTop:3, display:"flex", alignItems:"center", gap:4 }}>⚠️ {msg}</div>;
}
