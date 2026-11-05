import './stil.css';
import { dateBundle as date } from './date.js';
import { construiesteLumea, candidati } from './lume.js';
import { creeazaEcran, randeaza, aplicaMoment, puncteSvg } from './scena.js';
import { conturImagine } from './contur.js';
import { verifica, registreazaConditie } from './conditii.js';
import { preincarca } from './imagini.js';
import { elementLaPunct } from './lovire.js';
import { stareNoua, context, avanseaza as avanseazaStare, costTimp, ziua, formatOra } from './stare.js';
import { inMinute, NUME_ZILE } from './timp.js';
import { aplicaEfecte } from './efecte.js';
import { alegeEveniment, noteazaEveniment, caDialog, poateReveni } from './evenimente.js';
import * as salvare from './salvare.js';
import { creeazaDialog } from './dialog.js';
import { creeazaSecventa } from './secventa.js';
import { creeazaDebug } from './debug.js';
import { creeazaInventar } from './inventar.js';
import { creeazaEcranInventar } from './ecranInventar.js';
import { creeazaCarte } from './carte.js';
import { creeazaZaruri } from './zaruri.js';
// Fonturile de scris de mână ale cărții intră în build (@fontsource), ca jocul să meargă offline; au și diacriticele românești
import '@fontsource/dancing-script/600.css';
import '@fontsource/caveat/500.css';
import { creeazaActiuni } from './actiuni.js';
import { creeazaLupta } from './lupta.js';
import { undeEste, intrareProgram, registreazaConditiiPersonaje } from './rutine.js';
import { aplicaGraficaUi } from './uiGrafica.js';

const parametri = new URLSearchParams(location.search);
const CHEIE = salvare.cheieSalvare(parametri.has('test'));
const cfg = date.config;
const lume = construiesteLumea(date);
registreazaConditiiPersonaje(date.npcs.personaje, registreazaConditie);
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
// Interfața de pe ecran (decisă de autor): panoul lui Vale stânga-sus, ceasul sus la mijloc, butoanele dreapta-sus,
// locul unde ești stânga-jos și „Înapoi” dreapta-jos. Centrul rămâne liber pentru ilustrație.
const butoaneHud = div('butoane-hud');
const titlu = div('titlu-scena');
const inapoi = div('inapoi-hud');
const hud = div('hud');
const ceasHud = div('ceas-hud');
const navigare = div('navigare-rezerva');
const baraActiuni = div('bara-actiuni');
// Panoul lui Vale nu stă mereu deschis (decis de autor): un buton cu iconița lui îl deschide și îl închide
const butonVale = div('buton-vale-loc');
ui.append(butoaneHud, titlu, inapoi, butonVale, hud, ceasHud, navigare, baraActiuni);

// Iconița unui buton: până se încarcă imaginea ei (ui_icon_<id>.png) rămâne simbolul din text
const iconita = (id, simbol) => Object.assign(div(`icon-hud ${id}`), { textContent: simbol });
let panouDeschis = false;
function comutaPanoul() {
  panouDeschis = !panouDeschis;
  actualizeazaHud();
}

function butonHud(id, simbol, eticheta, clic) {
  const b = buton('', 'buton-hud', clic);
  b.append(iconita(id, simbol), div('eticheta-hud', eticheta));
  b.title = eticheta;
  return b;
}

// TEMPORAR (pentru testare, se scoate la final, config.ceasRapid): butoane sub ceas ca să muți ora repede.
// Schimbă direct ceasul, fără să consume foame sau sete.
if (cfg.ceasRapid) {
  const rapid = div('ceas-rapid');
  const muta = (minute) => {
    stare.minute = Math.max(0, stare.minute + minute);
    joc.dupaSchimbare(true);
  };
  for (const [text, minute] of [['−1 oră', -60], ['+15 min', 15], ['+1 oră', 60], ['+1 zi', 1440]]) {
    const b = buton(text, 'mic', () => muta(minute));
    rapid.append(b);
  }
  ui.append(rapid);
}
aplicaGraficaUi(date.aranjare.ui);

