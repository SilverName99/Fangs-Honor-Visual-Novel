import { api } from './api.js';
import { ELEMENTE_UI, fisierUi } from '../src/uiGrafica.js';
import { urlImagine, uitaLipsurile } from '../src/imagini.js';

const esc = (t) => String(t).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const EXPLICATII = {
  '9-slice': 'Ramă care se întinde: colțurile rămân neschimbate, doar mijlocul se întinde. „Margine” = cât de lat e colțul, în pixeli; la 0, imaginea se întinde întreagă.',
  fundal: 'Se întinde pe tot elementul.',
  textura: 'Se repetă pe orizontală, deci capetele trebuie să se continue fără cusătură.',
  cursor: 'Vârful săgeții trebuie să fie în colțul din stânga-sus al imaginii.',
  imagine: 'Folosită ca atare (fundal transparent).',
};

const ALTE_MARIMI = [
  ['Harta, imaginile de zonă, scenele', '1920 × 1080 px'],
  ['Piesele de pe hartă (clădiri)', 'decupate pe contur, fundal transparent; cam cât vor ocupa pe harta de 1920 × 1080'],
  ['Portretele de dialog', '1024 × 1280 px (4:5), bust, fundal transparent'],
  ['Sprite-urile din scene', 'înalte de ~900-1000 px, decupate strâns pe contur, fundal transparent'],
  ['Pozele de luptă', '~600 × 1000 px, fundal transparent; aliații privesc spre dreapta, inamicii spre stânga'],
  ['Iconițele obiectelor', '128 × 128 px, fundal transparent'],
];

export function creeazaInterfata(container, comun, reincarcaImagini, dupaSalvare) {
  const margini = { ...(comun.date.aranjare.ui?.margini || {}) };
  let modificat = false;

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

  function arata() {
    container.innerHTML = `
      <h2>Grafica interfeței</h2>
      <p class="sumar">Până încarci un element, jocul folosește stilul simplu de acum. Dimensiunile sunt recomandate, nu obligatorii. Doar PNG.</p>
      <div class="salvare"><button class="btn principal salveaza-margini" ${modificat ? '' : 'disabled'}>Salvează marginile</button></div>
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
              ? `<label class="rand">Margine: <input type="range" min="0" max="200" value="${m}" class="margine"> <span>${m}px</span></label>
                 <div class="exemplu-9" style="border-width:${m}px;border-image:url('${url}') ${m} fill / ${m}px stretch">Exemplu întins</div>`
              : ''
          }
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
          r.nextElementSibling.textContent = `${r.value}px`;
          const ex = card.querySelector('.exemplu-9');
          ex.style.borderWidth = `${r.value}px`;
          ex.style.borderImageSlice = `${r.value} fill`;
          ex.style.borderImageWidth = `${r.value}px`;
          container.querySelector('.salveaza-margini').disabled = false;
        };
      }
    }
    container.querySelector('.salveaza-margini').onclick = async () => {
      await api('aranjare/ui', { method: 'PUT', body: JSON.stringify({ margini }), headers: { 'Content-Type': 'application/json' } });
      comun.date.aranjare.ui = { margini: { ...margini } };
      modificat = false;
      arata();
      dupaSalvare();
    };
  }

  return { arata };
}
