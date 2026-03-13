import { useState, useEffect, useRef } from "react";
import C from "../tokens/colors.js";

export function AIChatBot({ onClose, isAdmin = false }) {
  const welcomeMsg = isAdmin
    ? "🔓 관리자 모드 — 제한 없는 전문 상담 모드입니다.\n\n사건 전략 수립, 증거 평가, 신청 가능성 판단 등 실무 수준의 구체적 조언을 제공합니다. 의뢰인에게 노출되지 않는 내용도 확인할 수 있습니다."
    : "안녕하세요. 저는 화율인사이드 AI 상담 도우미입니다.\n\n직장내 괴롭힘 여부 판단, 산재 신청 절차 등 궁금한 점을 편하게 질문해 주세요.\n\n⚠️ 본 AI 상담은 일반적인 안내용이며 법적 효력이 없습니다. 구체적인 사건 전략은 전문 노무사 상담을 권장합니다.";

  const [messages, setMessages] = useState([
    { role:"assistant", text: welcomeMsg }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  // 공개 모드: 일정 횟수 답변 후 상담 유도 표시
  const [replyCount, setReplyCount] = useState(0);
  const [showCTA, setShowCTA] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, loading]);

  // 일반 사용자용 시스템 프롬프트 — 마지노선 설정
  const publicSystemPrompt = `당신은 '화율인사이드' 플랫폼의 직장내 괴롭힘 안내 AI입니다. 한국 노동법(근로기준법 제76조의2) 기반으로 일반적인 정보를 안내합니다.

역할:
- 직장내 괴롭힘 성립 요건(3가지 기준)을 쉽게 설명
- 일반적인 대응 절차와 신고 기관 안내
- 산재 신청 절차 개요 설명
- 피해자 심리적 지지

[최우선 원칙] 정확성 보장 — 반드시 준수:
- 확실하지 않은 판례번호, 사건번호, 통계 수치, 법조문 번호는 절대 만들어내지 않는다
- 모르거나 확신이 없으면 "정확한 내용은 전문 노무사에게 확인이 필요합니다"라고 솔직하게 답한다
- 존재하지 않는 법률, 판례, 기관, 제도를 언급하지 않는다
- "~로 알려져 있습니다", "일반적으로 ~입니다" 등 불확실한 표현을 사용한다

엄격한 제한사항 (반드시 준수):
- 특정 사건의 괴롭힘 성립 여부를 단정하지 않는다. "전문가 검토가 필요합니다"로 마무리
- 증거 수집 구체적 방법(어디에 저장, 어떻게 제출)은 안내하지 않는다
- 승소 가능성, 보상 금액, 구체적 전략은 언급하지 않는다
- 회사나 가해자에 대한 구체적 대응 방법(내용증명, 고소장 등)은 안내하지 않는다
- 3번째 답변부터는 반드시 마지막에 다음 문구를 추가한다:
  "💡 구체적인 사건 검토와 대응 전략은 전문 노무사 상담이 필요합니다. 화율인사이드에서 무료 전화상담을 예약하실 수 있습니다."

답변 원칙:
- 200자 이내로 간결하게
- 따뜻하고 공감하는 어조
- 법적 조문은 쉬운 말로 풀어서`;

  // 관리자용 시스템 프롬프트 — 제한 없음
  const adminSystemPrompt = `당신은 화율인사이드 노무사 사무소의 전문 AI 보조입니다. 한국 노동법, 산업재해보상보험법, 형사법 전반에 걸친 실무 수준의 조언을 제공합니다.

[최우선 원칙] 정확성 보장:
- 판례를 인용할 때는 반드시 확실한 경우에만 판례번호를 기재한다. 불확실하면 "관련 판례가 있는 것으로 보이나 정확한 사건번호는 확인이 필요합니다"라고 표기한다
- 통계 수치를 언급할 때는 출처와 기준 연도를 명시한다. 불확실하면 "정확한 수치는 확인이 필요합니다"라고 표기한다
- 법조문 번호가 불확실하면 조문 번호 없이 법률명과 취지만 설명한다
- 존재하지 않는 판례·법률·기관·제도를 만들어내지 않는다

역할 (제한 없음):
- 직장내 괴롭힘 성립 여부 구체적 판단 및 취약점 분석
- 증거 수집 전략 (법적 효력, 제출 방법, 우선순위)
- 산재 신청 가능성 평가 및 승인률 높이는 전략
- 고용노동부 진정·고소·고발 전략과 타이밍
- 내용증명, 조정, 소송으로 이어지는 단계별 전략
- 사업주 측 대응 예상 및 반박 논리
- 위자료·손해배상 청구 가능성 검토
- 형사(폭행·모욕·강요) 병행 전략

답변 원칙:
- 실무 노무사에게 보고하는 수준의 구체성
- 판례·행정해석 인용 가능 (확실한 경우에만)
- 전략의 장단점, 리스크 함께 제시
- 답변 길이 제한 없음`;

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages(m => [...m, { role:"user", text:q }]);
    setLoading(true);
    const newCount = replyCount + 1;
    setReplyCount(newCount);
    // 공개 모드에서 3번째 답변부터 CTA 표시
    if (!isAdmin && newCount >= 3) setShowCTA(true);
    try {
      const history = messages.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text }));
      const res = await fetch("/api/claude", {
        method:"POST",
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens: isAdmin ? 1500 : 600,
          system: isAdmin ? adminSystemPrompt : publicSystemPrompt,
          messages:[...history, { role:"user", content: isAdmin ? q : `[${newCount}번째 질문] ${q}` }]
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content?.filter(b=>b.type==="text").map(b=>b.text).join("") || "죄송합니다. 일시적 오류가 발생했습니다.";
      setMessages(m => [...m, { role:"assistant", text }]);
    } catch {
      setMessages(m => [...m, { role:"assistant", text:"일시적 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." }]);
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const publicQuickQ  = ["이게 직장내 괴롭힘인가요?", "어떻게 대응해야 하나요?", "산재 신청이 가능할까요?", "회사에 신고하면 불이익이 있나요?"];
  const adminQuickQ   = ["증거 가치를 평가해 주세요", "산재 승인 전략은?", "형사 병행이 유리한가요?", "내용증명 발송 타이밍은?"];
  const quickQ = isAdmin ? adminQuickQ : publicQuickQ;

  return (
    <div style={{ position:"fixed", inset:0, zIndex:10100, display:"flex", alignItems:"flex-end", justifyContent:"flex-end", padding:"0 24px 24px", pointerEvents:"none" }}>
      <div style={{ width:"min(400px, calc(100vw - 32px))", maxHeight:"90vh", background:C.navy, borderRadius:20, boxShadow:"0 24px 80px rgba(10,22,40,0.6)", border:`2px solid ${isAdmin ? `rgba(201,168,76,0.5)` : "rgba(13,115,119,0.35)"}`, display:"flex", flexDirection:"column", pointerEvents:"all", overflow:"hidden" }}>
        {/* 헤더 */}
        <div style={{ padding:"16px 20px", background:isAdmin ? `linear-gradient(135deg, #1A1200, #0A0A00)` : `linear-gradient(135deg, ${C.navyMid}, ${C.navy})`, borderBottom:`1px solid ${isAdmin?"rgba(201,168,76,0.25)":"rgba(201,168,76,0.15)"}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:"50%", background:isAdmin ? `linear-gradient(135deg,${C.gold},#F5C842)` : `linear-gradient(135deg, ${C.teal}, ${C.tealLight})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{isAdmin ? "🔓" : "🤖"}</div>
            <div>
              <div style={{ fontSize:14, fontWeight:800, color:C.cream }}>
                AI 상담 도우미
                {isAdmin && <span style={{ marginLeft:8, fontSize:10, padding:"2px 7px", borderRadius:100, background:"rgba(201,168,76,0.2)", color:C.gold, border:"1px solid rgba(201,168,76,0.35)", fontWeight:700 }}>관리자</span>}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:C.green }} />
                <span style={{ fontSize:10, color:"rgba(244,241,235,0.5)" }}>{isAdmin ? "전문 상담 모드 · 제한 없음" : "온라인 · 즉시 응답"}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.08)", border:"none", width:30, height:30, borderRadius:"50%", cursor:"pointer", color:"rgba(244,241,235,0.6)", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>

        {/* 메시지 영역 */}
        <div style={{ flex:1, overflowY:"auto", padding:"16px 16px 8px", display:"flex", flexDirection:"column", gap:12, minHeight:0 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start", gap:8, alignItems:"flex-start" }}>
              {m.role==="assistant" && (
                <div style={{ width:28, height:28, borderRadius:"50%", background:isAdmin ? `linear-gradient(135deg,${C.gold},#F5C842)` : `linear-gradient(135deg,${C.teal},${C.tealLight})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0, marginTop:2 }}>{isAdmin ? "🔓" : "🤖"}</div>
              )}
              <div style={{
                maxWidth:"80%", padding:"11px 14px", borderRadius: m.role==="user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                background: m.role==="user" ? `linear-gradient(135deg,${C.teal},${C.tealLight})` : "rgba(255,255,255,0.06)",
                border: m.role==="user" ? "none" : "1px solid rgba(255,255,255,0.08)",
                fontSize:13, color:C.cream, lineHeight:1.7, whiteSpace:"pre-wrap"
              }}>
                {m.text}
                {m.role==="assistant" && (
                  <div style={{ marginTop:8, paddingTop:6, borderTop:"1px solid rgba(255,255,255,0.06)", fontSize:9, color:"rgba(244,241,235,0.3)", lineHeight:1.5 }}>
                    ⚠️ AI 생성 답변 · 부정확한 정보가 포함될 수 있습니다 · 법적 판단은 반드시 전문 노무사와 확인하세요
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:isAdmin ? `linear-gradient(135deg,${C.gold},#F5C842)` : `linear-gradient(135deg,${C.teal},${C.tealLight})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>{isAdmin ? "🔓" : "🤖"}</div>
              <div style={{ padding:"11px 16px", background:"rgba(255,255,255,0.06)", borderRadius:"4px 16px 16px 16px", border:"1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ color:"rgba(244,241,235,0.5)", fontSize:13 }}>···</span>
              </div>
            </div>
          )}

          {/* 공개 모드 인라인 상담 유도 CTA */}
          {!isAdmin && showCTA && (
            <div style={{ padding:"14px 16px", background:"rgba(201,168,76,0.1)", border:"1px solid rgba(201,168,76,0.3)", borderRadius:12, marginTop:4 }}>
              <div style={{ fontSize:12, fontWeight:800, color:C.gold, marginBottom:5 }}>💡 더 정확한 답변이 필요하신가요?</div>
              <div style={{ fontSize:11, color:"rgba(244,241,235,0.6)", lineHeight:1.65, marginBottom:10 }}>
                구체적인 사건 검토와 법적 전략은 AI로는 한계가 있습니다.<br/>전문 노무사와 무료 전화상담으로 정확한 방향을 확인하세요.
              </div>
              <button
                onClick={() => {
                  onClose();
                  // 기업상담 탭으로 이동하는 이벤트 발생 (App에서 잡음)
                  window.dispatchEvent(new CustomEvent("hwayul-goto", { detail:"biz" }));
                }}
                style={{ width:"100%", padding:"10px", borderRadius:8, background:C.gold, border:"none", color:C.navy, fontWeight:800, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}
              >
                📅 무료 전화상담 예약하기 →
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* 빠른 질문 */}
        {messages.length <= 1 && (
          <div style={{ padding:"0 16px 8px", display:"flex", flexWrap:"wrap", gap:6 }}>
            {quickQ.map(q => (
              <button key={q} onClick={() => { setInput(q); setTimeout(send, 50); }} style={{ padding:"6px 11px", borderRadius:100, background:isAdmin ? "rgba(201,168,76,0.12)" : "rgba(13,115,119,0.15)", border:`1px solid ${isAdmin ? "rgba(201,168,76,0.3)" : "rgba(13,115,119,0.35)"}`, color:isAdmin ? C.gold : C.tealLight, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>{q}</button>
            ))}
          </div>
        )}

        {/* 입력창 */}
        <div style={{ padding:"10px 16px 16px", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", gap:8, flexShrink:0 }}>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if(e.key==="Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder={isAdmin ? "실무 질문을 입력하세요..." : "질문을 입력하세요..."} style={{ flex:1, padding:"10px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)", color:C.cream, fontSize:13, fontFamily:"inherit", outline:"none" }} />
          <button onClick={send} disabled={!input.trim()||loading} style={{ width:40, height:40, borderRadius:10, background:input.trim()&&!loading ? (isAdmin ? C.gold : C.teal) : "rgba(255,255,255,0.08)", border:"none", color: isAdmin && input.trim() && !loading ? C.navy : "white", cursor:input.trim()&&!loading?"pointer":"not-allowed", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>➤</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ② 증거 수집 도우미
// ══════════════════════════════════════════════════════════════════════════════
