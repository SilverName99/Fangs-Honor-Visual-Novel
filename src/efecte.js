import { schimbaNevoie } from './stare.js';
import { MINUTE_ZI, inMinute } from './timp.js';

// Un id sau o listă de id-uri = câte una din fiecare; „{ sageti: 10 }” = mai multe deodată (săgețile de la Bram)
const perObiect = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.entries(v) : [].concat(v).map((id) => [id, 1]));

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
  // Și ce se pierde urcă pe ecran, cu roșu (Kaia află de capcanele vândute orcilor, decis de autor): doar cât s-a
  // pierdut cu adevărat (de la 0 nu mai coboară nimic)
  relatie: (v, joc) =>
    Object.entries(v).forEach(([id, cu]) => {
      const inainte = joc.stare.relatii[id] || 0;
      joc.stare.relatii[id] = Math.max(0, Math.min(joc.date.config.incredere?.max ?? 10, inainte + cu));
      if (cu > 0) joc.inregistreazaCastig?.({ tip: 'incredere', id, n: cu });
      else if (joc.stare.relatii[id] < inainte) joc.inregistreazaCastig?.({ tip: 'incredere', id, n: joc.stare.relatii[id] - inainte });
    }),
  obiect: (v, joc) =>
    perObiect(v).forEach(([id, n]) => {
      const primit = joc.primeste(id, n);
      if (primit > 0) joc.inregistreazaCastig?.({ tip: 'obiect', id, n: primit });
    }),
  // Un dar care nu are voie să se piardă (echipamentul tatei, de la mama, decis de autor): direct în cufărul de acasă,
  // nu în rucsac, unde un rucsac plin l-ar fi lăsat pe jos; doar dacă și cufărul e plin, încearcă rucsacul
  obiectCufar: (v, joc) =>
    perObiect(v).forEach(([id, n]) => {
      const rest = joc.inventar.adaugaInCufar(id, n);
      if (n - rest > 0) joc.inregistreazaCastig?.({ tip: 'obiect', id, n: n - rest });
      if (rest > 0) efecte.obiect({ [id]: rest }, joc);
    }),
  // Bram îi pune lui Vale platoșa pe umeri (decis de autor): se echipează pe loc; ce purta înainte merge în rucsac
  // sau, dacă nu încape, în cufărul de acasă (spus pe ecran, ca să știe unde s-o caute)
  imbraca: (v, joc) => {
    const unde = joc.inventar.imbraca(v);
    joc.inregistreazaCastig?.({ tip: 'obiect', id: v, n: 1 });
    if (unde.cufar.length) joc.mesaj(`N-ai loc în rucsac: ${unde.cufar.map((id) => joc.inventar.def(id).nume).join(', ')} te așteaptă în cufărul de acasă.`);
    // Rucsacul și cufărul pline: panoul obișnuit „N-ai loc pentru...”, ca jucătorul să aleagă, nu să piardă piesa pe ascuns
    unde.rest.forEach((id) => joc.primeste(id, 1));
  },
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
  // Tot ce au luat orcii (pedepsele), recăpătat din lada colectorului (misiunea lui Finn). Lucrurile de poveste
  // care au o întâmplare a lor la recuperare (fierul lui Bram) rămân la orci: se iau înapoi doar pe drumul lor
  recupereazaConfiscate: (v, joc) =>
    [...joc.stare.confiscate].filter((id) => !joc.inventar.def(id)?.evenimentRecuperat).forEach((id) => efecte.recupereaza(id, joc)),
  // Furișatul (misiunea lui Finn, decis de autor): după replică, pe imagine, două locuri desenate de autor;
  // unul e sigur, celălalt îl alertează pe orc. Discuția continuă de la „reusit” sau de la „esuat”
  furisare: (v, joc) => joc.furisare(v),
  // Antrenamentul cu Roderick: valoarea e evenimentul cu imaginile și regulile lui (decis de autor)
  antrenament: (v, joc) => joc.antrenament(v),
  // Mini-jocul barei peste imaginea unui eveniment (capcanele Kaiei, decis de autor): ca la furișat, discuția
  // continuă de la „reusit” sau de la „esuat”
  miniJoc: (v, joc) => joc.miniJocEveniment(v),
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
  // Masa regelui cu bătrânul din tavernă (nivelul ales în discuție), tot după ce se închide dialogul
  tafl: (v, joc) => setTimeout(() => joc.pornesteTafl(v), 0),
  // După o luptă în Groapă (nivelul și rezultatul): banii, reputația, prima victorie, inelul mamei
  groapa: (v, joc) => joc.rezultatGroapa(v),
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
