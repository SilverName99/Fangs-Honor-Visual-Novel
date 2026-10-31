import './stil.css';
import { dateBundle as date } from './date.js';
import { construiesteLumea, candidati } from './lume.js';
import { creeazaEcran, randeaza } from './scena.js';
import { verifica } from './conditii.js';
import { preincarca } from './imagini.js';
import { elementLaPunct } from './lovire.js';
import { stareNoua, context, avanseaza as avanseazaStare, costTimp, ziua, formatOra } from './stare.js';
import { aplicaEfecte } from './efecte.js';
import { alegeEveniment, noteazaEveniment, caDialog } from './evenimente.js';
import * as salvare from './salvare.js';
import { creeazaDialog } from './dialog.js';
import { creeazaDebug } from './debug.js';

const parametri = new URLSearchParams(location.search);
const CHEIE = salvare.cheieSalvare(parametri.has('test'));
const cfg = date.config;
const lume = construiesteLumea(date);
const personaje = new Map(date.npcs.personaje.map((p) => [p.id, p]));
const evenimente = date.events?.evenimente || [];
const dialoguri = date.dialoguri || {};
const MOMENTE = { dimineata: 'Dimineața', amiaza: 'Amiaza', seara: 'Seara', noaptea: 'Noaptea' };
const NEVOI = [
  ['viata', 'Viață'],
  ['stamina', 'Stamina'],
  ['foame', 'Foame'],
  ['sete', 'Sete'],
];

const div = (clasa, text) => Object.assign(document.createElement('div'), { className: clasa, textContent: text ?? '' });
function buton(text, clasa, clic) {
  const b = document.createElement('button');
  b.className = `buton ${clasa}`;
  b.textContent = text;
  b.onclick = clic;
  return b;
}

const { scena, lume: stratLume } = creeazaEcran(document.getElementById('joc'));
const ui = div('ui');
scena.append(ui);
const colt = div('colt-stanga');
const titlu = div('titlu-scena');
const hud = div('hud');
const navigare = div('navigare-rezerva');
ui.append(colt, titlu, hud, navigare);

let stare = salvare.citeste(CHEIE) || stareNoua(cfg);
if (!lume.has(stare.scena)) stare.scena = cfg.start.scena;
// Editorul deschide jocul direct într-o scenă, ca autorul să-și testeze aranjarea
const scenaCeruta = parametri.get('scena');
if (scenaCeruta && lume.has(scenaCeruta)) stare.scena = scenaCeruta;

// ---------- interfața de bază ----------

let temporizatorMesaj;
function mesaj(text) {
  let el = ui.querySelector('.mesaj');
  if (!el) {
    el = div('mesaj');
    ui.append(el);
  }
  el.textContent = text;
  el.classList.add('vizibil');
  clearTimeout(temporizatorMesaj);
  temporizatorMesaj = setTimeout(() => el.classList.remove('vizibil'), 2500);
}

function anunt(text) {
  const fundal = div('acoperitor');
  const panou = div('panou-anunt');
  panou.append(div('text-anunt', text), buton('Continuă', '', () => fundal.remove()));
  fundal.append(panou);
  ui.append(fundal);
}

function actualizeazaHud() {
  const ctx = context(stare);
  hud.replaceChildren(
    div('ceas', `Ziua ${ziua(stare)} · ${formatOra(stare)} · ${MOMENTE[ctx.moment]}`),
    ...NEVOI.map(([cheie, eticheta]) => {
      const v = Math.round(stare.nevoi[cheie]);
      const rand = div(`bara-nevoie ${cheie} ${v < cfg.nevoi.prag ? 'scazut' : ''}`);
      const umplere = div('umplere');
      umplere.style.width = `${v}%`;
      const cale = div('cale');
      cale.append(umplere);
      rand.append(div('eticheta', eticheta), cale, div('valoare', String(v)));
      return rand;
    }),
    div('monede', `Monede: ${stare.bani}`),
  );
}

// ---------- timp, nevoi, leșin ----------

function salveaza() {
  salvare.scrie(CHEIE, stare);
}

