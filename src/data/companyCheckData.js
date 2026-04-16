// ── 사내 괴롭힘 조사 필요성 체크 데이터 ─────────────────────────────────
// "우리 회사가 외부 조사를 의뢰해야 하는 상황인지 확인"

// 1단계: 신고 접수 현황
export const companyReportStatus = [
  { id:"cr1", label:"정식 서면 신고가 접수됐다", weight:3 },
  { id:"cr2", label:"구두로 괴롭힘 호소를 받았다", weight:2 },
  { id:"cr3", label:"익명 제보가 들어왔다", weight:2 },
  { id:"cr4", label:"퇴사자가 괴롭힘을 사유로 언급했다", weight:2 },
  { id:"cr5", label:"고용노동부에서 조사 통보가 왔다", weight:3 },
  { id:"cr6", label:"아직 신고는 없지만 갈등 징후가 있다", weight:1 },
];

// 2단계: 조직 상황
export const companyOrgStatus = [
  { id:"co1", label:"사내 고충처리위원회(담당자)가 없거나 형식적이다", weight:2 },
  { id:"co2", label:"신고인과 피신고인이 같은 부서이다", weight:2 },
  { id:"co3", label:"피신고인이 경영진·임원이다", weight:3 },
  { id:"co4", label:"이전에도 유사 사건이 있었다 (반복)", weight:2 },
  { id:"co5", label:"사건이 외부에 알려질 가능성이 있다 (언론·SNS)", weight:2 },
  { id:"co6", label:"신고인이 2차 피해(보복)를 호소하고 있다", weight:3 },
];

// 3단계: 현재 조치 상태
export const companyCurrentActions = [
  { id:"ca1", label:"당사자 분리 조치를 아직 하지 않았다", weight:2 },
  { id:"ca2", label:"조사 착수까지 10일이 넘었다 (또는 넘을 예정)", weight:3 },
  { id:"ca3", label:"조사를 누가 해야 하는지 모르겠다", weight:2 },
  { id:"ca4", label:"조사보고서 작성 방법을 모르겠다", weight:2 },
  { id:"ca5", label:"징계 수위 결정이 어렵다", weight:1 },
  { id:"ca6", label:"취업규칙에 괴롭힘 관련 규정이 없거나 부실하다", weight:2 },
];
