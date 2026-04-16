// ── 피지목인 자가진단 데이터 ─────────────────────────────────────────────
// "내 행동이 괴롭힘에 해당하는가?" 체크리스트

// 1단계: 관계 확인
export const accusedRelationItems = [
  { id:"ar1", label:"직속 부하직원이다", weight:3 },
  { id:"ar2", label:"같은 부서 후배이다", weight:2 },
  { id:"ar3", label:"같은 직급 동료이다", weight:1 },
  { id:"ar4", label:"다른 부서 직원이다", weight:1 },
  { id:"ar5", label:"나보다 상급자·선임이다", weight:0 },
];

export const accusedSuperiorityItems = [
  { id:"as1", label:"직급·직책이 상대방보다 높다", weight:2 },
  { id:"as2", label:"입사 연차가 상대방보다 많다", weight:1 },
  { id:"as3", label:"업무 지시·평가 권한이 있다", weight:2 },
  { id:"as4", label:"인사·승진에 영향력이 있다", weight:2 },
  { id:"as5", label:"다수의 지지를 받는 위치이다", weight:1 },
];

// 2단계: 행위 유형 (내가 한 행동)
export const accusedBehaviorCategories = [
  { id:"ab1", category:"언어적 행위", icon:"💬", color:"#E74C3C",
    items:[
      { id:"ab1-1", text:"큰 소리로 질책하거나 호통을 친 적이 있다", weight:3 },
      { id:"ab1-2", text:"인격을 비하하는 표현(욕설·모욕 포함)을 사용한 적이 있다", weight:3 },
      { id:"ab1-3", text:"다른 직원들 앞에서 공개적으로 비난한 적이 있다", weight:3 },
      { id:"ab1-4", text:"능력·외모·성격 등에 대해 부정적 발언을 한 적이 있다", weight:2 },
    ]},
  { id:"ab2", category:"업무 관련 행위", icon:"📋", color:"#E67E22",
    items:[
      { id:"ab2-1", text:"능력에 비해 과도한 업무를 부여한 적이 있다", weight:2 },
      { id:"ab2-2", text:"업무를 주지 않거나 의미 없는 일만 시킨 적이 있다", weight:2 },
      { id:"ab2-3", text:"회의·보고에서 의도적으로 배제한 적이 있다", weight:2 },
      { id:"ab2-4", text:"합리적 사유 없이 담당 업무를 변경한 적이 있다", weight:2 },
    ]},
  { id:"ab3", category:"대인관계 행위", icon:"👥", color:"#2980B9",
    items:[
      { id:"ab3-1", text:"의도적으로 무시하거나 대화를 거부한 적이 있다", weight:2 },
      { id:"ab3-2", text:"회식·모임에서 배제한 적이 있다", weight:1 },
      { id:"ab3-3", text:"험담이나 뒷담화를 한 적이 있다", weight:2 },
      { id:"ab3-4", text:"사적 심부름이나 개인 용무를 지시한 적이 있다", weight:2 },
    ]},
  { id:"ab4", category:"기타 행위", icon:"⚠️", color:"#8E44AD",
    items:[
      { id:"ab4-1", text:"퇴근 후·휴일에 업무 연락을 반복적으로 한 적이 있다", weight:1 },
      { id:"ab4-2", text:"사생활에 대해 과도하게 간섭한 적이 있다", weight:2 },
      { id:"ab4-3", text:"신체적 접촉이나 위협적 행동을 한 적이 있다", weight:3 },
    ]},
];

// 3단계: 업무 적정성 판단
export const accusedJustificationQuestions = [
  {
    id:"aj1",
    question:"해당 행위가 업무 수행에 필요한 것이었나요?",
    options:[
      { id:"aj1-1", label:"업무상 반드시 필요했다", weight:0 },
      { id:"aj1-2", label:"어느 정도 필요했지만 다른 방법도 있었다", weight:1 },
      { id:"aj1-3", label:"업무와 관련은 있지만 과도했다고 생각한다", weight:2 },
      { id:"aj1-4", label:"업무와 무관한 개인적 감정이었다", weight:3 },
    ],
  },
  {
    id:"aj2",
    question:"같은 내용을 다른 방법(메일, 1:1 면담 등)으로 전달할 수 있었나요?",
    options:[
      { id:"aj2-1", label:"그 방법밖에 없었다 (긴급 상황 등)", weight:0 },
      { id:"aj2-2", label:"다른 방법이 있었지만 습관적으로 그렇게 했다", weight:1 },
      { id:"aj2-3", label:"다른 방법이 있었는데 감정적으로 대응했다", weight:3 },
    ],
  },
  {
    id:"aj3",
    question:"회사 내 다른 관리자도 유사한 방식으로 지시하나요?",
    options:[
      { id:"aj3-1", label:"조직 전체가 비슷한 문화다", weight:0 },
      { id:"aj3-2", label:"일부 관리자만 그렇다", weight:1 },
      { id:"aj3-3", label:"나만 그렇게 한다", weight:2 },
    ],
  },
];

// 4단계: 반복성·지속성
export const accusedRepetitionQuestions = [
  {
    id:"ar_rep",
    question:"해당 행위가 얼마나 지속됐나요?",
    options:[
      { id:"ar_rep-1", label:"1회성 (특정 상황에서 한 번)", weight:0 },
      { id:"ar_rep-2", label:"2~3회 반복", weight:1 },
      { id:"ar_rep-3", label:"수개월간 지속", weight:2 },
      { id:"ar_rep-4", label:"6개월 이상 장기간", weight:3 },
    ],
  },
  {
    id:"ar_react",
    question:"상대방이 불편함을 표현한 적이 있나요?",
    options:[
      { id:"ar_react-1", label:"있고, 그 이후 행동을 고쳤다", weight:0 },
      { id:"ar_react-2", label:"있었지만, 계속했다", weight:3 },
      { id:"ar_react-3", label:"표현한 적 없다 (몰랐다)", weight:1 },
      { id:"ar_react-4", label:"표현했지만 정당한 업무지시라 무시했다", weight:2 },
    ],
  },
];

// 5단계: 상대방 영향도
export const accusedImpactItems = [
  { id:"ai1", text:"상대방이 병가·휴직을 사용했다", weight:3 },
  { id:"ai2", text:"상대방이 정신과 진료·상담을 받았다", weight:3 },
  { id:"ai3", text:"상대방이 부서 이동을 요청했다", weight:2 },
  { id:"ai4", text:"상대방이 퇴사를 고려하거나 실제 퇴사했다", weight:3 },
  { id:"ai5", text:"상대방의 업무 성과가 눈에 띄게 저하됐다", weight:1 },
  { id:"ai6", text:"위와 같은 영향은 없었다 (또는 모르겠다)", weight:0 },
];
