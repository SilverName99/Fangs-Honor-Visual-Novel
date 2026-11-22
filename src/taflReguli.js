// „Masa regelui” (Fetlar Hnefatafl, cerut de autor, după regulile de pe aagenielsen.dk): regulile și mintea
// bătrânului din tavernă. Fără nimic din pagină (DOM), ca să se poată testa singur.
//
// Tabla e un șir de 121 de căsuțe (11 × 11), rând cu rând: 0 = goală, 1 = atacator, 2 = apărător, 3 = regele.
// Ce lipsea de pe pagină (decis de autor, după propunerea lui Claude): regele nu poate fi prins pe marginea tablei
// (doar înconjurat cu toți ai lui, sau blocat de tot); piesele obișnuite nu intră în colțuri; aceeași poziție a treia
// oară înseamnă remiză.

export const N = 11;
export const GOL = 0;
export const ATAC = 1;
export const APAR = 2;
export const REGE = 3;
export const TRON = 60;
export const COLTURI = [0, 10, 110, 120];
// Partida nu ține la nesfârșit: după atâtea mutări, e remiză (pagina: „dacă jocul nu se poate termina, e remiză”)
export const LIMITA_MUTARI = 300;

const DIRECTII = [-N, N, -1, 1];
const eColt = (i) => i === 0 || i === 10 || i === 110 || i === 120;
const rand = (i) => Math.floor(i / N);
const coloana = (i) => i % N;
const peMargine = (i) => rand(i) === 0 || rand(i) === N - 1 || coloana(i) === 0 || coloana(i) === N - 1;
// Vecinul în direcția dată, sau -1 dacă iese de pe tablă (fără să treacă de pe un rând pe altul)
function vecin(i, d) {
  if (d === -1 && coloana(i) === 0) return -1;
  if (d === 1 && coloana(i) === N - 1) return -1;
  const j = i + d;
  return j < 0 || j >= N * N ? -1 : j;
}
export const aAtacatorilor = (p) => p === ATAC;
export const aAparatorilor = (p) => p === APAR || p === REGE;
const alTaberei = (p, t) => (t === 'a' ? p === ATAC : p === APAR || p === REGE);

// Poziția de început din Fetlar: 24 de atacatori pe margini, 12 apărători în cruce în jurul regelui de pe tron
export function pozitieStart() {
  const harta = [
    '...AAAAA...',
    '.....A.....',
    '...........',
    'A....D....A',
    'A...DDD...A',
    'AA.DDKDD.AA',
    'A...DDD...A',
    'A....D....A',
    '...........',
    '.....A.....',
    '...AAAAA...',
  ];
  const t = new Int8Array(N * N);
  harta.forEach((r, ri) => [...r].forEach((ch, ci) => (t[ri * N + ci] = ch === 'A' ? ATAC : ch === 'D' ? APAR : ch === 'K' ? REGE : GOL)));
  return t;
}

export const unde = (tabla) => tabla.indexOf(REGE);

// Unde poate merge o piesă: în linie dreaptă, oricât, până la prima piesă (ca tura la șah). Tronul și colțurile sunt
// doar ale regelui; prin tronul gol pot trece toți, dar numai regele se poate opri pe el
export function destinatii(tabla, de) {
  const p = tabla[de];
  const rez = [];
  if (!p) return rez;
  for (const d of DIRECTII) {
    let j = vecin(de, d);
    while (j >= 0 && tabla[j] === GOL) {
      if (p === REGE || (j !== TRON && !eColt(j))) rez.push(j);
      // Piesele obișnuite nu intră în colțuri (colțul e mereu la capătul liniei, deci nici nu trec prin el)
      if (eColt(j) && p !== REGE) break;
      j = vecin(j, d);
    }
  }
  return rez;
}

// Toate mutările unei tabere: perechi [de, la]
export function mutari(tabla, t) {
  const rez = [];
  for (let i = 0; i < N * N; i++) if (alTaberei(tabla[i], t)) for (const j of destinatii(tabla, i)) rez.push([i, j]);
  return rez;
}

