// Jocul de zaruri cu paznicii de la poartă (un fel de Liar's Dice): fiecare are 3 zaruri sub un pahar,
// se licitează câte zaruri cu o anumită față sunt pe toată masa, iar următorul poate licita mai sus sau poate striga „Mincinosule!”.
// Cine greșește pierde un zar; câștigă ultimul rămas cu zaruri. Fiecare joacă pe cont propriu.

import { elementImagine } from './imagini.js';
import { pozitie, aplicaPozitie } from './scena.js';
// Pauzele (amestecat, gândit, citit) se scurtează cu viteza aleasă de jucător (×1 / ×2 / ×4)
import { asteapta, butonViteza } from './viteza.js';

// Stările unui orc la masă: stă, amestecă zarurile în pahar, se gândește înainte să liciteze
const STARI_ORC = ['normal', 'amesteca', 'gandeste'];
// Unde stau punctele pe fiecare față (căsuțele 1-9 ale grilei, pe rânduri)
const PUNCTE = { 1: [5], 2: [3, 7], 3: [3, 5, 7], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] };

const div = (clasa, text) => Object.assign(document.createElement('div'), { className: clasa, textContent: text ?? '' });
function buton(text, clic, clasa = '') {
  const b = document.createElement('button');
  b.className = `buton ${clasa}`;
  b.textContent = text;
  b.onclick = clic;
  return b;
}
const zarAleator = () => 1 + Math.floor(Math.random() * 6);
const alege = (lista) => lista[Math.floor(Math.random() * lista.length)];

const CANTITATI = ['', 'un zar', 'două zaruri', 'trei zaruri', 'patru zaruri', 'cinci zaruri', 'șase zaruri', 'șapte zaruri', 'opt zaruri', 'nouă zaruri'];
export const textLicitatie = (l) => `${CANTITATI[l.q] || `${l.q} zaruri`} de ${l.f}`;

// O licitație e mai mare dacă are mai multe zaruri, sau tot atâtea, dar cu o față mai mare
export const maiMare = (l, fata) => !fata || l.q > fata.q || (l.q === fata.q && l.f > fata.f);

// Cât de sigur e că pe masă sunt măcar q zaruri cu fața f, știind doar zarurile tale (restul pot fi orice)
export function sansa(q, f, proprii, necunoscute) {
  const nevoie = q - proprii.filter((x) => x === f).length;
  if (nevoie <= 0) return 1;
  if (nevoie > necunoscute) return 0;
  let p = 0;
  let comb = 1;
  for (let i = 0; i <= necunoscute; i++) {
    if (i > 0) comb = (comb * (necunoscute - i + 1)) / i;
    if (i >= nevoie) p += comb * (1 / 6) ** i * (5 / 6) ** (necunoscute - i);
  }
  return p;
}

// Ce face un orc la rândul lui. Nu vede decât zarurile lui, ca un jucător cinstit.
// Strigă „Mincinosule!” când licitația de dinainte pare mai puțin probabilă decât cea mai bună licitație a lui;
// uneori blufează (licitează ceva ce nu prea are).
export function decizieOrc(zaruri, licitatie, total, bluf) {
  const necunoscute = total - zaruri.length;
  if (!licitatie) {
    // Deschiderea: fața din care are cele mai multe, cât s-ar aștepta să fie pe masă
    const numara = (f) => zaruri.filter((x) => x === f).length;
    const fete = [1, 2, 3, 4, 5, 6].sort((a, b) => numara(b) - numara(a) || Math.random() - 0.5);
    const f = Math.random() < bluf ? zarAleator() : fete[0];
    const q = Math.max(1, Math.min(total, numara(f) + Math.floor((necunoscute / 6) * (0.5 + Math.random()))));
    return { q, f };
  }
  const candidati = [];
  for (let q = licitatie.q; q <= Math.min(total, licitatie.q + 2); q++) {
    for (let f = 1; f <= 6; f++) {
      if (maiMare({ q, f }, licitatie)) candidati.push({ q, f, p: sansa(q, f, zaruri, necunoscute) });
    }
  }
  const crede = sansa(licitatie.q, licitatie.f, zaruri, necunoscute);
  const cel = candidati.sort((a, b) => b.p - a.p || a.q - b.q || Math.random() - 0.5)[0];
  const zgomot = (Math.random() - 0.5) * 0.2;
  if (!cel || 1 - crede + zgomot > cel.p) return { mincinos: true };
  const blufuri = candidati.filter((c) => c.p >= 0.15 && c.p < cel.p);
  const ales = Math.random() < bluf && blufuri.length ? alege(blufuri) : cel;
  return { q: ales.q, f: ales.f };
}