function avanseaza(minute) {
  const r = avanseazaStare(stare, minute, cfg.nevoi);
  if (r.lesin) lesin();
  actualizeazaHud();
}

function lesin() {
  // Pedeapsă moale: nu e game over, doar timp pierdut (și eventual bani, din config)
  const l = cfg.lesin;
  dialog.inchide();
  stare.minute += l.orePierdute * 60;
  stare.nevoi.viata = l.viataDupa;
  stare.nevoi.foame = Math.max(stare.nevoi.foame, l.foameDupa);
  stare.nevoi.sete = Math.max(stare.nevoi.sete, l.seteDupa);
  stare.bani -= Math.floor((stare.bani * (l.pierdereBaniProcent || 0)) / 100);
  stare.scena = l.scena;
  salveaza();
  afiseaza();
  anunt(l.text);
}

// ---------- navigare și evenimente ----------

function mergi(id, { faraTimp = false } = {}) {
  const de = lume.get(stare.scena);
  const spre = lume.get(id);
  stare.scena = id;
  // Doar coborârea (spre o zonă sau un loc) costă timp; „Înapoi” e gratuit
  if (!faraTimp && spre.parinte === de.id) {
    const r = avanseazaStare(stare, costTimp(stare, spre.tip === 'zona' ? cfg.timp.spreZona : cfg.timp.spreLoc, cfg.nevoi), cfg.nevoi);
    if (r.lesin) return lesin();
  }
  salveaza();
  afiseaza();
  if (!faraTimp) verificaEvenimente();
}

function verificaEvenimente() {
  const ctx = context(stare);
  const ev = alegeEveniment(evenimente, stare, ctx);
  if (ev) pornesteEveniment(ev.id);
}

function pornesteEveniment(id) {
  const ev = evenimente.find((e) => e.id === id);
  if (!ev || dialog.activ()) return;
  noteazaEveniment(stare, ev, ziua(stare));
  dialog.porneste(caDialog(ev));
}

function activeaza(tinta, ctx) {
  if (tinta.incuiat && !verifica(tinta.incuiat.conditii, ctx)) return mesaj(tinta.incuiat.mesaj || 'E încuiat.');
  if (tinta.actiune) return mesaj(`${tinta.nume}: munca vine în v0.2.`);
  mergi(tinta.spre);
}

function vorbesteCu(id) {
  const p = personaje.get(id);
  const d = dialoguri[p?.dialog];
  dialog.porneste(
    d || {
      partener: id,
      start: 'a',
      noduri: { a: { vorbitor: id, emotie: 'normal', text: `(TODO) ${p?.nume || id} nu are încă un dialog.` } },
    },
  );
}

// ---------- dialog ----------

const joc = {
  get stare() {
    return stare;
  },
  date,
  lume,
  evenimente,
  avanseaza,
  mesaj,
  mergi,
  pornesteEveniment,
  // Schimbări din panoul debug: unele cer redesenarea scenei (ora, stări), altele doar HUD-ul
  dupaSchimbare(reafiseaza) {
    salveaza();
    if (reafiseaza) afiseaza();
    else actualizeazaHud();
  },
  jocNou() {
    stare = stareNoua(cfg);
    dialog.inchide();
    salveaza();
    afiseaza();
  },
};

const dialog = creeazaDialog(ui, {
  numeVorbitor: (id, d) => (id === 'vale' ? 'Vale' : id === d.partener && d.numePartener ? d.numePartener : personaje.get(id)?.nume || id.replaceAll('_', ' ')),
  emotieVale: () => (stare.nevoi.viata < cfg.nevoi.prag ? 'ranit' : 'normal'),
  verificaConditii: (c) => verifica(c, context(stare)),
  laEfecte: (e) => {
    aplicaEfecte(e, joc);
    actualizeazaHud();
  },
  laFinal: () => {
    salveaza();
    afiseaza();
  },
});

const debug = creeazaDebug(ui, joc);

// ---------- meniul ----------

