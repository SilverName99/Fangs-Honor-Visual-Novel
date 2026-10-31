// Zona automată a unui personaj fără zonă desenată: conturul sprite-ului, transformat într-un poligon.
// Așa strălucirea și click-ul folosesc exact același mecanism ca zonele desenate de autor.
const cache = new Map();
const LATIME = 96;
const PRAG_ALFA = 40;

// Directii în sensul acelor de ceas (y crește în jos): E, SE, S, SV, V, NV, N, NE
const D = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];

function masca(img) {
  const w = Math.min(LATIME, img.naturalWidth);
  const h = Math.max(1, Math.round((img.naturalHeight * w) / img.naturalWidth));
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0, w, h);
  const alfa = g.getImageData(0, 0, w, h).data;
  const plin = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) plin[i] = alfa[i * 4 + 3] > PRAG_ALFA ? 1 : 0;
  return { w, h, plin };
}

// Doar bucata cea mai mare contează (firele de praf rămase de la decupaj nu primesc contur)
function ceaMaiMareBucata({ w, h, plin }) {
  const eticheta = new Int32Array(w * h).fill(-1);
  let cea = { id: -1, n: 0, start: -1 };
  let id = 0;
  for (let i = 0; i < w * h; i++) {
    if (!plin[i] || eticheta[i] >= 0) continue;
    let n = 0;
    const coada = [i];
    eticheta[i] = id;
    while (coada.length) {
      const k = coada.pop();
      n++;
      const x = k % w;
      const y = (k - x) / w;
      for (const [dx, dy] of D) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const j = ny * w + nx;
        if (plin[j] && eticheta[j] < 0) {
          eticheta[j] = id;
          coada.push(j);
        }
      }
    }
    if (n > cea.n) cea = { id, n, start: i };
    id++;
  }
  return { eticheta, ...cea };
}

// Urmărirea conturului exterior (Moore): pornește din primul pixel al bucății și merge pe margine
function urmareste(w, h, eticheta, id, start) {
  const plin = (x, y) => x >= 0 && y >= 0 && x < w && y < h && eticheta[y * w + x] === id;
  const sx = start % w;
  const sy = (start - sx) / w;
  let x = sx;
  let y = sy;
  let inapoi = 4; // am „intrat” din vest
  const puncte = [[x, y]];
  for (let pas = 0; pas < w * h * 4; pas++) {
    let gasit = false;
    for (let k = 1; k <= 8; k++) {
      const d = (inapoi + k) % 8;
      const nx = x + D[d][0];
      const ny = y + D[d][1];
      if (!plin(nx, ny)) continue;
      const p = (inapoi + k - 1) % 8;
      const bx = x + D[p][0] - nx;
      const by = y + D[p][1] - ny;
      x = nx;
      y = ny;
      inapoi = D.findIndex(([dx, dy]) => dx === bx && dy === by);
      if (inapoi < 0) inapoi = 4;
      gasit = true;
      break;
    }
    if (!gasit || (x === sx && y === sy)) break;
    puncte.push([x, y]);
  }
  return puncte;
}

// Ramer–Douglas–Peucker: păstrează forma, dar cu mult mai puține colțuri
function simplifica(p, eps) {
  if (p.length < 3) return p;
  const [ax, ay] = p[0];
  const [bx, by] = p[p.length - 1];
  const lung = Math.hypot(bx - ax, by - ay) || 1;
  let max = 0;
  let idx = 0;
  for (let i = 1; i < p.length - 1; i++) {
    const d = Math.abs((by - ay) * p[i][0] - (bx - ax) * p[i][1] + bx * ay - by * ax) / lung;
    if (d > max) {
      max = d;
      idx = i;
    }
  }
  if (max <= eps) return [p[0], p[p.length - 1]];
  return [...simplifica(p.slice(0, idx + 1), eps).slice(0, -1), ...simplifica(p.slice(idx), eps)];
}

// Întoarce conturul ca puncte 0-1 față de imagine; fără imagine (sau dacă pixelii nu pot fi citiți), dreptunghiul ei
export function conturImagine(img) {
  const dreptunghi = [[0, 0], [1, 0], [1, 1], [0, 1]];
  if (!img?.naturalWidth) return dreptunghi;
  if (cache.has(img.src)) return cache.get(img.src);
  let rezultat = dreptunghi;
  try {
    const m = masca(img);
    const b = ceaMaiMareBucata(m);
    if (b.id >= 0) {
      const brut = urmareste(m.w, m.h, b.eticheta, b.id, b.start);
      // Un contur închis are capetele în același punct, deci se împarte în două la punctul cel mai depărtat de start
      let departe = 0;
      brut.forEach(([x, y], i) => {
        if (Math.hypot(x - brut[0][0], y - brut[0][1]) > Math.hypot(brut[departe][0] - brut[0][0], brut[departe][1] - brut[0][1])) departe = i;
      });
      const simplu = [...simplifica(brut.slice(0, departe + 1), 0.8).slice(0, -1), ...simplifica([...brut.slice(departe), brut[0]], 0.8).slice(0, -1)];
      if (simplu.length >= 3) rezultat = simplu.map(([x, y]) => [(x + 0.5) / m.w, (y + 0.5) / m.h]);
    }
  } catch {
    // file:// în .exe poate bloca citirea pixelilor; rămâne dreptunghiul
  }
  cache.set(img.src, rezultat);
  return rezultat;
}
