import { createClient } from '@/lib/supabase/server';
import type { Notification, NotificationSettings } from '@/lib/notifications/types';
import NotificationsClient, { type NotifWithStats } from './NotificationsClient';
import type { ActiveProfile } from './NotificationComposer';

export default async function NotificationsAdminPage() {
  const supabase = createClient();

  const [
    { data: settingsRow },
    { data: notifsRows },
    { count: activeCount },
    { data: activeProfilesRows },
  ] = await Promise.all([
    supabase.from('notification_settings').select('*').eq('id', 1).single(),
    supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('actif', true),
    supabase.from('profiles').select('id, email, prenom, nom').eq('actif', true).order('email'),
  ]);

  const settings = settingsRow as NotificationSettings | null;
  const notifs = (notifsRows ?? []) as Notification[];
  const totalActive = activeCount ?? 0;
  const activeProfiles = (activeProfilesRows ?? []) as ActiveProfile[];

  // Stats agrégées : 1 query par notif aurait été cher. On fait 1 query globale + groupe.
  const ids = notifs.map((n) => n.id);
  let withStats: NotifWithStats[] = notifs.map((n) => ({
    ...n,
    stats: { total: 0, sent: 0, failed: 0, read: 0 },
  }));

  if (ids.length > 0) {
    const { data: deliveriesRows } = await supabase
      .from('notification_deliveries')
      .select('notification_id, status, read_at')
      .in('notification_id', ids);
    const deliveries = deliveriesRows ?? [];
    const byNotif = new Map<string, { total: number; sent: number; failed: number; read: number }>();
    for (const d of deliveries) {
      const id = d.notification_id as string;
      const existing = byNotif.get(id) ?? { total: 0, sent: 0, failed: 0, read: 0 };
      existing.total += 1;
      const status = d.status as string;
      if (status === 'sent' || status === 'read' || status === 'clicked') existing.sent += 1;
      if (status === 'failed') existing.failed += 1;
      if (d.read_at !== null) existing.read += 1;
      byNotif.set(id, existing);
    }
    withStats = notifs.map((n) => ({
      ...n,
      stats: byNotif.get(n.id) ?? { total: 0, sent: 0, failed: 0, read: 0 },
    }));
  }

  return (
    <NotificationsClient
      settings={
        settings ?? {
          id: 1,
          auto_on_actu_publish: true,
          auto_on_reglement_publish: true,
          auto_on_sondage_create: true,
          quiet_hours_enabled: true,
          quiet_hours_start: 21,
          quiet_hours_end: 7,
        }
      }
      notifs={withStats}
      totalActive={totalActive}
      activeProfiles={activeProfiles}
    />
  );
}
