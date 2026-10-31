import './stil.css';
import { dateBundle as date } from './date.js';
import { construiesteLumea, candidati } from './lume.js';
import { creeazaEcran, randeaza } from './scena.js';
import { verifica } from './conditii.js';
import { preincarca } from './imagini.js';
import { elementLaPunct } from './lovire.js';
import { stareNoua, context, avanseaza as avanseazaStare, costTimp, ziua, formatOra } from './stare.js';
import { inMinute } from './timp.js';
import { aplicaEfecte } from './efecte.js';
import { alegeEveniment, noteazaEveniment, caDialog } from './evenimente.js';
import * as salvare from './salvare.js';
import { creeazaDialog } from './dialog.js';
import { creeazaDebug } from './debug.js';
import { creeazaInventar } from './inventar.js';
import { creeazaEcranInventar } from './ecranInventar.js';
import { creeazaActiuni } from './actiuni.js';
import { creeazaLupta } from './lupta.js';
import { undeEste } from './rutine.js';
import { aplicaGraficaUi } from './uiGrafica.js';

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
const baraActiuni = div('bara-actiuni');
ui.append(colt, titlu, hud, navigare, baraActiuni);
aplicaGraficaUi(date.aranjare.ui);

let stare = salvare.citeste(CHEIE) || stareNoua(cfg);
if (!lume.has(stare.scena)) stare.scena = cfg.start.scena;
// Editorul deschide jocul direct într-o scenă, ca autorul să-și testeze aranjarea
const scenaCeruta = parametri.get('scena');
if (scenaCeruta && lume.has(scenaCeruta) && lume.get(scenaCeruta).tip !== 'ecran') stare.scena = scenaCeruta;

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
    div('monede', `Monede: ${stare.bani} · ${textTaxa()}`),
  );
}

function textTaxa() {
  if (stare.taxa.platita) return 'taxa plătită';
  const zile = stare.taxa.zi - ziua(stare);
  return zile <= 0 ? `taxa (${cfg.taxa.suma}) e azi!` : `taxa peste ${zile} ${zile === 1 ? 'zi' : 'zile'}`;
}

// ---------- timp, nevoi, leșin ----------

function salveaza() {
  salvare.scrie(CHEIE, stare);
}

// Întoarce true dacă Vale a leșinat (atunci acțiunea care a cerut timpul se oprește)
function avanseaza(minute, factorNevoi = 1) {
  const r = avanseazaStare(stare, minute, cfg.nevoi, factorNevoi);
  verificaTaxa();
  if (r.lesin) lesin();
  actualizeazaHud();
  return r.lesin;
}

// ---------- taxa ----------

// Când trece ziua taxei: dacă e plătită, începe un ciclu nou; dacă nu, se notează ratarea
function verificaTaxa() {
  const t = stare.taxa;
  while (ziua(stare) > t.zi) {
    if (!t.platita) {
      t.ratari++;
      anunt(cfg.taxa.textRatare);
    }
    t.zi += cfg.taxa.intervalZile;
    t.platita = false;
  }
}

function platesteTaxa() {
  const t = stare.taxa;
  if (t.platita) return mesaj('Taxa e deja plătită pentru săptămâna asta.');
  if (stare.bani < cfg.taxa.suma) return mesaj(`Îți trebuie ${cfg.taxa.suma} monede.`);
  stare.bani -= cfg.taxa.suma;
  t.platita = true;
  salveaza();
  actualizeazaHud();
  mesaj(`Ai plătit taxa (${cfg.taxa.suma} monede).`);
}

