# WORKLOG — 독서논술 강사용 학생관리 웹

> 이 문서는 다음 세션에서 바로 이어서 작업할 수 있도록 현재 상태를 정리한 것입니다.
> 최종 업데이트: 2026-07-21 (코드베이스를 직접 훑어보고 작성함 — 대화 기록이 아닌 실제 파일 기준)

## 2026-07-21 추가 작업
- 반별 차시 진행도를 100% 기준 시각화하는 `src/components/ProgressBar.tsx` 신설 (재사용 컴포넌트)
- 반 목록 페이지(`ClassListPage`)에 "진도" 컬럼/모바일 카드 진도 바 추가
- 반 상세 진도표 페이지(`ClassCurriculumDetailPage`) 상단에 "진도율" 카드 추가 (퍼센트 + 바 + 완료 차시 수 텍스트)
- `tsc -b`, `oxlint` 통과 확인. 브라우저 확장(claude-in-chrome) 미설치로 실제 화면 스크린샷 확인은 못함 — 다음 세션에서 `npm run dev`로 육안 확인 권장.
- **git 저장소 초기화 및 GitHub 연결** — `github.com/badukprince/teacher_app.git` (main 브랜치, 초기 커밋 푸시 완료). `.claude/settings.local.json`은 개인 로컬 설정이라 `.gitignore`에 추가해 제외함. **앞으로는 요청 없이도 작업 단위별로 커밋한다** (사용자 지시).
- **수업평가 상세 페이지(`EvaluationDetailPage`) 인쇄 기능 추가** — "인쇄" 버튼(`window.print()`) 신설. 사이드바/헤더/수정·삭제 버튼 등 조작 UI는 `print:hidden`으로 인쇄 시 제외. 레이더차트+성장코멘트, 영역별 평가, 쓰기 평가 섹션은 `print:grid-cols-2`로 인쇄 시에도 2단 레이아웃 유지, 카드 내부가 페이지 경계에서 잘리지 않도록 `print:break-inside-avoid` 적용. `AppLayout`의 사이드바/모바일 헤더도 `print:hidden` 처리, `main` 여백은 `print:p-0`으로 제거. `vite build` 정상 통과 확인.
- **인쇄 후속 수정 (사용자 피드백: 1장에 맞추기 + 로고 제거)**
  - `AppLayout` 사이드바/모바일 헤더의 `print:hidden`이 `md:flex`와 같은 우선순위라 데스크톱 너비에서 인쇄하면 로고가 다시 노출되던 버그 발견 → `print:!hidden`(important)으로 교체해 확실히 숨김.
  - 쓰기 평가 섹션을 강제로 새 페이지에서 시작시키던 `print:break-before-page` 제거 (1장에 맞추려면 불필요한 페이지 분할이었음).
  - `src/index.css`에 `@media print { @page { size: A4; margin: 10mm 12mm } html { font-size: 13px } }` 추가로 인쇄 시 전체적으로 압축.
  - `EvaluationDetailPage` 전반에 `print:p-*`, `print:text-*`, `print:gap-*`, `print:mt-*` 축소 클래스 다수 적용 (카드 패딩/폰트/여백 압축).
  - `RadarChart`의 svg에 `print:w-[190px] print:h-[190px]` 추가해 인쇄 시 레이더 차트 축소 (viewBox 덕분에 비율 유지된 채 스케일링).
  - 쓰기 평가 이미지에 `print:max-h-[220px]` 추가해 인쇄 시 이미지 높이 제한.
  - 참고: 브라우저가 자체적으로 붙이는 인쇄 머리말/꼬리말(문서 제목 "독서논술 강사 매니저", URL, 날짜, 페이지 번호)은 페이지 코드로 제어 불가 — 사용자가 인쇄 대화상자에서 "머리글과 바닥글" 옵션을 꺼야 함. 사용자가 언급한 "로고"는 이 브라우저 기본 머리말이 아니라 사이드바 로고였던 것으로 확인(위 버그).

## 프로젝트 개요
- 독서논술 학원 강사가 학생을 관리하는 웹앱 (관리자/강사 1인용으로 보임)
- Stack: React 19 + TypeScript + Vite + react-router-dom v7 + Tailwind CSS v4
- 별도 백엔드 없음 — **localStorage에 전부 저장** (`src/lib/storage.ts`, key prefix `ronsul.*.v1`)
- git 저장소 아님 (`git init` 안 되어 있음) — 버전 관리 필요하면 먼저 세팅해야 함
- 실행: `npm run dev` / 빌드: `npm run build` / 린트: `npm run lint` (oxlint)

## 전체 아키텍처
- `src/store/AppDataContext.tsx` — 앱 전체의 단일 데이터 소스. students/classes/textbooks/evaluations/notifications를 상태로 들고 있고, 각 변경 시 localStorage에 자동 저장(useEffect). CRUD 함수들을 컨텍스트로 노출 (`useAppData()` 훅으로 사용).
- `src/data/seedData.ts` — localStorage가 비어있을 때 쓰는 초기 목업 데이터.
- `src/lib/navigation.ts` — 사이드바 메뉴 8개 정의 (대시보드/학생관리/수업·커리큘럼/수업평가/출결관리/학부모 소통/자료실/마이페이지·설정).
- `src/App.tsx` — 라우트 정의. `AppLayout` 안에 전체 페이지 중첩.

