import { elementImagine } from './imagini.js';
import { iconita } from './ecranInventar.js';
import { LATIME, INALTIME, pozitie, aplicaPozitie, randeaza } from './scena.js';
import { context } from './stare.js';

// Mini-jocurile de la muncă și de la cules (decis de autor): fiecare stă pe tot ecranul, peste imaginea muncii,
// și întoarce un scor. Se pot opri din Opțiuni; atunci munca dă cât dădea înainte (codul din actiuni.js).
// Vitezele sunt fixe, nu urmează butonul de viteză din luptă: aici chiar contează reflexele.

const div = (clasa, text) => Object.assign(document.createElement('div'), { className: clasa, textContent: text ?? '' });
const pauza = (ms) => new Promise((r) => setTimeout(r, ms));
function buton(text, clic) {
  const b = document.createElement('button');
  b.className = 'buton buton-mic-meniu';
  b.textContent = text;
  b.onclick = (e) => (e.stopPropagation(), clic());
  return b;
}

// Punct în poligon (zona desenată de autor în editor), cu coordonate 0–1
function inPoligon([x, y], poligon) {
  let in_ = false;
  for (let i = 0, j = poligon.length - 1; i < poligon.length; j = i++) {
    const [xi, yi] = poligon[i];
    const [xj, yj] = poligon[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) in_ = !in_;
  }
  return in_;
}

