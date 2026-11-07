import { inMinute, MINUTE_ZI, momentZi } from './timp.js';
import { minuteInZi, schimbaNevoie, ziua, context } from './stare.js';
import { verifica } from './conditii.js';
import { aplicaEfecte } from './efecte.js';

// Cât stă imaginea muncii pe ecran (ca ecranul de încărcare de la vânătoare); un clic o sare
const SECUNDE_IMAGINE = 2.5;

const div = (clasa, text) => Object.assign(document.createElement('div'), { className: clasa, textContent: text ?? '' });
function buton(text, clic, dezactivat = false) {
  const b = document.createElement('button');
  // Pergamentul din meniu (decis de autor), ca butoanele să se potrivească pe panoul mic
  b.className = 'buton buton-mic-meniu';
  b.textContent = text;
  b.onclick = clic;
  b.disabled = dezactivat;
  return b;
}

// Acțiunile din locuri (muncă, somn, magazin, taxă...). Fiecare tip e o funcție, ca să se poată adăuga altele ușor.
export function creeazaActiuni(parinte, joc) {
  const cfg = joc.date.config;
  const inv = joc.inventar;

  function panou(titlu, continut) {
    const fundal = div('acoperitor');
    const p = div('panou-actiune');
    const inchide = () => fundal.remove();
    p.append(div('titlu-meniu', titlu), ...continut(inchide), buton('Închide', inchide));
    fundal.append(p);
    fundal.onclick = (e) => e.target === fundal && inchide();
    parinte.append(fundal);
    return inchide;
  }

  const prea_obosit = () => joc.stare.nevoi.stamina < cfg.nevoi.prag;

  // Imaginea muncii pe tot ecranul câteva secunde (decis de autor, ca la vânătoare), apoi restul.
  // Sunetul pornește puțin după clic, ca să nu se suprapună cu el
  function cuImagine(a, dupa, idSunet) {
    joc.salveaza();
    if (idSunet) setTimeout(() => joc.sunet.efect(idSunet), 150);
    if (!a.imagine) return dupa();
    joc.arataImagini([a.imagine], dupa, { automat: SECUNDE_IMAGINE * 1000, text: a.text || '' });
  }

  function munca(idMunca) {
    const m = cfg.munca[idMunca];
    if (!m) return joc.mesaj('Munca asta nu e definită în config.');
    // Noaptea nu se lucrează la câmp, la vaci sau la moară (decis de autor): doar gândul lui Vale
    if (m.gandNoapte && momentZi(minuteInZi(joc.stare)) === 'noaptea') return joc.gand(m.gandNoapte);
    panou(m.nume, (inchide) => {
      const s = joc.stare;
      const info = div('text-anunt', `${m.monedePeOra} monede și −${m.staminaPeOra} stamina pe oră.`);
      if (prea_obosit()) return [info, div('text-anunt', 'Ești prea obosit pentru muncă grea. Odihnește-te întâi.')];
      const ore = [1, 2, 4].map((h) =>
        buton(`Muncește ${h} ${h === 1 ? 'oră' : 'ore'} (+${h * m.monedePeOra} monede)`, () => {
          inchide();
          if (joc.avanseaza(h * 60)) return;
          s.bani += h * m.monedePeOra;
          schimbaNevoie(s, 'stamina', -h * m.staminaPeOra);
          // Întâi imaginea cu Vale la muncă (cu sunetul muncii), apoi ce a câștigat
          cuImagine(m, () => joc.dupaActiune(`+${h * m.monedePeOra} monede`), 'munca');
        }, s.nevoi.stamina < h * m.staminaPeOra),
      );
      return [info, ...ore];
    });
  }

  function dormi(a) {
    const s = joc.stare;
    if (a.cost && s.bani < a.cost) return joc.gand(`N-am destui bani. Îmi trebuie ${a.cost} monede.`);
    const somn = (minute) => {
      if (a.cost) s.bani -= a.cost;
      const ore = minute / 60;
      // Foamea mare face somnul mai puțin odihnitor (pedeapsă moale)
      const refacere = cfg.somn.staminaPeOra * ore * (s.nevoi.foame < cfg.nevoi.prag ? 0.5 : 1);
      if (joc.avanseaza(minute, cfg.somn.nevoiInSomn)) return;
      schimbaNevoie(s, 'stamina', refacere);
      // Imaginea cu Vale dormind (decis de autor, ca la muncă), cu sunetul somnului, apoi trezirea;
      // imaginea de zi dimineața, la amiază și seara (decis de autor); cea de noapte doar noaptea
      // „varianteImagine”: alte imagini după stare (acasă, cu acoperișul reparat), prima potrivită câștigă
      const v = (a.varianteImagine || []).find((x) => verifica(x.conditii, context(s))) || a;
      const deZi = momentZi(acum) !== 'noaptea';
      cuImagine({ ...a, imagine: (deZi && (v.imagineZi || a.imagineZi)) || v.imagine || a.imagine }, () => joc.dupaActiune('Te-ai odihnit.'), 'somn');
    };
    // Mereu patru butoane, în ordinea cerută de autor: 2 ore, 6 ore, apoi „până dimineața” seara și noaptea
    // (până la ora trezirii) sau „până noaptea” ziua (până la 23:00, când începe noaptea), și „Închide”
    const acum = minuteInZi(s);
    const ziua = momentZi(acum) === 'dimineata' || momentZi(acum) === 'amiaza';
    const tinta = ziua ? inMinute('23:00') : inMinute(cfg.somn.oraTrezire);
    const pana = (tinta - acum + MINUTE_ZI) % MINUTE_ZI || MINUTE_ZI;
    panou(a.nume || 'Dormi', (inchide) => [
      buton('Dormi 2 ore', () => (inchide(), somn(120))),
      buton('Dormi 6 ore', () => (inchide(), somn(360))),
      buton(ziua ? 'Dormi până noaptea' : 'Dormi până dimineața', () => (inchide(), somn(pana))),
    ]);
  }

  // Unele acțiuni merg doar de câteva ori pe zi (apa de la fântână și lemnele: de două ori, decis de autor);
  // numărătoarea stă în salvare, pe loc și acțiune, și se ia de la capăt în fiecare zi
  function folosiriAzi(a) {
    const s = joc.stare;
    s.folosiri ||= {};
    const cheie = `${s.scena}/${a.id}`;
    const zi = ziua(s);
    if (s.folosiri[cheie]?.zi !== zi) s.folosiri[cheie] = { zi, n: 0 };
    return s.folosiri[cheie];
  }

  function obtine(a) {
    if (a.stamina && prea_obosit()) return joc.gand('Sunt prea obosit. Trebuie să mă odihnesc întâi.');
    if (a.maxPeZi && folosiriAzi(a).n >= a.maxPeZi) return joc.gand(a.mesajMaxPeZi || 'Destul pentru azi. Mâine din nou.');
    // Cu „variante” (lemnele: o oră sau două), întâi alegi cât stai, pe panoul mic
    if (a.variante && !a.alesa) {
      return panou(a.titlu || a.nume, (inchide) =>
        a.variante.map((v) =>
          buton(v.nume, () => {
            inchide();
            obtine({ ...a, ...v, alesa: true });
          }, (v.stamina || 0) > joc.stare.nevoi.stamina),
        ),
      );
    }
    if (a.maxPeZi) folosiriAzi(a).n++;
    if (joc.avanseaza(a.minute || 0)) return;
    if (a.stamina) schimbaNevoie(joc.stare, 'stamina', -a.stamina);
    // Sunetul acțiunii, dacă are (apa de la fântână, lemnele); cu imagine (lemnele), sunetul vine odată cu ea
    cuImagine(
      a,
      () => {
        joc.primeste(a.obiect, a.n || 1);
        joc.dupaActiune(`+${a.n || 1} ${inv.def(a.obiect).nume}`);
      },
      a.sunet,
    );
  }

  // Magazinul are ecranul lui (src/ecranMagazin.js), ca inventarul
  function magazin(a) {
    joc.deschideEcranMagazin(a);
  }

  // O lucrare care cere materiale (repararea acoperișului): le consumă, durează, obosește, arată imaginea ei
  // pe tot ecranul, apoi schimbă starea lumii (efecte). Noaptea nu se face: doar gândul lui Vale
  function lucrare(a) {
    const s = joc.stare;
    if (a.gandNoapte && momentZi(minuteInZi(s)) === 'noaptea') return joc.gand(a.gandNoapte);
    for (const [id, n] of Object.entries(a.consuma || {})) {
      const are = inv.numar(s.inventar, id);
      if (are < n) return joc.gand(`Îmi mai trebuie ${n - are} × ${inv.def(id).nume}. Am ${are} din ${n}.`);
    }
    if (a.stamina && s.nevoi.stamina < a.stamina) return joc.gand('Sunt prea obosit pentru asta. Trebuie să mă odihnesc întâi.');
    if (joc.avanseaza(a.minute || 0)) return;
    for (const [id, n] of Object.entries(a.consuma || {})) inv.scoate(id, n);
    if (a.stamina) schimbaNevoie(s, 'stamina', -a.stamina);
    aplicaEfecte(a.efecte, joc);
    cuImagine(a, () => joc.dupaActiune(a.mesajGata || ''), a.sunet);
  }

  const tipuri = {
    lucrare,
    dormi,
    obtine,
    magazin,
    cufar: () => joc.deschideInventarul({ cufar: true }),
    taxa: () => joc.platesteTaxa(),
    lupta: (a) => {
      if (joc.avanseaza(a.minute || 0)) return;
      joc.pornesteLupta(a.lupta);
    },
  };

  return {
    munca,
    executa(a) {
      const f = tipuri[a.tip];
      if (f) f(a);
      else joc.mesaj(`Acțiune necunoscută: ${a.tip}`);
    },
  };
}
