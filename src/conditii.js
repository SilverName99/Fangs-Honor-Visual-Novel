import { inMinute } from './timp.js';

// Registru, nu switch: un tip nou de condiție se adaugă fără să atingi verificarea
const tipuri = {
  moment: (v, c) => v.includes(c.moment),
  ora: (v, c) => (!v.min || c.minuteZi >= inMinute(v.min)) && (!v.max || c.minuteZi <= inMinute(v.max)),
  loc: (v, c) => c.loc === v,
  stare: (v, c) => Object.entries(v).every(([k, val]) => c.stari?.[k] === val),
  nuStare: (v, c) => Object.entries(v).every(([k, val]) => c.stari?.[k] !== val),
  areObiect: (v, c) => (c.obiecte || []).includes(v),
  misiune: (v, c) => Object.entries(v).every(([k, val]) => c.misiuni?.[k] === val),
  relatie: (v, c) =>
    Object.entries(v).every(([k, lim]) => {
      const r = c.relatii?.[k] ?? 0;
      return (lim.min == null || r >= lim.min) && (lim.max == null || r <= lim.max);
    }),
  bani: (v, c) => (v.min == null || c.bani >= v.min) && (v.max == null || c.bani <= v.max),
  deblocat: (v, c) => (c.deblocate || []).includes(v),
  zileSaptamana: (v, c) => v.includes(c.ziSaptamana),
  zi: (v, c) => (v.min == null || c.zi >= v.min) && (v.max == null || c.zi <= v.max),
  sansa: (v, c) => (c.aleator ?? Math.random)() < v,
  // SAU: e destul ca una dintre condiții să fie îndeplinită (de exemplu fierarul e acasă SAU ai cheia)
  oricare: (v, c) => v.some((cond) => verifica(cond, c)),
};

export function registreazaConditie(nume, functie) {
  tipuri[nume] = functie;
}

export function verifica(conditii, context) {
  if (!conditii) return true;
  return Object.entries(conditii).every(([tip, valoare]) => {
    const f = tipuri[tip];
    if (!f) {
      // O condiție necunoscută e aproape sigur o greșeală de scriere în JSON; mai bine blocată decât deschisă din greșeală
      console.warn('Condiție necunoscută:', tip);
      return false;
    }
    return f(valoare, context);
  });
}
