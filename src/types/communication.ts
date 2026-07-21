export const NOTIFICATION_TYPES = ['출결', '수업진도', '수업평가', '종합'] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const SEND_CHANNELS = ['이메일', '카카오톡'] as const;
export type SendChannel = (typeof SEND_CHANNELS)[number];

export interface NotificationLog {
  id: string;
  studentId: string;
  type: NotificationType;
  channel: SendChannel;
  subject: string;
  body: string;
  sentAt: string;
  answered: boolean;
}

export type NotificationLogInput = Pick<NotificationLog, 'studentId' | 'type' | 'channel' | 'subject' | 'body'>;
