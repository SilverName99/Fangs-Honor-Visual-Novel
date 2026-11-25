import './stil.css';
import { dateBundle as date } from './date.js';
import { construiesteLumea, candidati, imaginiCerute } from './lume.js';
import { creeazaEcran, randeaza, aplicaMoment, puncteSvg, LATIME, INALTIME } from './scena.js';
import { conturImagine } from './contur.js';
import { verifica, registreazaConditie } from './conditii.js';
import { preincarca, elementImagine, incarcaToate } from './imagini.js';
import { VITEZE, viteza, seteazaViteza } from './viteza.js';
import { elementLaPunct } from './lovire.js';
import { stareNoua, context, avanseaza as avanseazaStare, costTimp, ziua, formatOra } from './stare.js';
import { inMinute } from './timp.js';
import { aplicaEfecte } from './efecte.js';
import { alegeEveniment, noteazaEveniment, caDialog, poateReveni } from './evenimente.js';
import * as salvare from './salvare.js';
import { creeazaDialog } from './dialog.js';
import { preincarcaFilm, progresFilme, filmeleDialogului, filmeleDeLa, filmGata } from './filme.js';
import { creeazaSecventa } from './secventa.js';
import { creeazaDebug } from './debug.js';
import { creeazaInventar } from './inventar.js';
import { creeazaEcranInventar, iconita as iconitaObiect } from './ecranInventar.js';
import { creeazaEcranMagazin } from './ecranMagazin.js';
import { creeazaSunet, volumeSunet, seteazaVolum } from './sunet.js';
import { creeazaCarte } from './carte.js';
import { creeazaPrologul } from './prolog.js';
import { t, LIMBI, limbaJoc, seteazaLimba, laSchimbareaLimbii } from './limba.js';
import { actualizeazaMisiuni, optiuniMisiuni, semnPersonaj, evenimentOferit } from './misiuni.js';
import { creeazaZaruri } from './zaruri.js';
import { creeazaTafl } from './tafl.js';
// Fonturile de scris de mână ale cărții intră în build (@fontsource), ca jocul să meargă offline; au și diacriticele românești
import '@fontsource/dancing-script/600.css';
import '@fontsource/caveat/500.css';
import { creeazaActiuni } from './actiuni.js';
import { creeazaLupta } from './lupta.js';
import { creeazaGroapa, aliatiGroapa } from './groapa.js';
import { undeEste, intrareProgram, registreazaConditiiPersonaje } from './rutine.js';
import { aplicaGraficaUi, aplicaMeniu, MARIME_CURSOR, marimeCursor, seteazaMarimeCursor, seteazaSemneMisiuni, semneMisiuniPornite, miniJocuriPornite, seteazaMiniJocuri } from './uiGrafica.js';

const parametri = new URLSearchParams(location.search);
const CHEIE = salvare.cheieSalvare(parametri.has('test'));
const cfg = date.config;
const lume = construiesteLumea(date);
registreazaConditiiPersonaje(date.npcs.personaje, registreazaConditie);
// Taxa săptămânii: plătită sau, măcar, cu banii pentru ea la Vale („Drumul trezirii”: Vale lipsește șase zile, iar mama
// plătește taxa cu banii lăsați de el, decis de autor). Din context, ca să meargă și pentru semnele de pe hartă
registreazaConditie('taxaPlatita', (v, c) => !!c.taxa?.platita === v);
registreazaConditie('taxaAcoperita', (v, c) => (!!c.taxa?.platita || (c.bani ?? 0) >= (cfg.taxa.suma + (c.taxa?.extra || 0)) * (c.taxa?.dubla ? 2 : 1)) === v);
const personaje = new Map(date.npcs.personaje.map((p) => [p.id, p]));
const evenimente = date.events?.evenimente || [];
const dialoguri = date.dialoguri || {};
// Numele zilelor, ale momentelor și ale nevoilor se traduc la fiecare desenare: cu t() chemat o singură dată, la
// pornire, HUD-ul ar rămâne în limba de atunci după ce jucătorul o schimbă din Opțiuni. Cheile stau scrise întregi,
// ca să le găsească scriptul de verificare a traducerilor (tools/traduceri.mjs)
const numeZi = (zi) => ({ luni: t('Luni'), marti: t('Marți'), miercuri: t('Miercuri'), joi: t('Joi'), vineri: t('Vineri'), sambata: t('Sâmbătă'), duminica: t('Duminică') })[zi];
const numeMoment = (m) => ({ dimineata: t('Dimineața'), amiaza: t('Amiaza'), seara: t('Seara'), noaptea: t('Noaptea') })[m];
const NEVOI = [
  ['viata', () => t('Viață')],
  ['stamina', () => t('Stamina')],
  ['foame', () => t('Foame')],
  ['sete', () => t('Sete')],
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
const sunet = creeazaSunet(date);
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
// Semnele misiunilor („!”/„?”) stau pe un strat al interfeței, imediat peste numele locului (decis de autor: semnul
// de deasupra bisericii, lipită de marginea de sus a hărții, se vede peste titlu, nu dispare sub el)
const stratSemne = div('strat-semne');
ui.append(butoaneHud, titlu, stratSemne, inapoi, butonVale, hud, ceasHud, navigare, baraActiuni);

// Iconița unui buton: până se încarcă imaginea ei (ui_icon_<id>.png) rămâne simbolul din text
// Clasa are prefixul „icon-”, ca să nu se bată cu alte clase din joc (de exemplu „continua” din dialog, „ecran” din scenă)
const iconita = (id, simbol) => Object.assign(div(`icon-hud icon-${id}`), { textContent: simbol });
let panouDeschis = false;
function comutaPanoul() {
  panouDeschis = !panouDeschis;
  actualizeazaHud();
}

// Butoanele din dreapta-sus au doar iconița (decis de autor: se înțelege din ea); numele apare la hover
function butonHud(id, simbol, eticheta, clic, cuText = false) {
  const b = buton('', 'buton-hud', clic);
  b.append(iconita(id, simbol), ...(cuText ? [div('eticheta-hud', eticheta)] : []));
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

const salvata = salvare.citeste(CHEIE);
let stare = salvata || stareNoua(cfg);
// Prima pornire (fără salvare) începe cu prologul, ca un joc nou (cerut de autor); jocul de test și editorul, care
// deschid jocul direct într-o scenă, nu, ca să nu stea cartea în calea testelor (acolo se vede din „Joc nou” sau Galerie)
if (!salvata && !parametri.has('test') && !parametri.get('scena')) stare.prolog = 'deschis';
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
  panou.append(div('text-anunt', text), buton(t('Continuă'), 'buton-mic-meniu', () => fundal.remove()));
  fundal.append(panou);
  ui.append(fundal);
}

// Anunțurile care vin din trecerea timpului (taxa ratată la miezul nopții, blănurile neaduse) așteaptă să se termine
// ce e pe ecran: somnul, visul (și pasul dintre imaginea somnului și vis), o discuție, o luptă; altfel stăteau peste
// vis și îi opreau clicurile
let visDeAratat = false;
function anuntLaLiber(text) {
  const incearca = () => (dialog.activ() || secventa.activa() || lupta.activa() || seDescarcaFilmul || visDeAratat ? setTimeout(incearca, 300) : anunt(text));
  setTimeout(incearca, 0);
}

// Întrebarea „ești sigur?” în stilul jocului, pe panoul mic, nu fereastra browserului (decis de autor: aceea
// scoate jocul din ecranul complet și nu se potrivește cu restul). Întoarce o promisiune: da / nu
function intreaba(text, da = t('Da'), nu = t('Nu')) {
  return new Promise((raspunde) => {
    const fundal = div('acoperitor intrebare');
    const panou = div('panou-anunt');
    const gata = (r) => (fundal.remove(), raspunde(r));
    panou.append(div('text-anunt', text), buton(da, 'buton-mic-meniu', () => gata(true)), buton(nu, 'buton-mic-meniu', () => gata(false)));
    fundal.append(panou);
    fundal.onclick = (e) => e.target === fundal && gata(false);
    ui.append(fundal);
  });
}

// Ce a primit Vale de la ultima actualizare a HUD-ului (bani, încredere, obiecte). Ce primește într-o discuție sau
// într-un eveniment (Agnes după scandal, o misiune terminată) urcă ușor pe ecran și dispare la ultima replică
// (decis de autor); în afara lor se uită (munca, magazinul și restul își arată deja câștigul în felul lor)
let castiguri = [];
// Câștigurile unei misiuni terminate în mijlocul unui dialog așteaptă ultima replică a ramurii (decis de autor:
// „fix înainte să se termine dialogul”)
let deArataLaFinal = [];
function arataCastigurileAsteptate() {
  // Același lucru primit de mai multe ori în discuție (trei pâini, una câte una) se adună într-un singur „+3”
  const lista = [];
  for (const c of deArataLaFinal) {
    const la = lista.find((x) => x.tip === c.tip && x.id === c.id);
    if (la) la.n += c.n;
    else lista.push({ ...c });
  }
  deArataLaFinal = [];
  arataCastiguri(lista);
}
function inregistreazaCastig(c) {
  const la = castiguri.find((x) => x.tip === c.tip && x.id === c.id);
  if (la) la.n += c.n;
  else castiguri.push({ ...c });
}
function arataCastiguri(lista) {
  if (!lista.length) return;
  // Un rând care abia a pornit (o misiune terminată chiar de muncă) primește bucățile noi lângă ale lui,
  // ca să nu urce două rânduri unul peste altul
  const vechi = ui.querySelector('.castiguri');
  const rand = vechi && Date.now() - vechi.dataset.t < 400 ? vechi : div('castiguri');
  for (const c of lista.filter((x) => x.n !== 0)) {
    // Și ce pierde Vale se vede, cu roșu (Kaia află de capcanele vândute orcilor: −1 încredere, decis de autor)
    const bucata = div(c.n < 0 ? 'castig pierdere' : 'castig');
    bucata.append(div('numar-castig', c.n < 0 ? `−${-c.n}` : `+${c.n}`));
    if (c.tip === 'bani') bucata.append(iconita('monede', '🪙'));
    else if (c.tip === 'incredere') {
      bucata.append(iconita('incredere', '◆'));
      bucata.title = personaje.get(c.id)?.nume || c.id;
      // Al cui e încrederea, pe scurt („Bram”, „F. Elian”)
      const p = personaje.get(c.id);
      bucata.append(div('nume-castig', p?.numeScurt || p?.nume?.split(' ')[0] || ''));
    } else bucata.append(iconitaObiect(inventar, c.id));
    rand.append(bucata);
  }
  if (rand === vechi) return;
  rand.dataset.t = Date.now();
  ui.append(rand);
  setTimeout(() => rand.remove(), 3200);
}

function actualizeazaHud() {
  // Pașii misiunilor se bifează singuri după orice schimbare (lemn adunat, acoperiș reparat, dialog)
  const terminate = actualizeazaMisiuni(joc);
  if (dialog?.activ()) deArataLaFinal.push(...castiguri);
  else if (terminate.length) arataCastiguri(castiguri);
  castiguri = [];
  const ctx = context(stare);
  ceasHud.textContent = t('{zi}, ziua {n} · {ora} · {moment}', { zi: numeZi(ctx.ziSaptamana), n: ziua(stare), ora: formatOra(stare), moment: numeMoment(ctx.moment) });
  const bani = div('rand-monede');
  bani.append(iconita('monede', '🪙'), Object.assign(div('bani-hud', String(stare.bani)), { title: t('Monede') }), div('despartitor'), div('taxa-hud', textTaxa()));
  const d = stare.datorieBlanuri;
  // Cu panoul închis, butonul arată totuși când ceva e grav (o nevoie scăzută sau taxa de azi)
  const zileTaxa = stare.taxa.zi - ziua(stare);
  const grav = NEVOI.some(([cheie]) => stare.nevoi[cheie] < cfg.nevoi.prag) || (!stare.taxa.platita && zileTaxa <= 0);
  const b = butonHud('vale', '👤', 'Vale', comutaPanoul);
  b.classList.toggle('apasat', panouDeschis);
  b.classList.toggle('avertizare', grav && !panouDeschis);
  // Sub butonul lui Vale, câte un pătrățel cu fața fiecăruia care a spus da la Groapă (decis de autor: să vezi cine
  // vine cu tine); fața e cea din portretul de dialog, ca în medalioanele din luptă
  const aliati = aliatiGroapa(joc).map((id) => {
    const p = personaje.get(id);
    const x = div('buton buton-hud aliat-hud');
    x.title = t('{nume} vine cu tine în Groapă', { nume: p?.nume || id });
    // „x” din colț (decis de autor): îl scoate; ca să vină din nou, trebuie întrebat din nou (o întrebare scurtă în
    // meniul lui, cât e „scos”, în dialoguri.json)
    const scoate = buton('×', 'scoate-aliat', (e) => {
      e.stopPropagation();
      stare.stari[`groapa_aliat_${id}`] = 'scos';
      salveaza();
      actualizeazaHud();
    });
    scoate.title = t('Scoate-l pe {nume}', { nume: p?.nume || id });
    x.append(elementImagine([`portraits/${id}_normal.png`], { clasa: 'fata-aliat-hud', raport: 1, eticheta: p?.nume || id }), scoate);
    return x;
  });
  butonVale.replaceChildren(b, ...(aliati.length ? [div('aliati-hud')] : []));
  butonVale.querySelector('.aliati-hud')?.append(...aliati);
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
      // Numele și cifra stau peste bară, ca bara să fie lungă
      rand.append(cale, div('eticheta', eticheta()), div('valoare', String(v)));
      return rand;
    }),
    bani,
    // Datoria de blăni (pedeapsa orcilor) are rândul ei, ca să nu se piardă printre celelalte
    ...(d ? [div('datorie-hud', t('Orcii vor {n} {obiecte} până în ziua {zi}', { n: d.cate, obiecte: cfg.pedepse.tipuri.blanuri.numePlural, zi: d.panaLaZiua }))] : []),
  );
}

