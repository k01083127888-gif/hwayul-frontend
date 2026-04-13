import { useState, useEffect, useRef } from "react";
import C from "../tokens/colors.js";

const STORAGE_KEY = "hwayul-chat-session";

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (s && s.role && Array.isArray(s.messages) && s.messages.length > 1) return s;
  } catch {}
  return null;
}

function saveSession(role, messages, replyCount) {
  try {
    if (role && messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ role, messages, replyCount, savedAt: Date.now() }));
    }
  } catch {}
}

function clearSession() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

export function AIChatBot({ onClose, isAdmin = false }) {
  // ── 이전 대화 복원 여부 ──
  const savedSession = useRef(isAdmin ? null : loadSession());
  const [showResumeScreen, setShowResumeScreen] = useState(!isAdmin && !!savedSession.current);

  // ── 역할 선택 상태 ──
  const [role, setRole] = useState(isAdmin ? "admin" : null);  // null이면 역할 선택 화면
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [replyCount, setReplyCount] = useState(0);
  const [showCTA, setShowCTA] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false); // 피지목인 면책 고지
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, loading]);

  // ── 대화 변경 시 localStorage 저장 ──
  useEffect(() => {
    if (role && role !== "admin" && messages.length > 1) {
      saveSession(role, messages, replyCount);
    }
  }, [messages, role, replyCount]);

  // ── 역할별 설정 ──
  const roleConfig = {
    victim: {
      icon: "😟",
      label: "피해 상담",
      headerColor: C.teal,
      welcomeMsg: "안녕하세요. 힘든 상황 속에서 찾아주셔서 감사합니다.\n\n당신의 잘못이 아닙니다. 직장내 괴롭힘 여부 판단, 대응 방법, 구제 절차 등 궁금한 점을 편하게 말씀해 주세요.\n\n⚠️ 본 AI 상담은 일반적인 안내용이며 법적 효력이 없습니다.",
      quickQ: ["이게 직장내 괴롭힘인가요?", "증거는 어떻게 모아야 하나요?", "회사에 신고하면 불이익이 있나요?", "산재 신청이 가능할까요?"],
    },
    accused: {
      icon: "😰",
      label: "피지목인 상담",
      headerColor: "#E67E22",
      welcomeMsg: "안녕하세요. 어려운 상황에서 찾아주셨군요.\n\n괴롭힘 지목을 받으셨다면 불안하고 억울한 마음이 크실 겁니다. 이 상담은 판단하지 않습니다. 당신도 적정한 절차를 받을 권리가 있습니다.\n\n조사 과정, 소명 기회, 대응 방법 등을 안내해 드리겠습니다.",
      quickQ: ["조사 과정은 어떻게 진행되나요?", "소명 기회는 어떻게 주어지나요?", "정당한 업무지시였는데 괴롭힘으로 신고됐어요", "징계를 받게 되면 어떻게 대응하나요?"],
    },
    hr: {
      icon: "🏢",
      label: "회사 담당자 상담",
      headerColor: "#2980B9",
      welcomeMsg: "안녕하세요. 사내 괴롭힘 사건 처리를 담당하고 계시군요.\n\n법적 의무사항, 조사 절차, 처리 기한, 이중 피해 방지 등 실무에 필요한 정보를 안내해 드리겠습니다.\n\n⚠️ 본 AI 상담은 일반적인 안내용이며 법적 효력이 없습니다.",
      quickQ: ["신고 접수 후 법적 조사 기한은?", "가해자·피해자 분리 조치 방법은?", "조사위원회 구성은 어떻게 하나요?", "2차 피해 방지 의무는 무엇인가요?"],
    },
    general: {
      icon: "🤔",
      label: "일반 상담",
      headerColor: C.teal,
      welcomeMsg: "안녕하세요. 화율인사이드 AI 상담 도우미입니다.\n\n괴롭힘에 해당하는지 아닌지 판단이 어려우신가요? 상황을 말씀해 주시면 일반적인 기준에서 안내해 드리겠습니다.\n\n⚠️ 본 AI 상담은 일반적인 안내용이며 법적 효력이 없습니다.",
      quickQ: ["이런 상황이 괴롭힘에 해당하나요?", "상사의 업무지시와 괴롭힘의 차이는?", "동료 간 갈등도 괴롭힘인가요?", "어떤 절차를 밟아야 하나요?"],
    },
    admin: {
      icon: "🔓",
      label: "관리자",
      headerColor: C.gold,
      welcomeMsg: "🔓 관리자 모드 — 제한 없는 전문 상담 모드입니다.\n\n사건 전략 수립, 증거 평가, 신청 가능성 판단 등 실무 수준의 구체적 조언을 제공합니다.",
      quickQ: ["증거 가치를 평가해 주세요", "산재 승인 전략은?", "형사 병행이 유리한가요?", "내용증명 발송 타이밍은?"],
    },
  };

  // ── 역할별 시스템 프롬프트 ──
  const systemPrompts = {
    victim: `당신은 '화율인사이드' 플랫폼의 직장내 괴롭힘 피해자 전문 상담 AI입니다. 한국 노동법(근로기준법 제76조의2) 기반으로 안내합니다.

톤과 태도:
- 공감 우선. "당신 잘못이 아닙니다"라는 메시지를 자연스럽게 전달
- 따뜻하고 안전한 분위기 유지
- 피해자의 감정을 존중하고 심리적 지지 제공

역할:
- 직장내 괴롭힘 성립 요건(3가지 기준)을 쉽게 설명
- 구제 절차 안내 (사내 신고, 고용노동부 진정, 산재 신청)
- 증거 수집의 필요성과 일반적 방향 안내
- 피해자 보호 제도 안내

[최우선 원칙] 정확성 보장:
- 확실하지 않은 판례번호, 사건번호, 통계 수치, 법조문 번호는 절대 만들어내지 않는다
- 모르거나 확신이 없으면 "정확한 내용은 전문 노무사에게 확인이 필요합니다"라고 솔직하게 답한다
- 존재하지 않는 법률, 판례, 기관, 제도를 언급하지 않는다

엄격한 제한사항:
- 특정 사건의 괴롭힘 성립 여부를 단정하지 않는다
- 승소 가능성, 보상 금액, 구체적 전략은 언급하지 않는다
- 3번째 답변부터는 반드시 마지막에 다음 문구를 추가한다:
  "💡 구체적인 사건 검토와 대응 전략은 전문 노무사 상담이 필요합니다. 화율인사이드에서 무료 전화상담을 예약하실 수 있습니다."

답변 원칙:
- 200자 이내로 간결하게
- 따뜻하고 공감하는 어조
- 법적 조문은 쉬운 말로 풀어서`,

    accused: `당신은 '화율인사이드' 플랫폼의 직장내 괴롭힘 피지목인(가해자로 지목된 사람) 전문 상담 AI입니다.

톤과 태도 (가장 중요):
- 판단하지 않는다. "당신도 적정한 절차를 받을 권리가 있습니다"
- 균형 잡힌 시각 유지: 피지목인 편을 들지도, 비판하지도 않는다
- 정당한 업무지시였을 가능성도 열어둔다
- 동시에 "본인의 행동을 돌아볼 필요도 있을 수 있다"는 균형도 자연스럽게 전달
- 억울한 경우의 구제 방법도 안내

역할:
- 조사 과정이 어떻게 진행되는지 설명
- 소명 기회와 진술 전 유의사항 안내
- 징계 절차와 대응 방법 안내
- 정당한 업무지시와 괴롭힘의 구분 기준 설명
- 억울한 지목에 대한 구제 방법 (이의제기, 노동위원회 등)

[최우선 원칙] 정확성 보장:
- 확실하지 않은 판례번호, 사건번호, 통계 수치, 법조문 번호는 절대 만들어내지 않는다
- 모르거나 확신이 없으면 "정확한 내용은 전문 노무사에게 확인이 필요합니다"라고 솔직하게 답한다

엄격한 제한사항:
- 피해자를 비난하거나 폄하하는 방향으로 조언하지 않는다
- 증거 인멸이나 회유를 암시하는 조언은 절대 하지 않는다
- 특정 사건의 결과를 단정하지 않는다
- 3번째 답변부터는 마지막에: "💡 구체적인 사건 검토는 전문 노무사 상담이 필요합니다. 화율인사이드에서 무료 전화상담을 예약하실 수 있습니다."

답변 원칙:
- 200자 이내로 간결하게
- 차분하고 객관적인 어조
- 법적 권리와 절차를 중심으로`,

    hr: `당신은 '화율인사이드' 플랫폼의 기업 HR·경영진·조사 담당자 전문 상담 AI입니다.

톤과 태도:
- 객관적, 실무 중심
- 법적 의무와 리스크를 명확하게 전달
- 감정적 표현 최소화, 체크리스트 형태 선호

역할:
- 직장내 괴롭힘 금지법 상 사업주 의무 안내
- 신고 접수 후 조사 절차 및 기한 (접수 후 10일 이내 조사 착수 등)
- 조사위원회 구성 및 운영 방법
- 가해자·피해자 분리 조치 방법
- 2차 피해(보복) 방지 의무
- 비밀유지 의무
- 미조치 시 사업주 과태료·법적 리스크
- 징계 수위 결정 시 고려사항

[최우선 원칙] 정확성 보장:
- 확실하지 않은 판례번호, 사건번호, 통계 수치, 법조문 번호는 절대 만들어내지 않는다
- 모르거나 확신이 없으면 "정확한 내용은 전문 노무사에게 확인이 필요합니다"라고 솔직하게 답한다

엄격한 제한사항:
- 특정 사건의 판단을 내리지 않는다
- 징계 수위를 직접 권고하지 않는다
- 3번째 답변부터는 마지막에: "💡 조직 맞춤 컨설팅은 전문 노무사 상담이 필요합니다. 화율인사이드 기업상담을 이용해 주세요."

답변 원칙:
- 250자 이내로 간결하게
- 실무 체크리스트 형태 선호
- 법적 근거 명시 (근로기준법 제76조의2, 제76조의3 등)`,

    general: `당신은 '화율인사이드' 플랫폼의 직장내 괴롭힘 일반 상담 AI입니다. 괴롭힘 해당 여부 판단을 도와줍니다.

톤과 태도:
- 중립적이고 친절한 안내자
- 상황을 정리해주고 방향을 제시

역할:
- 사용자의 상황이 직장내 괴롭힘 3가지 요건에 해당하는지 일반적 기준으로 안내
- 괴롭힘과 정당한 업무지시의 구분 기준 설명
- 판단 후 적절한 다음 단계 안내
- 상황에 따라 피해자/피지목인/HR 상담을 자연스럽게 안내

[최우선 원칙] 정확성 보장:
- 확실하지 않은 판례번호, 사건번호, 통계 수치, 법조문 번호는 절대 만들어내지 않는다
- 모르거나 확신이 없으면 "정확한 내용은 전문 노무사에게 확인이 필요합니다"라고 솔직하게 답한다

엄격한 제한사항:
- 특정 사건의 괴롭힘 성립 여부를 단정하지 않는다
- 3번째 답변부터는 마지막에: "💡 구체적인 사건 검토는 전문 노무사 상담이 필요합니다. 화율인사이드에서 무료 전화상담을 예약하실 수 있습니다."

답변 원칙:
- 200자 이내로 간결하게
- 중립적이고 알기 쉬운 어조
- 직장내 괴롭힘 3요건을 기준으로 체계적으로`,

    admin: `당신은 화율인사이드 노무사 사무소의 전문 AI 보조입니다. 한국 노동법, 산업재해보상보험법, 형사법 전반에 걸친 실무 수준의 조언을 제공합니다.

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
- 답변 길이 제한 없음`,
  };

  // ── 역할 선택 핸들러 ──
  const selectRole = (r) => {
    if (r === "accused") setShowDisclaimer(true);
    setRole(r);
    setShowResumeScreen(false);
    const cfg = roleConfig[r];
    setMessages([{ role: "assistant", text: cfg.welcomeMsg }]);
  };

  // ── 이전 대화 이어하기 ──
  const resumeSession = () => {
    const s = savedSession.current;
    if (s) {
      setRole(s.role);
      setMessages(s.messages);
      setReplyCount(s.replyCount || 0);
      if (s.role === "accused") setShowDisclaimer(true);
      if (s.replyCount >= 3) setShowCTA(true);
    }
    setShowResumeScreen(false);
  };

  // ── 새 대화 시작 ──
  const startNewSession = () => {
    clearSession();
    savedSession.current = null;
    setShowResumeScreen(false);
  };

  // ── 뒤로가기 (역할 재선택) ──
  const goBack = () => {
    clearSession();
    setRole(null);
    setMessages([]);
    setReplyCount(0);
    setShowCTA(false);
    setShowDisclaimer(false);
    setShowResumeScreen(false);
  };

  // ── 메시지 전송 ──
  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages(m => [...m, { role:"user", text:q }]);
    setLoading(true);
    const newCount = replyCount + 1;
    setReplyCount(newCount);
    if (role !== "admin" && newCount >= 3) setShowCTA(true);
    try {
      const history = messages.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text }));
      const res = await fetch("https://hwayul-backend-production-96cf.up.railway.app/api/claude", {
        method:"POST",
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens: role === "admin" ? 1500 : (role === "hr" ? 800 : 600),
          system: systemPrompts[role] || systemPrompts.general,
          messages:[...history, { role:"user", content: role === "admin" ? q : `[${newCount}번째 질문] ${q}` }]
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

  const cfg = role ? roleConfig[role] : null;
  const hdrColor = cfg?.headerColor || C.teal;
  const isAdminMode = role === "admin";

  // ══════════════════════════════════════════════════════════════
  // 이전 대화 복원 화면
  // ══════════════════════════════════════════════════════════════
  if (showResumeScreen && savedSession.current) {
    const s = savedSession.current;
    const sCfg = roleConfig[s.role];
    const msgCount = s.messages.filter(m => m.role === "user").length;
    const timeAgo = (() => {
      const diff = Date.now() - (s.savedAt || 0);
      const min = Math.floor(diff / 60000);
      if (min < 1) return "방금 전";
      if (min < 60) return `${min}분 전`;
      const hr = Math.floor(min / 60);
      if (hr < 24) return `${hr}시간 전`;
      return `${Math.floor(hr / 24)}일 전`;
    })();

    return (
      <div style={{ position:"fixed", inset:0, zIndex:10100, display:"flex", alignItems:"flex-end", justifyContent:"flex-end", padding:"0 24px 24px", pointerEvents:"none" }}>
        <div style={{ width:"min(400px, calc(100vw - 32px))", maxHeight:"90vh", background:C.navy, borderRadius:20, boxShadow:"0 24px 80px rgba(10,22,40,0.6)", border:"2px solid rgba(13,115,119,0.35)", display:"flex", flexDirection:"column", pointerEvents:"all", overflow:"hidden" }}>
          {/* 헤더 */}
          <div style={{ padding:"16px 20px", background:`linear-gradient(135deg, ${C.navyMid}, ${C.navy})`, borderBottom:"1px solid rgba(201,168,76,0.15)", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:"50%", background:`linear-gradient(135deg, ${C.teal}, ${C.tealLight})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🤖</div>
              <div>
                <div style={{ fontSize:14, fontWeight:800, color:C.cream }}>AI 상담 도우미</div>
                <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:C.green }} />
                  <span style={{ fontSize:10, color:"rgba(244,241,235,0.5)" }}>온라인 · 즉시 응답</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.08)", border:"none", width:30, height:30, borderRadius:"50%", cursor:"pointer", color:"rgba(244,241,235,0.6)", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          </div>

          {/* 복원 선택 */}
          <div style={{ padding:"24px 20px", flex:1 }}>
            <div style={{ fontSize:15, fontWeight:800, color:C.cream, marginBottom:20 }}>이전 대화가 있습니다</div>

            {/* 이전 대화 요약 카드 */}
            <div style={{ padding:"14px 16px", background:"rgba(13,115,119,0.08)", border:"1.5px solid rgba(13,115,119,0.3)", borderRadius:12, marginBottom:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <span style={{ fontSize:18 }}>{sCfg?.icon}</span>
                <span style={{ fontSize:13, fontWeight:700, color:C.cream }}>{sCfg?.label}</span>
                <span style={{ fontSize:10, color:"rgba(244,241,235,0.4)", marginLeft:"auto" }}>{timeAgo}</span>
              </div>
              <div style={{ fontSize:11, color:"rgba(244,241,235,0.5)", lineHeight:1.6 }}>
                질문 {msgCount}개 · 대화 {s.messages.length}개 메시지
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <button onClick={resumeSession} style={{
                padding:"14px 16px", borderRadius:12, background:"rgba(13,115,119,0.15)", border:"1.5px solid rgba(13,115,119,0.4)",
                cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:700, color:C.tealLight, textAlign:"center", transition:"all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(13,115,119,0.25)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(13,115,119,0.15)"; }}
              >
                💬 이전 대화 이어하기
              </button>
              <button onClick={startNewSession} style={{
                padding:"14px 16px", borderRadius:12, background:"rgba(201,168,76,0.08)", border:"1.5px solid rgba(201,168,76,0.3)",
                cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:700, color:C.gold, textAlign:"center", transition:"all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,168,76,0.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(201,168,76,0.08)"; }}
              >
                ✨ 새 대화 시작
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // 역할 선택 화면 (role === null)
  // ══════════════════════════════════════════════════════════════
  if (!role) {
    return (
      <div style={{ position:"fixed", inset:0, zIndex:10100, display:"flex", alignItems:"flex-end", justifyContent:"flex-end", padding:"0 24px 24px", pointerEvents:"none" }}>
        <div style={{ width:"min(400px, calc(100vw - 32px))", maxHeight:"90vh", background:C.navy, borderRadius:20, boxShadow:"0 24px 80px rgba(10,22,40,0.6)", border:"2px solid rgba(13,115,119,0.35)", display:"flex", flexDirection:"column", pointerEvents:"all", overflow:"hidden" }}>
          {/* 헤더 */}
          <div style={{ padding:"16px 20px", background:`linear-gradient(135deg, ${C.navyMid}, ${C.navy})`, borderBottom:"1px solid rgba(201,168,76,0.15)", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:"50%", background:`linear-gradient(135deg, ${C.teal}, ${C.tealLight})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🤖</div>
              <div>
                <div style={{ fontSize:14, fontWeight:800, color:C.cream }}>AI 상담 도우미</div>
                <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:C.green }} />
                  <span style={{ fontSize:10, color:"rgba(244,241,235,0.5)" }}>온라인 · 즉시 응답</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.08)", border:"none", width:30, height:30, borderRadius:"50%", cursor:"pointer", color:"rgba(244,241,235,0.6)", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          </div>

          {/* 역할 선택 */}
          <div style={{ padding:"24px 20px", flex:1, overflowY:"auto" }}>
            <div style={{ fontSize:15, fontWeight:800, color:C.cream, marginBottom:6 }}>어떤 상황이신가요?</div>
            <div style={{ fontSize:11, color:"rgba(244,241,235,0.45)", marginBottom:20, lineHeight:1.6 }}>상황에 맞는 전문 상담을 제공해 드립니다.</div>

            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[
                { id:"victim",  icon:"😟", title:"직장에서 힘든 일을 겪고 있어요", desc:"괴롭힘·부당한 대우를 경험 중", border:"rgba(13,115,119,0.4)", bg:"rgba(13,115,119,0.08)" },
                { id:"accused", icon:"😰", title:"제 행동이 문제가 됐어요", desc:"괴롭힘 가해자로 지목되거나 조사받고 계신 경우", border:"rgba(230,126,34,0.4)", bg:"rgba(230,126,34,0.08)" },
                { id:"hr",      icon:"🏢", title:"회사에서 사건을 다루고 있어요", desc:"HR·경영진·조사 담당자", border:"rgba(41,128,185,0.4)", bg:"rgba(41,128,185,0.08)" },
                { id:"general", icon:"🤔", title:"잘 모르겠어요 / 일반 상담", desc:"괴롭힘인지 아닌지부터 판단 필요", border:"rgba(201,168,76,0.4)", bg:"rgba(201,168,76,0.08)" },
              ].map(opt => (
                <button key={opt.id} onClick={() => selectRole(opt.id)} style={{
                  padding:"14px 16px", borderRadius:12, background:opt.bg, border:`1.5px solid ${opt.border}`,
                  cursor:"pointer", fontFamily:"inherit", textAlign:"left", transition:"all 0.2s",
                  display:"flex", alignItems:"flex-start", gap:12,
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.filter = "brightness(1.15)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.filter = ""; }}
                >
                  <span style={{ fontSize:22, flexShrink:0, marginTop:1 }}>{opt.icon}</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:C.cream, marginBottom:3 }}>{opt.title}</div>
                    <div style={{ fontSize:11, color:"rgba(244,241,235,0.5)", lineHeight:1.5 }}>{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // 채팅 화면 (역할 선택 완료)
  // ══════════════════════════════════════════════════════════════
  return (
    <div style={{ position:"fixed", inset:0, zIndex:10100, display:"flex", alignItems:"flex-end", justifyContent:"flex-end", padding:"0 24px 24px", pointerEvents:"none" }}>
      <div style={{ width:"min(400px, calc(100vw - 32px))", maxHeight:"90vh", background:C.navy, borderRadius:20, boxShadow:"0 24px 80px rgba(10,22,40,0.6)", border:`2px solid ${isAdminMode ? "rgba(201,168,76,0.5)" : `${hdrColor}55`}`, display:"flex", flexDirection:"column", pointerEvents:"all", overflow:"hidden" }}>
        {/* 헤더 */}
        <div style={{ padding:"16px 20px", background:isAdminMode ? "linear-gradient(135deg, #1A1200, #0A0A00)" : `linear-gradient(135deg, ${C.navyMid}, ${C.navy})`, borderBottom:`1px solid ${isAdminMode ? "rgba(201,168,76,0.25)" : "rgba(201,168,76,0.15)"}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {!isAdminMode && (
              <button onClick={goBack} style={{ background:"rgba(255,255,255,0.08)", border:"none", width:28, height:28, borderRadius:"50%", cursor:"pointer", color:"rgba(244,241,235,0.6)", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>←</button>
            )}
            <div style={{ width:36, height:36, borderRadius:"50%", background:isAdminMode ? `linear-gradient(135deg,${C.gold},#F5C842)` : `linear-gradient(135deg, ${hdrColor}, ${hdrColor}CC)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{cfg.icon}</div>
            <div>
              <div style={{ fontSize:14, fontWeight:800, color:C.cream }}>
                {cfg.label}
                {isAdminMode && <span style={{ marginLeft:8, fontSize:10, padding:"2px 7px", borderRadius:100, background:"rgba(201,168,76,0.2)", color:C.gold, border:"1px solid rgba(201,168,76,0.35)", fontWeight:700 }}>관리자</span>}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:C.green }} />
                <span style={{ fontSize:10, color:"rgba(244,241,235,0.5)" }}>{isAdminMode ? "전문 상담 모드 · 제한 없음" : "온라인 · 즉시 응답"}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.08)", border:"none", width:30, height:30, borderRadius:"50%", cursor:"pointer", color:"rgba(244,241,235,0.6)", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>

        {/* 메시지 영역 */}
        <div style={{ flex:1, overflowY:"auto", padding:"16px 16px 8px", display:"flex", flexDirection:"column", gap:12, minHeight:0 }}>
          {/* 피지목인 면책 고지 */}
          {showDisclaimer && (
            <div style={{ padding:"12px 14px", background:"rgba(230,126,34,0.1)", border:"1px solid rgba(230,126,34,0.3)", borderRadius:10, marginBottom:4 }}>
              <div style={{ fontSize:11, color:"rgba(244,241,235,0.7)", lineHeight:1.7 }}>
                ⚠️ 본 상담은 일반적 정보 제공이며, <strong style={{ color:C.cream }}>법적 자문이 아닙니다.</strong><br/>
                본 대화 내용은 분쟁 과정에서 증거로 사용될 수 있으니 <strong style={{ color:C.cream }}>작성에 신중</strong>을 기해주세요.<br/>
                구체적 사안은 <strong style={{ color:"#E67E22" }}>전문 노무사 검토 리포트(99,000원)</strong>를 권장합니다.
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start", gap:8, alignItems:"flex-start" }}>
              {m.role==="assistant" && (
                <div style={{ width:28, height:28, borderRadius:"50%", background:isAdminMode ? `linear-gradient(135deg,${C.gold},#F5C842)` : `linear-gradient(135deg,${hdrColor},${hdrColor}CC)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0, marginTop:2 }}>{cfg.icon}</div>
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
              <div style={{ width:28, height:28, borderRadius:"50%", background:isAdminMode ? `linear-gradient(135deg,${C.gold},#F5C842)` : `linear-gradient(135deg,${hdrColor},${hdrColor}CC)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>{cfg.icon}</div>
              <div style={{ padding:"11px 16px", background:"rgba(255,255,255,0.06)", borderRadius:"4px 16px 16px 16px", border:"1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ color:"rgba(244,241,235,0.5)", fontSize:13 }}>···</span>
              </div>
            </div>
          )}

          {/* 상담 유도 CTA */}
          {!isAdminMode && showCTA && (
            <div style={{ padding:"14px 16px", background:"rgba(201,168,76,0.1)", border:"1px solid rgba(201,168,76,0.3)", borderRadius:12, marginTop:4 }}>
              <div style={{ fontSize:12, fontWeight:800, color:C.gold, marginBottom:5 }}>💡 더 정확한 답변이 필요하신가요?</div>
              <div style={{ fontSize:11, color:"rgba(244,241,235,0.6)", lineHeight:1.65, marginBottom:10 }}>
                구체적인 사건 검토와 법적 전략은 AI로는 한계가 있습니다.<br/>전문 노무사와 무료 전화상담으로 정확한 방향을 확인하세요.
              </div>
              <button
                onClick={() => {
                  onClose();
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
            {cfg.quickQ.map(q => (
              <button key={q} onClick={() => { setInput(q); setTimeout(send, 50); }} style={{ padding:"6px 11px", borderRadius:100, background:isAdminMode ? "rgba(201,168,76,0.12)" : `${hdrColor}20`, border:`1px solid ${isAdminMode ? "rgba(201,168,76,0.3)" : `${hdrColor}55`}`, color:isAdminMode ? C.gold : C.cream, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>{q}</button>
            ))}
          </div>
        )}

        {/* 입력창 */}
        <div style={{ padding:"10px 16px 16px", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", gap:8, flexShrink:0 }}>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if(e.key==="Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder={isAdminMode ? "실무 질문을 입력하세요..." : "질문을 입력하세요..."} style={{ flex:1, padding:"10px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)", color:C.cream, fontSize:13, fontFamily:"inherit", outline:"none" }} />
          <button onClick={send} disabled={!input.trim()||loading} style={{ width:40, height:40, borderRadius:10, background:input.trim()&&!loading ? (isAdminMode ? C.gold : hdrColor) : "rgba(255,255,255,0.08)", border:"none", color: isAdminMode && input.trim() && !loading ? C.navy : "white", cursor:input.trim()&&!loading?"pointer":"not-allowed", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>➤</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ② 증거 수집 도우미
// ══════════════════════════════════════════════════════════════════════════════
