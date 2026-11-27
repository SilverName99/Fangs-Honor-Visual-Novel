import { inMinute } from './timp.js';

// Registru, nu switch: un tip nou de condiție se adaugă fără să atingi verificarea
const tipuri = {
  moment: (v, c) => v.includes(c.moment),
  ora: (v, c) => (!v.min || c.minuteZi >= inMinute(v.min)) && (!v.max || c.minuteZi <= inMinute(v.max)),
  loc: (v, c) => c.loc === v,
  stare: (v, c) => Object.entries(v).every(([k, val]) => c.stari?.[k] === val),
  nuStare: (v, c) => Object.entries(v).every(([k, val]) => c.stari?.[k] !== val),
  areObiect: (v, c) => (c.obiecte || []).includes(v),
  // „areLaEl: ["sabie", "sabia_tata"]” = măcar unul e la Vale, în rucsac sau echipat (nu și în cufărul de acasă):
  // la antrenamentul cu Roderick vine cu sabia lui (decis de autor)
  areLaEl: (v, c) => [].concat(v).some((id) => (c.inventar || []).some((x) => x.id === id) || Object.values(c.echipat || {}).includes(id)),
  // „areCate: { lemn: 10 }” = are cel puțin atâtea bucăți în rucsac (pentru misiuni: lemnele pentru acoperiș)
  areCate: (v, c) => Object.entries(v).every(([id, n]) => (c.inventar || []).filter((x) => x.id === id).reduce((s, x) => s + x.n, 0) + (c.povesteNumar?.[id] || 0) >= n),
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
  // „misiuneTerminata: { agnes_camera: 1 }” = terminată de cel puțin o zi (decis de autor: între misiunile unui
  // personaj e o zi pauză); o misiune terminată înainte să se țină minte ziua trece drept veche
  misiuneTerminata: (v, c) =>
    Object.entries(v).every(([id, zile]) => c.misiuni?.[id] === 'terminata' && c.zi - (c.terminateLa?.[id] ?? -Infinity) >= zile),
  // „trecut: { soldat_ranit: { subZile: 2 } }” = marcajul (pus de efectul „marcheaza”) e mai nou de 2 zile.
  // Fără marcaj, condiția nu e îndeplinită (lucrul nu s-a întâmplat)
  trecut: (v, c) =>
    Object.entries(v).every(([k, lim]) => {
      const la = c.marcaje?.[k];
      if (la == null || c.minute == null) return false;
      const zile = (c.minute - la) / 1440;
      return (lim.subZile == null || zile < lim.subZile) && (lim.pesteZile == null || zile >= lim.pesteZile);
    }),
  // „noapteaDupa: { marcaj, de, pana, cand }” = prima noapte de după marcaj (decis de autor: Kaia îl cheamă pe Vale
  // „la noapte”, iar noaptea de după e prea târziu). Noaptea începe la primul „de” (implicit 23:00) de după marcaj și
  // ține până la „pana” (implicit 05:00) din dimineața următoare. cand: "in" (implicit) = acum e în fereastra aceea;
  // "dupa" = fereastra a trecut. Fără marcaj, condiția nu e îndeplinită (nimeni n-a propus nimic)
  noapteaDupa: (v, c) => {
    const la = c.marcaje?.[v.marcaj];
    if (la == null || c.minute == null) return false;
    const de = inMinute(v.de || '23:00');
    let start = Math.floor(la / 1440) * 1440 + de;
    if (start < la) start += 1440;
    const sfarsit = start + ((inMinute(v.pana || '05:00') - de + 1440) % 1440 || 1440);
    // "pana" = noaptea n-a trecut încă (urmează sau e acum): invitația la foc nu se mai cere încă o dată până atunci
    if (v.cand === 'pana') return c.minute < sfarsit;
    return v.cand === 'dupa' ? c.minute >= sfarsit : c.minute >= start && c.minute < sfarsit;
  },
  // „cateDin: { min: 3, lista: [ ... ] }” = cel puțin atâtea dintre condițiile din listă sunt îndeplinite. Așa se
  // socotește cine nu mai poate ajunge la 8/10 (misiunea „Revolta”): fiecare condiție e un punct de încredere ratat
  cateDin: (v, c) => (v.lista || []).filter((cond) => verifica(cond, c)).length >= (v.min ?? 1),
  // „zileDeLa: { ziua_linei: { min: 3, max: 3 } }” = câte zile din calendar au trecut de la marcaj, oricât de devreme
  // sau de târziu în zi s-a întâmplat (decis de autor: Finn spune „în 3 zile e ziua Linei”, deci a treia zi de după,
  // nu după 72 de ore). Fără marcaj, condiția nu e îndeplinită
  zileDeLa: (v, c) =>
    Object.entries(v).every(([k, lim]) => {
      const la = c.marcaje?.[k];
      if (la == null || c.minute == null) return false;
      const zile = Math.floor(c.minute / 1440) - Math.floor(la / 1440);
      return (lim.min == null || zile >= lim.min) && (lim.max == null || zile <= lim.max);
    }),
  // „marcatAzi: bandaj_miriam” = marcajul (efectul „marcheaza”) e din ziua de azi (o dată pe zi, ca bandajul mamei).
  // „marcatAzi: { id, deLa: '05:00' }” = ziua începe la ora aceea, pentru cine stă și după miezul nopții („vino mâine”
  // spus la 00:30 înseamnă după ce se face ziuă, nu peste o jumătate de oră)
  marcatAzi: (v, c) => {
    const id = typeof v === 'string' ? v : v.id;
    const dupa = typeof v === 'string' ? 0 : inMinute(v.deLa || '00:00');
    return c.marcaje?.[id] != null && c.minute != null && Math.floor((c.marcaje[id] - dupa) / 1440) === Math.floor((c.minute - dupa) / 1440);
  },
  // „inchiriat: taverna” = Vale are acum camera plătită (până la prânzul de după noaptea pentru care a plătit-o)
  // „taxaRatata: true” = Vale a rămas dator cel puțin o dată (paznicul îi aduce aminte)
  taxaRatata: (v, c) => ((c.taxa?.ratari || 0) > 0) === v,
  // „datorieBlanuri: false” = orcii nu așteaptă blănuri de la Vale acum (cu termenul curgând, nu poate pleca departe)
  datorieBlanuri: (v, c) => !!c.datorieBlanuri === v,
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
