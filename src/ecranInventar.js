import { elementImagine } from './imagini.js';
import { pozitie, aplicaPozitie, LATIME, INALTIME } from './scena.js';
import { SLOTURI, numeSlot } from './inventar.js';
import { fisierUi } from './uiGrafica.js';
import { RAPORT_BARA_INV } from './lume.js';
import { baraNevoie } from './baraNevoie.js';
import { t } from './limba.js';

const div = (clasa, text) => Object.assign(document.createElement('div'), { className: clasa, textContent: text ?? '' });
function buton(text, clic, clasa = '') {
  const b = document.createElement('button');
  b.className = `buton ${clasa}`;
  b.textContent = text;
  b.onclick = clic;
  return b;
}

// Unele iconițe generate au mai mult gol transparent într-o parte (rucsacul stătea prea jos în slot): după ce se
// încarcă, se măsoară unde e partea vizibilă și imaginea se mută cât să stea ea pe mijlocul căsuței. Calculul se face
// o singură dată pe imagine (o căsuță e pătrată, deci mutarea e o fracție din căsuță)
const centrari = new Map();
function centrare(img) {
  if (centrari.has(img.src)) return centrari.get(img.src);
  let rez = null;
  try {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const pas = Math.max(1, Math.round(Math.max(w, h) / 256));
    const c = Object.assign(document.createElement('canvas'), { width: Math.ceil(w / pas), height: Math.ceil(h / pas) });
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0, c.width, c.height);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
    for (let y = 0; y < c.height; y++)
      for (let x = 0; x < c.width; x++)
        // Doar partea plină a obiectului: umbra fină sau strălucirea din jur nu trag centrarea într-o parte
        if (d[(y * c.width + x) * 4 + 3] > 128) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
    if (x1 >= 0) {
      const m = Math.max(c.width, c.height);
      rez = { x: (c.width / 2 - (x0 + x1 + 1) / 2) / m, y: (c.height / 2 - (y0 + y1 + 1) / 2) / m };
    }
  } catch {
    rez = null;
  }
  centrari.set(img.src, rez);
  return rez;
}
export function iconita(inv, id) {
  const el = elementImagine([`items/${id}.png`], { clasa: 'iconita', raport: 1, eticheta: inv.def(id).nume });
  const aplica = () => {
    const img = el.querySelector('img');
    if (!img?.complete || !img.naturalWidth) return;
    const c = centrare(img);
    if (c) img.style.translate = `${(c.x * 100).toFixed(1)}% ${(c.y * 100).toFixed(1)}%`;
  };
  el.addEventListener('incarcat', aplica);
  // Deja încărcată (din memoria imaginilor): se aplică pe loc, după ce intră în pagină
  requestAnimationFrame(aplica);
  return el;
}

// În descriere, nevoile se scriu cu id-ul lor („foame +25”, „viata +40”): în română rămân exact cum se văd acum, iar
// engleza are cuvântul ei; t() se cheamă la fiecare desenare, ca să urmeze limba aleasă în Opțiuni
const numeNevoie = (k) => ({ viata: t('viata'), stamina: t('stamina'), foame: t('foame'), sete: t('sete') })[k] ?? k;

