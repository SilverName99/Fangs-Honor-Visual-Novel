import { inMinute } from './timp.js';

// Registru, nu switch: un tip nou de condiție se adaugă fără să atingi verificarea
const tipuri = {
  moment: (v, c) => v.includes(c.moment),
  ora: (v, c) => (!v.min || c.minuteZi >= inMinute(v.min)) && (!v.max || c.minuteZi <= inMinute(v.max)),
  loc: (v, c) => c.loc === v,
  stare: (v, c) => Object.entries(v).every(([k, val]) => c.stari?.[k] === val),
  nuStare: (v, c) => Object.entries(v).every(([k, val]) => c.stari?.[k] !== val),
  areObiect: (v, c) => (c.obiecte || []).includes(v),
  // „areCate: { lemn: 10 }” = are cel puțin atâtea bucăți în rucsac (pentru misiuni: lemnele pentru acoperiș)
  areCate: (v, c) => Object.entries(v).every(([id, n]) => (c.inventar || []).filter((x) => x.id === id).reduce((s, x) => s + x.n, 0) >= n),
  misiune: (v, c) => Object.entries(v).every(([k, val]) => c.misiuni?.[k] === val),
  relatie: (v, c) =>
    Object.entries(v).every(([k, lim]) => {
      const r = c.relatii?.[k] ?? 0;
      return (lim.min == null || r >= lim.min) && (lim.max == null || r <= lim.max);
    }),
  // „nevoie: { stamina: { min: 30 } }” = nevoia lui Vale e între limite (mama nu-l lasă pe acoperiș frânt de oboseală)
  nevoie: (v, c) =>
    Object.entries(v).every(([k, lim]) => {
      const n = c.nevoi?.[k] ?? 0;
      return (lim.min == null || n >= lim.min) && (lim.max == null || n <= lim.max);
    }),
  bani: (v, c) => (v.min == null || c.bani >= v.min) && (v.max == null || c.bani <= v.max),
  deblocat: (v, c) => (c.deblocate || []).includes(v),
  zileSaptamana: (v, c) => v.includes(c.ziSaptamana),
  zi: (v, c) => (v.min == null || c.zi >= v.min) && (v.max == null || c.zi <= v.max),
  // „cunoscutDeZile: { fierar: 1 }” = Vale l-a cunoscut și au trecut de atunci cel puțin atâtea zile din calendar
  // (decis de autor: o misiune apare după prima discuție și după câteva zile). Cine e cunoscut dintr-o salvare
  // mai veche, fără ziua întâlnirii, contează ca întâlnit în ziua 1
  cunoscutDeZile: (v, c) =>
    Object.entries(v).every(([id, n]) => {
      const inCarte = (c.cunoscuti || []).includes(id);
      if (!inCarte && c.stari?.[`cunoscut_${id}`] !== 'da') return false;
      // Chiar în prima discuție (prezentarea a pus deja „cunoscut_<id>”, dar ziua întâlnirii se scrie abia la
      // sfârșitul ei) întâlnirea e de azi, nu din ziua 1: altfel misiunea apărea imediat și dispărea la a doua discuție
      return c.zi - (c.cunoscutLa?.[id] ?? (inCarte ? 1 : c.zi)) >= n;
    }),
  // „contor: { vanatori_castigate: { min: 1 } }” = numărătorile din salvare (vânători, încercări...)
  contor: (v, c) =>
    Object.entries(v).every(([k, lim]) => {
      const n = c.contoare?.[k] ?? 0;
      return (lim.min == null || n >= lim.min) && (lim.max == null || n <= lim.max);
    }),
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
  // „marcatAzi: bandaj_miriam” = marcajul (efectul „marcheaza”) e din ziua de azi (o dată pe zi, ca bandajul mamei)
  marcatAzi: (v, c) => c.marcaje?.[v] != null && c.minute != null && Math.floor(c.marcaje[v] / 1440) === Math.floor(c.minute / 1440),
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