let stare = salvare.citeste(CHEIE) || stareNoua(cfg);
if (!lume.has(stare.scena)) stare.scena = cfg.start.scena;
// Salvările de dinainte de cartea personajelor n-au lista celor cunoscuți: pornesc cu cei cunoscuți de la început (Miriam)
stare.cunoscuti ??= [...(cfg.start.cunoscuti || [])];
// La fel pentru lucrurile luate de orci la pedepse (se pot câștiga înapoi la zaruri)
stare.confiscate ??= [];
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
  ceasHud.textContent = `${NUME_ZILE[ctx.ziSaptamana]}, ziua ${ziua(stare)} · ${formatOra(stare)} · ${MOMENTE[ctx.moment]}`;
  const bani = div('rand-monede');
  bani.append(iconita('monede', '🪙'), div('', `Monede: ${stare.bani}`), div('despartitor'), div('taxa-hud', textTaxa()));
  const d = stare.datorieBlanuri;
  // Cu panoul închis, butonul arată totuși când ceva e grav (o nevoie scăzută sau taxa de azi)
  const zileTaxa = stare.taxa.zi - ziua(stare);
  const grav = NEVOI.some(([cheie]) => stare.nevoi[cheie] < cfg.nevoi.prag) || (!stare.taxa.platita && zileTaxa <= 0);
  const b = butonHud('vale', '👤', 'Vale', comutaPanoul);
  b.classList.toggle('apasat', panouDeschis);
  b.classList.toggle('avertizare', grav && !panouDeschis);
  butonVale.replaceChildren(b);
  hud.hidden = !panouDeschis;
  hud.replaceChildren(
    div('nume-hud', 'Vale'),
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
    bani,
    // Datoria de blăni (pedeapsa orcilor) are rândul ei, ca să nu se piardă printre celelalte
    ...(d ? [div('datorie-hud', `Orcii vor ${d.cate} ${cfg.pedepse.tipuri.blanuri.numePlural} până în ziua ${d.panaLaZiua}`)] : []),
  );
}

function textTaxa() {
  if (stare.taxa.platita) return 'Taxa e plătită';
  const zile = stare.taxa.zi - ziua(stare);
  return zile <= 0 ? `Taxa (${sumaTaxa()}) e azi!` : `Taxa peste ${zile} ${zile === 1 ? 'zi' : 'zile'}${stare.taxa.dubla ? ' (dublă!)' : ''}`;
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

// Taxa de bază plus ce au adăugat orcii între timp (de exemplu după bătaia din tavernă)
function sumaTaxa() {
  // Pedeapsa „blănurile”: dacă nu le-ai adus la timp, următoarea taxă e dublă
  return (cfg.taxa.suma + (stare.taxa.extra || 0)) * (stare.taxa.dubla ? 2 : 1);
}

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
  // Blănurile cerute de orci: dacă a trecut termenul și nu le-ai adus, taxa următoare se dublează
  const d = stare.datorieBlanuri;
  if (d && ziua(stare) > d.panaLaZiua) {
    stare.datorieBlanuri = null;
    t.dubla = true;
    anunt(cfg.pedepse.tipuri.blanuri.textRatat);
  }
}

function platesteTaxa() {
  const t = stare.taxa;
  if (t.platita) return mesaj('Taxa e deja plătită pentru săptămâna asta.');
  if (stare.bani < sumaTaxa()) return mesaj(`Îți trebuie ${sumaTaxa()} monede.`);
  stare.bani -= sumaTaxa();
  t.platita = true;
  t.dubla = false;
  salveaza();
  actualizeazaHud();
  mesaj(`Ai plătit taxa (${sumaTaxa()} monede).`);
}

// În ziua taxei, de la ora colectorului, orcul vine la casa lui Vale (o singură dată pe zi)
function verificaColectorul() {
  const t = stare.taxa;
  const ctx = context(stare);
  if (t.platita || t.colectorZi === ctx.zi || ctx.zi !== t.zi || !stare.scena.startsWith('casa')) return false;
  if (ctx.minuteZi < inMinute(cfg.taxa.oraColector)) return false;
  t.colectorZi = ctx.zi;
  dialogTaxa(cfg.taxa.textColector);
  return true;
}

