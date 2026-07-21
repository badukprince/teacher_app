-- 학부모 RLS 정책 버그 수정
--
-- 문제: students/classes/curriculum_sessions/attendance_records/evaluations/
-- reading_records/feedback_records의 학부모용 정책이 전부 parent_contacts를
-- 직접 서브쿼리로 참조하는데, parent_contacts 자체엔 "teacher owns row" 정책만
-- 있어서 학부모 세션으로는 그 서브쿼리가 항상 0건을 반환함(자기 자신의 연결
-- 행조차 못 봄). 결과적으로 학부모용 정책이 절대 참이 되지 않아 로그인해도
-- "연결된 학생 정보를 찾을 수 없어요"가 뜸.
--
-- 해결: SECURITY DEFINER 함수로 parent_contacts 조회 시점에만 RLS를 우회해서
-- 연결 여부를 확인하고, 그 결과(boolean)만 정책에서 사용한다. parent_contacts
-- 테이블 자체에 대한 일반 SELECT 권한은 학부모에게 계속 안 줌(다른 보호자
-- 연락처까지 노출하지 않으려는 의도 그대로 유지).

create or replace function is_linked_parent(target_student_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from parent_contacts pc
    where pc.user_id = auth.uid() and pc.student_id = target_student_id
  );
$$;

drop policy if exists "parent reads own student" on students;
create policy "parent reads own student" on students for select
  using (is_linked_parent(students.id));

drop policy if exists "parent reads own student's class" on classes;
create policy "parent reads own student's class" on classes for select
  using (exists (
    select 1 from students s
    where s.class_id = classes.id and is_linked_parent(s.id)
  ));

drop policy if exists "parent reads own student's sessions" on curriculum_sessions;
create policy "parent reads own student's sessions" on curriculum_sessions for select
  using (exists (
    select 1 from students s
    where s.class_id = curriculum_sessions.class_id and is_linked_parent(s.id)
  ));

drop policy if exists "parent reads own student's attendance" on attendance_records;
create policy "parent reads own student's attendance" on attendance_records for select
  using (is_linked_parent(attendance_records.student_id));

drop policy if exists "parent reads own student's evaluations" on evaluations;
create policy "parent reads own student's evaluations" on evaluations for select
  using (is_linked_parent(evaluations.student_id));

drop policy if exists "parent reads own student's reading records" on reading_records;
create policy "parent reads own student's reading records" on reading_records for select
  using (is_linked_parent(reading_records.student_id));

drop policy if exists "parent reads own student's feedback records" on feedback_records;
create policy "parent reads own student's feedback records" on feedback_records for select
  using (is_linked_parent(feedback_records.student_id));
