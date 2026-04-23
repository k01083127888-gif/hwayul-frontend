// AI 상담 → 심층상담(BizSection) 브리지
// 사용자가 AI 상담 중 "심층상담 신청" 클릭 시 대화 내용을 넘겨준다
// BizSection에서 이를 읽어 표시·제출 데이터에 포함
// 관리자 상세보기에서도 조회 가능

const KEY = "hwayul_last_ai_chat";
const TTL_MS = 60 * 60 * 1000; // 1시간 유효

export function saveAIChat({ source, topic, messages }) {
  try {
    if (!messages || messages.length <= 1) return;
    localStorage.setItem(KEY, JSON.stringify({
      source: source || "ai",            // "ai" | "diagnosis"
      topic: topic || "",                 // 역할·주제 (피해자/피지목인/산재/사내조사)
      messages,                           // [{role:"user"|"assistant", text}]
      savedAt: Date.now(),
      expiresAt: Date.now() + TTL_MS,
    }));
  } catch {}
}

export function readAIChat() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || !obj.expiresAt || obj.expiresAt < Date.now()) {
      localStorage.removeItem(KEY);
      return null;
    }
    return obj;
  } catch { return null; }
}

export function clearAIChat() {
  try { localStorage.removeItem(KEY); } catch {}
}

// 사람이 읽기 쉬운 문자열로 변환 (관리자 표시·이메일용)
export function chatToPlainText(chat) {
  if (!chat || !Array.isArray(chat.messages)) return "";
  return chat.messages.map(m => {
    const who = m.role === "assistant" ? "[AI]" : "[고객]";
    return `${who} ${m.text}`;
  }).join("\n\n");
}