// Discuția cu colectorul: acasă (în ziua taxei) și la poartă (când îl apeși). Suma se scrie din cod,
// pentru că poate crește (de exemplu după bătaia din tavernă)
function dialogTaxa(text) {
  // Dacă orcii așteaptă blănurile și Vale le are, colectorul le ia întâi
  const d = stare.datorieBlanuri;
  if (d && inventar.numar(stare.inventar, d.obiect) >= d.cate) {
    return dialog.porneste({
      partener: 'orc_colector',
      start: 'b',
      noduri: {
        b: {
          vorbitor: 'orc_colector',
          emotie: 'normal',
          text: cfg.pedepse.tipuri.blanuri.textColector,
          alegeri: [
            { text: `Predă ${d.cate} ${cfg.pedepse.tipuri.blanuri.numePlural}`, efecte: { predaBlanuri: true }, spre: 'gata' },
            { text: 'Nu acum.', spre: null },
          ],
        },
        gata: { vorbitor: 'orc_colector', emotie: 'rade', text: cfg.pedepse.tipuri.blanuri.textPredat },
      },
    });
  }
  const nod = stare.taxa.platita
    ? { vorbitor: 'orc_colector', emotie: 'rade', text: cfg.taxa.textColectorPlatit }
    : {
        vorbitor: 'orc_colector',
        emotie: 'normal',
        text,
        alegeri: [
          { text: `Plătește (${sumaTaxa()} monede)`, conditii: { bani: { min: sumaTaxa() } }, efecte: { plataTaxa: true }, spre: null },
          { text: 'Nu am bani acum.', spre: null },
        ],
      };
  dialog.porneste({ partener: 'orc_colector', start: 'c', noduri: { c: nod } });
}

// ---------- pedepsele orcilor ----------
// Când Vale le stă în cale, orcii îl pedepsesc. Dacă azi „sunt binevoitori” (o șansă), îl lasă să-și aleagă
// pedeapsa; altfel o aleg ei, la întâmplare dintre cele care se pot aplica acum (config.json, „pedepse”)
function obiecteDePredat() {
  return [...new Set(stare.inventar.map((x) => x.id))].filter((id) => inventar.def(id).tip !== 'poveste');
}

function pedepsePosibile() {
  return Object.entries(cfg.pedepse.tipuri)
    .filter(([id]) => (id !== 'obiect' || obiecteDePredat().length) && (id !== 'blanuri' || !stare.datorieBlanuri))
    .map(([id, t]) => ({ id, ...t }));
}

function aplicaPedeapsa(id, obiect) {
  const t = cfg.pedepse.tipuri;
  if (id === 'biciuire') {
    stare.nevoi.viata = Math.max(t.biciuire.viataMinima, stare.nevoi.viata - t.biciuire.viata);
    stare.minute += t.biciuire.minute || 0;
  }
  if (id === 'taxa') stare.taxa.extra = (stare.taxa.extra || 0) + t.taxa.cresteCu;
  if (id === 'obiect' && obiect) {
    inventar.scoateOriunde(obiect, 1);
    // Orcii țin minte ce au luat: la masa de zaruri îl pun pe el ca miză, ca Vale să-l poată câștiga înapoi
    stare.confiscate.push(obiect);
  }
  if (id === 'blanuri') stare.datorieBlanuri = { obiect: t.blanuri.obiect, cate: t.blanuri.cate, panaLaZiua: ziua(stare) + t.blanuri.zile };
  salveaza();
  actualizeazaHud();
}

