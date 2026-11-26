import { urlImagine } from './imagini.js';

// Filmulețele din vise (decis de autor): se descarcă întregi înainte să pornească visul, ca să nu se oprească la
// jumătate ca să se mai încarce. Rămân în memorie (ca Blob) cât e jocul deschis, ca un vis văzut din nou să pornească
// pe loc. În .exe (file://) sunt pe disc, deci merg direct, fără descărcare
const descarcari = new Map(); // cale -> promisiunea descărcării
const gata = new Map(); // cale -> adresa de redat (blob:) sau null, dacă filmulețul lipsește
const primit = new Map(); // cale -> cât s-a descărcat, de la 0 la 1

export function preincarcaFilm(cale) {
  if (descarcari.has(cale)) return descarcari.get(cale);
  const p = (async () => {
    if (location.protocol === 'file:') return urlImagine(cale);
    try {
      const r = await fetch(urlImagine(cale));
      // Un filmuleț lipsă nu e o greșeală: visul merge cu imaginile lui
      if (!r.ok || !r.body) return null;
      const total = Number(r.headers.get('Content-Length')) || 0;
      const cititor = r.body.getReader();
      const bucati = [];
      let marime = 0;
      for (;;) {
        const { done, value } = await cititor.read();
        if (done) break;
        bucati.push(value);
        marime += value.length;
        if (total) primit.set(cale, Math.min(1, marime / total));
      }
      return URL.createObjectURL(new Blob(bucati, { type: 'video/mp4' }));
    } catch {
      // Rețeaua a căzut: visul merge cu imaginile, iar data viitoare se încearcă din nou
      descarcari.delete(cale);
      return null;
    }
  })().then((url) => {
    gata.set(cale, url);
    primit.set(cale, 1);
    return url;
  });
  descarcari.set(cale, p);
  return p;
}

// Adresa de pus în <video>: cea descărcată, dacă e gata; altfel cea de pe server (merge și așa, doar că se încarcă din mers)
export const urlFilm = (cale) => gata.get(cale) || urlImagine(cale);
// Descărcarea a găsit că fișierul nu există: replica își arată imaginea, fără să mai încerce filmulețul
export const filmLipsa = (cale) => gata.has(cale) && gata.get(cale) === null;
// Cât s-a descărcat din toate filmulețele cerute, de la 0 la 1 (pentru ecranul de așteptare)
export const progresFilme = (cai) => (cai.length ? cai.reduce((s, c) => s + (primit.get(c) || 0), 0) / cai.length : 1);
export const filmeleDialogului = (dialog) => [...new Set(Object.values(dialog?.noduri || {}).map((n) => n.video).filter(Boolean))];
// Descărcarea s-a încheiat (cu filmulețul sau fără el, dacă lipsește)
export const filmGata = (cale) => gata.has(cale);
// Filmulețele la care mai poate ajunge discuția de la o replică încolo („Drumul trezirii”: după un refresh pe drumul de
// întoarcere, visul a trecut, deci filmulețul lui nu se mai descarcă degeaba)
export function filmeleDeLa(dialog, deLa) {
  const noduri = dialog?.noduri || {};
  if (!deLa || !noduri[deLa]) return filmeleDialogului(dialog);
  const vazute = new Set();
  const filme = new Set();
  const coada = [deLa];
  while (coada.length) {
    const id = coada.shift();
    if (!id || vazute.has(id) || !noduri[id]) continue;
    vazute.add(id);
    const n = noduri[id];
    if (n.video) filme.add(n.video);
    coada.push(...[].concat(n.urmator).map((x) => x?.nod ?? x), n.faraVideo, ...(n.alegeri || []).map((a) => a.spre));
  }
  return [...filme];
}
