// ── 입력값 검증 유틸 ─────────────────────────────────────────────────────────
export const isValidEmail = v =>
  v && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export const isValidPhone = v =>
  v && /^\d{9,11}$/.test(v.replace(/[^0-9]/g, ""));