function dialogPedeapsa(cine, tip) {
  const p = cfg.pedepse;
  const posibile = pedepsePosibile();
  const nod = (text, extra = {}) => ({ vorbitor: cine, emotie: 'suparat', text, ...extra });
  const noduri = {};
  // Noduri pentru fiecare pedeapsă: textul ei; „obiect” cere să alegi ce predai
  for (const t of posibile) {
    if (t.id === 'obiect') {
      noduri.obiect = nod(t.textAlege, {
        alegeri: obiecteDePredat()
          .slice(0, 8)
          .map((id) => ({ text: inventar.def(id).nume, efecte: { pedeapsaAplicata: { id: 'obiect', obiect: id } }, spre: null })),
      });
    } else noduri[t.id] = nod(t.text, { efecte: { pedeapsaAplicata: { id: t.id } } });
  }
  let start;
  if (!tip && Math.random() < p.sansaAlegi) {
    noduri.alege = nod(p.textAlegi, { emotie: 'rade', alegeri: posibile.map((t) => ({ text: t.alegere, spre: t.id })) });
    start = 'alege';
  } else {
    // „tip”: pedeapsa e impusă de eveniment (orcul care scotocește prin casă ia un obiect)
    const t = posibile.find((x) => x.id === tip) || posibile[Math.floor(Math.random() * posibile.length)];
    start = t.id;
    // Când aleg ei obiectul, iau unul la întâmplare
    if (t.id === 'obiect') {
      const obiecte = obiecteDePredat();
      const ales = obiecte[Math.floor(Math.random() * obiecte.length)];
      noduri.obiect = nod(t.textIau.replace('{obiect}', inventar.def(ales).nume.toLowerCase()), { efecte: { pedeapsaAplicata: { id: 'obiect', obiect: ales } } });
    }
  }
  dialog.porneste({ partener: cine, start, noduri });
}

// Pornită dintr-un efect (o alegere din dialog sau o luptă pierdută): așteaptă să se închidă ce e pe ecran
function pedeapsa(cine) {
  const incearca = () => {
    if (dialog.activ() || secventa.activa() || lupta.activa()) return setTimeout(incearca, 150);
    // Valoarea efectului: true / id-ul orcului / { cine, tip }
    const o = typeof cine === 'object' && cine ? cine : { cine };
    dialogPedeapsa(o.cine === true || !o.cine ? 'paznic_orc_1' : o.cine, o.tip);
  };
  setTimeout(incearca, 0);
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
  const ev = alegeEveniment(evenimente, stare, ctx, cfg.categoriiEvenimente);
  if (ev) pornesteEveniment(ev.id);
}

// „fortat” (din panoul debug): pornește și un eveniment care s-a întâmplat deja
function pornesteEveniment(id, fortat = false) {
  const ev = evenimente.find((e) => e.id === id);
  if (!ev || dialog.activ() || secventa.activa()) return;
  // Și un eveniment pornit dintr-un efect respectă „repetare” (întâlnirea cu vânătoarea e o singură dată)
  if (!fortat && !poateReveni(ev, stare.evenimente[ev.id], ziua(stare))) return;
  noteazaEveniment(stare, ev, ziua(stare));
  salveaza();
  // Întâi imaginile (dacă are), apoi textul cu alegeri sau un dialog întreg;
  // un eveniment fără text (de exemplu după înfrângere) doar își aplică efectele
  secventa.arata(ev.imagini, () => {
    if (ev.dialog) {
      aplicaEfecte(ev.efecte, joc);
      actualizeazaHud();
      return vorbesteCu(null, ev.dialog);
    }
    if (ev.text || ev.alegeri?.length) return dialog.porneste(caDialog(ev));
    aplicaEfecte(ev.efecte, joc);
    salveaza();
    afiseaza();
  });
}

// Pornit dintr-un efect: așteaptă să se închidă dialogul sau lupta din care a venit
function pornesteEvenimentDupa(id) {
  setTimeout(() => pornesteEveniment(id), 0);
}

function activeaza(tinta, ctx) {
  // Un loc poate avea mai multe lacăte, fiecare cu gândul lui (camera fierarului: fără cheie / el doarme);
  // primul care nu e îndeplinit spune de ce nu se intră
  const lacat = [].concat(tinta.incuiat || []).find((l) => !verifica(l.conditii, ctx));
  if (lacat) return gand(lacat.mesaj || 'E încuiat.');
  if (tinta.act) return actiuni.executa(tinta.act);
  if (tinta.vanatoare) return vaneaza(tinta.vanatoare);
  if (tinta.personaj) return vorbesteCu(tinta.personaj);
  if (tinta.actiune) return actiuni.munca(tinta.actiune);
  mergi(tinta.spre);
}

