# Q인사이드 — 리팩토링된 폴더 구조

원래 하나의 거대한 파일(6,684줄)을 목적에 따라 **40개 파일**로 분리했습니다.

---

## 📁 전체 폴더 구조

```
src/
├── index.jsx                     # 앱 진입점 (React 루트 마운트)
├── App.jsx                       # 최상위 App 컴포넌트
│
├── tokens/
│   └── colors.js                 # 🎨 디자인 토큰 (색상 상수 C)
│
├── data/                         # 📦 정적 데이터 (바뀌지 않는 원본 데이터)
│   ├── mockNews.js               # 뉴스·판례·자료 목록 (32개 아이템)
│   ├── contentDetails.js         # 각 콘텐츠 상세 본문 내용
│   ├── memberData.js             # 전문가(노무사) 프로필 기본 데이터
│   └── checklistData.js          # 진단 체크리스트 항목 (요건·행위·피해 데이터)
│
├── utils/                        # 🔧 유틸리티 함수 (순수 로직)
│   ├── storage.js                # localStorage 읽기/쓰기 함수 모음
│   ├── store.js                  # 전역 상태 저장소 (useStore, addSubmission)
│   ├── validators.js             # 이메일·전화번호 유효성 검사
│   ├── calcResult.js             # 진단 점수 계산 로직
│   └── printTemplates.js         # 결과 보고서 HTML 생성 함수
│
├── components/                   # 🧩 재사용 가능한 UI 컴포넌트
│   ├── common/                   # 여러 곳에서 공통으로 쓰이는 작은 컴포넌트
│   │   ├── FormElements.jsx      # Input, DarkInput, SectionTag, DarkSectionTag
│   │   ├── ValidationMsg.jsx     # 폼 에러 메시지
│   │   ├── PrivacyPolicyModal.jsx # 개인정보 처리방침 모달
│   │   └── PrivacyConsent.jsx    # 개인정보 동의 체크박스
│   │
│   ├── Nav.jsx                   # 상단 네비게이션 바 (PC/모바일 반응형)
│   ├── PrintModal.jsx            # 진단 결과 출력·이메일 발송 모달
│   ├── ReportForm.jsx            # 노무사 검토 리포트 신청 폼
│   ├── FreeConsultBanner.jsx     # 무료 상담 신청 배너
│   ├── ContentDetailView.jsx     # 콘텐츠 상세 보기 화면
│   ├── SideRequestPanel.jsx      # 플로팅 빠른 상담 신청 패널
│   ├── NewsletterSection.jsx     # 뉴스레터 구독 섹션
│   ├── NewFeaturesHub.jsx        # AI 도구 모음 플로팅 버튼
│   ├── AIChatBot.jsx             # AI 챗봇 (Anthropic API 연동)
│   ├── EvidenceHelper.jsx        # 증거 수집 도우미
│   ├── WorkersCompCalculator.jsx # 산재 급여 계산기
│   ├── TimelineRecorder.jsx      # 괴롭힘 타임라인 기록기
│   ├── ComplianceChecker.jsx     # 기업 법적 의무 체크리스트
│   ├── AdminEmailComposer.jsx    # 관리자 이메일 발송 도구
│   └── AdminStats.jsx            # 관리자 통계 차트 컴포넌트들
│
└── pages/                        # 📄 각 탭에 해당하는 전체 화면
    ├── HeroSection.jsx           # 홈 화면 (히어로 + 통계 + CTA)
    ├── IntroSection.jsx          # 소개 화면 (서비스 소개 + 전문가 프로필)
    ├── ContentSection.jsx        # 콘텐츠 화면 (뉴스·판례·자료 목록)
    ├── ChecklistSection.jsx      # 진단 체크리스트 화면
    ├── CultureSection.jsx        # 조직문화 진단 화면
    ├── ReportSection.jsx         # 익명 제보 화면
    ├── BizSection.jsx            # 기업 상담 화면
    ├── ReliefSection.jsx         # 피해자 구제 신청 화면
    └── AdminSection.jsx          # 관리자 페이지
```

---

## 🔗 의존성 흐름 (어떤 파일이 무엇을 사용하는가)

```
tokens/colors.js          ← 거의 모든 파일이 사용
data/*.js                 ← utils/store.js, 각 페이지가 사용
utils/storage.js          ← utils/store.js가 사용
utils/store.js            ← 폼이 있는 거의 모든 컴포넌트가 사용
utils/validators.js       ← 폼이 있는 컴포넌트가 사용
utils/calcResult.js       ← pages/ChecklistSection.jsx가 사용
utils/printTemplates.js   ← pages/ChecklistSection, CultureSection이 사용
components/common/*       ← 폼이 있는 대부분의 컴포넌트가 사용
components/*              ← pages/* 와 App.jsx가 사용
pages/*                   ← App.jsx가 사용
```

---

## 🚀 사용 방법 (Vite 기준)

```bash
npm create vite@latest hwayulinside -- --template react
cd hwayulinside
# 기존 src/ 폴더를 이 폴더로 교체
npm install
npm run dev
```

---

## ⚠️ 주의사항

- `contentDetails.js`의 객체는 `utils/store.js`에서 localStorage 데이터로 덮어쓰여 관리자 수정사항이 유지됩니다.
- AI 기능은 모두 `/api/claude` 백엔드 엔드포인트를 통해 호출됩니다. `ANTHROPIC_API_KEY`는 **프론트엔드 코드에 절대 입력하지 마세요.** 반드시 백엔드(`hwayul-backend`) 폴더의 `.env` 파일에서만 관리하세요.
- 각 파일의 `export` 방식: 대부분 named export를 사용하므로, import 시 `{ }` 중괄호를 사용하세요.  
  예: `import { calcResult } from "../utils/calcResult.js";`
