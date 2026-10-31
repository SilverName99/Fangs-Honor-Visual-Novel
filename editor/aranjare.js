import { api } from './api.js';
import { elementLaPunct } from '../src/lovire.js';
import { undeEste } from '../src/rutine.js';
import { verifica } from '../src/conditii.js';
import { ZILE, NUME_ZILE, momentZi } from '../src/timp.js';

const MOMENTE = { dimineata: 'Dimineața', amiaza: 'Amiaza', seara: 'Seara', noaptea: 'Noaptea' };
import { creeazaEcran, randeaza, aplicaMoment, sufixVarianta, aplicaPozitie, pozitie, pozitieImplicita, puncteSvg, punctNormalizat, LATIME, INALTIME } from '../src/scena.js';

const SVG = 'http://www.w3.org/2000/svg';
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const rotunjeste = (n) => Math.round(n * 10000) / 10000;
const limiteaza = (n, min, max) => Math.min(max, Math.max(min, n));

// Editorul arată scena la ziua și ora alese în panou; variantele după stări (de exemplu reparat) se văd în Testare
const ZILE_SCURT = { luni: 'L', marti: 'Ma', miercuri: 'Mi', joi: 'J', vineri: 'V', sambata: 'S', duminica: 'D' };

export function creeazaAranjare(container, comun, dupaSalvare) {
  const { date, lume } = comun;
  container.innerHTML = '<div class="aranjare"><div class="lista-scene"></div><div class="scena-editor"></div><div class="panou"></div></div>';
  const elLista = container.querySelector('.lista-scene');
  const elPanou = container.querySelector('.panou');
  const ecranul = creeazaEcran(container.querySelector('.scena-editor'));
  const { scena, lume: strat } = ecranul;

  const suprapunere = document.createElementNS(SVG, 'svg');
  suprapunere.setAttribute('class', 'editor-zone');
  suprapunere.setAttribute('viewBox', `0 0 ${LATIME} ${INALTIME}`);
  suprapunere.setAttribute('preserveAspectRatio', 'none');
  scena.append(suprapunere);

  let idScena = 'harta';
  let lucru = null;
  // Modificările nesalvate rămân per scenă, ca autorul să poată sări între scene fără să piardă ce a mutat
  const modificate = new Map();
  let selectie = null;
  let desen = null;
  let elemente = new Map();
  let activ = false;
  let spatiuApasat = false;
  // Ziua și ora la care se uită editorul: scena arată exact ce e în joc atunci
  // (personajele prezente, sprite-ul lor de la ora aceea, variantele de noapte)
  const vedere = { zi: 'luni', ora: 12 };
  const personaje = new Map(date.npcs.personaje.map((p) => [p.id, p]));
  const context = () => {
    const minuteZi = vedere.ora * 60;
    return { moment: momentZi(minuteZi), minuteZi, zi: ZILE.indexOf(vedere.zi) + 1, ziSaptamana: vedere.zi, stari: {}, obiecte: [], misiuni: {}, relatii: {}, deblocate: [] };
  };
  const locScena = () => idScena.replace('.', '/');
  const prezent = (idPers) => {
    const p = personaje.get(idPers);
    return !!p && undeEste(p, context()) === locScena() && verifica(p.apare, context());
  };
  // Cheile sub care se salvează poziția și zona: cu „@cina” când e activă o variantă cu nume
  const ko = (id) => id + sufixVarianta(descriere(), id, context());
  const kz = (id) => {
    const t = descriere().tinte.find((x) => x.id === id);
    return t?.personaj ? id + sufixVarianta(descriere(), t.personaj, context()) : id;
  };
  // Când apare un personaj în scena asta, pe scurt (pentru panou)
  function candEAici(p) {
    const loc = locScena();
    if (p.program) {
      return p.program
        .filter((x) => x.loc === loc)
        .map((x) => `${x.de}–${x.pana}${x.zile ? ` (${x.zile.map((z) => ZILE_SCURT[z]).join(',')})` : ''}${x.sprite ? ` [${x.sprite}]` : ''}`)
        .join(', ');
    }
    if (p.rutina) return Object.entries(p.rutina).filter(([, r]) => r.loc === loc).map(([m]) => m).join(', ');
    return 'mereu';
  }

  const descriere = () => lume.get(idScena);

  function copieDeLucru(id) {
    if (modificate.has(id)) return modificate.get(id);
    const a = structuredClone(date.aranjare[id] || {});
    return { zone: a.zone || {}, obiecte: a.obiecte || {}, primPlan: a.primPlan || [] };
  }

  // Istoric pentru Ctrl+Z, per scenă: o copie a aranjării înainte de fiecare modificare.
  // Modificările repetate rapid (rotița, săgețile) se adună într-un singur pas.
  const istoric = new Map();
  let ultimaRetinere = { tip: null, la: 0 };
  function retine(tip = null) {
    const acum = Date.now();
    if (tip && ultimaRetinere.tip === tip && acum - ultimaRetinere.la < 700) {
      ultimaRetinere.la = acum;
      return;
    }
    ultimaRetinere = { tip, la: acum };
    const stiva = istoric.get(idScena) || [];
    const copie = JSON.stringify(lucru);
    if (stiva.at(-1) !== copie) stiva.push(copie);
    if (stiva.length > 100) stiva.shift();
    istoric.set(idScena, stiva);
  }

  function anuleaza() {
    if (desen) {
      desen.puncte.pop();
      arataSuprapunere();
      arataPanou();
      return;
    }
    const stiva = istoric.get(idScena);
    if (!stiva?.length) return;
    lucru = JSON.parse(stiva.pop());
    ultimaRetinere = { tip: null, la: 0 };
    marcheaza();
    arataScena();
  }

  function marcheaza() {
    modificate.set(idScena, lucru);
    arataLista();
    arataButoaneSalvare();
  }

  function pozitieObiect(id) {
    const d = descriere();
    const i = d.obiecte.findIndex((o) => o.id === id);
    return { ...pozitie(lucru, d.obiecte[i], i, sufixVarianta(d, id, context())) };
  }

  // ---------- lista de scene ----------
  function arataLista() {
    const rand = (id, nivel) => {
      const d = lume.get(id);
      const areFundal = comun.imagini.has(d.imagine);
      return `<button data-id="${esc(id)}" class="n${nivel} ${id === idScena ? 'activ' : ''}" title="${areFundal ? '' : 'Fundal neîncărcat'}">
        <span class="punct ${areFundal ? '' : 'fara'}"></span>${esc(d.titlu)}${modificate.has(id) ? ' •' : ''}</button>`;
    };
    let html = rand('harta', 0);
    for (const z of date.locations.zone) {
      html += rand(z.id, 1);
      for (const l of z.locuri) if (!l.actiune) html += rand(`${z.id}.${l.id}`, 2);
    }
    html += '<div class="titlu-grup">Ecrane</div>' + rand('echipament', 0);
    elLista.innerHTML = html;
    for (const b of elLista.querySelectorAll('button')) b.onclick = () => deschide(b.dataset.id);
  }

  function deschide(id) {
    if (desen) desen = null;
    idScena = id;
    lucru = copieDeLucru(id);
    selectie = null;
    arataScena();
    arataLista();
  }

  // ---------- scena: obiecte trase cu mouse-ul ----------
  function arataScena() {
    const d = descriere();
    const ctx = context();
    const r = randeaza(strat, d, lucru, ctx);
    aplicaMoment(strat, r, d, ctx);
    // Zonele jocului se ascund: editorul își desenează propriile zone, cu colțuri care se pot trage
    r.svg.remove();
    // Personajele care nu sunt aici la ora aleasă nu se văd (ca în joc)
    for (const o of d.obiecte) {
      if (o.tip === 'sprite' && !prezent(o.id)) {
        r.obiecte.get(o.id).remove();
        r.obiecte.delete(o.id);
      }
    }
    elemente = r.obiecte;
    for (const o of d.obiecte) if (elemente.has(o.id)) legaObiect(o, elemente.get(o.id));
    arataSuprapunere();
    arataPanou();
  }

  function legaObiect(o, el) {
    el.dataset.nume = o.id;
    el.classList.toggle('selectat', selectie?.tip === 'obiect' && selectie.id === o.id);
  }

  // Obiectul se alege după pixelul de sub mouse (ca în joc), nu după dreptunghi:
  // piesele suprapuse se pot apuca fiecare de partea ei vizibilă
  function obiectLa(ev) {
    const el = elementLaPunct(elemente.values(), ev);
    return el ? descriere().obiecte.find((o) => o.id === el.dataset.id) : null;
  }

  function incepeMutarea(o, ev) {
    const el = elemente.get(o.id);
    selecteaza({ tip: 'obiect', id: o.id });
    const start = punctNormalizat(scena, ev);
    const poz = pozitieObiect(o.id);
    const x0 = poz.x;
    const y0 = poz.y;
    let mutat = false;
    urmaresteTragerea(ev, (e) => {
      const p = punctNormalizat(scena, e);
      if (!mutat) retine();
      poz.x = rotunjeste(limiteaza(x0 + p[0] - start[0], 0, 1));
      poz.y = rotunjeste(limiteaza(y0 + p[1] - start[1], 0, 1.5));
      lucru.obiecte[ko(o.id)] = { ...poz };
      aplicaPozitie(el, poz);
      mutat = true;
      actualizeazaNumerice();
    }, () => mutat && marcheaza());
  }

  function incepeDeplasarea(ev) {
    let ultim = [ev.clientX, ev.clientY];
    ecranul.ecran.style.cursor = 'grabbing';
    urmaresteTragerea(ev, (e) => {
      ecranul.muta(e.clientX - ultim[0], e.clientY - ultim[1]);
      ultim = [e.clientX, e.clientY];
    }, () => (ecranul.ecran.style.cursor = ''));
  }

  function urmaresteTragerea(ev, laMiscare, laFinal) {
    ev.preventDefault();
    const sus = () => {
      removeEventListener('pointermove', laMiscare);
      removeEventListener('pointerup', sus);
      laFinal?.();
    };
    addEventListener('pointermove', laMiscare);
    addEventListener('pointerup', sus);
  }

  ecranul.ecran.addEventListener('contextmenu', (e) => e.preventDefault());
  ecranul.ecran.addEventListener('pointerdown', (ev) => {
    if (ev.target.closest?.('.ez-varf')) return;
    // Click dreapta, rotița apăsată sau Space + click mută vederea (util când e mărită)
    if (ev.button === 2 || ev.button === 1 || (ev.button === 0 && spatiuApasat)) return incepeDeplasarea(ev);
    if (ev.button !== 0 || desen) return;
    const o = obiectLa(ev);
    if (o) return incepeMutarea(o, ev);
    if (ecranul.vedere.zoom > 1) return incepeDeplasarea(ev);
    selecteaza(null);
  });
  ecranul.ecran.addEventListener('pointermove', (ev) => {
    if (desen || ev.buttons) return;
    ecranul.ecran.style.cursor = obiectLa(ev) ? 'grab' : '';
  });
  ecranul.ecran.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      const o = !desen && !e.ctrlKey ? obiectLa(e) : null;
      if (!o) {
        // Rotița pe fundal (sau Ctrl + rotița oriunde) mărește vederea, ca zonele să se deseneze precis
        ecranul.zoomLa(ecranul.vedere.zoom * (e.deltaY < 0 ? 1.2 : 1 / 1.2), e.clientX, e.clientY);
        arataZoom();
        return;
      }
      selecteaza({ tip: 'obiect', id: o.id });
      const poz = pozitieObiect(o.id);
      retine(`scara:${o.id}`);
      poz.scara = rotunjeste(limiteaza(poz.scara * (e.deltaY < 0 ? 1.05 : 1 / 1.05), 0.02, 3));
      lucru.obiecte[ko(o.id)] = poz;
      aplicaPozitie(elemente.get(o.id), poz);
      actualizeazaNumerice();
      marcheaza();
    },
    { passive: false },
  );

  function arataZoom() {
    const el = elPanou.querySelector('.zoom-procent');
    if (el) el.textContent = `${Math.round(ecranul.vedere.zoom * 100)}%`;
  }

  function selecteaza(s) {
    selectie = s;
    for (const [id, el] of elemente) el.classList.toggle('selectat', s?.tip === 'obiect' && s.id === id);
    arataSuprapunere();
    arataPanou();
  }

  // ---------- zonele clicabile (poligoane) ----------
  function element(nume, atribute) {
    const e = document.createElementNS(SVG, nume);
    for (const [k, v] of Object.entries(atribute)) e.setAttribute(k, v);
    return e;
  }

  function arataSuprapunere() {
    suprapunere.replaceChildren();
    suprapunere.classList.toggle('desen', !!desen);
    const d = descriere();

    lucru.primPlan.forEach((poligon, i) => {
      suprapunere.append(element('polygon', { points: puncteSvg(poligon), class: 'ez-primplan' }));
      const cx = poligon.reduce((s2, q) => s2 + q[0], 0) / poligon.length;
      const cy = poligon.reduce((s2, q) => s2 + q[1], 0) / poligon.length;
      const et = element('text', { x: cx * LATIME, y: cy * INALTIME, 'text-anchor': 'middle', class: 'ez-eticheta' });
      et.textContent = `prim-plan ${i + 1}`;
      suprapunere.append(et);
    });

    for (const t of d.tinte) {
      if (t.personaj && !prezent(t.personaj)) continue;
      const poligon = lucru.zone[kz(t.id)];
      if (!poligon || poligon.length < 3 || desen?.id === t.id) continue;
      const selectat = selectie?.tip === 'zona' && selectie.id === t.id;
      const p = element('polygon', { points: puncteSvg(poligon), class: `ez-poligon ${selectat ? 'selectat' : ''}` });
      // Poligoanele nu prind click-uri, ca piesele de sub ele să rămână ușor de tras; zona se alege din panou
      p.style.pointerEvents = 'none';
      suprapunere.append(p);
      const cx = poligon.reduce((s, q) => s + q[0], 0) / poligon.length;
      const cy = poligon.reduce((s, q) => s + q[1], 0) / poligon.length;
      const et = element('text', { x: cx * LATIME, y: cy * INALTIME, 'text-anchor': 'middle', class: 'ez-eticheta' });
      et.textContent = t.nume;
      suprapunere.append(et);
      if (selectat) adaugaVarfuri(t.id, p);
    }

    if (desen) {
      const linie = element('polyline', { points: puncteSvg(desen.puncte), class: 'ez-linie' });
      suprapunere.append(linie);
      desen.puncte.forEach(([x, y], i) => {
        const c = element('circle', { cx: x * LATIME, cy: y * INALTIME, r: i === 0 ? 5.5 : 3.6, class: 'ez-varf' });
        // Click dreapta pe o bulină o șterge, chiar în timpul desenului
        c.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          desen.puncte.splice(i, 1);
          arataSuprapunere();
          arataPanou();
        });
        suprapunere.append(c);
      });
    }
  }

  function adaugaVarfuri(idTinta, poligonEl) {
    const puncte = lucru.zone[kz(idTinta)];
    puncte.forEach((pt, k) => {
      const c = element('circle', { cx: pt[0] * LATIME, cy: pt[1] * INALTIME, r: 4.4, class: 'ez-varf' });
      c.addEventListener('pointerdown', (ev) => {
        if (ev.button !== 0) return;
        ev.preventDefault();
        c.setPointerCapture(ev.pointerId);
        let mutat = false;
        c.onpointermove = (e) => {
          if (!mutat) retine();
          mutat = true;
          const [x, y] = punctNormalizat(scena, e);
          puncte[k] = [rotunjeste(limiteaza(x, 0, 1)), rotunjeste(limiteaza(y, 0, 1))];
          c.setAttribute('cx', puncte[k][0] * LATIME);
          c.setAttribute('cy', puncte[k][1] * INALTIME);
          poligonEl.setAttribute('points', puncteSvg(puncte));
        };
        c.onpointerup = () => {
          c.onpointermove = null;
          if (!mutat) return;
          marcheaza();
          arataSuprapunere();
        };
      });
      // Click dreapta pe un colț îl scoate (un poligon are nevoie de minimum 3)
      c.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (puncte.length <= 3) return;
        retine();
        puncte.splice(k, 1);
        marcheaza();
        arataSuprapunere();
      });
      suprapunere.append(c);
    });
  }

  suprapunere.addEventListener('pointerdown', (ev) => {
    if (!desen || ev.button !== 0 || spatiuApasat) return;
    ev.preventDefault();
    const [x, y] = punctNormalizat(scena, ev);
    const primul = desen.puncte[0];
    // Click lângă primul punct închide zona, ca la orice program de desen
    if (primul && desen.puncte.length >= 3 && Math.hypot((x - primul[0]) * 16, (y - primul[1]) * 9) < 0.15) return terminaDesenul();
    desen.puncte.push([rotunjeste(limiteaza(x, 0, 1)), rotunjeste(limiteaza(y, 0, 1))]);
    arataSuprapunere();
    arataPanou();
  });

  // Prim-planul se desenează la fel ca o zonă, dar se adaugă în lista primPlan (id-ul special „__primplan”)
  const PRIM_PLAN = '__primplan';

  function incepeDesenul(id) {
    desen = { id, puncte: [] };
    selectie = id === PRIM_PLAN ? null : { tip: 'zona', id };
    arataSuprapunere();
    arataPanou();
  }

  function terminaDesenul() {
    if (desen.puncte.length >= 3) {
      retine();
      if (desen.id === PRIM_PLAN) lucru.primPlan.push(desen.puncte);
      else lucru.zone[kz(desen.id)] = desen.puncte;
      marcheaza();
      if (desen.id === PRIM_PLAN) {
        desen = null;
        // Scena se redesenează, ca prim-planul nou să acopere imediat personajele
        return arataScena();
      }
    }
    desen = null;
    arataSuprapunere();
    arataPanou();
  }

  function renuntaLaDesen() {
    desen = null;
    arataSuprapunere();
    arataPanou();
  }

  // ---------- panoul din dreapta ----------
  function arataButoaneSalvare() {
    const b = elPanou.querySelector('.salveaza');
    if (!b) return;
    b.disabled = modificate.size === 0;
    b.textContent = modificate.size > 1 ? `Salvează (${modificate.size} scene)` : 'Salvează';
    elPanou.querySelector('.renunta').disabled = !modificate.has(idScena);
  }

  function actualizeazaNumerice() {
    if (selectie?.tip !== 'obiect') return;
    const poz = pozitieObiect(selectie.id);
    for (const k of ['x', 'y', 'scara']) {
      const input = elPanou.querySelector(`input[data-k="${k}"]`);
      if (input && document.activeElement !== input) input.value = poz[k];
    }
  }

  function arataPanou() {
    const d = descriere();
    const tip = { harta: 'Harta satului', zona: 'Imaginea zonei', loc: 'Scena locului', ecran: 'Ecranul de inventar (fundal opțional)' }[d.tip];
    let html = `<h3>${esc(d.titlu)}</h3><div class="sumar">${tip} · <span class="cale">${esc(d.imagine)}</span></div>
      <div class="salvare">
        <button class="btn principal salveaza">Salvează</button>
        <button class="btn renunta" title="Revine la ultima variantă salvată a acestei scene">Renunță</button>
        <a class="btn" href="index.html?scena=${encodeURIComponent(d.id)}" target="_blank" title="Arată ultima variantă salvată">Testează în joc</a>
      </div>
      <div class="salvare">Zoom: <b class="zoom-procent">${Math.round(ecranul.vedere.zoom * 100)}%</b>
        <button class="btn zoom-plus">+</button><button class="btn zoom-minus">−</button><button class="btn zoom-reset">Potrivește</button></div>
      <div class="ora-editor">
        <select class="zi-ed">${ZILE.map((z) => `<option value="${z}" ${z === vedere.zi ? 'selected' : ''}>${NUME_ZILE[z]}</option>`).join('')}</select>
        <button class="btn ora-minus" title="O oră înapoi">−</button>
        <b>${String(vedere.ora).padStart(2, '0')}:00</b>
        <button class="btn ora-plus" title="O oră înainte">+</button>
        <span class="sumar">${MOMENTE[context().moment]}</span>
      </div>`;

    if (desen) {
      const t = desen.id === PRIM_PLAN ? { nume: 'prim-plan (ce stă în fața personajelor)' } : d.tinte.find((x) => x.id === desen.id);
      html += `<h3>Desenezi zona: ${esc(t.nume)}</h3>
        <p>Dă click pe colțurile zonei, unul după altul (${desen.puncte.length} puse).</p>
        <div class="salvare"><button class="btn principal gata" ${desen.puncte.length < 3 ? 'disabled' : ''}>Gata</button><button class="btn anuleaza">Renunță</button></div>
        <div class="ajutor">Click pe primul punct sau Enter = gata.<br>Click dreapta pe o bulină = o șterge.<br>Ctrl+Z sau Backspace = șterge ultimul punct.<br>Esc = renunță.</div>`;
    } else {
      if (d.tinte.length) {
        html += `<h3>Zone clicabile</h3>${d.tinte
          .map((t) => {
            const absent = t.personaj && !prezent(t.personaj);
            const are = (lucru.zone[kz(t.id)] || []).length >= 3;
            const sel = selectie?.tip === 'zona' && selectie.id === t.id;
            // O zonă cu piesă pe hartă nu are nevoie de desen: jocul folosește forma piesei
            const automat = !are && d.obiecte.some((o) => o.tinta === t.id);
            const semn = are ? '✓' : automat ? '<span class="bine" title="Se folosește forma piesei">✓ auto</span>' : '<span class="avertisment">○</span>';
            return `<div class="rand ${sel ? 'selectat' : ''}" data-zona="${esc(t.id)}">
              <span class="nume">${semn} ${esc(t.nume)}${kz(t.id) !== t.id ? ` <span class="sumar">(${esc(kz(t.id).split('@')[1])})</span>` : ''}${absent ? ' <span class="sumar">(nu e aici acum)</span>' : ''}</span>
              <button class="btn deseneaza" ${absent ? 'disabled' : ''}>${are ? 'Redesenează' : 'Desenează'}</button>
              ${are ? '<button class="btn pericol sterge-zona">✕</button>' : ''}
            </div>`;
          })
          .join('')}`;
      }
      if (d.obiecte.length) {
        html += `<h3>${{ harta: 'Piese pe hartă', ecran: 'Figura și sloturile' }[d.tip] || 'Personaje (sprite-uri)'}</h3>${d.obiecte
          .map((o) => {
            const sel = selectie?.tip === 'obiect' && selectie.id === o.id;
            const aranjat = !!lucru.obiecte[ko(o.id)];
            const absent = o.tip === 'sprite' && !prezent(o.id);
            const varianta = ko(o.id) !== o.id ? ` <span class="sumar">(${esc(ko(o.id).split('@')[1])})</span>` : '';
            return `<div class="rand ${sel ? 'selectat' : ''} ${absent ? 'absent' : ''}" data-obiect="${esc(o.id)}">
              <span class="nume">${aranjat ? '✓' : '<span class="avertisment">○</span>'} ${esc(o.tip === 'piesa' ? o.id : o.nume)}${varianta}
              ${o.tip === 'sprite' ? `<br><span class="sumar">aici: ${esc(candEAici(personaje.get(o.id)))}${absent ? ' · nu e aici la ora aleasă' : ''}</span>` : ''}</span>
            </div>${
              sel && !absent
                ? `<div class="numeric">
                    <label>x</label><input type="number" step="0.005" data-k="x">
                    <label>y (picioarele)</label><input type="number" step="0.005" data-k="y">
                    <label>scară</label><input type="number" step="0.01" data-k="scara">
                  </div><div class="salvare"><button class="btn implicit">Poziția inițială</button></div>`
                : ''
            }`;
          })
          .join('')}`;
      }
      if (d.tip !== 'ecran') {
        html += `<h3>Prim-plan</h3>
          <div class="sumar">Conturează ce trebuie să stea <b>în fața</b> personajelor (de exemplu zidul fântânii). Bucata aceea din fundal se pune peste ele, ca să pară în spatele ei.</div>
          ${lucru.primPlan
            .map((_, i) => `<div class="rand" data-primplan="${i}"><span class="nume">✓ Prim-plan ${i + 1}</span><button class="btn pericol sterge-primplan">✕</button></div>`)
            .join('')}
          <div class="salvare"><button class="btn adauga-primplan">+ Desenează prim-plan</button></div>`;
      }
      if (!d.tinte.length && !d.obiecte.length && d.tip === 'ecran') html += '<p class="sumar">În scena asta nu e nimic de aranjat încă.</p>';
      html += `<div class="ajutor">
        <b>Obiecte:</b> trage-le cu mouse-ul; rotița pe obiect îl mărește sau micșorează; săgețile îl mută fin (cu Shift, mai mult).<br>
        <b>Vederea:</b> rotița pe fundal (sau Ctrl + rotița) face zoom; click dreapta + tras (sau Space + tras) mută imaginea.<br>
        <b>Zone:</b> piesele de pe hartă nu au nevoie de zonă desenată („✓ auto”: se folosește forma piesei). Desenezi doar unde nu e piesă: apasă „Desenează” și dă click pe colțuri. La o zonă aleasă, colțurile se pot trage; click dreapta pe un colț îl șterge.<br>
        <b>Ctrl+Z</b> anulează ultima modificare. <b>Ctrl+S</b> salvează. ○ = încă nearanjat.
      </div>`;
    }
    elPanou.innerHTML = html;

    elPanou.querySelector('.salveaza').onclick = salveaza;
    const centru = () => {
      const r = ecranul.ecran.getBoundingClientRect();
      return [r.left + r.width / 2, r.top + r.height / 2];
    };
    elPanou.querySelector('.zoom-plus').onclick = () => (ecranul.zoomLa(ecranul.vedere.zoom * 1.5, ...centru()), arataZoom());
    elPanou.querySelector('.zoom-minus').onclick = () => (ecranul.zoomLa(ecranul.vedere.zoom / 1.5, ...centru()), arataZoom());
    elPanou.querySelector('.zi-ed').onchange = (e) => {
      vedere.zi = e.target.value;
      arataScena();
    };
    // Ora trece peste miezul nopții în ambele sensuri (23 → 0 și 0 → 23)
    const schimbaOra = (cu) => {
      vedere.ora = (vedere.ora + cu + 24) % 24;
      arataScena();
    };
    elPanou.querySelector('.ora-minus').onclick = () => schimbaOra(-1);
    elPanou.querySelector('.ora-plus').onclick = () => schimbaOra(1);
    elPanou.querySelector('.zoom-reset').onclick = () => (ecranul.reseteaza(), arataZoom());
    elPanou.querySelector('.renunta').onclick = () => {
      if (!confirm('Renunți la modificările nesalvate din această scenă?')) return;
      modificate.delete(idScena);
      deschide(idScena);
    };
    elPanou.querySelector('.gata')?.addEventListener('click', terminaDesenul);
    elPanou.querySelector('.anuleaza')?.addEventListener('click', renuntaLaDesen);
    for (const r of elPanou.querySelectorAll('[data-zona]')) {
      const id = r.dataset.zona;
      r.querySelector('.nume').onclick = () => selecteaza({ tip: 'zona', id });
      r.querySelector('.deseneaza').onclick = () => incepeDesenul(id);
      r.querySelector('.sterge-zona')?.addEventListener('click', () => {
        if (!confirm('Ștergi zona desenată?')) return;
        retine();
        delete lucru.zone[kz(id)];
        marcheaza();
        selecteaza(null);
      });
    }
    elPanou.querySelector('.adauga-primplan')?.addEventListener('click', () => incepeDesenul(PRIM_PLAN));
    for (const r of elPanou.querySelectorAll('[data-primplan]')) {
      r.querySelector('.sterge-primplan').onclick = () => {
        if (!confirm('Ștergi acest prim-plan?')) return;
        retine();
        lucru.primPlan.splice(Number(r.dataset.primplan), 1);
        marcheaza();
        arataScena();
      };
    }
    for (const r of elPanou.querySelectorAll('[data-obiect]')) {
      r.querySelector('.nume').onclick = () => selecteaza({ tip: 'obiect', id: r.dataset.obiect });
    }
    for (const input of elPanou.querySelectorAll('.numeric input')) {
      input.onchange = () => {
        const v = Number(input.value);
        if (!Number.isFinite(v)) return;
        retine();
        const poz = pozitieObiect(selectie.id);
        poz[input.dataset.k] = rotunjeste(v);
        lucru.obiecte[ko(selectie.id)] = poz;
        aplicaPozitie(elemente.get(selectie.id), poz);
        marcheaza();
      };
    }
    elPanou.querySelector('.implicit')?.addEventListener('click', () => {
      retine();
      const d2 = descriere();
      const i = d2.obiecte.findIndex((o) => o.id === selectie.id);
      delete lucru.obiecte[ko(selectie.id)];
      aplicaPozitie(elemente.get(selectie.id), pozitieImplicita(i, d2.obiecte[i].tip));
      marcheaza();
      arataPanou();
    });
    actualizeazaNumerice();
    arataButoaneSalvare();
  }

  async function salveaza() {
    if (!modificate.size) return;
    const b = elPanou.querySelector('.salveaza');
    if (b) {
      b.disabled = true;
      b.textContent = 'Se salvează...';
    }
    try {
      for (const [id, a] of [...modificate]) {
        await api(`aranjare/${id}`, { method: 'PUT', body: JSON.stringify(a), headers: { 'Content-Type': 'application/json' } });
        date.aranjare[id] = structuredClone(a);
        modificate.delete(id);
      }
    } catch (e) {
      alert(`Salvarea a eșuat:\n${e.message}`);
    }
    arataLista();
    arataPanou();
    dupaSalvare();
  }

  // ---------- tastatura ----------
  addEventListener('keyup', (e) => {
    if (e.code === 'Space') spatiuApasat = false;
  });
  addEventListener('keydown', (e) => {
    if (!activ || ['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
    if (e.code === 'Space') {
      e.preventDefault();
      spatiuApasat = true;
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      anuleaza();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      salveaza();
      return;
    }
    if (desen) {
      if (e.key === 'Enter') terminaDesenul();
      else if (e.key === 'Escape') renuntaLaDesen();
      else if (e.key === 'Backspace') {
        e.preventDefault();
        desen.puncte.pop();
        arataSuprapunere();
        arataPanou();
      }
      return;
    }
    const pasi = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (pasi && selectie?.tip === 'obiect') {
      e.preventDefault();
      const pas = e.shiftKey ? 0.01 : 0.002;
      retine(`sageti:${selectie.id}`);
      const poz = pozitieObiect(selectie.id);
      poz.x = rotunjeste(poz.x + pasi[0] * pas);
      poz.y = rotunjeste(poz.y + pasi[1] * pas);
      lucru.obiecte[ko(selectie.id)] = poz;
      aplicaPozitie(elemente.get(selectie.id), poz);
      actualizeazaNumerice();
      marcheaza();
    }
  });

  return {
    arata() {
      activ = true;
      if (!lucru) deschide(idScena);
      else arataLista();
    },
    ascunde() {
      activ = false;
    },
    areModificari: () => modificate.size > 0,
  };
}
