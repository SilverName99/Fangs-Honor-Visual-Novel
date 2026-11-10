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
// Un sunet e trecut ca lipsă (liniște de atunci) doar dacă fișierul chiar nu există: o eroare de o clipă la
// încărcare (o cerere întreruptă, rețeaua) nu trebuie să-l amuțească pentru tot restul jocului, cum se întâmpla
// cu lovitura șobolanilor, auzită doar prima dată
function verificaLipsa(cale, url) {
  fetch(url, { method: 'HEAD' })
    .then((r) => !r.ok && lipsa.add(cale))
    .catch(() => location.protocol === 'file:' && lipsa.add(cale));
}

// Browserele nu lasă pagina să pornească sunetul înainte de primul clic al jucătorului: până atunci,
// ce trebuia să sune se ține minte și pornește la primul clic sau la prima tastă
let deblocat = false;
const laDeblocare = [];
function deblocheaza() {
  if (deblocat) return;
  deblocat = true;
  if (ctxAudio?.state === 'suspended') ctxAudio.resume();
  for (const f of laDeblocare.splice(0)) f();
}

// Sunetul „înfundat” (decis de autor: satul auzit din casă, taverna auzită de afară): același fișier,
// trecut printr-un filtru care taie sunetele înalte, ca prin pereți. Filtrul se pune doar unde trebuie
// și, odată pus, doar se deschide sau se închide lin, fără să repornească sunetul
let ctxAudio = null;
const FRECVENTA = { putin: 1600, mult: 550 };
function filtru(audio) {
  if (audio.filtru) return audio.filtru;
  try {
    ctxAudio ||= new AudioContext();
    if (deblocat && ctxAudio.state === 'suspended') ctxAudio.resume();
    const f = ctxAudio.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 20000;
    ctxAudio.createMediaElementSource(audio).connect(f).connect(ctxAudio.destination);
    audio.filtru = f;
  } catch {
    audio.filtru = null;
  }
  return audio.filtru;
}
function infunda(audio, cat) {
  if (!cat && !audio.filtru) return;
  const f = filtru(audio);
  if (f) f.frequency.setTargetAtTime(FRECVENTA[cat] || 20000, ctxAudio.currentTime, 0.25);
}
addEventListener('pointerdown', deblocheaza, { capture: true });
addEventListener('keydown', deblocheaza, { capture: true });

// Previzualizarea meniului din editor (Interfață) e jocul într-un cadru: acolo nu se aude nimic,
// sunetul e doar în Testare și în joc
const previzualizare = new URLSearchParams(location.search).has('meniu');
const nivel = (tip) => (volume.mut || previzualizare ? 0 : volume.general * volume[tip]);
// Volumul fiecărui fișier, ales de autor în galerie (data/aranjare/volume_sunete.json, în procente)
let volumeFisiere = {};
const volumFisier = (cale) => (cale ? (volumeFisiere[cale] ?? 100) / 100 : 1);

function porneste(audio) {
  const p = audio.play();
  if (p) p.catch(() => !deblocat && laDeblocare.push(() => audio.play().catch(() => {})));
}

// Un fir de sunet care se repetă (ambianța sau muzica): la schimbare, cel vechi se stinge și cel nou crește lin
function fir(tip) {
  let curent = null; // { cale, audio, volum }
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
    // volum: cât de tare față de volumul ales în Opțiuni (zonele de afară aud harta cu 10% mai încet);
    // infundat: 'putin' sau 'mult' (vezi FRECVENTA)
    canta(cale, { repetat = true, volum = 1, infundat = false } = {}) {
      // Același sunet (de pe hartă într-o zonă, din tavernă afară): nu repornește, doar se potrivește lin
      if (curent && curent.cale === cale) {
        curent.volum = volum;
        infunda(curent.audio, infundat);
        const audio = curent.audio;
        const pas = Math.max(0.01, nivel(tip) / (TRECERE / 50));
        const t = setInterval(() => {
          if (curent?.audio !== audio) return clearInterval(t);
          const tinta = Math.min(1, nivel(tip) * curent.volum);
          audio.volume = audio.volume < tinta ? Math.min(tinta, audio.volume + pas) : Math.max(tinta, audio.volume - pas);
          if (Math.abs(audio.volume - tinta) < 0.001) clearInterval(t);
        }, 50);
        return;
      }
      if (curent) stinge(curent.audio);
      curent = null;
      if (!cale || lipsa.has(cale) || previzualizare) return;
      const audio = new Audio(urlImagine(cale));
      audio.loop = repetat;
      audio.volume = 0;
      audio.onerror = () => verificaLipsa(cale, audio.src);
      curent = { cale, audio, volum };
      infunda(audio, infundat);
      porneste(audio);
      const tinta = () => Math.min(1, nivel(tip) * (curent?.volum ?? 1));
      const pas = Math.max(0.01, tinta() / (TRECERE / 50));
      const t = setInterval(() => {
        if (curent?.audio !== audio) return clearInterval(t);
        audio.volume = Math.min(tinta(), audio.volume + pas);
        if (audio.volume >= tinta()) clearInterval(t);
      }, 50);
    },
    volum() {
      if (curent) curent.audio.volume = Math.min(1, nivel(tip) * curent.volum);
    },
    cale: () => curent?.cale || null,
  };
}

