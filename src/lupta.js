import { elementImagine } from './imagini.js';
import { iconita as iconitaObiect } from './ecranInventar.js';
import { candidati, LOCURI_LUPTA, idHartaLupta } from './lume.js';
import { pozitie, aplicaPozitie, INALTIME } from './scena.js';
import { context } from './stare.js';
// Pauzele din luptă se scurtează cu viteza aleasă de jucător (×1 / ×2 / ×4)
import { asteapta, viteza, butonViteza } from './viteza.js';

const div = (clasa, text) => Object.assign(document.createElement('div'), { className: clasa, textContent: text ?? '' });
function buton(text, clic, dezactivat = false, titlu = '') {
  const b = document.createElement('button');
  b.textContent = text;
  b.onclick = clic;
  b.disabled = dezactivat;
  b.title = titlu;
  return b;
}
// Butonul pătrat de pe tabla de acțiuni (designul autorului): doar iconița; numele apare deasupra, pe eticheta de pânză
function butonActiune(iconita, simbol, nume, clic, dezactivat = false, titlu = '') {
  // Fără „title” cu numele: căsuța albă a browserului ar apărea peste eticheta de pânză; rămâne doar motivul dezactivării
  const b = buton('', clic, dezactivat, titlu);
  b.className = 'buton-lupta';
  b.append(Object.assign(div(`icon-hud icon-${iconita}`), { textContent: simbol }), div('eticheta-lupta', nume));
  return b;
}
// golesteBara → goleste_bara: numele fișierelor sunt cu _ (ui_icon_goleste_bara.png)
const caFisier = (id) => id.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`);
const intre = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
// Poza „cazut” (răpus) e nouă; până o încarcă autorul, căderea folosește poza „lovit”, înclinată din cod.
// „lovit”, nu „ranit”: altfel numele s-ar fi bătut cu portretul rănit (fierar_ranit.png) în galerie
// O putere cu poza ei (preotul: vindecare, scut...) cade pe poza „atac” până e încărcată
const POZE_DE_BAZA = ['idle', 'atac', 'aparare', 'lovit', 'cazut'];
const cuRezerva = (p) => (p === 'cazut' ? ['cazut', 'lovit'] : POZE_DE_BAZA.includes(p) ? [p] : [p, 'atac']);

// Unde stă fiecare loc pe ecran (picioarele): fața e spre mijloc, spatele spre margine

// Abilitățile au nevoie de o țintă, deci au registrul lor; efectele fără țintă folosesc registrul general
const abilitati = {
  vindecare: (sursa, tinta, a, L) => {
    const v = intre(a.min, a.max);
    tinta.viata = Math.min(tinta.viataMax, tinta.viata + v);
    L.numar(tinta, `+${v}`, 'vindecare');
    L.jurnal(`${sursa.nume} îl vindecă pe ${tinta.nume} (+${v}).`);
  },
  golesteBara: (sursa, tinta, a, L) => {
    tinta.bara = 0;
    L.jurnal(`${sursa.nume}: ${a.nume}! Bara lui ${tinta.nume} se golește.`);
  },
  // Scutul rămâne până primește o lovitură (nu expiră cu timpul), ca jucătorul să-l poată pune din timp
  scutLumina: (sursa, tinta, a, L) => {
    L.puneScut(tinta, a.imagine);
    L.jurnal(`${sursa.nume}: ${a.nume} în fața lui ${tinta.nume}. Următoarea lovitură nu-l atinge.`);
  },
};

// Clicul pe luptători se verifică pe forma pozei (pixelii neopaci), nu pe dreptunghiul ei: pozele au mult
// spațiu transparent și se suprapun, iar cel din față (mistrețul) acoperea clicul pe cel din spate (lupul)
const alfaCache = new Map();
function alfa(img) {
  if (!alfaCache.has(img.src)) {
    let a = null;
    try {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const x = c.getContext('2d', { willReadFrequently: true });
      x.drawImage(img, 0, 0);
      a = { w: c.width, h: c.height, date: x.getImageData(0, 0, c.width, c.height).data };
    } catch {
      // O imagine care nu se poate citi (de exemplu din alt loc) răspunde pe tot dreptunghiul
    }
    alfaCache.set(img.src, a);
  }
  return alfaCache.get(img.src);
}

// Poza e desenată „contain”, lipită jos: se calculează ce pixel din imagine e sub mouse
function atinge(f, x, y) {
  const img = f.corp.querySelector('img');
  const r = (img || f.corp).getBoundingClientRect();
  if (x < r.left || x > r.right || y < r.top || y > r.bottom) return false;
  const a = img?.naturalWidth ? alfa(img) : null;
  if (!a) return true;
  const s = Math.min(r.width / a.w, r.height / a.h);
  const px = Math.floor((x - r.left - (r.width - a.w * s) / 2) / s);
  const py = Math.floor((y - r.top - (r.height - a.h * s)) / s);
  if (px < 0 || py < 0 || px >= a.w || py >= a.h) return false;
  return a.date[(py * a.w + px) * 4 + 3] > 40;
}

export function creeazaLupta(parinte, joc) {
  const cfg = joc.date.config.lupta;
  const inv = joc.inventar;
  const el = div('lupta');
  el.hidden = true;
  parinte.append(el);
  let L = null;

  // ---------- luptătorii ----------
  function armuriDin(listaPiese) {
    return listaPiese.filter((p) => p.armura > 0).map((p) => ({ nume: p.nume, armura: p.armura, ramas: p.rezistenta ?? 99 }));
  }

  function luptatorVale(def) {
    const s = joc.stare;
    const piese = Object.values(s.echipat).filter(Boolean).map((id) => inv.def(id));
    // În lupta de test, arma lui Vale se alege din panou (ca să se vadă fiecare set de poze), fără să-i schimbe echipamentul
    const deTest = def?.test && def.armaVale !== undefined;
    const idArma = deTest ? def.armaVale : s.echipat.arma_primara;
    const arma = idArma ? inv.def(idArma) : null;
    const idScut = deTest ? (def.scutVale && !arma?.douaMaini ? 'scut_lemn' : null) : s.echipat.arma_secundara;
    const scut = idScut ? inv.def(idScut) : null;
    const tipDeBaza = arma?.tipArma || 'pumni';
    const tipArma = deTest ? (tipDeBaza === 'sabie' && scut?.scut ? 'sabie_scut' : tipDeBaza) : inv.tipArmaVale();
    return {
      id: 'vale',
      idPoze: 'vale',
      nume: 'Vale',
      viata: def?.test ? 100 : Math.round(s.nevoi.viata),
      viataMax: 100,
      staminaMax: cfg.vale.staminaMax,
      atac: arma?.atac || cfg.pumni,
      armuri: armuriDin(piese),
      blocare: scut?.blocare ?? cfg.blocareImplicita,
      abilitati: [],
      // Sunetul loviturii, după arma din mână
      sunetAtac: { pumni: 'lupta_pumn', topor_doua_maini: 'lupta_topor', arc: 'lupta_arc' }[tipArma] || 'lupta_sabie',
      // Vale obosit pornește cu bara goală, odihnit cu ea pe jumătate
      bara: s.nevoi.stamina < joc.date.config.nevoi.prag ? 0 : 50,
      poze: (p) => [...cuRezerva(p).map((x) => `combat/vale_${tipArma}_${x}.png`), `combat/vale_${tipArma}_idle.png`, `combat/vale_pumni_idle.png`],
    };
  }

  function luptatorDinDate(id, x, nume) {
    return {
      id,
      // Medalionul din rândul de sus folosește aceleași poze ca lupta (orcii din tavernă = paznicul de la poartă)
      idPoze: x.poze || id,
      nume,
      viata: x.viata,
      viataMax: x.viata,
      staminaMax: x.staminaMax,
      // Preotul nu atacă normal („faraAtac”): are doar puterile lui; pumnii stau ca rezervă, să nu crape codul
      atac: x.atac || cfg.pumni,
      faraAtac: !!x.faraAtac,
      armuri: armuriDin([{ nume: 'Armura', armura: x.armura || 0, rezistenta: x.rezistenta }]),
      blocare: x.blocare ?? cfg.blocareImplicita,
      abilitati: x.abilitati || [],
      // Strigătul inamicului când atacă (lupul mârâie, orcul răcnește) și sunetul loviturii lui
      sunet: x.sunet || null,
      sunetAtac: x.atac?.sunet || (x.atac?.tip === 'distanta' ? 'lupta_arc' : 'lupta_sabie'),
      // „locuri: 2”: personaj mare (vânătoarea pe tigru) care ține toată linia, față și spate
      lat: x.locuri === 2,
      bara: intre(0, 30),
      // Pozele refolosite pot arăta altfel: lupul negru = pozele lupului, întunecate și puțin mai mari
      filtru: x.filtru || '',
      marime: (x.marime ?? 100) / 100,
      // „poze”: inamicul folosește pozele altcuiva (orcii din tavernă arată ca paznicii de la poartă)
      // Fără atac normal (preotul), o putere fără poza ei cade direct pe idle, nu pe o poză „atac” care nu există
      poze: (p) => [...cuRezerva(p).filter((y) => !(x.faraAtac && y === 'atac')).map((y) => `combat/${x.poze || id}_${y}.png`), `combat/${x.poze || id}_idle.png`],
    };
  }

  // ---------- reguli ----------
  const vii = (tabara) => L.toti.filter((f) => f.tabara === tabara && !f.cazut);
  // Un personaj lat ocupă ambele locuri ale liniei lui (stă oficial „în față”)
  const laLoc = (tabara, linie, rand) => L.toti.find((f) => f.tabara === tabara && f.linie === linie && (f.rand === rand || f.lat));
  const linieGoala = (tabara, linie, faraCine) => !L.toti.some((f) => f !== faraCine && f.tabara === tabara && f.linie === linie);
  const armuraIntreaga = (f) => f.armuri.filter((a) => a.ramas > 0).reduce((s, a) => s + a.armura, 0);

  // Apropiat: doar fața; spatele doar dacă locul din fața lui, pe aceeași linie, e gol sau personajul de acolo a căzut
  function tintePosibile(sursa, tip) {
    const altii = vii(sursa.tabara === 'aliat' ? 'inamic' : 'aliat');
    if (tip !== 'apropiat') return altii;
    return altii.filter((t) => {
      if (t.rand === 'fata') return true;
      const fata = laLoc(t.tabara, t.linie, 'fata');
      return !fata || fata.cazut;
    });
  }
  const poateAtaca = (f) => !(f.atac.tip === 'apropiat' && f.rand === 'spate');

  // ---------- desenare ----------
  // Unde stă un loc pe harta luptei: cum l-a mutat autorul în editor, altfel poziția implicită
  function locPeHarta(tabara, linie, rand) {
    const id = `${tabara}_${linie}_${rand}`;
    return joc.date.aranjare?.[L.harta]?.obiecte?.[id] || LOCURI_LUPTA.find((x) => x.id === id);
  }

  function aseaza(f) {
    let p = locPeHarta(f.tabara, f.linie, f.rand);
    if (f.lat) {
      // Pe mijlocul dintre locul din față și cel din spate al liniei
      const s = locPeHarta(f.tabara, f.linie, 'spate');
      p = { x: (p.x + s.x) / 2, y: (p.y + s.y) / 2, scara: p.scara };
    }
    f.el.classList.toggle('lat', !!f.lat);
    f.el.style.left = `${p.x * 100}%`;
    f.el.style.top = `${p.y * 100}%`;
    // Pe unele hărți luptătorii trebuie să pară mai mari sau mai mici (camera e mai aproape sau mai departe)
    const m = joc.date.aranjare?.marimi_lupta;
    const factor = (m?.harti?.[L.harta] ?? 100) / 100;
    f.el.style.height = `${p.scara * factor * (f.marime ?? 1) * 100}%`;
    f.el.style.zIndex = String(10 + f.linie * 10 + (f.rand === 'fata' ? 5 : 0));
  }

  function poza(f, p) {
    f.cache ||= new Map();
    if (!f.cache.has(p)) {
      const img = elementImagine(f.poze(p), { clasa: 'poza-luptator', raport: 0.6, eticheta: `${f.nume} (${p})` });
      if (f.filtru) img.style.filter = f.filtru;
      // Mărimea fiecărei poze se reglează din galerie (în procente), pentru poze generate puțin mai mari sau mai mici
      img.addEventListener('incarcat', (e) => {
        // Mărimea pozei pe zona de luptă de acum; dacă nu e setată, mărimea ei generală (mai veche)
        const m = joc.date.aranjare?.marimi_lupta;
        const procent = m?.imaginiHarti?.[e.detail]?.[L?.harta] ?? m?.marimi?.[e.detail] ?? 100;
        img.style.transform = procent === 100 ? '' : `scale(${procent / 100})`;
        img.style.transformOrigin = 'bottom center';
      });
      // Cu poza lui de răpus, personajul nu se mai înclină din cod: poza arată deja căderea
      if (p === 'cazut') img.addEventListener('incarcat', (e) => f.el.classList.toggle('poza-cazut', e.detail.endsWith('_cazut.png')));
      f.cache.set(p, img);
    }
    f.corp.replaceChildren(f.cache.get(p));
  }

  // Bara verticală (designul autorului): umplerea crește de jos în sus, rama de fier stă peste ea
  function baraVerticala(tip) {
    const b = div(`bara-v ${tip}`);
    const umplere = div('umplere-v');
    b.append(umplere, div('rama-v'));
    return [b, umplere];
  }

  function creeazaElement(f) {
    f.el = div(`luptator ${f.tabara}`);
    // Viața și stamina stau pe verticală, în stânga luptătorului, fără nume (numele e sus, sub medalion)
    const bare = div('bare-luptator');
    bare.title = f.nume;
    const [bv, uv] = baraVerticala('viata');
    const [bs, us] = baraVerticala('stamina');
    f.elViata = uv;
    f.elBara = us;
    f.elArmura = div('stare-armura');
    bare.append(bv, bs, f.elArmura);
    // Inelul de pe jos: auriu sub cel care e la rând, roșu sub ținta de sub mouse
    f.corp = div('corp');
    f.el.append(div('inel-lupta'), bare, f.corp);
    poza(f, 'idle');
    aseaza(f);
    return f.el;
  }

  // Lupta se poate închide cât o animație încă rulează: atunci nu mai e nimic de desenat
  function actualizeazaBare() {
    if (!L) return;
    for (const f of L.toti) {
      f.elViata.style.height = `${Math.max(0, (f.viata / f.viataMax) * 100)}%`;
      f.elBara.style.height = `${Math.max(0, Math.min(100, f.bara))}%`;
      const crapate = f.armuri.filter((a) => a.ramas <= 0).length;
      // Armura crăpată: un scuț mic sub bare (detaliile la hover)
      f.elArmura.textContent = crapate ? '⛉' : '';
      f.elArmura.title = crapate ? `Armură crăpată (${crapate})` : '';
    }
  }

  // Ordinea următoare: cine își umple primul bara, presupunând că nimeni nu face nimic special
  function arataOrdinea() {
    if (!L) return;
    const rate = (f) => f.staminaMax * cfg.viteza;
    const urm = [];
    for (const f of L.toti.filter((x) => !x.cazut)) {
      // Bara curentă se umple cu încetinirea de după o putere; următoarele, normal
      const t0 = Math.max(0, 100 - f.bara) / (rate(f) * (f.incetinire ?? 1));
      for (let k = 0; k < 3; k++) urm.push({ f, t: t0 + (k * 100) / rate(f) });
    }
    urm.sort((a, b) => a.t - b.t);
    // Doar când se schimbă ordinea se redesenează (altfel portretele s-ar reîncărca de 60 de ori pe secundă)
    const lista = urm.slice(0, 8).map(({ f }) => f);
    const cheie = lista.map((f) => L.toti.indexOf(f)).join(',');
    if (cheie === L.cheieOrdine) return;
    L.cheieOrdine = cheie;
    L.elOrdine.replaceChildren(...lista.map((f, i) => medalion(f, i === 0)));
  }

  // Medalionul: fața din portretul de dialog (decis de autor: fără poze separate de medalion), rama și numele
  function medalion(f, primul) {
    const m = div(`medalion ${f.tabara}${primul ? ' primul' : ''}`);
    const portret = elementImagine([`portraits/${f.idPoze}_normal.png`, `combat/${f.idPoze}_idle.png`], { clasa: 'portret-medalion', raport: 1, eticheta: f.nume });
    m.append(portret, div('rama-medalion'), div('eticheta-medalion', f.nume));
    return m;
  }

  function jurnal(text) {
    if (L) L.elJurnal.textContent = text;
  }

  function numar(f, text, clasa = '') {
    const n = div(`numar-lupta ${clasa}`, text);
    f.el.append(n);
    setTimeout(() => n.remove(), 1100 / viteza());
  }

  // ---------- acțiuni ----------
  async function loveste(sursa, tinta) {
    poza(sursa, 'atac');
    if (sursa.sunet) joc.sunet.efect(sursa.sunet);
    joc.sunet.efect(sursa.sunetAtac);
    sursa.corp.classList.add(sursa.tabara === 'aliat' ? 'ataca-dreapta' : 'ataca-stanga');
    await asteapta(250);
    const d = aplicaLovitura(sursa, tinta);
    await asteapta(450);
    sursa.corp.classList.remove('ataca-dreapta', 'ataca-stanga');
    tinta.corp.classList.remove('lovit');
    poza(sursa, 'idle');
    if (!tinta.cazut && !tinta.apara) poza(tinta, 'idle');
    return d;
  }

  // Centrul unui luptător, în pixeli, față de scena luptei (pentru proiectil)
  // Scena e micșorată ca să încapă în fereastră: pixelii de pe ecran se împart la scară,
  // altfel glaive-ul s-ar opri înaintea țintei
  function centru(f) {
    const s = L.scena.getBoundingClientRect();
    const r = f.corp.getBoundingClientRect();
    const k = s.width / L.scena.offsetWidth || 1;
    return { x: (r.left - s.left + r.width / 2) / k, y: (r.top - s.top + r.height * 0.55) / k, latime: r.width / k };
  }

  // Punctul în care glaive-ul „intră” în țintă: trece de centrul ei, pe direcția din care vine,
  // ca să pară că o lovește, nu că se oprește în fața ei
  function inTinta(de, f) {
    const c = centru(f);
    const dx = c.x - de.x;
    const dy = c.y - de.y;
    const d = Math.hypot(dx, dy) || 1;
    const adanc = c.latime * 0.35;
    return { x: c.x + (dx / d) * adanc, y: c.y + (dy / d) * adanc };
  }

  // Viteză și rotire constante pe tot drumul (și între ținte): durata depinde de distanță, iar unghiul continuă
  // de unde a rămas, ca glaive-ul să nu pară că se oprește sau că sare la fiecare inamic
  const VITEZA = 2.6; // pixeli de scenă pe milisecundă
  const ROTIRE = 1.6; // grade pe milisecundă
  async function zboara(el, de, la) {
    const ms = Math.max(120, Math.hypot(la.x - de.x, la.y - de.y) / VITEZA);
    const unghi = el.unghi || 0;
    el.unghi = unghi + ms * ROTIRE;
    const a = el.animate(
      [
        { left: `${de.x}px`, top: `${de.y}px`, transform: `translate(-50%, -50%) rotate(${unghi}deg)` },
        { left: `${la.x}px`, top: `${la.y}px`, transform: `translate(-50%, -50%) rotate(${el.unghi}deg)` },
      ],
      { duration: ms / viteza(), easing: 'linear', fill: 'forwards' },
    );
    await a.finished.catch(() => {});
  }

  // Arma aruncată (glaive-ul Kaiei): zboară rotindu-se la fiecare țintă pe rând, apoi se întoarce în mâna ei.
  // Mărimea proiectilului se reglează din galerie, ca la poze (procent pe imagine)
  async function atacCuProiectil(sursa, tinte) {
    poza(sursa, 'atac');
    const cale = sursa.atac.proiectil;
    const procent = joc.date.aranjare?.marimi_lupta?.marimi?.[cale] ?? 100;
    const p = elementImagine([cale], { clasa: 'proiectil', raport: 1, eticheta: 'glaive' });
    p.style.height = `${8 * (procent / 100)}%`;
    L.scena.append(p);
    const daune = [];
    let de = centru(sursa);
    for (const t of tinte) {
      const la = inTinta(de, t);
      joc.sunet.efect(sursa.sunetAtac);
      await zboara(p, de, la);
      if (!L) return daune;
      daune.push(aplicaLovitura(sursa, t));
      de = la;
    }
    await zboara(p, de, centru(sursa));
    p.remove();
    if (!L) return daune;
    poza(sursa, 'idle');
    for (const t of tinte) {
      t.corp.classList.remove('lovit');
      if (!t.cazut && !t.apara) poza(t, 'idle');
    }
    return daune;
  }

  // Scutul de lumină: imaginea stă în fața aliatului (spre inamici); mărimea se reglează din galerie, ca la glaive
  function puneScut(f, cale) {
    f.elScut?.remove();
    const procent = joc.date.aranjare?.marimi_lupta?.marimi?.[cale] ?? 100;
    const s = elementImagine([cale], { clasa: 'scut-lumina', raport: 1, eticheta: 'scut de lumină' });
    s.style.height = `${55 * (procent / 100)}%`;
    f.el.append(s);
    f.elScut = s;
    f.scut = true;
  }

  function spargeScut(f) {
    f.scut = false;
    const s = f.elScut;
    f.elScut = null;
    s?.classList.add('sparge');
    setTimeout(() => s?.remove(), 450 / viteza());
  }

  // Lovitura propriu-zisă: daune, armură, poza „lovit”, căderea
  // Cu scutul de lumină, lovitura se oprește în scut: fără daune și fără uzura armurii (întoarce 0)
  function aplicaLovitura(sursa, tinta) {
    if (tinta.scut) {
      joc.sunet.efect('lupta_scut');
      spargeScut(tinta);
      numar(tinta, 'blocat', 'scut');
      return 0;
    }
    let d = Math.max(1, intre(sursa.atac.min, sursa.atac.max) - armuraIntreaga(tinta));
    if (tinta.apara) d = Math.max(1, Math.round(d * (1 - tinta.blocare)));
    tinta.viata -= d;
    // Fiecare lovitură uzează fiecare piesă întreagă; la zero, piesa crapă până la sfârșitul luptei
    for (const a of tinta.armuri) {
      if (a.ramas <= 0) continue;
      a.ramas--;
      if (a.ramas === 0) jurnal(`${a.nume} lui ${tinta.nume} s-a crăpat!`);
    }
    numar(tinta, `−${d}`);
    // Lovitura se aude în scut când se apără; altfel impactul (dacă sunetul atacului nu e deja chiar impactul)
    if (tinta.apara) joc.sunet.efect('lupta_scut');
    else if (sursa.sunetAtac !== 'lupta_lovit') joc.sunet.efect('lupta_lovit');
    if (!tinta.apara) poza(tinta, 'lovit');
    tinta.corp.classList.add('lovit');
    if (tinta.viata <= 0) {
      tinta.viata = 0;
      tinta.cazut = true;
      joc.sunet.efect('lupta_cazut');
      tinta.el.classList.add('cazut');
      poza(tinta, 'cazut');
    }
    actualizeazaBare();
    return d;
  }

  async function executa(sursa, actiune) {
    L.pauza = true;
    ascundeMeniul();
    sursa.apara = false;
    // Încetinirea de după o putere ține doar până la mișcarea următoare
    sursa.incetinire = 1;
    if (actiune.tip === 'atac' && sursa.atac.proiectil) {
      // Ținta aleasă, apoi (cu „ricoseu”) încă doi inamici la întâmplare; arma zboară pe la toți
      const altii = vii(sursa.tabara === 'aliat' ? 'inamic' : 'aliat').filter((t) => t !== actiune.tinta);
      const tinte = [actiune.tinta];
      while (tinte.length < (sursa.atac.ricoseu || 1) && altii.length) tinte.push(altii.splice(Math.floor(Math.random() * altii.length), 1)[0]);
      const daune = await atacCuProiectil(sursa, tinte);
      if (!L) return;
      const cat = (i) => (daune[i] ? daune[i] : 'oprit de scut');
      jurnal(tinte.length > 1 ? `${sursa.nume}: glaive-ul ricoșează! ${tinte.map((t, i) => `${t.nume} (${cat(i)})`).join(', ')}.` : daune[0] ? `${sursa.nume} îl lovește pe ${tinte[0].nume}: ${daune[0]} daune.` : `Scutul de lumină al lui ${tinte[0].nume} oprește lovitura.`);
      sursa.bara = 0;
    } else if (actiune.tip === 'atac') {
      const d = await loveste(sursa, actiune.tinta);
      if (!L) return;
      if (!d) jurnal(`Scutul de lumină al lui ${actiune.tinta.nume} oprește lovitura.`);
      else if (!L.elJurnal.textContent.includes('crăpat')) jurnal(`${sursa.nume} îl lovește pe ${actiune.tinta.nume}: ${d} daune.`);
      // „ricoseu: 3”: arma (glaive-ul vânătoarei) sare la încă doi inamici aleși la întâmplare
      if (sursa.atac.ricoseu > 1) {
        const altii = vii(sursa.tabara === 'aliat' ? 'inamic' : 'aliat').filter((t) => t !== actiune.tinta);
        const loviti = [`${actiune.tinta.nume} (${d})`];
        for (let i = 1; i < sursa.atac.ricoseu && altii.length; i++) {
          const t = altii.splice(Math.floor(Math.random() * altii.length), 1)[0];
          loviti.push(`${t.nume} (${(await loveste(sursa, t)) || 'oprit de scut'})`);
        }
        if (loviti.length > 1) jurnal(`${sursa.nume}: glaive-ul ricoșează! ${loviti.join(', ')}.`);
      }
      sursa.bara = 0;
    } else if (actiune.tip === 'aparare') {
      sursa.apara = true;
      poza(sursa, 'aparare');
      jurnal(`${sursa.nume} se apără.`);
      sursa.bara = 0;
    } else if (actiune.tip === 'obiect') {
      const d = inv.def(actiune.id);
      const v = d.efecte?.nevoi?.viata || 0;
      inv.scoate(actiune.id, 1);
      joc.sunet.efect('baut');
      actiune.tinta.viata = Math.min(actiune.tinta.viataMax, actiune.tinta.viata + v);
      numar(actiune.tinta, `+${v}`, 'vindecare');
      jurnal(`${sursa.nume} folosește ${d.nume} pe ${actiune.tinta.nume}.`);
      sursa.bara = 0;
    } else if (actiune.tip === 'muta') {
      const altul = laLoc(sursa.tabara, actiune.linie, actiune.rand);
      if (altul) Object.assign(altul, { linie: sursa.linie, rand: sursa.rand });
      Object.assign(sursa, { linie: actiune.linie, rand: actiune.rand });
      L.toti.forEach(aseaza);
      jurnal(`${sursa.nume} își schimbă locul.`);
      sursa.bara = 0;
    } else if (actiune.tip === 'abilitate') {
      const a = actiune.abilitate;
      poza(sursa, a.poza || 'atac');
      joc.sunet.efect(a.sunet || (a.id === 'vindecare' ? 'lupta_vindecare' : 'lupta_magie'));
      await asteapta(300);
      abilitati[a.id]?.(sursa, actiune.tinta, a, L);
      await asteapta(400);
      poza(sursa, 'idle');
      // După o putere, personajul așteaptă mai mult până la mișcarea următoare: bara pornește de la 0,
      // dar se umple mai încet (cât ar fi durat de la −cost), ca jucătorul să vadă că se încarcă, nu că s-a blocat
      sursa.bara = 0;
      sursa.incetinire = 100 / (100 + (a.cost || 0));
    } else if (actiune.tip === 'fuga') {
      return termina('fuga');
    }
    actualizeazaBare();
    await asteapta(250);
    if (!L) return;
    if (!vii('inamic').length) return termina('victorie');
    if (!vii('aliat').length) return termina('infrangere');
    L.pauza = false;
  }

  async function randInamic(f) {
    L.pauza = true;
    await asteapta(300);
    const tinte = tintePosibile(f, f.atac.tip);
    if (!tinte.length || !poateAtaca(f)) return executa(f, { tip: 'aparare' });
    executa(f, { tip: 'atac', tinta: tinte[intre(0, tinte.length - 1)] });
  }

  // ---------- meniul jucătorului ----------
  function ascundeMeniul() {
    L.elMeniu.hidden = true;
    L.laClic = null;
    L.toti.forEach((f) => f.el.classList.remove('tinta-valida', 'la-rand'));
    L.elLocuri.replaceChildren();
  }

  // Pe tablă, cât alegi ceva pe câmp: îndemnul și butonul „Înapoi”
  const inapoi = (f) => butonActiune('inapoi', '↩', 'Înapoi', () => meniu(f));

  function alegeTinta(lista, laAlegere) {
    L.toti.forEach((f) => f.el.classList.toggle('tinta-valida', lista.includes(f)));
    L.laClic = (f) => lista.includes(f) && laAlegere(f);
    L.elMeniu.replaceChildren(div('titlu-meniu-lupta', 'Alege ținta'), inapoi(L.activ));
  }

  // Marcajul pentru o linie întreagă (unde poate merge un personaj lat)
  function marcajLinie(linie, clic) {
    const a = locPeHarta('aliat', linie, 'fata');
    const b = locPeHarta('aliat', linie, 'spate');
    const loc = div('loc-liber');
    loc.style.left = `${((a.x + b.x) / 2) * 100}%`;
    loc.style.top = `${((a.y + b.y) / 2) * 100}%`;
    loc.onclick = clic;
    L.elLocuri.append(loc);
  }

  function alegeLoc(f) {
    L.elLocuri.replaceChildren();
    if (f.lat) {
      // Personajul lat se mută doar pe o linie întreagă liberă
      for (const linie of [0, 1, 2]) if (linie !== f.linie && linieGoala('aliat', linie, f)) marcajLinie(linie, () => executa(f, { tip: 'muta', linie, rand: 'fata' }));
      L.elMeniu.replaceChildren(div('titlu-meniu-lupta', 'Alege linia'), inapoi(f));
      return;
    }
    for (const linie of [0, 1, 2]) {
      for (const rand of ['fata', 'spate']) {
        const ocupant = laLoc('aliat', linie, rand);
        // Pe un loc liber oricând; cu cineva doar pe aceeași linie (față ↔ spate); nu peste un personaj lat
        const ok = ocupant ? ocupant !== f && !ocupant.lat && linie === f.linie : true;
        if (!ok) continue;
        const loc = div('loc-liber');
        const p = locPeHarta('aliat', linie, rand);
        loc.style.left = `${p.x * 100}%`;
        loc.style.top = `${p.y * 100}%`;
        loc.onclick = () => executa(f, { tip: 'muta', linie, rand });
        L.elLocuri.append(loc);
      }
    }
    L.elMeniu.replaceChildren(div('titlu-meniu-lupta', 'Alege locul'), inapoi(f));
  }

  function meniu(f) {
    L.activ = f;
    L.elLocuri.replaceChildren();
    L.toti.forEach((x) => x.el.classList.remove('tinta-valida'));
    f.el.classList.add('la-rand');
    L.laClic = null;
    const consumabile = inv.def && joc.stare.inventar.filter((x) => inv.def(x.id).inLupta);
    const m = L.elMeniu;
    m.hidden = false;
    // Fiecare putere are butonul ei (preotul: vindecare, golirea barei, scutul de lumină), fără un „Abilitate” cu listă
    m.replaceChildren(
      ...(f.faraAtac
        ? []
        : [butonActiune('atac', '⚔', 'Atac', () => alegeTinta(tintePosibile(f, f.atac.tip), (t) => executa(f, { tip: 'atac', tinta: t })), !poateAtaca(f), poateAtaca(f) ? '' : 'Din spate nu poți ataca apropiat')]),
      ...f.abilitati.map((a) =>
        butonActiune(caFisier(a.id), '✦', a.nume, () => alegeTinta(a.tinta === 'aliat' ? vii('aliat') : vii('inamic'), (t) => executa(f, { tip: 'abilitate', abilitate: a, tinta: t }))),
      ),
      butonActiune('aparare', '🛡', 'Apărare', () => executa(f, { tip: 'aparare' })),
      butonActiune('obiect', '🧪', 'Obiect', () => {
        // Obiectele de luptă: câte un buton cu iconița obiectului și câte bucăți ai
        m.replaceChildren(
          div('titlu-meniu-lupta', 'Alege obiectul'),
          ...consumabile.map((x) => {
            const b = buton('', () => alegeTinta(vii('aliat'), (t) => executa(f, { tip: 'obiect', id: x.id, tinta: t })));
            b.className = 'buton-lupta obiect-lupta';
            b.append(iconitaObiect(inv, x.id), div('numar-obiect', `×${x.n}`), div('eticheta-lupta', inv.def(x.id).nume));
            return b;
          }),
          inapoi(f),
        );
      }, !consumabile.length, consumabile.length ? '' : 'N-ai nimic de folosit în luptă'),
      butonActiune('schimba', '⇄', 'Schimbă locul', () => alegeLoc(f)),
      ...(L.def.fuga ? [butonActiune('fugi', '🏃', 'Fugi', () => executa(f, { tip: 'fuga' }))] : []),
    );
  }

  // ---------- bucla ----------
  function bucla(acum) {
    if (!L) return;
    const dt = Math.min(0.1, (acum - (L.ultim || acum)) / 1000);
    L.ultim = acum;
    if (!L.pauza) {
      for (const f of L.toti) if (!f.cazut) f.bara += f.staminaMax * cfg.viteza * (f.incetinire ?? 1) * dt * viteza();
      const gata = L.toti.filter((f) => !f.cazut && f.bara >= 100).sort((a, b) => b.bara - a.bara)[0];
      if (gata) {
        gata.bara = 100;
        // Rândul jucătorului: timpul se oprește până alege
        if (gata.tabara === 'aliat') {
          L.pauza = true;
          meniu(gata);
        } else randInamic(gata);
      }
      actualizeazaBare();
      arataOrdinea();
    }
    requestAnimationFrame(bucla);
  }

  // ---------- pornire și final ----------
  // Primește id-ul unei lupte din lupte.json sau direct o luptă (cea de test, alcătuită în panoul debug)
  function porneste(idLupta) {
    const def = typeof idLupta === 'object' ? idLupta : joc.date.lupte?.lupte?.[idLupta];
    if (!def) return joc.mesaj(`Lupta „${idLupta}” nu există.`);
    const s = joc.stare;
    // Muzica de luptă ține locul ambianței până se termină lupta
    joc.sunet.muzica('lupta');
    const personaje = new Map(joc.date.npcs.personaje.map((p) => [p.id, p]));
    // Lupta de test are doar aliații aleși în panou, nu grupul din salvare
    const aliati = (def.test ? ['vale'] : s.grup)
      .map((id) => (id === 'vale' ? luptatorVale(def) : personaje.get(id)?.lupta && luptatorDinDate(id, personaje.get(id).lupta, personaje.get(id).nume)))
      .filter(Boolean);
    // Locurile libere se dau pe rând celor care nu au încă loc în formație
    const ocupate = new Set();
    const asaza = (f, loc) => {
      if (f.lat) {
        // Cel lat are nevoie de o linie întreagă liberă
        const libera = (l) => !ocupate.has(`${l}fata`) && !ocupate.has(`${l}spate`);
        const linie = loc?.linie != null && libera(loc.linie) ? loc.linie : [1, 0, 2].find(libera) ?? 2;
        Object.assign(f, { linie, rand: 'fata' });
        ocupate.add(`${linie}fata`).add(`${linie}spate`);
        return;
      }
      if (loc?.linie != null && !ocupate.has(`${loc.linie}${loc.rand}`)) Object.assign(f, { linie: loc.linie, rand: loc.rand });
      else Object.assign(f, [1, 0, 2].flatMap((l) => ['fata', 'spate'].map((r) => ({ linie: l, rand: r }))).find((x) => !ocupate.has(`${x.linie}${x.rand}`)));
      ocupate.add(`${f.linie}${f.rand}`);
    };
    for (const f of aliati) asaza(f, s.formatie[f.id]);
    // Aliații de o singură luptă (unchiul în scandalul din tavernă) nu intră în grup și nu-și salvează locul
    for (const x of def.aliati || []) {
      const p = personaje.get(x.id);
      if (!p?.lupta || aliati.some((f) => f.id === x.id)) continue;
      const f = { ...luptatorDinDate(x.id, p.lupta, p.nume), temporar: true };
      asaza(f, x);
      aliati.push(f);
    }
    const numarari = {};
    const inamici = def.inamici.map((x) => {
      const d = joc.date.lupte.inamici[x.id];
      numarari[x.id] = (numarari[x.id] || 0) + 1;
      const multi = def.inamici.filter((y) => y.id === x.id).length > 1;
      const f = { ...luptatorDinDate(x.id, d, multi ? `${d.nume} ${numarari[x.id]}` : d.nume), linie: x.linie, rand: x.rand };
      // Doar în lupta de test: inamici care dărâmă repede (pentru poza „cazut” a aliaților) sau care cad dintr-o lovitură
      if (def.test && def.inamiciPuternici) f.atac = { ...f.atac, min: f.atac.min * 10, max: f.atac.max * 10 };
      if (def.test && def.inamiciSlabi) f.viata = f.viataMax = 1;
      return f;
    });

    el.replaceChildren();
    el.hidden = false;
    // Harta de luptă a locului (imagine separată); până e încărcată, se vede scena locului
    const scena = joc.lume.get(idHartaLupta(def.fundal || '')) || joc.lume.get(def.fundal);
    if (scena) el.append(elementImagine(candidati(scena.imagine, scena.variante, context(s)), { clasa: 'fundal fundal-lupta', fundal: true }));
    L = {
      def,
      harta: idHartaLupta(def.fundal || ''),
      id: idLupta,
      toti: [...aliati.map((f) => ({ ...f, tabara: 'aliat' })), ...inamici.map((f) => ({ ...f, tabara: 'inamic' }))],
      pauza: true,
      jurnal,
      numar,
      puneScut,
    };
    L.elOrdine = div('ordine-lupta');
    L.elJurnal = div('jurnal-lupta', def.nume);
    L.elMeniu = div('lupta-meniu');
    L.elLocuri = div('locuri-lupta');
    const scenaLupta = div('scena-lupta');
    L.scena = scenaLupta;
    // Cine e sub mouse: întâi cei din față (z-index mai mare), pe forma pozei; dacă nu, numele și barele de deasupra.
    // Dintre cei atinși, o țintă valabilă are întâietate, ca un aliat suprapus să nu „fure” clicul pe un inamic
    const subMouse = (e) => {
      const ordine = [...L.toti].sort((a, b) => Number(b.el.style.zIndex) - Number(a.el.style.zIndex));
      const atinsi = ordine.filter((f) => !f.cazut && atinge(f, e.clientX, e.clientY));
      if (!atinsi.length) {
        const peBare = ordine.find((f) => {
          const r = f.el.querySelector('.bare-luptator').getBoundingClientRect();
          return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        });
        return peBare || null;
      }
      return atinsi.find((f) => f.el.classList.contains('tinta-valida')) || atinsi[0];
    };
    scenaLupta.addEventListener('click', (e) => {
      // Marcajele de loc (formația, „Schimbă locul”) au clicul lor
      if (!L?.laClic || e.target.closest('.loc-liber')) return;
      const f = subMouse(e);
      if (f) L.laClic(f);
    });
    // Cine e sub mouse primește clasa „sub-mouse”: strălucirea roșie a inamicilor apare doar atunci
    const marcheazaSubMouse = (f) => {
      L?.toti.forEach((x) => x.el.classList.toggle('sub-mouse', x === f));
      scenaLupta.classList.toggle('peste-tinta', !!f && (f.el.classList.contains('tinta-valida') || f.tabara === 'aliat'));
    };
    scenaLupta.addEventListener('mousemove', (e) => {
      if (!L) return;
      marcheazaSubMouse(L.laClic ? subMouse(e) : null);
    });
    scenaLupta.addEventListener('mouseleave', () => marcheazaSubMouse(null));
    for (const f of L.toti) scenaLupta.append(creeazaElement(f));
    scenaLupta.append(L.elLocuri);
    const viteza = butonViteza();
    viteza.classList.add('viteza-lupta');
    // Interfața stă unde a pus-o autorul în editor (Aranjare → „Ecranul de luptă: interfața”); conținutul fiecărei
    // bucăți se măsoară din înălțimea ei (--h), ca o bară micșorată să-și micșoreze și medalioanele, și butoanele
    const ui = joc.lume.get('lupta_interfata');
    const bucati = { bara_sus: L.elOrdine, jurnal: L.elJurnal, actiuni: L.elMeniu, viteza };
    // Tabla de acțiuni are două locuri: cel de luptă (jos) și cel de la formație (în locul barii de sus)
    L.pune = (elem, id) => {
      const i = ui?.obiecte.findIndex((o) => o.id === id) ?? -1;
      if (i < 0) return;
      const p = pozitie(joc.date.aranjare.lupta_interfata, ui.obiecte[i], i);
      elem.classList.add('bucata-lupta');
      aplicaPozitie(elem, p);
      elem.style.zIndex = '';
      elem.style.setProperty('--h', `${p.scara * INALTIME}px`);
    };
    for (const [id, elem] of Object.entries(bucati)) L.pune(elem, id);
    el.append(scenaLupta, L.elOrdine, L.elJurnal, L.elMeniu, viteza);
    actualizeazaBare();

    // Cu mai mulți aliați, formația se poate schimba înainte de începere
    if (aliati.length > 1) pregatire();
    else start();
  }

  function start() {
    // Abia acum apar bara turelor și jurnalul, iar tabla coboară la locul ei de luptă
    L.elOrdine.hidden = false;
    L.elJurnal.hidden = false;
    L.pune(L.elMeniu, 'actiuni');
    L.elMeniu.hidden = true;
    L.pauza = false;
    requestAnimationFrame(bucla);
  }

  function pregatire() {
    // Formația (decis de autor): fără bara turelor și jurnal; doar tabla cu „Începe lupta”, sus, în locul barii
    L.elOrdine.hidden = true;
    L.elJurnal.hidden = true;
    L.pune(L.elMeniu, 'formatie');
    let ales = null;
    const gata = () => {
      L.toti.forEach(aseaza);
      ales.el.classList.remove('la-rand');
      ales = null;
      arataLocuri();
    };
    const arataLocuri = () => {
      L.elLocuri.replaceChildren();
      if (!ales) return;
      if (ales.lat) {
        // Personajul lat schimbă linia întreagă cu cei de pe linia aleasă
        for (const linie of [0, 1, 2]) {
          if (linie === ales.linie) continue;
          marcajLinie(linie, () => {
            for (const o of L.toti.filter((x) => x.tabara === 'aliat' && x.linie === linie)) o.linie = ales.linie;
            ales.linie = linie;
            gata();
          });
        }
        return;
      }
      for (const linie of [0, 1, 2]) {
        for (const rand of ['fata', 'spate']) {
          const loc = div('loc-liber');
          const p = locPeHarta('aliat', linie, rand);
          loc.style.left = `${p.x * 100}%`;
          loc.style.top = `${p.y * 100}%`;
          const altul = laLoc('aliat', linie, rand);
          // Peste un personaj lat nu se poate pune cineva (el ține toată linia)
          if (altul?.lat) continue;
          loc.onclick = () => {
            if (altul) Object.assign(altul, { linie: ales.linie, rand: ales.rand });
            Object.assign(ales, { linie, rand });
            gata();
          };
          L.elLocuri.append(loc);
        }
      }
    };
    L.laClic = (f) => {
      if (f.tabara !== 'aliat') return;
      ales?.el.classList.remove('la-rand');
      ales = f;
      f.el.classList.add('la-rand');
      arataLocuri();
    };
    L.elMeniu.hidden = false;
    const incepe = buton('Începe lupta', () => {
        L.laClic = null;
        L.elLocuri.replaceChildren();
        L.toti.forEach((f) => f.el.classList.remove('la-rand'));
        start();
      });
    incepe.className = 'buton buton-mic-meniu';
    L.elMeniu.replaceChildren(div('titlu-meniu-lupta', 'Formația: click pe un aliat, apoi pe locul nou'), incepe);
  }

  function termina(rezultat) {
    const s = joc.stare;
    const vale = L.toti.find((f) => f.id === 'vale');
    // Formația rămâne salvată pentru lupta următoare
    if (!L.def.test) for (const f of L.toti.filter((x) => x.tabara === 'aliat' && !x.temporar)) s.formatie[f.id] = { linie: f.linie, rand: f.rand };
    const parte = rezultat === 'victorie' ? L.def.victorie : rezultat === 'infrangere' ? L.def.infrangere : null;
    const titlu = { victorie: 'Victorie!', infrangere: 'Înfrângere', fuga: 'Ai fugit' }[rezultat];
    // Un jingle scurt la victorie și la înfrângere; la fugă revine direct ambianța
    if (rezultat === 'fuga') joc.sunet.muzica(null);
    else joc.sunet.muzica(rezultat, { repetat: false });
    L.elMeniu.hidden = true;
    // Rezultatul stă pe panoul mic (același ca la Dormi), peste câmpul de luptă
    const fundalRezultat = div('rezultat-lupta');
    const panou = div('panou-actiune');
    fundalRezultat.append(panou);
    el.append(fundalRezultat);
    const continua = buton('Continuă', () => {
        joc.sunet.muzica(null);
        // Lupta de test nu lasă urme: nici viață pierdută, nici timp trecut
        if (L.def.test) {
          el.hidden = true;
          el.replaceChildren();
          L = null;
          return joc.dupaLupta(null, 0);
        }
        if (vale) s.nevoi.viata = vale.cazut ? cfg.viataDupaCadere : Math.max(1, vale.viata);
        s.nevoi.stamina = Math.max(0, s.nevoi.stamina - cfg.staminaConsumata);
        el.hidden = true;
        el.replaceChildren();
        L = null;
        joc.dupaLupta(parte?.efecte, cfg.minute);
      });
    continua.className = 'buton buton-mic-meniu';
    panou.append(div('titlu-meniu', titlu), ...(parte?.text ? [div('text-anunt', parte.text)] : []), continua);
    L.pauza = true;
  }

  return { porneste, activa: () => !!L };
}
