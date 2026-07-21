import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { inputClass, labelClass } from '../lib/formStyles';

export function SetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 해요.');
      return;
    }
    if (password !== confirm) {
      setError('비밀번호가 서로 달라요.');
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (updateError) {
      setError('비밀번호 설정에 실패했어요. 다시 시도해주세요.');
      return;
    }
    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">
            독
          </div>
          <span className="text-base font-semibold text-slate-900">비밀번호 설정</span>
        </div>
        <p className="mb-4 text-sm text-slate-500">계속 사용하려면 로그인에 사용할 비밀번호를 설정해주세요.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className={labelClass}>새 비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>비밀번호 확인</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              className={inputClass}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="mt-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? '설정 중...' : '설정하고 시작하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