function textTaxa() {
  if (stare.taxa.platita) return t('Taxa e plătită');
  const zile = stare.taxa.zi - ziua(stare);
  if (zile <= 0) return t('Taxa ({suma}) e azi!', { suma: sumaTaxa() });
  // Propoziții întregi (nu bucăți lipite), ca engleza să-și poată pune singură cuvintele în ordinea ei
  if (zile === 1) return stare.taxa.dubla ? t('Taxa peste {n} zi (dublă!)', { n: zile }) : t('Taxa peste {n} zi', { n: zile });
  return stare.taxa.dubla ? t('Taxa peste {n} zile (dublă!)', { n: zile }) : t('Taxa peste {n} zile', { n: zile });
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
      anuntLaLiber(cfg.taxa.textRatare);
    }
    t.zi += cfg.taxa.intervalZile;
    t.platita = false;
  }
  // Blănurile cerute de orci: dacă a trecut termenul și nu le-ai adus, taxa următoare se dublează
  const d = stare.datorieBlanuri;
  if (d && ziua(stare) > d.panaLaZiua) {
    stare.datorieBlanuri = null;
    t.dubla = true;
    anuntLaLiber(cfg.pedepse.tipuri.blanuri.textRatat);
  }
}

function platesteTaxa() {
  const taxa = stare.taxa;
  // Suma de dinainte de plată: după plată taxa nu mai e dublă, iar mesajul arăta suma simplă
  const suma = sumaTaxa();
  if (taxa.platita) return mesaj(t('Taxa e deja plătită pentru săptămâna asta.'));
  if (stare.bani < suma) return mesaj(t('Îți trebuie {n} monede.', { n: suma }));
  stare.bani -= suma;
  sunet.efect('monede');
  taxa.platita = true;
  taxa.dubla = false;
  salveaza();
  actualizeazaHud();
  mesaj(t('Ai plătit taxa ({n} monede).', { n: suma }));
}

// „Drumul trezirii” (decis de autor): cât lipsește Vale șase zile, taxa săptămânii o plătește mama, cu banii lăsați de
// el; fără anunț, pentru că o spune dialogul. Dacă era deja plătită, nu se mai ia nimic. „semn”: starea pusă când a
// plătit chiar ea (la întoarcere, mama povestește că i-a dat banii orcului pe fereastră)
function taxaPrinMama(semn) {
  const taxa = stare.taxa;
  if (taxa.platita || stare.bani < sumaTaxa()) return;
  stare.bani -= sumaTaxa();
  taxa.platita = true;
  taxa.dubla = false;
  if (semn) stare.stari[semn] = 'platita';
}

// În ziua taxei, de la ora colectorului, orcul vine la casa lui Vale (o singură dată pe zi)
function verificaColectorul() {
  const t = stare.taxa;
  const ctx = context(stare);
  // Doar acasă la Vale („casa” și locurile ei), nu și la casa lui Finn („casa_finn”), care începe la fel
  const acasa = stare.scena === 'casa' || stare.scena.startsWith('casa.');
  if (t.platita || t.colectorZi === ctx.zi || ctx.zi !== t.zi || !acasa) return false;
  if (ctx.minuteZi < inMinute(cfg.taxa.oraColector)) return false;
  t.colectorZi = ctx.zi;
  dialogTaxa(cfg.taxa.textColector, 'acasa');
  return true;
}

// Discuția cu colectorul: acasă (în ziua taxei) și la poartă (când îl apeși). Suma se scrie din cod,
// pentru că poate crește (de exemplu după bătaia din tavernă). „unde” (acasa / poarta) se ține minte la reluare:
// după un refresh, discuția taxei se redeschide de la capăt, cu textul locului
function dialogTaxa(text, unde = 'poarta') {
  // Ce mai poate face Vale la colector, scris în date (dialogul „orc_colector”: opțiunile, cu condiții, și nodurile
  // lor): de exemplu să-i vândă capcanele desfăcute cu Kaia (decis de autor). Lângă plata taxei, nu în locul ei
  const extra = dialoguri.orc_colector;
  const ctx = context(stare);
  // Și pașii de misiune care sunt la el („la”: colectorul; „Inelul mamei”), cu semnul lor, ca la ceilalți
  // (decis de autor: „?” auriu deasupra colectorului); nodurile lor vin din dialogul misiunii și din al lui
  const misiuni = optiuniMisiuni(joc, 'orc_colector');
  const noduriMisiuni = Object.assign({}, ...misiuni.map((x) => dialoguri[x.dialog]?.noduri));
  const optiuni = [
    ...misiuni.map((x) => x.alegere),
    ...(extra?.optiuni || []).filter((o) => verifica(o.conditii, ctx)).map(({ text, spre, efecte }) => ({ text, spre, efecte })),
  ];
  const d = stare.datorieBlanuri;
  const tb = cfg.pedepse.tipuri.blanuri;
  // Blănurile datorate se predau în aceeași vizită, lângă taxă, nu în locul ei (acasă colectorul pleca fără taxă și
  // nu mai venea în ziua aceea)
  const blanuri = d && inventar.numar(stare.inventar, d.obiect) >= d.cate ? [{ text: t('Predă {n} {obiecte}', { n: d.cate, obiecte: tb.numePlural }), efecte: { predaBlanuri: true }, spre: 'taxa_blanuri' }] : [];
  const platita = stare.taxa.platita;
  const plata = platita
    ? [...optiuni, { text: t('Plec.'), spre: null }]
    : [
        { text: t('Plătește ({n} monede)', { n: sumaTaxa() }), conditii: { bani: { min: sumaTaxa() } }, efecte: { plataTaxa: true }, spre: null },
        ...optiuni,
        { text: t('Nu am bani acum.'), spre: null },
      ];
  const ox = (emotie, txt, alegeri) => ({ vorbitor: 'orc_colector', emotie, text: txt, ...(alegeri ? { alegeri } : {}) });
  // Nodurile din cod au nume unice („taxa_”): altfel reluarea le confunda cu nodurile altor dialoguri
  const noduri = {
    taxa_c: platita
      ? ox('rade', blanuri.length ? tb.textColector : cfg.taxa.textColectorPlatit, blanuri.length || optiuni.length ? [...blanuri, ...plata] : null)
      : ox('normal', text, [...blanuri, ...plata]),
    taxa_blanuri: { ...ox('rade', tb.textPredat), ...(platita && !optiuni.length ? {} : { urmator: 'taxa_dupa' }) },
    taxa_dupa: ox('normal', platita ? cfg.taxa.textColectorPlatit : cfg.taxa.textDupaBlanuri, plata),
  };
  dialog.porneste({ partener: 'orc_colector', start: 'taxa_c', _taxa: unde, noduri: { ...noduriMisiuni, ...(extra?.noduri || {}), ...noduri } });
}

// ---------- pedepsele orcilor ----------
// Când Vale le stă în cale, orcii îl pedepsesc. Dacă azi „sunt binevoitori” (o șansă), îl lasă să-și aleagă
// pedeapsa; altfel o aleg ei, la întâmplare dintre cele care se pot aplica acum (config.json, „pedepse”)
function obiecteDePredat() {
  // Darul mamei (fierul tatei) nu-l iau orcii: dacă în rucsac nu e altceva, pedeapsa „obiect” iese din listă, ca la
  // rucsacul gol (altfel se pierdea fără o vorbă și se recâștiga la zaruri pe 2 monede)
  return [...new Set(stare.inventar.map((x) => x.id))].filter((id) => inventar.def(id).tip !== 'poveste' && !inventar.def(id).faraConfiscare);
}

