import { Outlet } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { useParentData } from '../../store/ParentDataContext';
import { LogoutIcon } from '../icons';
import { ErrorBoundary } from '../ErrorBoundary';

export function ParentLayout() {
  const { signOut } = useAuth();
  const { student } = useParentData();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">
            독
          </div>
          <span className="truncate text-sm font-semibold text-slate-900">
            {student ? `${student.name} 학생 학부모님` : '독서논술 매니저'}
          </span>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          <LogoutIcon className="h-4 w-4" />
          로그아웃
        </button>
      </header>

      <main className="px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto w-full max-w-4xl">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
