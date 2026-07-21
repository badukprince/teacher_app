export const GRADE_OPTIONS = [
  '초1', '초2', '초3', '초4', '초5', '초6',
  '중1', '중2', '중3',
  '고1', '고2', '고3',
] as const;

export const STATUS_OPTIONS = ['재원', '휴원', '퇴원'] as const;

export const WEEKDAY_OPTIONS = ['월', '화', '수', '목', '금', '토', '일'] as const;

export const CLASS_LOCATION_OPTIONS = ['오프라인', '온라인'] as const;

export const ATTENDANCE_STATUS_OPTIONS = ['출석', '지각', '결석', '조퇴'] as const;

export const PARENT_RELATION_OPTIONS = ['모', '부', '조부모', '기타'] as const;

export const CONSULTATION_TYPE_OPTIONS = ['전화', '방문', '문자/카톡', '기타'] as const;

export const STAGE_OPTIONS = ['입문', '기초', '표준', '심화', '고급'] as const;