function pedepsePosibile() {
  const z = ziua(stare);
  const tx = stare.taxa;
  // Cât poarta e închisă (fierul lui Bram nerecuperat), blănurile se predau doar acasă, la vizita din ziua taxei:
  // pedeapsa cu blănuri se dă doar dacă vizita aceea mai vine în termen (altfel taxa se dubla sigur)
  const poartaInchisa = stare.misiuni.bram_fier !== 'terminata' && stare.stari.poarta_deschisa !== 'da';
  const vineAcasa = tx.zi >= z && tx.zi - z <= cfg.pedepse.tipuri.blanuri.zile && !tx.platita && tx.colectorZi !== tx.zi;
  return Object.entries(cfg.pedepse.tipuri)
    .filter(([id]) => (id !== 'obiect' || obiecteDePredat().length) && (id !== 'blanuri' || (!stare.datorieBlanuri && (!poartaInchisa || vineAcasa))))
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

// „nume”: orcul fără nume propriu din patrule vorbește ca „Orc” (cu portretele paznicului)
function dialogPedeapsa(cine, tip, nume) {
  const p = cfg.pedepse;
  const posibile = pedepsePosibile();
  const nod = (text, extra = {}) => ({ vorbitor: cine, emotie: 'suparat', text, ...extra });
  // Orcul care scotocește prin casă și nu găsește nimic de luat pleacă; Vale l-a lăsat să caute, deci nu e pedepsit
  // altfel, la întâmplare
  if (tip === 'obiect' && !obiecteDePredat().length) return dialog.porneste({ partener: cine, numePartener: nume, start: 'nimic', noduri: { nimic: nod(p.tipuri.obiect.textNimic, { emotie: 'rade' }) } });
  const noduri = {};
  // Noduri pentru fiecare pedeapsă: textul ei; „obiect” cere să alegi ce predai
  for (const t of posibile) {
    if (t.id === 'obiect') {
      noduri.obiect = nod(t.textAlege, {
        alegeri: obiecteDePredat()
          .slice(0, 8)
          .map((id) => ({ text: inventar.def(id).nume, efecte: { pedeapsaAplicata: { id: 'obiect', obiect: id } }, spre: null })),
      });
    } else {
      // „gand”: ce pățește Vale se spune în gândul lui, după vorbele orcului (biciul), nu în gura orcului
      noduri[t.id] = nod(t.text, { efecte: { pedeapsaAplicata: { id: t.id } }, ...(t.gand ? { urmator: `${t.id}_gand` } : {}) });
      if (t.gand) noduri[`${t.id}_gand`] = { vorbitor: 'vale', gand: true, emotie: 'ranit', text: t.gand };
    }
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
      noduri.obiect = nod(t.textIau.replace('{obiect}', (limbaJoc() === 'ro' ? inventar.def(ales).nume.toLowerCase() : inventar.def(ales).nume)), { efecte: { pedeapsaAplicata: { id: 'obiect', obiect: ales } } });
    }
  }
  dialog.porneste({ partener: cine, numePartener: nume, start, noduri });
}