export function creeazaZaruri(parinte, joc) {
  let el = null;
  let s = null; // starea partidei

  const cfg = () => joc.date.config.jocZaruri;
  const nume = (id) => joc.inventar.def(id)?.nume || id;

  // Zarul desenat din cod (punctele pe o grilă 3×3), până încarcă autorul imaginile ui_zar_<f>.png
  function zar(f, clasa = '') {
    const z = div(`zar ${clasa}`);
    z.dataset.f = f;
    for (const c of PUNCTE[f]) {
      const p = div('punct');
      p.style.gridRow = String(Math.ceil(c / 3));
      p.style.gridColumn = String(((c - 1) % 3) + 1);
      z.append(p);
    }
    return z;
  }

  // Ce pun orcii pe masă: întâi un lucru luat de la Vale la o pedeapsă (îl poate câștiga înapoi), altfel ceva din lista mizei
  function oferte() {
    const st = joc.stare;
    const luat = st.confiscate?.[0];
    if (luat) {
      const miza = Math.max(cfg().mize[0], Math.round((joc.inventar.def(luat)?.pret || 2) / 2));
      return [{ miza, premiu: luat, recuperat: true }];
    }
    return cfg().mize.map((miza) => ({ miza, premiu: alege(cfg().premii[String(miza)] || ['paine']) }));
  }

  function porneste() {
    const st = joc.stare;
    const zi = Math.floor(st.minute / 1440) + 1;
    if (st.zaruri?.zi !== zi) st.zaruri = { zi, castiguri: 0 };
    if (st.zaruri.castiguri >= cfg().maxCastiguriPeZi) return joc.replica('paznic_orc_1', 'suparat', cfg().replici.refuz);
    const lista = oferte();
    if (!lista.some((o) => st.bani >= o.miza)) return joc.replica('paznic_orc_1', 'rade', cfg().replici.faraBani);
    el = div('ecran-zaruri');
    parinte.append(el);
    arataMiza(lista);
  }

  function arataMiza(lista) {
    const panou = div('panou-zaruri-miza');
    panou.append(div('titlu-zaruri', 'Zaruri cu paznicii'), div('text-zaruri', cfg().replici.oferta));
    for (const o of lista) {
      const b = buton(`Pui ${o.miza} monede · ei pun: ${nume(o.premiu)}${o.recuperat ? ' (luat de orci)' : ''}`, () => incepe(o), 'miza');
      b.disabled = joc.stare.bani < o.miza;
      panou.append(b);
    }
    panou.append(buton('Nu acum', inchide, 'renunta'));
    panou.append(div('ajutor-zaruri', regulile));
    // Masa se vede deja în spatele panoului cu miza
    construiesteMasa();
    el.querySelector('.strat-ui-zaruri').replaceChildren(panou);
  }

  const regulile =
    'Fiecare aruncă 3 zaruri sub pahar și le vede doar pe ale lui. Pe rând, spuneți câte zaruri cu o față crezi că sunt pe toată masa (de exemplu „două zaruri de 5”). ' +
    'Următorul spune mai multe zaruri, sau tot atâtea cu o față mai mare, ori strigă „Mincinosule!”. Atunci se ridică paharele: dacă sunt cel puțin atâtea, pierde un zar cel care a strigat; dacă nu, cel care a mințit. Câștigă ultimul rămas cu zaruri.';

  function incepe(oferta) {
    joc.stare.bani -= oferta.miza;
    joc.actualizeazaHud();
    const n = cfg().zaruri;
    s = {
      oferta,
      jucatori: [{ id: 'vale', nume: 'Vale', ramase: n }, ...cfg().jucatori.map((j) => ({ ...j, ramase: n }))],
      licitatie: null,
      rand: Math.floor(Math.random() * 3),
      istoric: [],
      dezvaluit: false,
      privit: null,
      putere: joc.conditii(cfg().putere?.conditii) && Object.keys(cfg().putere?.conditii || {}).length > 0,
      putereFolosita: false,
      alegePahar: false,
      baloane: {},
      stari: {},
    };
    runda();
  }

  const activi = () => s.jucatori.filter((j) => j.ramase > 0);
  const total = () => activi().reduce((t, j) => t + j.ramase, 0);
  const urmatorul = (i) => {
    for (let k = 1; k <= s.jucatori.length; k++) {
      const j = (i + k) % s.jucatori.length;
      if (s.jucatori[j].ramase > 0) return j;
    }
    return i;
  };

  async function runda() {
    for (const j of activi()) j.zaruri = Array.from({ length: j.ramase }, zarAleator);
    Object.assign(s, { licitatie: null, istoric: [], dezvaluit: false, privit: null, alegePahar: false, baloane: {}, aruncare: true });
    if (s.jucatori[s.rand].ramase === 0) s.rand = urmatorul(s.rand);
    // Toți amestecă zarurile în pahar, apoi le trântesc pe buturugă
    for (const j of activi()) if (j.id !== 'vale') seteazaStare(j.id, 'amesteca');
    deseneaza();
    joc.sunet.efect('zaruri_agitare');
    await asteapta((cfg().amestecare ?? 1.6) * 1000);
    if (!el) return;
    joc.sunet.efect('zaruri_aruncare');
    for (const j of s.jucatori) if (j.id !== 'vale') seteazaStare(j.id, 'normal');
    s.aruncare = false;
    tura();
  }

  async function tura() {
    if (!el) return;
    const j = s.jucatori[s.rand];
    deseneaza();
    if (j.id === 'vale') return; // așteaptă butoanele
    // Se gândește un timp, când mai puțin, când mai mult, apoi spune
    const g = cfg().gandire || { min: 1.5, max: 4.5 };
    delete s.baloane[j.id];
    seteazaStare(j.id, 'gandeste');
    deseneaza();
    await asteapta((g.min + Math.random() * (g.max - g.min)) * 1000);
    if (!el) return;
    seteazaStare(j.id, 'normal');
    const d = decizieOrc(j.zaruri, s.licitatie, total(), cfg().bluf);
    if (d.mincinos) {
      if (!(await spune(j, alege(cfg().replici.mincinos)))) return;
      return verifica(j);
    }
    liciteaza(j, d);
  }

  // Un orc spune ceva și jocul așteaptă puțin, ca jucătorul să apuce să citească înainte să vorbească următorul
  async function spune(j, text) {
    s.baloane = { ...s.baloane, [j.id]: text };
    s.citire = { nume: j.nume, text };
    deseneaza();
    await asteapta((cfg().citire ?? 2.5) * 1000);
    if (!el) return false;
    s.citire = null;
    return true;
  }

  async function liciteaza(j, l) {
    s.licitatie = { ...l, cine: j.id };
    s.istoric.push({ nume: j.nume, text: textLicitatie(l) });
    // Baloanele celorlalți rămân pe ecran până la runda următoare, ca să se vadă ce a spus fiecare
    if (j.id !== 'vale' && !(await spune(j, alege(cfg().replici.licitatie).replace('{licitatie}', textLicitatie(l))))) return;
    s.rand = urmatorul(s.rand);
    tura();
  }

  async function verifica(acuzator) {
    const l = s.licitatie;
    const bidder = s.jucatori.find((j) => j.id === l.cine);
    const gasite = activi().reduce((t, j) => t + j.zaruri.filter((x) => x === l.f).length, 0);
    const adevarat = gasite >= l.q;
    const pierde = adevarat ? acuzator : bidder;
    const castiga = adevarat ? bidder : acuzator;
    s.dezvaluit = true;
    const cate = gasite === 0 ? `Pe masă nu e niciun zar de ${l.f}.` : `Pe masă ${gasite === 1 ? 'e' : 'sunt'} ${CANTITATI[gasite] || `${gasite} zaruri`} de ${l.f}.`;
    s.rezultat = `${cate} ${bidder.nume} ${adevarat ? 'a spus adevărul' : 'a mințit'}: ${pierde.nume} pierde un zar.`;
    if (castiga.id !== 'vale') s.baloane = { ...s.baloane, [castiga.id]: alege(cfg().replici.castigaRunda) };
    if (pierde.id !== 'vale') s.baloane = { ...s.baloane, [pierde.id]: alege(cfg().replici.pierdeRunda) };
    s.pierde = pierde;
    deseneaza();
  }

  // După ce s-au văzut zarurile: pierzătorul aruncă un zar și începe runda următoare (dacă mai are zaruri)
  function continua() {
    const pierde = s.pierde;
    pierde.ramase--;
    s.pierde = null;
    s.rand = s.jucatori.indexOf(pierde);
    const vale = s.jucatori[0];
    if (vale.ramase === 0) return final(false);
    if (activi().length === 1) return final(true);
    runda();
  }

  function final(aCastigat) {
    s.final = aCastigat;
    const st = joc.stare;
    if (aCastigat) {
      st.bani += s.oferta.miza;
      joc.primeste(s.oferta.premiu, 1);
      if (s.oferta.recuperat) st.confiscate.splice(st.confiscate.indexOf(s.oferta.premiu), 1);
      st.zaruri.castiguri++;
    }
    joc.actualizeazaHud();
    deseneaza();
  }

  function inchide() {
    const terminat = s && s.final !== undefined;
    const aCastigat = s?.final;
    el?.remove();
    el = null;
    s = null;
    if (!terminat) return joc.dupaActiune();
    joc.dupaZaruri(aCastigat ? cfg().replici.valeCastiga : cfg().replici.valePierde, aCastigat, cfg().minute);
  }

  // ---------- desenul ----------

  // ---------- desenul ----------
  // Masa (fundalul, orcii, paharele) se construiește o singură dată, ca imaginile să nu clipească;
  // la fiecare schimbare se redesenează doar stratul de deasupra (zaruri, baloane, panoul lui Vale).

  const ecran = () => joc.lume.get('zaruri');
  const aranjare = () => joc.date.aranjare.zaruri;
  const poz = (id) => {
    const i = ecran().obiecte.findIndex((o) => o.id === id);
    return pozitie(aranjare(), ecran().obiecte[i], i);
  };

  function construiesteMasa() {
    const masa = div('masa-zaruri');
    masa.append(elementImagine([ecran().imagine], { clasa: 'fundal-zaruri', fundal: true, eticheta: ecran().imagine }));
    for (const o of ecran().obiecte) {
      const p = poz(o.id);
      if (o.tip === 'figura') {
        // Câte o imagine pentru fiecare stare a orcului, toate în același loc; se vede doar cea de acum
        const loc = div(`obiect orc-zaruri stare-normal`);
        loc.dataset.orc = o.id;
        aplicaPozitie(loc, p);
        for (const st of STARI_ORC) {
          const candidati = st === 'normal' ? [o.imagine] : [o.imagine.replace(/\.png$/, `_${st}.png`), o.imagine];
          const img = elementImagine(candidati, { clasa: `imagine-stare ${st}`, raport: 0.8, eticheta: candidati[0] });
          loc.append(img);
        }
        masa.append(loc);
      } else {
        const loc = div('obiect pahar-zaruri');
        loc.dataset.orc = o.pentru;
        aplicaPozitie(loc, p);
        // Paharele stau pe buturugă, în fața orcilor
        loc.style.zIndex = '2000';
        loc.style.aspectRatio = '1';
        loc.append(div('pahar-zar'));
        masa.append(loc);
      }
    }
    // Prim-planul desenat în editor (buturuga): bucata din fundal se pune din nou peste orci, ca să-i taie;
    // stă sub pahare, zaruri și baloane, deci taie doar orcii
    for (const poligon of aranjare()?.primPlan || []) {
      if (poligon.length < 3) continue;
      const pp = elementImagine([ecran().imagine], { clasa: 'fundal-zaruri prim-plan-zaruri', fundal: true });
      pp.style.clipPath = `polygon(${poligon.map(([x, y]) => `${x * 100}% ${y * 100}%`).join(', ')})`;
      masa.append(pp);
    }
    const strat = div('strat-ui-zaruri');
    masa.append(strat);
    el.replaceChildren(masa);
  }

  function seteazaStare(id, st) {
    s.stari[id] = st;
    const loc = el?.querySelector(`.orc-zaruri[data-orc="${id}"]`);
    if (loc) loc.className = `obiect orc-zaruri stare-${st}`;
  }

  // Un element așezat în procente pe masă, deasupra unui obiect aranjat (balonul deasupra orcului, zarurile pe pahar)
  function peste(clasa, p, sus = 0) {
    const e = div(clasa);
    e.style.left = `${p.x * 100}%`;
    e.style.top = `${(p.y - sus) * 100}%`;
    return e;
  }

  function deseneaza() {
    if (!el || !s) return;
    if (!el.querySelector('.masa-zaruri')) construiesteMasa();
    const strat = el.querySelector('.strat-ui-zaruri');
    const [vale, ...orci] = s.jucatori;
    const elemente = [];
    for (const j of orci) {
      const po = poz(j.id);
      const pp = poz(`pahar_${j.id}`);
      const laRand = s.jucatori[s.rand] === j && !s.dezvaluit && s.final === undefined;
      // Paharul: pe buturugă (răsturnat peste zaruri), în mâna orcului cât amestecă, ridicat când se văd zarurile
      const pahar = el.querySelector(`.pahar-zaruri[data-orc="${j.id}"]`);
      const vede = s.dezvaluit || s.privit === j.id;
      pahar.classList.toggle('ascuns', j.ramase === 0 || s.stari[j.id] === 'amesteca');
      pahar.classList.toggle('ridicat', vede);
      pahar.classList.toggle('de-ales', s.alegePahar && !vede && j.ramase > 0);
      pahar.onclick = s.alegePahar && !vede && j.ramase > 0 ? () => ((s.privit = j.id), (s.putereFolosita = true), (s.alegePahar = false), deseneaza()) : null;
      if (vede && j.ramase > 0) {
        const rand = peste('rand-zaruri pe-masa', pp);
        for (const f of j.zaruri) rand.append(zar(f, s.dezvaluit && f === s.licitatie?.f ? 'potrivit' : ''));
        elemente.push(rand);
      }
      if (s.privit === j.id && !s.dezvaluit) elemente.push(Object.assign(peste('nota-privit', pp, pp.scara * 1.1), { textContent: 'Te-ai uitat pe furiș. Nu și-a dat seama.' }));
      // Plăcuța cu numele și zarurile rămase, sub orc
      const placa = peste(`placa-jucator${laRand ? ' la-rand' : ''}${j.ramase === 0 ? ' iesit' : ''}`, po, po.scara);
      placa.append(div('nume-jucator', j.nume), jetoane(j));
      if (j.ramase === 0) placa.append(div('text-iesit', 'a ieșit din joc'));
      elemente.push(placa);
      if (s.baloane[j.id]) {
        const b = peste('balon', po, po.scara + 0.06);
        b.textContent = s.baloane[j.id];
        elemente.push(b);
      } else if (s.stari[j.id] === 'gandeste') {
        elemente.push(Object.assign(peste('balon gand', po, po.scara + 0.06), { textContent: '...' }));
      }
    }
    // Vale (privirea noastră): zarurile lui, jos, deasupra panoului
    const sub = div('zona-vale');
    sub.append(div(`placa-jucator${s.jucatori[s.rand] === vale && !s.dezvaluit && s.final === undefined ? ' la-rand' : ''}`));
    sub.firstChild.append(div('nume-jucator', 'Tu'), jetoane(vale));
    const randVale = div('rand-zaruri');
    if (vale.ramase > 0) for (const f of vale.zaruri) randVale.append(zar(f, `${s.aruncare ? 'rostogolire' : ''}${s.dezvaluit && f === s.licitatie?.f ? ' potrivit' : ''}`));
    sub.append(randVale);
    // Regulile stau ascunse sub un buton, ca să nu acopere orcii
    const ajutor = buton(s.ajutor ? '✕ Regulile' : '? Regulile', () => ((s.ajutor = !s.ajutor), deseneaza()), 'mic buton-reguli');
    // Fără titlu și istoric sus (decis de autor): licitațiile se văd în baloane, interfața rămâne curată
    strat.replaceChildren(...elemente, sub, panouVale(), ajutor, butonViteza(), ...(s.ajutor ? [Object.assign(div('ajutor-zaruri mic'), { textContent: regulile })] : []));
  }

  function jetoane(j) {
    const r = div('zaruri-ramase');
    for (let i = 0; i < cfg().zaruri; i++) r.append(div(i < j.ramase ? 'zar-ramas plin' : 'zar-ramas'));
    return r;
  }

  function panouVale() {
    const p = div('panou-zaruri');
    if (s.final !== undefined) {
      p.append(div('text-zaruri mare', s.final ? `Ai câștigat! Primești ${nume(s.oferta.premiu)} și îți iei înapoi cele ${s.oferta.miza} monede.` : `Ai pierdut cele ${s.oferta.miza} monede.`));
      p.append(buton('Pleacă de la masă', inchide));
      return p;
    }
    if (s.dezvaluit) {
      p.append(div('text-zaruri mare', s.rezultat), buton('Continuă', continua));
      return p;
    }
    const j = s.jucatori[s.rand];
    if (s.citire) {
      p.append(div('text-zaruri mare', `${s.citire.nume}: „${s.citire.text}”`));
      return p;
    }
    if (j.id !== 'vale' || s.aruncare) {
      p.append(div('text-zaruri', s.aruncare ? 'Se aruncă zarurile...' : `${j.nume} se gândește...`));
      return p;
    }
    // Rândul lui Vale: alege câte zaruri și ce față, pornind de la cea mai mică licitație permisă
    const l = s.licitatie;
    s.alegere ||= l ? (l.f < 6 ? { q: l.q, f: l.f + 1 } : { q: l.q + 1, f: 1 }) : { q: 1, f: s.jucatori[0].zaruri[0] };
    const a = s.alegere;
    const cantitate = div('alegere-cantitate');
    const minus = buton('−', () => ((a.q = Math.max(1, a.q - 1)), deseneaza()), 'mic');
    const plus = buton('+', () => ((a.q = Math.min(total(), a.q + 1)), deseneaza()), 'mic');
    cantitate.append(minus, div('cantitate', CANTITATI[a.q] || `${a.q} zaruri`), plus, div('de', 'de'));
    const fete = div('alegere-fata');
    for (let f = 1; f <= 6; f++) {
      const z = zar(f, f === a.f ? 'ales' : '');
      z.onclick = () => ((a.f = f), deseneaza());
      fete.append(z);
    }
    const ok = maiMare(a, l) && a.q <= total();
    const lic = buton(`Licitează: ${textLicitatie(a)}`, () => {
      s.alegere = null;
      liciteaza(s.jucatori[0], { q: a.q, f: a.f });
    });
    lic.disabled = !ok;
    const randButoane = div('butoane-zaruri');
    randButoane.append(lic);
    if (l) {
      const m = buton('Mincinosule!', () => {
        s.alegere = null;
        s.baloane = {};
        verifica(s.jucatori[0]);
      }, 'mincinos');
      randButoane.append(m);
    }
    if (s.putere && !s.putereFolosita) {
      randButoane.append(buton(s.alegePahar ? 'Alege un pahar...' : '👁 Uită-te sub un pahar', () => ((s.alegePahar = !s.alegePahar), deseneaza()), 'putere'));
    }
    const ultima = l && `${s.jucatori.find((x) => x.id === l.cine).nume} a spus: ${textLicitatie(l)}. Licitează mai sus sau strigă „Mincinosule!”.`;
    p.append(div('text-zaruri', ultima || 'Tu începi. Câte zaruri de o față crezi că sunt pe masă?'), cantitate, fete, randButoane);
    if (!ok) p.append(div('nota-zaruri', l ? `Trebuie mai mult decât „${textLicitatie(l)}”.` : ''));
    return p;
  }

  return { porneste, activ: () => !!el };
}
