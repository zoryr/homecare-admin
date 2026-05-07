import { createAdminClient } from '@/lib/supabase/admin';
import type { NotificationAudience, NotificationSource } from './types';
import { dispatchNotification } from './dispatch';

export type CreateNotificationInput = {
  titre: string;
  message: string;
  source: NotificationSource;
  source_id?: string | null;
  deeplink_path?: string | null;
  audience: NotificationAudience;
  audience_user_ids?: string[];
  scheduled_at?: string | null;
  created_by: string;
};

/**
 * Crée une ligne dans `notifications` et déclenche l'envoi (sauf si scheduled_at futur).
 * Utilisé à la fois par les API routes (manuel + test) et par les hooks auto (publish actu).
 */
export async function createAndDispatchNotification(
  input: CreateNotificationInput,
): Promise<{ id: string }> {
  const admin = createAdminClient();
  const now = new Date();
  const scheduledAt = input.scheduled_at
    ? new Date(input.scheduled_at)
    : now;
  const isFuture = scheduledAt.getTime() > now.getTime() + 1000;

  const { data, error } = await admin
    .from('notifications')
    .insert({
      titre: input.titre,
      message: input.message,
      source: input.source,
      source_id: input.source_id ?? null,
      deeplink_path: input.deeplink_path ?? null,
      audience: input.audience,
      audience_user_ids: input.audience_user_ids ?? [],
      scheduled_at: scheduledAt.toISOString(),
      created_by: input.created_by,
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Notification non créée');
  }

  if (!isFuture) {
    // Envoi immédiat (le cron prendra le relais sur les futures)
    await dispatchNotification(data.id);
  }

  return { id: data.id };
}
