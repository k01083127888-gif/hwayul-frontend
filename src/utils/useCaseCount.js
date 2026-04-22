import { useState, useEffect } from "react";

// 판례DB 실제 건수를 백엔드에서 가져와서 반환 (실패 시 fallback)
// 표시 규칙: 100 단위로 내림한 값 + "건+" 형태 (예: 1,347건 → "1,300건+")
// 이렇게 하면 실제 건수가 조금 늘어도 한 줄 문구가 자주 안 바뀌어 UX 안정

const CACHE_KEY = "hwayul_case_count_cache";
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6시간

function floor100(n) {
  if (!n || n < 100) return 1000; // 너무 적으면 fallback
  return Math.floor(n / 100) * 100;
}

function format(n) {
  return n.toLocaleString("ko-KR") + "건+";
}

export function useCaseCount(fallback = 1000) {
  const [count, setCount] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (cached && cached.expiresAt > Date.now()) return cached.value;
    } catch {}
    return fallback;
  });

  useEffect(() => {
    let alive = true;
    fetch("https://hwayul-backend-production-96cf.up.railway.app/api/cases/count")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!alive || !data) return;
        const n = parseInt(data.count || data.total || 0, 10);
        if (!n) return;
        const floored = floor100(n);
        setCount(floored);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ value: floored, expiresAt: Date.now() + CACHE_TTL }));
        } catch {}
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  return { count, label: format(count) }; // label: "1,300건+"
}
