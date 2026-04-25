import { useState, useRef, useEffect } from "react";
import C from "../tokens/colors.js";
import { saveAIChat } from "../utils/aiChatBridge.js";

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
      welcomeMsg: "힘든 상황 속에서 찾아주셔서 감사합니다.\n\n직장내 괴롭힘 여부 판단, 대응 방법, 구제 절차 등 궁금한 점을 편하게 말씀해 주세요.\n\n🔒 익명성이 보장됩니다 · 일반적 안내이며 법적 효력은 없습니다.",
      quickQs: ["이게 직장내 괴롭힘에 해당하나요?", "증거는 어떻게 모아야 하나요?", "회사에 신고하면 불이익이 있나요?", "산재 신청이 가능할까요?"],
      tone: "차분하고 전문가다운 어조. 과도한 위로·감정 표현 지양. 간결한 공감은 짧게 한 문장 이내로 제한하고, 바로 객관적 판단과 실행 방안으로 넘어갈 것. '위로의 말보다 행동과 객관적 판단으로 지원해 드리겠습니다'라는 메시지를 자연스럽게 전달",
    },
    accused: {
      label: "피지목인",
      icon: "😰",
      welcomeMsg: "어려운 상황에서 찾아주셨군요.\n\n이 상담은 가해자 여부를 판단하지 않습니다. 만일 가해자로 지목되셨다면 적정 절차를 받도록 도와 드립니다.\n\n조사 과정, 소명 기회, 대응 방법 등을 편하게 물어봐 주세요.\n\n🔒 익명성이 보장됩니다 · 일반적 안내이며 법적 효력은 없습니다.\n⚠️ 본 대화 내용은 분쟁 과정에서 증거로 사용될 수 있으니 작성에 신중을 기해주세요.",
      quickQs: ["조사 과정은 어떻게 진행되나요?", "소명 기회는 어떻게 주어지나요?", "정당한 업무지시였는데 신고됐어요", "징계를 받게 되면 어떻게 대응하나요?"],
      tone: "균형 잡힌 객관적 어조. 판단하지 않되, 정당한 업무지시 가능성과 본인 행동 점검 필요성을 균형있게 안내. '힘드시겠어요'로 공감하되 편들지 않음",
    },
    hr: {
      label: "회사 담당자",
      icon: "🏢",
      welcomeMsg: "안녕하세요. 사내 괴롭힘 사건을 다루고 계시군요.\n\n법적 의무, 조사 절차, 처리 기한, 이중 피해 방지 등 실무에 필요한 정보를 안내해 드리겠습니다.\n\n🔒 익명성이 보장됩니다 · 일반적 안내이며 법적 효력은 없습니다.",
      quickQs: ["신고 접수 후 법적 조사 기한은?", "가해자·피해자 분리 조치 방법은?", "조사위원회 구성은?", "2차 피해 방지 의무는?"],
      tone: "객관적·실무 중심. 법적 근거(근로기준법 제76조의2 등) 명시. 체크리스트 형태 선호",
    },
    general: {
      label: "일반 상담",
      icon: "🤔",
      welcomeMsg: "안녕하세요. Q인사이드 AI 상담 도우미입니다.\n\n괴롭힘에 해당하는지 판단이 어려우신가요? 상황을 말씀해 주시면 일반적 기준에서 안내해 드리겠습니다.\n\n🔒 익명성이 보장됩니다 · 일반적 안내이며 법적 효력은 없습니다.",
      quickQs: ["이런 상황이 괴롭힘인가요?", "상사의 업무지시와 괴롭힘의 차이는?", "동료 간 갈등도 괴롭힘인가요?", "어떤 절차를 밟아야 하나요?"],
      tone: "중립적이고 친절한 안내자. 직장내 괴롭힘 3요건(우월적 지위·업무상 적정범위 초과·신체적 정신적 고통) 기준으로 체계적으로 안내",
    },
    sanjae: {
      label: "산재 상담",
      icon: "🩺",
      welcomeMsg: "안녕하세요. 업무로 인해 몸과 마음이 힘드신 상황이시군요.\n\n산재 승인 절차, 필요 서류, 유사 사례 등을 안내해 드립니다. 궁금한 점을 편하게 말씀해 주세요.\n\n🔒 익명성이 보장됩니다 · 일반적 안내이며 법적 효력은 없습니다.",
      quickQs: ["산재 신청 절차가 어떻게 되나요?", "정신질환도 산재가 되나요?", "회사가 비협조적이면 어떻게 하나요?", "산재 승인까지 얼마나 걸리나요?"],
      tone: "차분하고 실무적인 어조. 과도한 위로 지양. 산재보험법과 판례를 기반으로 객관적 판단을 중심으로 안내하며 승인 가능성은 단정하지 않음",
    },
    company: {
      label: "회사 담당자",
      icon: "🏛️",
      welcomeMsg: "안녕하세요. 사내 괴롭힘 사건 처리에 관한 궁금한 점을 답변드리겠습니다.\n\n조사 절차, 사업주 의무, 징계 결정, 2차 피해 방지 등을 안내해 드립니다.\n\n🔒 익명성이 보장됩니다 · 일반적 안내이며 법적 효력은 없습니다.",
      quickQs: ["조사 착수 기한은 며칠인가요?", "당사자 분리 조치는 어떻게 하나요?", "조사보고서에 뭘 넣어야 하나요?", "미조치 시 과태료는 얼마인가요?"],
      tone: "객관적·실무 중심. 근로기준법 제76조의2·제76조의3 기반. 법적 의무·기한·과태료를 명확하게 안내",
    },
  };

  const isSanjae = type === "sanjae";
  const isCompany = type === "company";
  const isAccused = type === "accused";
  const isSpecial = isSanjae || isCompany;
  const [role, setRole] = useState(isSanjae ? "sanjae" : isCompany ? "company" : isAccused ? "accused" : "victim");
  const cfg = ROLE_CONFIG[role];

  const [messages, setMessages] = useState([{ role: "assistant", text: cfg.welcomeMsg }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [replyCount, setReplyCount] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // 웰컴 메시지만 있는 상태(첫 메시지 or 역할 전환 직후)에는 페이지 스크롤하지 않음
    if (messages.length <= 1 && !loading) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, loading]);

  // 대화 발생 시 심층상담 브리지에 자동 저장 (어떤 경로로 이동해도 대화 전달)
  useEffect(() => {
    if (messages.length > 1) {
      saveAIChat({ source: "diagnosis", topic: cfg?.label || role, messages });
    }
  }, [messages, role]);

  // 역할 변경 시 챗봇 리셋
  const switchRole = (newRole) => {
    setRole(newRole);
    setMessages([{ role: "assistant", text: ROLE_CONFIG[newRole].welcomeMsg }]);
    setReplyCount(0);
    setShowCTA(false);
  };

  // ── 역할별 전환 유도 지침 ──
  const conversionGuide = {
    victim: `[전환 유도 — 피해자]
다음 징후가 대화 중 2개 이상 감지되면, 답변 말미에 자연스럽게 심층 상담을 권유:
- 구체적 가해 행위 3개 이상 언급 (예: 공개 질책 + 업무 배제 + 사적 심부름)
- 6개월 이상 지속 또는 반복성 언급
- 증거 확보 언급 (녹음, 카톡, 이메일, 목격자 등)
- 신고/고소/노동청 진정 의사 표현
- 정신과 치료·진단서·산재 언급
- 이직·퇴사 고민 언급

권유 시 반드시 포함할 3요소:
1. 구체적 상품명과 가격: "Q인사이드 심층 상담(22만원, 3단계 패키지)"
2. 받을 수 있는 내용: "법적 판단 근거, 증거 정리 방법, 구제 절차별 장단점을 노무사가 직접 검토"
3. AI 한계 연결: "AI 안내는 일반 기준까지이고, 당신 사안의 확정적 판단은 전문가 검토가 필요합니다"

권유 금지사항:
- 딱딱한 광고 문구 금지 ("상품을 구매하세요" X)
- 공포 조장 금지 ("이대로 두면 큰일 납니다" X)
- 대화 중 1~2회로 제한 (매 답변 반복 금지)`,

    accused: `[전환 유도 — 피지목인]
피지목인은 위기 상황이므로 다음 징후 1개 이상 감지 시 적극 권유:
- 조사 일정이 잡혔거나 임박 (가장 강력한 트리거)
- 소명서·진술서 작성 임박
- 징계위원회 회부 가능성 언급
- 직위 해제·대기발령 상태
- 퇴사 압박 상황

권유 시 강조 포인트:
1. "진술은 한 번 하면 돌이키기 어렵습니다"
2. "전문가 검토를 받은 분과 안 받은 분의 결과 차이가 큽니다"
3. "Q인사이드 심층 상담(22만원, 3단계 패키지)으로 진술 전 대응 전략을 정리하실 수 있어요"`,

    sanjae: `[전환 유도 — 산재]
다음 징후 감지 시 심층 상담 권유:
- 이미 정신과·심리상담 치료 중
- 진단서 확보 언급
- 회사가 산재 신청에 비협조적
- 근로복지공단 절차 진행 중이거나 반려 경험
- 업무 복귀 어려움 호소

권유 시 포함할 내용:
1. "Q인사이드 심층 상담(22만원, 3단계 패키지)"
2. "산재 승인에 필요한 인과관계 입증 전략, 서류 준비, 소견서 방향까지 노무사가 직접 검토"
3. "산재 승인율은 사전 준비에 따라 크게 달라집니다"`,

    hr: `[전환 유도 — 회사 담당자 (hr)]
다음 징후 감지 시 기업 대상 서비스 권유:
- 신고 접수된 사건 처리 중
- 조사 방법·절차 질문
- 징계 양정 고민
- 반복 발생 언급
- 예방 교육 필요성 언급

권유 방향:
1단계: "Q인사이드 심층 상담(22만원, 3단계 패키지)으로 본 사건의 법적 리스크를 검토받으세요"
2단계: "예방 교육·취업규칙 진단·외부조사위원 위촉 등 연간 파트너십도 가능합니다"`,

    company: `[전환 유도 — 회사 담당자 (company)]
hr 역할과 동일한 전환 유도 로직 적용.
사업주의 법적 의무 미이행 시 리스크(과태료, 손해배상, 산재 인정 파급효과)를 사실에 기반하여 안내.
"Q인사이드 심층 상담(22만원, 3단계 패키지)"을 통해 법적 리스크를 사전 차단할 수 있음을 자연스럽게 안내.`,

    general: `[전환 유도 — 일반 상담]
괴롭힘 해당 여부 판단 후 다음 단계 안내:
- "해당 가능성 높음" → 피해자 입장 챗봇 이동 안내 + 심층 상담 권유
- "경계선 / 판단 어려움" → "이런 경계선 사안일수록 전문가 검토가 중요합니다. Q인사이드 심층 상담(22만원, 3단계 패키지)을 권장드립니다"
- "해당 가능성 낮음" → 다른 노동법 이슈(부당대우, 임금체불 등) 가능성 안내`,
  };

  const topicLabel = isSanjae ? "산재 상담" : isCompany ? "사내 괴롭힘 조사 자문" : "직장내 괴롭힘 자가진단";
  const topicExtra = isSanjae
    ? "\n산재보험법, 산업재해보상보험법, 근로복지공단 심사 기준을 바탕으로 답변합니다.\n판례DB에 산재 관련 판례가 있다면 참고하여 유사 사례를 안내해 주세요."
    : isCompany
    ? "\n근로기준법 제76조의2·제76조의3, 사업주 의무, 조사 절차, 과태료 기준을 바탕으로 답변합니다.\n사업주 입장에서 실무적 체크리스트를 제공하세요."
    : "";

  const systemPrompt = `당신은 'Q인사이드' 플랫폼의 ${topicLabel} 전문 AI 상담 도우미입니다.
1,000건 이상의 실제 법원 판례를 학습한 전문 AI로, 20년 경력 노무사의 시선으로 답변합니다.
${topicExtra}

사용자 입장: ${cfg.label}

사용자의 진단 결과 데이터:
${resultSummary || "(진단 결과 없음)"}

[톤과 태도]
- ${cfg.tone}
- 진단 결과를 구체적으로 반영하여 답변 (점수·등급·위험 영역 등 언급)
- 짧고 명료하게 (250~350자 이내)

[지원 원칙 — 전문가의 간결한 공감 + 행동 중심]
- 첫 응답에 공감은 1문장으로 짧게 ("쉽지 않은 상황이시네요" 수준). 2문장 이상 위로하지 않는다
- 공감 1문장 직후 바로 객관적 판단·법적 기준·실행 방안으로 넘어간다
- "잘못이 아닙니다" 같은 단정적 위로는 사용자가 자책을 명확히 표현한 경우에 한해 사용
- 답변의 중심은 항상 "그래서 어떻게 해야 하는가"
- 결론부에 "위로보다 행동과 객관적 판단으로 지원해 드리겠습니다" 취지를 자연스럽게 전달

[AI 한계 선언 — 매 답변에 자연스럽게 녹여넣기]
구체적 법적 판단이 필요한 질문에는 반드시:
- "일반적 기준으로는 ~에 해당할 가능성이 높습니다"
- "다만 최종 판단은 구체적 정황을 종합해야 합니다"
- "당신 사안의 확정적 판단은 전문가 검토가 필요합니다"

[최우선 원칙] 정확성 보장:
- 확실하지 않은 판례번호·통계 수치·법조문 번호는 절대 만들어내지 않는다
- 모르거나 확신이 없으면 "정확한 내용은 전문 노무사 확인이 필요합니다"로 답한다
- 존재하지 않는 법률·판례·기관·제도를 언급하지 않는다

[엄격한 제한]
- 특정 사건의 성립 여부를 단정하지 않음 ("~일 가능성이 있습니다" 톤)
- 승소 가능성·보상 금액은 언급하지 않음
${role === "accused" ? `- 피해자를 비난하거나 폄하하는 방향으로 조언하지 않는다
- 증거 인멸이나 회유를 암시하는 조언은 절대 하지 않는다
- 상대방(신고인)을 무고·허위신고자로 추정하지 않는다
- 상대방 접촉·연락 권유 절대 금지 (2차 가해 위험)` : ""}

${conversionGuide[role] || conversionGuide.general}`;

  const send = async (overrideInput) => {
    const q = (overrideInput ?? input).trim();
    if (!q || loading) return;
    setInput("");
    setMessages(m => [...m, { role: "user", text: q }]);
    setLoading(true);
    const newCount = replyCount + 1;
    setReplyCount(newCount);
    try {
      const history = messages.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text }));
      // 사용자가 콘텐츠 상세에서 "이 사례 참조" 체크했는지 확인 (30분 TTL)
      let attachContentId = null;
      try {
        const raw = localStorage.getItem("hwayul_attach_content");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.id && parsed.expiresAt > Date.now()) attachContentId = parsed.id;
          else localStorage.removeItem("hwayul_attach_content");
        }
      } catch {}
      // 사용자가 콘텐츠 본문 체크리스트에서 체크한 상황 (24시간 TTL)
      // ★ 하단 "참조" 체크박스가 켜진 콘텐츠의 체크만 AI에 전달
      let userSituations = null;
      try {
        const raw = localStorage.getItem("hwayul_user_situations");
        if (raw) {
          const parsed = JSON.parse(raw);
          const valid = parsed?.situations && parsed.situations.length > 0 && parsed.expiresAt > Date.now();
          if (valid && attachContentId && parsed.contentId === attachContentId) {
            userSituations = parsed;
          } else if (!valid) {
            localStorage.removeItem("hwayul_user_situations");
          }
        }
      } catch {}
      const res = await fetch("https://hwayul-backend-production-96cf.up.railway.app/api/claude", {
        method: "POST",
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [...history, { role: "user", content: `[${newCount}번째 질문] ${q}` }],
          ...(attachContentId ? { attach_content_id: attachContentId } : {}),
          ...(userSituations ? { user_situations: userSituations } : {}),
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

      {/* 역할 선택 (산재·회사 모드에서는 숨김) */}
      {!isSpecial && (
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

        {/* ★ 챗봇 내부의 심층상담 CTA 제거 — 진단 결과 페이지 하단에 이미 있는
              "💼 심층 상담 신청 →" 골드 박스와 중복되어 사용자에게 산만하게 보임.
              대화 내용은 saveAIChat이 useEffect로 자동 저장되어 어디서 신청해도 전달됨. */}

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
