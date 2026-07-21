import type { AttendanceStatus } from '../types/student';

export const ATTENDANCE_STATUS_BADGE: Record<AttendanceStatus, string> = {
  출석: 'bg-emerald-50 text-emerald-700',
  지각: 'bg-amber-50 text-amber-700',
  결석: 'bg-red-50 text-red-700',
  조퇴: 'bg-sky-50 text-sky-700',
};

export const ATTENDANCE_STATUS_SOLID: Record<AttendanceStatus, string> = {
  출석: 'bg-emerald-600 text-white',
  지각: 'bg-amber-500 text-white',
  결석: 'bg-red-500 text-white',
  조퇴: 'bg-sky-500 text-white',
};