// O căsuță „dușmană” pentru o piesă a taberei t: o piesă a celeilalte tabere (regele e înarmat, deci și el contează
// pentru apărători), un colț, sau tronul (mereu dușman atacatorilor, apărătorilor doar cât e gol)
function dusmanaPentru(tabla, i, t) {
  if (i < 0) return false;
  if (eColt(i)) return true;
  if (i === TRON && tabla[i] === GOL) return true;
  return t === 'a' ? aAparatorilor(tabla[i]) : tabla[i] === ATAC;
}

// Regele e prins când are atacatori din toate cele 4 părți (tronul gol ține loc de unul, lângă tron). Pe margine nu
// poate fi prins (decis de autor); atunci îl opresc doar încercuirea sau lipsa oricărei mutări
function regePrins(tabla, k) {
  if (k < 0 || peMargine(k)) return false;
  return DIRECTII.every((d) => {
    const v = vecin(k, d);
    return tabla[v] === ATAC || (v === TRON && tabla[v] === GOL);
  });
}

// Încercuirea: atacatorii au închis toți apărătorii (cu regele) într-un inel fără nicio spărtură până la margine
export function incercuiti(tabla) {
  const vazut = new Uint8Array(N * N);
  const coada = [];
  for (let i = 0; i < N * N; i++) if (peMargine(i) && tabla[i] !== ATAC) (vazut[i] = 1), coada.push(i);
  while (coada.length) {
    const i = coada.pop();
    if (aAparatorilor(tabla[i])) return false;
    for (const d of DIRECTII) {
      const v = vecin(i, d);
      if (v >= 0 && !vazut[v] && tabla[v] !== ATAC) (vazut[v] = 1), coada.push(v);
    }
  }
  return true;
}

// Face o mutare pe o copie a tablei: capturile (prins între două piese dușmane sau între una și o căsuță dușmană, doar
// de cel care mută: între două piese poți intra fără grijă) și sfârșitul care vine din ea. Încercuirea se verifică și
// în căutarea bătrânului (altfel nu vedea un inel închis dintr-o mutare); costă puțin, pentru că doar o mutare a
// atacatorilor poate închide un inel
export function aplica(tabla, de, la) {
  const t = tabla.slice();
  const p = t[de];
  const cine = p === ATAC ? 'a' : 'd';
  t[la] = p;
  t[de] = GOL;
  const capturate = [];
  for (const d of DIRECTII) {
    const v = vecin(la, d);
    if (v < 0) continue;
    const prins = cine === 'a' ? t[v] === APAR : t[v] === ATAC;
    if (!prins) continue;
    const dincolo = vecin(v, d);
    if (dincolo >= 0 && dusmanaPentru(t, dincolo, cine === 'a' ? 'd' : 'a')) {
      t[v] = GOL;
      capturate.push(v);
    }
  }
  let final = null;
  if (p === REGE && eColt(la)) final = { castiga: 'd', motiv: 'colt' };
  else if (cine === 'a') {
    const k = unde(t);
    if (DIRECTII.some((d) => vecin(la, d) === k) && regePrins(t, k)) {
      t[k] = GOL;
      final = { castiga: 'a', motiv: 'rege', rege: k };
    } else if (incercuiti(t)) final = { castiga: 'a', motiv: 'incercuit' };
  }
  return { tabla: t, capturate, final };
}

const cheie = (tabla, t) => `${t}${tabla.join('')}`;

// O partidă: tabla, cine e la rând (atacatorii încep), câte mutări s-au făcut, de câte ori s-a văzut fiecare poziție
export function partidaNoua() {
  const tabla = pozitieStart();
  return { tabla, rand: 'a', mutari: 0, vazute: new Map([[cheie(tabla, 'a'), 1]]), final: null, ultima: null };
}

