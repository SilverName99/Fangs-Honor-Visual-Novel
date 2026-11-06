import { api } from './api.js';
import { ELEMENTE_UI, fisierUi, BARE_IMPLICIT, REGLAJE_MENIU } from '../src/uiGrafica.js';
import { urlImagine, uitaLipsurile } from '../src/imagini.js';

const esc = (t) => String(t).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const EXPLICATII = {
  '9-slice': 'Ramă care se întinde: colțurile rămân neschimbate, doar mijlocul se întinde. „Margine” = cât de lat e colțul, în pixeli; la 0, imaginea se întinde întreagă; cu minus, se întinde întreagă și iese în afară cu atâția pixeli.',
  fundal: 'Se întinde pe tot elementul.',
  textura: 'Se repetă pe orizontală, deci capetele trebuie să se continue fără cusătură.',
  cursor: 'Vârful săgeții trebuie să fie în colțul din stânga-sus al imaginii.',
  imagine: 'Folosită ca atare (fundal transparent).',
  strat: 'Stă la mărimea ei, centrată peste element (cu strălucirea din jur cu tot).',
};

const ALTE_MARIMI = [
  ['Harta, imaginile de zonă, scenele', '1920 × 1080 px'],
  ['Piesele de pe hartă (clădiri)', 'decupate pe contur, fundal transparent; cam cât vor ocupa pe harta de 1920 × 1080'],
  ['Portretele de dialog', '1024 × 1280 px (4:5), bust, fundal transparent'],
  ['Sprite-urile din scene', 'înalte de ~900-1000 px, decupate strâns pe contur, fundal transparent'],
  ['Pozele de luptă', '~600 × 1000 px, fundal transparent; aliații privesc spre dreapta, inamicii spre stânga'],
  ['Iconițele obiectelor', '128 × 128 px, fundal transparent'],
];

// Exemplul din cartonaș arată rama la fel ca în joc: margine pozitivă = colțuri fixe, 0 = întinsă întreagă,
// minus = întinsă întreagă și ieșită în afară (de aceea exemplul primește și spațiu în jur, ca să se vadă)
function stilExemplu(url, m) {
  if (m < 0) return `border-width:0;border-style:solid;border-image:url('${url}') 0 fill / 0 / ${-m}px stretch;margin:${-m}px`;
  return `border-width:${m}px;border-style:solid;border-image:url('${url}') ${m} fill / ${m}px stretch`;
}

