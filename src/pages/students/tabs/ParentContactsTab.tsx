import type { Student } from '../../../types/student';
import { MailIcon, PhoneIcon } from '../../../components/icons';

export function ParentContactsTab({ student }: { student: Student }) {
  if (student.parentContacts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        등록된 학부모 연락처가 없어요. 수정 화면에서 추가할 수 있어요.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {student.parentContacts.map((contact) => (
        <li key={contact.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-900">{contact.name}</span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">{contact.relation}</span>
              {contact.isPrimary && (
                <span className="rounded bg-brand-50 px-1.5 py-0.5 text-xs font-medium text-brand-700">주 연락처</span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-600">{contact.phone}</p>
            {contact.email && <p className="mt-0.5 text-sm text-slate-500">{contact.email}</p>}
          </div>
          <div className="flex shrink-0 gap-2">
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-600"
                aria-label={`${contact.name}에게 이메일`}
              >
                <MailIcon className="h-4 w-4" />
              </a>
            )}
            <a
              href={`tel:${contact.phone}`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-600"
              aria-label={`${contact.name}에게 전화`}
            >
              <PhoneIcon className="h-4 w-4" />
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
