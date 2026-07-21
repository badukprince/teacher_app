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
- **학생 상태(재원/휴원/퇴원) 원터치 변경 기능** — 새 컴포넌트 `src/components/StatusToggle.tsx`: 기존 읽기 전용 `StatusBadge`와 같은 배지 스타일이지만 내부가 `<select>`라 클릭 한 번으로 상태 변경 가능. 학생관리 목록 페이지(데스크톱 테이블 + 모바일 카드)와 학생 상세 페이지 헤더에 적용, `updateStudent` 즉시 호출. 모바일 카드는 전체가 `<Link>`라 `<select>`를 그대로 중첩하면 잘못된 HTML(인터랙티브 요소 중첩)이 되므로, Link를 카드 전체를 덮는 `absolute inset-0` 스트레치 링크로 바꾸고 텍스트 영역은 `pointer-events-none`, 상태 토글만 `pointer-events-auto relative z-10`으로 감싸 클릭이 충돌 없이 분리되게 처리. `EvaluationHistoryPage`의 읽기 전용 `StatusBadge`는 그대로 둠(수업평가 화면이라 범위 밖).
- **출결관리 신설** (`/attendance`, `/attendance/history`) — 반+날짜 선택 후 학생별 출석/지각/조퇴/결석 원터치 토글(`AttendanceCheckPage`), 월별 캘린더/리스트 이력 조회(`AttendanceHistoryPage`). `AppDataContext.setAttendanceStatus`로 학생·날짜당 1건만 유지되는 upsert 처리(같은 상태 재클릭 시 삭제). 상태 배지 색상은 `src/lib/attendanceStyles.ts`로 공통화(기존 `AttendanceHistoryTab` 중복 스타일도 이걸로 교체). `todayISO()`는 `src/lib/date.ts`로 공통화.
- **대시보드 확장** — 오늘의 수업 일정 / 미처리 업무 알림 / 담당 학생 현황(신규·퇴원 이번 달 집계) 3개 섹션 추가.
  - **반 스케줄 데이터 모델 변경** — `SchoolClass.schedule?: string`(자유 텍스트) → `daysOfWeek: Weekday[]` + `time?: string` + `location: '오프라인'|'온라인'`(필수)로 교체. "오늘의 수업"을 실제로 필터링하려면 구조화된 요일 데이터가 필요해서 변경함. `src/lib/classSchedule.ts`에 `isClassToday`, `formatClassSchedule`(표시용 문자열 생성), `todayWeekday`, `WEEKDAY_FULL_LABEL` 추가. `ClassListPage` 폼을 요일 체크박스+시간+장소로 교체, `ClassCurriculumDetailPage`/대시보드 표시부도 갱신. `StudentFormPage`의 "빠른 반 추가" 미니폼도 새 필드에 맞춰 수정(요일/장소는 나중에 반 목록에서 설정하도록 안내 문구 추가).
  - **⚠️ localStorage 마이그레이션 처리 필요했음** — 이미 브라우저에 저장된 예전 형식 반 데이터(`daysOfWeek`/`location` 없음)를 그대로 불러오면 `formatClassSchedule`에서 런타임 에러가 날 수 있어서, `AppDataContext`의 클래스 로드 시 `daysOfWeek: c.daysOfWeek ?? []`, `location: c.location ?? '오프라인'` 기본값을 채우는 방어 코드 추가 (기존 `sessions ?? []` 패턴과 동일한 방식). `NotificationLog.answered`도 동일하게 `?? false` 기본값 처리.
  - **첨삭 대기 건수** = 쓰기 이미지가 업로드됐지만 아직 영역별 점수가 없는 평가 건수(`evaluation.writing.domainScores.length === 0`).
  - **오늘 출결 미입력** = 오늘 수업이 있는 반의 재원 학생 중 오늘 날짜 출결 기록이 없는 인원 수.
  - **학부모 미답변 메시지** — 기존 알림 발송은 발신 전용 로그라 "답변" 개념 자체가 없어서, `NotificationLog`에 `answered: boolean` 필드와 `markNotificationAnswered` 액션을 새로 추가함. `NotificationDetailPage` 발송 이력에 답변대기/답변완료 배지 + 수동 토글 버튼 추가(자동 감지 아님, 강사가 직접 표시). `NotificationSendListPage` 카드에도 답변대기 배지 표시.
  - **신규/퇴원(이번 달)**은 정확한 "등록일/퇴원일" 필드가 없어서 `createdAt`(신규)과 `updatedAt`(퇴원, 상태 변경 시점 proxy)을 이번 달 기준으로 집계한 근사치임 — 정확도가 중요해지면 별도 필드 고려 필요.
  - `npx tsc -b`, `npx vite build` 통과 확인. `npx oxlint src` 실행 중 **`StudentFormPage.tsx`에서 기존부터 있던 버그 발견**: `isEdit && !existing`일 때 이른 return이 이후 `useState` 호출들보다 먼저 실행돼서 React Hooks 규칙(rules-of-hooks) 위반. 최초 커밋 때부터 있던 문제 — **이후 세션에서 수정 완료** (아래 참고).

