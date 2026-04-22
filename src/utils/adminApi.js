// 관리자 전용 API 헬퍼 — 모든 관리 요청에 x-admin-key 헤더 자동 첨부
// 관리자 로그인 성공 시 setAdminKey(pw)로 sessionStorage에 저장, 로그아웃 시 clear
// 백엔드는 Railway 환경변수 ADMIN_API_KEY와 헤더 값을 비교해 권한 판정

const SESSION_KEY = "hwayul_admin_key";

export function setAdminKey(key) {
  try {
    if (key) sessionStorage.setItem(SESSION_KEY, key);
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {}
}

export function getAdminKey() {
  try { return sessionStorage.getItem(SESSION_KEY) || ""; } catch { return ""; }
}

export function clearAdminKey() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch {}
}

// fetch 래퍼 — 관리자 키 자동 첨부. 다른 사용법은 표준 fetch와 동일.
// 401 응답 시 키를 삭제하고 페이지 새로고침(로그인 화면으로 돌아가도록).
export async function adminFetch(url, options = {}) {
  const key = getAdminKey();
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
    headers.set("Content-Type", "application/json");
  }
  if (key) headers.set("x-admin-key", key);
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    console.warn("관리자 권한 만료·키 불일치 → 로그아웃");
    clearAdminKey();
    // 관리자 페이지일 때만 새로고침
    if (typeof window !== "undefined" && window.location.hash === "#/admin") {
      setTimeout(() => window.location.reload(), 100);
    }
  }
  return res;
}
