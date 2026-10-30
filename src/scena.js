import { elementImagine } from './imagini.js';
import { candidati } from './lume.js';

export const LATIME = 1920;
export const INALTIME = 1080;

// Scena e mereu 1920×1080 și doar se scalează; toate pozițiile din date rămân valabile la orice ecran
export function creeazaEcran(parinte) {
  const ecran = document.createElement('div');
  ecran.className = 'ecran';
  const scena = document.createElement('div');
  scena.className = 'scena';
  const lume = document.createElement('div');
  lume.className = 'strat-lume';
  scena.append(lume);
  ecran.append(scena);
  parinte.append(ecran);

  const ajusteaza = () => {
    const r = ecran.getBoundingClientRect();
    const s = Math.min(r.width / LATIME, r.height / INALTIME) || 1;
    scena.style.transform = `translate(-50%, -50%) scale(${s})`;
  };
  new ResizeObserver(ajusteaza).observe(ecran);
  ajusteaza();
  return { ecran, scena, lume };
}

export function pozitieImplicita(index, tip) {
  // Până le aranjează autorul, obiectele stau într-un rând vizibil, ca să poată fi găsite și trase
  if (tip === 'sprite') return { x: 0.25 + (index % 4) * 0.17, y: 0.95, scara: 0.7 };
  return { x: 0.1 + (index % 6) * 0.16, y: 0.4 + Math.floor(index / 6) * 0.35, scara: 0.2 };
}

export function pozitie(aranjare, obiect, index) {
  return aranjare?.obiecte?.[obiect.id] || pozitieImplicita(index, obiect.tip);
}

export function aplicaPozitie(el, p) {
  el.style.left = `${p.x * 100}%`;
  el.style.top = `${p.y * 100}%`;
  el.style.height = `${p.scara * 100}%`;
  // Ce e mai jos pe ecran e mai aproape de privitor, deci stă în față
  el.style.zIndex = String(Math.round(p.y * 1000));
}

export function puncteSvg(poligon) {
  return poligon.map(([x, y]) => `${x * LATIME},${y * INALTIME}`).join(' ');
}

export function randeaza(strat, descriere, aranjare, context) {
  strat.replaceChildren();
  const fundal = elementImagine(candidati(descriere.imagine, descriere.variante, context), { clasa: 'fundal', fundal: true });
  strat.append(fundal);

  const obiecte = new Map();
  descriere.obiecte.forEach((o, i) => {
    const el = elementImagine(candidati(o.imagine, o.variante, context), {
      clasa: `obiect ${o.tip}`,
      raport: o.tip === 'sprite' ? 0.45 : 1.2,
    });
    el.dataset.id = o.id;
    aplicaPozitie(el, pozitie(aranjare, o, i));
    strat.append(el);
    obiecte.set(o.id, el);
  });

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'zone');
  svg.setAttribute('viewBox', `0 0 ${LATIME} ${INALTIME}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  const poligoane = new Map();
  for (const t of descriere.tinte) {
    const poligon = aranjare?.zone?.[t.id];
    if (!poligon || poligon.length < 3) continue;
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    p.setAttribute('points', puncteSvg(poligon));
    p.setAttribute('class', 'zona-clic');
    svg.append(p);
    poligoane.set(t.id, p);
  }
  strat.append(svg);
  return { fundal, obiecte, poligoane, svg };
}

// Coordonate 0-1 față de scenă, indiferent de cât e scalată pe ecran
export function punctNormalizat(scena, ev) {
  const r = scena.getBoundingClientRect();
  return [(ev.clientX - r.left) / r.width, (ev.clientY - r.top) / r.height];
}