// În ziua taxei, de la ora colectorului, orcul vine la casa lui Vale (o singură dată pe zi)
function verificaColectorul() {
  const t = stare.taxa;
  const ctx = context(stare);
  if (t.platita || t.colectorZi === ctx.zi || ctx.zi !== t.zi || !stare.scena.startsWith('casa')) return false;
  if (ctx.minuteZi < inMinute(cfg.taxa.oraColector)) return false;
  t.colectorZi = ctx.zi;
  dialog.porneste({
    partener: 'orc_colector',
    start: 'c',
    noduri: {
      c: {
        vorbitor: 'orc_colector',
        emotie: 'normal',
        text: cfg.taxa.textColector,
        alegeri: [
          { text: `Plătește (${cfg.taxa.suma} monede)`, conditii: { bani: { min: cfg.taxa.suma } }, efecte: { plataTaxa: true }, spre: null },
          { text: 'Nu am bani acum.', spre: null },
        ],
      },
    },
  });
  return true;
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
    if (avanseaza(costTimp(stare, spre.tip === 'zona' ? cfg.timp.spreZona : cfg.timp.spreLoc, cfg.nevoi))) return;
  }
  salveaza();
  afiseaza();
  if (!faraTimp && !verificaColectorul()) verificaEvenimente();
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
  if (tinta.actiune) return actiuni.munca(tinta.actiune);
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
  salveaza,
  actualizeazaHud,
  platesteTaxa,
  get inventar() {
    return inventar;
  },
  // Primește un obiect; dacă nu încape, întreabă ce face (aruncă ceva sau îl lasă)
  primeste(id, n = 1) {
    const rest = inventar.adauga(id, n);
    if (rest > 0) inventarPlin(id, rest);
  },
  folosesteObiect(index) {
    const x = stare.inventar[index];
    const d = inventar.def(x.id);
    inventar.scoate(x.id, 1);
    aplicaEfecte(d.efecte, joc);
    if (d.minute) avanseaza(d.minute);
    return null;
  },
  deschideInventarul: (opt) => ecranInventar.deschide(opt),
  dupaInventar() {
    salveaza();
    afiseaza();
  },
  dupaActiune(text) {
    salveaza();
    afiseaza();
    if (text) mesaj(text);
  },
  pornesteLupta(id) {
    dialog.inchide();
    lupta.porneste(id);
  },
  dupaLupta(efecte, minute) {
    aplicaEfecte(efecte, joc);
    if (!avanseaza(minute)) {
      salveaza();
      afiseaza();
    }
  },
  // Schimbări din panoul debug: unele cer redesenarea scenei (ora, stări), altele doar HUD-ul
  dupaSchimbare(reafiseaza) {
    verificaTaxa();
    salveaza();
    if (reafiseaza) afiseaza();
    else actualizeazaHud();
  },
  jocNou() {
    stare = stareNoua(cfg);
    ecranInventar.inchide();
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

const inventar = creeazaInventar(date, () => stare);
const debug = creeazaDebug(ui, joc);
const ecranInventar = creeazaEcranInventar(ui, joc);
const actiuni = creeazaActiuni(ui, joc);
const lupta = creeazaLupta(ui, joc);

function inventarPlin(id, n) {
  const fundal = div('acoperitor');
  const panou = div('panou-anunt');
  panou.append(
    div('text-anunt', `N-ai loc pentru: ${inventar.def(id).nume}${n > 1 ? ` ×${n}` : ''}.`),
    buton('Aruncă ceva', '', () => (fundal.remove(), ecranInventar.deschide({ deLuat: { id, n }, cufar: stare.scena === 'casa.camera_vale' }))),
    buton('Lasă-l', '', () => fundal.remove()),
  );
  fundal.append(panou);
  ui.append(fundal);
}

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

// Datele brute ale unui loc (acțiunile stau în locations.json, nu în descrierea scenei)
function locDate(d) {
  if (d.tip !== 'loc') return null;
  const [z, l] = d.id.split('.');
  return date.locations.zone.find((x) => x.id === z)?.locuri.find((x) => x.id === l);
}

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

  // Personajele apar doar când rutina lor le aduce aici, la ora asta
  for (const o of d.obiecte.filter((o) => o.tip === 'sprite')) {
    const el = r.obiecte.get(o.id);
    if (undeEste(personaje.get(o.id), ctx) !== ctx.loc) {
      el.remove();
      continue;
    }
    interactive.push({ el, grup: [el], clic: () => vorbesteCu(o.id) });
  }

  baraActiuni.replaceChildren(...(locDate(d)?.actiuni || []).map((a) => buton(a.nume, '', () => actiuni.executa(a))));

  colt.replaceChildren(
    ...(d.parinte ? [buton('← Înapoi', '', () => mergi(d.parinte))] : []),
    buton('🎒 Inventar', '', () => ecranInventar.deschide({ cufar: false })),
    buton('☰ Meniu', '', deschideMeniul),
  );
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
  if (lupta.activa()) return;
  if ((e.key === 'i' || e.key === 'I') && !dialog.activ()) return ecranInventar.deschis() ? ecranInventar.inchide() : ecranInventar.deschide({ cufar: false });
  if (e.key !== 'Escape') return;
  const acoperitor = ui.querySelector('.acoperitor');
  if (acoperitor) return acoperitor.remove();
  if (ecranInventar.deschis()) return ecranInventar.inchide();
  const d = lume.get(stare.scena);
  if (!dialog.activ() && d.parinte) mergi(d.parinte);
});

afiseaza();
if (parametri.has('debug')) debug.comuta();
