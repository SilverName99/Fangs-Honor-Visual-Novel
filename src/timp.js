export const MINUTE_ZI = 24 * 60;

export function inMinute(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function momentZi(minuteZi) {
  if (minuteZi >= 300 && minuteZi < 600) return 'dimineata';
  if (minuteZi >= 600 && minuteZi < 1080) return 'amiaza';
  if (minuteZi >= 1080 && minuteZi < 1380) return 'seara';
  return 'noaptea';
}
