import { elementImagine } from './imagini.js';
import { pozitie, aplicaPozitie } from './scena.js';
import { SLOTURI, NUME_SLOTURI } from './inventar.js';
import { fisierUi } from './uiGrafica.js';

const div = (clasa, text) => Object.assign(document.createElement('div'), { className: clasa, textContent: text ?? '' });
function buton(text, clic, clasa = '') {
  const b = document.createElement('button');
  b.className = `buton ${clasa}`;
  b.textContent = text;
  b.onclick = clic;
  return b;
}

export function iconita(inv, id) {
  return elementImagine([`items/${id}.png`], { clasa: 'iconita', raport: 1, eticheta: inv.def(id).nume });
}

// Descrierea scurtă a unui obiect: ce face și cât valorează
export function descriere(inv, id) {
  const d = inv.def(id);
  const parti = [];
  if (d.atac) parti.push(`Atac ${d.atac.min}-${d.atac.max} (${d.atac.tip === 'distanta' ? 'de la distanță' : 'apropiat'})`);
  if (d.douaMaini) parti.push('cu două mâini');
  if (d.armura) parti.push(`Armură ${d.armura}, rezistă ${d.rezistenta} lovituri`);
  if (d.blocare) parti.push(`Blochează ${Math.round(d.blocare * 100)}%`);
  if (d.capacitate) parti.push(`${d.capacitate} sloturi`);
  for (const [k, v] of Object.entries(d.efecte?.nevoi || {})) parti.push(`${k} ${v > 0 ? '+' : ''}${v}`);
  if ((d.sloturi || 1) > 1) parti.push(`ocupă ${d.sloturi} sloturi`);
  if (d.pret) parti.push(`valoare ${d.pret} monede`);
  return parti.join(' · ');
}

