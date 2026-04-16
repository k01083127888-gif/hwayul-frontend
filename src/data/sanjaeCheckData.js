// ── 산재 상담 필요성 체크 데이터 ─────────────────────────────────────────
// "산재 상담이 필요한 상황인지 확인"

// 1단계: 어떤 상황인가요?
export const sanjaeTypeOptions = [
  { id:"st1", label:"직장 괴롭힘·스트레스로 정신적 증상이 생겼다 (우울·불안·공황 등)", weight:3, tag:"정신질환" },
  { id:"st2", label:"과로·야근·업무 강도로 건강이 악화됐다 (뇌심혈관·과로사 등)", weight:3, tag:"과로" },
  { id:"st3", label:"업무 수행 중 사고를 당했다 (낙상·충돌·부상 등)", weight:3, tag:"업무상 사고" },
  { id:"st4", label:"출퇴근 중 사고를 당했다", weight:2, tag:"출퇴근 재해" },
  { id:"st5", label:"업무로 인해 근골격계 질환이 생겼다 (허리·어깨·손목 등)", weight:2, tag:"근골격계" },
  { id:"st6", label:"잘 모르겠지만 업무와 관련된 건강 문제가 있다", weight:1, tag:"기타" },
];

// 2단계: 현재 상태는?
export const sanjaeMedicalOptions = [
  { id:"sm1", label:"병원에서 진단서를 발급받았다", weight:3 },
  { id:"sm2", label:"현재 병원 치료를 받고 있다", weight:2 },
  { id:"sm3", label:"입원하거나 휴직 중이다", weight:3 },
  { id:"sm4", label:"증상이 있지만 아직 병원을 가지 않았다", weight:1 },
  { id:"sm5", label:"이전에 치료받았으나 현재는 중단된 상태다", weight:1 },
];

// 3단계: 근무 환경은?
export const sanjaeWorkConditions = [
  { id:"sw1", label:"주당 52시간 이상 근무하고 있다 (또는 했다)", weight:2 },
  { id:"sw2", label:"야근·특근이 월 4회 이상이다 (또는 였다)", weight:1 },
  { id:"sw3", label:"상사·동료로부터 괴롭힘·폭언을 경험했다", weight:2 },
  { id:"sw4", label:"인사이동·권고사직 등 고용 불안을 겪었다", weight:1 },
  { id:"sw5", label:"사업장에서 유해물질·위험요인에 노출됐다", weight:2 },
  { id:"sw6", label:"교대근무·야간근무를 하고 있다 (또는 했다)", weight:1 },
];
