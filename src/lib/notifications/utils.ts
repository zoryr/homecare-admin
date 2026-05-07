import type { NotificationSettings } from './types';

/**
 * Vérifie si l'heure courante tombe dans la plage "silencieuse".
 * Plages possibles :
 *  - intra-journée : start=8, end=20  → silence entre 08h et 20h (peu probable mais supporté)
 *  - chevauche minuit : start=21, end=7 → silence de 21h à 7h le lendemain (cas standard)
 */
export function isInQuietHours(now: Date, settings: NotificationSettings): boolean {
  if (!settings.quiet_hours_enabled) return false;
  const h = now.getHours();
  const start = settings.quiet_hours_start;
  const end = settings.quiet_hours_end;
  return start < end ? h >= start && h < end : h >= start || h < end;
}

/**
 * Retourne le début de la prochaine plage active (= fin de la plage silencieuse courante).
 * Si on n'est pas en heures silencieuses, retourne `now`.
 */
export function getNextActiveTime(now: Date, settings: NotificationSettings): Date {
  if (!isInQuietHours(now, settings)) return now;
  const next = new Date(now);
  const start = settings.quiet_hours_start;
  const end = settings.quiet_hours_end;
  const h = now.getHours();
  if (start < end) {
    next.setHours(end, 0, 0, 0);
  } else if (h >= start) {
    next.setDate(next.getDate() + 1);
    next.setHours(end, 0, 0, 0);
  } else {
    next.setHours(end, 0, 0, 0);
  }
  return next;
}

export function formatHour(h: number): string {
  return `${h.toString().padStart(2, '0')}h`;
}