// Pornită dintr-un efect (o alegere din dialog sau o luptă pierdută): așteaptă să se închidă ce e pe ecran
function pedeapsa(cine) {
  const incearca = () => {
    if (dialog.activ() || secventa.activa() || lupta.activa()) return setTimeout(incearca, 150);
    // Valoarea efectului: true / id-ul orcului / { cine, tip, nume }
    const o = typeof cine === 'object' && cine ? cine : { cine };
    dialogPedeapsa(o.cine === true || !o.cine ? 'paznic_orc_1' : o.cine, o.tip, o.nume);
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
  if (de?.laPlecare && de.id !== id) aplicaEfecte(de.laPlecare, joc);
  stare.scena = id;
  if (spre.parinte === de.id) sunet.efect(spre.tip === 'loc' ? 'usa' : 'pasi');
  // Doar coborârea (spre o zonă sau un loc) costă timp; „Înapoi” e gratuit
  if (!faraTimp && spre.parinte === de.id) {
    if (avanseaza(costTimp(stare, spre.tip === 'loc' ? cfg.timp.spreLoc : cfg.timp.spreZona, cfg.nevoi))) return;
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

// „siPeLoc” la un eveniment (cerut de autor: seara cu cercurile din pivniță): pornește și când Vale e deja acolo și
// se împlinesc condițiile pe loc (trece de ora 22 cât stă în pivniță), nu doar când ajunge. Se verifică după fiecare
// redesenare a scenei, deci și după ce trece timpul; cât e deschis altceva (o discuție, imagini, o luptă), așteaptă
function verificaEvenimentePeLoc() {
  // Un mini-joc pornit dintr-o discuție (furișatul la cuști) nu e un dialog, iar condițiile evenimentului sunt încă
  // îndeplinite: fără verificarea „reluare”, evenimentul pornea încă o dată în spatele lui (de două ori timpul și
  // stamina, iar un refresh relua evenimentul, nu furișatul). tineMinteMiniJocul pune reluarea înainte ca verificarea
  // programată de afiseaza să ruleze
  if (dialog.activ() || secventa.activa() || stare.luptaInCurs || stare.reluare?.furisare || stare.reluare?.miniJoc || stare.reluare?.antrenament) return;
  const ev = alegeEveniment(evenimente.filter((e) => e.siPeLoc), stare, context(stare), cfg.categoriiEvenimente);
  if (ev) pornesteEveniment(ev.id);
}

// Visul care vine după un somn (sau niciunul): „laTrezire”, cu condițiile lui și destule ore de noapte dormite
function visulDupaSomn(minuteNoapte) {
  const ctx = context(stare);
  const destul = (ev) => minuteNoapte >= (ev.oreNoapte ?? cfg.somn?.oreNoaptePentruVis ?? 4) * 60;
  return evenimente.find((ev) => ev.laTrezire && destul(ev) && verifica(ev.conditii, ctx) && poateReveni(ev, stare.evenimente[ev.id], ziua(stare))) || null;
}

// „fortat” (din panoul debug): pornește și un eveniment care s-a întâmplat deja
function pornesteEveniment(id, fortat = false) {
  const ev = evenimente.find((e) => e.id === id);
  if (!ev || dialog.activ() || secventa.activa() || seDescarcaFilmul) return;
  // Și un eveniment pornit dintr-un efect respectă „repetare” (întâlnirea cu vânătoarea e o singură dată)
  if (!fortat && !poateReveni(ev, stare.evenimente[ev.id], ziua(stare))) return;
  noteazaEveniment(stare, ev, ziua(stare));
  stare.reluare = { eveniment: ev.id };
  salveaza();
  // Sunetul de început și la evenimentele ale căror imagini stau sub replici (scandalul din tavernă)
  const subReplici = Object.values(dialoguri[ev.dialog]?.noduri || {}).some((n) => n.imagine);
  if (ev.imagini?.length || subReplici) sunet.efect('eveniment');
  // Întâi imaginile (dacă are), apoi textul cu alegeri sau un dialog întreg;
  // un eveniment fără text (de exemplu după înfrângere) doar își aplică efectele
  secventa.arata(ev.imagini, () => {
    if (ev.dialog) {
      aplicaEfecte(ev.efecte, joc);
      actualizeazaHud();
      return cuFilmele(ev.dialog, () => vorbesteCu(null, ev.dialog));
    }
    // „vorbesteCu”: după efecte, discuția obișnuită cu un personaj care tocmai a apărut (contrabandistul, după
    // așteptarea pe scăunel), ca și cum Vale l-ar fi apăsat: cu meniul, misiunile și intrarea în carte
    if (ev.vorbesteCu) {
      aplicaEfecte(ev.efecte, joc);
      stare.reluare = null;
      salveaza();
      afiseaza();
      return vorbesteCu(ev.vorbesteCu);
    }
    if (ev.text || ev.alegeri?.length) return dialog.porneste({ ...caDialog(ev), _eveniment: ev.id });
    aplicaEfecte(ev.efecte, joc);
    stare.reluare = null;
    salveaza();
    afiseaza();
  });
  return true;
}

// Visele cu filmuleț (decis de autor): filmulețul se descarcă întreg înainte să pornească visul, ca să nu se oprească
// apoi la jumătate ca să se mai încarce. Dacă durează, un ecran arată cât s-a descărcat (ca la pornirea jocului);
// dacă e gata repede (sau era descărcat dinainte, în timpul somnului), ecranul nici nu apare
let seDescarcaFilmul = false;
function cuFilmele(idDialog, apoi, deLaNod) {
  const d = dialoguri[idDialog];
  // Un dialog lung, cu visul spre capăt („filmLa”: „Drumul trezirii”, cu vreo 75 de replici înainte de vis): filmulețul
  // se descarcă pe fundal cât merg replicile de dinainte, iar discuția îl așteaptă abia la începutul visului, dacă nu e
  // gata (dialog.js). După un refresh, doar dacă visul mai e înainte
  if (d?.filmLa) {
    filmeleDeLa(d, deLaNod).forEach(preincarcaFilm);
    return apoi();
  }
  const filme = filmeleDialogului(d);
  if (!filme.length) return apoi();
  ecranFilme(filme, apoi);
}
// Ecranul „Se pregătește visul... %”, până se descarcă filmulețele cerute; dacă sunt gata repede, nici nu apare
function ecranFilme(filme, apoi) {
  seDescarcaFilmul = true;
  let ecran = null;
  let umplere = null;
  let text = null;
  const arata = setTimeout(() => {
    ecran = div('ecran-incarcare');
    text = div('text-incarcare', t('Se pregătește visul...'));
    const bara = div('bara-incarcare');
    umplere = div('umplere-incarcare');
    bara.append(umplere);
    ecran.append(text, bara);
    ui.append(ecran);
  }, 250);
  const ceas = setInterval(() => {
    if (!ecran) return;
    const p = progresFilme(filme);
    umplere.style.width = `${p * 100}%`;
    text.textContent = t('Se pregătește visul... {procent}%', { procent: Math.round(p * 100) });
  }, 100);
  Promise.all(filme.map(preincarcaFilm)).then(() => {
    clearTimeout(arata);
    clearInterval(ceas);
    seDescarcaFilmul = false;
    if (ecran) {
      ecran.classList.add('gata');
      setTimeout(() => ecran.remove(), 400);
    }
    apoi();
  });
}

// După un refresh: lupta în curs o ia de la capăt, discuția continuă de la replica la care rămăsese,
// iar un eveniment oprit în timpul imaginilor se arată din nou (efectele lui nu se aplicaseră încă)
function reiaDupaReincarcare() {
  if (stare.luptaInCurs) return joc.pornesteLupta(stare.luptaInCurs);
  const r = stare.reluare;
  if (!r) return;
  // Un mini-joc își păstrează reluarea până o pune din nou el (la pornirea lui): altfel verificarea evenimentelor de
  // pe loc, programată de afiseaza la pornire, vedea reluarea goală și pornea încă o dată evenimentul din spatele lui
  if (r.miniJoc) return miniJocEveniment(r.miniJoc);
  if (r.furisare) return furisare(r.furisare);
  if (r.antrenament) return antrenament(r.antrenament);
  stare.reluare = null;
  // Acasă colectorul „bate din nou” (colectorZi e deja pus, deci altfel nu mai venea în ziua aceea)
  if (r.taxa) return dialogTaxa(r.taxa === 'acasa' ? cfg.taxa.textColector : cfg.taxa.textColectorPoarta, r.taxa);
  if (r.dialog && dialoguri[r.dialog]?.noduri?.[r.nod]) return cuFilmele(r.dialog, () => dialog.porneste(dialoguri[r.dialog], { delaNod: r.nod, imagine: r.imagine }), r.nod);
  // Replica unei misiuni a altcuiva, din meniul personajului (pașii „Steagului satului” la Roderick stau în dialogul
  // Miriamei): discuția continuă tot cu el, cu replicile misiunii adăugate, și își ține minte mai departe locul
  const alMisiunii = r.dialog && dialoguri[r.dialog] && Object.values(dialoguri).find((d) => d.noduri?.[r.nod]);
  if (alMisiunii) {
    const d = { ...dialoguri[r.dialog], noduri: { ...alMisiunii.noduri, ...dialoguri[r.dialog].noduri } };
    iduriDialog.set(d, r.dialog);
    return dialog.porneste(d, { delaNod: r.nod, imagine: r.imagine });
  }
  const ev = r.eveniment && evenimente.find((e) => e.id === r.eveniment);
  if (!ev) return;
  if (r.text) return dialog.porneste({ ...caDialog(ev), _eveniment: ev.id }, { delaNod: 'e' });
  pornesteEveniment(ev.id, true);
}

// Pornit dintr-un efect: așteaptă să se închidă dialogul sau lupta din care a venit
function pornesteEvenimentDupa(id) {
  setTimeout(() => pornesteEveniment(id), 0);
}

// Furișatul (lada colectorului): după replica de pe imagine, Vale alege pe unde o ia; discuția continuă de la nodul
// potrivit. Cu mini-jocurile oprite din Opțiuni, trece singur (ca la celelalte, fără risc)
function furisare(v) {
  setTimeout(async () => {
    tineMinteMiniJocul({ furisare: v });
    const r = miniJocuriPornite() ? await actiuni.mini.furisare(`furis_${v.eveniment}_${v.pas}`, v.indemn) : 'sigur';
    const d = dialoguri[v.dialog];
    if (d) dialog.porneste(d, { delaNod: r === 'sigur' ? v.reusit : v.esuat });
  }, 0);
}

// Un mini-joc pornit din discuție începe după ce discuția s-a închis (care a șters „reluare”): îl ținem minte noi, ca
// un refresh în timpul lui să-l pornească din nou, nu să lase misiunea fără continuare (cerut de autor: o misiune nu
// are voie să se blocheze). Discuția de după el își scrie singură, la prima replică, locul ei
function tineMinteMiniJocul(r) {
  stare.reluare = r;
  salveaza();
}

// Un mini-joc pornit din discuție, peste o imagine a evenimentului (decis de autor): bara de la arat la capcanele
// Kaiei („miniJoc” la eveniment: câte reușite trebuie, câte ratări ai voie, textele), iar la forja lui Bram mai
// multe, pe nume („miniJocuri”, ales cu „joc” la efect): foalele în ritm (ca la muls) și ciocanul pe inel (ca la
// lemne). Discuția continuă de la „reusit” sau de la „esuat”. Cu mini-jocurile oprite din Opțiuni, reușește singur,
// ca la furișat (fără risc)
function miniJocEveniment(v) {
  const ev = evenimente.find((e) => e.id === v.eveniment);
  const m = v.joc ? ev?.miniJocuri?.[v.joc] : ev?.miniJoc;
  if (!m) return;
  const idEcran = v.joc ? `minijoc_${ev.id}_${v.joc}` : `minijoc_${ev.id}`;
  const titlu = m.titlu || ev.nume;
  const joaca = () => {
    if (m.tip === 'muls') return actiuni.mini.muls({ imagine: m.imagine, titlu, idEcran, indemn: m.indemn, texte: m.texte }).then((s) => s >= (m.minim ?? 0));
    if (m.tip === 'cerc')
      return actiuni.mini.cerc({ imagine: m.imagine, titlu, idEcran, indemn: m.indemn, incercari: m.incercari, sunet: m.sunet, imagineLovitura: m.imagineLovitura }).then((n) => n >= (m.minim ?? 0));
    return actiuni.mini.arat({ imagine: m.imagine, titlu, idEcran, indemn: m.indemn, reusiteCerute: m.reusite, rateuriVoie: m.ratari ?? 0, texte: m.texte });
  };
  setTimeout(async () => {
    tineMinteMiniJocul({ miniJoc: v });
    const bine = miniJocuriPornite() ? await joaca() : true;
    // Capcana care se închide (decis de autor: a doua ratare): sunetul ei, chiar când se termină jocul
    if (!bine && m.sunetEsuat) sunet.efect(m.sunetEsuat);
    const d = dialoguri[v.dialog];
    if (d) dialog.porneste(d, { delaNod: bine ? v.reusit : v.esuat, cuEfecte: true });
  }, 0);
}

// Antrenamentul cu Roderick (decis de autor): mini-jocul lemnelor peste prima imagine a evenimentului (Vale se
// pregătește să lovească manechinul), iar la fiecare lovitură reușită se vede o clipă a doua imagine (lovitura); la
// ratare, nu. Cu mini-jocurile oprite, cele două imagini una după alta, și ziua contează. Ziua de antrenament contează
// doar cu destule lovituri reușite („reusiteMin”); apoi Roderick spune ce crede (dialogul din „antrenament”)
function antrenament(idEv) {
  const ev = evenimente.find((e) => e.id === idEv);
  const a = ev?.antrenament;
  if (!a) return;
  setTimeout(async () => {
    tineMinteMiniJocul({ antrenament: idEv });
    noteazaEveniment(stare, ev, ziua(stare));
    let reusite;
    if (miniJocuriPornite()) {
      reusite = await actiuni.mini.cerc({
        imagine: ev.imagini[0],
        imagineLovitura: ev.imagini[1],
        titlu: a.titlu || ev.nume,
        idEcran: `minijoc_${ev.id}`,
        sunet: a.sunet,
        indemn: a.indemn,
      });
    } else {
      sunet.efect('eveniment');
      await new Promise((r) => secventa.arata(ev.imagini, r));
      reusite = a.reusiteMin ?? 2;
    }
    const bine = reusite >= (a.reusiteMin ?? 2);
    aplicaEfecte({ marcheaza: a.marcaj, nevoi: { stamina: -(a.stamina || 0) }, stare: { [a.stareRezultat]: bine ? 'bun' : 'slab' }, ...(bine ? { contor: { [a.contor]: 1 } } : {}) }, joc);
    if (avanseaza(a.minute || 0)) return;
    salveaza();
    afiseaza();
    vorbesteCu(null, a.dialog);
  }, 0);
}

function activeaza(tinta, ctx) {
  // Un loc poate avea mai multe lacăte, fiecare cu gândul lui (camera fierarului: fără cheie / el doarme);
  // primul care nu e îndeplinit spune de ce nu se intră
  const lacat = [].concat(tinta.incuiat || []).find((l) => !verifica(l.conditii, ctx));
  if (lacat) {
    if (tinta.spre) sunet.efect('usa_incuiata');
    return gand(lacat.mesaj || t('E încuiat.'));
  }
  if (tinta.act) return actiuni.executa(tinta.act);
  if (tinta.vanatoare) return vaneaza(tinta.vanatoare);
  if (tinta.groapa) return groapa.deschide(tinta.groapa);
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

// „cuCine”: vânătoarea pornită din dialog, împreună cu cineva (Kaia, dimineața la campsite): el e sigur
// alături în luptă, fără întâlnirile din poveste și fără discuția de la vânătoare (s-au vorbit deja)
function vaneaza(v, cuCine = null) {
  // Noaptea nu se vânează (decis de autor): doar gândul lui Vale
  if (v.gandNoapte && context(stare).moment === 'noaptea') return gand(v.gandNoapte);
  // „insotitor”: cineva care vânează și el în aceeași perioadă (Kaia, 10–14) te poate găsi și luptă cu tine.
  // Se verifică la ora la care pleci la vânătoare, înainte să treacă timpul
  const i = cuCine ? { personaj: cuCine } : v.insotitor;
  const cuInsotitor = !!cuCine || (i && verifica(i.conditii, context(stare)) && Math.random() < (i.sansa ?? 0));
  // „intalnire”: o întâlnire din poveste care ține locul vânătorii obișnuite cât sunt îndeplinite condițiile
  // (Kaia față în față cu lupii, decis de autor)
  const intalnire = !cuCine && v.intalnire && verifica(v.intalnire.conditii, context(stare));
  if (avanseaza(costTimp(stare, v.minute ?? 60, cfg.nevoi))) return;
  if (intalnire) {
    salveaza();
    afiseaza();
    return pornesteEveniment(v.intalnire.eveniment, true);
  }
  // Fiecare vânătoare obișnuită contează (după ce a lăsat-o pe Kaia singură, Vale trebuie să mai vâneze o dată)
  aplicaEfecte({ contor: { vanatori: 1, vanatori_dupa_refuz: 1 } }, joc);
  salveaza();
  afiseaza();
  const id = alegeCuSanse(v.lupte);
  const def = date.lupte.lupte[id];
  let lupta = cuInsotitor ? { ...def, aliati: [...(def.aliati || []), { id: i.personaj }] } : id;
  // Vânătoarea pornită de la campsite (decis de autor): după luptă, un scurt dialog cu Kaia, apoi ea se întoarce
  // în pădure, iar Vale rămâne în tabără (înfrângerea nu-l mai trimite altundeva)
  if (cuCine && v.dupaCuInsotitor) {
    const cu = (parte, eveniment) => ({ ...parte, efecte: { ...(parte?.efecte || {}), eveniment } });
    lupta = { ...lupta, victorie: cu(def.victorie, v.dupaCuInsotitor.victorie), infrangere: { ...def.infrangere, efecte: { eveniment: v.dupaCuInsotitor.infrangere } } };
  }
  // Lupta e hotărâtă: se ține minte de acum, nu abia când pornește, ca un refresh în imaginea de 3 secunde sau în
  // discuția cu Kaia să n-o piardă (timpul și vânătoarea s-au numărat deja)
  stare.luptaInCurs = lupta;
  salveaza();
  secventa.arata(
    [v.imagine],
    () => {
      if (!cuInsotitor || !dialoguri[i.dialog]) return joc.pornesteLupta(lupta);
      // Întâi discuția dintre ei, apoi lupta împreună
      dupaDialog = () => joc.pornesteLupta(lupta);
      dialog.porneste(dialoguri[i.dialog]);
    },
    { automat: (v.secunde ?? 3) * 1000, text: v.text || t('Cauți urme de vânat...') },
  );
}
// Vânătoarea de la locul de vânătoare al pădurii, cu un personaj alături (efectul „vanatoareCu”)
function vanatoareCu(id) {
  const loc = date.locations.zone.find((z) => z.id === 'padure')?.locuri?.find((l) => l.vanatoare);
  if (!loc) return;
  dupaDialog = () => vaneaza({ ...loc.vanatoare, imagine: loc.imagine }, id);
}
// O luptă din poveste care pornește ca vânătoarea obișnuită (decis de autor: lupul negru), ca să nu sară direct
// în luptă: imaginea adâncului pădurii stă câteva secunde, apoi lupta; trece și timpul vânătorii
function luptaVanatoare(id) {
  const loc = date.locations.zone.find((z) => z.id === 'padure')?.locuri?.find((l) => l.vanatoare);
  const v = loc?.vanatoare || {};
  dupaDialog = () => {
    if (avanseaza(costTimp(stare, v.minute ?? 60, cfg.nevoi))) return;
    // Ca la vânătoarea obișnuită: lupta se ține minte de când e hotărâtă, ca un refresh în imagine să n-o piardă
    stare.luptaInCurs = id;
    salveaza();
    afiseaza();
    secventa.arata([loc?.imagine].filter(Boolean), () => joc.pornesteLupta(id), { automat: (v.secunde ?? 3) * 1000, text: v.text || t('Cauți urme de vânat...') });
  };
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
  if (!id || !personaje.get(id)?.carte || stare.cunoscuti.includes(id)) return;
  stare.cunoscuti.push(id);
  // Ziua primei discuții: misiunile unui personaj apar abia după câteva zile de la ea (decis de autor)
  (stare.cunoscutLa ||= {})[id] = ziua(stare);
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
  // „!” deasupra lui pentru o misiune care pornește dintr-un eveniment: apăsarea pe el o pornește (la sosire putea să
  // fi pornit alt eveniment, de exemplu orcul de la fierărie, iar Vale a rămas pe loc)
  const oferit = evenimentOferit(joc, id);
  if (oferit) return pornesteEveniment(oferit.id);
  // Colectorul de la poartă nu are un dialog scris: cere taxa
  if (p?.dialogTaxa) return dialogTaxa(cfg.taxa.textColectorPoarta, 'poarta');
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
  sunet,
  // Gândul lui Vale (dialog cu portretul lui), ca la ușile închise
  gand,
  // Butonul de ecran complet din HUD, ca să apară și peste cartea prologului (cerut de autor), în colțul dreapta-sus
  // Cartea îl face o singură dată, când se deschide, iar limba se alege chiar din ea: eticheta lui urmează limba cât
  // butonul e pe ecran, apoi ascultătorul se scoate singur
  butonEcranComplet: () => {
    const b = butonHud('ecran', '⤢', t('Ecran complet'), comutaEcranComplet);
    const opreste = laSchimbareaLimbii(() => {
      if (b.isConnected) b.title = t('Ecran complet');
      else opreste();
    });
    return b;
  },
  // Un dialog, iar după el ce urmează (gândul lui Vale la intrarea în Groapă, apoi panoul ei)
  dialogApoi: (d, dupa) => {
    dupaDialog = dupa;
    dialog.porneste(d);
  },
  // Imagini pe tot ecranul (munca, ca ecranul de încărcare de la vânătoare)
  arataImagini: (imagini, gata, opt) => secventa.arata(imagini, gata, opt),
  date,
  lume,
  evenimente,
  avanseaza,
  mesaj,
  mergi,
  pornesteEveniment,
  antrenament,
  pornesteEvenimentDupa,
  furisare,
  miniJocEveniment,
  vanatoareCu,
  luptaVanatoare,
  sumaTaxa,
  taxaPrinMama,
  // Magazinul unui personaj (npcs.json, „magazin”), deschis după ce se închide dialogul
  // „hangita.schimburi”: al doilea magazin al cuiva („magazine” în npcs.json; Agnes: carnea friptă, decis de autor)
  deschideMagazin(cheie) {
    const [id, al] = cheie.split('.');
    const p = personaje.get(id);
    const m = al ? p?.magazine?.[al] : p?.magazin;
    if (!m) return mesaj(t('{nume} nu are magazin.', { nume: p?.nume || id }));
    setTimeout(() => actiuni.executa({ tip: 'magazin', nume: `${p.nume}`, ...m }), 0);
  },
  salveaza,
  actualizeazaHud,
  platesteTaxa,
  get inventar() {
    return inventar;
  },
  // Primește un obiect; dacă nu încape, întreabă ce face (aruncă ceva sau îl lasă). Întoarce câte au încăput,
  // ca pe ecran să urce doar ce a ajuns în rucsac
  primeste(id, n = 1) {
    const rest = inventar.adauga(id, n);
    if (rest > 0) inventarPlin(id, rest);
    return n - rest;
  },
  folosesteObiect(index) {
    const x = stare.inventar[index];
    const d = inventar.def(x.id);
    inventar.scoate(x.id, 1);
    sunet.efect(d.sunet || (d.efecte?.nevoi?.sete ? 'baut' : 'mancat'));
    aplicaEfecte(d.efecte, joc);
    if (d.minute) avanseaza(d.minute);
    return null;
  },
  deschideInventarul: (opt) => ecranInventar.deschide(opt),
  deschideEcranMagazin: (a) => ecranMagazin.deschide(a),
  dupaInventar() {
    salveaza();
    afiseaza();
    arataDeLuat();
  },
  intreaba,
  inregistreazaCastig,
  // Un obiect de poveste citit din inventar (hârtiile soldatului): dialogul lui, peste imaginea lui
  citeste(idDialog) {
    setTimeout(() => vorbesteCu(null, idDialog), 0);
  },
  // Un eveniment „laTrezire” (un vis) pornește după somn, dacă îi sunt îndeplinite condițiile. Visele vin doar după
  // un somn peste noapte (decis de autor: cel puțin „oreNoaptePentruVis” din 23–05, nu un pui de somn); un vis poate
  // cere mai puțin („oreNoapte” la eveniment): după convoiul Kaiei, Vale se culcă abia spre dimineață
  dupaSomn(minuteNoapte = 0) {
    const vis = visulDupaSomn(minuteNoapte);
    if (!vis) return;
    // Între imaginea somnului și vis e un pas în care nu e nimic pe ecran: anunțurile așteaptă și atunci
    visDeAratat = true;
    setTimeout(() => {
      visDeAratat = false;
      pornesteEveniment(vis.id);
    }, 0);
  },
  // Cât se vede imaginea somnului, filmulețul visului care urmează se descarcă deja (decis de autor: visul nu are
  // voie să se oprească la jumătate); de obicei e gata până se trezește Vale
  pregatesteVisul(minuteNoapte = 0) {
    const vis = visulDupaSomn(minuteNoapte);
    if (vis?.dialog) filmeleDialogului(dialoguri[vis.dialog]).forEach(preincarcaFilm);
  },
  // Ce a adus acțiunea urcă pe ecran, ca prada după vânătoare (decis de autor): monedele și ce mai dă munca,
  // lemnele, apa, florile; plus ce au dat efectele ei (carnea friptă de acasă). Fără câștig, doar mesajul
  dupaActiune(text, castig = []) {
    for (const c of castig) if (c.n > 0) inregistreazaCastig(c);
    const lista = castiguri;
    castiguri = [];
    salveaza();
    afiseaza();
    if (lista.length) arataCastiguri(lista);
    else if (text) mesaj(text);
  },
  pedeapsa,
  aplicaPedeapsa,
  pornesteLupta(id) {
    dialog.inchide();
    // La un refresh în timpul luptei, lupta o ia de la capăt (nu se pierde, cu tot cu ce urmează după ea)
    stare.luptaInCurs = id;
    salveaza();
    lupta.porneste(id);
  },
  pornesteZaruri: () => zaruri.porneste(),
  // Masa regelui (cerut de autor): bătrânul din tavernă, după ce Vale alege cât de tare să joace
  pornesteTafl: (v) => tafl.porneste(v?.nivel),
  // După o luptă în Groapă: banii, prima victorie, inelul mamei (src/groapa.js)
  rezultatGroapa: (v) => groapa.rezultat(v),
  conditii: (c) => verifica(c, context(stare)),
  // Pentru panoul debug (misiunile pornite direct, contoarele)
  aplicaEfecte: (e) => aplicaEfecte(e, joc),
  // O singură replică a unui personaj, ca un dialog scurt (orcii de la masa de zaruri)
  replica(cine, emotie, text) {
    dialog.porneste({ partener: cine, start: 'r', noduri: { r: { vorbitor: cine, emotie, text } } });
  },
  // După masa de zaruri: trece timpul, apoi orcul spune ce crede despre rezultat
  dupaZaruri(text, aCastigat, minute, eveniment) {
    if (avanseaza(minute)) return;
    salveaza();
    afiseaza();
    if (eveniment) return pornesteEvenimentDupa(eveniment);
    joc.replica('paznic_orc_1', aCastigat ? 'suparat' : 'rade', text);
  },
  // După Masa regelui: trece ora partidei, apoi bătrânul spune ce crede despre ea
  dupaTafl(rezultat, minute, cheieReplica = rezultat) {
    if (avanseaza(minute)) return;
    salveaza();
    afiseaza();
    const lista = [].concat(date.config.jocTafl?.replici?.dupa?.[cheieReplica] || date.config.jocTafl?.replici?.dupa?.[rezultat] || []);
    if (lista.length) joc.replica('batran', rezultat === 'castig' ? 'normal' : 'zambet', lista[Math.floor(Math.random() * lista.length)]);
  },
  dupaLupta(efecte, minute) {
    stare.luptaInCurs = null;
    aplicaEfecte(efecte, joc);
    // Prada (carnea, blănurile de la vânătoare) urcă pe ecran, ca la o misiune terminată (decis de autor);
    // dacă lupta duce direct într-o discuție, apare la ultima ei replică
    const prada = castiguri;
    castiguri = [];
    if (dialog.activ()) deArataLaFinal.push(...prada);
    else arataCastiguri(prada);
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
  // Testarea misiunilor (F2 → Resetează): jocul se ține minte în clipa în care începe o misiune, separat de
  // salvare, ca resetarea să șteargă și ce a schimbat misiunea în lume (acoperișul, stările, obiectele, încrederea),
  // nu doar bifa din carte; altfel o misiune terminată nu mai poate fi încercată din nou
  retineInainteDeMisiune(id) {
    try {
      const toate = JSON.parse(localStorage.getItem(`${CHEIE}_inainte_misiuni`) || '{}');
      toate[id] = JSON.parse(JSON.stringify(stare));
      localStorage.setItem(`${CHEIE}_inainte_misiuni`, JSON.stringify(toate));
    } catch {
      // Fără loc în browser: resetarea rămâne doar ștergerea misiunii
    }
  },
  revinoInainteDeMisiune(id) {
    let inainte = null;
    try {
      inainte = JSON.parse(localStorage.getItem(`${CHEIE}_inainte_misiuni`) || '{}')[id];
    } catch {
      inainte = null;
    }
    if (!inainte) return false;
    // Întâi se închide ce era deschis: închiderea discuției șterge „reluare” din stare, iar dacă stare era deja cea
    // de dinainte, se pierdea chiar alegerea la care trebuia să revină discuția
    ecranInventar.inchide();
    dialog.inchide();
    stare = inainte;
    salveaza();
    afiseaza();
    // O misiune pornită în mijlocul unei discuții (șoimul Kaiei, convoiul): discuția revine pe loc la alegerea de
    // atunci, ca să poată fi încercată și cealaltă cale (altfel revenea abia după un refresh)
    reiaDupaReincarcare();
    return true;
  },
  uitaInainteDeMisiuni() {
    try {
      localStorage.removeItem(`${CHEIE}_inainte_misiuni`);
    } catch {
      // nimic de șters
    }
  },
  jocNou() {
    // Momentele ținute minte pentru „Resetează” sunt din jocul vechi: nu trebuie să ducă înapoi în el
    joc.uitaInainteDeMisiuni();
    stare = stareNoua(cfg);
    // Jocul nou începe cu prologul (cerut de autor); se ține minte în salvare, ca după un refresh cartea să revină
    stare.prolog = 'deschis';
    ecranInventar.inchide();
    dialog.inchide();
    salveaza();
    afiseaza();
    deschidePrologul();
  },
};

// Reluarea după un refresh al paginii (cerut de autor: o misiune nu trebuie să se blocheze dacă pagina se
// reîncarcă în mijlocul ei): salvarea ține minte discuția, evenimentul sau lupta în curs
const iduriDialog = new Map(Object.entries(dialoguri).map(([id, d]) => [d, id]));
const dialog = creeazaDialog(ui, {
  laCapatulRamurii: arataCastigurileAsteptate,
  // Orcii au rama roșie (ca inamicii din luptă), ceilalți pe cea aurie
  tabaraVorbitor: (id) => (/orc|sobolan/.test(id) ? 'inamic' : 'aliat'),
  laNod: (d, nod, imagine) => {
    // Discuția taxei (făcută din cod): pe nodurile ei se redeschide de la capăt; pe un nod din date (inelul mamei,
    // capcanele vândute) continuă din dialogul „orc_colector”
    stare.reluare = d._taxa
      ? String(nod).startsWith('taxa_')
        ? { taxa: d._taxa }
        : { dialog: 'orc_colector', nod, imagine }
      : iduriDialog.has(d)
        ? { dialog: iduriDialog.get(d), nod, imagine }
        : d._eveniment
          ? { eveniment: d._eveniment, text: true }
          : null;
    salveaza();
  },
  // Visul din mijlocul unui dialog lung („filmLa”): discuția așteaptă filmulețul doar dacă nu s-a descărcat încă
  asteaptaFilmele: (d, deLa, apoi) => {
    const filme = filmeleDeLa(d, deLa).filter((c) => !filmGata(c));
    if (!filme.length) return apoi();
    ecranFilme(filme, apoi);
  },
  laImagine: (cale) => {
    stare.imaginiVazute ||= [];
    if (!stare.imaginiVazute.includes(cale)) stare.imaginiVazute.push(cale);
  },
  numeVorbitor: (id, d) => (id === 'vale' ? 'Vale' : id === d.partener && d.numePartener ? d.numePartener : personaje.get(id)?.nume || id.replaceAll('_', ' ')),
  emotieVale: () => (stare.nevoi.viata < cfg.nevoi.prag ? 'ranit' : 'normal'),
  verificaConditii: (c) => verifica(c, context(stare)),
  laEfecte: (e) => {
    aplicaEfecte(e, joc);
    actualizeazaHud();
  },
  // Meniul de discuție: „Vorbește” (o replică nouă dacă are, altfel una la întâmplare), misiunile, opțiunile
  // personajului (de exemplu „Cumpără”) și „La revedere”. Replicile de „Vorbește” stau în dialogul principal
  // al personajului, ca să fie aceleași oriunde îl găsești (Miriam acasă și în piață)
  optiuniMeniu: (d) => {
    const ctx = context(stare);
    const id = d.partener;
    const principal = dialoguri[personaje.get(id)?.dialog] || d;
    const alegeri = [];
    const noduri = { ...principal.noduri };
    const replici = (principal.vorbeste || []).filter((x) => verifica(x.conditii, ctx));
    if (replici.length) {
      const auzite = stare.auzite || [];
      const noi = replici.filter((x) => !auzite.includes(`${id}/${x.nod}`));
      const din = noi.length ? noi : replici;
      const x = din[Math.floor(Math.random() * din.length)];
      // „Ce mai faci?” (decis de autor); cei mai în vârstă primesc forma de respect, din npcs.json („intrebareVorba”)
      alegeri.push({ text: personaje.get(id)?.intrebareVorba || t('Ce mai faci?'), spre: x.nod, efecte: { auzit: `${id}/${x.nod}` } });
    }
    for (const { alegere, dialog: idDialog } of optiuniMisiuni(joc, id)) {
      Object.assign(noduri, dialoguri[idDialog]?.noduri);
      alegeri.push(alegere);
    }
    alegeri.push(...(d.optiuni || principal.optiuni || []).filter((a) => verifica(a.conditii, ctx)));
    alegeri.push({ text: t('La revedere.'), inchide: true });
    return { alegeri, noduri };
  },
  laFinal: (d) => {
    stare.reluare = null;
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
const ecranMagazin = creeazaEcranMagazin(ui, joc);
// Un clic pe orice buton sau alegere are sunetul lui (mic, discret)
// Săgețile cărții au doar sunetul paginii (decis de autor), fără clic peste el
addEventListener('click', (e) => e.target.closest?.('.buton, .alegere') && !e.target.closest('.inapoi-carte, .inainte-carte') && sunet.efect('clic'), { capture: true });
const carte = creeazaCarte(ui, joc);
const prologul = creeazaPrologul(ui, joc);
// La un joc nou, cartea se închide cu „Începe povestea” sau „Sari peste”, și de atunci nu mai apare singură
function deschidePrologul() {
  prologul.deschide({
    laFinal: () => {
      stare.prolog = 'citit';
      salveaza();
      // Apoi Vale se trezește din coșmar, cu gândurile lui (cerut de autor: o mică introducere, nu direct în cameră)
      if (dialoguri.inceput_joc && !dialog.activ()) dialog.porneste(dialoguri.inceput_joc);
    },
  });
}
const zaruri = creeazaZaruri(ui, joc);
const tafl = creeazaTafl(ui, joc);
const actiuni = creeazaActiuni(ui, joc);
const lupta = creeazaLupta(ui, joc);
const groapa = creeazaGroapa(ui, joc);

// Ce n-a încăput în rucsac: un singur panou pentru tot (prada venea câte o bucată, cu câte un panou, peste discuția
// Kaiei), arătat abia după ce se închide ce e pe ecran și ținut minte în salvare („deLuat”), ca un refresh să nu-l
// arunce în locul jucătorului
function inventarPlin(id, n) {
  stare.deLuat ||= [];
  const x = stare.deLuat.find((y) => y.id === id);
  if (x) x.n += n;
  else stare.deLuat.push({ id, n });
  salveaza();
  arataDeLuat();
}

let panouDeLuat = null;
let asteaptaDeLuat = null;
function textDeLuat() {
  const lista = stare.deLuat.map((x) => (x.n > 1 ? `${inventar.def(x.id).nume} ×${x.n}` : inventar.def(x.id).nume)).join(', ');
  return t('N-ai loc pentru: {obiect}.', { obiect: lista });
}
function arataDeLuat() {
  if (!stare.deLuat?.length) return;
  // Panoul e deja pe ecran: doar se scrie din nou, cu tot ce s-a adunat între timp
  if (panouDeLuat) {
    panouDeLuat.text.textContent = textDeLuat();
    panouDeLuat.lasa.textContent = stare.deLuat.length > 1 || stare.deLuat[0].n > 1 ? t('Lasă-le') : t('Lasă-l');
    return;
  }
  // Așteaptă să se închidă discuția, imaginile, lupta, inventarul sau un mini-joc (un singur ceas, oricâte bucăți vin)
  const ocupat = dialog.activ() || secventa.activa() || lupta.activa() || ecranInventar.deschis() || stare.reluare?.miniJoc || stare.reluare?.furisare || stare.reluare?.antrenament;
  if (ocupat) {
    if (!asteaptaDeLuat) asteaptaDeLuat = setTimeout(() => ((asteaptaDeLuat = null), arataDeLuat()), 300);
    return;
  }
  const fundal = div('acoperitor');
  const panou = div('panou-anunt');
  const text = div('text-anunt');
  const inchide = () => {
    fundal.remove();
    panouDeLuat = null;
  };
  const lasa = buton('', 'buton-mic-meniu', () => {
    stare.deLuat = [];
    salveaza();
    inchide();
  });
  panou.append(
    text,
    // Lista e chiar „stare.deLuat”: ce rămâne nehotărât în inventar revine în panou la închiderea lui (dupaInventar)
    buton(t('Aruncă ceva'), 'buton-mic-meniu', () => (inchide(), ecranInventar.deschide({ deLuat: stare.deLuat, cufar: stare.scena === 'casa.camera_vale' }))),
    lasa,
  );
  fundal.append(panou);
  ui.append(fundal);
  panouDeLuat = { text, lasa };
  arataDeLuat();
}

// ---------- meniul ----------

// Meniul (decis de autor): o tablă de lemn atârnată, cu 6 butoane de pergament în grilă 2×3, fiecare cu iconița lui.
// Galeria și Opțiunile se deschid în aceeași fereastră, cu „Înapoi” spre meniu.
function deschideMeniul() {
  const fundal = div('acoperitor ecran-meniu');
  const panou = div('panou-meniu-nou');
  // Meniul are melodia lui; la închidere revine ambianța locului
  sunet.muzica('meniu');
  const inchide = () => {
    fundal.remove();
    sunet.muzica(null);
  };
  const optiune = (id, simbol, text, clic) => {
    const b = buton('', 'buton-meniu', clic);
    b.append(iconita(id, simbol), div('text-buton-meniu', text));
    return b;
  };
  const arataMeniul = () => {
    const grila = div('grila-meniu');
    grila.append(
      optiune('continua', '🚪', t('Continuă'), inchide),
      optiune('salveaza', '🪶', t('Salvează'), () => salvare.exporta(stare, `fangs-vn-salvare-ziua-${ziua(stare)}.json`)),
      optiune('incarca', '📜', t('Încarcă'), async () => {
        try {
          stare = await salvare.importa();
          joc.uitaInainteDeMisiuni();
          salveaza();
          inchide();
          afiseaza();
          mesaj(t('Salvarea a fost încărcată.'));
        } catch (e) {
          mesaj(e.message);
        }
      }),
      optiune('joc_nou', '🌅', t('Joc nou'), () => {
        intreaba(t('Începi un joc nou? Progresul de acum se pierde (dacă nu l-ai salvat într-un fișier).'), t('Joc nou'), t('Renunț')).then((da) => {
          if (!da) return;
          inchide();
          joc.jocNou();
        });
      }),
      optiune('galerie', '🖼', t('Galerie'), arataGaleria),
      optiune('optiuni', '⚙', t('Opțiuni'), arataOptiunile),
    );
    panou.replaceChildren(div('titlu-meniu-nou', t('Meniu')), grila);
  };
  // Butoanele mici din Galerie și Opțiuni folosesc același pergament ca butoanele mari ale meniului
  const butonInapoi = () => buton(t('← Înapoi'), 'buton-mic-meniu inapoi-meniu', arataMeniul);

  // Galeria: ilustrațiile evenimentelor pe care Vale le-a văzut deja, pe eveniment; un clic le arată mari
  function arataGaleria() {
    // Imaginile evenimentelor văzute, plus cele de sub replici pe care le-a văzut Vale, grupate după poveste
    const grupuri = new Map();
    const adauga = (nume, cale) => {
      const lista = grupuri.get(nume) || [];
      if (!lista.includes(cale)) lista.push(cale);
      grupuri.set(nume, lista);
    };
    for (const ev of evenimente) if (ev.imagini?.length && stare.evenimente[ev.id]) ev.imagini.forEach((c) => adauga(ev.nume || ev.grup || ev.id, c));
    const vazuteSub = new Set(stare.imaginiVazute || []);
    // „faraGalerie”: imaginea de sub replici e a unui loc, nu o ilustrație (gândurile de la intrarea în Groapă)
    for (const [id, d] of Object.entries(dialoguri))
      if (!d.faraGalerie)
        for (const n of Object.values(d.noduri || {})) if (n.imagine && vazuteSub.has(n.imagine)) adauga(d.grup || id, n.imagine);
    const continut = div('continut-meniu galerie-meniu');
    // Prologul se poate reciti oricând de aici (cerut de autor), fără să strice grila de 6 butoane a meniului
    continut.append(
      buton(t('📜 Cronica Aldariei (prologul)'), 'buton-mic-meniu recitire-prolog', () => {
        inchide();
        prologul.deschide({ recitire: true });
      }),
    );
    if (!grupuri.size) continut.append(div('gol-meniu', t('Încă n-ai văzut nicio ilustrație. Le găsești aici pe măsură ce trăiești povestea.')));
    for (const [nume, imagini] of grupuri) {
      const grup = div('grup-galerie');
      grup.append(div('nume-grup-galerie', nume));
      const rand = div('rand-galerie');
      for (const cale of imagini) {
        const mic = elementImagine([cale], { clasa: 'miniatura-galerie', raport: 16 / 9, eticheta: cale });
        mic.onclick = () => {
          const mare = div('imagine-mare-galerie');
          mare.append(elementImagine([cale], { clasa: 'imagine-galerie', raport: 16 / 9, eticheta: cale }));
          mare.onclick = () => mare.remove();
          fundal.append(mare);
        };
        rand.append(mic);
      }
      grup.append(rand);
      continut.append(grup);
    }
    panou.replaceChildren(div('titlu-meniu-nou', t('Galerie')), continut, butonInapoi());
  }

  // Opțiunile: viteza animațiilor, sunetul (volume separate) și ecranul complet
  function arataOptiunile() {
    const continut = div('continut-meniu optiuni-meniu');
    const v = volumeSunet();
    const randuriSunet = [
      ['general', t('Volumul general')],
      ['ambianta', t('Sunetul locurilor')],
      ['efecte', t('Efectele')],
      ['muzica', t('Muzica')],
    ].map(([cheie, nume]) => {
      const r = div('rand-optiune');
      const glisor = Object.assign(document.createElement('input'), { type: 'range', min: 0, max: 100, value: Math.round(v[cheie] * 100), className: 'glisor-sunet' });
      // Partea plină a șinei (aurie) se desenează din CSS după --p, ca la toate browserele să arate la fel
      const umple = () => glisor.style.setProperty('--p', `${glisor.value}%`);
      umple();
      glisor.oninput = () => {
        umple();
        seteazaVolum(cheie, glisor.value / 100);
      };
      r.append(div('nume-optiune', nume), glisor);
      return r;
    });
    const randMut = div('rand-optiune');
    randMut.append(
      div('nume-optiune', t('Fără sunet')),
      buton(v.mut ? t('Pornește sunetul') : t('Oprește tot'), 'buton-mic-meniu', () => {
        seteazaVolum('mut', !v.mut);
        arataOptiunile();
      }),
    );
    const randViteza = div('rand-optiune');
    randViteza.append(div('nume-optiune', t('Viteza animațiilor (luptă, zaruri, Masa regelui)')));
    const alegeri = div('alegeri-optiune');
    for (const x of VITEZE) {
      const b = buton(`×${x}`, `buton-mic-meniu${x === viteza() ? ' ales' : ''}`, () => {
        seteazaViteza(x);
        arataOptiunile();
      });
      alegeri.append(b);
    }
    randViteza.append(alegeri);
    const randEcran = div('rand-optiune');
    randEcran.append(
      div('nume-optiune', t('Ecran complet')),
      buton(document.fullscreenElement ? t('Ieși din ecran complet') : t('Pornește'), 'buton-mic-meniu', () => {
        comutaEcranComplet();
        setTimeout(arataOptiunile, 300);
      }),
    );
    // Mărimea cursorului: se vede pe loc, cât tragi de glisor
    const randCursor = div('rand-optiune');
    const glisorCursor = Object.assign(document.createElement('input'), { type: 'range', min: MARIME_CURSOR.min, max: MARIME_CURSOR.max, step: 4, value: marimeCursor(), className: 'glisor-sunet' });
    const umpleCursor = () => glisorCursor.style.setProperty('--p', `${((glisorCursor.value - MARIME_CURSOR.min) / (MARIME_CURSOR.max - MARIME_CURSOR.min)) * 100}%`);
    umpleCursor();
    glisorCursor.oninput = () => {
      umpleCursor();
      seteazaMarimeCursor(Number(glisorCursor.value));
    };
    randCursor.append(div('nume-optiune', t('Mărimea cursorului')), glisorCursor);
    const randSemne = div('rand-optiune');
    randSemne.append(
      div('nume-optiune', t('Semnele misiunilor (! și ?)')),
      buton(semneMisiuniPornite() ? t('Oprește-le') : t('Pornește-le'), 'buton-mic-meniu', () => {
        seteazaSemneMisiuni(!semneMisiuniPornite());
        afiseaza();
        arataOptiunile();
      }),
    );
    const randMini = div('rand-optiune');
    randMini.append(
      div('nume-optiune', t('Mini-jocurile (muncă, lemne, ierburi)')),
      buton(miniJocuriPornite() ? t('Oprește-le') : t('Pornește-le'), 'buton-mic-meniu', () => {
        seteazaMiniJocuri(!miniJocuriPornite());
        arataOptiunile();
      }),
    );
    // Limba (decis de autor): aceeași cu cea aleasă în cartea prologului; se schimbă pe loc, fără să pierzi nimic
    const randLimba = div('rand-optiune');
    const alegeriLimba = div('alegeri-optiune');
    for (const [l, nume] of Object.entries(LIMBI))
      alegeriLimba.append(
        buton(nume, `buton-mic-meniu${l === limbaJoc() ? ' ales' : ''}`, () => {
          seteazaLimba(l);
          arataOptiunile();
        }),
      );
    randLimba.append(div('nume-optiune', 'Limba / Language'), alegeriLimba);
    continut.append(randLimba, randViteza, ...randuriSunet, randMut, randCursor, randSemne, randMini, randEcran);
    panou.replaceChildren(div('titlu-meniu-nou', t('Opțiuni')), continut, butonInapoi());
  }

  arataMeniul();
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
  else document.documentElement.requestFullscreen?.().catch(() => mesaj(t('Browserul nu permite ecran complet aici. Încearcă F11.')));
}
document.addEventListener('fullscreenchange', () => afiseaza());

// Semnele misiunilor în afara dialogului (decis de autor): ! / ? deasupra personajului din scenă și deasupra
// clădirii (sau ușii) unde e el acum, ca să știi la cine să mergi fără să deschizi cartea. Se pot opri din Opțiuni
// Cât de jos stă cel puțin semnul „!”/„?”, ca să încapă întreg pe imagine (e înalt cam cât atât, cu plutirea lui)
const SEMN_SUS_MIN = 115;
function puneSemneMisiuni(d, r, ctx, prezenti) {
  stratSemne.replaceChildren();
  if (!semneMisiuniPornite()) return;
  const semne = new Map();
  for (const p of personaje.values()) {
    const loc = undeEste(p, ctx);
    // „semneDe”: un sprite care ține locul altcuiva (decis de autor: Kaia lângă Ember rănit, un singur sprite până
    // la vindecare) arată semnele misiunilor aceluia, ca „!” să stea deasupra lui
    const semn = loc && semnPersonaj(joc, p.semneDe || p.id, loc);
    // Cine doarme nu poate vorbi acum, deci nu cheamă pe nimeni
    if (semn && !intrareProgram(p, ctx)?.doarme) semne.set(p.id, { semn, loc, p });
  }
  // Pe hartă și pe ușile din zone semnul arată unde e cineva acum, dar drumul până acolo ia timp (decis de autor):
  // dacă la sosire nu mai e acolo, sau nu mai are nimic de spus (Kaia pleacă de la marginea pădurii la 17:00),
  // semnul nu se mai pune
  const ajungeLaTimp = (x) => {
    const minute = minuteDrum(d.id, x.loc);
    const viitor = { ...stare, minute: stare.minute + costTimp(stare, minute, cfg.nevoi) };
    const ctxViitor = context(viitor);
    if (undeEste(x.p, ctxViitor) !== x.loc || intrareProgram(x.p, ctxViitor)?.doarme) return false;
    return semnPersonaj({ ...joc, stare: viitor }, x.p.semneDe || x.p.id, x.loc) !== null;
  };
  if (!semne.size) return;
  // Pozițiile sunt în procente din scenă, iar stratul semnelor are aceeași mărime ca scena: semnul ajunge exact
  // deasupra personajului sau a clădirii, doar că stă peste interfață
  const pune = (_parinte, left, top, semn) => {
    const s = div(`semn-scena ${semn}`, semn === 'nou' ? '!' : '?');
    Object.assign(s.style, { left, top });
    stratSemne.append(s);
  };
  // Personajele din scena de acum. Cine încă nu se poate apăsa (fermierul, până la prima patrulă) nu primește semnul
  // deasupra lui; semnele de pe hartă și de pe uși rămân, ca să-l ducă pe jucător acolo
  for (const [id, { semn, p }] of semne) {
    const el = prezenti.has(id) && r.obiecte.get(id);
    if (el?.isConnected && esteClicabil(p, ctx)) pune(el.parentElement, el.style.left, `calc(${el.style.top} - ${el.style.height})`, semn);
  }
  // Clădirile de pe hartă și ușile din zone: unde e acum cineva cu un semn (cel mai important câștigă)
  const ordine = { gata: 3, nou: 2, lucru: 1 };
  for (const t of d.tinte) {
    // Pe drumul înapoi spre sat (de pe Marginea satului) nu se pune semn (decis de autor): acolo e tot satul
    if (!t.spre || t.id.startsWith('spre_')) continue;
    const aici = [...semne.values()].filter((x) => x.loc && subScena(t.spre, x.loc) && ajungeLaTimp(x));
    if (!aici.length) continue;
    const semn = aici.sort((a, b) => ordine[b.semn] - ordine[a.semn])[0].semn;
    const piesa = d.obiecte.find((o) => o.tinta === t.id && r.obiecte.get(o.id)?.isConnected);
    if (piesa) {
      const el = r.obiecte.get(piesa.id);
      // O clădire lipită de marginea de sus a hărții (biserica) ar împinge semnul afară din imagine: atunci coboară
      // peste clădire, cât să se vadă întreg (decis de autor)
      pune(el.parentElement, el.style.left, `max(calc(${el.style.top} - ${el.style.height}), ${(SEMN_SUS_MIN / INALTIME) * 100}%)`, semn);
      continue;
    }
    const poligon = r.poligoane.get(t.id);
    if (!poligon?.isConnected) continue;
    const b = poligon.getBBox();
    pune(stratLume, `${((b.x + b.width / 2) / LATIME) * 100}%`, `max(${(b.y / INALTIME) * 100}%, ${(SEMN_SUS_MIN / INALTIME) * 100}%)`, semn);
  }
}

// Locul unui personaj („zona/loc”) e sub scena asta? Urcă din loc spre hartă (o zonă de pe Marginea satului
// e și sub drumul spre ea de pe harta satului)
function lantScene(id) {
  const lant = [];
  for (let s = lume.get(id); s; s = lume.get(s.parinte)) lant.push(s);
  return lant;
}
function subScena(idScena, loc) {
  return lantScene(loc.replace('/', '.')).some((s) => s.id === idScena);
}
// Cât ține drumul de aici până la locul unui personaj: câte o zonă sau hartă și câte un loc pe drum
function minuteDrum(deLa, loc) {
  let minute = 0;
  for (const s of lantScene(loc.replace('/', '.'))) {
    if (s.id === deLa) break;
    minute += s.tip === 'loc' ? cfg.timp.spreLoc : cfg.timp.spreZona;
  }
  return minute;
}

// „clicabil: false” = doar se vede; „clicabil: { conditii }” = se poate apăsa abia când condițiile sunt îndeplinite
function esteClicabil(p, ctx) {
  if (p?.clicabil === false) return false;
  if (p?.clicabil?.conditii) return verifica(p.clicabil.conditii, ctx);
  return true;
}

// Un loc care se închide cât stă Vale în el (Bram se culcă sau pleacă, taverna închide, mama se culcă): Vale iese
// afară, cu un gând (decis de autor: după foalele lui Bram, terminate seara în magazin, la noapte ieși din fierărie).
// Lacătele sunt aceleași ca la intrare; „mesajIesire” la lacăt e gândul de la ieșire (altfel, cel de la intrare)
// Un loc în care se intră din altul (camera lui Bram, din magazin; pivnița, din sala tavernei) se închide și odată
// cu acela: se urcă din locul de acum spre zonă, iar Vale iese din cel mai de sus loc închis, cu gândul lacătului lui
// (altfel rămânea în camera lui Bram după ce Bram închidea fierăria la prânz)
function scoateDacaSeInchide(d, ctx) {
  if (d.tip !== 'loc' || !d.parinte || dialog.activ() || secventa.activa()) return;
  let iese = null;
  for (let x = d; x?.tip === 'loc' && x.parinte; x = lume.get(x.parinte)) {
    const tinta = lume.get(x.parinte)?.tinte.find((y) => y.spre === x.id);
    const lacat = [].concat(tinta?.incuiat || []).find((l) => !verifica(l.conditii, ctx));
    if (lacat) iese = { loc: x, lacat };
  }
  if (!iese) return;
  setTimeout(() => {
    if (stare.scena !== d.id || dialog.activ()) return;
    mergi(iese.loc.parinte, { faraTimp: true });
    gand(iese.lacat.mesajIesire || iese.lacat.mesaj || t('Trebuie să plec de aici.'));
  }, 0);
}

function afiseaza() {
  const d = lume.get(stare.scena);
  const ctx = context(stare);
  scoateDacaSeInchide(d, ctx);
  const r = randeaza(stratLume, d, date.aranjare[d.id], ctx);
  sunet.scena(d.id, ctx, lantScene(d.id).map((s) => s.id));
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
      // Zona unui personaj contează doar cât timp el e în scenă (și cât se poate vorbi cu el)
      if (!prezenti.has(t.personaj) || !esteClicabil(personaje.get(t.personaj), ctx)) {
        poligon?.remove();
        continue;
      }
      if (!poligon) continue;
      cuZona.add(t.personaj);
    }
    if (t.ascuns && !verifica(t.ascuns.conditii, ctx)) {
      poligon?.remove();
      // Și piesa lui de pe hartă (drumul spre Marginea satului nu se vede până la eliberarea lui Finn)
      for (const o of d.obiecte.filter((o) => o.tinta === t.id)) r.obiecte.get(o.id)?.remove();
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
    if (cuZona.has(o.id) || !esteClicabil(personaje.get(o.id), ctx)) {
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
    butonHud('inventar', '🎒', t('Inventar'), () => ecranInventar.deschide({ cufar: false })),
    // Cartea se deschide la misiuni; „Personaje” de lângă „Închide” trece la cartea personajelor
    butonHud('personaje', '📖', t('Cartea (misiuni, personaje)'), () => carte.deschide()),
    butonHud('meniu', '☰', t('Meniu'), deschideMeniul),
    butonHud('ecran', '⤢', document.fullscreenElement ? t('Ieși') : t('Ecran complet'), comutaEcranComplet),
  );
  inapoi.replaceChildren();
  if (d.parinte) {
    const b = buton('', 'placuta-hud', () => mergi(d.parinte));
    b.append(iconita('inapoi', '↩'), div('', t('Înapoi')));
    inapoi.append(b);
  }
  // Doar numele locului, fără iconiță (decis de autor)
  titlu.replaceChildren(div('', d.titlu));

  // Locurile fără zonă desenată primesc butoane, altfel ar fi de neatins până le desenează autorul
  navigare.replaceChildren();
  if (faraZona.length) {
    navigare.append(div('eticheta', t('Fără zonă desenată încă:')));
    for (const { t, clic } of faraZona) navigare.append(buton(t.nume, '', clic));
  }

  actualizeazaHud();
  // Semnele după HUD: acolo se bifează pașii misiunilor, iar un pas făcut chiar acum (discuția cu colectorul despre
  // inel) nu mai lasă „?” deasupra personajului până la următoarea redesenare
  puneSemneMisiuni(d, r, ctx, prezenti);
  debug.arata();
  setTimeout(verificaEvenimentePeLoc, 0);

  // Vecinii se preîncarcă în fundal, ca trecerea la ei să fie instantanee
  const vecini = [d.parinte, ...d.tinte.map((t) => t.spre)].filter(Boolean).map((id) => lume.get(id));
  for (const v of vecini) preincarca(candidati(v.imagine, v.variante, ctx).at(-1));
}

addEventListener('keydown', (e) => {
  if (e.key === 'F2' || e.key === '`') {
    e.preventDefault();
    return debug.comuta();
  }
  if (lupta.activa() || zaruri.activ() || tafl.activ()) return;
  // Literele scrise într-un câmp (panoul debug) nu deschid inventarul sau cartea
  if (e.target.closest?.('input, textarea, select')) return;
  if ((e.key === 'v' || e.key === 'V') && !dialog.activ()) return comutaPanoul();
  if ((e.key === 'p' || e.key === 'P') && !dialog.activ() && !ecranInventar.deschis() && !ui.querySelector('.acoperitor')) return carte.deschisa() || carte.deschide();
  // Cartea se închide doar din butonul „Închide” (decis de autor): nici tastele, nici clicul pe fundal
  if (carte.deschisa()) return;
  if ((e.key === 'i' || e.key === 'I') && !dialog.activ() && !ecranMagazin.deschis()) return ecranInventar.deschis() ? ecranInventar.inchide() : ecranInventar.deschide({ cufar: false });
  if (e.key !== 'Escape') return;
  const acoperitor = ui.querySelector('.acoperitor');
  // În galeria din meniu, Escape închide întâi imaginea mare, apoi meniul
  const mare = ui.querySelector('.imagine-mare-galerie');
  if (mare) return mare.remove();
  if (acoperitor) return acoperitor.remove();
  if (ecranInventar.deschis()) return ecranInventar.inchide();
  if (ecranMagazin.deschis()) return ecranMagazin.inchide();
  const d = lume.get(stare.scena);
  if (!dialog.activ() && d.parinte) mergi(d.parinte);
});

// Din galerie (editor), „Pornește visul” (cerut de autor): jocul de test îl culcă pe Vale în camera lui și, după
// imaginea somnului, pornește visul, ca după o noapte dormită; așa visele (și filmulețele lor) se văd oricând.
// Un vis din mijlocul unui dialog („visDinDialog”: al cincilea, la crăpătură, în „Drumul trezirii”) pornește direct de
// la replica dinaintea lui, fără pat
const visCerut = evenimente.find((e) => e.id === parametri.get('vis') && (e.laTrezire || e.visDinDialog));
function pornesteVisulCerut(ev) {
  // Un refresh al jocului de test nu mai pornește visul încă o dată
  const url = new URL(location.href);
  url.searchParams.delete('vis');
  history.replaceState(null, '', url);
  stare.reluare = null;
  stare.luptaInCurs = null;
  stare.scena = cfg.start.scena;
  afiseaza();
  const dv = ev.visDinDialog;
  if (dv && dialoguri[ev.dialog]?.noduri?.[dv.nod]) {
    // Aceeași cale ca un refresh în mijlocul drumului: filmulețul pe fundal, așteptat la începutul visului
    return cuFilmele(ev.dialog, () => dialog.porneste(dialoguri[ev.dialog], { delaNod: dv.nod, cuEfecte: true }), dv.nod);
  }
  if (ev.dialog) filmeleDialogului(dialoguri[ev.dialog]).forEach(preincarcaFilm);
  const pat = lume.get(stare.scena)?.tinte?.find((t) => t.act?.tip === 'dormi')?.act;
  const v = (pat?.varianteImagine || []).find((x) => verifica(x.conditii, context(stare))) || pat;
  secventa.arata([v?.imagine].filter(Boolean), () => pornesteEveniment(ev.id, true), { automat: 2500, text: pat?.text || '' });
}

// Titlul paginii (fila browserului, fereastra din .exe) urmează limba jocului. În index.html rămâne cel românesc, care
// se vede doar cât se încarcă scriptul
const puneTitlulPaginii = () => {
  document.title = t('Fangs&Honor: Recuperarea satului');
};
puneTitlulPaginii();
afiseaza();
// Limba schimbată (din Opțiuni sau din cartea prologului): textele din date sunt deja rescrise (limba.js), dar lumea
// ține numele locurilor și ale acțiunilor copiate la pornire, deci se reface (în același Map, pe care îl țin și alții),
// apoi se redesenează ecranul de acum
laSchimbareaLimbii(() => {
  puneTitlulPaginii();
  const noua = construiesteLumea(date);
  lume.clear();
  for (const [k, v] of noua) lume.set(k, v);
  afiseaza();
});
if (visCerut) pornesteVisulCerut(visCerut);
else reiaDupaReincarcare();
// Ce n-a încăput în rucsac înainte de refresh: panoul revine (după lupta sau discuția reluată)
arataDeLuat();
if (stare.prolog === 'deschis' && !visCerut) deschidePrologul();
// La un vis pornit din galerie, panoul debug rămâne închis (s-ar vedea peste filmuleț); se deschide cu F2
if (parametri.has('debug') && !visCerut) debug.comuta();

// Toate imaginile jocului se încarcă de la pornire (decis de autor), ca trecerile (noaptea pe hartă, imaginile
// evenimentelor) să nu se mai vadă încărcându-se. Întâi scena de acum, apoi restul; un ecran arată cât s-a ajuns.
// La testele automate (?test=1) se încarcă tot, dar fără ecran, ca să nu încurce
// Oprită deocamdată (decis de autor, „incarcareLaPornire” în config.json); se pornește la finalul jocului
if (date.config.incarcareLaPornire) {
  const cai = imaginiCerute(date, lume)
    .map((x) => x.cale)
    .filter((c) => c.endsWith('.png'));
  const acum = lume.get(stare.scena);
  const primele = candidati(acum.imagine, acum.variante, context(stare));
  const ordine = [...new Set([...primele, ...cai])];
  if (parametri.has('test')) incarcaToate(ordine);
  else {
    const ecran = div('ecran-incarcare');
    const umplere = div('umplere-incarcare');
    const bara = div('bara-incarcare');
    bara.append(umplere);
    const text = div('text-incarcare', t('Se pregătesc imaginile...'));
    ecran.append(text, bara);
    ui.append(ecran);
    incarcaToate(ordine, (facute, total) => {
      umplere.style.width = `${(facute / total) * 100}%`;
      text.textContent = t('Se pregătesc imaginile... {procent}%', { procent: Math.round((facute / total) * 100) });
    }).then(() => {
      ecran.classList.add('gata');
      setTimeout(() => ecran.remove(), 400);
    });
  }
}
// Previzualizarea din editor (Interfață → Meniul): jocul pornește cu meniul deschis și primește mărimile pe loc,
// cât autorul le reglează, fără să le salveze
if (parametri.has('meniu')) deschideMeniul();
addEventListener('message', (e) => {
  if (e.origin === location.origin && e.data?.tip === 'reglaje-meniu') aplicaMeniu(e.data.valori);
});
