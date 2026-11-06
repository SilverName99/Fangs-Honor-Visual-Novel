import { inMinute, MINUTE_ZI, momentZi } from './timp.js';
import { minuteInZi, schimbaNevoie, ziua } from './stare.js';

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

  function munca(idMunca) {
    const m = cfg.munca[idMunca];
    if (!m) return joc.mesaj('Munca asta nu e definită în config.');
    panou(m.nume, (inchide) => {
      const s = joc.stare;
      const info = div('text-anunt', `${m.monedePeOra} monede și −${m.staminaPeOra} stamina pe oră.`);
      if (prea_obosit()) return [info, div('text-anunt', 'Ești prea obosit pentru muncă grea. Odihnește-te întâi.')];
      const ore = [1, 2, 4].map((h) =>
        buton(`Muncește ${h} ${h === 1 ? 'oră' : 'ore'} (+${h * m.monedePeOra} monede)`, () => {
          inchide();
          joc.sunet.efect('munca');
          if (joc.avanseaza(h * 60)) return;
          s.bani += h * m.monedePeOra;
          schimbaNevoie(s, 'stamina', -h * m.staminaPeOra);
          joc.dupaActiune(`+${h * m.monedePeOra} monede`);
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
      joc.sunet.efect('somn');
      const ore = minute / 60;
      // Foamea mare face somnul mai puțin odihnitor (pedeapsă moale)
      const refacere = cfg.somn.staminaPeOra * ore * (s.nevoi.foame < cfg.nevoi.prag ? 0.5 : 1);
      if (joc.avanseaza(minute, cfg.somn.nevoiInSomn)) return;
      schimbaNevoie(s, 'stamina', refacere);
      joc.dupaActiune('Te-ai odihnit.');
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

  function obtine(a) {
    if (a.stamina && prea_obosit()) return joc.gand('Sunt prea obosit. Trebuie să mă odihnesc întâi.');
    // Unele acțiuni merg doar de câteva ori pe zi (apa de la fântână: de două ori, decis de autor);
    // numărătoarea stă în salvare, pe loc și acțiune, și se ia de la capăt în fiecare zi
    if (a.maxPeZi) {
      const s = joc.stare;
      s.folosiri ||= {};
      const cheie = `${s.scena}/${a.id}`;
      const zi = ziua(s);
      const f = s.folosiri[cheie]?.zi === zi ? s.folosiri[cheie] : { zi, n: 0 };
      if (f.n >= a.maxPeZi) return joc.gand(a.mesajMaxPeZi || 'Destul pentru azi. Mâine din nou.');
      f.n++;
      s.folosiri[cheie] = f;
    }
    if (joc.avanseaza(a.minute || 0)) return;
    if (a.stamina) schimbaNevoie(joc.stare, 'stamina', -a.stamina);
    // Sunetul acțiunii, dacă are (apa de la fântână, lemnele)
    if (a.sunet) joc.sunet.efect(a.sunet);
    joc.primeste(a.obiect, a.n || 1);
    joc.dupaActiune(`+${a.n || 1} ${inv.def(a.obiect).nume}`);
  }

  // Magazinul are ecranul lui (src/ecranMagazin.js), ca inventarul
  function magazin(a) {
    joc.deschideEcranMagazin(a);
  }

  const tipuri = {
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
