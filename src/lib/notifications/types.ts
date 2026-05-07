export type NotificationSource =
  | 'auto_actu'
  | 'auto_reglement'
  | 'auto_sondage'
  | 'manuelle';

export type NotificationAudience = 'all' | 'selection';

export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'read' | 'clicked';

export interface Notification {
  id: string;
  titre: string;
  message: string;
  source: NotificationSource;
  source_id: string | null;
  deeplink_path: string | null;
  audience: NotificationAudience;
  audience_user_ids: string[];
  scheduled_at: string | null;
  sent_at: string | null;
  cancelled_at: string | null;
  created_by: string;
  created_at: string;
}

export interface NotificationStats {
  notification_id: string;
  total: number;
  sent: number;
  failed: number;
  read: number;
  clicked: number;
}

export interface NotificationSettings {
  id: number;
  auto_on_actu_publish: boolean;
  auto_on_reglement_publish: boolean;
  auto_on_sondage_create: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: number;
  quiet_hours_end: number;
}

export const SOURCE_LABELS: Record<NotificationSource, string> = {
  auto_actu: 'Actualité',
  auto_reglement: 'Règlement',
  auto_sondage: 'Sondage',
  manuelle: 'Message',
};
