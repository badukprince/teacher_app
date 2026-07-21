# 독서논술 매니저

독서논술 학원 강사용 학생 관리 웹앱. 학생/반/교재/수업평가/출결/학부모 소통을 한 곳에서 관리합니다.

React 19 + TypeScript + Vite + Tailwind CSS v4, 데이터는 Supabase(Postgres + Auth)에 저장됩니다.

## 로컬 실행

```bash
npm install
```

`.env.example`을 복사해 `.env.local`을 만들고 Supabase 프로젝트의 URL/anon key를 채워넣으세요.

```bash
cp .env.example .env.local
```

- Supabase 대시보드 > Project Settings > Data API 에서 **Project URL**, **anon / public** 키 확인
- `service_role` 키는 절대 사용하지 마세요 (프론트엔드에 노출되면 안 되는 서버 전용 키)

```bash
npm run dev
```

## DB 스키마

`supabase/schema.sql`을 Supabase 대시보드 SQL Editor에 붙여넣고 한 번 실행하면 테이블/RLS/트리거가 모두 만들어집니다. 그 다음 **Authentication > Users**에서 강사 계정(이메일/비밀번호)을 수동으로 하나 만드세요 — 이 앱은 공개 회원가입을 지원하지 않습니다.

이미 `schema.sql`을 실행해서 운영 중인 프로젝트에 학부모 포털을 추가하려면 `supabase/002_parent_portal.sql`도 SQL Editor에서 한 번 더 실행하세요(기존 데이터 안전, 컬럼 추가 + 정책 추가만 함).

## 학부모 초대 기능 (Edge Function)

강사가 앱 안에서 "학부모 계정 초대" 버튼을 누르면 `supabase/functions/invite-parent`가 학부모 계정을 생성하고 초대 메일을 보냅니다. 배포 전에는 이 버튼이 동작하지 않습니다.

```bash
npx supabase login
npx supabase link --project-ref <프로젝트 ref, 대시보드 URL에서 확인 가능>
npx supabase functions deploy invite-parent
```

그리고 Supabase 대시보드 **Authentication > URL Configuration > Redirect URLs**에 아래 두 개를 추가해야 초대 메일 링크가 정상 동작합니다(비밀번호 설정 화면으로 리디렉션되는 경로라 허용 목록에 없으면 거부됨):
- `http://localhost:5173/set-password` (로컬 개발용)
- `https://<Vercel 배포 도메인>/set-password` (배포용)

## 배포 (Vercel)

1. Vercel에서 이 GitHub 저장소를 Import (프레임워크: Vite, 자동 감지됨)
2. 프로젝트 환경변수에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 추가
3. 배포 — `vercel.json`이 React Router SPA 라우팅을 처리합니다

## 스크립트

- `npm run dev` — 개발 서버
- `npm run build` — 프로덕션 빌드 (`tsc -b && vite build`)
- `npm run lint` — oxlint
- `npm run preview` — 빌드 결과 미리보기
