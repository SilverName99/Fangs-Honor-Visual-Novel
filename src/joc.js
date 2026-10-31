import './stil.css';
import { dateBundle as date } from './date.js';
import { construiesteLumea, candidati } from './lume.js';
import { creeazaEcran, randeaza } from './scena.js';
import { verifica } from './conditii.js';
import { inMinute, momentZi, MINUTE_ZI } from './timp.js';
import { preincarca } from './imagini.js';
import { elementLaPunct } from './lovire.js';

const lume = construiesteLumea(date);
const { scena, lume: stratLume } = creeazaEcran(document.getElementById('joc'));

const ui = document.createElement('div');
ui.className = 'ui';
scena.append(ui);

// Starea completă (ceas, nevoi, salvare) vine în Etapa B; aici e doar cât trebuie pentru navigare și condiții
const start = date.config.start;
const stare = {
  scena: start.scena,
  minute: (start.zi - 1) * MINUTE_ZI + inMinute(start.ora),
  stari: {},
  obiecte: [],
  misiuni: {},
  relatii: {},
};

// Editorul deschide jocul direct într-o scenă, ca autorul să-și testeze aranjarea
const scenaCeruta = new URLSearchParams(location.search).get('scena');
if (scenaCeruta && lume.has(scenaCeruta)) stare.scena = scenaCeruta;

function context() {
  const minuteZi = stare.minute % MINUTE_ZI;
  return { ...stare, minuteZi, moment: momentZi(minuteZi), loc: stare.scena.replace('.', '/') };
}

let temporizatorMesaj;
function mesaj(text) {
  let el = ui.querySelector('.mesaj');
  if (!el) {
    el = document.createElement('div');
    el.className = 'mesaj';
    ui.append(el);
  }
  el.textContent = text;
  el.classList.add('vizibil');
  clearTimeout(temporizatorMesaj);
  temporizatorMesaj = setTimeout(() => el.classList.remove('vizibil'), 2500);
}

function mergi(id) {
  stare.scena = id;
  afiseaza();
}

function activeaza(tinta, ctx) {
  if (tinta.incuiat && !verifica(tinta.incuiat.conditii, ctx)) return mesaj(tinta.incuiat.mesaj || 'E încuiat.');
  if (tinta.actiune) return mesaj(`${tinta.nume}: munca vine în v0.2.`);
  mergi(tinta.spre);
}

function legaEvidentiere(declansator, elemente, clasa = 'evidentiat') {
  declansator.addEventListener('mouseenter', () => elemente.forEach((e) => e.classList.add(clasa)));
  declansator.addEventListener('mouseleave', () => elemente.forEach((e) => e.classList.remove(clasa)));
}

// Piesele și personajele se verifică pe pixel (transparența PNG-ului), nu pe dreptunghi:
// așa două clădiri apropiate nu se fură una pe alta la click
let interactive = [];
let subMouse = null;

function seteazaSubMouse(element) {
  if (subMouse === element) return;
  if (subMouse) subMouse.grup.forEach((e) => e.classList.remove('evidentiat'));
  subMouse = element;
  if (subMouse) subMouse.grup.forEach((e) => e.classList.add('evidentiat'));
  stratLume.classList.toggle('clicabil', !!subMouse);
}

function interactivLa(ev) {
  if (ev.target.closest?.('.zona-clic')) return null;
  const el = elementLaPunct(interactive.map((i) => i.el), ev);
  return interactive.find((i) => i.el === el) || null;
}

stratLume.addEventListener('pointermove', (ev) => seteazaSubMouse(interactivLa(ev)));
stratLume.addEventListener('pointerleave', () => seteazaSubMouse(null));
stratLume.addEventListener('click', (ev) => interactivLa(ev)?.clic());

function afiseaza() {
  const d = lume.get(stare.scena);
  const ctx = context();
  const r = randeaza(stratLume, d, date.aranjare[d.id], ctx);
  const faraZona = [];
  interactive = [];
  subMouse = null;
  stratLume.classList.remove('clicabil');

  for (const t of d.tinte) {
    if (t.ascuns && !verifica(t.ascuns.conditii, ctx)) continue;
    const poligon = r.poligoane.get(t.id);
    const piese = d.obiecte.filter((o) => o.tinta === t.id).map((o) => r.obiecte.get(o.id));
    const clic = () => activeaza(t, ctx);

    if (poligon) {
      // O zonă desenată de mână are prioritate; cu piesă, se luminează clădirea, fără piesă chiar zona
      if (piese.length) legaEvidentiere(poligon, piese);
      else legaEvidentiere(poligon, [poligon], 'evidentiat-poligon');
      poligon.addEventListener('click', clic);
    } else if (piese.length) {
      for (const p of piese) interactive.push({ el: p, grup: piese, clic });
    } else {
      faraZona.push({ t, clic });
    }
  }

  for (const o of d.obiecte.filter((o) => o.tip === 'sprite')) {
    const el = r.obiecte.get(o.id);
    interactive.push({ el, grup: [el], clic: () => mesaj(`${o.nume}: dialogurile vin în Etapa B.`) });
  }

  ui.replaceChildren();
  if (d.parinte) {
    const b = document.createElement('button');
    b.className = 'buton inapoi';
    b.textContent = '← Înapoi';
    b.onclick = () => mergi(d.parinte);
    ui.append(b);
  }
  const titlu = document.createElement('div');
  titlu.className = 'titlu-scena';
  titlu.textContent = d.titlu;
  ui.append(titlu);

  // Locurile fără zonă desenată primesc butoane, altfel ar fi de neatins până le desenează autorul
  if (faraZona.length) {
    const nav = document.createElement('div');
    nav.className = 'navigare-rezerva';
    const et = document.createElement('div');
    et.className = 'eticheta';
    et.textContent = 'Fără zonă desenată încă:';
    nav.append(et);
    for (const { t, clic } of faraZona) {
      const b = document.createElement('button');
      b.className = 'buton';
      b.textContent = t.nume;
      b.onclick = clic;
      nav.append(b);
    }
    ui.append(nav);
  }

  // Vecinii se preîncarcă în fundal, ca trecerea la ei să fie instantanee
  const vecini = [d.parinte, ...d.tinte.map((t) => t.spre)].filter(Boolean).map((id) => lume.get(id));
  for (const v of vecini) preincarca(candidati(v.imagine, v.variante, ctx)[0]);
}

addEventListener('keydown', (e) => {
  const d = lume.get(stare.scena);
  if (e.key === 'Escape' && d.parinte) mergi(d.parinte);
});

afiseaza();
