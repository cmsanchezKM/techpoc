export type RelativeDateInfo = {
  type: 'seconds' | 'minutes' | 'hours' | 'yesterday' | 'date';
  count: number;
};

/** Clasifica una fecha respecto a ahora: <1min "segundos", <1h "minutos", <24h "horas", <48h "ayer", si no "date". */
export function getRelativeDateInfo(date: string, now: number = Date.now()): RelativeDateInfo {
  const diffSeconds = (now - new Date(date).getTime()) / 1000;

  if (diffSeconds < 60) {
    return { type: 'seconds', count: Math.max(1, Math.floor(diffSeconds)) };
  }
  const diffMinutes = diffSeconds / 60;
  if (diffMinutes < 60) {
    return { type: 'minutes', count: Math.floor(diffMinutes) };
  }
  const diffHours = diffMinutes / 60;
  if (diffHours < 24) {
    return { type: 'hours', count: Math.floor(diffHours) };
  }
  if (diffHours < 48) {
    return { type: 'yesterday', count: 0 };
  }
  return { type: 'date', count: 0 };
}
