import { useState, useEffect, useRef } from "react";
import C from "../tokens/colors.js";
import { addSubmission, _store, updateSubmissionStatus } from "../utils/store.js";
import { saveToStorage } from "../utils/storage.js";

export function AdminEmailComposer({ data, onClose, onViewResult }) {
  const [greeting, setGreeting] = useState(data.greeting || "");
  const [body, setBody] = useState(data.body || "");
  const [closing, setClosing] = useState("감사합니다.\n\n화율인사이드\n대표 노무사 김재정\nTel. 02-2088-1767\nEmail. hwayulinside@gmail.com\nWeb. www.hwayul.kr");
  const [showPreview, setShowPreview] = useState(false);
  const [sent, setSent] = useState(false);
  // AI 자동 작성 관련 상태
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const previewRef = useRef(null);

  // 리포트 AI 자동 생성
  const generateReport = async () => {
    setAiLoading(true);
    setAiError("");
    try {
      // 신청자 데이터 정리
      const r = data.data || {};
      const diagType = r.type === "checklist" ? "직장내 괴롭힘 진단" : r.type === "culture" ? "조직문화 진단" : "진단";
      const userTypeLabel = r.userType === "corporate" ? "기업 담당자" : "개인 피해자";
      const resultObj = (() => {
        try { return typeof r.resultData === "string" ? JSON.parse(r.resultData) : r.resultData; }
        catch { return null; }
      })();

      // 진단 결과 요약 텍스트 생성
      let resultSummary = "";
      if (resultObj) {
        if (r.type === "checklist") {
          resultSummary = `진단 결과: ${resultObj.label || ""} (점수: ${resultObj.score ?? ""})
성립 요건: 사전요건 ${resultObj.prereqMet ? "충족" : "미충족"}, 행위유형 해당항목 다수
권고절차: ${(resultObj.actions||[]).join(" → ")}`;
        } else if (r.type === "culture") {
          const cats = Array.isArray(resultObj.catResults) ? resultObj.catResults.map(c=>`${c.title}(${c.grade})`).join(", ") : "";
          resultSummary = `전체 위험도: ${resultObj.totalRisk ?? ""}\n영역별: ${cats}\n고위험 항목: ${resultObj.highRiskCount ?? 0}개`;
        }
      }

      const prompt = `당신은 직장내 괴롭힘·조직문화 전문 노무사입니다. 아래 의뢰인 정보를 바탕으로 전문 검토 리포트 본문을 작성하세요.

[의뢰인 정보]
- 성명: ${r.name || "(미확인)"}
- 구분: ${userTypeLabel}
- 소속: ${r.orgName || "(없음)"} / ${r.position || ""}
- 진단 종류: ${diagType}
- 신청자 메모: ${r.detail || "(없음)"}

[진단 결과 요약]
${resultSummary || "(결과 데이터 없음)"}

작성 지침:
1. "검토 의견" 섹션: 진단 결과를 법적 관점에서 해석 (근로기준법 제76조의2 기준)
2. "주요 쟁점 분석" 섹션: 성립 가능성 및 취약 요소 2~3가지
3. "권고 조치사항" 섹션: 단계별 대응 방향 (즉시/단기/중기)
4. "유의사항" 섹션: 증거 보전, 신고 전 주의사항

형식: 각 섹션 제목은 【 】로 감싸고, 전문적이면서 의뢰인이 이해하기 쉬운 어조로 작성. 총 600~900자.
마지막에 "본 검토 리포트는 제한된 정보에 근거한 초기 검토 의견이며, 정식 자문 계약 체결 후 확정 의견이 제공됩니다."를 반드시 포함.`;

      const res = await fetch("https://hwayul-backend-production-96cf.up.railway.app/api/claude", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }]
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const apiData = await res.json();
      if (apiData.error) throw new Error(apiData.error.message);
      const text = apiData.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
      if (!text.trim()) throw new Error("응답이 비어 있습니다.");
      setBody(text.trim());
    } catch(err) {
      setAiError(err.message || "AI 생성 중 오류가 발생했습니다.");
    }
    setAiLoading(false);
  };

  const emailHtml = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700;800&display=swap');
  body { font-family:'Noto Sans KR',sans-serif; margin:0; padding:0; background:#F5F3EF; }
  .wrap { max-width:640px; margin:0 auto; background:white; }
</style></head><body>
<div class="wrap">
  <div style="background:#0A1628;padding:28px 32px;text-align:center">
    <svg width="48" height="48" viewBox="0 0 100 100" style="margin-bottom:8px"><defs><linearGradient id="eN" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#1E3A5F"/><stop offset="100%" stop-color="#2A4A70"/></linearGradient><linearGradient id="eM" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0D7377"/><stop offset="100%" stop-color="#4ECDC4"/></linearGradient></defs><line x1="18" y1="10" x2="18" y2="90" stroke="url(#eN)" stroke-width="10" stroke-linecap="round"/><line x1="50" y1="10" x2="50" y2="55" stroke="url(#eN)" stroke-width="10" stroke-linecap="round"/><line x1="78" y1="52" x2="78" y2="90" stroke="url(#eN)" stroke-width="10" stroke-linecap="round"/><path d="M18,46 C28,46 32,33 40,33 C48,33 44,46 50,46" stroke="url(#eM)" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M50,12 C52,30 60,42 70,48 C74,50 78,52 78,52" stroke="url(#eM)" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M96,12 C94,28 88,40 82,47 C80,50 78,52 78,52" stroke="url(#eM)" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M18,90 C34,82 62,82 78,90" stroke="url(#eM)" stroke-width="4.5" fill="none" stroke-linecap="round" opacity="0.45"/><circle cx="50" cy="46" r="3" fill="#4ECDC4" opacity="0.5"/><circle cx="78" cy="52" r="3" fill="#4ECDC4" opacity="0.5"/></svg>
    <div style="font-size:20px;font-weight:800;font-family:'Noto Sans KR',sans-serif"><span style="color:#E8E5DE">화율</span> <span style="color:#4ECDC4">인사이드</span></div>
    <div style="font-size:9px;color:rgba(244,241,235,0.5);margin-top:2px;letter-spacing:1.5px">Hwayul Inside</div>
    <div style="font-size:8px;color:rgba(244,241,235,0.3);letter-spacing:0.5px;margin-top:1px">직장내괴롭힘 & 조직문화 플랫폼</div>
  </div>
  <div style="padding:36px 32px">
    <div style="font-size:14px;color:#0A1628;line-height:1.9;white-space:pre-wrap;margin-bottom:24px">${greeting.replace(/\n/g,'\n')}</div>
    <div style="font-size:14px;color:#0A1628;line-height:1.9;white-space:pre-wrap;margin-bottom:24px">${body.replace(/\n/g,'\n')}</div>
    ${data.resultHtml ? '<div style="padding:16px;background:rgba(13,115,119,0.06);border:1px solid rgba(13,115,119,0.15);border-radius:10px;margin-bottom:24px;text-align:center"><div style="font-size:13px;color:#0D7377;font-weight:700">📎 첨부: 진단 결과 보고서</div><div style="font-size:11px;color:#8B8680;margin-top:4px">상세 진단 결과지가 PDF로 첨부되어 있습니다.</div></div>' : ''}
    <div style="border-top:1px solid #E8E5DE;padding-top:20px;font-size:13px;color:#8B8680;line-height:1.9;white-space:pre-wrap">${closing.replace(/\n/g,'\n')}</div>
  </div>
  <div style="background:#0A1628;padding:20px 32px;text-align:center">
    <div style="font-size:10px;color:rgba(244,241,235,0.3);line-height:1.8">
      © 2025 화율인사이드 | Tel. 02-2088-1767 | hwayulinside@gmail.com<br/>
      본 이메일은 요청에 따라 발송되었습니다.
    </div>
  </div>
</div></body></html>`;

  useEffect(() => {
    if (showPreview && previewRef.current) {
      const doc = previewRef.current.contentDocument || previewRef.current.contentWindow.document;
      doc.open(); doc.write(emailHtml); doc.close();
    }
  });

  // 검토리포트 작성 버튼으로 열렸을 때 자동 AI 생성 시작
  useEffect(() => {
    if (data.autoGenerate && data.type === "review" && !body) {
      generateReport();
    }
    // 코멘트와 함께 결과지 발송 모드 — 코멘트 미리 세팅
    if (data.isResultWithComment && data.comment && !body) {
      setBody(data.comment);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const typeLabel = {
    "report":"익명 제보 회신", "biz":"기업 상담 회신", "relief":"피해자 구제 회신",
    "report-email":"결과지 + 검토 코멘트 발송", "review":"노무사 검토 리포트 발송",
    "lecture":"강의 요청 회신", "advisory":"자문 요청 회신", "consulting":"교육 요청 회신"
  }[data.type] || "이메일";

  if (showPreview) return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(10,22,40,0.9)", backdropFilter:"blur(8px)", display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 24px", background:"#0A1628", borderBottom:"1px solid rgba(201,168,76,0.2)" }}>
        <div>
          <span style={{ fontSize:14, fontWeight:700, color:"#F4F1EB" }}>📧 이메일 미리보기</span>
          <span style={{ fontSize:11, color:"rgba(244,241,235,0.4)", marginLeft:12 }}>To: {data.to}</span>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {data.resultHtml && <button onClick={() => onViewResult(data.resultHtml)} style={{ padding:"6px 14px", borderRadius:6, background:"rgba(41,128,185,0.2)", border:"1px solid rgba(41,128,185,0.3)", color:"#5DADE2", fontWeight:700, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>📄 첨부 결과지 보기</button>}
          <button onClick={async () => {
            // 1) DB에 이메일 내용 저장
            try {
              await fetch("https://hwayul-backend-production-96cf.up.railway.app/api/sent-emails", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  submission_id: data.data?.id || "",
                  submission_type: data.type || "",
                  recipient_email: data.to || "",
                  recipient_name: data.name || "",
                  email_type_label: typeLabel,
                  greeting, body, closing
                })
              });
            } catch(e) { console.error("이메일 저장 실패:", e); }
            // 2) 기존 로직: 상태 변경 + localStorage 저장
            setSent(true); setShowPreview(false);
            if (data.data) {
              data.data.status = data.type === "report-email" ? "발송완료" : "완료";
              if (data.data.id) updateSubmissionStatus(data.data.id, data.data.status);
            }
            _store.listeners.forEach(fn=>fn()); saveToStorage(_store.submissions);
            if (data.onEmailSaved) data.onEmailSaved();
          }} style={{ padding:"6px 16px", borderRadius:6, background:"#1A7A4A", border:"none", color:"white", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>✉️ 발송하기</button>
          <button onClick={() => setShowPreview(false)} style={{ padding:"6px 14px", borderRadius:6, background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)", color:"#F4F1EB", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>← 수정하기</button>
        </div>
      </div>
      <div style={{ flex:1, display:"flex", justifyContent:"center", padding:20, overflow:"auto", background:"rgba(10,22,40,0.5)" }}>
        <div style={{ width:"100%", maxWidth:680, background:"white", borderRadius:12, overflow:"hidden", boxShadow:"0 8px 40px rgba(0,0,0,0.3)" }}>
          <iframe ref={previewRef} style={{ width:"100%", height:"100%", border:"none", minHeight:"80vh" }} title="이메일미리보기" />
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(10,22,40,0.7)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:32 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:"white", borderRadius:16, padding:32, maxWidth:680, width:"100%", maxHeight:"90vh", overflow:"auto", boxShadow:"0 24px 80px rgba(10,22,40,0.25)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div>
            <h3 style={{ fontSize:17, fontWeight:800, color:"#0A1628" }}>📧 {typeLabel}</h3>
            <div style={{ fontSize:12, color:"#8B8680", marginTop:2 }}>수신: {data.to} ({data.name})</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, color:"#8B8680", cursor:"pointer" }}>✕</button>
        </div>

        {sent && <div style={{ padding:14, background:"rgba(26,122,74,0.08)", borderRadius:8, marginBottom:16, textAlign:"center", fontSize:13, color:"#1A7A4A", fontWeight:600 }}>✅ 이메일이 발송되었습니다.</div>}

        {data.data?.detail && (
          <div style={{ padding:14, background:"rgba(201,168,76,0.06)", border:"1px solid rgba(201,168,76,0.15)", borderRadius:8, marginBottom:16 }}>
            <div style={{ fontSize:10, fontWeight:700, color:"#C9A84C", marginBottom:6, textTransform:"uppercase" }}>신청자 상세 내용</div>
            <div style={{ fontSize:13, color:"#0A1628", lineHeight:1.7, whiteSpace:"pre-wrap" }}>{data.data.detail}</div>
          </div>
        )}
        {data.data?.situation && (
          <div style={{ padding:14, background:"rgba(192,57,43,0.04)", border:"1px solid rgba(192,57,43,0.12)", borderRadius:8, marginBottom:16 }}>
            <div style={{ fontSize:10, fontWeight:700, color:"#C0392B", marginBottom:6, textTransform:"uppercase" }}>피해 내용</div>
            <div style={{ fontSize:13, color:"#0A1628", lineHeight:1.7, whiteSpace:"pre-wrap" }}>{data.data.situation}</div>
          </div>
        )}
        {data.data?.content && (
          <div style={{ padding:14, background:"rgba(13,115,119,0.04)", border:"1px solid rgba(13,115,119,0.12)", borderRadius:8, marginBottom:16 }}>
            <div style={{ fontSize:10, fontWeight:700, color:"#0D7377", marginBottom:6, textTransform:"uppercase" }}>제보 내용</div>
            <div style={{ fontSize:13, color:"#0A1628", lineHeight:1.7, whiteSpace:"pre-wrap" }}>{data.data.content}</div>
          </div>
        )}
        {data.data?.note && (
          <div style={{ padding:14, background:"rgba(10,22,40,0.02)", border:"1px solid rgba(10,22,40,0.06)", borderRadius:8, marginBottom:16 }}>
            <div style={{ fontSize:10, fontWeight:700, color:"#8B8680", marginBottom:6, textTransform:"uppercase" }}>기업 상담 메모</div>
            <div style={{ fontSize:13, color:"#0A1628", lineHeight:1.7, whiteSpace:"pre-wrap" }}>{data.data.note}</div>
          </div>
        )}

        {data.resultHtml && (
          <button onClick={() => onViewResult(data.resultHtml)} style={{ width:"100%", padding:12, borderRadius:8, background:"rgba(41,128,185,0.08)", border:"1px solid rgba(41,128,185,0.15)", color:"#2980B9", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", marginBottom:16 }}>
            📄 신청자 진단결과지 보기
          </button>
        )}

        <div style={{ marginBottom:14 }}>
          <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#8B8680", marginBottom:4, textTransform:"uppercase" }}>인사말</label>
          <textarea value={greeting} onChange={e => setGreeting(e.target.value)} rows={3} style={{ width:"100%", padding:"10px 12px", borderRadius:6, border:"2px solid rgba(10,22,40,0.1)", fontSize:13, fontFamily:"inherit", outline:"none", resize:"vertical", lineHeight:1.7, boxSizing:"border-box" }} />
        </div>

        <div style={{ marginBottom:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#8B8680", textTransform:"uppercase" }}>본문 (검토 리포트 내용)</label>
            {/* 노무사 검토 리포트 타입일 때만 AI 자동 작성 버튼 표시 */}
            {data.type === "review" && (
              <button
                onClick={generateReport}
                disabled={aiLoading}
                style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:8, background: aiLoading ? "rgba(10,22,40,0.08)" : "linear-gradient(135deg,#0D7377,#4ECDC4)", border:"none", color: aiLoading ? "#8B8680" : "white", fontWeight:700, fontSize:12, cursor: aiLoading ? "not-allowed" : "pointer", fontFamily:"inherit", transition:"all 0.2s" }}
              >
                {aiLoading
                  ? <><span style={{ display:"inline-block", animation:"spin 1s linear infinite", fontSize:13 }}>⟳</span> AI 작성 중…</>
                  : <><span>✨</span> AI 자동 작성</>
                }
              </button>
            )}
          </div>

          {/* AI 오류 메시지 */}
          {aiError && (
            <div style={{ padding:"8px 12px", background:"rgba(192,57,43,0.07)", border:"1px solid rgba(192,57,43,0.2)", borderRadius:7, marginBottom:8, fontSize:12, color:"#C0392B" }}>
              ⚠️ {aiError}
            </div>
          )}

          {/* AI 생성 중 스켈레톤 */}
          {aiLoading && (
            <div style={{ padding:"16px", background:"rgba(13,115,119,0.04)", border:"2px dashed rgba(13,115,119,0.25)", borderRadius:8, marginBottom:8, textAlign:"center" }}>
              <div style={{ fontSize:13, color:"#0D7377", fontWeight:600, marginBottom:6 }}>🤖 노무사 검토 리포트 작성 중…</div>
              <div style={{ fontSize:11, color:"#8B8680", lineHeight:1.7 }}>
                진단 결과와 신청자 정보를 분석하여<br/>전문 검토 의견을 작성하고 있습니다.
              </div>
            </div>
          )}

          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={12}
            placeholder={data.type === "review"
              ? "위 'AI 자동 작성' 버튼을 누르면 진단 결과 기반 검토 리포트가 자동 생성됩니다.\n직접 작성하거나 AI 생성 후 수정하실 수 있습니다."
              : "검토 결과, 법적 판단, 권고사항 등을 작성하세요..."}
            style={{ width:"100%", padding:"10px 12px", borderRadius:6, border:`2px solid ${body && data.type === "review" ? "rgba(13,115,119,0.3)" : "rgba(10,22,40,0.1)"}`, fontSize:13, fontFamily:"inherit", outline:"none", resize:"vertical", lineHeight:1.8, boxSizing:"border-box", transition:"border-color 0.2s" }}
          />
          {body && data.type === "review" && (
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:5 }}>
              <span style={{ fontSize:11, color:"#8B8680" }}>{body.length}자</span>
              <button
                onClick={generateReport}
                disabled={aiLoading}
                style={{ fontSize:11, color:"#0D7377", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:600, textDecoration:"underline" }}
              >
                ↺ AI 재작성
              </button>
            </div>
          )}
          <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
        </div>

        <div style={{ marginBottom:20 }}>
          <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#8B8680", marginBottom:4, textTransform:"uppercase" }}>서명 / 맺음말</label>
          <textarea value={closing} onChange={e => setClosing(e.target.value)} rows={4} style={{ width:"100%", padding:"10px 12px", borderRadius:6, border:"2px solid rgba(10,22,40,0.1)", fontSize:13, fontFamily:"inherit", outline:"none", resize:"vertical", lineHeight:1.7, boxSizing:"border-box", color:"#8B8680" }} />
        </div>

        <div style={{ display:"flex", gap:10 }}>
          <button onClick={() => setShowPreview(true)} style={{ flex:2, padding:"14px", borderRadius:10, background:"#0D7377", border:"none", color:"white", fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>👁 미리보기</button>
          <button onClick={onClose} style={{ flex:1, padding:"14px", borderRadius:10, background:"transparent", border:"2px solid rgba(10,22,40,0.1)", color:"#8B8680", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>닫기</button>
        </div>
      </div>
    </div>
  );
}

// ── 관리자 모드 ──────────────────────────────────────────────────────────────
// 보안: 솔트 + 다중 라운드 해시 (crypto.subtle 없이도 작동)
// 비밀번호 변경 시: 브라우저 콘솔에서 hashPw("새비밀번호") 실행 후 ADMIN_HASH_VALUE 교체
const ADMIN_SALT = "hwayul_salt_2025";

