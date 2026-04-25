import { useState } from "react";
import C from "../tokens/colors.js";
import { addSubmission } from "../utils/store.js";
import { isValidEmail } from "../utils/validators.js";
import { Input, SectionTag, DarkSectionTag } from "../components/common/FormElements.jsx";
import { ValidationMsg } from "../components/common/ValidationMsg.jsx";
import { PrivacyConsent } from "../components/common/PrivacyConsent.jsx";
import { PrivacyPolicyModal } from "../components/common/PrivacyPolicyModal.jsx";
import { usePageMeta } from "../utils/usePageMeta.js";

// ── ReportSection ─────────────────────────────────────────────────────────────────
export function ReportSection() {
  usePageMeta({
    title: "익명 제보 | WIHAM 인사이드",
    description: "직장내 괴롭힘·부당대우를 익명으로 제보하세요. 접수된 제보는 전문 노무사가 비밀리에 검토합니다.",
    url: "https://hwayul.kr/report",
  });
  const [form, setForm] = useState({ type:"", content:"", org:"", date:"", email:"" });
  const [done, setDone] = useState(false);
  const F = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const emailInvalid = form.email && !isValidEmail(form.email);

  return (
    <section style={{ padding:"80px 32px", background:"#F0EDE6", minHeight:"100vh" }}>
      <div style={{ maxWidth:700, margin:"0 auto" }}>
        <SectionTag>ANONYMOUS REPORT</SectionTag>
        <h2 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:"2rem", fontWeight:800, color:C.navy, marginTop:8, marginBottom:10 }}>익명 제보 · 상담 신청</h2>
        <div style={{ padding:"14px 18px", background:"rgba(13,115,119,0.08)", borderLeft:`4px solid ${C.teal}`, borderRadius:"0 8px 8px 0", marginBottom:18 }}>
          <p style={{ fontSize:13, color:C.navy, lineHeight:1.7, margin:0 }}>🔒 <strong>완전 익명 보장</strong>: 제보자 신원은 일체 수집되지 않으며, 법적으로 보호됩니다. 제출된 내용은 담당 노무사에게만 전달됩니다.<br/>
          <span style={{ color:C.gray, fontSize:12 }}>※ 실명 상담을 원하시면 '심층상담' 메뉴를 이용해 주세요.</span>
          </p>
        </div>

        {/* ── 공익 제보 안내 ─────────────────────────────────────────── */}
        <div style={{
          padding:"18px 22px",
          background:"rgba(201,168,76,0.06)",
          border:`1.5px solid rgba(201,168,76,0.3)`,
          borderRadius:10,
          marginBottom:36,
        }}>
          <div style={{ fontSize:13, fontWeight:800, color:"#A0720A", marginBottom:10, letterSpacing:"0.3px" }}>
            📢 공익 제보 안내
          </div>
          <p style={{ fontSize:13, color:C.navy, lineHeight:1.85, margin:"0 0 12px 0" }}>
            본 채널은 본인의 사안만을 위한 곳이 아닙니다.<br/>
            다양한 사정으로 권리 구제를 제대로 받지 못하는 분이 주변에 있거나,
            사안의 심각성이 깊이 느껴지는 경우 누구든 제보해 주실 수 있습니다.
          </p>
          <p style={{ fontSize:13, color:C.navy, lineHeight:1.85, margin:"0 0 14px 0" }}>
            권리 구제의 시급성과 공익적 가치가 인정되는 사안에 대해서는
            <strong> WIHAM랩스의 전문 노무사가 직접 검토하여 응답하고, 필요한 조치까지 함께합니다.</strong>
          </p>
          <ul style={{ margin:0, paddingLeft:18, fontSize:12, color:C.gray, lineHeight:1.85 }}>
            <li>본 채널에는 어떤 형태의 게시판도 존재하지 않습니다</li>
            <li>제보 내용은 외부에 노출되지 않으며, 철저한 익명이 보장됩니다</li>
            <li>WIHAM랩스의 수임료(사익) 추구와는 무관하게 운영되는 공익 채널입니다</li>
          </ul>
        </div>

        {!done ? (
          <div style={{ background:"white", borderRadius:16, padding:38, boxShadow:"0 6px 32px rgba(10,22,40,0.08)" }}>
            <div style={{ marginBottom:22 }}>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:C.gray, marginBottom:10, letterSpacing:"0.5px", textTransform:"uppercase" }}>제보·상담 유형</label>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                {["직장내 괴롭힘 피해", "성희롱", "부당 인사조치", "기타 노동권 침해"].map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, type:t }))} style={{ padding:"11px 14px", borderRadius:8, border:`2px solid ${form.type === t ? C.teal : "rgba(10,22,40,0.14)"}`, background:form.type === t ? C.teal+"10" : "white", color:form.type === t ? C.teal : C.navy, fontWeight:form.type === t ? 700 : 400, fontSize:13, cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s" }}>{t}</button>
                ))}
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:22 }}>
              <div>
                <label style={{ display:"block", fontSize:12, fontWeight:700, color:C.gray, marginBottom:6, letterSpacing:"0.5px", textTransform:"uppercase" }}>소속 (선택)</label>
                <input value={form.org} onChange={F("org")} placeholder="IT팀, 3층 영업부 (구체적 기재 불요)" style={{ width:"100%", padding:"11px 14px", borderRadius:8, border:`2px solid ${C.grayLight}`, fontSize:14, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
              </div>
              <div>
                <label style={{ display:"block", fontSize:12, fontWeight:700, color:C.gray, marginBottom:6, letterSpacing:"0.5px", textTransform:"uppercase" }}>최초 발생 시기 (선택)</label>
                <input type="month" value={form.date} onChange={F("date")} style={{ width:"100%", padding:"11px 14px", borderRadius:8, border:`2px solid ${C.grayLight}`, fontSize:14, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
              </div>
            </div>
            <div style={{ marginBottom:22 }}>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:C.gray, marginBottom:6, letterSpacing:"0.5px", textTransform:"uppercase" }}>상황 내용 <span style={{ color:C.red }}>*</span></label>
              <textarea value={form.content} onChange={F("content")} placeholder="언제, 어디서, 어떤 행위가 있었는지, 얼마나 반복됐는지 최대한 구체적으로 작성해 주세요." rows={6} style={{ width:"100%", padding:"13px 14px", borderRadius:8, border:`2px solid ${C.grayLight}`, fontSize:14, fontFamily:"inherit", outline:"none", resize:"vertical", lineHeight:1.7, boxSizing:"border-box" }} />
              <div style={{ textAlign:"right", fontSize:12, color:C.gray, marginTop:4 }}>{form.content.length}자</div>
            </div>
            <div style={{ marginBottom:28, padding:"16px 18px", background:"rgba(13,115,119,0.05)", borderRadius:10, border:"1px dashed rgba(13,115,119,0.25)" }}>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:C.teal, marginBottom:6, letterSpacing:"0.3px" }}>📧 회신 받기 원하시면 이메일을 남겨주세요 (선택)</label>
              <input type="email" value={form.email} onChange={F("email")} placeholder="example@email.com" style={{ width:"100%", padding:"11px 14px", borderRadius:8, border:`2px solid ${emailInvalid ? C.red : C.grayLight}`, fontSize:14, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
              {emailInvalid && <div style={{ fontSize:11, color:C.red, marginTop:6 }}>올바른 이메일 형식이 아닙니다</div>}
              <div style={{ fontSize:11, color:C.gray, marginTop:6, lineHeight:1.6 }}>※ 이메일을 남기지 않으셔도 익명 제보는 정상 접수됩니다. 이메일은 회신 목적으로만 사용되며, 별도로 보관됩니다.</div>
            </div>
            <button onClick={() => { if(form.content && !emailInvalid) { addSubmission("reports", {...form}); setDone(true); } }} disabled={!form.content || emailInvalid} style={{ width:"100%", padding:"15px", background:(form.content && !emailInvalid) ? C.teal : "#ccc", border:"none", borderRadius:8, color:"white", fontWeight:800, fontSize:15, cursor:(form.content && !emailInvalid) ? "pointer" : "not-allowed", fontFamily:"inherit" }}>
              🔒 익명으로 제출하기 →
            </button>
          </div>
        ) : (
          <div style={{ textAlign:"center", background:"white", borderRadius:16, padding:56, boxShadow:"0 6px 32px rgba(10,22,40,0.08)" }}>
            <div style={{ fontSize:52, marginBottom:18 }}>✅</div>
            <h3 style={{ fontFamily:"'Noto Serif KR', serif", fontSize:"1.4rem", fontWeight:800, color:C.navy, marginBottom:10 }}>제보가 접수되었습니다</h3>
            <p style={{ color:C.gray, lineHeight:1.8, marginBottom:28 }}>담당 노무사가 영업일 기준 7일 이내 검토 후<br/>익명 채널로 안내드립니다.</p>
            <button onClick={() => { setForm({ type:"", content:"", org:"", date:"", email:"" }); setDone(false); }} style={{ padding:"12px 30px", borderRadius:8, border:`2px solid ${C.navy}`, background:"transparent", color:C.navy, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>새 제보 작성</button>
          </div>
        )}
      </div>
    </section>
  );
}

// ── 기업 상담 ─────────────────────────────────────────────────────────────────
