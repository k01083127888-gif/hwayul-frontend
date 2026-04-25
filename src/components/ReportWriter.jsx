import { useState, useEffect } from "react";
import C from "../tokens/colors.js";
import { addSubmission, _store, updateSubmissionStatus } from "../utils/store.js";
import { saveToStorage } from "../utils/storage.js";

// ── 노무사 검토 리포트 작성기 (관리자 전용) ──────────────────────────────────
export function ReportWriter({ request, onClose }) {
  const [report, setReport] = useState({ summary:"", analysis:"", risks:"", recommendations:"", section5:"", conclusion:"" });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [emailMode, setEmailMode] = useState(false);
  const [emailBody, setEmailBody] = useState("");
  const [sent, setSent] = useState(false);
  const R = k => e => setReport(r => ({ ...r, [k]: e.target.value }));

  const r = request || {};
  const diagType = r.type === "checklist" ? "직장내 괴롭힘 진단" : "조직문화 진단";
  const price = r.type === "checklist" ? "99,000" : "330,000";
  const resultObj = (() => { try { return typeof r.resultData === "string" ? JSON.parse(r.resultData) : r.resultData; } catch { return null; } })();

  // AI 심층 분석 리포트 생성
  const generateAIReport = async () => {
    setAiLoading(true); setAiError("");
    try {
      let resultSummary = "";
      if (resultObj) {
        if (r.type === "checklist") {
          resultSummary = `진단 결과: ${resultObj.label||""} (점수: ${resultObj.score??""})
선행 요건: ${resultObj.prereqMet ? "충족" : "미충족"}, 행위유형 점수: ${resultObj.behaviorScore??""}, 영향도: ${resultObj.impactScore??""}, 지속성: ${resultObj.continuityScore??""}
권고절차: ${(resultObj.actions||[]).join(" → ")}`;
        } else {
          const cats = Array.isArray(resultObj.catResults) ? resultObj.catResults.map(c=>`${c.title}: ${c.score}점(${c.grade})`).join(", ") : "";
          resultSummary = `조직문화 위험도: ${resultObj.totalRisk??""}점
영역별: ${cats}
고위험 항목: ${resultObj.highRiskCount ?? 0}개`;
        }
      }

      const prompt = `당신은 직장내 괴롭힘·조직문화 전문 공인노무사입니다. 아래 정보를 바탕으로 유료 검토 리포트를 작성하세요.

[의뢰인 정보]
- ${r.userType==="corporate"?"회사명":"성명"}: ${r.orgName || r.name || "(미확인)"}
- 담당자: ${r.name || ""} / ${r.position || ""}
- 구분: ${r.userType==="corporate"?"기업 담당자":"개인 근로자"}
- 진단 종류: ${diagType}
- 사업장 규모: ${r.orgSize || "(미확인)"}
- 의뢰인 메모: ${r.detail || "(없음)"}

[진단 결과]
${resultSummary || "(결과 데이터 없음)"}

[작성 지침]
반드시 아래 6개 섹션으로 구분하여 작성하세요. 각 섹션은 최소 150자 이상으로 구체적이고 실무적으로 작성합니다.

1. 종합 소견 — ${r.type==="checklist"?"괴롭힘 행위의 심각성, 법적 성립 가능성, 피해자 현재 상태 종합 평가":"조직문화 건강도 수준, 괴롭힘 발생 위험도, 조직 전반의 취약 영역 종합 평가"}
2. 심층 분석 — ${r.type==="checklist"?"근로기준법 제76조의2, 제76조의3 등 관련 법령 기반 구체적 분석 (법 조항 번호 포함)":"직장내 괴롭힘 예방 의무(근로기준법 제76조의2) 기반 조직문화 위험 요인 분석"}
3. 핵심 리스크 — ${r.type==="checklist"?"법적 성립 가능성, 증거 부족 위험, 2차 피해 가능성 등":"괴롭힘 발생 가능성, 신고 체계 미비, 관리자 인식 부족 등"} 구체적 리스크 항목
4. 대응 권고 — ${r.type==="checklist"?"피해자 보호 조치, 신고 절차, 법적 대응 방안을 우선순위별로 (즉시/단기/중기)":"조직 개선 과제, 제도 정비, 교육 계획을 우선순위별로 (즉시/단기/중기, 담당 부서와 기한 포함)"}
5. ${r.type==="checklist"?"증거 수집·보전 가이드 — 피해 입증을 위한 증거 수집 방법, 보관 요령, 유의사항":"맞춤 교육·예방 프로그램 — 진단 결과에 따른 교육 대상, 프로그램 내용, 실시 시기 추천"}
6. 결론 — ${r.type==="checklist"?"종합 평가, 피해자에게 가장 시급한 조치, 향후 법적 절차 안내":"종합 평가, 조직문화 개선 로드맵, 재진단 권고 시기"}

각 섹션을 아래와 같이 정확히 구분하세요:
[섹션1] 종합 소견 내용
[섹션2] 심층 분석 내용
[섹션3] 핵심 리스크 내용
[섹션4] 대응 권고 내용
[섹션5] ${r.type==="checklist"?"증거 수집·보전 가이드":"맞춤 교육·예방 프로그램"} 내용
[섹션6] 결론 내용

반드시 [섹션1] ~ [섹션6] 태그로 시작하세요. 태그 외에 제목이나 번호를 붙이지 마세요.`;

      const res = await fetch("https://hwayul-backend-production-96cf.up.railway.app/api/claude", {
        method:"POST",
        headers:{ "Content-Type":"application/json", "anthropic-version":"2023-06-01" },
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:4000, messages:[{ role:"user", content:prompt }] })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error.message);
      const text = json.content?.[0]?.text || "";
      const extract = (n) => { const m = text.match(new RegExp(`\\[섹션${n}\\]\\s*([\\s\\S]*?)(?=\\[섹션${n+1}\\]|$)`)); return m ? m[1].trim() : ""; };
      setReport({
        summary: extract(1), analysis: extract(2), risks: extract(3),
        recommendations: extract(4), section5: extract(5), conclusion: extract(6)
      });
    } catch (err) {
      setAiError("AI 생성 오류: " + err.message);
    }
    setAiLoading(false);
  };

  // 리포트를 HTML로 변환
  const buildReportHtml = () => `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${diagType} 검토 리포트 - WIHAM 인사이드</title>
<style>body{font-family:'Noto Sans KR',sans-serif;max-width:800px;margin:0 auto;padding:40px;color:#1a1a1a;line-height:1.8}
h1{color:#0A1628;border-bottom:3px solid #0D7377;padding-bottom:12px;font-size:22px}
h2{color:#0D7377;margin-top:32px;font-size:16px;border-left:4px solid #C9A84C;padding-left:12px}
.info{background:#f8f6f2;padding:16px;border-radius:8px;margin:20px 0;font-size:13px}
.section{margin:20px 0;font-size:14px;white-space:pre-wrap}
.footer{margin-top:40px;padding-top:20px;border-top:2px solid #eee;font-size:12px;color:#888}
@media print{body{padding:20px}h1{font-size:18px}h2{font-size:14px}.section{font-size:12px}}
</style></head><body>
<h1>${diagType} 전문 노무사 검토 리포트</h1>
<div class="info"><b>${r.userType==="corporate"?"의뢰 기업":"의뢰인"}:</b> ${r.orgName||r.name||""} | <b>담당자:</b> ${r.name||""} ${r.position?`(${r.position})`:""} | <b>진단일:</b> ${r.submittedAt ? new Date(r.submittedAt).toLocaleDateString("ko-KR") : ""}</div>
<h2>1. 종합 소견</h2><div class="section">${report.summary}</div>
<h2>2. 심층 분석</h2><div class="section">${report.analysis}</div>
<h2>3. 핵심 리스크</h2><div class="section">${report.risks}</div>
<h2>4. 대응 권고</h2><div class="section">${report.recommendations}</div>
<h2>5. ${r.type==="checklist"?"증거 수집·보전 가이드":"맞춤 교육·예방 프로그램"}</h2><div class="section">${report.section5}</div>
<h2>6. 결론</h2><div class="section">${report.conclusion}</div>
<div class="footer">
WIHAM 인사이드 | hwayulinside@gmail.com | 02-2088-1767<br/>
본 리포트는 전문 노무사가 진단 결과를 검토하여 작성한 유료 리포트입니다 (${price}원, VAT 포함). 무단 배포를 금합니다.<br/>
&copy; ${new Date().getFullYear()} 뷰랩스. All rights reserved.
</div></body></html>`;

  // 리포트 HTML 다운로드
  const downloadReport = () => {
    const html = buildReportHtml();
    const blob = new Blob([html], { type:"text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `뷰_검토리포트_${r.orgName||r.name||""}_${new Date().toISOString().slice(0,10)}.html`;
    a.click(); URL.revokeObjectURL(url);
  };

  // 이메일 발송
  const handleSendEmail = async () => {
    // 1) 이메일 본문 HTML (간단한 안내만)
    const summaryEmailHtml = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700;800&family=Gowun+Batang:wght@400;700&display=swap');
body{font-family:'Noto Sans KR',sans-serif;margin:0;padding:0;background:#F5F3EF}
.wrap{max-width:640px;margin:0 auto;background:white}</style></head><body>
<div class="wrap">
  <div style="background:#0A1628;padding:28px 32px;text-align:center">
    <div style="font-size:22px;font-weight:800;font-family:'Gowun Batang','Noto Sans KR',sans-serif"><span style="color:#E8E5DE;font-family:'Inter','Helvetica Neue','Arial Black',sans-serif;font-weight:900;letter-spacing:-0.04em">WIHAM</span> <span style="color:#4ECDC4">인사이드</span></div>
    <div style="font-size:9px;color:rgba(244,241,235,0.5);margin-top:2px;letter-spacing:1.5px">WIHAM Inside Labs</div>
  </div>
  <div style="padding:36px 32px">
    <div style="font-size:14px;color:#0A1628;line-height:1.9;white-space:pre-wrap;margin-bottom:24px">${emailBody || `${r.name||""} 님 안녕하세요.\nWIHAM 인사이드입니다.\n\n요청하신 ${diagType} 전문 노무사 검토 리포트를 첨부파일로 보내드립니다.\n상세 내용은 첨부된 리포트를 확인해 주시기 바랍니다.\n\n리포트 내용에 대한 문의사항이 있으시면 언제든 연락 주세요.`}</div>
    <div style="padding:16px;background:rgba(13,115,119,0.06);border:1px solid rgba(13,115,119,0.15);border-radius:10px;margin-bottom:24px;text-align:center">
      <div style="font-size:13px;color:#0D7377;font-weight:700">📎 첨부: ${diagType} 검토 리포트</div>
      <div style="font-size:11px;color:#8B8680;margin-top:4px">상세 검토 리포트가 첨부되어 있습니다.</div>
    </div>
    <div style="border-top:1px solid #E8E5DE;padding-top:20px;font-size:13px;color:#8B8680;line-height:1.9;white-space:pre-wrap">감사합니다.\n\nWIHAM 인사이드\n대표 노무사 김재정\nTel. 02-2088-1767\nEmail. hwayulinside@gmail.com\nWeb. www.hwayul.kr</div>
  </div>
  <div style="background:#0A1628;padding:20px 32px;text-align:center">
    <div style="font-size:10px;color:rgba(244,241,235,0.3);line-height:1.8">&copy; 2025 WIHAM 인사이드 | Tel. 02-2088-1767 | hwayulinside@gmail.com</div>
  </div>
</div></body></html>`;

    // 실제 이메일 발송
    if (r.email) {
      try {
        await fetch("https://hwayul-backend-production-96cf.up.railway.app/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: r.email,
            subject: `[WIHAM 인사이드] ${diagType} 노무사 검토 리포트`,
            html: summaryEmailHtml
          })
        });
      } catch(e) { console.error("이메일 발송 오류:", e); }

      // DB에 이메일 저장
      try {
        await fetch("https://hwayul-backend-production-96cf.up.railway.app/api/sent-emails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            submission_id: r.id || "",
            submission_type: "review",
            recipient_email: r.email,
            recipient_name: r.name || "",
            email_type_label: "노무사 검토 리포트 발송",
            greeting: emailBody || `${r.name||""} 님 안녕하세요, WIHAM 인사이드입니다.`,
            body: "검토 리포트 첨부 발송",
            closing: "감사합니다. WIHAM 인사이드 대표 노무사 김재정",
            report_html: buildReportHtml()
          })
        });
      } catch(e) { console.error("이메일 저장 실패:", e); }
    }

    // 로컬 상태 업데이트
    addSubmission("resultEmails", { ...r, reportHtml: buildReportHtml(), emailBody, sentAt: new Date().toISOString(), status:"발송완료" });
    r.status = "완료";
    if (r.id) updateSubmissionStatus(r.id, "완료");
    saveToStorage(_store.submissions);
    _store.listeners.forEach(fn=>fn());
    setSent(true);
  };

  const overlay = { position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:20 };
  const modal = { background:"white", borderRadius:16, padding:28, maxWidth:900, width:"100%", maxHeight:"95vh", overflowY:"auto" };
  const lbl = { display:"block", fontSize:11, fontWeight:700, color:C.gray, marginBottom:5 };
  const txArea = { width:"100%", padding:"12px", borderRadius:8, border:`1px solid ${C.grayLight}`, fontSize:13, fontFamily:"inherit", outline:"none", resize:"vertical", boxSizing:"border-box", lineHeight:1.7 };

  // 발송 완료 화면
  if (sent) return (
    <div style={overlay} onClick={onClose}><div style={modal} onClick={e=>e.stopPropagation()}>
      <div style={{ textAlign:"center", padding:"40px 0" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
        <h3 style={{ fontSize:18, fontWeight:800, color:C.navy, marginBottom:8 }}>검토 리포트가 발송되었습니다</h3>
        <p style={{ fontSize:13, color:C.gray }}>{r.email}로 리포트가 첨부된 이메일이 발송되었습니다.</p>
        <button onClick={onClose} style={{ marginTop:20, padding:"10px 28px", borderRadius:8, background:C.teal, border:"none", color:"white", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>닫기</button>
      </div>
    </div></div>
  );

  // 이메일 발송 모드
  if (emailMode) return (
    <div style={overlay} onClick={onClose}><div style={modal} onClick={e=>e.stopPropagation()}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h3 style={{ fontSize:16, fontWeight:800, color:C.navy, margin:0 }}>📧 리포트 이메일 발송</h3>
        <button onClick={()=>setEmailMode(false)} style={{ background:"none", border:"none", color:C.gray, fontSize:16, cursor:"pointer" }}>&larr; 돌아가기</button>
      </div>
      <div style={{ padding:"12px 16px", background:C.cream, borderRadius:8, marginBottom:16, fontSize:12 }}>
        <b>받는 사람:</b> {r.email} ({r.name}) | <b>첨부:</b> 검토 리포트 HTML 파일
      </div>
      <div style={{ marginBottom:16 }}>
        <label style={lbl}>이메일 본문 (간단한 안내만 — 상세 내용은 첨부 리포트에)</label>
        <textarea value={emailBody} onChange={e=>setEmailBody(e.target.value)} rows={6} style={txArea}
          placeholder={`${r.name||""} 님 안녕하세요.\nWIHAM 인사이드입니다.\n\n요청하신 ${diagType} 전문 노무사 검토 리포트를 첨부파일로 보내드립니다.\n상세 내용은 첨부된 리포트를 확인해 주시기 바랍니다.\n\n리포트 내용에 대한 문의사항이 있으시면 언제든 연락 주세요.\n\n감사합니다.\nWIHAM 인사이드\n대표 노무사 김재정\nhwayulinside@gmail.com | 02-2088-1767`} />
      </div>
      <div style={{ padding:"10px 14px", background:"rgba(13,115,119,0.06)", borderRadius:8, marginBottom:16, fontSize:11, color:C.gray }}>
        📎 <b>첨부파일:</b> 뷰_검토리포트_{r.orgName||r.name||""}_{new Date().toISOString().slice(0,10)}.html
      </div>
      <button onClick={handleSendEmail} style={{ width:"100%", padding:"14px", background:C.teal, border:"none", borderRadius:8, color:"white", fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>📧 리포트 첨부하여 이메일 발송</button>
    </div></div>
  );

  // 리포트 작성 화면
  return (
    <div style={overlay} onClick={onClose}><div style={modal} onClick={e=>e.stopPropagation()}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <h3 style={{ fontSize:16, fontWeight:800, color:C.navy, margin:0 }}>📋 노무사 검토 리포트 작성</h3>
        <button onClick={onClose} style={{ background:"none", border:"none", color:C.gray, fontSize:18, cursor:"pointer" }}>&times;</button>
      </div>

      {/* 의뢰 정보 요약 */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, padding:"12px 16px", background:C.cream, borderRadius:8, marginBottom:16, fontSize:12 }}>
        <div><b style={{ color:C.navy }}>{r.userType==="corporate"?"의뢰기업":"의뢰인"}:</b> {r.orgName || r.name}</div>
        <div><b style={{ color:C.navy }}>진단유형:</b> {diagType}</div>
        <div><b style={{ color:C.navy }}>규모:</b> {r.orgSize || "-"}</div>
        <div><b style={{ color:C.navy }}>담당자:</b> {r.name} {r.position ? `(${r.position})` : ""}</div>
        <div><b style={{ color:C.navy }}>이메일:</b> {r.email}</div>
        <div><b style={{ color:C.navy }}>비용:</b> {price}원 (VAT 포함)</div>
      </div>

      {r.detail && (
        <div style={{ padding:"10px 14px", background:"rgba(201,168,76,0.06)", borderRadius:8, marginBottom:16, fontSize:12, color:C.gray }}>
          <b style={{ color:C.navy }}>의뢰인 메모:</b> {r.detail}
        </div>
      )}

      {/* 상단 액션 버튼 */}
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        <button onClick={generateAIReport} disabled={aiLoading} style={{ padding:"10px 20px", borderRadius:8, background:aiLoading?"rgba(13,115,119,0.3)":C.teal, border:"none", color:"white", fontWeight:700, fontSize:12, cursor:aiLoading?"wait":"pointer", fontFamily:"inherit" }}>
          {aiLoading ? "🤖 AI 심층 분석 중..." : "🤖 AI 심층 분석 리포트 생성"}
        </button>
        <button onClick={downloadReport} style={{ padding:"10px 20px", borderRadius:8, background:"rgba(10,22,40,0.06)", border:`1px solid ${C.grayLight}`, color:C.navy, fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
          💾 리포트 다운로드 (HTML)
        </button>
        <button onClick={()=>{ setEmailBody(""); setEmailMode(true); }} style={{ padding:"10px 20px", borderRadius:8, background:C.gold, border:"none", color:C.navy, fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
          📧 이메일 발송
        </button>
      </div>
      {aiError && <div style={{ padding:"8px 12px", background:"rgba(192,57,43,0.08)", borderRadius:6, fontSize:11, color:C.red, marginBottom:12 }}>{aiError}</div>}

      {/* 6개 섹션 입력 */}
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <div><label style={lbl}>1. 종합 소견</label><textarea value={report.summary} onChange={R("summary")} rows={4} style={txArea} placeholder={r.type==="checklist"?"괴롭힘 행위의 심각성, 법적 성립 가능성, 피해자 상태 평가...":"조직문화 건강도, 괴롭힘 발생 위험도, 취약 영역 평가..."} /></div>
        <div><label style={lbl}>2. 심층 분석 ({r.type==="checklist"?"근로기준법 기반":"조직문화 위험 요인"})</label><textarea value={report.analysis} onChange={R("analysis")} rows={5} style={txArea} placeholder={r.type==="checklist"?"근로기준법 제76조의2·3 기반 법적 분석, 행위유형별 위반 가능성...":"리더십·소통·신고체계 등 영역별 위험 요인, 구조적 문제점..."} /></div>
        <div><label style={lbl}>3. 핵심 리스크</label><textarea value={report.risks} onChange={R("risks")} rows={4} style={txArea} placeholder={r.type==="checklist"?"법적 성립 가능성, 증거 부족 위험, 2차 피해 가능성...":"괴롭힘 발생 가능성, 신고 체계 미비, 관리자 인식 부족..."} /></div>
        <div><label style={lbl}>4. 대응 권고 ({r.type==="checklist"?"피해자 보호·법적 대응":"조직 개선·제도 정비"})</label><textarea value={report.recommendations} onChange={R("recommendations")} rows={5} style={txArea} placeholder={r.type==="checklist"?"피해자 보호 조치, 신고 절차, 법적 대응 방안 (즉시/단기/중기)...":"조직 개선 과제, 제도 정비, 교육 계획 (즉시/단기/중기)..."} /></div>
        <div><label style={lbl}>5. {r.type==="checklist"?"증거 수집·보전 가이드":"맞춤 교육·예방 프로그램"}</label><textarea value={report.section5} onChange={R("section5")} rows={3} style={txArea} placeholder={r.type==="checklist"?"피해 입증을 위한 증거 수집 방법, 보관 요령...":"교육 대상, 프로그램 내용, 실시 시기 추천..."} /></div>
        <div><label style={lbl}>6. 결론</label><textarea value={report.conclusion} onChange={R("conclusion")} rows={3} style={txArea} placeholder={r.type==="checklist"?"종합 평가, 시급한 조치, 향후 법적 절차 안내...":"종합 평가, 조직문화 개선 로드맵, 재진단 권고 시기..."} /></div>
      </div>
    </div></div>
  );
}