// Mută în partidă și spune dacă s-a terminat: regele în colț, regele prins, încercuirea, tabăra de la rând fără
// nicio mutare (pierde), aceeași poziție a treia oară sau prea multe mutări (remiză)
export function joaca(s, de, la) {
  const r = aplica(s.tabla, de, la);
  const urmator = s.rand === 'a' ? 'd' : 'a';
  const nou = { tabla: r.tabla, rand: urmator, mutari: s.mutari + 1, vazute: new Map(s.vazute), final: r.final, ultima: { de, la, capturate: r.capturate } };
  if (!nou.final && mutari(nou.tabla, urmator).length === 0) nou.final = { castiga: s.rand, motiv: 'blocat' };
  const k = cheie(nou.tabla, urmator);
  nou.vazute.set(k, (nou.vazute.get(k) || 0) + 1);
  if (!nou.final && nou.vazute.get(k) >= 3) nou.final = { castiga: null, motiv: 'repetare' };
  if (!nou.final && nou.mutari >= LIMITA_MUTARI) nou.final = { castiga: null, motiv: 'lunga' };
  return nou;
}

// ---------- mintea bătrânului ----------
// Caută cu alfa-beta câteva mutări înainte (după nivel) și cântărește pozițiile: piesele rămase, cât de liber e
// regele, cât de aproape e de un colț, drumurile lui spre colțuri și atacatorii lipiți de el

// Căsuțele de lângă colțuri pe care atacatorii le țin ca să închidă drumul regelui (în diagonală și pe margini)
const PAZA = [2, 12, 22, 8, 20, 32, 88, 100, 112, 98, 108, 118];

// Câte drumuri libere spre un colț are regele dintr-o căsuță de pe margine
function drumuriSpreColt(tabla, i) {
  let n = 0;
  if (!peMargine(i)) return 0;
  for (const d of DIRECTII) {
    let j = vecin(i, d);
    while (j >= 0 && tabla[j] === GOL && !eColt(j)) j = vecin(j, d);
    if (j >= 0 && eColt(j) && tabla[j] === GOL) n++;
  }
  return n;
}

// Cât de bine stau apărătorii (pozitiv) sau atacatorii (negativ)
export function evalueaza(tabla) {
  let a = 0;
  let d = 0;
  for (let i = 0; i < N * N; i++) {
    if (tabla[i] === ATAC) a++;
    else if (tabla[i] === APAR) d++;
  }
  const k = unde(tabla);
  if (k < 0) return -100000;
  let scor = 14 * d - 7 * a;
  // Regele: libertatea lui, distanța până la cel mai apropiat colț și drumurile spre colțuri pe care le poate deschide
  const mers = destinatii(tabla, k);
  scor += 1.5 * mers.length;
  const r = rand(k);
  const c = coloana(k);
  scor -= 3 * Math.min(r + c, r + (N - 1 - c), N - 1 - r + c, 2 * (N - 1) - r - c);
  let drumuri = drumuriSpreColt(tabla, k) * 3;
  for (const j of mers) drumuri += drumuriSpreColt(tabla, j);
  scor += drumuri >= 2 ? 60 + 10 * drumuri : 25 * drumuri;
  for (const dd of DIRECTII) if (tabla[vecin(k, dd)] === ATAC) scor -= 9;
  for (const i of PAZA) if (tabla[i] === ATAC) scor -= 4;
  return scor;
}

const CASTIG = 100000;

// Ordinea în care se încearcă mutările (cele mai promițătoare întâi, ca alfa-beta să taie mai mult): regele spre
// margini și colțuri, atacatorii lângă rege și pe căsuțele de lângă colțuri
function ordoneaza(tabla, lista, t) {
  const k = unde(tabla);
  const scor = ([de, la]) => {
    if (t === 'd') return tabla[de] === REGE ? (eColt(la) ? 1000 : peMargine(la) ? 50 : 10) : 0;
    let s = 0;
    for (const d of DIRECTII) {
      const v = vecin(la, d);
      if (v === k) s += 40;
      if (v >= 0 && tabla[v] === APAR) s += 5;
    }
    if (PAZA.includes(la)) s += 8;
    return s;
  };
  return lista.map((m) => [scor(m), m]).sort((x, y) => y[0] - x[0]).map((x) => x[1]);
}