## 기능별 구현 상태

### ✅ 완성된 기능
1. **대시보드** (`pages/Dashboard.tsx`) — 학생 수 통계(재원/휴원/퇴원), 반별 인원 요약. 단순하지만 동작함.
2. **학생관리** — 목록/등록/수정/상세 전부 구현.
   - `StudentListPage`, `StudentFormPage`(320줄, 등록/수정 겸용), `StudentDetailPage`
   - 상세 페이지에 탭 5개: 기본정보, 학부모연락처, 독서이력, 피드백이력, 출결이력, 상담이력 (`pages/students/tabs/*`)
   - 학부모 연락처는 여러 명 등록 가능 (`ParentContact[]`, `isPrimary` 플래그)
3. **수업평가 (핵심 기능, 가장 공들인 부분)**
   - 평가 영역: 듣기/읽기/말하기/생각하기는 **상·중·하 등급** 방식, 쓰기만 별도로 **이미지 업로드 + AI 분석(목업) + 영역별 점수**
   - `src/lib/evaluationConfig.ts` — 영역별 세부 평가 기준(가중치 포함) 하드코딩, 점수 계산 로직(`subjectScore`, `overallScore`), 지난 평가 대비 성장 코멘트 자동 생성(`buildGrowthComment`)
   - **AI 분석은 진짜 AI가 아니라 seeded random 목업** (`runMockAiAnalysis`) — 이미지를 실제로 분석하지 않고 그럴듯한 코멘트/점수를 생성만 함. 나중에 실제 AI 연동 필요하면 여기가 진입점.
   - `EvaluationFormPage`(404줄, 최대 규모 파일), `EvaluationHistoryPage`, `EvaluationDetailPage`, `RatingSubjectCard`, `RadarChart`(레이더 차트 시각화)
   - 이미지 리사이즈 유틸 `src/lib/imageUtils.ts` (업로드 이미지를 canvas로 리사이즈 후 base64 dataURL로 저장 — localStorage 용량 고려한 것으로 보임)
4. **수업/커리큘럼**
   - `ClassListPage`(반 목록/등록), `TextbookLibraryPage`(교재 라이브러리), `ClassCurriculumDetailPage`(반별 차시 진도표 — 추가/수정/삭제/순서변경/완료토글 전부 구현)
5. **학부모 소통**
   - `ConsultationLogPage` — 상담일지
   - `NotificationSendListPage`, `NotificationDetailPage` — 알림 발송(이메일/카카오톡 채널 선택), 발송 이력 로그
   - `src/lib/notificationTemplates.ts` — 출결/수업진도/수업평가/종합 4종류 알림 문구를 학생 데이터 기반으로 **자동 생성**하는 템플릿 엔진. 실제 발송(이메일 API, 카카오 API 연동)은 안 되어 있고 로그만 남기는 것으로 보임 — 발송 자체는 목업일 가능성 높음, 확인 필요.

### 🚧 미구현 (플레이스홀더만 있음)
- `/attendance` **출결관리** — 별도 메뉴는 있지만 `PlaceholderPage`만 연결됨. 단, 학생 상세 탭 안에는 `AttendanceHistoryTab` + `AttendanceRecord` 타입/CRUD 함수(`addAttendanceRecord` 등)가 이미 존재함. 즉 **데이터 모델과 학생별 이력 관리는 있는데, 반 전체를 한눈에 보는 출결관리 메인 화면이 없는 상태.**
- `/resources` **자료실** — `PlaceholderPage`만 있음. 타입/데이터 모델 자체가 없음.
- `/settings` **마이페이지/설정** — `PlaceholderPage`만 있음.

## 확인이 필요한 부분 (다음 세션에서 물어볼 것)
- 알림 발송(`communication`)이 실제로 이메일/카카오톡을 보내는지, 아니면 로그만 남기는 목업인지 — 코드상으로는 외부 API 연동 흔적이 안 보여서 목업으로 추정됨
- AI 글쓰기 분석(`runMockAiAnalysis`)을 실제 AI(예: Claude API)로 교체할 계획이 있는지
- 출결관리(`/attendance`), 자료실(`/resources`), 설정(`/settings`) 중 다음에 어떤 걸 먼저 만들지

## 알려진 이슈 / 주의사항
- 데이터는 전부 localStorage — 브라우저 캐시 삭제 시 모든 데이터 유실. 백업/내보내기 기능 없음.
- 코드에 TODO/FIXME 주석은 없음 (검색해봤지만 0건) — 미완성 여부는 라우팅과 파일 존재 여부로만 판단 가능.
- git 저장소가 아니라서 변경 이력 추적이 안 됨. 작업량이 늘어나면 git init 권장.

## 다음에 이어서 하면 좋을 후보
1. 출결관리 메인 페이지 구현 (데이터 모델은 이미 있으므로 반별/날짜별 뷰만 만들면 됨)
2. 자료실 기능 설계부터 필요 (타입 정의 없음)
3. 알림 발송을 실제 이메일/카카오 API와 연동할지 결정