## Supabase 백엔드 마이그레이션 + Vercel 배포 준비 (같은 날, 후속 세션)
localStorage만으로는 실사용이 불가능해서(한 브라우저에만 저장, 캐시 지우면 유실) Supabase(Postgres+Auth)를 백엔드로, Vercel을 배포처로 붙이는 대규모 작업 진행. 계획은 `EnterPlanMode`로 세우고 Plan 서브에이전트 리뷰를 거침 (`C:\Users\PC\.claude\plans\noble-riding-pumpkin.md`에 계획 원문 남아있음).

**확정된 설계 원칙**
- 인증은 지금은 강사 본인 1명만, 로그인 UI만 있고 공개 회원가입 없음(계정은 Supabase 대시보드에서 수동 생성). 단 모든 테이블에 `teacher_id`를 넣어 나중에 여러 강사로 확장 가능하게 설계.
- `teacher_id`는 클라이언트를 신뢰하지 않음 — `BEFORE INSERT` 트리거가 서버에서 강제로 채움(최상위 테이블은 `auth.uid()`, 자식 테이블은 부모 행에서 조회). RLS `WITH CHECK`가 이중 방어.
- 기존 localStorage 데이터(테스트용 목업)는 이전하지 않고 새로 시작하기로 함 → `src/data/seedData.ts` 삭제.
- **`useAppData()`를 쓰는 21개 페이지 파일은 한 글자도 안 건드림** — `AppDataContext`가 밖으로 노출하는 모양(배열 5개 + 함수 ~27개)을 그대로 유지하고, 내부 구현만 localStorage → Supabase로 교체. 로컬 state를 낙관적으로 먼저 갱신하고 백그라운드로 Supabase에 반영, 실패하면 배너 띄우고 전체 재조회로 동기화.

**변경/신규 파일**
- `supabase/schema.sql` — 전체 DDL 한 파일(11개 테이블, RLS, `teacher_id` 자동 채우기 트리거, `attendance_records`엔 `unique(student_id, date)`, `curriculum_sessions`엔 순서용 `position` 컬럼). **아직 실행 안 됨 — 사용자가 Supabase SQL Editor에 붙여넣고 직접 실행해야 함.**
- `src/lib/supabaseClient.ts`, `src/lib/supabaseMappers.ts`(11개 테이블 fetch 후 기존 camelCase 중첩 타입으로 재조립), `src/store/AuthContext.tsx`(세션/로딩/로그인/로그아웃 — 새로고침 시 로그인 화면 깜빡임 방지를 위해 `loading` 상태 분리), `src/pages/LoginPage.tsx`(회원가입 UI 없음), `src/vite-env.d.ts`, `.env.example`, `vercel.json`(React Router SPA rewrite)
- `src/store/AppDataContext.tsx` 내부 전체 재작성 (인터페이스 불변). `src/App.tsx`는 세션 없으면 `LoginPage`만, 있으면 기존 라우트. `AppLayout`/사이드바에 로그아웃 버튼 추가.
- `src/lib/storage.ts`에서 `loadFromStorage`/`saveToStorage` 제거(더는 쓰는 곳 없음), `newId()`(클라이언트 UUID 생성, 낙관적 업데이트에 계속 필요)는 유지.
- `README.md`를 프로젝트 설명 + 환경변수/배포 가이드로 전면 교체(예전엔 Vite 템플릿 기본 문구였음).
- **`StudentFormPage.tsx`의 rules-of-hooks 버그 수정** — early return을 모든 `useState` 호출 뒤로 이동.