// Vânătoarea: trece timpul, imaginea locului stă câteva secunde ca ecran de încărcare („cauți urme”),
// apoi pornește lupta cu un animal ales la întâmplare din lista locului
// Lista de lupte poate avea șanse („sansa” la fiecare); fără șanse, toate au aceleași
function alegeCuSanse(lista) {
  const cu = lista.map((x) => (typeof x === 'string' ? { id: x, sansa: 1 } : { sansa: 1, ...x }));
  let z = Math.random() * cu.reduce((s, x) => s + x.sansa, 0);
  for (const x of cu) if ((z -= x.sansa) < 0) return x.id;
  return cu.at(-1).id;
}

function vaneaza(v) {
  // „insotitor”: cineva care vânează și el în aceeași perioadă (Kaia, 10–14) te poate găsi și luptă cu tine.
  // Se verifică la ora la care pleci la vânătoare, înainte să treacă timpul
  const i = v.insotitor;
  const cuInsotitor = i && verifica(i.conditii, context(stare)) && Math.random() < (i.sansa ?? 0);
  if (avanseaza(costTimp(stare, v.minute ?? 60, cfg.nevoi))) return;
  salveaza();
  afiseaza();
  const id = alegeCuSanse(v.lupte);
  const def = date.lupte.lupte[id];
  const lupta = cuInsotitor ? { ...def, aliati: [...(def.aliati || []), { id: i.personaj }] } : id;
  secventa.arata(
    [v.imagine],
    () => {
      if (!cuInsotitor || !dialoguri[i.dialog]) return joc.pornesteLupta(lupta);
      // Întâi discuția dintre ei, apoi lupta împreună
      dupaDialog = () => joc.pornesteLupta(lupta);
      dialog.porneste(dialoguri[i.dialog]);
    },
    { automat: (v.secunde ?? 3) * 1000, text: v.text || 'Cauți urme de vânat...' },
  );
}
// Ce urmează după ce se închide dialogul curent (de exemplu lupta cu Kaia după discuția de la vânătoare)
let dupaDialog = null;

// Vale „gândește” (de exemplu la o ușă încuiată): dialog doar cu el, cu textul în italic
function gand(text) {
  dialog.porneste({ partener: null, start: 'g', noduri: { g: { vorbitor: 'vale', emotie: 'normal', gand: true, text } } });
}

// Cine intră în cartea personajelor după dialogul de acum (cel apăsat, chiar dacă răspunde altcineva în locul lui)
let deCunoscut = [];
function cunoaste(id) {
  if (id && personaje.get(id)?.carte && !stare.cunoscuti.includes(id)) stare.cunoscuti.push(id);
}

