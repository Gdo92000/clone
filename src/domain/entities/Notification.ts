export type NotificationType =
  | 'order'
  | 'system'
  | 'promotion'
  | 'billing'
  | 'support';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, string>;
}
