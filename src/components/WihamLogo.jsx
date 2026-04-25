// ── WIHAM 로고 SVG 컴포넌트 ────────────────────────────────────────────────
// 디자인:
//  - 모던 산세리프 (Helvetica Bold 스타일) Extra Bold (font-weight 900)
//  - letter-spacing 매우 좁음 → 하나의 덩어리 같은 느낌
//  - mask 태그로 사선 컷의 네거티브 스페이스 적용 (직접 stroke 그리지 않음)
//    → 절단면이 뭉개지지 않고 날카롭게 잘려나간 모습
//
// Props:
//  - width / height
//  - color: 글자 색
//  - showCuts: 사선 컷 ON/OFF
//  - uniqueId: 한 페이지에 여러 인스턴스 시 ID 충돌 방지
export function WihamLogo({
  width = 600,
  height,
  color = "#FFFFFF",
  showCuts = false,           // 기본값: 컷 없는 깔끔한 워드마크
  uniqueId = "wiham",
  className = "",
  style = {},
}) {
  const VW = 800, VH = 400;
  const computedHeight = height || (width * VH) / VW;

  const maskId = `${uniqueId}-slashMask`;

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width={width}
      height={computedHeight}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      role="img"
      aria-label="WIHAM"
    >
      <defs>
        {/* ── 사선 컷: 날카로운 '검기(劍氣)' 마스크 ───────────────────
             컷 1: 글자 전체를 깊게 베는 메인 사선 (각도 약 -40도)
             컷 2: 컷 1과 교차하는 서브 사선 (각도 약 25도)
             네거티브 스페이스(black)가 글자를 파내며 단면이 날카롭게 노출됨 */}
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={VW} height={VH}>
          <rect x="0" y="0" width={VW} height={VH} fill="white" />
          {showCuts && (
            <>
              {/* 컷 1 — W 우측 상단 (↘, 짧은 슬라이스) */}
              <polygon points="155,80 230,230 244,216 169,66" fill="black" />
              {/* 컷 2 — A 좌측 상단 (↘, 컷 1과 같은 방향·평행) */}
              <polygon points="400,80 475,230 489,216 414,66" fill="black" />
            </>
          )}
        </mask>
      </defs>

      {/* 모던 산세리프 Extra Bold 텍스트 + mask로 절단 */}
      <text
        x={VW / 2}
        y="290"
        textAnchor="middle"
        fontFamily="'Inter', 'Helvetica Neue', 'Helvetica', 'Arial Black', 'Pretendard', 'Noto Sans KR', sans-serif"
        fontWeight="900"
        fontSize="220"
        letterSpacing="-8"
        fill={color}
        mask={`url(#${maskId})`}
      >
        WIHAM
      </text>
    </svg>
  );
}

export default WihamLogo;
