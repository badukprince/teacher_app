import { WEEKDAYS, type SchoolClass, type Weekday } from '../types/student';

export function todayWeekday(date: Date = new Date()): Weekday {
  return WEEKDAYS[(date.getDay() + 6) % 7];
}

export function isClassToday(schoolClass: SchoolClass, date: Date = new Date()): boolean {
  return schoolClass.daysOfWeek.includes(todayWeekday(date));
}

export const WEEKDAY_FULL_LABEL: Record<Weekday, string> = {
  월: '월요일',
  화: '화요일',
  수: '수요일',
  목: '목요일',
  금: '금요일',
  토: '토요일',
  일: '일요일',
};

export function formatClassSchedule(schoolClass: Pick<SchoolClass, 'daysOfWeek' | 'time'>): string {
  const days = [...schoolClass.daysOfWeek].sort((a, b) => WEEKDAYS.indexOf(a) - WEEKDAYS.indexOf(b));
  if (days.length === 0) return '요일 미지정';
  const dayLabel = days.join(', ');
  return schoolClass.time ? `${dayLabel} · ${schoolClass.time}` : dayLabel;
}
