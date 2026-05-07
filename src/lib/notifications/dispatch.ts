/**
 * Helper côté serveur : déclenche l'envoi d'une notification existante
 * en appelant l'Edge Function send-notification.
 *
 * Doit être appelé depuis un Route Handler ou Server Action — JAMAIS côté client
 * (utilise SUPABASE_SERVICE_ROLE_KEY).
 */
export async function dispatchNotification(notificationId: string): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Supabase URL ou service role key manquant');
  }

  // On await pour garantir l'exécution sur Vercel (sinon la function serverless
  // peut être tuée avant que le fetch parte). L'edge function répond généralement
  // sous quelques secondes même pour des batchs de plusieurs centaines de tokens.
  const res = await fetch(`${url}/functions/v1/send-notification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ notification_id: notificationId }),
  });

  if (!res.ok) {
    // On ne throw pas pour ne pas casser la requête initiale (publish actu, etc.)
    // L'erreur sera visible dans les logs Edge Functions Supabase.
    const text = await res.text().catch(() => '');
    console.error('[dispatchNotification] edge function error:', res.status, text);
  }
}