const ambianta = fir('ambianta');
// Al doilea strat de ambianță, care merge în același timp cu primul (taverna: vocile și muzica, încărcate separat)
const strat = fir('ambianta');
const muzica = fir('muzica');
let muzicaActiva = false; // cât merge muzica (lupta, meniul), ambianța tace
let ultimaAmbianta = null;
const canta = (a) => {
  ambianta.canta(a.cale, { ...a, volum: a.volum * volumFisier(a.cale) });
  strat.canta(a.strat, { volum: a.stratVolum * volumFisier(a.strat), infundat: a.stratInfundat });
};

export function creeazaSunet(date) {
  const s = date.sunete || {};
  volumeFisiere = date.aranjare?.volume_sunete || {};

  // Ambianța scenei: a ei, sau moștenită de la zona și harta de deasupra; prima variantă potrivită câștigă.
  // O variantă își poate da volumul și înfundarea ei; altfel le ia pe ale ambianței de bază
  // „lantDat”: scena, zona ei și harta ei, până la satul de sus (Marginea satului are harta ei, apoi satul)
  function ambiantaPentru(idScena, ctx, lantDat) {
    const lant = lantDat?.length ? [...lantDat] : [idScena];
    if (!lantDat?.length) {
      if (idScena.includes('.')) lant.push(idScena.split('.')[0]);
      if (idScena !== 'harta') lant.push('harta');
    }
    for (const id of lant) {
      const a = s.ambiante?.[id];
      if (!a) continue;
      const v = (a.variante || []).find((x) => verifica(x.conditii, ctx));
      const din = (cheie, implicit) => v?.[cheie] ?? a[cheie] ?? implicit;
      // „strat”: al doilea sunet, în același timp; o variantă fără „strat” îl oprește (taverna închisă: doar satul)
      const s2 = v ? v.strat : a.strat;
      return {
        cale: caleSunet('ambianta', v?.sunet || a.sunet),
        strat: s2 ? caleSunet('ambianta', s2) : null,
        volum: din('volum', 1),
        infundat: din('infundat', false),
        // Al doilea sunet are volumul și înfundarea lui (bucătăria: focul clar, satul înfundat)
        stratVolum: din('stratVolum', 1),
        stratInfundat: din('stratInfundat', false),
      };
    }
    return { cale: null, strat: null };
  }

  return {
    scena(idScena, ctx, lant) {
      ultimaAmbianta = ambiantaPentru(idScena, ctx, lant);
      if (!muzicaActiva) canta(ultimaAmbianta);
    },
    efect(id) {
      const cale = caleSunet('efecte', id);
      if (!s.efecte?.[id] || lipsa.has(cale) || !deblocat || nivel('efecte') <= 0) return;
      const a = new Audio(urlImagine(cale));
      a.volume = Math.min(1, nivel('efecte') * volumFisier(cale));
      a.onerror = () => verificaLipsa(cale, a.src);
      a.play().catch(() => {});
    },
    // Muzica înlocuiește ambianța cât timp merge (lupta, meniul); un jingle scurt (victorie) nu se repetă
    muzica(id, { repetat = true } = {}) {
      muzicaActiva = !!id;
      if (!id) {
        muzica.canta(null);
        if (ultimaAmbianta) canta(ultimaAmbianta);
        return;
      }
      ambianta.canta(null);
      strat.canta(null);
      const cale = caleSunet('muzica', id);
      muzica.canta(cale, { repetat, volum: volumFisier(cale) });
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
  strat.volum();
  muzica.volum();
}
