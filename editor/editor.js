import '../src/stil.css';
import './editor.css';
import { api } from './api.js';
import { normalizeaza } from '../src/date.js';
import { construiesteLumea } from '../src/lume.js';
import { creeazaGalerie } from './galerie.js';
import { creeazaAranjare } from './aranjare.js';
import { creeazaInterfata } from './interfata.js';

// Editorul citește datele de la server (nu din bundle), ca să vadă imediat ce s-a salvat
const brut = await api('date');
const date = normalizeaza(Object.entries(brut).flatMap(([k, v]) => (k === 'aranjare' ? Object.entries(v).map(([id, a]) => [`aranjare/${id}`, a]) : [[k, v]])));
const lume = construiesteLumea(date);
const comun = { date, lume, imagini: new Map() };

async function reincarcaImagini() {
  // cale -> data modificării; data intră în URL, ca o imagine înlocuită să se vadă imediat
  comun.imagini = new Map((await api('imagini')).map((i) => [i.cale, i.modificat]));
  return comun.imagini;
}
await reincarcaImagini();

const galerie = creeazaGalerie(document.getElementById('galerie'), comun, reincarcaImagini);
const aranjare = creeazaAranjare(document.getElementById('aranjare'), comun, verificaSincronizarea);
const interfata = creeazaInterfata(document.getElementById('interfata'), comun, reincarcaImagini, verificaSincronizarea);

for (const b of document.querySelectorAll('.taburi button')) {
  b.onclick = () => {
    document.querySelectorAll('.taburi button').forEach((x) => x.classList.toggle('activ', x === b));
    document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('activ', t.id === b.dataset.tab));
    if (b.dataset.tab === 'aranjare') return aranjare.arata();
    aranjare.ascunde();
    if (b.dataset.tab === 'galerie') galerie.arata();
    if (b.dataset.tab === 'interfata') interfata.arata();
    // Jocul de test se încarcă abia când e deschis tab-ul, ca să pornească mereu de la ultima variantă
    if (b.dataset.tab === 'testare') incarcaTestul();
  };
}

const cadru = document.getElementById('cadru-test');
function incarcaTestul() {
  cadru.src = `index.html?debug=1&test=1&t=${Date.now()}`;
}
document.getElementById('reincarca-test').onclick = incarcaTestul;

// ----- starea sincronizării (build + GitHub) -----
const elStare = document.getElementById('stare-sincronizare');
let ultimaEroare = '';
let temporizator;
async function verificaSincronizarea() {
  clearTimeout(temporizator);
  try {
    const { sincronizare: s } = await api('stare');
    elStare.className = `stare ${s.stare}`;
    ultimaEroare = s.stare === 'eroare' ? s.mesaj : '';
    elStare.textContent = s.stare === 'eroare' ? 'Eroare la salvare (click pentru detalii)' : s.mesaj;
    if (s.stare === 'in_curs') temporizator = setTimeout(verificaSincronizarea, 1500);
  } catch {
    elStare.className = 'stare eroare';
    elStare.textContent = 'Serverul nu răspunde.';
  }
}
elStare.onclick = () => ultimaEroare && alert(ultimaEroare);
verificaSincronizarea();

document.getElementById('actualizeaza').onclick = async (e) => {
  const b = e.currentTarget;
  b.disabled = true;
  b.textContent = 'Se actualizează...';
  try {
    const r = await api('actualizeaza', { method: 'POST' });
    alert(`Jocul a fost actualizat.\n\n${r.jurnal}`);
    location.reload();
  } catch (err) {
    alert(`Actualizarea a eșuat:\n\n${err.message}`);
  } finally {
    b.disabled = false;
    b.textContent = 'Actualizează jocul';
  }
};

addEventListener('beforeunload', (e) => {
  if (aranjare.areModificari()) e.preventDefault();
});

galerie.arata();
