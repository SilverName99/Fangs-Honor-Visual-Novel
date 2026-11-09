import { schimbaNevoie } from './stare.js';
import { MINUTE_ZI, inMinute } from './timp.js';

// Registru de efecte: evenimentele, dialogurile (și mai târziu abilitățile din luptă) folosesc aceleași funcții.
// Un efect nou = o funcție nouă aici, fără să atingi restul codului.
const efecte = {
  timp: (v, joc) => joc.avanseaza(v),
  // „panaLaOra: "19:00"”: timpul trece până la ora aceea (azi, sau mâine dacă a trecut); berea lui Agnes e gata seara
  panaLaOra: (v, joc) => {
    const [h, m] = v.split(':').map(Number);
    const acum = joc.stare.minute % 1440;
    const tinta = h * 60 + m;
    joc.avanseaza((tinta - acum + 1440) % 1440);
  },
  // Ce primește Vale (bani, încredere, obiecte) se ține minte puțin, ca la sfârșitul unei misiuni să urce pe ecran
  bani: (v, joc) => {
    joc.stare.bani = Math.max(0, joc.stare.bani + v);
    if (v > 0) joc.inregistreazaCastig?.({ tip: 'bani', n: v });
  },
  nevoi: (v, joc) => Object.entries(v).forEach(([k, cu]) => schimbaNevoie(joc.stare, k, cu)),
  reputatie: (v, joc) => (joc.stare.reputatie += v),
  // Încrederea stă între 0 și maxim (10), ca bara din cartea personajelor să nu iasă din scară
  relatie: (v, joc) =>
    Object.entries(v).forEach(([id, cu]) => {
      joc.stare.relatii[id] = Math.max(0, Math.min(joc.date.config.incredere?.max ?? 10, (joc.stare.relatii[id] || 0) + cu));
      if (cu > 0) joc.inregistreazaCastig?.({ tip: 'incredere', id, n: cu });
    }),
  obiect: (v, joc) =>
    [].concat(v).forEach((id) => {
      joc.primeste(id, 1);
      joc.inregistreazaCastig?.({ tip: 'obiect', id, n: 1 });
    }),
  // Orcii iau un lucru (fierul lui Bram): stă la ei, iar la zaruri e primul pus pe masă (se poate câștiga înapoi)
  confisca: (v, joc) => [].concat(v).forEach((id) => joc.stare.confiscate.includes(id) || joc.stare.confiscate.unshift(id)),
  // Lucrul confiscat ajunge înapoi la Vale (plătit, câștigat), deci nu mai e la orci
  // Un obiect luat de orci, recăpătat; unele au un eveniment al lor după aceea (fierul lui Bram: colectorul
  // îi spune lui Vale că-l mai așteaptă la poartă)
  recupereaza: (v, joc) =>
    [].concat(v).forEach((id) => {
      const i = joc.stare.confiscate.indexOf(id);
      if (i >= 0) joc.stare.confiscate.splice(i, 1);
      joc.primeste(id, 1);
      const ev = joc.inventar.def(id)?.evenimentRecuperat;
      if (ev) joc.pornesteEvenimentDupa(ev);
    }),
  daObiect: (v, joc) => [].concat(v).forEach((id) => joc.inventar.scoateOriunde(id, 1)),
  // „consuma: { lemn: 10 }” = Vale dă (sau folosește) atâtea bucăți din rucsac
  consuma: (v, joc) => Object.entries(v).forEach(([id, n]) => joc.inventar.scoateOriunde(id, n)),
  // Replicile din „Vorbește” deja auzite: cele noi vin primele, apoi toate la întâmplare
  auzit: (v, joc) => (joc.stare.auzite ||= []).includes(v) || joc.stare.auzite.push(v),
  stare: (v, joc) => Object.assign(joc.stare.stari, v),
  deblocheaza: (v, joc) => [].concat(v).forEach((loc) => joc.stare.deblocate.includes(loc) || joc.stare.deblocate.push(loc)),
  // O misiune nouă intră în carte (în ordinea în care a început) și se anunță pe ecran
  misiune: (v, joc) =>
    Object.entries(v).forEach(([id, st]) => {
      const s = joc.stare;
      if (st === 'inceputa' && !s.misiuni[id]) {
        // Pentru testare: jocul de dinainte de misiune, ca „Resetează” din F2 să poată reveni la el
        joc.retineInainteDeMisiune?.(id);
        (s.ordineMisiuni ||= []).push(id);
        const m = joc.date.misiuni?.misiuni?.find((x) => x.id === id);
        if (m) joc.mesaj(`Misiune nouă: ${m.titlu} (în carte)`);
      }
      s.misiuni[id] = st;
    }),
  lupta: (v, joc) => joc.pornesteLupta(v),
  // Jocul de zaruri cu paznicii pornește după ce se închide dialogul (ca să nu stea peste el)
  zaruri: (v, joc) => setTimeout(() => joc.pornesteZaruri(), 0),
  plataTaxa: (v, joc) => joc.platesteTaxa(),
  // Pune o nevoie la o valoare fixă (de exemplu viața 10 după bătaie, foamea plină după masa de la Agnes)
  seteazaNevoi: (v, joc) => Object.entries(v).forEach(([k, val]) => (joc.stare.nevoi[k] = Math.max(0, Math.min(100, val)))),
  // Ține minte când s-a întâmplat ceva, pentru condiția „trecut” (unchiul lipsește 2 zile după bătaie)
  // Numărătorile: „contor: { vanatori: 1 }” adună, „contorZero: ["vanatori_dupa_refuz"]” o ia de la zero
  contor: (v, joc) => Object.entries(v).forEach(([k, n]) => ((joc.stare.contoare ||= {})[k] = (joc.stare.contoare[k] || 0) + n)),
  contorZero: (v, joc) => [].concat(v).forEach((k) => ((joc.stare.contoare ||= {})[k] = 0)),
  marcheaza: (v, joc) => [].concat(v).forEach((k) => ((joc.stare.marcaje ||= {})[k] = joc.stare.minute)),
  // Camera de la tavernă ține până la prânzul de după noaptea pentru care ai plătit-o:
  // plătită seara sau după miezul nopții, tot în dimineața următoare expiră
  inchiriaza: (v, joc) => {
    const peste = joc.stare.minute + 10 * 60;
    let pana = Math.floor(peste / MINUTE_ZI) * MINUTE_ZI + inMinute(joc.date.config.somn.cameraPanaLa || '12:00');
    if (pana <= peste) pana += MINUTE_ZI;
    (joc.stare.inchirieri ||= {})[v] = pana;
  },
  // Taxa crește de acum înainte (orcii țin minte cine s-a bătut cu ei)
  taxaCrestere: (v, joc) => (joc.stare.taxa.extra = (joc.stare.taxa.extra || 0) + v),
  // Alt eveniment, după ce se închide ce e acum pe ecran (dialogul sau lupta)
  eveniment: (v, joc) => joc.pornesteEvenimentDupa(v),
  // Vale e dus altundeva, după ce se închide dialogul (vânătoarea îl duce la campsite-ul ei)
  mergi: (v, joc) => setTimeout(() => joc.mergi(v, { faraTimp: true }), 0),
  // O luptă din poveste care pornește ca o vânătoare (lupul negru): întâi imaginea pădurii, apoi lupta
  luptaVanatoare: (v, joc) => joc.luptaVanatoare(v),
  // Vânătoarea împreună cu un personaj (Kaia, dimineața la campsite), după ce se închide dialogul
  vanatoareCu: (v, joc) => joc.vanatoareCu(v),
  // Magazinul unui personaj, deschis din dialog (Agnes: „Cumpără”)
  magazin: (v, joc) => joc.deschideMagazin(v),
  // Orcii îl pedepsesc pe Vale (după ce se închide ce e pe ecran); valoarea e orcul care vorbește
  pedeapsa: (v, joc) => joc.pedeapsa(v),
  // Un rând scurt pe ecran (de exemplu „Ai scăpat!”)
  mesaj: (v, joc) => joc.mesaj(v),
  pedeapsaAplicata: (v, joc) => joc.aplicaPedeapsa(v.id, v.obiect),
  // Blănurile cerute de orci, predate colectorului
  predaBlanuri: (v, joc) => {
    const d = joc.stare.datorieBlanuri;
    if (!d) return;
    joc.inventar.scoateOriunde(d.obiect, d.cate);
    joc.stare.datorieBlanuri = null;
  },
  // Un rezultat la întâmplare: [{ sansa, efecte }] (fuga de patrula de noapte: uneori scapi, alteori nu)
  laIntamplare: (v, joc) => {
    let z = Math.random() * v.reduce((s, x) => s + (x.sansa ?? 1), 0);
    const ales = v.find((x) => (z -= x.sansa ?? 1) < 0) || v.at(-1);
    aplicaEfecte(ales.efecte, joc);
  },
};

export function registreazaEfect(nume, functie) {
  efecte[nume] = functie;
}

export function aplicaEfecte(lista, joc) {
  for (const [tip, valoare] of Object.entries(lista || {})) {
    const f = efecte[tip];
    if (f) f(valoare, joc);
    else console.warn('Efect necunoscut:', tip);
  }
}