// Descrierea scurtă a unui obiect: ce face și cât valorează
export function descriere(inv, id) {
  const d = inv.def(id);
  const parti = [];
  if (d.atac) parti.push(d.atac.tip === 'distanta' ? t('Atac {min}-{max} (de la distanță)', { min: d.atac.min, max: d.atac.max }) : t('Atac {min}-{max} (apropiat)', { min: d.atac.min, max: d.atac.max }));
  if (d.douaMaini) parti.push(t('cu două mâini'));
  if (d.armura) parti.push(t('Armură +{n}', { n: d.armura }));
  if (d.blocare) parti.push(t('Blochează {n}%', { n: Math.round(d.blocare * 100) }));
  if (d.capacitate) parti.push(t('{n} sloturi', { n: d.capacitate }));
  for (const [k, v] of Object.entries(d.efecte?.nevoi || {})) parti.push(`${numeNevoie(k)} ${v > 0 ? '+' : ''}${v}`);
  if ((d.sloturi || 1) > 1) parti.push(t('ocupă {n} sloturi', { n: d.sloturi }));
  if (d.pret) parti.push(d.pret === 1 ? t('valoare {n} monedă', { n: d.pret }) : t('valoare {n} monede', { n: d.pret }));
  // Obiectele de poveste (hârtiile soldatului) au și un rând al lor, în vocea lui Vale
  if (d.descriere) return [d.descriere, ...parti].join(' · ');
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
      joc.sunet.efect('rucsac');
    }
    arata();
  }

  function obiectSelectat() {
    const s = joc.stare;
    if (!selectat) return null;
    if (selectat.din === 'bani') return 'monede';
    if (selectat.din === 'slot') return s.echipat[selectat.slot] || null;
    return (selectat.din === 'cufar' ? s.cufar : s.inventar)[selectat.index]?.id || null;
  }

  // Echiparea reușită (sau scoaterea unei piese) are sunetul ei; o eroare n-are
  function echipat(eroare) {
    if (!eroare) joc.sunet.efect('echipare');
    return eroare;
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
      if (inv.def(id).slot !== slot) return joc.mesaj(t('{obiect} nu se pune la {slot}.', { obiect: inv.def(id).nume, slot: numeSlot(slot) }));
      return ruleaza(echipat(inv.echipeaza(sursa.index)));
    }
    if (tinta === 'inventar') {
      if (sursa.din === 'slot') return ruleaza(echipat(inv.dezechipeaza(sursa.slot)));
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

  // Căsuța monedelor (decis de autor): mereu prima în rucsac, toate monedele una peste alta, cu numărul pe ea
  function celulaMonede() {
    const c = div('celula celula-monede');
    if (selectat?.din === 'bani') c.classList.add('selectata');
    c.append(iconita(inv, 'monede'), div('numar', String(joc.stare.bani)));
    c.title = t('{n} monede', { n: joc.stare.bani });
    c.onclick = () => ((selectat = { din: 'bani' }), arata());
    return c;
  }

  function grila(lista, cap, din) {
    const g = div('grila-inv');
    g.dataset.tinta = din;
    if (din === 'inventar') g.append(celulaMonede());
    lista.forEach((x, index) => g.append(celula(x, { din, index })));
    for (let i = inv.ocupate(lista); i < cap; i++) g.append(div('celula goala'));
    return g;
  }

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
      detalii.append(div('ajutor-inv', optiuni.cufar ? t('Apasă pe un obiect ca să vezi ce face. Trage obiectele între rucsac și cufăr.') : t('Apasă pe un obiect ca să vezi ce face. Trage-l pe un slot din stânga ca să-l echipezi.')));
      return detalii;
    }
    const d = inv.def(id);
    const ic = div('iconita-detalii');
    ic.append(iconita(inv, id));
    const text = div('text-detalii');
    text.append(div('nume-obiect', d.nume), div('descriere-obiect', id === 'monede' ? (s.bani === 1 ? t('{n} monedă', { n: s.bani }) : t('{n} monede', { n: s.bani })) : descriere(inv, id)));
    const actiuni = div('actiuni-inv');
    const b = (eticheta, clic) => actiuni.append(buton(eticheta, clic, 'buton-mic-meniu'));
    if (selectat.din === 'inventar') {
      // Un obiect fără efecte în afara luptei (leacul de otravă) nu se poate folosi degeaba din inventar
      if (d.tip === 'consumabil' && Object.keys(d.efecte || {}).length) b(d.efecte?.nevoi?.sete ? t('Bea') : d.efecte?.nevoi?.foame ? t('Mănâncă') : t('Folosește'), () => ruleaza(joc.folosesteObiect(selectat.index)));
      if (d.tip === 'echipament') b(t('Echipează'), () => ruleaza(echipat(inv.echipeaza(selectat.index))));
      if (optiuni.cufar) b(t('În cufăr'), () => ruleaza(inv.spreCufar(selectat.index)));
      b(t('Aruncă'), () => {
        const index = selectat.index;
        const x = s.inventar[index];
        // Propoziții întregi (cu stivă sau fără), ca engleza să-și poată așeza singură cuvintele
        const intrebare = x.n > 1 ? t('Arunci {obiect} (toate {n})? Nu se mai poate recupera.', { obiect: d.nume, n: x.n }) : t('Arunci {obiect}? Nu se mai poate recupera.', { obiect: d.nume });
        joc.intreaba(intrebare, t('Aruncă'), t('Păstrează')).then((da) => {
          if (!da || s.inventar[index] !== x) return;
          s.inventar.splice(index, 1);
          ruleaza();
        });
      });
    }
    if (selectat.din === 'cufar') {
      if (d.tip === 'echipament') b(t('Echipează'), () => ruleaza(echipat(inv.echipeazaDinCufar(selectat.index))));
      b(t('Ia în inventar'), () => ruleaza(inv.dinCufar(selectat.index)));
    }
    if (selectat.din === 'slot') b(t('Dă jos'), () => ruleaza(echipat(inv.dezechipeaza(selectat.slot))));
    text.append(actiuni);
    detalii.append(ic, text);
    return detalii;
  }

  // Liniile aurii dintre sloturi și corpul lui Vale, desenate din cod. Capătul de pe corp e un punct pe care autorul
  // îl trage în editor (Aranjare → Ecranul de inventar: „Capătul liniei”), pentru fiecare slot
  function linii(ecran) {
    const aranjare = joc.date.aranjare.echipament;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'linii-inv');
    svg.setAttribute('viewBox', `0 0 ${LATIME} ${INALTIME}`);
    let desen = '';
    ecran.obiecte.forEach((o, i) => {
      if (o.tip !== 'inv-slot') return;
      const iP = ecran.obiecte.findIndex((x) => x.id === `punct_${o.id}`);
      if (iP < 0) return;
      const p = pozitie(aranjare, o, i);
      const pp = pozitie(aranjare, ecran.obiecte[iP], iP);
      const l = p.scara * INALTIME;
      const cx = p.x * LATIME;
      const cy = p.y * INALTIME - l / 2;
      // Punctul e ancorat jos-centru, ca orice obiect; linia merge în mijlocul lui
      const tx = pp.x * LATIME;
      const ty = (pp.y - pp.scara / 2) * INALTIME;
      // Linia pleacă de pe marginea slotului, nu din mijlocul lui
      const frac = l / 2 / Math.max(Math.abs(tx - cx), Math.abs(ty - cy), 1);
      if (frac >= 1) return;
      const sx = cx + (tx - cx) * frac;
      const sy = cy + (ty - cy) * frac;
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
      // Capetele liniilor nu se văd ca obiecte: sunt doar locul unde ajunge linia
      if (o.tip === 'inv-punct') return;
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
          slot.append(div(`slot-gol slot-gol-${o.id}`, numeSlot(o.id)));
          slot.onclick = () => ((selectat = null), arata());
        }
        if (selectat?.din === 'slot' && selectat.slot === o.id) slot.classList.add('selectata');
        slot.title = numeSlot(o.id);
        return;
      }
      if (o.tip === 'inv-titlu') {
        const text = o.id === 'titlu_echipament' ? (cuCufar ? t('Cufărul') : t('Echipament')) : t('Inventar');
        const titlu = div('titlu-ecran-inv', text);
        // Textul e cât 80% din înălțimea pusă în editor, minus 10 px (cerut de autor)
        titlu.style.fontSize = `${pozitie(joc.date.aranjare.echipament, o, i).scara * INALTIME * 0.8 - 10}px`;
        return asaza(titlu, o, i, 1700);
      }
      if (o.tip === 'inv-inchide') {
        const b = buton(t('Închide'), inchide, 'buton-mic-meniu inchide-inv');
        const p = pozitie(joc.date.aranjare.echipament, o, i);
        b.style.fontSize = `${p.scara * INALTIME * 0.4}px`;
        return asaza(b, o, i, 1700);
      }
      // Barele lui Vale (decis de autor): aceleași ca în panoul din HUD, cu grafica lor; cu un obiect de mâncat sau
      // de băut ales, partea mai deschisă arată cât ar crește bara (și „+20” lângă cifră)
      // Bara nevoii (decis de autor): una singură, unde o pune autorul în editor; apare doar când e ales ceva de mâncat
      // sau de băut și arată nevoia pe care o umple (pâinea → foamea), cu partea mai deschisă = cât ar crește.
      // Un obiect care umple două nevoi (berea: setea și stamina) are două bare, una sub alta
      if (o.tip === 'inv-bara') {
        const idAles = obiectSelectat();
        const d = idAles && inv.def(idAles);
        if (d?.tip !== 'consumabil') return;
        const p = pozitie(joc.date.aranjare.echipament, o, i);
        const h = p.scara * INALTIME;
        Object.entries(d.efecte?.nevoi || {}).filter(([, plus]) => plus > 0).forEach(([cheie, plus], k) => {
          const bara = baraNevoie(cheie, s.nevoi[cheie] ?? 0, plus, h, h * RAPORT_BARA_INV, joc.date.config.nevoi.prag);
          asaza(bara, o, i, 1600);
          bara.style.marginTop = `${k * h * 1.3}px`;
        });
        return;
      }
      if (o.tip === 'inv-semn') {
        const semn = div('semn-inv');
        semn.append(div('text-semn', vedere === 'poveste' ? t('Înapoi la rucsac') : t('Obiecte de poveste')));
        semn.classList.toggle('activ', vedere === 'poveste');
        semn.onclick = () => ((vedere = vedere === 'poveste' ? 'rucsac' : 'poveste'), (selectat = null), arata());
        const p = pozitie(joc.date.aranjare.echipament, o, i);
        semn.style.fontSize = `${p.scara * INALTIME * 0.075}px`;
        return asaza(semn, o, i, 1600);
      }
      if (o.tip !== 'inv-foaie') return;

      // Foaia din dreapta: rucsacul (sau obiectele de poveste) și detaliile obiectului ales (și la cufăr: decis de autor,
      // ca rucsacul să stea mereu în aceeași parte)
      const c = foaie(o, i, '');
      c.parentElement.dataset.tinta = 'inventar';
      if (vedere === 'poveste') {
        c.append(capFoaie(t('Obiecte de poveste')));
        const lista = div('poveste-inv');
        for (const id of s.poveste) {
          const r = div('obiect-poveste');
          const ic = div('iconita-poveste');
          ic.append(iconita(inv, id));
          r.append(ic, div('', inv.def(id).nume + (inv.def(id).numarabil ? ` ×${s.povesteNumar?.[id] || 0}` : '')));
          // Unele se pot citi (hârtiile soldatului, decis de autor): un clic le deschide, ca o discuție peste imagine
          if (inv.def(id).citeste) {
            r.classList.add('se-citeste');
            r.append(div('citeste-poveste', t('Citește')));
            r.onclick = () => {
              inchide();
              joc.citeste(inv.def(id).citeste);
            };
          }
          lista.append(r);
        }
        if (!s.poveste.length) lista.append(div('ajutor-inv', t('Încă nimic. Cheile, scrisorile și celelalte lucruri importante apar aici și nu se pot pierde.')));
        c.append(lista);
        // Cât mai e ceva dedesubt, marginea de jos a listei se estompează, ca să se vadă că lista continuă
        const estompeaza = () => lista.classList.toggle('mai-jos', lista.scrollTop + lista.clientHeight < lista.scrollHeight - 2);
        lista.addEventListener('scroll', estompeaza);
        requestAnimationFrame(estompeaza);
        return;
      }
      c.append(capFoaie(t('Rucsac'), inv.ocupate(s.inventar) + 1, inv.capacitateRucsac()));
      if (optiuni.deLuat) {
        const { id, n } = optiuni.deLuat;
        const b = div('de-luat');
        b.append(div('', n > 1 ? t('N-ai loc pentru: {obiect} ×{n}. Aruncă sau mută ceva, apoi ia-l.', { obiect: inv.def(id).nume, n }) : t('N-ai loc pentru: {obiect}. Aruncă sau mută ceva, apoi ia-l.', { obiect: inv.def(id).nume })));
        const ia = buton(t('Ia-l'), () => {
          const rest = inv.adauga(id, n);
          optiuni.deLuat = rest ? { id, n: rest } : null;
          ruleaza(rest ? t('Tot nu e loc.') : null);
        }, 'buton-mic-meniu');
        ia.disabled = !inv.incape(id, 1);
        b.append(ia, buton(t('Lasă-l'), () => ((optiuni.deLuat = null), arata()), 'buton-mic-meniu'));
        c.append(b);
      }
      c.append(grila(s.inventar, inv.capacitate(), 'inventar'), detaliiObiect(s));

      // Lângă cufăr: a doua foaie, în stânga, oglindită față de prima
      if (cuCufar) {
        const p = pozitie(joc.date.aranjare.echipament, o, i);
        const cc = foaie({ ...o, id: 'foaie_cufar', implicit: { ...p, x: 1 - p.x } }, i, 'foaie-cufar');
        cc.parentElement.dataset.tinta = 'cufar';
        const total = joc.date.config.inventar.cufar;
        // „În cufăr|titlul foii”: pe ecran tot „În cufăr”, dar cu engleza unui titlu („In the Chest”), nu a butonului
        // care mută obiectul în cufăr („Put in Chest”)
        cc.append(capFoaie(t('În cufăr|titlul foii'), inv.ocupate(s.cufar), total));
        const g = grila(s.cufar, total, 'cufar');
        g.classList.add('grila-cufar');
        cc.append(g);
      }
    });
    if (!cuCufar) el.append(linii(ecran));
  }

  return { deschide, inchide, deschis: () => !!el, reafiseaza: () => el && arata() };
}