**아직 안 끝난 것 — ✅ 전부 완료됨(사용자 확인).** SQL 실행, 계정 생성, `.env.local` 설정, 로컬 CRUD 확인, Vercel 배포까지 다 끝나서 실제로 배포된 상태. (아래 학부모 포털 섹션은 별개로 진행 중.)

**후속 과제(지금 범위 밖, 메모만)**
- `evaluations.writing`의 base64 이미지가 jsonb 안에 그대로 들어감 — 지금 규모(강사 1인)엔 문제없지만 나중에 다중 강사로 커지면 Supabase Storage로 옮기는 걸 권장(Plan 리뷰에서 지적됨).
- RLS가 실제로 막아주는지: Supabase Table Editor에서 다른 teacher_id로 행을 하나 수동 삽입해보고 앱에 안 보이는지 확인하는 게 좋음(권장, 필수 아님).

## 학부모 읽기 전용 포털 추가 (같은 날, 세 번째 세션)
강사가 앱 안에서 학부모를 초대하면, 그 학부모 계정으로 로그인 시 본인 자녀 1명의 수업 진도/출결/평가/독서·첨삭 이력만 읽기 전용으로 볼 수 있는 기능. 계획은 `EnterPlanMode`로 세움 (같은 플랜 파일 `noble-riding-pumpkin.md`에 두 번째 계획으로 덮어씀 — Supabase 마이그레이션 계획 원문은 이제 안 남아있음, 필요하면 git log에서 이 커밋들 diff로 복원 가능).

**확정된 설계**
- 역할 판별은 Supabase Auth의 `app_metadata.role`(서버에서만 설정 가능, 클라이언트가 위조 불가)로. 강사는 기본값(role 없음), 학부모는 `role: 'parent'` + `student_id`.
- `parent_contacts`에 `user_id` 컬럼 추가해서 로그인 계정과 연결 — 새 테이블 안 만들고 기존 연락처 데이터 재사용.
- RLS: 기존 강사용 `FOR ALL` 정책은 그대로 두고, `students`/`classes`/`curriculum_sessions`/`attendance_records`/`evaluations`/`reading_records`/`feedback_records`에 학부모용 `SELECT` 전용 정책을 **추가**(같은 테이블 permissive 정책은 OR로 합쳐짐). `textbooks`는 개인정보 아니라서 로그인한 사용자 전체 열람 허용. 상담기록/알림발송이력엔 의도적으로 정책 추가 안 함(요구사항에서 제외).
- 학부모 계정 생성은 **강사가 앱 안에서 초대** → Supabase Edge Function(`supabase/functions/invite-parent`)이 admin API로 계정 생성 + 초대 메일 발송. 함수 안에서 "호출자가 그 학부모 연락처를 소유한 강사인지"는 별도 체크 코드 없이 **anon-key + 호출자 JWT로 만든 클라이언트로 조회 → RLS가 자동으로 거부**하는 방식으로 검증(소유 아니면 조회 자체가 실패).

**새로 만든/바꾼 파일**
- DB: `supabase/002_parent_portal.sql`(기존 운영 DB용 증분 마이그레이션 — ALTER TABLE + 정책만), `supabase/schema.sql`도 최신화(신규 설치 대비). **아직 실행 안 됨.**
- 역할 분기: `AuthContext`에 `role` 추가. `App.tsx`를 라우터로 재구성 — `TeacherApp`(기존 로직 그대로 분리), `ParentApp`(신규), `/set-password` 경로는 role 무관하게 `SetPasswordPage`로(초대 수락·비밀번호 재설정 링크 둘 다 이 경로로 리디렉션시켜서, Supabase가 정확히 어떤 auth 이벤트를 쏘는지 추측할 필요 없이 URL 경로로만 판단하도록 설계함 — 더 안정적인 선택).
- 리팩터링: `src/pages/evaluations/EvaluationDetailPage.tsx`에서 레이더차트+성장코멘트+영역별평가+쓰기평가 부분을 `src/components/EvaluationResultView.tsx`로 추출(강사 화면 동작 불변 확인됨) — 학부모 평가 탭이 재사용.
- **버그 발견 및 수정: `addStudent`/`updateStudent`가 `parent_contacts` 테이블에 한 번도 쓰지 않고 있었음** — 로컬 state만 갱신되고 Supabase엔 학부모 연락처가 전혀 저장 안 되던 상태(새로고침하면 사라짐). `syncParentContacts`(id 기준으로 추가/수정/삭제 diff)로 수정. 이 세션 이전(=바로 전전 세션)에 만든 코드의 결함이라 학부모 포털 작업 중 발견함.
- `src/lib/supabaseMappers.ts` 리팩터링 — row→object 매핑을 개별 순수 함수로 뽑아서 강사용 `fetchAllData`와 신규 `fetchParentStudentData`(자기 학생 1명만, RLS에 의존해서 필터 없이 조회)가 공유.
- `src/store/ParentDataContext.tsx`(읽기 전용, mutation 없음), `src/components/layout/ParentLayout.tsx`(사이드바 없이 헤더만), `src/pages/parent/ParentPage.tsx` + 탭 4개(`ParentCurriculumTab`/`ParentAttendanceTab`/`ParentEvaluationTab`/`ParentReadingFeedbackTab`) — 전부 기존 강사용 컴포넌트/유틸(`ProgressBar`, `formatClassSchedule`, `ATTENDANCE_STATUS_BADGE`, `EvaluationResultView`) 재사용.
- `ParentContactsTab.tsx`에 연락처별 "학부모 계정 초대" 버튼 + 연동 상태 배지. `AppDataContext.refreshData()` 신규(초대 성공 후 userId 반영용, 기존 에러 복구 재조회 로직에서 추출).
- `supabase/functions/invite-parent/index.ts` + `supabase` CLI를 devDependency로 추가.