function cauta(tabla, t, adancime, alfa, beta, ply, limita) {
  if (limita.depasit || ((++limita.noduri & 1023) === 0 && Date.now() > limita.pana)) {
    limita.depasit = true;
    return 0;
  }
  const lista = mutari(tabla, t);
  if (!lista.length) return -CASTIG + ply;
  if (adancime === 0) return t === 'd' ? evalueaza(tabla) : -evalueaza(tabla);
  let best = -Infinity;
  for (const [de, la] of ordoneaza(tabla, lista, t)) {
    const r = aplica(tabla, de, la);
    let v;
    if (r.final) v = r.final.castiga === t ? CASTIG - ply : -CASTIG + ply;
    else v = -cauta(r.tabla, t === 'a' ? 'd' : 'a', adancime - 1, -beta, -alfa, ply + 1, limita);
    if (limita.depasit) return 0;
    if (v > best) best = v;
    if (v > alfa) alfa = v;
    if (alfa >= beta) break;
  }
  return best;
}

// Nivelurile (decis de autor: bătrânul întreabă cât de tare să joace): cât de departe vede, cât timp are și cât de
// des alege o mutare mai slabă dinadins. Cifrele sunt alese de Claude (TODO echilibru)
export const NIVELURI = {
  usor: { adancime: 1, timp: 300, marja: 40, gresala: 0.3, ratareCastig: 0.3 },
  mediu: { adancime: 2, timp: 900, marja: 6, gresala: 0, ratareCastig: 0 },
  greu: { adancime: 3, timp: 2500, marja: 0, gresala: 0, ratareCastig: 0 },
};

// Mutarea bătrânului pentru tabăra de la rând
export function alegeMutarea(s, nivel = 'mediu', aleator = Math.random) {
  const n = NIVELURI[nivel] || NIVELURI.mediu;
  const t = s.rand;
  let lista = ordoneaza(s.tabla, mutari(s.tabla, t), t);
  if (!lista.length) return null;
  // Un câștig pe loc: îl ia (la ușor, nu chiar mereu: când îl scapă, mutările câștigătoare ies din listă, altfel
  // căutarea le-ar găsi din nou și le-ar juca oricum)
  const castigaPeLoc = ([de, la]) => aplica(s.tabla, de, la).final?.castiga === t;
  const castig = lista.find(castigaPeLoc);
  if (castig) {
    if (aleator() >= n.ratareCastig) return castig;
    const rest = lista.filter((m) => !castigaPeLoc(m));
    if (rest.length) lista = rest;
  }
  // O mutare care aduce aceeași poziție a treia oară (sau ultima mutare îngăduită) e remiză: scor 0, ca bătrânul s-o
  // caute când pierde și s-o ocolească când câștigă
  const altul = t === 'a' ? 'd' : 'a';
  const remiza = (tabla) => (s.vazute?.get(cheie(tabla, altul)) || 0) >= 2 || s.mutari + 1 >= LIMITA_MUTARI;
  if (aleator() < n.gresala) return lista[Math.floor(aleator() * lista.length)];
  // Adâncire treptată: fiecare nivel terminat la timp își păstrează scorurile; ce n-a apucat, rămâne la cel de dinainte
  const pana = Date.now() + n.timp;
  let scoruri = null;
  for (let ad = 1; ad <= n.adancime; ad++) {
    const limita = { pana, noduri: 0, depasit: false };
    const acum = [];
    for (const [de, la] of lista) {
      const r = aplica(s.tabla, de, la);
      const v = r.final ? (r.final.castiga === t ? CASTIG : -CASTIG) : remiza(r.tabla) ? 0 : -cauta(r.tabla, altul, ad - 1, -Infinity, Infinity, 1, limita);
      if (limita.depasit) break;
      acum.push([v, [de, la]]);
    }
    // Un nivel neterminat nu înlocuiește unul terminat (ar compara mutări cântărite diferit)
    if (limita.depasit) {
      if (!scoruri) scoruri = acum;
      break;
    }
    scoruri = acum;
  }
  if (!scoruri?.length) return lista[0];
  // Printre mutările aproape la fel de bune (cât lasă marja nivelului), una la întâmplare, ca să nu joace mereu la fel
  const max = Math.max(...scoruri.map((x) => x[0]));
  const bune = scoruri.filter((x) => x[0] >= max - n.marja - 0.001);
  return bune[Math.floor(aleator() * bune.length)][1];
}
