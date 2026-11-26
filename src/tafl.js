// „Masa regelui” (Fetlar Hnefatafl) la tavernă (cerut de autor): Vale joacă cu bătrânul de la masa din fața tavernei.
// Regulile și mintea bătrânului stau în taflReguli.js; aici e doar ecranul: miza, tabăra, tabla, piesele, mutările.
// Tabla, grila (căsuțele peste desenul tablei) și rândul cu ce spune bătrânul se mută și se măresc în editor
// (Aranjare → Ecrane → „Masa regelui (tavernă)”); până se încarcă imaginile, tabla și piesele sunt desenate din cod.
// Fără portretul bătrânului pe ecran (decis de autor): ce spune el stă într-un rând deasupra tablei, iar panoul cu
// partida (miza, „? Regulile”, „Renunț”) se deschide din butonul „?” din stânga-sus.

import { elementImagine } from './imagini.js';
import { pozitie, aplicaPozitie } from './scena.js';
import { asteapta, viteza, butonViteza } from './viteza.js';
import { partidaNoua, joaca, alegeMutarea, destinatii, N, ATAC, APAR, REGE, TRON, COLTURI, IMAGINE_MASA } from './taflReguli.js';
import { t } from './limba.js';

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
// Numele se cer la fiecare desen, nu stau într-o listă făcută la pornire: așa urmează limba aleasă în joc
const numeNivel = (n) => ({ usor: t('Ușor'), mediu: t('Mediu'), greu: t('Greu') })[n];
const numeTabara = (tb) => ({ d: t('Regele și apărătorii'), a: t('Atacatorii') })[tb];

