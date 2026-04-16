import { useState, useRef, useEffect } from "react";
import C from "../tokens/colors.js";

// ── 진단 결과 기반 인라인 AI 챗봇 (괴롭힘 자가진단 전용) ──────────────────
// 기본은 피해자 입장으로 시작, 다른 입장이면 역할 변경 가능
export function DiagnosisChatBot({ type = "checklist", resultData = null, setActive }) {
  const resultSummary = (() => {
    if (!resultData) return "";
    try { return JSON.stringify(resultData, null, 2); } catch { return ""; }
  })();

  // ── 역할별 설정 ──
  const ROLE_CONFIG = {
    victim: {
      label: "피해자",
      icon: "😟",
      welcomeMsg: "안녕하세요. 자가진단 결과를 바탕으로 궁금한 점을 답변드리겠습니다.\n\n편하게 질문해 주세요.\n\n⚠️ 일반적 안내이며 법적 효력은 없습니다.",
      quickQs: ["이게 직장내 괴롭힘에 해당하나요?", "증거는 어떻게 모아야 하나요?", "신고하면 어떤 절차가 진행되나요?", "산재 신청이 가능할까요?"],
      tone: "따뜻하고 공감하는 어조 (피해자 입장)",
    },
    accused: {
      label: "피지목인",
      icon: "😰",
      welcomeMsg: "안녕하세요. 어려운 상황에서 찾아주셨군요.\n\n당신도 적정 절차를 받을 권리가 있습니다.\n\n조사 과정, 소명 기회, 대응 방법 등을 안내해 드리겠습니다.",
      quickQs: ["조사 과정은 어떻게 진행되나요?", "소명 기회는 어떻게 주어지나요?", "정당한 업무지시였는데 신고됐어요", "징계를 받게 되면 어떻게 대응하나요?"],
      tone: "균형 잡힌 객관적 어조. 판단하지 않고, 정당한 업무지시 가능성도 열어둠. 본인 행동 점검 필요성도 균형있게 안내",
    },
    hr: {
      label: "회사 담당자",
      icon: "🏢",
      welcomeMsg: "안녕하세요. 사내 괴롭힘 사건을 다루고 계시군요.\n\n법적 의무, 조사 절차, 처리 기한, 이중 피해 방지 등 실무에 필요한 정보를 안내해 드리겠습니다.",
      quickQs: ["신고 접수 후 법적 조사 기한은?", "가해자·피해자 분리 조치 방법은?", "조사위원회 구성은?", "2차 피해 방지 의무는?"],
      tone: "객관적·실무 중심. 법적 근거(근로기준법 제76조의2 등) 명시. 체크리스트 형태 선호",
    },
    general: {
      label: "일반 상담",
      icon: "🤔",
      welcomeMsg: "안녕하세요. 화율인사이드 AI 상담 도우미입니다.\n\n괴롭힘에 해당하는지 판단이 어려우시면 상황을 말씀해 주세요. 일반적 기준에서 안내해 드리겠습니다.",
      quickQs: ["이런 상황이 괴롭힘인가요?", "상사의 업무지시와 괴롭힘의 차이는?", "동료 간 갈등도 괴롭힘인가요?", "어떤 절차를 밟아야 하나요?"],
      tone: "중립적이고 친절한 안내자. 직장내 괴롭힘 3요건 기준으로 체계적으로",
    },
    sanjae: {
      label: "산재 상담",
      icon: "🩺",
      welcomeMsg: "안녕하세요. 산재 체크 결과를 바탕으로 궁금한 점을 답변드리겠습니다.\n\n산재 승인 절차, 필요 서류, 유사 판례 등을 안내해 드립니다.\n\n⚠️ 일반적 안내이며 법적 효력은 없습니다.",
      quickQs: ["산재 신청 절차가 어떻게 되나요?", "정신질환도 산재가 되나요?", "회사가 비협조적이면 어떻게 하나요?", "산재 승인까지 얼마나 걸리나요?"],
      tone: "실무적이고 친절한 어조. 산재보험법과 판례를 기반으로. 승인 가능성을 단정하지 않되 유사 사례 참고 안내",
    },
  };

  const isSanjae = type === "sanjae";
  const [role, setRole] = useState(isSanjae ? "sanjae" : "victim");
  const cfg = ROLE_CONFIG[role];

  const [messages, setMessages] = useState([{ role: "assistant", text: cfg.welcomeMsg }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [replyCount, setReplyCount] = useState(0);
  const [showCTA, setShowCTA] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  // 역할 변경 시 챗봇 리셋
  const switchRole = (newRole) => {
    setRole(newRole);
    setMessages([{ role: "assistant", text: ROLE_CONFIG[newRole].welcomeMsg }]);
    setReplyCount(0);
    setShowCTA(false);
  };

  const systemPrompt = `당신은 '화율인사이드' 플랫폼의 ${isSanjae ? "산재 상담" : "직장내 괴롭힘 자가진단"} 전문 AI 상담 도우미입니다.
${isSanjae ? "\n산재보험법, 산업재해보상보험법, 근로복지공단 심사 기준을 바탕으로 답변합니다.\n판례DB에 산재 관련 판례가 있다면 참고하여 유사 사례를 안내해 주세요." : ""}

사용자 입장: ${cfg.label}

사용자의 진단 결과 데이터:
${resultSummary || "(진단 결과 없음)"}

톤과 태도:
- 진단 결과를 구체적으로 반영하여 답변 (점수·등급·위험 영역 등 언급)
- ${cfg.tone}
- 짧고 명료하게 (200~300자 이내)

[최우선 원칙] 정확성 보장:
- 확실하지 않은 판례번호·통계 수치·법조문 번호는 절대 만들어내지 않는다
- 모르거나 확신이 없으면 "정확한 내용은 전문 노무사 확인이 필요합니다"로 답한다
- 존재하지 않는 법률·판례·기관·제도를 언급하지 않는다

엄격한 제한:
- 특정 사건의 성립 여부를 단정하지 않음 ("~일 가능성이 있습니다" 톤)
- 승소 가능성·보상 금액은 언급하지 않음
${role === "accused" ? "- 피해자를 비난하거나 폄하하는 방향으로 조언하지 않는다\n- 증거 인멸이나 회유를 암시하는 조언은 절대 하지 않는다" : ""}
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

  return (
    <div style={{ margin: "0 0 20px", background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1.5px solid rgba(201,168,76,0.25)", overflow: "hidden" }}>
      {/* 헤더 */}
      <div style={{ padding: "16px 22px", background: "rgba(201,168,76,0.1)", borderBottom: "1px solid rgba(201,168,76,0.25)", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${C.teal}, ${C.tealLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{cfg.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.cream }}>
            AI 상담 — {cfg.label} 입장
          </div>
          <div style={{ fontSize: 11, color: "rgba(244,241,235,0.5)", marginTop: 2 }}>
            <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: C.green, marginRight: 6, verticalAlign: "middle" }} />
            온라인 · 자가진단 결과를 참고하여 답변
          </div>
        </div>
      </div>

      {/* 역할 선택 (산재 모드에서는 숨김) */}
      {!isSanjae && (
      <div style={{ padding: "12px 22px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.15)" }}>
        <div style={{ fontSize: 11, color: "rgba(244,241,235,0.55)", marginBottom: 8 }}>입장을 바꿔서 상담하실 수도 있어요.</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {Object.entries(ROLE_CONFIG).filter(([key]) => key !== "sanjae").map(([key, r]) => (
            <button key={key} onClick={() => switchRole(key)} style={{
              padding: "6px 12px", borderRadius: 100,
              background: role === key ? "rgba(13,115,119,0.25)" : "rgba(255,255,255,0.05)",
              border: role === key ? `1px solid ${C.tealLight}` : "1px solid rgba(255,255,255,0.1)",
              color: role === key ? C.tealLight : "rgba(244,241,235,0.7)",
              fontSize: 11, fontWeight: role === key ? 700 : 500, cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 5,
            }}>
              <span>{r.icon}</span>
              <span>{r.label}</span>
            </button>
          ))}
        </div>
      </div>
      )}

      {/* 메시지 영역 */}
      <div style={{ padding: "16px 18px 8px", display: "flex", flexDirection: "column", gap: 12, maxHeight: 480, overflowY: "auto" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-start" }}>
            {m.role === "assistant" && (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${C.teal},${C.tealLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, marginTop: 2 }}>{cfg.icon}</div>
            )}
            <div style={{
              maxWidth: "82%", padding: "11px 14px",
              borderRadius: m.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
              background: m.role === "user" ? `linear-gradient(135deg,${C.teal},${C.tealLight})` : "rgba(255,255,255,0.06)",
              border: m.role === "user" ? "none" : "1px solid rgba(255,255,255,0.08)",
              color: m.role === "user" ? "white" : "rgba(244,241,235,0.85)",
              fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap",
            }}>
              {m.text}
              {m.role === "assistant" && i > 0 && (
                <div style={{ marginTop: 8, paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 9, color: "rgba(244,241,235,0.3)", lineHeight: 1.5 }}>
                  ⚠️ AI 생성 답변 · 부정확한 정보가 포함될 수 있습니다 · 법적 판단은 반드시 전문 노무사와 확인하세요
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${C.teal},${C.tealLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{cfg.icon}</div>
            <div style={{ padding: "11px 16px", background: "rgba(255,255,255,0.06)", borderRadius: "4px 16px 16px 16px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <span style={{ color: "rgba(244,241,235,0.5)", fontSize: 13 }}>···</span>
            </div>
          </div>
        )}

        {showCTA && (
          <div style={{ padding: "14px 16px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 12, marginTop: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.gold, marginBottom: 5 }}>💡 더 심층적인 검토가 필요하신가요?</div>
            <div style={{ fontSize: 11, color: "rgba(244,241,235,0.6)", lineHeight: 1.65, marginBottom: 10 }}>
              구체적인 사건 분석과 법적 전략은 AI로는 한계가 있습니다.<br />전문 노무사의 심층 상담(22만원, 3단계 패키지)으로 정확한 방향을 확인하세요.
            </div>
            <button
              onClick={() => { if (setActive) setActive("biz"); else window.dispatchEvent(new CustomEvent("hwayul-goto", { detail: "biz" })); }}
              style={{ width: "100%", padding: "10px", borderRadius: 8, background: C.gold, border: "none", color: C.navy, fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
            >
              💼 심층 상담 신청하기 →
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {messages.length <= 1 && (
        <div style={{ padding: "0 16px 8px", display: "flex", flexWrap: "wrap", gap: 6 }}>
          {cfg.quickQs.map(q => (
            <button key={q} onClick={() => send(q)} style={{ padding: "6px 11px", borderRadius: 100, background: "rgba(13,115,119,0.15)", border: "1px solid rgba(13,115,119,0.35)", color: C.tealLight, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{q}</button>
          ))}
        </div>
      )}

      <div style={{ padding: "10px 16px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 8 }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="질문을 입력하세요..."
          style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: C.cream, fontSize: 13, fontFamily: "inherit", outline: "none" }}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          style={{ width: 40, height: 40, borderRadius: 10, background: input.trim() && !loading ? C.teal : "rgba(255,255,255,0.08)", border: "none", color: "white", cursor: input.trim() && !loading ? "pointer" : "not-allowed", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
        >➤</button>
      </div>
    </div>
  );
}
