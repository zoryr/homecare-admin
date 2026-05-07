// deno-lint-ignore-file no-explicit-any
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

import { corsHeaders } from '../_shared/cors.ts';

type Body = { notification_id?: string };

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const BATCH_SIZE = 100;

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as Body;
    if (!body.notification_id) {
      return json({ error: 'notification_id requis' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } },
    );

    // 1. Charge la notification
    const { data: notif, error: notifErr } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', body.notification_id)
      .single();

    if (notifErr || !notif) {
      return json({ error: 'Notification introuvable' }, 404);
    }

    if (notif.cancelled_at) return json({ skipped: 'cancelled' }, 200);
    if (notif.sent_at) return json({ skipped: 'already_sent' }, 200);

    // 2. Future ? Le cron s'en occupera.
    if (notif.scheduled_at && new Date(notif.scheduled_at).getTime() > Date.now()) {
      return json({ skipped: 'scheduled_for_future' }, 200);
    }

    // 3. Heures silencieuses → reprogrammer
    const { data: settings } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (settings?.quiet_hours_enabled) {
      const now = new Date();
      const h = now.getHours();
      const start = settings.quiet_hours_start as number;
      const end = settings.quiet_hours_end as number;
      const inQuiet = start < end ? h >= start && h < end : h >= start || h < end;
      if (inQuiet) {
        const next = new Date(now);
        if (start < end) {
          next.setHours(end, 0, 0, 0);
        } else if (h >= start) {
          next.setDate(next.getDate() + 1);
          next.setHours(end, 0, 0, 0);
        } else {
          next.setHours(end, 0, 0, 0);
        }
        await supabase
          .from('notifications')
          .update({ scheduled_at: next.toISOString() })
          .eq('id', notif.id);
        return json({ rescheduled_to: next.toISOString() }, 200);
      }
    }

    // 4. Calcul des destinataires
    let userIds: string[] = [];
    if (notif.audience === 'all') {
      const { data: users } = await supabase
        .from('profiles')
        .select('id')
        .eq('actif', true);
      userIds = (users ?? []).map((u: { id: string }) => u.id);
    } else {
      userIds = (notif.audience_user_ids as string[]) ?? [];
    }

    if (userIds.length === 0) {
      await supabase
        .from('notifications')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', notif.id);
      return json({ success: true, sent_count: 0, failed_count: 0, note: 'no_recipients' }, 200);
    }

    // 5. Récupère tous les tokens actifs de ces users
    const { data: tokens } = await supabase
      .from('device_tokens')
      .select('user_id, expo_push_token, platform')
      .in('user_id', userIds)
      .eq('active', true);

    const validTokens = (tokens ?? []).filter((t: { expo_push_token: string }) =>
      t.expo_push_token.startsWith('ExponentPushToken['),
    );

    // 6. Envoi par batch à Expo
    const messages = validTokens.map((t: { expo_push_token: string }) => ({
      to: t.expo_push_token,
      title: notif.titre,
      body: notif.message,
      sound: 'default',
      data: notif.deeplink_path ? { deeplink_path: notif.deeplink_path } : {},
    }));

    let sentCount = 0;
    let failedCount = 0;
    const deliveries: any[] = [];

    for (let i = 0; i < messages.length; i += BATCH_SIZE) {
      const batch = messages.slice(i, i + BATCH_SIZE);
      const batchTokens = validTokens.slice(i, i + BATCH_SIZE);

      try {
        const expoRes = await fetch(EXPO_PUSH_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'Accept-Encoding': 'gzip, deflate',
          },
          body: JSON.stringify(batch),
        });

        const expoJson = (await expoRes.json()) as { data?: any[]; errors?: any[] };
        const tickets = expoJson.data ?? [];

        tickets.forEach((ticket: any, idx: number) => {
          const tokenInfo = batchTokens[idx];
          if (ticket.status === 'ok') {
            sentCount++;
            deliveries.push({
              notification_id: notif.id,
              user_id: tokenInfo.user_id,
              expo_push_token: tokenInfo.expo_push_token,
              platform: tokenInfo.platform,
              status: 'sent',
              sent_at: new Date().toISOString(),
            });
          } else {
            failedCount++;
            deliveries.push({
              notification_id: notif.id,
              user_id: tokenInfo.user_id,
              expo_push_token: tokenInfo.expo_push_token,
              platform: tokenInfo.platform,
              status: 'failed',
              error_message: ticket.message ?? ticket.details?.error ?? 'unknown',
            });
            // Désactive le token si DeviceNotRegistered
            if (ticket.details?.error === 'DeviceNotRegistered') {
              supabase
                .from('device_tokens')
                .update({ active: false })
                .eq('expo_push_token', tokenInfo.expo_push_token)
                .then(() => {});
            }
          }
        });
      } catch (err) {
        failedCount += batch.length;
        for (const t of batchTokens) {
          deliveries.push({
            notification_id: notif.id,
            user_id: t.user_id,
            expo_push_token: t.expo_push_token,
            platform: t.platform,
            status: 'failed',
            error_message: err instanceof Error ? err.message : 'fetch_error',
          });
        }
      }
    }

    if (deliveries.length > 0) {
      await supabase.from('notification_deliveries').upsert(deliveries, {
        onConflict: 'notification_id,user_id,expo_push_token',
      });
    }

    await supabase
      .from('notifications')
      .update({ sent_at: new Date().toISOString() })
      .eq('id', notif.id);

    return json({ success: true, sent_count: sentCount, failed_count: failedCount }, 200);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'unknown' }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
