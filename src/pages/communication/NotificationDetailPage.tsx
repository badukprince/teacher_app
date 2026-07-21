import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppData } from '../../store/AppDataContext';
import { buildNotificationContent } from '../../lib/notificationTemplates';
import { inputClass, labelClass } from '../../lib/formStyles';
import { NOTIFICATION_TYPES, type NotificationType, type SendChannel } from '../../types/communication';
import { ArrowLeftIcon, ChatIcon, MailIcon } from '../../components/icons';

export function NotificationDetailPage() {
  const { studentId } = useParams();
  const { getStudent, getClass, getTextbook, getEvaluationsForStudent, getNotificationsForStudent, addNotificationLog } =
    useAppData();

  const student = studentId ? getStudent(studentId) : undefined;
  const schoolClass = student ? getClass(student.classId) : undefined;

  const generate = (type: NotificationType) =>
    student
      ? buildNotificationContent(type, {
          student,
          schoolClass,
          evaluations: getEvaluationsForStudent(student.id),
          getTextbook,
        })
      : { subject: '', body: '' };

  const [type, setType] = useState<NotificationType>(NOTIFICATION_TYPES[0]);
  const [channel, setChannel] = useState<SendChannel>('이메일');
  const [subject, setSubject] = useState(() => generate(NOTIFICATION_TYPES[0]).subject);
  const [body, setBody] = useState(() => generate(NOTIFICATION_TYPES[0]).body);
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
        <p className="text-sm font-medium text-slate-700">학생을 찾을 수 없어요</p>
        <Link to="/communication" className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-700">
          학부모 소통으로 돌아가기
        </Link>
      </div>
    );
  }

  const primary = student.parentContacts.find((c) => c.isPrimary) ?? student.parentContacts[0];
  const recipientOk = channel === '이메일' ? Boolean(primary?.email) : Boolean(primary?.phone);

  const handleTypeChange = (nextType: NotificationType) => {
    setType(nextType);
    const generated = generate(nextType);
    setSubject(generated.subject);
    setBody(generated.body);
    setSentMessage(null);
  };

  const handleSend = () => {
    addNotificationLog({ studentId: student.id, type, channel, subject, body });
    setSentMessage(`${channel}(으)로 발송 기록을 남겼어요. (실제 발송 연동 전 데모예요)`);
  };

  const logs = getNotificationsForStudent(student.id);

  return (
    <div>
      <Link to="/communication" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeftIcon className="h-4 w-4" />
        학부모 소통
      </Link>

      <h1 className="mt-3 text-xl font-semibold text-slate-900 md:text-2xl">{student.name} 학생 알림 발송</h1>
      <p className="mt-1 text-sm text-slate-500">
        {student.grade} · {student.school} · {schoolClass?.name ?? '미배정'}
      </p>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
        <label className={labelClass}>알림 유형</label>
        <div className="flex flex-wrap gap-2">
          {NOTIFICATION_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleTypeChange(t)}
              className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
                type === t ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t === '종합' ? '종합 알림장' : t}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <label className={labelClass}>제목</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass} />
        </div>
        <div className="mt-3">
          <label className={labelClass}>내용</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={10} className={inputClass} />
        </div>

        <div className="mt-4">
          <label className={labelClass}>발송 방법</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => setChannel('이메일')}
              className={`flex flex-1 items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm ${
                channel === '이메일' ? 'border-brand-500 bg-brand-50' : 'border-slate-300 bg-white hover:bg-slate-50'
              }`}
            >
              <MailIcon className="h-4 w-4 text-slate-500" />
              <span className="font-medium text-slate-800">이메일</span>
              <span className="ml-auto rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700">무료</span>
            </button>
            <button
              type="button"
              onClick={() => setChannel('카카오톡')}
              className={`flex flex-1 items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm ${
                channel === '카카오톡' ? 'border-brand-500 bg-brand-50' : 'border-slate-300 bg-white hover:bg-slate-50'
              }`}
            >
              <ChatIcon className="h-4 w-4 text-slate-500" />
              <span className="font-medium text-slate-800">카카오톡</span>
              <span className="ml-auto rounded bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-700">유료</span>
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            수신자: {primary ? `${primary.name} (${channel === '이메일' ? primary.email ?? '이메일 미등록' : primary.phone})` : '등록된 학부모 연락처가 없어요'}
          </p>
          {!recipientOk && (
            <p className="mt-1 text-xs text-red-600">
              {channel === '이메일' ? '주 연락처에 이메일이 등록되어 있지 않아요.' : '주 연락처에 전화번호가 등록되어 있지 않아요.'} 학생 정보 수정에서 추가해주세요.
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={handleSend}
            disabled={!recipientOk}
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            발송
          </button>
          {sentMessage && <p className="text-sm text-emerald-700">{sentMessage}</p>}
        </div>
        <p className="mt-2 text-xs text-slate-400">* 실제 이메일/카카오톡 발송 연동 전 데모 상태예요. 발송 이력만 기록돼요.</p>
      </div>

      <div className="mt-6">
        <h2 className="text-base font-semibold text-slate-900">발송 이력</h2>
        {logs.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">아직 발송 이력이 없어요.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {logs.map((log) => (
              <li key={log.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">{log.type}</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">{log.channel}</span>
                  <span className="text-xs text-slate-400">{new Date(log.sentAt).toLocaleString('ko-KR')}</span>
                </div>
                <p className="mt-1.5 text-sm font-medium text-slate-800">{log.subject}</p>
                <details className="mt-1">
                  <summary className="cursor-pointer text-xs font-medium text-brand-600 hover:text-brand-700">
                    내용 보기
                  </summary>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm text-slate-600">{log.body}</p>
                </details>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
