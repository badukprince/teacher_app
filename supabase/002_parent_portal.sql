-- 학부모 읽기 전용 포털 — 증분 마이그레이션
-- schema.sql을 이미 실행한 기존 프로젝트에서 이 파일만 SQL Editor에 붙여넣고 한 번 실행하세요.
-- (신규로 처음 세팅하는 경우엔 schema.sql 하나만 실행하면 됨 — 이 내용이 이미 포함되어 있음)

alter table parent_contacts
  add column user_id uuid references auth.users(id) on delete set null;

-- =========================================================
-- 학부모용 읽기 전용 RLS 정책
--
-- 기존 "teacher owns row" (FOR ALL) 정책은 그대로 두고, 아래에 학부모용
-- SELECT 전용 정책을 추가한다. 같은 테이블에 여러 permissive 정책이 있으면
-- OR로 합쳐지므로: 강사는 자기 데이터 전체 CRUD, 학부모는 parent_contacts에
-- user_id로 연결된 자기 자녀 데이터만 조회 가능해진다.
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

-- 교재 정보는 개인정보가 아니므로 로그인한 학부모 전체에게 단순 조회 허용
create policy "authenticated users read textbooks" on textbooks for select
  using (auth.role() = 'authenticated');
