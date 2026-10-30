import { api } from './api.js';
import { creeazaEcran, randeaza, aplicaPozitie, pozitie, pozitieImplicita, puncteSvg, punctNormalizat, LATIME, INALTIME } from '../src/scena.js';

const SVG = 'http://www.w3.org/2000/svg';
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const rotunjeste = (n) => Math.round(n * 10000) / 10000;
const limiteaza = (n, min, max) => Math.min(max, Math.max(min, n));

// Editorul arată varianta de zi, de bază; variantele (noapte, reparat) se văd în joc
const CONTEXT = { moment: 'amiaza', minuteZi: 720, stari: {}, obiecte: [], misiuni: {}, relatii: {} };

export function creeazaAranjare(container, comun, dupaSalvare) {
  const { date, lume } = comun;
  container.innerHTML = '<div class="aranjare"><div class="lista-scene"></div><div class="scena-editor"></div><div class="panou"></div></div>';
  const elLista = container.querySelector('.lista-scene');
  const elPanou = container.querySelector('.panou');
  const { scena, lume: strat } = creeazaEcran(container.querySelector('.scena-editor'));

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

  const descriere = () => lume.get(idScena);

  function copieDeLucru(id) {
    if (modificate.has(id)) return modificate.get(id);
    const a = structuredClone(date.aranjare[id] || {});
    return { zone: a.zone || {}, obiecte: a.obiecte || {} };
  }

  function marcheaza() {
    modificate.set(idScena, lucru);
    arataLista();
    arataButoaneSalvare();
  }

  function pozitieObiect(id) {
    const d = descriere();
    const i = d.obiecte.findIndex((o) => o.id === id);
    return { ...pozitie(lucru, d.obiecte[i], i) };
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
    const r = randeaza(strat, d, lucru, CONTEXT);
    // Zonele jocului se ascund: editorul își desenează propriile zone, cu colțuri care se pot trage
    r.svg.remove();
    elemente = r.obiecte;
    for (const o of d.obiecte) legaObiect(o, elemente.get(o.id));
    arataSuprapunere();
    arataPanou();
  }

  function legaObiect(o, el) {
    el.dataset.nume = o.id;
    el.classList.toggle('selectat', selectie?.tip === 'obiect' && selectie.id === o.id);

    el.addEventListener('pointerdown', (ev) => {
      if (desen || ev.button !== 0) return;
      ev.preventDefault();
      selecteaza({ tip: 'obiect', id: o.id });
      const start = punctNormalizat(scena, ev);
      const poz = pozitieObiect(o.id);
      const x0 = poz.x;
      const y0 = poz.y;
      let mutat = false;
      el.setPointerCapture(ev.pointerId);
      el.onpointermove = (e) => {
        const p = punctNormalizat(scena, e);
        poz.x = rotunjeste(limiteaza(x0 + p[0] - start[0], 0, 1));
        poz.y = rotunjeste(limiteaza(y0 + p[1] - start[1], 0, 1.5));
        lucru.obiecte[o.id] = { ...poz };
        aplicaPozitie(el, poz);
        mutat = true;
        actualizeazaNumerice();
      };
      el.onpointerup = () => {
        el.onpointermove = null;
        if (mutat) marcheaza();
      };
    });

    el.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        if (desen) return;
        selecteaza({ tip: 'obiect', id: o.id });
        const poz = pozitieObiect(o.id);
        poz.scara = rotunjeste(limiteaza(poz.scara * (e.deltaY < 0 ? 1.05 : 1 / 1.05), 0.02, 3));
        lucru.obiecte[o.id] = poz;
        aplicaPozitie(el, poz);
        actualizeazaNumerice();
        marcheaza();
      },
      { passive: false },
    );
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

    for (const t of d.tinte) {
      const poligon = lucru.zone[t.id];
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
        suprapunere.append(element('circle', { cx: x * LATIME, cy: y * INALTIME, r: i === 0 ? 14 : 9, class: 'ez-varf' }));
      });
    }
  }

  function adaugaVarfuri(idTinta, poligonEl) {
    const puncte = lucru.zone[idTinta];
    puncte.forEach((pt, k) => {
      const c = element('circle', { cx: pt[0] * LATIME, cy: pt[1] * INALTIME, r: 11, class: 'ez-varf' });
      c.addEventListener('pointerdown', (ev) => {
        if (ev.button !== 0) return;
        ev.preventDefault();
        c.setPointerCapture(ev.pointerId);
        c.onpointermove = (e) => {
          const [x, y] = punctNormalizat(scena, e);
          puncte[k] = [rotunjeste(limiteaza(x, 0, 1)), rotunjeste(limiteaza(y, 0, 1))];
          c.setAttribute('cx', puncte[k][0] * LATIME);
          c.setAttribute('cy', puncte[k][1] * INALTIME);
          poligonEl.setAttribute('points', puncteSvg(puncte));
        };
        c.onpointerup = () => {
          c.onpointermove = null;
          marcheaza();
          arataSuprapunere();
        };
      });
      // Click dreapta pe un colț îl scoate (un poligon are nevoie de minimum 3)
      c.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (puncte.length <= 3) return;
        puncte.splice(k, 1);
        marcheaza();
        arataSuprapunere();
      });
      suprapunere.append(c);
    });
  }

  suprapunere.addEventListener('pointerdown', (ev) => {
    if (!desen || ev.button !== 0) return;
    ev.preventDefault();
    const [x, y] = punctNormalizat(scena, ev);
    const primul = desen.puncte[0];
    // Click lângă primul punct închide zona, ca la orice program de desen
    if (primul && desen.puncte.length >= 3 && Math.hypot((x - primul[0]) * 16, (y - primul[1]) * 9) < 0.15) return terminaDesenul();
    desen.puncte.push([rotunjeste(limiteaza(x, 0, 1)), rotunjeste(limiteaza(y, 0, 1))]);
    arataSuprapunere();
    arataPanou();
  });

  function incepeDesenul(id) {
    desen = { id, puncte: [] };
    selectie = { tip: 'zona', id };
    arataSuprapunere();
    arataPanou();
  }

  function terminaDesenul() {
    if (desen.puncte.length >= 3) {
      lucru.zone[desen.id] = desen.puncte;
      marcheaza();
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
    const tip = { harta: 'Harta satului', zona: 'Imaginea zonei', loc: 'Scena locului' }[d.tip];
    let html = `<h3>${esc(d.titlu)}</h3><div class="sumar">${tip} · <span class="cale">${esc(d.imagine)}</span></div>
      <div class="salvare">
        <button class="btn principal salveaza">Salvează</button>
        <button class="btn renunta" title="Revine la ultima variantă salvată a acestei scene">Renunță</button>
        <a class="btn" href="index.html?scena=${encodeURIComponent(d.id)}" target="_blank" title="Arată ultima variantă salvată">Testează în joc</a>
      </div>`;

    if (desen) {
      const t = d.tinte.find((x) => x.id === desen.id);
      html += `<h3>Desenezi zona: ${esc(t.nume)}</h3>
        <p>Dă click pe colțurile zonei, unul după altul (${desen.puncte.length} puse).</p>
        <div class="salvare"><button class="btn principal gata" ${desen.puncte.length < 3 ? 'disabled' : ''}>Gata</button><button class="btn anuleaza">Renunță</button></div>
        <div class="ajutor">Click pe primul punct sau Enter = gata.<br>Backspace = șterge ultimul punct.<br>Esc = renunță.</div>`;
    } else {
      if (d.tinte.length) {
        html += `<h3>Zone clicabile</h3>${d.tinte
          .map((t) => {
            const are = (lucru.zone[t.id] || []).length >= 3;
            const sel = selectie?.tip === 'zona' && selectie.id === t.id;
            return `<div class="rand ${sel ? 'selectat' : ''}" data-zona="${esc(t.id)}">
              <span class="nume">${are ? '✓' : '<span class="avertisment">○</span>'} ${esc(t.nume)}</span>
              <button class="btn deseneaza">${are ? 'Redesenează' : 'Desenează'}</button>
              ${are ? '<button class="btn pericol sterge-zona">✕</button>' : ''}
            </div>`;
          })
          .join('')}`;
      }
      if (d.obiecte.length) {
        html += `<h3>${d.tip === 'harta' ? 'Piese pe hartă' : 'Personaje (sprite-uri)'}</h3>${d.obiecte
          .map((o) => {
            const sel = selectie?.tip === 'obiect' && selectie.id === o.id;
            const aranjat = !!lucru.obiecte[o.id];
            return `<div class="rand ${sel ? 'selectat' : ''}" data-obiect="${esc(o.id)}">
              <span class="nume">${aranjat ? '✓' : '<span class="avertisment">○</span>'} ${esc(o.tip === 'sprite' ? o.nume : o.id)}</span>
            </div>${
              sel
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
      if (!d.tinte.length && !d.obiecte.length) html += '<p class="sumar">În scena asta nu e nimic de aranjat încă.</p>';
      html += `<div class="ajutor">
        <b>Obiecte:</b> trage-le cu mouse-ul; rotița le mărește sau micșorează; săgețile le mută fin (cu Shift, mai mult).<br>
        <b>Zone:</b> apasă „Desenează” și dă click pe colțuri. La o zonă aleasă, colțurile se pot trage; click dreapta pe un colț îl șterge.<br>
        <b>Ctrl+S</b> salvează. ○ = încă nearanjat.
      </div>`;
    }
    elPanou.innerHTML = html;

    elPanou.querySelector('.salveaza').onclick = salveaza;
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
        delete lucru.zone[id];
        marcheaza();
        selecteaza(null);
      });
    }
    for (const r of elPanou.querySelectorAll('[data-obiect]')) {
      r.querySelector('.nume').onclick = () => selecteaza({ tip: 'obiect', id: r.dataset.obiect });
    }
    for (const input of elPanou.querySelectorAll('.numeric input')) {
      input.onchange = () => {
        const v = Number(input.value);
        if (!Number.isFinite(v)) return;
        const poz = pozitieObiect(selectie.id);
        poz[input.dataset.k] = rotunjeste(v);
        lucru.obiecte[selectie.id] = poz;
        aplicaPozitie(elemente.get(selectie.id), poz);
        marcheaza();
      };
    }
    elPanou.querySelector('.implicit')?.addEventListener('click', () => {
      const d2 = descriere();
      const i = d2.obiecte.findIndex((o) => o.id === selectie.id);
      delete lucru.obiecte[selectie.id];
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
  addEventListener('keydown', (e) => {
    if (!activ || ['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
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
      const poz = pozitieObiect(selectie.id);
      poz.x = rotunjeste(poz.x + pasi[0] * pas);
      poz.y = rotunjeste(poz.y + pasi[1] * pas);
      lucru.obiecte[selectie.id] = poz;
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
