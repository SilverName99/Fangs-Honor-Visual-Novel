// Detectează dacă mouse-ul e pe un pixel vizibil al unei imagini cu fundal transparent.
// Așa piesele și personajele răspund exact pe forma lor, fără zone desenate de mână.
const masti = new Map();
const PRAG_ALFA = 40;
const LATIME_MASCA = 256;

function masca(img) {
  let m = masti.get(img.src);
  if (m !== undefined) return m;
  try {
    // O copie micșorată ajunge pentru precizia unui click și ține memoria mică
    const w = Math.min(LATIME_MASCA, img.naturalWidth);
    const h = Math.max(1, Math.round((img.naturalHeight * w) / img.naturalWidth));
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0, w, h);
    m = { w, h, alfa: g.getImageData(0, 0, w, h).data };
  } catch {
    // Unele medii (de exemplu file:// în .exe) nu dau voie la citirea pixelilor; atunci contează dreptunghiul
    m = null;
  }
  masti.set(img.src, m);
  return m;
}

export function atinge(el, ev) {
  const r = el.getBoundingClientRect();
  if (ev.clientX < r.left || ev.clientX >= r.right || ev.clientY < r.top || ev.clientY >= r.bottom) return false;
  const img = el.querySelector('img');
  // Placeholder (imagine lipsă): tot dreptunghiul e clicabil
  if (!img || !img.complete || !img.naturalWidth) return true;
  const m = masca(img);
  if (!m) return true;
  const x = Math.min(m.w - 1, Math.floor(((ev.clientX - r.left) / r.width) * m.w));
  const y = Math.min(m.h - 1, Math.floor(((ev.clientY - r.top) / r.height) * m.h));
  return m.alfa[(y * m.w + x) * 4 + 3] > PRAG_ALFA;
}

// Dintre elementele suprapuse, câștigă cel desenat deasupra (cel mai mare z-index)
export function elementLaPunct(elemente, ev) {
  return [...elemente]
    .sort((a, b) => Number(b.style.zIndex || 0) - Number(a.style.zIndex || 0))
    .find((el) => atinge(el, ev));
}
