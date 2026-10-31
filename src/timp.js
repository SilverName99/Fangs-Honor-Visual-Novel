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

// Zilele săptămânii: ziua 1 a jocului e luni (alegere simplă), deci weekendul cade în zilele 6-7, 13-14...
export const ZILE = ['luni', 'marti', 'miercuri', 'joi', 'vineri', 'sambata', 'duminica'];
export const NUME_ZILE = { luni: 'Luni', marti: 'Marți', miercuri: 'Miercuri', joi: 'Joi', vineri: 'Vineri', sambata: 'Sâmbătă', duminica: 'Duminică' };
export const ziSaptamana = (zi) => ZILE[(zi - 1) % 7];