export function creeazaMiniJocuri(parinte, joc) {
  // Cadrul comun: imaginea muncii în fundal, întunecată puțin, cu titlul și îndemnul sus; jocul pornește din „Începe”,
  // ca jucătorul să apuce să citească ce are de făcut
  function ecran(imagine, titlu, indemn) {
    const el = div('mini-joc');
    const sus = div('mini-sus');
    sus.append(div('mini-titlu', titlu), div('mini-indemn', indemn));
    const scor = div('mini-scor');
    const loc = div('mini-loc');
    el.append(elementImagine([imagine], { clasa: 'fundal', fundal: true }), div('mini-umbra'), loc, sus, scor);
    parinte.append(el);
    const incepe = () =>
      new Promise((r) => {
        const b = buton('Începe', () => (b.remove(), r()));
        b.classList.add('mini-incepe');
        el.append(b);
      });
    // Rezultatul stă puțin pe ecran, apoi se închide
    const incheie = async (text) => {
      el.append(div('mini-rezultat', text));
      await pauza(1600);
      el.remove();
    };
    return { el, loc, scor, incepe, incheie };
  }

  // Un mesaj scurt în mijloc („Lovit!”, „Ratat”), care se stinge singur
  function clipa(el, text, bine) {
    const m = div(`mini-clipa ${bine ? 'bine' : 'rau'}`, text);
    el.append(m);
    setTimeout(() => m.remove(), 650);
  }

  // O bucată a mini-jocului (inelul, bara, cercul, sacul), pusă unde a așezat-o autorul pe imaginea muncii
  // (editor: Aranjare → Ecrane → „Mini-joc: …”); restul bucății se desenează în ea, proporțional cu mărimea ei
  function piesa(e, idEcran, id) {
    const o = joc.lume.get(idEcran)?.obiecte.find((x) => x.id === id);
    const p = pozitie(joc.date.aranjare[idEcran], o, 0);
    const el = div(`mini-piesa mini-piesa-${id} obiect`);
    // Sub mesajele „Lovit!” și sub rezultat, oricât de jos ar sta
    el.dataset.zFix = '1';
    aplicaPozitie(el, p);
    const h = p.scara * INALTIME;
    el.style.width = `${h * o.raport}px`;
    e.loc.append(el);
    return { el, h };
  }

  // Așteaptă un clic (sau Spațiu) pe ecranul jocului; întoarce momentul lui
  const clic = (el) =>
    new Promise((r) => {
      const gata = () => (el.removeEventListener('pointerdown', laClic), removeEventListener('keydown', laTasta), r(performance.now()));
      const laClic = (e) => e.button === 0 && gata();
      const laTasta = (e) => (e.key === ' ' || e.key === 'Enter') && (e.preventDefault(), gata());
      el.addEventListener('pointerdown', laClic);
      addEventListener('keydown', laTasta);
    });

  // Lemnele: un cerc se strânge spre un inel; clic când ajunge pe el. „incercari” încercări, întoarce câte au reușit.
  // Același joc la antrenamentul cu Roderick (decis de autor), pe ecranul lui („idEcran”, inelul pus pe manechin),
  // cu sunetul lui; „imagineLovitura”: la o lovitură reușită se vede o clipă imaginea loviturii (la ratare, nu)
  async function cerc({ imagine, titlu, incercari = 3, idEcran = 'minijoc_cerc', imagineLovitura = null, sunet = 'topor_copac', indemn }) {
    const e = ecran(imagine, titlu, indemn || 'Lovește când cercul care se strânge ajunge pe inelul auriu.');
    // Imaginea loviturii stă gata încărcată peste fundal, ascunsă, ca să apară fără să clipească
    const lovitura = imagineLovitura && elementImagine([imagineLovitura], { clasa: 'fundal mini-lovitura', fundal: true });
    if (lovitura) e.el.children[0].after(lovitura);
    const { el: loc, h } = piesa(e, idEcran, 'inel');
    const inel = div('mini-inel');
    inel.style.borderWidth = `${h * 0.045}px`;
    const cercul = div('mini-cerc');
    cercul.style.borderWidth = `${Math.max(2, h * 0.023)}px`;
    loc.append(inel, cercul);
    // Cercul pornește de 3 ori mai mare decât inelul; „pe inel” = cu cel mult o cincime din rază pe lângă
    const R = h / 2;
    const TOLERANTA = R * 0.2;
    const DURATA = 1700;
    let lovituri = 0;
    const arataScor = (i) => (e.scor.textContent = `Lovitura ${Math.min(i + 1, incercari)} din ${incercari} · reușite: ${lovituri}`);
    arataScor(0);
    await e.incepe();
    for (let i = 0; i < incercari; i++) {
      arataScor(i);
      const start = performance.now();
      const raza = (t) => 3 * R * (1 - (t - start) / DURATA);
      let cadru;
      const anima = () => {
        const r = Math.max(0, raza(performance.now()));
        cercul.style.width = cercul.style.height = `${r * 2}px`;
        if (r > 0) cadru = requestAnimationFrame(anima);
      };
      anima();
      const t = await Promise.race([clic(e.el), pauza(DURATA).then(() => null)]);
      cancelAnimationFrame(cadru);
      // La fiecare clic, toporul lovește copacul (decis de autor), reușită sau nu
      if (t !== null) joc.sunet.efect(sunet);
      const r = t === null ? 0 : raza(t);
      const bine = Math.abs(r - R) <= TOLERANTA;
      if (bine) lovituri++;
      clipa(e.el, bine ? 'Lovit!' : r > R ? 'Prea devreme' : 'Prea târziu', bine);
      cercul.style.width = cercul.style.height = '0px';
      if (bine && lovitura) {
        lovitura.classList.add('vazuta');
        await pauza(900);
        lovitura.classList.remove('vazuta');
      }
      await pauza(750);
    }
    arataScor(incercari);
    await e.incheie(`Reușite: ${lovituri} din ${incercari}`);
    return lovituri;
  }

  // Aratul: un semn alunecă stânga-dreapta pe o bară; îl oprești în zona verde. 3 runde, scorul 0–1
  async function arat({ imagine, titlu }) {
    const e = ecran(imagine, titlu, 'Oprește semnul în zona verde: plugul merge drept doar dacă îl ții bine.');
    const { el: bara, h } = piesa(e, 'minijoc_arat', 'bara');
    bara.classList.add('mini-bara');
    const verde = div('mini-verde');
    const semn = div('mini-semn');
    semn.style.width = `${Math.max(4, h * 0.22)}px`;
    semn.style.marginLeft = `${-Math.max(4, h * 0.22) / 2}px`;
    bara.append(verde, semn);
    const RUNDE = 3;
    const LATIME_VERDE = 0.14;
    const TRECERE = 1100;
    let reusite = 0;
    e.scor.textContent = `Brazda 1 din ${RUNDE}`;
    await e.incepe();
    for (let i = 0; i < RUNDE; i++) {
      e.scor.textContent = `Brazda ${i + 1} din ${RUNDE} · drepte: ${reusite}`;
      const st = 0.1 + Math.random() * (0.9 - LATIME_VERDE - 0.1);
      verde.style.left = `${st * 100}%`;
      verde.style.width = `${LATIME_VERDE * 100}%`;
      const start = performance.now();
      // Merge dus-întors; la fiecare brazdă puțin mai repede
      const pozitieSemn = (t) => {
        const f = ((t - start) / (TRECERE * (1 - i * 0.12))) % 2;
        return f < 1 ? f : 2 - f;
      };
      let cadru;
      const anima = () => {
        semn.style.left = `${pozitieSemn(performance.now()) * 100}%`;
        cadru = requestAnimationFrame(anima);
      };
      anima();
      const p = pozitieSemn(await clic(e.el));
      cancelAnimationFrame(cadru);
      semn.style.left = `${p * 100}%`;
      const bine = p >= st && p <= st + LATIME_VERDE;
      if (bine) reusite++;
      clipa(e.el, bine ? 'Drept!' : 'Strâmb', bine);
      await pauza(800);
    }
    await e.incheie(`Brazde drepte: ${reusite} din ${RUNDE}`);
    return reusite / RUNDE;
  }

  // Mulsul: un cerc pulsează; clic când e cel mai mare (pe ritm). Câte o șansă pe puls, scorul 0–1
  async function muls({ imagine, titlu }) {
    const e = ecran(imagine, titlu, 'Apasă în ritm, când cercul e cel mai mare.');
    const { el: loc } = piesa(e, 'minijoc_muls', 'puls');
    const puls = div('mini-puls');
    // Inelul stins arată cât de mare e cercul pe bătaie
    loc.append(div('mini-puls-tinta'), puls);
    const BATAI = 6;
    const PERIOADA = 1000;
    const FEREASTRA = 170;
    let reusite = 0;
    e.scor.textContent = `Ritmul: 0 din ${BATAI}`;
    await e.incepe();
    const start = performance.now() + PERIOADA / 2;
    let cadru;
    const anima = () => {
      const f = (((performance.now() - start) % PERIOADA) + PERIOADA) % PERIOADA / PERIOADA;
      // Cel mai mare la începutul fiecărei perioade (bătaia), apoi se strânge și crește la loc
      const marime = 0.55 + 0.45 * Math.pow(Math.cos(Math.PI * f), 2);
      puls.style.transform = `scale(${marime})`;
      cadru = requestAnimationFrame(anima);
    };
    anima();
    const folosite = new Set();
    const laClic = (ev) => {
      if (ev.type === 'keydown' && ev.key !== ' ' && ev.key !== 'Enter') return;
      if (ev.type === 'pointerdown' && ev.button !== 0) return;
      ev.preventDefault?.();
      const t = performance.now() - start;
      const bataie = Math.round(t / PERIOADA);
      if (bataie < 0 || bataie >= BATAI || folosite.has(bataie)) return;
      folosite.add(bataie);
      const bine = Math.abs(t - bataie * PERIOADA) <= FEREASTRA;
      if (bine) reusite++;
      clipa(e.el, bine ? 'Bine!' : 'Pe lângă', bine);
      e.scor.textContent = `Ritmul: ${reusite} din ${BATAI}`;
    };
    e.el.addEventListener('pointerdown', laClic);
    addEventListener('keydown', laClic);
    await pauza(start - performance.now() + PERIOADA * (BATAI - 0.5));
    e.el.removeEventListener('pointerdown', laClic);
    removeEventListener('keydown', laClic);
    cancelAnimationFrame(cadru);
    await e.incheie(`În ritm: ${reusite} din ${BATAI}`);
    return reusite / BATAI;
  }

  // Moara: clic repede ca să umpli sacul înainte să se termine timpul; sacul se mai și scurge puțin. Scorul 0–1
  async function moara({ imagine, titlu }) {
    const e = ecran(imagine, titlu, 'Apasă repede ca să umpli sacul cu făină înainte să treacă timpul.');
    const { el: sac } = piesa(e, 'minijoc_moara', 'sac');
    sac.classList.add('mini-sac');
    const plin = div('mini-sac-plin');
    sac.append(plin);
    const { el: timp, h: hTimp } = piesa(e, 'minijoc_moara', 'timp');
    timp.classList.add('mini-timp');
    timp.style.fontSize = `${hTimp * 0.8}px`;
    timp.style.lineHeight = `${hTimp}px`;
    const SECUNDE = 6;
    const PE_CLIC = 0.05;
    const SCURGERE = 0.04;
    let umplere = 0;
    e.scor.textContent = 'Sacul: 0%';
    await e.incepe();
    const start = performance.now();
    let inainte = start;
    const laClic = (ev) => {
      if (ev.type === 'keydown' && ev.key !== ' ') return;
      if (ev.type === 'pointerdown' && ev.button !== 0) return;
      ev.preventDefault?.();
      umplere = Math.min(1, umplere + PE_CLIC);
    };
    e.el.addEventListener('pointerdown', laClic);
    addEventListener('keydown', laClic);
    await new Promise((gata) => {
      const anima = () => {
        const acum = performance.now();
        if (umplere < 1) umplere = Math.max(0, umplere - (SCURGERE * (acum - inainte)) / 1000);
        inainte = acum;
        const ramas = Math.max(0, SECUNDE - (acum - start) / 1000);
        plin.style.height = `${umplere * 100}%`;
        timp.textContent = `${ramas.toFixed(1)} s`;
        e.scor.textContent = `Sacul: ${Math.round(umplere * 100)}%`;
        if (umplere >= 1 || ramas <= 0) return gata();
        requestAnimationFrame(anima);
      };
      anima();
    });
    e.el.removeEventListener('pointerdown', laClic);
    removeEventListener('keydown', laClic);
    await e.incheie(umplere >= 1 ? 'Sacul e plin!' : `Sacul: ${Math.round(umplere * 100)}%`);
    return umplere;
  }

  // Culesul ierburilor: plantele (bune și greșite, amestecate) apar la întâmplare în zona desenată de autor pe imaginea
  // culesului (editor: Aranjare → Ecrane → „Culesul …”); alegi cel mult „maxCulese”. Întoarce câte bune și câte greșite
  async function culege(a) {
    const id = `culege_${a.id}`;
    const aranjare = joc.date.aranjare[id];
    const model = joc.lume.get(id)?.obiecte.find((o) => o.id === 'planta');
    const marime = (model ? pozitie(aranjare, model, 0).scara : 0.1) * INALTIME;
    // Până desenează autorul zona, plantele stau în jumătatea de jos a imaginii
    const poligon = aranjare?.zone?.plante?.length >= 3 ? aranjare.zone.plante : [[0.1, 0.55], [0.9, 0.55], [0.9, 0.95], [0.1, 0.95]];
    const max = a.maxCulese || 4;
    const e = ecran(a.imagine, a.titlu || a.nume, a.intrebare || 'Care e planta?');
    e.el.classList.add('mini-culege');
    const lista = a.plante.flatMap((p) => Array.from({ length: p.cate || 1 }, () => p));
    lista.sort(() => Math.random() - 0.5);
    // Locuri la întâmplare în zonă, nu prea aproape unele de altele (picioarele plantei stau în punct)
    const xs = poligon.map((p) => p[0]);
    const ys = poligon.map((p) => p[1]);
    // Planta întreagă trebuie să stea pe ecran (zona poate ajunge până la margine) și să nu stea sub numărătoare
    // sau sub „Gata”, de jos, unde n-ar mai putea fi apăsată
    const MARGINE = 10;
    const ocupate = [
      [LATIME / 2 - 150, INALTIME - 110, LATIME / 2 + 150, INALTIME],
      [LATIME - 380, INALTIME - 120, LATIME, INALTIME],
    ];
    function incapePeEcran([x, y]) {
      const st = x * LATIME - marime / 2;
      const dr = x * LATIME + marime / 2;
      const sus = y * INALTIME - marime;
      const jos = y * INALTIME;
      if (st < MARGINE || dr > LATIME - MARGINE || sus < MARGINE || jos > INALTIME - MARGINE) return false;
      return !ocupate.some(([x1, y1, x2, y2]) => st < x2 && dr > x1 && sus < y2 && jos > y1);
    }
    const puncte = [];
    for (let distanta = marime * 0.8; puncte.length < lista.length && distanta > 1; distanta *= 0.8) {
      for (let incercare = 0; incercare < 3000 && puncte.length < lista.length; incercare++) {
        const p = [Math.min(...xs) + Math.random() * (Math.max(...xs) - Math.min(...xs)), Math.min(...ys) + Math.random() * (Math.max(...ys) - Math.min(...ys))];
        if (!inPoligon(p, poligon) || !incapePeEcran(p)) continue;
        if (puncte.some((q) => Math.hypot((q[0] - p[0]) * LATIME, (q[1] - p[1]) * INALTIME) < distanta)) continue;
        puncte.push(p);
      }
    }
    let corecte = 0;
    let gresite = 0;
    e.scor.textContent = `Culese: 0 / ${max}`;
    let gata;
    const terminat = new Promise((r) => (gata = r));
    // Cele de mai jos stau în față, ca într-o poză
    const ordine = lista.map((p, i) => ({ p, punct: puncte[i] })).filter((x) => x.punct).sort((x, y) => x.punct[1] - y.punct[1]);
    for (const { p, punct } of ordine) {
      const el = div('planta-mini');
      el.style.left = `${punct[0] * 100}%`;
      el.style.top = `${punct[1] * 100}%`;
      el.style.width = el.style.height = `${marime}px`;
      const ic = iconita(joc.inventar, p.id);
      // Unele întoarse, ca să nu arate toate la fel
      if (Math.random() < 0.5) el.classList.add('intoarsa');
      el.append(ic);
      el.onclick = (ev) => {
        ev.stopPropagation();
        if (corecte + gresite >= max) return;
        el.classList.add('culeasa');
        el.onclick = null;
        if (p.corecta) corecte++;
        else gresite++;
        e.scor.textContent = `Culese: ${corecte + gresite} / ${max}`;
        if (corecte + gresite >= max) setTimeout(gata, 450);
      };
      e.loc.append(el);
    }
    const bGata = buton('Gata', () => gata());
    bGata.classList.add('mini-gata');
    e.el.append(bGata);
    await terminat;
    bGata.remove();
    for (const p of e.loc.querySelectorAll('.planta-mini')) p.onclick = null;
    e.el.remove();
    return { corecte, gresite };
  }

  // Furișatul (decis de autor, lada colectorului): imaginea pasului, cu cele două locuri desenate de autor în editor
  // (Aranjare → Ecrane → „Furișatul …”), „sigur” și „periculos”. Arată la fel, ca jucătorul să aleagă după ce vede
  // în imagine (lumina torței, orcul). Până sunt desenate, două butoane. Întoarce „sigur” sau „periculos”
  async function furisare(idEcran, indemn) {
    const d = joc.lume.get(idEcran);
    const el = div('mini-joc mini-furis');
    const strat = div('strat-lume');
    el.append(strat);
    parinte.append(el);
    const { poligoane } = randeaza(strat, d, joc.date.aranjare[idEcran], context(joc.stare));
    const sus = div('mini-sus');
    sus.append(div('mini-indemn', indemn || 'Pe unde o iei?'));
    el.append(sus);
    const ales = await new Promise((r) => {
      if (poligoane.has('sigur') && poligoane.has('periculos')) {
        for (const [id, p] of poligoane) {
          p.classList.add('vizibila');
          p.addEventListener('click', (e) => (e.stopPropagation(), r(id)));
        }
        return;
      }
      const jos = div('mini-butoane-furis');
      jos.append(buton('Pe aici e sigur (zona nedesenată)', () => r('sigur')), buton('Pe aici te vede orcul (zona nedesenată)', () => r('periculos')));
      el.append(jos);
    });
    el.remove();
    return ales;
  }

  return { cerc, arat, muls, moara, culege, furisare };
}
