// „Masa regelui” (Fetlar Hnefatafl) în tavernă (cerut de autor): Vale joacă cu bătrânul de la masa din colț.
// Regulile și mintea bătrânului stau în taflReguli.js; aici e doar ecranul: miza, tabăra, tabla, piesele, mutările.
// Tabla, grila (căsuțele peste desenul tablei) și bătrânul se mută și se măresc în editor (Aranjare → Ecrane →
// „Masa regelui (tavernă)”); până se încarcă imaginile, tabla și piesele sunt desenate din cod.

import { elementImagine } from './imagini.js';
import { pozitie, aplicaPozitie } from './scena.js';
import { asteapta, viteza, butonViteza } from './viteza.js';
import { partidaNoua, joaca, alegeMutarea, destinatii, N, ATAC, APAR, REGE, TRON, COLTURI } from './taflReguli.js';

const div = (clasa, text) => Object.assign(document.createElement('div'), { className: clasa, textContent: text ?? '' });
function buton(text, clic, clasa = '', pergament = true) {
  const b = document.createElement('button');
  b.className = `buton ${pergament ? 'buton-mic-meniu ' : ''}${clasa}`;
  b.textContent = text;
  b.onclick = clic;
  return b;
}
const alege = (lista) => lista[Math.floor(Math.random() * lista.length)];
const TIP = { [ATAC]: 'atacator', [APAR]: 'aparator', [REGE]: 'rege' };
const NUME_NIVEL = { usor: 'Ușor', mediu: 'Mediu', greu: 'Greu' };
const NUME_TABARA = { d: 'Regele și apărătorii', a: 'Atacatorii' };

