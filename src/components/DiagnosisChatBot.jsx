import { useState, useRef, useEffect } from "react";
import C from "../tokens/colors.js";

// ── 진단 결과 기반 인라인 AI 챗봇 ──────────────────────────────────────────
// type: "checklist" (괴롭힘 자가진단) | "culture" (조직문화 진단)
// variant: "dark" | "light"
export function DiagnosisChatBot({ type = "checklist", resultData = null, variant = "dark", setActive }) {
  const isDark = variant === "dark";
  const diagTypeLabel = type === "checklist" ? "직장내 괴롭힘 자가진단" : "조직문화 진단";

  const resultSummary = (() => {
    if (!resultData) return "";
    try { return JSON.stringify(resultData, null, 2); } catch { return ""; }
  })();

  const welcomeMsg = type === "checklist"
    ? "안녕하세요. 자가진단 결과를 바탕으로 궁금한 점을 답변드리겠습니다.\n\n'이게 정말 괴롭힘인가요?', '증거는 어떻게 모으나요?', '신고하면 어떻게 되나요?' 등 편하게 질문해 주세요.\n\n⚠️ 일반적 안내이며 법적 효력은 없습니다."
    : "안녕하세요. 조직문화 진단 결과를 바탕으로 궁금한 점을 답변드리겠습니다.\n\n'가장 시급한 개선 영역은?', '예방 교육은 어떻게 시작하나요?', '법적 의무사항은?' 등 편하게 질문해 주세요.\n\n⚠️ 일반적 안내이며 법적 효력은 없습니다.";

  const quickQs = type === "checklist"
    ? ["이게 직장내 괴롭힘에 해당하나요?", "증거는 어떻게 모아야 하나요?", "신고하면 어떤 절차가 진행되나요?", "산재 신청이 가능할까요?"]
    : ["가장 시급히 개선할 영역은?", "예방 교육은 어떻게 시작하나요?", "고위험 요인을 낮추려면?", "사업주 법적 의무사항은?"];

  const [messages, setMessages] = useState([{ role: "assistant", text: welcomeMsg }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [replyCount, setReplyCount] = useState(0);
  const [showCTA, setShowCTA] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const systemPrompt = `당신은 '화율인사이드' 플랫폼의 ${diagTypeLabel} 전문 AI 상담 도우미입니다.

사용자의 진단 결과 데이터:
${resultSummary || "(진단 결과 없음)"}

톤과 태도:
- 진단 결과를 구체적으로 반영하여 답변 (점수·등급·위험 영역 등 언급)
- ${type === "checklist" ? "따뜻하고 공감하는 어조 (피해자일 수 있음)" : "객관적이고 실무적인 어조 (HR 담당자일 수 있음)"}
- 짧고 명료하게 (200~300자 이내)

[최우선 원칙] 정확성 보장:
- 확실하지 않은 판례번호·통계 수치·법조문 번호는 절대 만들어내지 않는다
- 모르거나 확신이 없으면 "정확한 내용은 전문 노무사 확인이 필요합니다"로 답한다
- 존재하지 않는 법률·판례·기관·제도를 언급하지 않는다

엄격한 제한:
- 특정 사건의 성립 여부를 단정하지 않음 ("~일 가능성이 있습니다" 톤)
- 승소 가능성·보상 금액은 언급하지 않음
- 3번째 답변부터는 마지막에 다음 문구 추가:
  "💡 더 깊이 있는 검토가 필요하시면 심층 상담(22만원, 3단계 패키지)을 권장드립니다."`;

  const send = async (overrideInput) => {
    const q = (overrideInput ?? input).trim();
    if (!q || loading) return;
    setInput("");
    setMessages(m => [...m, { role: "user", text: q }]);
    setLoading(true);
    const newCount = replyCount + 1;
    setReplyCount(newCount);
    if (newCount >= 3) setShowCTA(true);
    try {
      const history = messages.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text }));
      const res = await fetch("https://hwayul-backend-production-96cf.up.railway.app/api/claude", {
        method: "POST",
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 700,
          system: systemPrompt,
          messages: [...history, { role: "user", content: `[${newCount}번째 질문] ${q}` }],
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "죄송합니다. 일시적 오류가 발생했습니다.";
      setMessages(m => [...m, { role: "assistant", text }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", text: "일시적 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." }]);
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // 스타일 토큰
  const containerBg = isDark ? "rgba(255,255,255,0.03)" : "white";
  const border      = isDark ? "rgba(201,168,76,0.25)" : "rgba(13,115,119,0.2)";
  const headerBg    = isDark ? "rgba(201,168,76,0.1)" : "rgba(13,115,119,0.05)";
  const headerBorder= isDark ? "rgba(201,168,76,0.25)" : "rgba(13,115,119,0.15)";
  const titleColor  = isDark ? C.cream : C.navy;
  const subColor    = isDark ? "rgba(244,241,235,0.5)" : C.gray;
  const textColor   = isDark ? "rgba(244,241,235,0.85)" : "#3A3530";
  const assistantBubble = isDark ? "rgba(255,255,255,0.06)" : "rgba(13,115,119,0.06)";
  const assistantBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(13,115,119,0.12)";
  const userBubble  = `linear-gradient(135deg,${C.teal},${C.tealLight})`;
  const inputBg     = isDark ? "rgba(255,255,255,0.05)" : "white";
  const inputBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(10,22,40,0.15)";
  const inputColor  = isDark ? C.cream : C.navy;
  const sendBg      = isDark ? C.teal : C.teal;
  const accent      = isDark ? C.gold : C.teal;
  const accentBg    = isDark ? "rgba(201,168,76,0.1)" : "rgba(13,115,119,0.06)";
  const accentBorder= isDark ? "rgba(201,168,76,0.3)" : "rgba(13,115,119,0.2)";
  const disclaimerBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(13,115,119,0.1)";
  const quickBg     = isDark ? "rgba(13,115,119,0.15)" : "rgba(13,115,119,0.08)";
  const quickBorder = isDark ? "rgba(13,115,119,0.35)" : "rgba(13,115,119,0.3)";
  const quickColor  = isDark ? C.tealLight : C.teal;

  return (
    <div style={{ margin: "0 0 20px", background: containerBg, borderRadius: 16, border: `1.5px solid ${border}`, overflow: "hidden" }}>
      {/* 헤더 */}
      <div style={{ padding: "16px 22px", background: headerBg, borderBottom: `1px solid ${headerBorder}`, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${C.teal}, ${C.tealLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🤖</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: titleColor }}>AI 상담 — 진단 결과 기반 즉시 답변</div>
          <div style={{ fontSize: 11, color: subColor, marginTop: 2 }}>
            <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: C.green, marginRight: 6, verticalAlign: "middle" }} />
            온라인 · {diagTypeLabel} 결과를 참고하여 답변
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div style={{ padding: "16px 18px 8px", display: "flex", flexDirection: "column", gap: 12, maxHeight: 480, overflowY: "auto" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-start" }}>
            {m.role === "assistant" && (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${C.teal},${C.tealLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, marginTop: 2 }}>🤖</div>
            )}
            <div style={{
              maxWidth: "82%", padding: "11px 14px",
              borderRadius: m.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
              background: m.role === "user" ? userBubble : assistantBubble,
              border: m.role === "user" ? "none" : `1px solid ${assistantBorder}`,
              color: m.role === "user" ? "white" : textColor,
              fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap",
            }}>
              {m.text}
              {m.role === "assistant" && i > 0 && (
                <div style={{ marginTop: 8, paddingTop: 6, borderTop: `1px solid ${disclaimerBorder}`, fontSize: 9, color: subColor, lineHeight: 1.5 }}>
                  ⚠️ AI 생성 답변 · 부정확한 정보가 포함될 수 있습니다 · 법적 판단은 반드시 전문 노무사와 확인하세요
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${C.teal},${C.tealLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🤖</div>
            <div style={{ padding: "11px 16px", background: assistantBubble, borderRadius: "4px 16px 16px 16px", border: `1px solid ${assistantBorder}` }}>
              <span style={{ color: subColor, fontSize: 13 }}>···</span>
            </div>
          </div>
        )}

        {/* 3회 후 유료 상담 유도 */}
        {showCTA && (
          <div style={{ padding: "14px 16px", background: accentBg, border: `1px solid ${accentBorder}`, borderRadius: 12, marginTop: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: accent, marginBottom: 5 }}>💡 더 심층적인 검토가 필요하신가요?</div>
            <div style={{ fontSize: 11, color: subColor, lineHeight: 1.65, marginBottom: 10 }}>
              구체적인 사건 분석과 법적 전략은 AI로는 한계가 있습니다.<br />전문 노무사의 심층 상담(22만원, 3단계 패키지)으로 정확한 방향을 확인하세요.
            </div>
            <button
              onClick={() => { if (setActive) setActive("biz"); else window.dispatchEvent(new CustomEvent("hwayul-goto", { detail: "biz" })); }}
              style={{ width: "100%", padding: "10px", borderRadius: 8, background: accent, border: "none", color: isDark ? C.navy : "white", fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
            >
              💼 심층 상담 신청하기 →
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 빠른 질문 */}
      {messages.length <= 1 && (
        <div style={{ padding: "0 16px 8px", display: "flex", flexWrap: "wrap", gap: 6 }}>
          {quickQs.map(q => (
            <button key={q} onClick={() => send(q)} style={{ padding: "6px 11px", borderRadius: 100, background: quickBg, border: `1px solid ${quickBorder}`, color: quickColor, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{q}</button>
          ))}
        </div>
      )}

      {/* 입력창 */}
      <div style={{ padding: "10px 16px 16px", borderTop: `1px solid ${disclaimerBorder}`, display: "flex", gap: 8 }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="질문을 입력하세요..."
          style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: `1px solid ${inputBorder}`, background: inputBg, color: inputColor, fontSize: 13, fontFamily: "inherit", outline: "none" }}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          style={{ width: 40, height: 40, borderRadius: 10, background: input.trim() && !loading ? sendBg : "rgba(10,22,40,0.1)", border: "none", color: "white", cursor: input.trim() && !loading ? "pointer" : "not-allowed", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
        >➤</button>
      </div>
    </div>
  );
}
