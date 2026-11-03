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
  // NU: îndeplinită când condițiile din ea nu sunt (de exemplu nicovala goală se vede cât fierarul nu e afară)
  nu: (v, c) => !verifica(v, c),
  // „existaStare: scandal_taverna” = s-a întâmplat deja, oricum s-ar fi terminat
  existaStare: (v, c) => c.stari?.[v] != null,
  // „trecut: { soldat_ranit: { subZile: 2 } }” = marcajul (pus de efectul „marcheaza”) e mai nou de 2 zile.
  // Fără marcaj, condiția nu e îndeplinită (lucrul nu s-a întâmplat)
  trecut: (v, c) =>
    Object.entries(v).every(([k, lim]) => {
      const la = c.marcaje?.[k];
      if (la == null || c.minute == null) return false;
      const zile = (c.minute - la) / 1440;
      return (lim.subZile == null || zile < lim.subZile) && (lim.pesteZile == null || zile >= lim.pesteZile);
    }),
  // „inchiriat: taverna” = Vale are acum camera plătită (până la prânzul de după noaptea pentru care a plătit-o)
  // „taxaRatata: true” = Vale a rămas dator cel puțin o dată (paznicul îi aduce aminte)
  taxaRatata: (v, c) => ((c.taxa?.ratari || 0) > 0) === v,
  inchiriat: (v, c) => (c.inchirieri?.[v] ?? -1) > (c.minute ?? 0),
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
