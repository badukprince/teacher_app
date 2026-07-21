import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarNav } from './SidebarNav';
import { MenuIcon, LogoutIcon, XIcon } from '../icons';
import { ErrorBoundary } from '../ErrorBoundary';
import { useAuth } from '../../store/AuthContext';

export function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const { session, signOut } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col print:!hidden">
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">
            독
          </div>
          <span className="text-base font-semibold text-slate-900">독서논술 매니저</span>
        </div>
        <SidebarNav />
        <div className="shrink-0 border-t border-slate-200 p-3">
          {session?.user.email && <p className="truncate px-2 text-xs text-slate-400">{session.user.email}</p>}
          <button
            type="button"
            onClick={signOut}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <LogoutIcon className="h-5 w-5 shrink-0" />
            로그아웃
          </button>
        </div>
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            aria-label="메뉴 닫기"
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col bg-white shadow-xl">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">
                  독
                </div>
                <span className="text-base font-semibold text-slate-900">독서논술 매니저</span>
              </div>
              <button
                aria-label="메뉴 닫기"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                onClick={() => setDrawerOpen(false)}
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav onNavigate={() => setDrawerOpen(false)} />
            <div className="shrink-0 border-t border-slate-200 p-3">
              {session?.user.email && <p className="truncate px-2 text-xs text-slate-400">{session.user.email}</p>}
              <button
                type="button"
                onClick={signOut}
                className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                <LogoutIcon className="h-5 w-5 shrink-0" />
                로그아웃
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 md:hidden print:!hidden">
          <button
            aria-label="메뉴 열기"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-xs font-bold text-white">
              독
            </div>
            <span className="text-sm font-semibold text-slate-900">독서논술 매니저</span>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8 print:p-0">
          <div className="mx-auto w-full max-w-6xl print:max-w-none">
            <ErrorBoundary key={location.pathname}>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
