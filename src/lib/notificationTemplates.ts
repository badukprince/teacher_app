import type { SchoolClass, Student } from '../types/student';
import type { Evaluation } from '../types/evaluation';
import type { NotificationType } from '../types/communication';
import type { Textbook } from '../types/curriculum';
import { buildGrowthComment, overallScore, subjectScore } from './evaluationConfig';
import { SUBJECTS } from '../types/evaluation';

interface NotificationContext {
  student: Student;
  schoolClass?: SchoolClass;
  evaluations: Evaluation[];
  getTextbook: (id: string) => Textbook | undefined;
}

function buildAttendanceSection(student: Student): string {
  const recent = [...student.attendanceHistory].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  if (recent.length === 0) return '등록된 출결 기록이 없어요.';
  const lines = recent.map((a) => `- ${a.date}: ${a.status}${a.memo ? ` (${a.memo})` : ''}`);
  return `최근 출결 현황을 안내드립니다.\n\n${lines.join('\n')}`;
}

function buildProgressSection(schoolClass: SchoolClass | undefined, getTextbook: NotificationContext['getTextbook']): string {
  if (!schoolClass) return '배정된 반이 없어 진도 정보를 안내할 수 없어요.';
  const total = schoolClass.sessions.length;
  if (total === 0) return `${schoolClass.name} 반의 등록된 진도표가 없어요.`;
  const completed = schoolClass.sessions.filter((s) => s.completed).length;
  const next = schoolClass.sessions.find((s) => !s.completed);
  const lines = [`${schoolClass.name} 반 진도 현황을 안내드립니다.`, '', `- 진행 현황: ${completed}/${total}차시 완료`];
  if (next) {
    const textbookName = next.textbookId ? getTextbook(next.textbookId)?.title : undefined;
    lines.push(`- 다음 차시: ${next.topic}${next.date ? ` (${next.date} 예정)` : ''}${textbookName ? ` · ${textbookName}` : ''}`);
  } else {
    lines.push('- 현재까지 등록된 모든 차시를 완료했어요.');
  }
  return lines.join('\n');
}

function buildEvaluationSection(evaluations: Evaluation[]): string {
  if (evaluations.length === 0) return '아직 등록된 수업평가 결과가 없어요.';
  const latest = evaluations[evaluations.length - 1];
  const previous = evaluations.length > 1 ? evaluations[evaluations.length - 2] : null;
  const total = overallScore(latest);
  const bySubject = SUBJECTS.map((s) => `${s} ${subjectScore(latest, s) ?? '-'}점`).join(' · ');
  const growth = buildGrowthComment(latest, previous);
  return [
    `${latest.date}에 진행된 수업평가 결과를 안내드립니다.`,
    '',
    `- 종합 점수: ${total ?? '-'}점`,
    `- ${bySubject}`,
    '',
    `[성장 추이] ${growth.headline} ${growth.detail}`,
  ].join('\n');
}

export function buildNotificationContent(type: NotificationType, ctx: NotificationContext): { subject: string; body: string } {
  const { student, schoolClass, evaluations, getTextbook } = ctx;
  const greeting = `안녕하세요, ${student.name} 학부모님.`;
  const closing = '감사합니다.';

  if (type === '출결') {
    return {
      subject: `[독서논술] ${student.name} 학생 출결 안내`,
      body: [greeting, '', buildAttendanceSection(student), '', closing].join('\n'),
    };
  }

  if (type === '수업진도') {
    return {
      subject: `[독서논술] ${student.name} 학생 수업 진도 안내`,
      body: [greeting, '', buildProgressSection(schoolClass, getTextbook), '', closing].join('\n'),
    };
  }

  if (type === '수업평가') {
    return {
      subject: `[독서논술] ${student.name} 학생 수업평가 결과 안내`,
      body: [greeting, '', buildEvaluationSection(evaluations), '', closing].join('\n'),
    };
  }

  return {
    subject: `[독서논술] ${student.name} 학생 종합 알림장`,
    body: [
      greeting,
      '',
      '[출결]',
      buildAttendanceSection(student),
      '',
      '[수업 진도]',
      buildProgressSection(schoolClass, getTextbook),
      '',
      '[수업 평가]',
      buildEvaluationSection(evaluations),
      '',
      closing,
    ].join('\n'),
  };
}
