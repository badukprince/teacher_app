-- 독서논술 관리 앱 DB 스키마
-- Supabase 대시보드 > SQL Editor 에서 전체를 한 번 붙여넣고 실행하세요.
-- 실행 후: Authentication > Users 에서 강사 계정(이메일/비밀번호)을 수동으로 하나 만드세요.

create extension if not exists pgcrypto;

-- =========================================================
-- 최상위 테이블 (강사가 직접 소유)
-- =========================================================

create table classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  grade_band text,
  days_of_week text[] not null default '{}',
  time text,
  location text not null default '오프라인' check (location in ('오프라인', '온라인')),
  main_textbook_id uuid,
  created_at timestamptz not null default now()
);

create table textbooks (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  author text,
  publisher text,
  grades text[] not null default '{}',
  stage text,
  description text
);

alter table classes
  add constraint classes_main_textbook_id_fkey
  foreign key (main_textbook_id) references textbooks(id) on delete set null;

create table students (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  grade text not null,
  school text not null,
  class_id uuid references classes(id) on delete set null,
  status text not null check (status in ('재원', '휴원', '퇴원')),
  phone text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- 반에 속한 자식 테이블
-- =========================================================

create table curriculum_sessions (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid not null references classes(id) on delete cascade,
  date date,
  topic text not null,
  textbook_id uuid references textbooks(id) on delete set null,
  summary text,
  completed boolean not null default false,
  position integer not null default 0
);

-- =========================================================
-- 학생에 속한 자식 테이블
-- =========================================================

create table parent_contacts (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  relation text not null,
  name text not null,
  phone text not null,
  email text,
  is_primary boolean not null default false,
  -- 학부모 본인이 초대를 수락해 로그인 계정을 만들면 연결됨 (supabase/002_parent_portal.sql 참고)
  user_id uuid references auth.users(id) on delete set null
);

create table reading_records (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  date date not null,
  title text not null,
  author text,
  memo text
);

create table feedback_records (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  date date not null,
  title text not null,
  content text,
  score text
);

create table attendance_records (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  date date not null,
  status text not null check (status in ('출석', '지각', '결석', '조퇴')),
  memo text,
  unique (student_id, date)
);

create table consultation_records (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  date date not null,
  type text,
  content text,
  next_consultation_date date
);

create table evaluations (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  date date not null,
  listening jsonb not null default '[]',
  reading jsonb not null default '[]',
  speaking jsonb not null default '[]',
  thinking jsonb not null default '[]',
  writing jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table notification_logs (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  type text not null,
  channel text not null,
  subject text,
  body text,
  sent_at timestamptz not null default now(),
  answered boolean not null default false
);

-- =========================================================
-- 인덱스
-- =========================================================

create index on classes (teacher_id);
create index on textbooks (teacher_id);
create index on students (teacher_id);
create index on students (class_id);
create index on curriculum_sessions (class_id);
create index on parent_contacts (student_id);
create index on reading_records (student_id);
create index on feedback_records (student_id);
create index on attendance_records (student_id);
create index on consultation_records (student_id);
create index on evaluations (student_id);
create index on notification_logs (student_id);

-- =========================================================
-- teacher_id 자동 채우기 트리거
--
-- 클라이언트가 insert 요청에 teacher_id를 뭘 보내든 무시하고 서버에서
-- 강제로 채운다. 최상위 테이블은 auth.uid()로, 자식 테이블은 부모 행의
-- teacher_id를 조회해서 채운다 (SECURITY DEFINER 아님 — 호출한 사용자
-- 권한 그대로 조회하므로, 본인 소유가 아닌 부모 행은 애초에 RLS에 걸려
-- 조회되지 않고 teacher_id가 NULL로 남아 아래 RLS WITH CHECK에서
-- 자동으로 막힌다).
-- =========================================================

create function set_teacher_id_self()
returns trigger as $$
begin
  new.teacher_id := auth.uid();
  return new;
end;
$$ language plpgsql;

create trigger set_teacher_id before insert on classes
  for each row execute function set_teacher_id_self();
create trigger set_teacher_id before insert on textbooks
  for each row execute function set_teacher_id_self();
create trigger set_teacher_id before insert on students
  for each row execute function set_teacher_id_self();

create function set_teacher_id_from_class()
returns trigger as $$
begin
  select teacher_id into new.teacher_id from classes where id = new.class_id;
  return new;
end;
$$ language plpgsql;

create trigger set_teacher_id before insert on curriculum_sessions
  for each row execute function set_teacher_id_from_class();

create function set_teacher_id_from_student()
returns trigger as $$
begin
  select teacher_id into new.teacher_id from students where id = new.student_id;
  return new;
end;
$$ language plpgsql;

create trigger set_teacher_id before insert on parent_contacts
  for each row execute function set_teacher_id_from_student();
create trigger set_teacher_id before insert on reading_records
  for each row execute function set_teacher_id_from_student();
create trigger set_teacher_id before insert on feedback_records
  for each row execute function set_teacher_id_from_student();
create trigger set_teacher_id before insert on attendance_records
  for each row execute function set_teacher_id_from_student();
create trigger set_teacher_id before insert on consultation_records
  for each row execute function set_teacher_id_from_student();
create trigger set_teacher_id before insert on evaluations
  for each row execute function set_teacher_id_from_student();
create trigger set_teacher_id before insert on notification_logs
  for each row execute function set_teacher_id_from_student();

-- =========================================================
-- RLS: 강사는 자기 teacher_id가 붙은 행만 보고 쓸 수 있다
-- =========================================================

alter table classes enable row level security;
alter table textbooks enable row level security;
alter table students enable row level security;
alter table curriculum_sessions enable row level security;
alter table parent_contacts enable row level security;
alter table reading_records enable row level security;
alter table feedback_records enable row level security;
alter table attendance_records enable row level security;
alter table consultation_records enable row level security;
alter table evaluations enable row level security;
alter table notification_logs enable row level security;

create policy "teacher owns row" on classes for all
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy "teacher owns row" on textbooks for all
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy "teacher owns row" on students for all
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy "teacher owns row" on curriculum_sessions for all
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy "teacher owns row" on parent_contacts for all
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy "teacher owns row" on reading_records for all
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy "teacher owns row" on feedback_records for all
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy "teacher owns row" on attendance_records for all
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy "teacher owns row" on consultation_records for all
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy "teacher owns row" on evaluations for all
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy "teacher owns row" on notification_logs for all
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

-- =========================================================
-- 학부모용 읽기 전용 RLS 정책 (자세한 설명은 supabase/002_parent_portal.sql 참고)
-- =========================================================

create policy "parent reads own student" on students for select
  using (exists (
    select 1 from parent_contacts pc
    where pc.user_id = auth.uid() and pc.student_id = students.id
  ));

create policy "parent reads own student's class" on classes for select
  using (exists (
    select 1 from students s
    join parent_contacts pc on pc.student_id = s.id
    where pc.user_id = auth.uid() and s.class_id = classes.id
  ));

create policy "parent reads own student's sessions" on curriculum_sessions for select
  using (exists (
    select 1 from students s
    join parent_contacts pc on pc.student_id = s.id
    where pc.user_id = auth.uid() and s.class_id = curriculum_sessions.class_id
  ));

create policy "parent reads own student's attendance" on attendance_records for select
  using (exists (
    select 1 from parent_contacts pc
    where pc.user_id = auth.uid() and pc.student_id = attendance_records.student_id
  ));

create policy "parent reads own student's evaluations" on evaluations for select
  using (exists (
    select 1 from parent_contacts pc
    where pc.user_id = auth.uid() and pc.student_id = evaluations.student_id
  ));

create policy "parent reads own student's reading records" on reading_records for select
  using (exists (
    select 1 from parent_contacts pc
    where pc.user_id = auth.uid() and pc.student_id = reading_records.student_id
  ));

create policy "parent reads own student's feedback records" on feedback_records for select
  using (exists (
    select 1 from parent_contacts pc
    where pc.user_id = auth.uid() and pc.student_id = feedback_records.student_id
  ));

create policy "authenticated users read textbooks" on textbooks for select
  using (auth.role() = 'authenticated');