export function creeazaInterfata(container, comun, reincarcaImagini, dupaSalvare) {
  const margini = { ...(comun.date.aranjare.ui?.margini || {}) };
  // Barele colorate din panoul lui Vale: grosimea umplerii și spațiul ei față de ramă
  const bare = { ...BARE_IMPLICIT, ...(comun.date.aranjare.ui?.bare || {}) };
  // Mărimile meniului (tabla, butoanele, iconițele, textele), cu previzualizare pe loc într-un joc deschis alături
  const meniu = Object.fromEntries(REGLAJE_MENIU.map(([k, , implicit]) => [k, comun.date.aranjare.ui?.meniu?.[k] ?? implicit]));
  let modificat = false;
  let deschisMeniu = false;

  async function incarca(id, fisier) {
    if (!fisier) return;
    try {
      await api(`imagini/${fisierUi(id)}`, { method: 'PUT', body: fisier });
      await reincarcaImagini();
      uitaLipsurile();
    } catch (e) {
      alert(`Nu s-a încărcat: ${e.message}`);
    }
    arata();
  }

  // Reglajul barelor colorate: trei valori cu − / +, plus un exemplu cu rama și umplerea de viață, ca în joc
  const RANDURI_BARE = [
    ['grosime', 'Grosimea umplerii', 2],
    ['sus', 'Spațiu sus și jos (față de ramă)', 0],
    ['lateral', 'Spațiu stânga și dreapta (față de ramă)', 0],
  ];
  function stilExempluBara(urlRama, m) {
    const rama = urlRama ? stilExemplu(urlRama, m) : 'border:2px solid #2a1a0e;background:#3a2817';
    return `${rama};height:${bare.grosime}px;padding:${bare.sus}px ${bare.lateral}px;border-radius:${urlRama ? 0 : 999}px;overflow:hidden`;
  }
  function stilUmplere() {
    const cale = fisierUi('bara_viata');
    const url = comun.imagini.has(cale) ? `${urlImagine(cale)}?v=${comun.imagini.get(cale)}` : '';
    return `width:60%;height:100%;border-radius:999px;${url ? `background:url('${url}') repeat-x;background-size:auto 100%` : 'background:#c94a3f'}`;
  }
  function reglajBare(urlRama, m) {
    return `<div class="reglaj-bare"><b>Barele colorate din panoul lui Vale</b>
      ${RANDURI_BARE.map(([k, nume]) => `<div class="rand">${esc(nume)}: <button class="btn mic" data-bara="${k}" data-pas="-1">−</button><span class="valoare-bara" data-k="${k}">${bare[k]}px</span><button class="btn mic" data-bara="${k}" data-pas="1">+</button></div>`).join('')}
      <div class="exemplu-bara" data-url="${urlRama}" data-m="${m}" style="${stilExempluBara(urlRama, m)}"><div class="umplere-exemplu" style="${stilUmplere()}"></div></div>
      <div class="sumar">Exemplul arată bara de viață pe jumătate plină.</div>
      <div class="salvare"><button class="btn principal salveaza-margini" ${modificat ? '' : 'disabled'}>Salvează barele</button></div>
    </div>`;
  }

  function arata() {
    container.innerHTML = `
      <h2>Grafica interfeței</h2>
      <p class="sumar">Până încarci un element, jocul folosește stilul simplu de acum. Dimensiunile sunt recomandate, nu obligatorii. Doar PNG.</p>
      <div class="salvare"><button class="btn principal salveaza-margini" ${modificat ? '' : 'disabled'}>Salvează marginile</button></div>
      <details class="reglaj-meniu" ${deschisMeniu ? 'open' : ''}><summary><b>Meniul: mărimi și spații</b></summary>
        <div class="reglaj-meniu-interior">
          <div class="randuri-meniu">${REGLAJE_MENIU.map(([k, nume]) => `<div class="rand">${esc(nume)}: <button class="btn mic" data-meniu="${k}" data-pas="-1">−</button><span class="valoare-meniu" data-k="${k}">${meniu[k]}px</span><button class="btn mic" data-meniu="${k}" data-pas="1">+</button></div>`).join('')}
            <div class="salvare"><button class="btn principal salveaza-margini" ${modificat ? '' : 'disabled'}>Salvează meniul</button></div>
          </div>
          <iframe class="previzualizare-meniu" src="index.html?test=1&meniu=1" title="Previzualizare meniu"></iframe>
        </div>
      </details>
      <div class="grila-ui">${ELEMENTE_UI.map((el) => {
        const cale = fisierUi(el.id);
        const are = comun.imagini.has(cale);
        const url = are ? `${urlImagine(cale)}?v=${comun.imagini.get(cale)}` : '';
        const m = margini[el.id] ?? el.margine;
        return `<div class="card-ui" data-id="${el.id}">
          <div class="cap-card"><b>${esc(el.nume)}</b> ${are ? '<span class="bine">✓</span>' : '<span class="sumar">neîncărcat</span>'}</div>
          <div class="cale">${esc(cale)}</div>
          <div><b>Mărime:</b> ${esc(el.marime)}</div>
          <div class="sumar">${EXPLICATII[el.tip]}${el.ca ? ' Folosește marginea butonului de bază.' : ''}</div>
          ${are ? `<img class="previzualizare" src="${url}">` : ''}
          ${
            are && el.tip === '9-slice' && !el.ca
              ? `<div class="rand">Margine: <button class="btn mic minus-margine" title="−1 px">−</button><input type="range" min="-100" max="200" value="${m}" class="margine"><button class="btn mic plus-margine" title="+1 px">+</button> <span class="valoare-margine">${m}px</span></div>
                 <div class="exemplu-9" data-url="${url}" style="${stilExemplu(url, m)}">Exemplu întins</div>
                 <div class="salvare"><button class="btn principal salveaza-margini" ${modificat ? '' : 'disabled'}>Salvează marginea</button></div>`
              : ''
          }
          ${el.id === 'bara_rama' ? reglajBare(url, m) : ''}
          <div class="salvare"><label class="btn">${are ? 'Înlocuiește' : 'Încarcă'}<input type="file" accept="image/png" hidden></label>
          ${are ? '<button class="btn pericol sterge-ui">Șterge</button>' : ''}</div>
        </div>`;
      }).join('')}</div>
      <h2>Alte dimensiuni recomandate</h2>
      <table>${ALTE_MARIMI.map(([a, b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join('')}</table>`;

    for (const card of container.querySelectorAll('.card-ui')) {
      const id = card.dataset.id;
      card.querySelector('input[type=file]').onchange = (e) => incarca(id, e.target.files[0]);
      card.querySelector('.sterge-ui')?.addEventListener('click', async () => {
        if (!confirm('Ștergi imaginea? (ajunge în coșul de pe server)')) return;
        await api(`imagini/${fisierUi(id)}`, { method: 'DELETE' });
        await reincarcaImagini();
        arata();
      });
      const r = card.querySelector('.margine');
      if (r) {
        r.oninput = () => {
          margini[id] = Number(r.value);
          modificat = true;
          card.querySelector('.valoare-margine').textContent = `${r.value}px`;
          const ex = card.querySelector('.exemplu-9');
          ex.style.cssText = stilExemplu(ex.dataset.url, Number(r.value));
          // Fiecare ramă are butonul ei de salvare (cel de sus nu se vede când ești jos pe pagină)
          for (const b of container.querySelectorAll('.salveaza-margini')) b.disabled = false;
        };
        // − și + mută marginea câte un pixel, pentru reglaj fin (glisorul sare prea mult)
        const pas = (cu) => {
          r.value = String(Number(r.value) + cu);
          r.oninput();
        };
        card.querySelector('.minus-margine').onclick = () => pas(-1);
        card.querySelector('.plus-margine').onclick = () => pas(1);
      }
    }
    // Meniul: fiecare − / + schimbă valoarea cu pasul ei și o trimite pe loc previzualizării
    const trimiteMeniul = () => container.querySelector('.previzualizare-meniu')?.contentWindow?.postMessage({ tip: 'reglaje-meniu', valori: { ...meniu } }, location.origin);
    const cadru = container.querySelector('.previzualizare-meniu');
    if (cadru) cadru.onload = trimiteMeniul;
    container.querySelector('.reglaj-meniu').ontoggle = (e) => (deschisMeniu = e.target.open);
    for (const b of container.querySelectorAll('[data-meniu]')) {
      b.onclick = () => {
        const k = b.dataset.meniu;
        const pas = REGLAJE_MENIU.find(([x]) => x === k)[3];
        meniu[k] = Math.max(0, meniu[k] + pas * Number(b.dataset.pas));
        modificat = true;
        container.querySelector(`.valoare-meniu[data-k="${k}"]`).textContent = `${meniu[k]}px`;
        trimiteMeniul();
        for (const s of container.querySelectorAll('.salveaza-margini')) s.disabled = false;
      };
    }
    for (const b of container.querySelectorAll('[data-bara]')) {
      b.onclick = () => {
        const k = b.dataset.bara;
        const min = RANDURI_BARE.find(([x]) => x === k)[2];
        bare[k] = Math.max(min, bare[k] + Number(b.dataset.pas));
        modificat = true;
        container.querySelector(`.valoare-bara[data-k="${k}"]`).textContent = `${bare[k]}px`;
        const ex = container.querySelector('.exemplu-bara');
        ex.style.cssText = stilExempluBara(ex.dataset.url, Number(margini.bara_rama ?? ex.dataset.m));
        for (const s of container.querySelectorAll('.salveaza-margini')) s.disabled = false;
      };
    }
    const salveaza = async () => {
      await api('aranjare/ui', { method: 'PUT', body: JSON.stringify({ margini, bare, meniu }), headers: { 'Content-Type': 'application/json' } });
      comun.date.aranjare.ui = { margini: { ...margini }, bare: { ...bare }, meniu: { ...meniu } };
      modificat = false;
      arata();
      dupaSalvare();
    };
    for (const b of container.querySelectorAll('.salveaza-margini')) b.onclick = salveaza;
  }

  return { arata };
}