// Setul ales din panoul „?” (cerut de autor: două seturi, fiecare cu tabla și piesele lui): o preferință a jucătorului,
// ca viteza, deci stă în browser, nu în salvare; fără localStorage, rămâne până se închide jocul
const CHEIE_PIESE = 'fangs-vn-tafl-piese';
let setPiese = 1;
try {
  setPiese = localStorage.getItem(CHEIE_PIESE) === '2' ? 2 : 1;
} catch {
  // fără localStorage
}
function alegeSetPiese(n) {
  setPiese = n;
  try {
    localStorage.setItem(CHEIE_PIESE, String(n));
  } catch {
    // fără localStorage
  }
}

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
  // Tabla și căsuțele setului ales: setul 2 are ecranul lui în editor („Masa regelui: setul 2”)
  const pozSet = (id) => {
    if (setPiese !== 2) return poz(id);
    const e = joc.lume.get('tafl_2');
    const i = e.obiecte.findIndex((o) => o.id === id);
    return pozitie(joc.date.aranjare.tafl_2, e.obiecte[i], i);
  };
  function aseazaTabla() {
    const tabla = el?.querySelector('.tabla-tafl');
    const grila = el?.querySelector('.grila-tafl');
    if (!tabla || !grila) return;
    aplicaPozitie(tabla, pozSet('tabla'));
    tabla.style.zIndex = '1';
    aplicaPozitie(grila, pozSet('grila'));
    grila.style.zIndex = '2';
  }
  // Cât câștigă Vale peste miză, după cât de tare joacă bătrânul (TODO echilibru, ales de Claude)
  const castigPeste = (miza, nivel) => Math.round(miza * (cfg().castig?.[nivel] ?? 1));

  // Pornit din discuția cu bătrânul, după ce Vale alege cât de tare să joace
  function porneste(nivel = 'mediu') {
    if (el) return;
    el = div(`ecran-tafl${setPiese === 2 ? ' set-2' : ''}`);
    parinte.append(el);
    s = { nivel, vale: 'd', miza: null, p: null, selectat: null, tinte: [], piese: new Map(), ocupat: false, panou: false, replica: null, luate: [] };
    construieste();
    arataMiza();
  }

  // ---------- tabla ----------
  function construieste() {
    // Masa de sub tablă (cerut de autor), văzută de sus, ca tabla; până se încarcă imaginea, se vede taverna,
    // întunecată, ca înainte (fără dreptunghiul cu numele fișierului, care ar acoperi toată scena)
    const masa = elementImagine([IMAGINE_MASA], { clasa: 'fundal-tafl', fundal: true });
    const scoateDacaLipseste = () => masa.classList.contains('lipsa') && masa.remove();
    masa.addEventListener('gata', scoateDacaLipseste);
    // Tabla e un element de interfață: până se încarcă imaginea (ui_tafl_tabla.png), lemnul și liniile sunt din CSS
    const tabla = div('obiect tabla-tafl');
    const grila = div('obiect grila-tafl');
    for (let i = 0; i < N * N; i++) {
      const c = div(`celula-tafl${i === TRON ? ' tron' : ''}${COLTURI.includes(i) ? ' colt' : ''}`);
      c.dataset.i = i;
      c.onclick = () => clicPe(i);
      grila.append(c);
    }
    grila.append(div('strat-piese-tafl'));
    // Rândul de deasupra tablei: ce spune bătrânul, că se gândește sau că e rândul lui Vale (în locul portretului)
    const replica = div('obiect replica-tafl');
    const p = poz('balon');
    aplicaPozitie(replica, p);
    replica.style.zIndex = '3';
    // Scena are 1080 px pe înălțime: scrisul crește odată cu rândul mutat și mărit în editor
    replica.style.fontSize = `${Math.round(p.scara * 1080 * 0.42)}px`;
    el.replaceChildren(masa, tabla, grila, div('gramezi-tafl'), replica, div('strat-ui-tafl'));
    aseazaTabla();
    scoateDacaLipseste();
  }

  const celula = (i) => el?.querySelector(`.celula-tafl[data-i="${i}"]`);
  const locPiesa = (piesa, i) => {
    piesa.style.left = `${((i % N) * 100) / N}%`;
    piesa.style.top = `${(Math.floor(i / N) * 100) / N}%`;
  };

  // Piesele luate stau lângă tablă (cerut de autor), în două grămezi: apărătorii (și regele) într-o parte, atacatorii în
  // cealaltă; locul grămezilor se mută în editor. Fiecare piesă cade la întâmplare, ușor rotită, cât mai departe de cele
  // căzute deja (dintre câteva locuri încercate îl alege pe cel mai liber), ca grămada să arate răsfirată, nu în rând
  function puneDeoparte(tip) {
    const id = tip === 'atacator' ? 'luate_atacatori' : 'luate_aparatori';
    const o = ecran().obiecte.find((x) => x.id === id);
    const p = poz(id);
    // Scena are 1920 × 1080 px; zona e lată cât îi spune raportul și înaltă cât scara
    const h = p.scara * 1080;
    const w = h * (o.raport || 1);
    const zona = { x: p.x * 1920 - w / 2, y: p.y * 1080 - h, w, h };
    // Cât o piesă de pe tablă (căsuța, cu 5% mai mică)
    const d = (pozSet('grila').scara * 1080) / 11 * 0.95;
    const aici = s.luate.filter((l) => l.gramada === id);
    let ales = null;
    for (let k = 0; k < 14; k++) {
      const c = { x: zona.x + d / 2 + Math.random() * Math.max(0, zona.w - d), y: zona.y + d / 2 + Math.random() * Math.max(0, zona.h - d) };
      const loc = aici.length ? Math.min(...aici.map((l) => Math.hypot(l.x - c.x, l.y - c.y))) : 1e9;
      if (!ales || loc > ales.loc) ales = { ...c, loc };
    }
    const l = { gramada: id, tip, x: ales.x, y: ales.y, rot: Math.round(Math.random() * 50 - 25) };
    s.luate.push(l);
    const e = div(`piesa-tafl luata ${tip}`);
    e.append(div('forma'));
    Object.assign(e.style, { left: `${l.x - d / 2}px`, top: `${l.y - d / 2}px`, width: `${d}px`, height: `${d}px`, zIndex: String(2 + s.luate.length), animationDuration: `${380 / viteza()}ms` });
    e.style.setProperty('--rot', `${l.rot}deg`);
    el.querySelector('.gramezi-tafl')?.append(e);
  }

  // Piesele se fac o dată, la începutul partidei; la fiecare mutare doar se deplasează, ca să se vadă cum merg
  function puneSPiesele() {
    const strat = el.querySelector('.strat-piese-tafl');
    strat.replaceChildren();
    // O partidă nouă pornește cu grămezile goale
    s.luate = [];
    el.querySelector('.gramezi-tafl')?.replaceChildren();
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

  // Ce scrie în rândul de deasupra tablei: replica bătrânului, dacă tocmai a spus ceva; altfel al cui e rândul
  function arataReplica() {
    const r = el?.querySelector('.replica-tafl');
    if (!r || !s) return;
    r.classList.remove('gand', 'indemn');
    if (s.replica) {
      // Ghilimelele trec și ele prin t(): engleza le are pe ale ei (“...”), nu pe cele românești („...”)
      r.replaceChildren(Object.assign(document.createElement('span'), { className: 'cine', textContent: `${t('Bătrânul Hagen')}: ` }), t('„{replica}”', { replica: s.replica }));
    } else if (s.gandeste) {
      r.classList.add('gand');
      r.textContent = t('Bătrânul se gândește...');
    } else if (s.p && s.miza != null && !s.p.final && s.p.rand === s.vale) {
      r.classList.add('indemn');
      r.textContent = s.selectat != null ? t('Alege unde o muți.') : t('E rândul tău: alege o piesă.');
    } else r.textContent = '';
    r.hidden = !r.textContent;
  }
  // „stare” (fața bătrânului) a rămas din vremea portretului; acum contează doar ce spune
  function seteazaBatran(stare, balon) {
    if (!s) return;
    s.replica = balon && balon !== '...' ? balon : null;
    arataReplica();
  }
  // Ce spune bătrânul la masă (ciorne în config.json, „replici”); rămâne puțin, apoi dispare. „vorbestePana” ține
  // balonul pe ecran cât să poată fi citit, chiar dacă bătrânul începe să se gândească la mutarea lui
  let pana = 0;
  let vorbestePana = 0;
  function spune(cheie, stare = 'normal') {
    const lista = cfg().replici?.[cheie];
    if (!lista?.length) return;
    seteazaBatran(stare, alege([].concat(lista)));
    const acum = ++pana;
    vorbestePana = Date.now() + 2200 / viteza();
    setTimeout(() => acum === pana && s && !s.gandeste && !s.rezultat && seteazaBatran('normal'), 2600 / viteza());
  }

  // ---------- miza și tabăra ----------
  function arataRegulile() {
    const fundal = div('fundal-reguli');
    const foaie = div('foaie-inv hartie-reguli');
    foaie.append(div('titlu-reguli', t('Masa regelui')), div('text-reguli', cfg().reguli), buton(t('Am înțeles'), () => fundal.remove(), 'inchide-reguli'));
    fundal.append(foaie);
    fundal.onclick = (e) => e.target === fundal && fundal.remove();
    el.append(fundal);
  }

  function arataMiza() {
    const strat = el.querySelector('.strat-ui-tafl');
    const panou = div('panou-zaruri-miza panou-tafl-miza');
    const titlu = div('rand-titlu-zaruri');
    titlu.append(div('titlu-zaruri', t('Masa regelui · {nivel}', { nivel: numeNivel(s.nivel) })), Object.assign(buton('?', arataRegulile, 'mic buton-intrebare'), { title: t('Regulile') }));
    const tabere = div('alegere-tabara');
    // „tb”, nu „t”: altfel ar acoperi t()-ul traducerii
    for (const tb of ['d', 'a']) {
      const b = buton(numeTabara(tb), () => ((s.vale = tb), arataMiza()), `tabara${s.vale === tb ? ' ales' : ''}`);
      tabere.append(b);
    }
    const alegeri = div('alegeri-miza');
    for (const m of cfg().mize) {
      const b = buton('', () => incepe(m), 'miza');
      b.append(div('', t('Pui {n} monede', { n: m })), div('ce-pun', t('Câștigi încă {n}', { n: castigPeste(m, s.nivel) })));
      b.disabled = joc.stare.bani < m;
      alegeri.append(b);
    }
    const faraBani = joc.stare.bani < Math.min(...cfg().mize);
    // Pe rânduri, fiecare cu eticheta lui (cerut de autor: butoanele mai bine așezate): tabăra, miza, apoi „Nu acum”,
    // mai mic, pe rândul lui
    panou.append(
      titlu,
      div('text-zaruri', faraBani ? cfg().texte.faraBani : cfg().texte.oferta),
      div('eticheta-miza-tafl', t('Tabăra ta')),
      tabere,
      div('eticheta-miza-tafl', t('Miza')),
      alegeri,
      buton(t('Nu acum'), inchide, 'renunta nu-acum-tafl'),
    );
    strat.replaceChildren(panou);
    // În spatele panoului se vede deja tabla, cu piesele la locul lor
    s.p = partidaNoua();
    puneSPiesele();
  }

  function incepe(miza) {
    joc.stare.bani -= miza;
    // Miza se salvează pe loc, ca la zaruri (decis de autor, P87): un refresh în timpul partidei o pierde, ca o
    // partidă abandonată, în loc s-o dea înapoi
    joc.salveaza();
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
      // Piesa luată se așază lângă tablă, în grămada ei
      const tip = ['atacator', 'aparator', 'rege'].find((felPiesa) => x?.classList.contains(felPiesa));
      if (tip) puneDeoparte(tip);
    }
    joc.sunet.efect(capturate.length ? 'tafl_captura' : 'tafl_piesa');
    if (s.rezultat) return;
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
    // O replică abia spusă (de exemplu „Încep eu.”) rămâne pe ecran cât se gândește; altfel apare „...”
    const ramas = vorbestePana - Date.now();
    if (ramas <= 0) seteazaBatran('normal', '...');
    deseneaza();
    const g = cfg().gandire || { min: 700, max: 1600 };
    await asteapta(Math.max(g.min + Math.random() * (g.max - g.min), ramas * viteza()));
    // Partida s-a putut termina cât se gândea („Renunț”): atunci nu mai mută
    if (!s || s.rezultat || s.p.final) return;
    const m = alegeMutarea(s.p, s.nivel);
    s.gandeste = false;
    seteazaBatran('normal');
    if (!m) return final();
    faMutarea(m[0], m[1]);
  }

  // ---------- sfârșitul ----------
  // Cerut la desen, nu făcut o dată, la pornirea jocului (creeazaTafl rulează la pornire): așa urmează limba aleasă
  const motiv = (m) =>
    ({
      colt: t('Regele a scăpat într-un colț.'),
      rege: t('Regele a fost prins.'),
      incercuit: t('Apărătorii au fost încercuiți.'),
      blocat: t('N-a mai rămas nicio mutare.'),
      repetare: t('Aceeași poziție a treia oară: remiză.'),
      lunga: t('Partida a ținut prea mult: remiză.'),
      renunt: t('Ai renunțat.'),
    })[m];

  function final() {
    if (s.rezultat) return;
    const f = s.p.final;
    s.rezultat = f.castiga == null ? 'remiza' : f.castiga === s.vale ? 'castig' : 'pierdere';
    const st = joc.stare;
    if (s.rezultat === 'castig') {
      s.primit = s.miza + castigPeste(s.miza, s.nivel);
      st.bani += s.primit;
      // De două ori pe zi poate câștiga (decis de autor, maxCastiguriPeZi): la ultima victorie bătrânul pune marcajul și
      // nu mai joacă în ziua aceea. Ziua și marcajul iau ora de la sfârșitul partidei (ora ei se adaugă abia la plecare)
      const sfarsit = st.minute + (cfg().minute || 0);
      const zi = Math.floor(sfarsit / 1440);
      if (st.tafl?.zi !== zi) st.tafl = { zi, castiguri: 0 };
      st.tafl.castiguri++;
      s.ultimaVictorie = st.tafl.castiguri >= (cfg().maxCastiguriPeZi || 1);
      if (s.ultimaVictorie) (st.marcaje ||= {}).tafl_castig = sfarsit;
    } else if (s.rezultat === 'remiza') st.bani += s.miza;
    joc.actualizeazaHud();
    // Replicile de dinainte nu mai au voie să șteargă balonul cu rezultatul
    pana++;
    vorbestePana = 0;
    seteazaBatran(s.rezultat === 'castig' ? 'normal' : 'zambet', alege([].concat(cfg().replici?.[s.rezultat] || [])));
    deseneaza();
  }

  function renunta() {
    // „Renunț|la partidă”: pe ecran tot „Renunț”, dar cu engleza lui („Give Up”), nu cea de la jocul nou („Cancel”),
    // care aici ar spune pe dos ce face butonul: pierzi partida
    joc.intreaba(t('Renunți la partidă? Pierzi miza.'), t('Renunț|la partidă'), t('Mai joc')).then((da) => {
      if (!da || !s?.p || s.p.final) return;
      s.p = { ...s.p, final: { castiga: s.vale === 'a' ? 'd' : 'a', motiv: 'renunt' } };
      final();
    });
  }

  function inchide() {
    const rezultat = s?.rezultat;
    const ultimaVictorie = s?.ultimaVictorie;
    el?.remove();
    el = null;
    s = null;
    if (!rezultat) return joc.dupaActiune();
    // După prima victorie bătrânul cere revanșa; după ultima din ziua aceea, spune că ajunge
    joc.dupaTafl(rezultat, cfg().minute, rezultat === 'castig' && ultimaVictorie ? 'castigUltim' : rezultat);
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
    arataReplica();
    if (s.miza == null) return;
    const strat = el.querySelector('.strat-ui-tafl');
    // Butonul „?” din stânga-sus deschide și închide panoul (decis de autor); la sfârșit panoul se deschide singur,
    // pentru rezultat și „Pleacă de la masă”
    const intrebare = buton('?', () => ((s.panou = !s.panou), deseneaza()), `intrebare-tafl${s.panou || s.rezultat ? ' deschis' : ''}`, false);
    intrebare.title = t('Partida');
    if (!s.panou && !s.rezultat) return strat.replaceChildren(intrebare, butonViteza());
    const panou = div('panou-tafl');
    const numara = (f) => s.p.tabla.reduce((n, p) => n + (f(p) ? 1 : 0), 0);
    panou.append(
      div('titlu-tafl', t('Masa regelui · {nivel}', { nivel: numeNivel(s.nivel) })),
      div('rand-tafl', t('Joci cu: {tabara}', { tabara: numeTabara(s.vale) })),
      div('rand-tafl', t('Miza: {n} monede', { n: s.miza })),
    );
    panou.append(div('rand-tafl mic', t('Atacatori: {atacatori} · Apărători: {aparatori}', { atacatori: numara((p) => p === ATAC), aparatori: numara((p) => p === APAR) })));
    // Cele două seturi, tabla și piesele (cerut de autor): un singur buton, cât celelalte din panou (două butoane
    // înguste nu încăpeau pe pergament), care trece de la un set la celălalt, pe loc, chiar în mijlocul partidei
    const seturi = buton(t('Piesele: setul {n}', { n: setPiese }), () => {
      alegeSetPiese(setPiese === 2 ? 1 : 2);
      el.classList.toggle('set-2', setPiese === 2);
      aseazaTabla();
      deseneaza();
    }, 'set-piese');
    seturi.title = t('Schimbă tabla și piesele');
    if (s.rezultat) {
      const titlu = { castig: t('Ai câștigat!'), pierdere: t('Ai pierdut.'), remiza: t('Remiză.') }[s.rezultat];
      const bani = {
        castig: t('Primești {n} monede.', { n: s.primit }),
        pierdere: t('Pierzi cele {n} monede.', { n: s.miza }),
        remiza: t('Îți iei înapoi cele {n} monede.', { n: s.miza }),
      }[s.rezultat];
      panou.append(div('rezultat-tafl', titlu), div('rand-tafl', motiv(s.p.final.motiv) || ''), div('rand-tafl', bani), buton(t('Pleacă de la masă'), inchide));
    } else {
      const randul = s.p.rand === s.vale ? (s.selectat != null ? t('Alege unde o muți.') : t('E rândul tău: alege o piesă.')) : t('Bătrânul se gândește...');
      panou.append(div('rand-tafl acum', randul), buton(t('? Regulile'), arataRegulile), seturi, buton(t('Renunț|la partidă'), renunta));
    }
    strat.replaceChildren(intrebare, panou, butonViteza());
  }

  return { porneste, activ: () => !!el };
}
