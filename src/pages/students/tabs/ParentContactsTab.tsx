import { useState } from 'react';
import { useAppData } from '../../../store/AppDataContext';
import { supabase } from '../../../lib/supabaseClient';
import { MailIcon, PhoneIcon, UsersIcon } from '../../../components/icons';
import type { ParentContact, Student } from '../../../types/student';

export function ParentContactsTab({ student }: { student: Student }) {
  const { refreshData } = useAppData();
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [sentId, setSentId] = useState<string | null>(null);

  if (student.parentContacts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        등록된 학부모 연락처가 없어요. 수정 화면에서 추가할 수 있어요.
      </div>
    );
  }

  const handleInvite = async (contact: ParentContact) => {
    if (!contact.email) return;
    setInvitingId(contact.id);
    setErrorId(null);
    const { error } = await supabase.functions.invoke('invite-parent', {
      body: {
        parentContactId: contact.id,
        email: contact.email,
        redirectTo: `${window.location.origin}/set-password`,
      },
    });
    setInvitingId(null);
    if (error) {
      setErrorId(contact.id);
      return;
    }
    setSentId(contact.id);
    await refreshData();
  };

  return (
    <ul className="flex flex-col gap-3">
      {student.parentContacts.map((contact) => (
        <li key={contact.id} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
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
          </div>

          <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
            {contact.userId ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                <UsersIcon className="h-3.5 w-3.5" />
                학부모 계정 연동됨
              </span>
            ) : contact.email ? (
              <>
                <button
                  type="button"
                  onClick={() => handleInvite(contact)}
                  disabled={invitingId === contact.id}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {invitingId === contact.id ? '초대 발송 중...' : '학부모 계정 초대'}
                </button>
                {sentId === contact.id && <span className="text-xs text-emerald-700">초대 메일을 보냈어요.</span>}
                {errorId === contact.id && <span className="text-xs text-red-600">초대 발송에 실패했어요. 다시 시도해주세요.</span>}
              </>
            ) : (
              <span className="text-xs text-slate-400">이메일을 등록하면 학부모 계정을 초대할 수 있어요.</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
