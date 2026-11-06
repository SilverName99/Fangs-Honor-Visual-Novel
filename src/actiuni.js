import { iconita, descriere } from './ecranInventar.js';
import { inMinute, MINUTE_ZI } from './timp.js';
import { minuteInZi, schimbaNevoie, ziua } from './stare.js';

const div = (clasa, text) => Object.assign(document.createElement('div'), { className: clasa, textContent: text ?? '' });
function buton(text, clic, dezactivat = false) {
  const b = document.createElement('button');
  b.className = 'buton';
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
    if (a.cost && s.bani < a.cost) return joc.mesaj(`Îți trebuie ${a.cost} monede.`);
    const somn = (minute) => {
      if (a.cost) s.bani -= a.cost;
      const ore = minute / 60;
      // Foamea mare face somnul mai puțin odihnitor (pedeapsă moale)
      const refacere = cfg.somn.staminaPeOra * ore * (s.nevoi.foame < cfg.nevoi.prag ? 0.5 : 1);
      if (joc.avanseaza(minute, cfg.somn.nevoiInSomn)) return;
      schimbaNevoie(s, 'stamina', refacere);
      joc.dupaActiune('Te-ai odihnit.');
    };
    const pana = (inMinute(cfg.somn.oraTrezire) - minuteInZi(s) + MINUTE_ZI) % MINUTE_ZI || MINUTE_ZI;
    panou(a.nume || 'Dormi', (inchide) => [
      // Ziua, „până dimineață” ar însemna aproape o zi întreagă, deci apare doar seara și noaptea
      ...(pana <= 14 * 60 ? [buton(`Dormi până dimineață (${Math.round(pana / 60)} ore)`, () => (inchide(), somn(pana)))] : []),
      buton('Dormi 6 ore', () => (inchide(), somn(360))),
      buton('Odihnește-te 2 ore', () => (inchide(), somn(120))),
    ]);
  }

  function obtine(a) {
    if (a.stamina && prea_obosit()) return joc.mesaj('Ești prea obosit. Odihnește-te întâi.');
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
    joc.primeste(a.obiect, a.n || 1);
    joc.dupaActiune(`+${a.n || 1} ${inv.def(a.obiect).nume}`);
  }

  function magazin(a) {
    const s = joc.stare;
    const procent = cfg.magazin.procentVanzare / 100;
    let inchide;
    const reface = () => {
      inchide();
      magazin(a);
    };
    inchide = panou(a.nume || 'Magazin', () => {
      const cumpara = div('lista-magazin');
      for (const id of a.vinde || []) {
        const d = inv.def(id);
        const r = div('rand-magazin');
        r.append(iconita(inv, id), div('nume-magazin', `${d.nume} — ${d.pret} monede`), div('descriere-magazin', descriere(inv, id)));
        r.append(
          buton('Cumpără', () => {
            if (!inv.incape(id)) return joc.mesaj('Nu ai loc în inventar.');
            s.bani -= d.pret;
            inv.adauga(id, 1);
            joc.salveaza();
            joc.actualizeazaHud();
            reface();
          }, s.bani < d.pret),
        );
        cumpara.append(r);
      }
      const vinde = div('lista-magazin');
      const deVandut = (a.cumpara || []).filter((id) => inv.numar(s.inventar, id) > 0);
      for (const id of deVandut) {
        const d = inv.def(id);
        const pret = Math.max(1, Math.floor(d.pret * procent));
        const r = div('rand-magazin');
        r.append(iconita(inv, id), div('nume-magazin', `${d.nume} ×${inv.numar(s.inventar, id)} — ${pret} monede bucata`));
        r.append(
          buton('Vinde 1', () => {
            inv.scoate(id, 1);
            s.bani += pret;
            joc.salveaza();
            joc.actualizeazaHud();
            reface();
          }),
        );
        vinde.append(r);
      }
      if (!deVandut.length) vinde.append(div('descriere-magazin', 'Nu ai nimic ce cumpără negustorul ăsta.'));
      return [div('text-anunt', `Ai ${s.bani} monede.`), div('titlu-inv', 'De cumpărat'), cumpara, div('titlu-inv', 'De vândut'), vinde];
    });
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