export function creeazaEcranInventar(parinte, joc) {
  const inv = joc.inventar;
  let el = null;
  let optiuni = {};
  let selectat = null; // { din: 'inventar' | 'cufar' | 'slot', index | slot }

  function inchide() {
    el?.remove();
    el = null;
    selectat = null;
    optiuni.laInchidere?.();
    joc.dupaInventar();
  }

  function deschide(opt = {}) {
    optiuni = opt;
    selectat = null;
    if (!el) {
      el = div('ecran-inventar');
      parinte.append(el);
    }
    arata();
  }

  function obiectSelectat() {
    const s = joc.stare;
    if (!selectat) return null;
    if (selectat.din === 'slot') return s.echipat[selectat.slot] || null;
    return (selectat.din === 'cufar' ? s.cufar : s.inventar)[selectat.index]?.id || null;
  }

  function ruleaza(eroare) {
    if (eroare) joc.mesaj(eroare);
    selectat = null;
    joc.salveaza();
    joc.actualizeazaHud();
    arata();
  }

  // ----- drag & drop cu pointerul (merge și cu scena scalată) -----
  function tragere(elSursa, sursa, idObiect) {
    elSursa.addEventListener('pointerdown', (ev) => {
      if (ev.button !== 0) return;
      const start = [ev.clientX, ev.clientY];
      let fantoma = null;
      const misca = (e) => {
        if (!fantoma && Math.hypot(e.clientX - start[0], e.clientY - start[1]) > 6) {
          fantoma = iconita(inv, idObiect);
          fantoma.classList.add('fantoma');
          document.body.append(fantoma);
        }
        if (fantoma) {
          fantoma.style.left = `${e.clientX}px`;
          fantoma.style.top = `${e.clientY}px`;
        }
      };
      const sus = (e) => {
        removeEventListener('pointermove', misca);
        removeEventListener('pointerup', sus);
        if (!fantoma) {
          selectat = sursa;
          return arata();
        }
        fantoma.remove();
        const tinta = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-tinta]')?.dataset.tinta;
        if (tinta) lasa(sursa, tinta, idObiect);
      };
      addEventListener('pointermove', misca);
      addEventListener('pointerup', sus);
    });
  }

  function lasa(sursa, tinta, id) {
    if (tinta.startsWith('slot:')) {
      const slot = tinta.slice(5);
      if (sursa.din !== 'inventar') return;
      if (inv.def(id).slot !== slot) return joc.mesaj(`${inv.def(id).nume} nu se pune la ${NUME_SLOTURI[slot]}.`);
      return ruleaza(inv.echipeaza(sursa.index));
    }
    if (tinta === 'inventar') {
      if (sursa.din === 'slot') return ruleaza(inv.dezechipeaza(sursa.slot));
      if (sursa.din === 'cufar') return ruleaza(inv.dinCufar(sursa.index));
    }
    if (tinta === 'cufar' && sursa.din === 'inventar') return ruleaza(inv.spreCufar(sursa.index));
  }

  // ----- desenarea -----
  function celula(stiva, sursa) {
    const c = div('celula');
    const lat = inv.sloturiStiva(stiva);
    if (lat > 1) c.style.gridColumn = `span ${lat}`;
    if (selectat && selectat.din === sursa.din && selectat.index === sursa.index) c.classList.add('selectata');
    c.append(iconita(inv, stiva.id));
    if (stiva.n > 1) c.append(div('numar', String(stiva.n)));
    c.title = inv.def(stiva.id).nume;
    tragere(c, sursa, stiva.id);
    return c;
  }

  function grila(lista, cap, din) {
    const g = div('grila-inv');
    g.dataset.tinta = din;
    lista.forEach((x, index) => g.append(celula(x, { din, index })));
    for (let i = inv.ocupate(lista); i < cap; i++) g.append(div('celula goala'));
    return g;
  }

  function arata() {
    const s = joc.stare;
    const aranjare = joc.date.aranjare.echipament;
    const ecran = joc.lume.get('echipament');
    el.replaceChildren();

    // Stânga: Vale și sloturile, așezate din editor (Aranjare → Ecranul de echipament)
    ecran.obiecte.forEach((o, i) => {
      const poz = pozitie(aranjare, o, i);
      if (o.tip === 'figura') {
        const f = elementImagine([fisierUi('vale_apoza')], { clasa: 'obiect figura-vale', raport: 0.7, eticheta: 'ui_vale_apoza.png' });
        aplicaPozitie(f, poz);
        return el.append(f);
      }
      const slot = div('slot obiect');
      aplicaPozitie(slot, poz);
      slot.style.aspectRatio = '1';
      // Sloturile stau mereu peste figură, oricât de mare ar fi ea
      slot.style.zIndex = String(2000 + i);
      slot.dataset.tinta = `slot:${o.id}`;
      const id = s.echipat[o.id];
      if (id) {
        slot.append(iconita(inv, id));
        tragere(slot, { din: 'slot', slot: o.id }, id);
      } else {
        slot.append(div('eticheta-slot', NUME_SLOTURI[o.id]));
        slot.onclick = () => ((selectat = null), arata());
      }
      if (selectat?.din === 'slot' && selectat.slot === o.id) slot.classList.add('selectata');
      slot.title = NUME_SLOTURI[o.id];
      el.append(slot);
    });

    // Dreapta: inventarul, cufărul (acasă), obiectele de poveste, detaliile
    const panou = div('panou-inv');
    const cap = div('cap-inv');
    cap.append(div('titlu-inv', `Inventar · ${inv.ocupate(s.inventar)} / ${inv.capacitate()} sloturi`), buton('✕ Închide', inchide));
    panou.append(cap);

    if (optiuni.deLuat) {
      const { id, n } = optiuni.deLuat;
      const b = div('de-luat');
      b.append(div('', `N-ai loc pentru: ${inv.def(id).nume}${n > 1 ? ` ×${n}` : ''}. Aruncă sau mută ceva, apoi ia-l.`));
      const ia = buton('Ia-l', () => {
        const rest = inv.adauga(id, n);
        optiuni.deLuat = rest ? { id, n: rest } : null;
        ruleaza(rest ? 'Tot nu e loc.' : null);
      });
      ia.disabled = !inv.incape(id, 1);
      b.append(ia, buton('Lasă-l', () => ((optiuni.deLuat = null), arata())));
      panou.append(b);
    }

    panou.append(grila(s.inventar, inv.capacitate(), 'inventar'));
    if (optiuni.cufar) {
      panou.append(div('titlu-inv', `Cufărul de acasă · ${inv.ocupate(s.cufar)} / ${joc.date.config.inventar.cufar}`));
      panou.append(grila(s.cufar, joc.date.config.inventar.cufar, 'cufar'));
    }
    if (s.poveste.length) {
      panou.append(div('titlu-inv', 'Obiecte de poveste'));
      const p = div('poveste-inv');
      for (const id of s.poveste) p.append(div('obiect-poveste', inv.def(id).nume));
      panou.append(p);
    }

    const id = obiectSelectat();
    const detalii = div('detalii-inv');
    if (id) {
      const d = inv.def(id);
      detalii.append(div('nume-obiect', d.nume), div('descriere-obiect', descriere(inv, id)));
      const actiuni = div('actiuni-inv');
      if (selectat.din === 'inventar') {
        if (d.tip === 'consumabil') {
          const verb = d.efecte?.nevoi?.sete ? 'Bea' : d.efecte?.nevoi?.foame ? 'Mănâncă' : 'Folosește';
          actiuni.append(buton(verb, () => ruleaza(joc.folosesteObiect(selectat.index))));
        }
        if (d.tip === 'echipament') actiuni.append(buton('Echipează', () => ruleaza(inv.echipeaza(selectat.index))));
        if (optiuni.cufar) actiuni.append(buton('Pune în cufăr', () => ruleaza(inv.spreCufar(selectat.index))));
        actiuni.append(
          buton('Aruncă', () => {
            const x = s.inventar[selectat.index];
            if (!confirm(`Arunci ${d.nume}${x.n > 1 ? ` (toate ${x.n})` : ''}? Nu se mai poate recupera.`)) return;
            s.inventar.splice(selectat.index, 1);
            ruleaza();
          }),
        );
      }
      if (selectat.din === 'cufar') actiuni.append(buton('Ia în inventar', () => ruleaza(inv.dinCufar(selectat.index))));
      if (selectat.din === 'slot') actiuni.append(buton('Dă jos', () => ruleaza(inv.dezechipeaza(selectat.slot))));
      detalii.append(actiuni);
    } else {
      detalii.append(div('ajutor-inv', 'Click pe un obiect ca să vezi ce face. Trage obiectele pe sloturile din stânga ca să le echipezi.'));
    }
    panou.append(detalii);
    el.append(panou);
  }

  return { deschide, inchide, deschis: () => !!el, reafiseaza: () => el && arata() };
}