function vorbesteCu(id, idDialog) {
  if (idDialog) return dialog.porneste(dialoguri[idDialog] || { partener: null, start: 'a', noduri: { a: { text: `(TODO) Dialogul „${idDialog}” nu există.` } } });
  // Uneori răspunde altcineva: cât timp prizonierul e legat, discuția e cu cel care trebuie plătit
  const apasat = id;
  const r = personaje.get(id)?.cineRaspunde;
  if (r && verifica(r.conditii, context(stare))) id = r.personaj;
  const p = personaje.get(id);
  // Cine doarme nu e trezit: Vale doar se gândește (Kaia noaptea, la campsite)
  if (p?.gandDoarme && intrareProgram(p, context(stare))?.doarme) return gand(p.gandDoarme);
  // Colectorul de la poartă nu are un dialog scris: cere taxa
  if (p?.dialogTaxa) return dialogTaxa(cfg.taxa.textColectorPoarta);
  deCunoscut = [...new Set([apasat, id])];
  // Un personaj poate avea alt dialog în funcție de locul unde îl găsești (Miriam în piață)
  const d = dialoguri[p?.dialoguriPeLoc?.[context(stare).loc] ?? p?.dialog];
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
  pornesteEvenimentDupa,
  sumaTaxa,
  // Magazinul unui personaj (npcs.json, „magazin”), deschis după ce se închide dialogul
  deschideMagazin(id) {
    const p = personaje.get(id);
    if (!p?.magazin) return mesaj(`${p?.nume || id} nu are magazin.`);
    setTimeout(() => actiuni.executa({ tip: 'magazin', nume: `${p.nume}`, ...p.magazin }), 0);
  },
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
  pedeapsa,
  aplicaPedeapsa,
  pornesteLupta(id) {
    dialog.inchide();
    lupta.porneste(id);
  },
  pornesteZaruri: () => zaruri.porneste(),
  conditii: (c) => verifica(c, context(stare)),
  // O singură replică a unui personaj, ca un dialog scurt (orcii de la masa de zaruri)
  replica(cine, emotie, text) {
    dialog.porneste({ partener: cine, start: 'r', noduri: { r: { vorbitor: cine, emotie, text } } });
  },
  // După masa de zaruri: trece timpul, apoi orcul spune ce crede despre rezultat
  dupaZaruri(text, aCastigat, minute) {
    if (avanseaza(minute)) return;
    salveaza();
    afiseaza();
    joc.replica('paznic_orc_1', aCastigat ? 'suparat' : 'rade', text);
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
  laFinal: (d) => {
    // Un personaj intră în carte după prima discuție cu el (și după un eveniment în care vorbește el)
    for (const id of [...deCunoscut, d?.partener]) cunoaste(id);
    deCunoscut = [];
    salveaza();
    afiseaza();
    if (dupaDialog) {
      const f = dupaDialog;
      dupaDialog = null;
      setTimeout(f, 0);
    }
  },
});

const secventa = creeazaSecventa(ui);
const inventar = creeazaInventar(date, () => stare);
const debug = creeazaDebug(ui, joc);
const ecranInventar = creeazaEcranInventar(ui, joc);
const carte = creeazaCarte(ui, joc);
const zaruri = creeazaZaruri(ui, joc);
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

function comutaEcranComplet() {
  // Browserul cere ca ecranul complet să pornească dintr-un click; F11 merge și el
  if (document.fullscreenElement) document.exitFullscreen?.();
  else document.documentElement.requestFullscreen?.().catch(() => mesaj('Browserul nu permite ecran complet aici. Încearcă F11.'));
}
document.addEventListener('fullscreenchange', () => afiseaza());