export function creeazaTafl(parinte, joc) {
  let el = null;
  let s = null; // partida de acum: nivelul, tabăra lui Vale, miza, starea tablei, piesa aleasă

  const cfg = () => joc.date.config.jocTafl;
  const ecran = () => joc.lume.get('tafl');
  const aranjare = () => joc.date.aranjare.tafl;
  const poz = (id) => {
    const i = ecran().obiecte.findIndex((o) => o.id === id);
    return pozitie(aranjare(), ecran().obiecte[i], i);
  };
  // Cât câștigă Vale peste miză, după cât de tare joacă bătrânul (TODO echilibru, ales de Claude)
  const castigPeste = (miza, nivel) => Math.round(miza * (cfg().castig?.[nivel] ?? 1));

  // Pornit din discuția cu bătrânul, după ce Vale alege cât de tare să joace
  function porneste(nivel = 'mediu') {
    if (el) return;
    el = div('ecran-tafl');
    parinte.append(el);
    s = { nivel, vale: 'd', miza: null, p: null, selectat: null, tinte: [], piese: new Map(), ocupat: false };
    construieste();
    arataMiza();
  }

  // ---------- tabla ----------
  function construieste() {
    // Tabla e un element de interfață: până se încarcă imaginea (ui_tafl_tabla.png), lemnul și liniile sunt din CSS
    const tabla = div('obiect tabla-tafl');
    aplicaPozitie(tabla, poz('tabla'));
    tabla.style.zIndex = '1';
    const grila = div('obiect grila-tafl');
    aplicaPozitie(grila, poz('grila'));
    grila.style.zIndex = '2';
    for (let i = 0; i < N * N; i++) {
      const c = div(`celula-tafl${i === TRON ? ' tron' : ''}${COLTURI.includes(i) ? ' colt' : ''}`);
      c.dataset.i = i;
      c.onclick = () => clicPe(i);
      grila.append(c);
    }
    grila.append(div('strat-piese-tafl'));
    // Bătrânul, cu fața lui: liniștit sau zâmbind (când îi merge bine); balonul cu ce spune stă deasupra lui
    const batran = div('obiect batran-tafl stare-normal');
    aplicaPozitie(batran, poz('batran'));
    batran.style.zIndex = '3';
    for (const st of ['normal', 'zambet']) {
      const candidati = st === 'normal' ? ['portraits/batran_normal.png'] : ['portraits/batran_zambet.png', 'portraits/batran_normal.png'];
      batran.append(elementImagine(candidati, { clasa: `imagine-stare ${st}`, raport: 0.8, eticheta: candidati[0] }));
    }
    el.replaceChildren(tabla, grila, batran, div('strat-ui-tafl'));
  }

  const celula = (i) => el?.querySelector(`.celula-tafl[data-i="${i}"]`);
  const locPiesa = (piesa, i) => {
    piesa.style.left = `${((i % N) * 100) / N}%`;
    piesa.style.top = `${(Math.floor(i / N) * 100) / N}%`;
  };

  // Piesele se fac o dată, la începutul partidei; la fiecare mutare doar se deplasează, ca să se vadă cum merg
  function puneSPiesele() {
    const strat = el.querySelector('.strat-piese-tafl');
    strat.replaceChildren();
    s.piese = new Map();
    s.p.tabla.forEach((p, i) => {
      if (!p) return;
      const piesa = div(`piesa-tafl ${TIP[p]}`);
      piesa.append(div('forma'));
      locPiesa(piesa, i);
      strat.append(piesa);
      s.piese.set(i, piesa);
    });
  }

  function seteazaBatran(stare, balon) {
    const b = el?.querySelector('.batran-tafl');
    if (!b) return;
    b.className = `obiect batran-tafl stare-${stare}`;
    el.querySelector('.balon-tafl')?.remove();
    if (!balon) return;
    const p = poz('batran');
    const e = div(`balon balon-tafl${balon === '...' ? ' gand' : ''}`, balon);
    e.style.left = `${p.x * 100}%`;
    e.style.top = `${(p.y - p.scara - 0.02) * 100}%`;
    el.append(e);
  }
  // Ce spune bătrânul la masă (ciorne în config.json, „replici”); rămâne puțin, apoi dispare
  let pana = 0;
  function spune(cheie, stare = 'normal') {
    const lista = cfg().replici?.[cheie];
    if (!lista?.length) return;
    seteazaBatran(stare, alege([].concat(lista)));
    const acum = ++pana;
    setTimeout(() => acum === pana && s && !s.gandeste && seteazaBatran('normal'), 2600 / viteza());
  }

  // ---------- miza și tabăra ----------
  function arataRegulile() {
    const fundal = div('fundal-reguli');
    const foaie = div('foaie-inv hartie-reguli');
    foaie.append(div('titlu-reguli', 'Masa regelui'), div('text-reguli', cfg().reguli), buton('Am înțeles', () => fundal.remove(), 'inchide-reguli'));
    fundal.append(foaie);
    fundal.onclick = (e) => e.target === fundal && fundal.remove();
    el.append(fundal);
  }

  function arataMiza() {
    const strat = el.querySelector('.strat-ui-tafl');
    const panou = div('panou-zaruri-miza panou-tafl-miza');
    const titlu = div('rand-titlu-zaruri');
    titlu.append(div('titlu-zaruri', `Masa regelui · ${NUME_NIVEL[s.nivel]}`), Object.assign(buton('?', arataRegulile, 'mic buton-intrebare'), { title: 'Regulile' }));
    const tabere = div('alegere-tabara');
    for (const t of ['d', 'a']) {
      const b = buton(NUME_TABARA[t], () => ((s.vale = t), arataMiza()), `tabara${s.vale === t ? ' ales' : ''}`);
      tabere.append(b);
    }
    const alegeri = div('alegeri-miza');
    for (const m of cfg().mize) {
      const b = buton('', () => incepe(m), 'miza');
      b.append(div('', `Pui ${m} monede`), div('ce-pun', `Câștigi încă ${castigPeste(m, s.nivel)}`));
      b.disabled = joc.stare.bani < m;
      alegeri.append(b);
    }
    alegeri.append(buton('Nu acum', inchide, 'renunta'));
    const faraBani = joc.stare.bani < Math.min(...cfg().mize);
    panou.append(titlu, div('text-zaruri', faraBani ? cfg().texte.faraBani : cfg().texte.oferta), tabere, alegeri);
    strat.replaceChildren(panou);
    // În spatele panoului se vede deja tabla, cu piesele la locul lor
    s.p = partidaNoua();
    puneSPiesele();
  }

  function incepe(miza) {
    joc.stare.bani -= miza;
    joc.actualizeazaHud();
    s.miza = miza;
    s.p = partidaNoua();
    puneSPiesele();
    deseneaza();
    spune(s.vale === 'a' ? 'tuIncepi' : 'euIncep');
    laRand();
  }

  // ---------- mutările ----------
  function clicPe(i) {
    if (!s?.p || s.p.final || s.ocupat || s.miza == null || s.p.rand !== s.vale) return;
    const p = s.p.tabla[i];
    const alLui = s.vale === 'a' ? p === ATAC : p === APAR || p === REGE;
    if (alLui) {
      s.selectat = s.selectat === i ? null : i;
      s.tinte = s.selectat == null ? [] : destinatii(s.p.tabla, i);
      return deseneaza();
    }
    if (s.selectat != null && s.tinte.includes(i)) return faMutarea(s.selectat, i);
    s.selectat = null;
    s.tinte = [];
    deseneaza();
  }

  async function faMutarea(de, la) {
    s.ocupat = true;
    const cine = s.p.rand;
    s.p = joaca(s.p, de, la);
    s.selectat = null;
    s.tinte = [];
    const piesa = s.piese.get(de);
    s.piese.delete(de);
    s.piese.set(la, piesa);
    piesa.style.transitionDuration = `${320 / viteza()}ms`;
    locPiesa(piesa, la);
    deseneaza();
    await asteapta(340);
    if (!s) return;
    const capturate = s.p.ultima.capturate;
    // Regele prins dispare și el de pe tablă
    if (s.p.final?.motiv === 'rege') capturate.push(s.p.final.rege);
    for (const c of capturate) {
      const x = s.piese.get(c);
      s.piese.delete(c);
      x?.classList.add('capturata');
      setTimeout(() => x?.remove(), 400);
    }
    joc.sunet.efect(capturate.length ? 'tafl_captura' : 'tafl_piesa');
    if (capturate.length && !s.p.final) spune(cine === s.vale ? 'valeIa' : 'batranIa', cine === s.vale ? 'normal' : 'zambet');
    await asteapta(capturate.length ? 380 : 120);
    if (!s) return;
    s.ocupat = false;
    laRand();
  }

  async function laRand() {
    if (!s) return;
    if (s.p.final) return final();
    deseneaza();
    if (s.p.rand === s.vale) return;
    // Bătrânul se gândește (cât îl lasă viteza animațiilor), apoi mută
    s.gandeste = true;
    s.ocupat = true;
    seteazaBatran('normal', '...');
    deseneaza();
    const g = cfg().gandire || { min: 700, max: 1600 };
    await asteapta(g.min + Math.random() * (g.max - g.min));
    if (!s) return;
    const m = alegeMutarea(s.p, s.nivel);
    s.gandeste = false;
    seteazaBatran('normal');
    if (!m) return final();
    faMutarea(m[0], m[1]);
  }

  // ---------- sfârșitul ----------
  const MOTIVE = {
    colt: 'Regele a scăpat într-un colț.',
    rege: 'Regele a fost prins.',
    incercuit: 'Apărătorii au fost încercuiți.',
    blocat: 'N-a mai rămas nicio mutare.',
    repetare: 'Aceeași poziție a treia oară: remiză.',
    lunga: 'Partida a ținut prea mult: remiză.',
    renunt: 'Ai renunțat.',
  };

  function final() {
    if (s.rezultat) return;
    const f = s.p.final;
    s.rezultat = f.castiga == null ? 'remiza' : f.castiga === s.vale ? 'castig' : 'pierdere';
    const st = joc.stare;
    if (s.rezultat === 'castig') {
      s.primit = s.miza + castigPeste(s.miza, s.nivel);
      st.bani += s.primit;
      // După o victorie, bătrânul nu mai joacă în ziua aceea (ca paznicii la zaruri)
      joc.aplicaEfecte({ marcheaza: 'tafl_castig' });
    } else if (s.rezultat === 'remiza') st.bani += s.miza;
    joc.actualizeazaHud();
    seteazaBatran(s.rezultat === 'castig' ? 'normal' : 'zambet', alege([].concat(cfg().replici?.[s.rezultat] || [])));
    deseneaza();
  }

  function renunta() {
    joc.intreaba('Renunți la partidă? Pierzi miza.', 'Renunț', 'Mai joc').then((da) => {
      if (!da || !s?.p || s.p.final) return;
      s.p = { ...s.p, final: { castiga: s.vale === 'a' ? 'd' : 'a', motiv: 'renunt' } };
      final();
    });
  }

  function inchide() {
    const rezultat = s?.rezultat;
    el?.remove();
    el = null;
    s = null;
    if (!rezultat) return joc.dupaActiune();
    joc.dupaTafl(rezultat, cfg().minute);
  }

  // ---------- desenul ----------
  function deseneaza() {
    if (!el || !s?.p) return;
    for (const c of el.querySelectorAll('.celula-tafl')) {
      const i = Number(c.dataset.i);
      c.classList.toggle('selectata', s.selectat === i);
      c.classList.toggle('tinta', s.tinte.includes(i));
      c.classList.toggle('ultima', !!s.p.ultima && (s.p.ultima.de === i || s.p.ultima.la === i));
      const p = s.p.tabla[i];
      const alLui = s.vale === 'a' ? p === ATAC : p === APAR || p === REGE;
      c.classList.toggle('de-ales', s.miza != null && !s.p.final && !s.ocupat && s.p.rand === s.vale && alLui);
    }
    if (s.miza == null) return;
    const strat = el.querySelector('.strat-ui-tafl');
    const panou = div('panou-tafl');
    const numara = (f) => s.p.tabla.reduce((n, p) => n + (f(p) ? 1 : 0), 0);
    panou.append(div('titlu-tafl', `Masa regelui · ${NUME_NIVEL[s.nivel]}`), div('rand-tafl', `Joci cu: ${NUME_TABARA[s.vale]}`), div('rand-tafl', `Miza: ${s.miza} monede`));
    panou.append(div('rand-tafl mic', `Atacatori: ${numara((p) => p === ATAC)} · Apărători: ${numara((p) => p === APAR)}`));
    if (s.rezultat) {
      const titlu = { castig: 'Ai câștigat!', pierdere: 'Ai pierdut.', remiza: 'Remiză.' }[s.rezultat];
      const bani = { castig: `Primești ${s.primit} monede.`, pierdere: `Pierzi cele ${s.miza} monede.`, remiza: `Îți iei înapoi cele ${s.miza} monede.` }[s.rezultat];
      panou.append(div('rezultat-tafl', titlu), div('rand-tafl', MOTIVE[s.p.final.motiv] || ''), div('rand-tafl', bani), buton('Pleacă de la masă', inchide));
    } else {
      const randul = s.p.rand === s.vale ? (s.selectat != null ? 'Alege unde o muți.' : 'E rândul tău: alege o piesă.') : 'Bătrânul se gândește...';
      panou.append(div('rand-tafl acum', randul), buton('? Regulile', arataRegulile), buton('Renunț', renunta));
    }
    strat.replaceChildren(panou, butonViteza());
  }

  return { porneste, activ: () => !!el };
}
