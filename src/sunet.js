// Sunetul jocului: ambianța fiecărei scene, efectele scurte și muzica (data/sunete.json, fișierele în assets/sunete/).
// Un sunet lipsă e doar liniște. Volumele sunt o preferință a jucătorului, ca viteza, deci stau în browser, nu în salvare.
import { urlImagine } from './imagini.js';
import { verifica } from './conditii.js';

const CHEIE = 'fangs-vn-sunet';
const IMPLICIT = { general: 0.8, ambianta: 0.6, efecte: 0.8, muzica: 0.5, mut: false };
const TRECERE = 1200; // ms, cât durează trecerea lină de la o ambianță la alta

let volume = { ...IMPLICIT };
try {
  volume = { ...IMPLICIT, ...JSON.parse(localStorage.getItem(CHEIE) || '{}') };
} catch {
  // fără localStorage, se folosesc volumele implicite
}

export const caleSunet = (tip, id) => `sunete/${tip}/${id}.mp3`;
const lipsa = new Set();

// Browserele nu lasă pagina să pornească sunetul înainte de primul clic al jucătorului: până atunci,
// ce trebuia să sune se ține minte și pornește la primul clic sau la prima tastă
let deblocat = false;
const laDeblocare = [];
function deblocheaza() {
  if (deblocat) return;
  deblocat = true;
  for (const f of laDeblocare.splice(0)) f();
}
addEventListener('pointerdown', deblocheaza, { capture: true });
addEventListener('keydown', deblocheaza, { capture: true });

const nivel = (tip) => (volume.mut ? 0 : volume.general * volume[tip]);

function porneste(audio) {
  const p = audio.play();
  if (p) p.catch(() => !deblocat && laDeblocare.push(() => audio.play().catch(() => {})));
}

// Un fir de sunet care se repetă (ambianța sau muzica): la schimbare, cel vechi se stinge și cel nou crește lin
function fir(tip) {
  let curent = null; // { cale, audio }
  const stinge = (audio) => {
    const pas = audio.volume / (TRECERE / 50);
    const t = setInterval(() => {
      audio.volume = Math.max(0, audio.volume - pas);
      if (audio.volume <= 0) {
        clearInterval(t);
        audio.pause();
      }
    }, 50);
  };
  return {
    canta(cale, { repetat = true } = {}) {
      if (curent?.cale === cale) return;
      if (curent) stinge(curent.audio);
      curent = null;
      if (!cale || lipsa.has(cale)) return;
      const audio = new Audio(urlImagine(cale));
      audio.loop = repetat;
      audio.volume = 0;
      audio.onerror = () => lipsa.add(cale);
      curent = { cale, audio };
      porneste(audio);
      const tinta = () => nivel(tip);
      const pas = Math.max(0.01, tinta() / (TRECERE / 50));
      const t = setInterval(() => {
        if (curent?.audio !== audio) return clearInterval(t);
        audio.volume = Math.min(tinta(), audio.volume + pas);
        if (audio.volume >= tinta()) clearInterval(t);
      }, 50);
    },
    volum() {
      if (curent) curent.audio.volume = nivel(tip);
    },
    cale: () => curent?.cale || null,
  };
}

const ambianta = fir('ambianta');
const muzica = fir('muzica');
let muzicaActiva = false; // cât merge muzica (lupta, meniul), ambianța tace
let ultimaAmbianta = null;

export function creeazaSunet(date) {
  const s = date.sunete || {};

  // Ambianța scenei: a ei, sau moștenită de la zona și harta de deasupra; prima variantă potrivită câștigă
  function ambiantaPentru(idScena, ctx) {
    const lant = [idScena];
    if (idScena.includes('.')) lant.push(idScena.split('.')[0]);
    if (idScena !== 'harta') lant.push('harta');
    for (const id of lant) {
      const a = s.ambiante?.[id];
      if (!a) continue;
      const v = (a.variante || []).find((x) => verifica(x.conditii, ctx));
      return caleSunet('ambianta', v?.sunet || a.sunet);
    }
    return null;
  }

  return {
    scena(idScena, ctx) {
      ultimaAmbianta = ambiantaPentru(idScena, ctx);
      if (!muzicaActiva) ambianta.canta(ultimaAmbianta);
    },
    efect(id) {
      const cale = caleSunet('efecte', id);
      if (!s.efecte?.[id] || lipsa.has(cale) || !deblocat || nivel('efecte') <= 0) return;
      const a = new Audio(urlImagine(cale));
      a.volume = nivel('efecte');
      a.onerror = () => lipsa.add(cale);
      a.play().catch(() => {});
    },
    // Muzica înlocuiește ambianța cât timp merge (lupta, meniul); un jingle scurt (victorie) nu se repetă
    muzica(id, { repetat = true } = {}) {
      muzicaActiva = !!id;
      if (!id) {
        muzica.canta(null);
        ambianta.canta(ultimaAmbianta);
        return;
      }
      ambianta.canta(null);
      muzica.canta(caleSunet('muzica', id), { repetat });
    },
  };
}

// Volumele din Opțiuni
export const volumeSunet = () => ({ ...volume });
export function seteazaVolum(cheie, valoare) {
  volume[cheie] = valoare;
  try {
    localStorage.setItem(CHEIE, JSON.stringify(volume));
  } catch {
    // fără localStorage, volumul ține până se închide jocul
  }
  ambianta.volum();
  muzica.volum();
}
