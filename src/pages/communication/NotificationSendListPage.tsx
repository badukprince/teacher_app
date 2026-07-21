import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../../store/AppDataContext';
import { GRADE_OPTIONS } from '../../lib/constants';
import { inputClass } from '../../lib/formStyles';
import { buildNotificationContent } from '../../lib/notificationTemplates';
import { NOTIFICATION_TYPES, SEND_CHANNELS, type NotificationType, type SendChannel } from '../../types/communication';
import { CommunicationTabs } from './CommunicationTabs';
import { SearchIcon, SparklesIcon, UsersIcon } from '../../components/icons';

export function NotificationSendListPage() {
  const { students, classes, getClass, getTextbook, getEvaluationsForStudent, getNotificationsForStudent, addNotificationLog } =
    useAppData();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');

  const [bulkClassId, setBulkClassId] = useState(classes[0]?.id ?? '');
  const [bulkType, setBulkType] = useState<NotificationType>(NOTIFICATION_TYPES[0]);
  const [bulkChannel, setBulkChannel] = useState<SendChannel>(SEND_CHANNELS[0]);
  const [bulkResult, setBulkResult] = useState<{ sent: number; skipped: string[] } | null>(null);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students
      .filter((s) => classFilter === 'all' || s.classId === classFilter)
      .filter((s) => gradeFilter === 'all' || s.grade === gradeFilter)
      .filter((s) => !q || s.name.toLowerCase().includes(q) || s.school.toLowerCase().includes(q))
      .map((s) => {
        const logs = getNotificationsForStudent(s.id);
        return { student: s, lastLog: logs[0] };
      })
      .sort((a, b) => a.student.name.localeCompare(b.student.name, 'ko'));
  }, [students, classFilter, gradeFilter, search, getNotificationsForStudent]);

  const handleBulkSend = () => {
    const schoolClass = getClass(bulkClassId);
    if (!schoolClass) return;
    const targets = students.filter((s) => s.classId === bulkClassId && s.status === '재원');
    const skipped: string[] = [];
    let sent = 0;

    for (const student of targets) {
      const primary = student.parentContacts.find((c) => c.isPrimary) ?? student.parentContacts[0];
      const hasChannel = bulkChannel === '이메일' ? Boolean(primary?.email) : Boolean(primary?.phone);
      if (!primary || !hasChannel) {
        skipped.push(`${student.name} (${bulkChannel === '이메일' ? '이메일' : '연락처'} 미등록)`);
        continue;
      }
      const { subject, body } = buildNotificationContent(bulkType, {
        student,
        schoolClass,
        evaluations: getEvaluationsForStudent(student.id),
        getTextbook,
      });
      addNotificationLog({ studentId: student.id, type: bulkType, channel: bulkChannel, subject, body });
      sent += 1;
    }
    setBulkResult({ sent, skipped });
  };

  return (
    <div>
      <div>
        <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">학부모 소통</h1>
        <p className="mt-1 text-sm text-slate-500">알림을 발송하거나 상담 기록을 관리하세요.</p>
      </div>

      <div className="mt-5">
        <CommunicationTabs />
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">반별 일괄 발송</p>
        <p className="mt-0.5 text-xs text-slate-500">선택한 반의 재원 학생 전체에게 같은 유형의 알림을 한 번에 발송해요.</p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select value={bulkClassId} onChange={(e) => setBulkClassId(e.target.value)} className={inputClass}>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select value={bulkType} onChange={(e) => setBulkType(e.target.value as NotificationType)} className={inputClass}>
            {NOTIFICATION_TYPES.map((t) => (
              <option key={t} value={t}>{t === '종합' ? '종합 알림장' : t}</option>
            ))}
          </select>
          <select value={bulkChannel} onChange={(e) => setBulkChannel(e.target.value as SendChannel)} className={inputClass}>
            <option value="이메일">이메일 (무료)</option>
            <option value="카카오톡">카카오톡 (유료)</option>
          </select>
          <button
            type="button"
            onClick={handleBulkSend}
            disabled={!bulkClassId}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            <SparklesIcon className="h-4 w-4" />
            일괄 발송
          </button>
        </div>
        {bulkResult && (
          <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
            <p>{bulkResult.sent}명에게 발송 완료했어요.</p>
            {bulkResult.skipped.length > 0 && (
              <p className="mt-1 text-amber-700">제외됨: {bulkResult.skipped.join(', ')}</p>
            )}
          </div>
        )}
        <p className="mt-2 text-xs text-slate-400">* 실제 이메일/카카오톡 발송 연동 전 데모 상태예요. 발송 이력만 기록돼요.</p>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이름, 학교 검색"
              className={`${inputClass} pl-9`}
            />
          </div>
          <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className={inputClass}>
            <option value="all">전체 반</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} className={inputClass}>
            <option value="all">전체 학년</option>
            {GRADE_OPTIONS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
          <UsersIcon className="h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-700">조건에 맞는 학생이 없어요</p>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(({ student, lastLog }) => (
            <li key={student.id}>
              <Link
                to={`/communication/notify/${student.id}`}
                className="block rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-300 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900">{student.name}</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">{student.grade}</span>
                </div>
                <p className="mt-1 text-sm text-slate-500">{student.school} · {getClass(student.classId)?.name ?? '미배정'}</p>
                <p className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm text-slate-500">
                  <span>
                    {lastLog
                      ? `최근 발송: ${lastLog.type} · ${lastLog.channel} · ${new Date(lastLog.sentAt).toLocaleDateString('ko-KR')}`
                      : '발송 이력 없음'}
                  </span>
                  {lastLog && !lastLog.answered && (
                    <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">답변대기</span>
                  )}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