**아직 안 끝난 것 (사용자가 직접 해야 함) — ✅ 아래 항목 전부 완료됨 (실사용자 테스트로 확인)**
1. ~~Supabase SQL Editor에서 `supabase/002_parent_portal.sql` 실행~~ 완료
2. ~~`npx supabase login` → `npx supabase link --project-ref <ref>` → `npx supabase functions deploy invite-parent`~~ 완료 (`supabase/.temp/`가 로컬에 생겨서 확인, `.gitignore`에 추가함)
3. ~~Redirect URLs에 `.../set-password` 추가~~ 완료 — 초대 메일 링크로 비밀번호 설정까지 정상 동작 확인됨
4. ~~실제 초대 플로우 테스트~~ 완료

**실사용 테스트 중 발견 및 수정한 버그 2건**
- **RLS 정책이 구조적으로 항상 거짓이 되는 버그** — `students`/`classes`/`curriculum_sessions`/`attendance_records`/`evaluations`/`reading_records`/`feedback_records`의 학부모용 정책이 전부 `parent_contacts`를 서브쿼리로 직접 참조했는데, `parent_contacts` 자체엔 "teacher owns row" 정책만 있어서 학부모 세션에서는 그 서브쿼리가 항상 0건 반환 → 정책이 절대 통과 못 함. 초대 연결/역할 부여는 다 정상인데도 로그인하면 "연결된 학생 정보를 찾을 수 없어요"가 뜨던 원인. `supabase/003_fix_parent_rls.sql`로 수정 — `SECURITY DEFINER` 함수(`is_linked_parent`)로 이 연결 확인만 RLS 우회해서 처리하도록 정책 7개 재작성. `schema.sql`도 최신화, `002`는 과거 기록으로 그대로 두고 상단에 003 참고 주석만 추가. **사용자가 003 실행 후 확인 완료.**
- **학부모 화면에서 교재 정보가 안 보이던 버그** — `fetchParentStudentData`가 애초에 `textbooks` 테이블을 조회하지 않았음(RLS는 이미 허용돼 있었는데 fetch/표시 로직에서 빠뜨림). `ParentFetchedData`에 `textbooks` 추가하고 `ParentCurriculumTab`에 담당 교재 + 차시별 교재 배지 표시하도록 수정. **방금 push함, 아직 사용자 확인 전.**

## 프로젝트 개요
- 독서논술 학원 강사가 학생을 관리하는 웹앱 + 학부모 읽기 전용 포털
- Stack: React 19 + TypeScript + Vite + react-router-dom v7 + Tailwind CSS v4
- 백엔드: **Supabase**(Postgres + Auth + Edge Functions), 배포: **Vercel** (실제 배포 완료, 사용 중)
- git 저장소: `github.com/badukprince/teacher_app.git` (main) — 작업 단위별로 커밋
- 실행: `npm run dev` / 빌드: `npm run build` / 린트: `npm run lint` (oxlint)

