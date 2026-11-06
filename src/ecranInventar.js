import { elementImagine } from './imagini.js';
import { pozitie, aplicaPozitie, LATIME, INALTIME } from './scena.js';
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
    vedere = 'rucsac';
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

  // Unde se leagă fiecare slot de corpul lui Vale (linia aurie), ca fracție din figura lui: x de la stânga, y de sus
  const PUNCTE_CORP = {
    cap: [0.5, 0.07],
    armura: [0.5, 0.32],
    jambiere: [0.5, 0.62],
    arma_primara: [0.14, 0.5],
    arma_secundara: [0.3, 0.55],
    rucsac: [0.36, 0.22],
  };

  // Ce se vede pe foaie: rucsacul sau obiectele de poveste (semnul de carte comută între ele)
  let vedere = 'rucsac';

  // O bucată de ecran pusă unde a așezat-o autorul în editor (Aranjare → Ecranul de inventar)
  function asaza(elem, o, i, z) {
    aplicaPozitie(elem, pozitie(joc.date.aranjare.echipament, o, i));
    elem.classList.add('obiect');
    if (z) elem.style.zIndex = String(z);
    el.append(elem);
    return elem;
  }

  // Foaia are un design fix de 900 × 1250, micșorat cât e foaia pe ecran, ca textele și căsuțele să stea mereu la locul lor
  function foaie(o, i, clasa) {
    const f = div(`foaie-inv ${clasa}`);
    asaza(f, o, i, 1000);
    const p = pozitie(joc.date.aranjare.echipament, o, i);
    const c = div('continut-foaie');
    c.style.transform = `scale(${(p.scara * INALTIME) / 1250})`;
    f.append(c);
    return c;
  }

  function capFoaie(text, ocupate, total) {
    const cap = div('cap-foaie');
    cap.append(div('titlu-foaie', text));
    if (total != null) cap.append(div('numar-foaie', `${ocupate} / ${total}`));
    return cap;
  }

  function detaliiObiect(s) {
    const id = obiectSelectat();
    const detalii = div('detalii-inv');
    if (!id) {
      detalii.append(div('ajutor-inv', optiuni.cufar ? 'Apasă pe un obiect ca să vezi ce face. Trage obiectele între rucsac și cufăr.' : 'Apasă pe un obiect ca să vezi ce face. Trage-l pe un slot din stânga ca să-l echipezi.'));
      return detalii;
    }
    const d = inv.def(id);
    const ic = div('iconita-detalii');
    ic.append(iconita(inv, id));
    const text = div('text-detalii');
    text.append(div('nume-obiect', d.nume), div('descriere-obiect', descriere(inv, id)));
    const actiuni = div('actiuni-inv');
    const b = (t, clic) => actiuni.append(buton(t, clic, 'buton-mic-meniu'));
    if (selectat.din === 'inventar') {
      if (d.tip === 'consumabil') b(d.efecte?.nevoi?.sete ? 'Bea' : d.efecte?.nevoi?.foame ? 'Mănâncă' : 'Folosește', () => ruleaza(joc.folosesteObiect(selectat.index)));
      if (d.tip === 'echipament') b('Echipează', () => ruleaza(inv.echipeaza(selectat.index)));
      if (optiuni.cufar) b('În cufăr', () => ruleaza(inv.spreCufar(selectat.index)));
      b('Aruncă', () => {
        const x = s.inventar[selectat.index];
        if (!confirm(`Arunci ${d.nume}${x.n > 1 ? ` (toate ${x.n})` : ''}? Nu se mai poate recupera.`)) return;
        s.inventar.splice(selectat.index, 1);
        ruleaza();
      });
    }
    if (selectat.din === 'cufar') b('Ia în inventar', () => ruleaza(inv.dinCufar(selectat.index)));
    if (selectat.din === 'slot') b('Dă jos', () => ruleaza(inv.dezechipeaza(selectat.slot)));
    text.append(actiuni);
    detalii.append(ic, text);
    return detalii;
  }

  // Liniile aurii dintre sloturi și corpul lui Vale, desenate din cod (urmează figura și sloturile oriunde ar fi mutate)
  function linii(ecran) {
    const aranjare = joc.date.aranjare.echipament;
    const iF = ecran.obiecte.findIndex((o) => o.id === 'figura');
    const pf = pozitie(aranjare, ecran.obiecte[iF], iF);
    const h = pf.scara * INALTIME;
    const w = h * 0.7;
    const stanga = pf.x * LATIME - w / 2;
    const sus = pf.y * INALTIME - h;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'linii-inv');
    svg.setAttribute('viewBox', `0 0 ${LATIME} ${INALTIME}`);
    let desen = '';
    ecran.obiecte.forEach((o, i) => {
      if (o.tip !== 'inv-slot' || !PUNCTE_CORP[o.id]) return;
      const p = pozitie(aranjare, o, i);
      const l = p.scara * INALTIME;
      const cx = p.x * LATIME;
      const cy = p.y * INALTIME - l / 2;
      const tx = stanga + PUNCTE_CORP[o.id][0] * w;
      const ty = sus + PUNCTE_CORP[o.id][1] * h;
      // Linia pleacă de pe marginea slotului, nu din mijlocul lui
      const t = l / 2 / Math.max(Math.abs(tx - cx), Math.abs(ty - cy), 1);
      if (t >= 1) return;
      const sx = cx + (tx - cx) * t;
      const sy = cy + (ty - cy) * t;
      desen += `<line x1="${sx}" y1="${sy}" x2="${tx}" y2="${ty}"/><circle cx="${tx}" cy="${ty}" r="5"/><circle cx="${sx}" cy="${sy}" r="3.5"/>`;
    });
    svg.innerHTML = desen;
    svg.style.zIndex = '1500';
    return svg;
  }

  function arata() {
    const s = joc.stare;
    const ecran = joc.lume.get('echipament');
    el.replaceChildren();
    const cuCufar = !!optiuni.cufar;

    ecran.obiecte.forEach((o, i) => {
      // Lângă cufăr, în stânga stă cufărul în locul lui Vale (echiparea merge și de acolo, din butonul „Echipează”)
      if (cuCufar && ['figura', 'inv-slot'].includes(o.tip)) return;
      if (o.tip === 'figura') {
        const f = elementImagine([fisierUi('vale_apoza')], { clasa: 'figura-vale', raport: 0.7, eticheta: 'ui_vale_apoza.png' });
        return asaza(f, o, i);
      }
      if (o.tip === 'inv-slot') {
        const slot = div('slot');
        slot.style.aspectRatio = '1';
        asaza(slot, o, i, 2000 + i);
        slot.dataset.tinta = `slot:${o.id}`;
        const id = s.echipat[o.id];
        if (id) {
          slot.append(iconita(inv, id));
          tragere(slot, { din: 'slot', slot: o.id }, id);
        } else {
          slot.append(div(`slot-gol slot-gol-${o.id}`, NUME_SLOTURI[o.id]));
          slot.onclick = () => ((selectat = null), arata());
        }
        if (selectat?.din === 'slot' && selectat.slot === o.id) slot.classList.add('selectata');
        slot.title = NUME_SLOTURI[o.id];
        return;
      }
      if (o.tip === 'inv-titlu') {
        const text = o.id === 'titlu_echipament' ? (cuCufar ? 'Cufărul' : 'Echipament') : 'Inventar';
        const t = div('titlu-ecran-inv', text);
        t.style.fontSize = `${pozitie(joc.date.aranjare.echipament, o, i).scara * INALTIME * 0.8}px`;
        return asaza(t, o, i, 1700);
      }
      if (o.tip === 'inv-inchide') {
        const b = buton('Închide', inchide, 'buton-mic-meniu inchide-inv');
        const p = pozitie(joc.date.aranjare.echipament, o, i);
        b.style.fontSize = `${p.scara * INALTIME * 0.4}px`;
        return asaza(b, o, i, 1700);
      }
      if (o.tip === 'inv-semn') {
        const semn = div('semn-inv');
        semn.append(div('text-semn', vedere === 'poveste' ? 'Înapoi la rucsac' : 'Obiecte de poveste'));
        semn.classList.toggle('activ', vedere === 'poveste');
        semn.onclick = () => ((vedere = vedere === 'poveste' ? 'rucsac' : 'poveste'), (selectat = null), arata());
        const p = pozitie(joc.date.aranjare.echipament, o, i);
        semn.style.fontSize = `${p.scara * INALTIME * 0.1}px`;
        return asaza(semn, o, i, 1600);
      }
      if (o.tip !== 'inv-foaie') return;

      // Foaia din dreapta: rucsacul (sau obiectele de poveste) și detaliile obiectului ales
      const c = foaie(o, i, '');
      c.parentElement.dataset.tinta = 'inventar';
      if (vedere === 'poveste') {
        c.append(capFoaie('Obiecte de poveste'));
        const lista = div('poveste-inv');
        for (const id of s.poveste) {
          const r = div('obiect-poveste');
          const ic = div('iconita-poveste');
          ic.append(iconita(inv, id));
          r.append(ic, div('', inv.def(id).nume));
          lista.append(r);
        }
        if (!s.poveste.length) lista.append(div('ajutor-inv', 'Încă nimic. Cheile, scrisorile și celelalte lucruri importante apar aici și nu se pot pierde.'));
        c.append(lista);
        return;
      }
      c.append(capFoaie('Rucsac', inv.ocupate(s.inventar), inv.capacitate()));
      if (optiuni.deLuat) {
        const { id, n } = optiuni.deLuat;
        const b = div('de-luat');
        b.append(div('', `N-ai loc pentru: ${inv.def(id).nume}${n > 1 ? ` ×${n}` : ''}. Aruncă sau mută ceva, apoi ia-l.`));
        const ia = buton('Ia-l', () => {
          const rest = inv.adauga(id, n);
          optiuni.deLuat = rest ? { id, n: rest } : null;
          ruleaza(rest ? 'Tot nu e loc.' : null);
        }, 'buton-mic-meniu');
        ia.disabled = !inv.incape(id, 1);
        b.append(ia, buton('Lasă-l', () => ((optiuni.deLuat = null), arata()), 'buton-mic-meniu'));
        c.append(b);
      }
      c.append(grila(s.inventar, inv.capacitate(), 'inventar'), detaliiObiect(s));

      // Lângă cufăr: a doua foaie, în stânga, oglindită față de prima
      if (cuCufar) {
        const p = pozitie(joc.date.aranjare.echipament, o, i);
        const cc = foaie({ ...o, id: 'foaie_cufar', implicit: { ...p, x: 1 - p.x } }, i, 'foaie-cufar');
        cc.parentElement.dataset.tinta = 'cufar';
        const total = joc.date.config.inventar.cufar;
        cc.append(capFoaie('În cufăr', inv.ocupate(s.cufar), total));
        const g = grila(s.cufar, total, 'cufar');
        g.classList.add('grila-cufar');
        cc.append(g);
      }
    });
    if (!cuCufar) el.append(linii(ecran));
  }

  return { deschide, inchide, deschis: () => !!el, reafiseaza: () => el && arata() };
}
