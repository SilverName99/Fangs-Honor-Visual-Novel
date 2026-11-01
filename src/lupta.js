import { elementImagine } from './imagini.js';
import { candidati } from './lume.js';
import { context } from './stare.js';

const div = (clasa, text) => Object.assign(document.createElement('div'), { className: clasa, textContent: text ?? '' });
function buton(text, clic, dezactivat = false, titlu = '') {
  const b = document.createElement('button');
  b.textContent = text;
  b.onclick = clic;
  b.disabled = dezactivat;
  b.title = titlu;
  return b;
}
const intre = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const asteapta = (ms) => new Promise((r) => setTimeout(r, ms));
// Poza „cazut” (răpus) e nouă; până o încarcă autorul, căderea folosește poza „lovit”, înclinată din cod.
// „lovit”, nu „ranit”: altfel numele s-ar fi bătut cu portretul rănit (fierar_ranit.png) în galerie
const cuRezerva = (p) => (p === 'cazut' ? ['cazut', 'lovit'] : [p]);

// Unde stă fiecare loc pe ecran (picioarele): fața e spre mijloc, spatele spre margine
const X = { aliat: { fata: 0.29, spate: 0.12 }, inamic: { fata: 0.71, spate: 0.88 } };
const Y = [0.5, 0.72, 0.94];
const INALTIME = 0.25;

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
};

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
      nume: 'Vale',
      viata: def?.test ? 100 : Math.round(s.nevoi.viata),
      viataMax: 100,
      staminaMax: cfg.vale.staminaMax,
      atac: arma?.atac || cfg.pumni,
      armuri: armuriDin(piese),
      blocare: scut?.blocare ?? cfg.blocareImplicita,
      abilitati: [],
      // Vale obosit pornește cu bara goală, odihnit cu ea pe jumătate
      bara: s.nevoi.stamina < joc.date.config.nevoi.prag ? 0 : 50,
      poze: (p) => [...cuRezerva(p).map((x) => `combat/vale_${tipArma}_${x}.png`), `combat/vale_${tipArma}_idle.png`, `combat/vale_pumni_idle.png`],
    };
  }

  function luptatorDinDate(id, x, nume) {
    return {
      id,
      nume,
      viata: x.viata,
      viataMax: x.viata,
      staminaMax: x.staminaMax,
      atac: x.atac,
      armuri: armuriDin([{ nume: 'Armura', armura: x.armura || 0, rezistenta: x.rezistenta }]),
      blocare: x.blocare ?? cfg.blocareImplicita,
      abilitati: x.abilitati || [],
      bara: intre(0, 30),
      // „poze”: inamicul folosește pozele altcuiva (orcii din tavernă arată ca paznicii de la poartă)
      poze: (p) => [...cuRezerva(p).map((y) => `combat/${x.poze || id}_${y}.png`), `combat/${x.poze || id}_idle.png`],
    };
  }

  // ---------- reguli ----------
  const vii = (tabara) => L.toti.filter((f) => f.tabara === tabara && !f.cazut);
  const laLoc = (tabara, linie, rand) => L.toti.find((f) => f.tabara === tabara && f.linie === linie && f.rand === rand);
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
  function aseaza(f) {
    f.el.style.left = `${X[f.tabara][f.rand] * 100}%`;
    f.el.style.top = `${Y[f.linie] * 100}%`;
    f.el.style.height = `${INALTIME * 100}%`;
    f.el.style.zIndex = String(10 + f.linie * 10 + (f.rand === 'fata' ? 5 : 0));
  }

  function poza(f, p) {
    f.cache ||= new Map();
    if (!f.cache.has(p)) {
      const img = elementImagine(f.poze(p), { clasa: 'poza-luptator', raport: 0.6, eticheta: `${f.nume} (${p})` });
      // Cu poza lui de răpus, personajul nu se mai înclină din cod: poza arată deja căderea
      if (p === 'cazut') img.addEventListener('incarcat', (e) => f.el.classList.toggle('poza-cazut', e.detail.endsWith('_cazut.png')));
      f.cache.set(p, img);
    }
    f.corp.replaceChildren(f.cache.get(p));
  }

  function creeazaElement(f) {
    f.el = div(`luptator ${f.tabara}`);
    const bare = div('bare-luptator');
    f.elViata = div('umplere');
    f.elBara = div('umplere');
    const bv = div('bara-lupta viata');
    bv.append(f.elViata);
    const bs = div('bara-lupta stamina');
    bs.append(f.elBara);
    f.elArmura = div('stare-armura');
    bare.append(div('nume-luptator', f.nume), bv, bs, f.elArmura);
    f.corp = div('corp');
    f.el.append(bare, f.corp);
    poza(f, 'idle');
    aseaza(f);
    f.el.onclick = () => L.laClic?.(f);
    return f.el;
  }

  function actualizeazaBare() {
    for (const f of L.toti) {
      f.elViata.style.width = `${Math.max(0, (f.viata / f.viataMax) * 100)}%`;
      f.elBara.style.width = `${Math.max(0, Math.min(100, f.bara))}%`;
      const crapate = f.armuri.filter((a) => a.ramas <= 0).length;
      f.elArmura.textContent = crapate ? `armură crăpată (${crapate})` : '';
    }
  }

  // Ordinea următoare: cine își umple primul bara, presupunând că nimeni nu face nimic special
  function arataOrdinea() {
    const rate = (f) => f.staminaMax * cfg.viteza;
    const urm = [];
    for (const f of L.toti.filter((x) => !x.cazut)) {
      const t0 = Math.max(0, 100 - f.bara) / rate(f);
      for (let k = 0; k < 3; k++) urm.push({ f, t: t0 + (k * 100) / rate(f) });
    }
    urm.sort((a, b) => a.t - b.t);
    L.elOrdine.replaceChildren(div('eticheta-ordine', 'Urmează:'), ...urm.slice(0, 7).map(({ f }) => div(`jeton ${f.tabara}`, f.nume)));
  }

  function jurnal(text) {
    L.elJurnal.textContent = text;
  }

  function numar(f, text, clasa = '') {
    const n = div(`numar-lupta ${clasa}`, text);
    f.el.append(n);
    setTimeout(() => n.remove(), 1100);
  }

  // ---------- acțiuni ----------
  async function loveste(sursa, tinta) {
    poza(sursa, 'atac');
    sursa.corp.classList.add(sursa.tabara === 'aliat' ? 'ataca-dreapta' : 'ataca-stanga');
    await asteapta(250);
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
    if (!tinta.apara) poza(tinta, 'lovit');
    tinta.corp.classList.add('lovit');
    if (tinta.viata <= 0) {
      tinta.viata = 0;
      tinta.cazut = true;
      tinta.el.classList.add('cazut');
      poza(tinta, 'cazut');
    }
    actualizeazaBare();
    await asteapta(450);
    sursa.corp.classList.remove('ataca-dreapta', 'ataca-stanga');
    tinta.corp.classList.remove('lovit');
    poza(sursa, 'idle');
    if (!tinta.cazut && !tinta.apara) poza(tinta, 'idle');
    return d;
  }

  async function executa(sursa, actiune) {
    L.pauza = true;
    ascundeMeniul();
    sursa.apara = false;
    if (actiune.tip === 'atac') {
      const d = await loveste(sursa, actiune.tinta);
      if (!L.elJurnal.textContent.includes('crăpat')) jurnal(`${sursa.nume} îl lovește pe ${actiune.tinta.nume}: ${d} daune.`);
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
      sursa.corp.classList.add('abilitate');
      poza(sursa, 'atac');
      await asteapta(300);
      abilitati[a.id]?.(sursa, actiune.tinta, a, L);
      await asteapta(400);
      sursa.corp.classList.remove('abilitate');
      poza(sursa, 'idle');
      // Abilitățile grele golesc bara sub zero: personajul așteaptă mai mult până la mișcarea următoare
      sursa.bara = -(a.cost || 0);
    } else if (actiune.tip === 'fuga') {
      return termina('fuga');
    }
    actualizeazaBare();
    await asteapta(250);
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

  function alegeTinta(lista, laAlegere) {
    L.toti.forEach((f) => f.el.classList.toggle('tinta-valida', lista.includes(f)));
    L.laClic = (f) => lista.includes(f) && laAlegere(f);
    L.elMeniu.replaceChildren(div('titlu-meniu-lupta', 'Alege ținta'), buton('Înapoi', () => meniu(L.activ)));
  }

  function alegeLoc(f) {
    L.elLocuri.replaceChildren();
    for (const linie of [0, 1, 2]) {
      for (const rand of ['fata', 'spate']) {
        const ocupant = laLoc('aliat', linie, rand);
        // Pe un loc liber oricând; cu cineva doar pe aceeași linie (față ↔ spate)
        const ok = ocupant ? ocupant !== f && linie === f.linie : true;
        if (!ok) continue;
        const loc = div('loc-liber');
        loc.style.left = `${X.aliat[rand] * 100}%`;
        loc.style.top = `${Y[linie] * 100}%`;
        loc.onclick = () => executa(f, { tip: 'muta', linie, rand });
        L.elLocuri.append(loc);
      }
    }
    L.elMeniu.replaceChildren(div('titlu-meniu-lupta', 'Alege locul'), buton('Înapoi', () => meniu(f)));
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
    m.replaceChildren(
      div('titlu-meniu-lupta', `Rândul lui ${f.nume}`),
      buton('Atac', () => alegeTinta(tintePosibile(f, f.atac.tip), (t) => executa(f, { tip: 'atac', tinta: t })), !poateAtaca(f), poateAtaca(f) ? '' : 'Din spate nu poți ataca apropiat'),
      buton('Apărare', () => executa(f, { tip: 'aparare' })),
      buton('Obiect', () => {
        m.replaceChildren(
          div('titlu-meniu-lupta', 'Alege obiectul'),
          ...consumabile.map((x) =>
            buton(`${inv.def(x.id).nume} ×${x.n}`, () => alegeTinta(vii('aliat'), (t) => executa(f, { tip: 'obiect', id: x.id, tinta: t }))),
          ),
          buton('Înapoi', () => meniu(f)),
        );
      }, !consumabile.length),
      buton('Schimbă locul', () => alegeLoc(f)),
      ...f.abilitati.map((a) =>
        buton(a.nume, () => alegeTinta(a.tinta === 'aliat' ? vii('aliat') : vii('inamic'), (t) => executa(f, { tip: 'abilitate', abilitate: a, tinta: t }))),
      ),
      ...(L.def.fuga ? [buton('Fugi', () => executa(f, { tip: 'fuga' }))] : []),
    );
  }

  // ---------- bucla ----------
  function bucla(acum) {
    if (!L) return;
    const dt = Math.min(0.1, (acum - (L.ultim || acum)) / 1000);
    L.ultim = acum;
    if (!L.pauza) {
      for (const f of L.toti) if (!f.cazut) f.bara += f.staminaMax * cfg.viteza * dt;
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
    const personaje = new Map(joc.date.npcs.personaje.map((p) => [p.id, p]));
    // Lupta de test are doar aliații aleși în panou, nu grupul din salvare
    const aliati = (def.test ? ['vale'] : s.grup)
      .map((id) => (id === 'vale' ? luptatorVale(def) : personaje.get(id)?.lupta && luptatorDinDate(id, personaje.get(id).lupta, personaje.get(id).nume)))
      .filter(Boolean);
    // Locurile libere se dau pe rând celor care nu au încă loc în formație
    const ocupate = new Set();
    const asaza = (f, loc) => {
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
      return { ...luptatorDinDate(x.id, d, multi ? `${d.nume} ${numarari[x.id]}` : d.nume), linie: x.linie, rand: x.rand };
    });

    el.replaceChildren();
    el.hidden = false;
    const scena = joc.lume.get(def.fundal);
    if (scena) el.append(elementImagine(candidati(scena.imagine, scena.variante, context(s)), { clasa: 'fundal fundal-lupta', fundal: true }));
    L = {
      def,
      id: idLupta,
      toti: [...aliati.map((f) => ({ ...f, tabara: 'aliat' })), ...inamici.map((f) => ({ ...f, tabara: 'inamic' }))],
      pauza: true,
      jurnal,
      numar,
    };
    L.elOrdine = div('ordine-lupta');
    L.elJurnal = div('jurnal-lupta', def.nume);
    L.elMeniu = div('lupta-meniu');
    L.elLocuri = div('locuri-lupta');
    const scenaLupta = div('scena-lupta');
    for (const f of L.toti) scenaLupta.append(creeazaElement(f));
    scenaLupta.append(L.elLocuri);
    el.append(scenaLupta, L.elOrdine, L.elJurnal, L.elMeniu);
    actualizeazaBare();

    // Cu mai mulți aliați, formația se poate schimba înainte de începere
    if (aliati.length > 1) pregatire();
    else start();
  }

  function start() {
    L.elMeniu.hidden = true;
    L.pauza = false;
    requestAnimationFrame(bucla);
  }

  function pregatire() {
    let ales = null;
    const arataLocuri = () => {
      L.elLocuri.replaceChildren();
      if (!ales) return;
      for (const linie of [0, 1, 2]) {
        for (const rand of ['fata', 'spate']) {
          const loc = div('loc-liber');
          loc.style.left = `${X.aliat[rand] * 100}%`;
          loc.style.top = `${Y[linie] * 100}%`;
          loc.onclick = () => {
            const altul = laLoc('aliat', linie, rand);
            if (altul) Object.assign(altul, { linie: ales.linie, rand: ales.rand });
            Object.assign(ales, { linie, rand });
            L.toti.forEach(aseaza);
            ales.el.classList.remove('la-rand');
            ales = null;
            arataLocuri();
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
    L.elMeniu.replaceChildren(
      div('titlu-meniu-lupta', 'Formația: click pe un aliat, apoi pe locul nou'),
      buton('Începe lupta', () => {
        L.laClic = null;
        L.elLocuri.replaceChildren();
        L.toti.forEach((f) => f.el.classList.remove('la-rand'));
        start();
      }),
    );
  }

  function termina(rezultat) {
    const s = joc.stare;
    const vale = L.toti.find((f) => f.id === 'vale');
    // Formația rămâne salvată pentru lupta următoare
    if (!L.def.test) for (const f of L.toti.filter((x) => x.tabara === 'aliat' && !x.temporar)) s.formatie[f.id] = { linie: f.linie, rand: f.rand };
    const parte = rezultat === 'victorie' ? L.def.victorie : rezultat === 'infrangere' ? L.def.infrangere : null;
    const titlu = { victorie: 'Victorie!', infrangere: 'Înfrângere', fuga: 'Ai fugit' }[rezultat];
    L.elMeniu.hidden = false;
    L.elMeniu.replaceChildren(
      div('titlu-meniu-lupta', titlu),
      ...(parte?.text ? [div('text-rezultat', parte.text)] : []),
      buton('Continuă', () => {
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
      }),
    );
    L.pauza = true;
  }

  return { porneste, activa: () => !!L };
}
