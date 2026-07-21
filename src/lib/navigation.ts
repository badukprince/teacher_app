import {
  ArchiveIcon,
  BookOpenIcon,
  CalendarCheckIcon,
  ChatIcon,
  ClipboardCheckIcon,
  CogIcon,
  HomeIcon,
  UsersIcon,
} from '../components/icons';

export const NAV_ITEMS = [
  { to: '/', label: '대시보드', icon: HomeIcon, end: true },
  { to: '/students', label: '학생관리', icon: UsersIcon, end: false },
  { to: '/curriculum', label: '수업/커리큘럼', icon: BookOpenIcon, end: false },
  { to: '/evaluations', label: '수업평가', icon: ClipboardCheckIcon, end: false },
  { to: '/attendance', label: '출결관리', icon: CalendarCheckIcon, end: false },
  { to: '/communication', label: '학부모 소통', icon: ChatIcon, end: false },
  { to: '/resources', label: '자료실', icon: ArchiveIcon, end: false },
  { to: '/settings', label: '마이페이지/설정', icon: CogIcon, end: false },
] as const;