function afiseaza() {
  const d = lume.get(stare.scena);
  const ctx = context(stare);
  const r = randeaza(stratLume, d, date.aranjare[d.id], ctx);
  const faraZona = [];
  const actiuniFaraZona = [];
  interactive = [];
  subMouse = null;
  stratLume.classList.remove('clicabil', 'umbrit');

  aplicaMoment(stratLume, r, d, ctx);

  // Personajele apar doar când rutina lor le aduce aici, la ora asta
  const prezenti = new Set(
    d.obiecte
      .filter((o) => o.tip === 'sprite')
      .filter((o) => {
        const pers = personaje.get(o.id);
        return undeEste(pers, ctx) === ctx.loc && verifica(pers.apare, ctx);
      })
      .map((o) => o.id),
  );
  const cuZona = new Set();

  for (const t of d.tinte) {
    const poligon = r.poligoane.get(t.id);
    if (t.personaj) {
      // Zona unui personaj contează doar cât timp el e în scenă
      if (!prezenti.has(t.personaj)) {
        poligon?.remove();
        continue;
      }
      if (!poligon) continue;
      cuZona.add(t.personaj);
    }
    if (t.ascuns && !verifica(t.ascuns.conditii, ctx)) {
      poligon?.remove();
      continue;
    }
    const piese = d.obiecte.filter((o) => o.tinta === t.id).map((o) => r.obiecte.get(o.id));
    const clic = () => activeaza(t, ctx);

    if (poligon) {
      // O zonă desenată de mână are prioritate; cu piesă, se luminează clădirea, fără piesă chiar zona
      if (piese.length) legaEvidentiere(poligon, piese);
      else {
        poligon.classList.add('vizibila');
        legaEvidentiere(poligon, [poligon], 'evidentiat-poligon');
      }
      poligon.addEventListener('click', clic);
    } else if (piese.length) {
      for (const p of piese) interactive.push({ el: p, grup: piese, clic });
    } else {
      // Acțiunile fără zonă desenată rămân butoane jos, ca înainte; locurile merg la „Fără zonă desenată”
      (t.act ? actiuniFaraZona : faraZona).push({ t, clic });
    }
  }

  // Decorul cu „apare” se vede doar cât condițiile sunt îndeplinite (glaive-ul, cât Kaia e la campsite)
  for (const o of d.obiecte.filter((o) => o.tip === 'decor' && !verifica(o.apare, ctx))) r.obiecte.get(o.id)?.remove();
  for (const o of d.obiecte.filter((o) => o.tip === 'sprite')) {
    const el = r.obiecte.get(o.id);
    if (!prezenti.has(o.id)) {
      el.remove();
      continue;
    }
    // Cu zonă desenată, strălucirea și click-ul vin din zonă; fără ea, personajul răspunde pe forma lui
    if (cuZona.has(o.id) || personaje.get(o.id).clicabil === false) {
      el.classList.add('cu-zona');
      continue;
    }
    // Fără zonă desenată: zona se face automat din forma sprite-ului și arată exact ca una desenată
    el.classList.add('cu-zona');
    const puneZona = () => {
      if (el.zonaAuto || !el.isConnected) return;
      const sc = scena.getBoundingClientRect();
      const b = el.getBoundingClientRect();
      if (!b.width || !sc.width) return;
      const puncte = conturImagine(el.querySelector('img')).map(([u, v]) => [(b.left - sc.left + u * b.width) / sc.width, (b.top - sc.top + v * b.height) / sc.height]);
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      p.setAttribute('points', puncteSvg(puncte));
      p.setAttribute('class', 'zona-clic vizibila');
      p.setAttribute('filter', 'url(#contur-moale)');
      if (r.masca) p.setAttribute('mask', `url(#${r.masca})`);
      legaEvidentiere(p, [p], 'evidentiat-poligon');
      p.addEventListener('click', () => vorbesteCu(o.id));
      r.svg.append(p);
      el.zonaAuto = p;
    };
    if (el.querySelector('img')?.complete) puneZona();
    el.addEventListener('incarcat', puneZona);
    // Imagine lipsă (placeholder): zona e dreptunghiul lui
    setTimeout(() => el.classList.contains('lipsa') && puneZona(), 600);
  }

  baraActiuni.replaceChildren(...actiuniFaraZona.map(({ t, clic }) => buton(t.nume, '', clic)));

  butoaneHud.replaceChildren(
    butonHud('inventar', '🎒', 'Inventar', () => ecranInventar.deschide({ cufar: false })),
    butonHud('personaje', '📖', 'Personaje', () => carte.deschide()),
    butonHud('meniu', '☰', 'Meniu', deschideMeniul),
    butonHud('ecran', '⤢', document.fullscreenElement ? 'Ieși' : 'Ecran complet', comutaEcranComplet),
  );
  inapoi.replaceChildren();
  if (d.parinte) {
    const b = buton('', 'placuta-hud', () => mergi(d.parinte));
    b.append(iconita('inapoi', '↩'), div('', 'Înapoi'));
    inapoi.append(b);
  }
  titlu.replaceChildren(iconita('locatie', '📍'), div('', d.titlu));

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
  if (lupta.activa() || zaruri.activ()) return;
  // Literele scrise într-un câmp (panoul debug) nu deschid inventarul sau cartea
  if (e.target.closest?.('input, textarea, select')) return;
  if ((e.key === 'v' || e.key === 'V') && !dialog.activ()) return comutaPanoul();
  if ((e.key === 'p' || e.key === 'P') && !dialog.activ() && !ecranInventar.deschis() && !ui.querySelector('.acoperitor')) return carte.deschisa() ? carte.inchide() : carte.deschide();
  if (carte.deschisa()) return e.key === 'Escape' && carte.inchide();
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