function deschideMeniul() {
  const fundal = div('acoperitor');
  const panou = div('panou-meniu');
  const inchide = () => fundal.remove();
  panou.append(
    div('titlu-meniu', 'Meniu'),
    buton('Continuă', '', inchide),
    buton('Salvează într-un fișier', '', () => salvare.exporta(stare, `fangs-vn-salvare-ziua-${ziua(stare)}.json`)),
    buton('Încarcă dintr-un fișier', '', async () => {
      try {
        stare = await salvare.importa();
        salveaza();
        inchide();
        afiseaza();
        mesaj('Salvarea a fost încărcată.');
      } catch (e) {
        mesaj(e.message);
      }
    }),
    buton('Joc nou', '', () => {
      if (!confirm('Începi un joc nou? Progresul de acum se pierde (dacă nu l-ai salvat într-un fișier).')) return;
      inchide();
      joc.jocNou();
    }),
  );
  fundal.append(panou);
  fundal.onclick = (e) => e.target === fundal && inchide();
  ui.append(fundal);
}

// ---------- scena ----------

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
  const el = elementLaPunct(
    interactive.map((i) => i.el),
    ev,
  );
  return interactive.find((i) => i.el === el) || null;
}

stratLume.addEventListener('pointermove', (ev) => seteazaSubMouse(interactivLa(ev)));
stratLume.addEventListener('pointerleave', () => seteazaSubMouse(null));
stratLume.addEventListener('click', (ev) => interactivLa(ev)?.clic());

function afiseaza() {
  const d = lume.get(stare.scena);
  const ctx = context(stare);
  const r = randeaza(stratLume, d, date.aranjare[d.id], ctx);
  const faraZona = [];
  interactive = [];
  subMouse = null;
  stratLume.classList.remove('clicabil', 'umbrit');

  // Seara și noaptea: o tentă de culoare din cod, în afară de scenele care au imagine proprie pentru momentul ăsta
  if (ctx.moment === 'seara' || ctx.moment === 'noaptea') {
    const tenta = div(`tenta ${ctx.moment}`);
    stratLume.append(tenta);
    const sufixe = d.variante.filter((v) => v.conditii?.moment?.includes(ctx.moment)).map((v) => v.sufix);
    if (sufixe.length) {
      r.fundal.addEventListener('incarcat', (e) => {
        if (sufixe.some((s) => e.detail.includes(s))) {
          tenta.remove();
          // Imaginea de noapte e deja întunecată; doar piesele și personajele se întunecă puțin, ca să se potrivească
          stratLume.classList.add('umbrit');
        }
      });
    }
  }

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
    interactive.push({ el, grup: [el], clic: () => vorbesteCu(o.id) });
  }

  colt.replaceChildren(...(d.parinte ? [buton('← Înapoi', '', () => mergi(d.parinte))] : []), buton('☰ Meniu', '', deschideMeniul));
  titlu.textContent = d.titlu;

  // Locurile fără zonă desenată primesc butoane, altfel ar fi de neatins până le desenează autorul
  navigare.replaceChildren();
  if (faraZona.length) {
    navigare.append(div('eticheta', 'Fără zonă desenată încă:'));
    for (const { t, clic } of faraZona) navigare.append(buton(t.nume, '', clic));
  }

  actualizeazaHud();
  debug.arata();

  // Vecinii se preîncarcă în fundal, ca trecerea la ei să fie instantanee
  const vecini = [d.parinte, ...d.tinte.map((t) => t.spre)].filter(Boolean).map((id) => lume.get(id));
  for (const v of vecini) preincarca(candidati(v.imagine, v.variante, ctx).at(-1));
}

addEventListener('keydown', (e) => {
  if (e.key === 'F2' || e.key === '`') {
    e.preventDefault();
    return debug.comuta();
  }
  if (e.key !== 'Escape') return;
  const acoperitor = ui.querySelector('.acoperitor');
  if (acoperitor) return acoperitor.remove();
  const d = lume.get(stare.scena);
  if (!dialog.activ() && d.parinte) mergi(d.parinte);
});

afiseaza();
if (parametri.has('debug')) debug.comuta();