## 전체 아키텍처
- `src/App.tsx` — 최상위 라우터: 로딩 스피너 → `LoginPage`(세션 없음) → `/set-password`(비밀번호 설정 필요) → `role==='parent'`면 `ParentApp`, 아니면 `TeacherApp`. `AuthContext`가 role/세션을 공급.
- **강사용**: `src/store/AppDataContext.tsx` — 단일 데이터 소스. mount 시 Supabase에서 로그인한 강사의 전체 데이터를 fetch해 기존 중첩 타입으로 재조립하고, 각 mutation은 로컬 state를 낙관적으로 갱신 + 백그라운드로 Supabase에 반영(`useAppData()` 훅). `AppLayout`이 사이드바+레이아웃.
- **학부모용**: `src/store/ParentDataContext.tsx` — 읽기 전용, 자기 자녀 1명 데이터만(`useParentData()`). `ParentLayout` + `ParentPage`(탭 4개).
- `src/lib/supabaseClient.ts`/`supabaseMappers.ts` — Supabase 클라이언트, DB row ↔ 앱 타입 변환 + fetch 로직(강사/학부모 공용 매퍼 함수).
- `supabase/schema.sql` + `002_parent_portal.sql` — DB 스키마/RLS/트리거. `supabase/functions/invite-parent` — 학부모 초대 Edge Function.
- `src/lib/navigation.ts` — 강사용 사이드바 메뉴 8개 정의 (대시보드/학생관리/수업·커리큘럼/수업평가/출결관리/학부모 소통/자료실/마이페이지·설정).

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
6. **출결관리** (2026-07-21 신규 구현)
   - `/attendance` **출결 체크**(`AttendanceCheckPage`) — 반 선택 + 날짜 선택 후 재원 학생별로 출석/지각/조퇴/결석 4버튼 원터치 토글. 같은 상태 다시 누르면 기록 삭제(미체크로 되돌림). 상단에 상태별 인원 요약 + 미체크 인원 표시.
   - `/attendance/history` **출결 이력**(`AttendanceHistoryPage`) — 반/학생/월 필터 + 캘린더 뷰(날짜별 상태 뱃지, 학생 미지정 시 상태별 인원수 집계) / 리스트 뷰(개별 기록, 삭제 가능) 전환.
   - `AppDataContext`에 `setAttendanceStatus(studentId, date, status)` 신규 — 같은 날짜 기록이 있으면 갱신/토글삭제, 없으면 추가하는 upsert 로직. 기존 `addAttendanceRecord`/`removeAttendanceRecord`는 학생 상세 탭에서 계속 사용.
   - 상태별 배지 색상을 `src/lib/attendanceStyles.ts`로 공통화 (기존 `AttendanceHistoryTab`의 중복 스타일 맵도 이걸로 교체).
   - 아이콘 `ChevronLeftIcon`/`ChevronRightIcon` 신규 추가 (월 이동 버튼용).

### 🚧 미구현 (플레이스홀더만 있음)
- `/resources` **자료실** — `PlaceholderPage`만 있음. 타입/데이터 모델 자체가 없음.
- `/settings` **마이페이지/설정** — `PlaceholderPage`만 있음.

## 확인이 필요한 부분 (다음 세션에서 물어볼 것)
- 알림 발송(`communication`)이 실제로 이메일/카카오톡을 보내는지, 아니면 로그만 남기는 목업인지 — 코드상으로는 외부 API 연동 흔적이 안 보여서 목업으로 추정됨
- AI 글쓰기 분석(`runMockAiAnalysis`)을 실제 AI(예: Claude API)로 교체할 계획이 있는지
- 자료실(`/resources`), 설정(`/settings`) 중 다음에 어떤 걸 먼저 만들지
- 출결 캘린더 뷰가 실제 데이터로 잘 보이는지 (브라우저 확장 미설치로 직접 스크린샷 확인은 못함) — `npm run dev` 육안 확인 권장

## 알려진 이슈 / 주의사항
- 데이터는 전부 localStorage — 브라우저 캐시 삭제 시 모든 데이터 유실. 백업/내보내기 기능 없음.
- 코드에 TODO/FIXME 주석은 없음 (검색해봤지만 0건) — 미완성 여부는 라우팅과 파일 존재 여부로만 판단 가능.

## 다음에 이어서 하면 좋을 후보
1. 자료실 기능 설계부터 필요 (타입 정의 없음)
2. 알림 발송을 실제 이메일/카카오 API와 연동할지 결정
3. 출결 캘린더 뷰 실제 화면 확인 및 다듬기
