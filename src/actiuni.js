import { inMinute, MINUTE_ZI, momentZi } from './timp.js';
import { minuteInZi, schimbaNevoie, ziua, context } from './stare.js';
import { verifica } from './conditii.js';
import { aplicaEfecte } from './efecte.js';
import { cateAre, listaMisiuni, pasul, numaratori, textPotrivit } from './misiuni.js';
import { baraNevoie } from './baraNevoie.js';
import { pozitie, aplicaPozitie, INALTIME } from './scena.js';
import { RAPORT_BARA_INV } from './lume.js';
import { creeazaMiniJocuri } from './miniJocuri.js';
import { miniJocuriPornite } from './uiGrafica.js';
// Textele panourilor și gândurile implicite sunt în limba jocului; cele din date (numele muncii, gândurile din
// config.json) vin deja traduse
import { t } from './limba.js';

// Cât stă imaginea muncii pe ecran (ca ecranul de încărcare de la vânătoare); un clic o sare
const SECUNDE_IMAGINE = 2.5;

const div = (clasa, text) => Object.assign(document.createElement('div'), { className: clasa, textContent: text ?? '' });
function buton(text, clic, dezactivat = false) {
  const b = document.createElement('button');
  // Pergamentul din meniu (decis de autor), ca butoanele să se potrivească pe panoul mic
  b.className = 'buton buton-mic-meniu';
  b.textContent = text;
  b.onclick = clic;
  b.disabled = dezactivat;
  return b;
}

// Acțiunile din locuri (muncă, somn, magazin, taxă...). Fiecare tip e o funcție, ca să se poată adăuga altele ușor.
export function creeazaActiuni(parinte, joc) {
  const cfg = joc.date.config;
  const inv = joc.inventar;
  const mini = creeazaMiniJocuri(parinte, joc);

  function panou(titlu, continut) {
    const fundal = div('acoperitor');
    const p = div('panou-actiune');
    const inchide = () => fundal.remove();
    p.append(div('titlu-meniu', titlu), ...continut(inchide), buton(t('Închide'), inchide));
    fundal.append(p);
    fundal.onclick = (e) => e.target === fundal && inchide();
    parinte.append(fundal);
    return inchide;
  }

  const prea_obosit = () => joc.stare.nevoi.stamina < cfg.nevoi.prag;

  // Cu mouse-ul pe un buton, bara de stamina arată cât ar crește (somn) sau scădea (muncă); locul ei e ales de
  // autor în editor (Aranjare → „Panoul mic”). Butonul primit e întors, ca să se poată scrie direct în listă
  function cuBaraStamina(b, schimbare) {
    b.addEventListener('mouseenter', () => {
      const fundal = b.closest('.acoperitor');
      fundal?.querySelector('.bara-panou')?.remove();
      const o = joc.lume.get('panou')?.obiecte.find((x) => x.id === 'bara');
      if (!fundal || !o) return;
      const p = pozitie(joc.date.aranjare.panou, o, 1);
      const h = p.scara * INALTIME;
      const bara = baraNevoie('stamina', joc.stare.nevoi.stamina, Math.round(schimbare()), h, h * RAPORT_BARA_INV, cfg.nevoi.prag);
      bara.classList.add('bara-panou', 'obiect');
      aplicaPozitie(bara, p);
      fundal.append(bara);
    });
    b.addEventListener('mouseleave', () => b.closest('.acoperitor')?.querySelector('.bara-panou')?.remove());
    return b;
  }

  // Imaginea muncii pe tot ecranul câteva secunde (decis de autor, ca la vânătoare), apoi restul.
  // Sunetul pornește puțin după clic, ca să nu se suprapună cu el
  function cuImagine(a, dupa, idSunet) {
    joc.salveaza();
    if (idSunet) setTimeout(() => joc.sunet.efect(idSunet), 150);
    if (!a.imagine) return dupa();
    joc.arataImagini([a.imagine], dupa, { automat: SECUNDE_IMAGINE * 1000, text: a.text || '' });
  }

  // „bonus” la muncă (decis de autor: moara dă și orz, câmpul și paie): câte bucăți, până la cât trebuie.
  // Întoarce ce a intrat în rucsac, ca să urce pe ecran odată cu monedele
  function bonusMunca(m) {
    const castig = [];
    for (const b of m.bonus || []) {
      if (!verifica(b.conditii, context(joc.stare))) continue;
      const n = Math.min(b.n, (b.max ?? Infinity) - cateAre(joc.stare, b.obiect));
      if (n <= 0) continue;
      castig.push({ tip: 'obiect', id: b.obiect, n: joc.primeste(b.obiect, n) });
    }
    return castig;
  }

  function munca(idMunca) {
    const m = cfg.munca[idMunca];
    if (!m) return joc.mesaj('Munca asta nu e definită în config.');
    // Noaptea nu se lucrează la câmp, la vaci sau la moară (decis de autor): doar gândul lui Vale
    if (m.gandNoapte && momentZi(minuteInZi(joc.stare)) === 'noaptea') return joc.gand(m.gandNoapte);
    // Prea obosit: doar gândul lui Vale, fără panou (decis de autor)
    if (prea_obosit()) return joc.gand(m.gandObosit || t('Sunt prea obosit pentru muncă grea. Trebuie să mă odihnesc întâi.'));
    // O muncă poate fi oprită de o întâmplare (plugul fermierului rupt, decis de autor): „blocat” = condițiile și gândul
    const blocaj = (m.blocat || []).find((b) => verifica(b.conditii, context(joc.stare)));
    if (blocaj) return joc.gand(blocaj.gand);
    panou(m.nume, (inchide) => {
      const s = joc.stare;
      const cuJoc = m.miniJoc && miniJocuriPornite();
      // Cu mini-jocul și fără, câte o propoziție întreagă, ca traducerea să nu fie lipită din bucăți
      const peOra = { bani: m.monedePeOra, stamina: m.staminaPeOra };
      const textInfo = cuJoc
        ? t('{bani} monede și −{stamina} stamina pe oră. Cât de bine lucrezi: de la jumătate până la +50%.', peOra)
        : t('{bani} monede și −{stamina} stamina pe oră.', peOra);
      const info = div('text-anunt', textInfo);
      // O oră / mai multe ore: câte un text întreg pentru fiecare formă, ca în română
      const eticheta = (h) =>
        h === 1 ? t('Muncește {h} oră (+{bani} monede)', { h, bani: h * m.monedePeOra }) : t('Muncește {h} ore (+{bani} monede)', { h, bani: h * m.monedePeOra });
      const ore = [1, 2, 4].map((h) =>
        cuBaraStamina(buton(eticheta(h), async () => {
          inchide();
          // Ora, stamina și banii se iau abia la sfârșitul mini-jocului sau al imaginii: un refresh la mijloc nu ia
          // nimic (salvarea e cea de dinainte de muncă). Leșinul oprește, ca înainte
          const munceste = (bani) => {
            if (joc.avanseaza(h * 60)) return false;
            schimbaNevoie(s, 'stamina', -h * m.staminaPeOra);
            s.bani += bani;
            return true;
          };
          // Cu mini-jocul (decis de autor): perfect = +50%, ratat de tot = jumătate; oprit din Opțiuni = cât era
          if (cuJoc) {
            joc.salveaza();
            setTimeout(() => joc.sunet.efect('munca'), 150);
            const scor = await mini[m.miniJoc]({ imagine: m.imagine, titlu: m.nume });
            const bani = Math.round(h * m.monedePeOra * (0.5 + scor));
            if (!munceste(bani)) return;
            return joc.dupaActiune('', [{ tip: 'bani', n: bani }, ...bonusMunca(m)]);
          }
          // Întâi imaginea cu Vale la muncă (cu sunetul muncii), apoi ce a câștigat
          cuImagine(m, () => munceste(h * m.monedePeOra) && joc.dupaActiune('', [{ tip: 'bani', n: h * m.monedePeOra }, ...bonusMunca(m)]), 'munca');
        }, s.nevoi.stamina < h * m.staminaPeOra), () => -h * m.staminaPeOra),
      );
      return [info, ...ore];
    });
  }

  function dormi(a) {
    const s = joc.stare;
    if (a.cost && s.bani < a.cost) return joc.gand(t('N-am destui bani. Îmi trebuie {n} monede.', { n: a.cost }));
    // Foamea mare face somnul mai puțin odihnitor (pedeapsă moale); „factorRefacere” la acțiune îl face mai
    // odihnitor după condiții (acasă, cu acoperișul reparat: recompensa misiunii, decis de autor)
    const refacereSomn = (minute) => {
      const bonus = (a.factorRefacere || []).find((x) => verifica(x.conditii, context(s)))?.factor ?? 1;
      return cfg.somn.staminaPeOra * (minute / 60) * (s.nevoi.foame < cfg.nevoi.prag ? 0.5 : 1) * bonus;
    };
    const somn = (minute) => {
      if (a.cost) s.bani -= a.cost;
      const refacere = refacereSomn(minute);
      if (joc.avanseaza(minute, cfg.somn.nevoiInSomn)) return;
      schimbaNevoie(s, 'stamina', refacere);
      // Imaginea cu Vale dormind (decis de autor, ca la muncă), cu sunetul somnului, apoi trezirea;
      // imaginea de zi dimineața, la amiază și seara (decis de autor); cea de noapte doar noaptea
      // „varianteImagine”: alte imagini după stare (acasă, cu acoperișul reparat), prima potrivită câștigă
      const v = (a.varianteImagine || []).find((x) => verifica(x.conditii, context(s))) || a;
      // Imaginea de noapte dacă somnul prinde măcar o bucată de noapte (decis de autor: seara, „până dimineața”
      // sau 6 ore trec peste 23:00); altfel cea de zi
      let minuteNoapte = 0;
      for (let k = 0; k < minute; k += 15) if (momentZi((acum + k) % MINUTE_ZI) === 'noaptea') minuteNoapte += Math.min(15, minute - k);
      const deZi = minuteNoapte === 0;
      // „viataNoapte” (decis de autor): o noapte dormită acasă închide puțin rănile, ca un jucător rănit să nu stea
      // zile întregi doar cu bandajul mamei; cât e „o noapte” se spune la acțiune (orele din 23–05)
      const vn = a.viataNoapte;
      if (vn && minuteNoapte >= (vn.oreNoapte ?? cfg.somn.oreNoaptePentruVis ?? 4) * 60) schimbaNevoie(s, 'viata', vn.viata);
      // Filmulețul visului care urmează (dacă vine unul) se descarcă cât se vede imaginea somnului
      if (minuteNoapte > 0) joc.pregatesteVisul?.(minuteNoapte);
      cuImagine({ ...a, imagine: (deZi && (v.imagineZi || a.imagineZi)) || v.imagine || a.imagine }, () => {
        joc.dupaActiune(t('Te-ai odihnit.'));
        // Visele lui Vale vin la trezire (decis de autor: după anumite misiuni, data următoare când doarme), doar
        // după un somn peste noapte; câte ore de noapte îi trebuie fiecărui vis se hotărăște la vis (joc.dupaSomn)
        if (minuteNoapte > 0) joc.dupaSomn?.(minuteNoapte);
      }, 'somn');
    };
    // Mereu patru butoane, în ordinea cerută de autor: 2 ore, 6 ore, apoi „până dimineața” seara și noaptea
    // (până la ora trezirii) sau „până noaptea” ziua (până la 23:00, când începe noaptea), și „Închide”
    const acum = minuteInZi(s);
    const ziua = momentZi(acum) === 'dimineata' || momentZi(acum) === 'amiaza';
    const tinta = ziua ? inMinute('23:00') : inMinute(cfg.somn.oraTrezire);
    const pana = (tinta - acum + MINUTE_ZI) % MINUTE_ZI || MINUTE_ZI;
    panou(a.nume || t('Dormi'), (inchide) => [
      cuBaraStamina(buton(t('Dormi 2 ore'), () => (inchide(), somn(120))), () => refacereSomn(120)),
      cuBaraStamina(buton(t('Dormi 6 ore'), () => (inchide(), somn(360))), () => refacereSomn(360)),
      cuBaraStamina(buton(ziua ? t('Dormi până noaptea') : t('Dormi până dimineața'), () => (inchide(), somn(pana))), () => refacereSomn(pana)),
    ]);
  }

  // Unele acțiuni merg doar de câteva ori pe zi (apa de la fântână și lemnele: de două ori, decis de autor);
  // numărătoarea stă în salvare, pe loc și acțiune, și se ia de la capăt în fiecare zi
  function folosiriAzi(a) {
    const s = joc.stare;
    s.folosiri ||= {};
    const cheie = `${s.scena}/${a.id}`;
    const zi = ziua(s);
    if (s.folosiri[cheie]?.zi !== zi) s.folosiri[cheie] = { zi, n: 0 };
    return s.folosiri[cheie];
  }

  function obtine(a) {
    // Noaptea nu se adună lemne (decis de autor): doar gândul lui Vale, ca la muncă
    if (a.gandNoapte && momentZi(minuteInZi(joc.stare)) === 'noaptea') return joc.gand(a.gandNoapte);
    if (a.stamina && prea_obosit()) return joc.gand(t('Sunt prea obosit. Trebuie să mă odihnesc întâi.'));
    if (a.maxPeZi && folosiriAzi(a).n >= a.maxPeZi) return joc.gand(a.mesajMaxPeZi || t('Destul pentru azi. Mâine din nou.'));
    // Cu „variante” (lemnele: o oră sau două), întâi alegi cât stai, pe panoul mic
    if (a.variante && !a.alesa) {
      return panou(a.titlu || a.nume, (inchide) =>
        a.variante.map((v) =>
          cuBaraStamina(buton(v.nume, () => {
            inchide();
            obtine({ ...a, ...v, alesa: true });
          }, (v.stamina || 0) > joc.stare.nevoi.stamina), () => -(v.stamina || 0)),
        ),
      );
    }
    // Încercarea zilei, timpul și stamina se iau abia la sfârșitul mini-jocului sau al imaginii: un refresh la mijloc
    // nu ia nimic (salvarea e cea de dinainte). Întoarce false dacă Vale a leșinat
    const facut = () => {
      if (a.maxPeZi) folosiriAzi(a).n++;
      if (joc.avanseaza(a.minute || 0)) return false;
      if (a.stamina) schimbaNevoie(joc.stare, 'stamina', -a.stamina);
      return true;
    };
    // Lemnele cu mini-jocul cercului (decis de autor): fiecare lovitură reușită aduce „nPeLovitura” lemne;
    // cu mini-jocurile oprite din Opțiuni, „n” (cât la o lovitură din două, cam)
    if (a.miniJoc && miniJocuriPornite()) {
      joc.salveaza();
      setTimeout(() => a.sunet && joc.sunet.efect(a.sunet), 150);
      return mini[a.miniJoc]({ imagine: a.imagine, titlu: a.titlu || a.nume, incercari: a.incercari }).then((lovituri) => {
        if (!facut()) return;
        const n = lovituri * (a.nPeLovitura || 1);
        joc.dupaActiune('', [{ tip: 'obiect', id: a.obiect, n: n && joc.primeste(a.obiect, n) }]);
        if (!n && a.gandNimic) joc.gand(a.gandNimic);
      });
    }
    // Sunetul acțiunii, dacă are (apa de la fântână, lemnele); cu imagine (lemnele), sunetul vine odată cu ea
    cuImagine(
      a,
      () => {
        if (!facut()) return;
        joc.dupaActiune('', [{ tip: 'obiect', id: a.obiect, n: joc.primeste(a.obiect, a.n || 1) }]);
      },
      a.sunet,
    );
  }

  // Magazinul are ecranul lui (src/ecranMagazin.js), ca inventarul
  function magazin(a) {
    joc.deschideEcranMagazin(a);
  }

  // O lucrare care cere materiale (repararea acoperișului): le consumă, durează, obosește, arată imaginea ei
  // pe tot ecranul, apoi schimbă starea lumii (efecte). Noaptea nu se face: doar gândul lui Vale
  function lucrare(a) {
    const s = joc.stare;
    if (a.gandNoapte && momentZi(minuteInZi(s)) === 'noaptea') return joc.gand(a.gandNoapte);
    for (const [id, n] of Object.entries(a.consuma || {})) {
      const are = inv.numar(s.inventar, id);
      if (are < n) return joc.gand(t('Îmi mai trebuie {lipsa} × {obiect}. Am {are} din {n}.', { lipsa: n - are, obiect: inv.def(id).nume, are, n }));
    }
    if (a.stamina && s.nevoi.stamina < a.stamina) return joc.gand(t('Sunt prea obosit pentru asta. Trebuie să mă odihnesc întâi.'));
    // „maxPeZi” (gătitul de acasă: o dată pe zi, decis de autor)
    if (a.maxPeZi && folosiriAzi(a).n >= a.maxPeZi) return joc.gand(a.mesajMaxPeZi || t('Destul pentru azi. Mâine din nou.'));
    if (a.maxPeZi) folosiriAzi(a).n++;
    if (joc.avanseaza(a.minute || 0)) return;
    for (const [id, n] of Object.entries(a.consuma || {})) inv.scoate(id, n);
    if (a.stamina) schimbaNevoie(s, 'stamina', -a.stamina);
    aplicaEfecte(a.efecte, joc);
    cuImagine(a, () => joc.dupaActiune(a.mesajGata || ''), a.sunet);
  }

  // Căutat cu noroc (decis: fierul lui Bram se strânge altfel decât lemnele): fiecare oră aduce 0–3 bucăți,
  // după „tabel”; prima dată Vale are un gând al lui („primaData”)
  function cauta(a) {
    const s = joc.stare;
    if (a.gandNoapte && momentZi(minuteInZi(s)) === 'noaptea') return joc.gand(a.gandNoapte);
    if (a.stamina && prea_obosit()) return joc.gand(t('Sunt prea obosit. Trebuie să mă odihnesc întâi.'));
    if (a.maxPeZi && folosiriAzi(a).n >= a.maxPeZi) return joc.gand(a.mesajMaxPeZi || t('Destul pentru azi. Mâine din nou.'));
    if (a.maxPeZi) folosiriAzi(a).n++;
    if (joc.avanseaza(a.minute || 60)) return;
    if (a.stamina) schimbaNevoie(s, 'stamina', -a.stamina);
    let z = Math.random() * a.tabel.reduce((suma, x) => suma + x.sansa, 0);
    const n = (a.tabel.find((x) => (z -= x.sansa) < 0) || a.tabel.at(-1)).n;
    const prima = a.primaData && !s.stari[`cautat_${a.id}`];
    if (prima) s.stari[`cautat_${a.id}`] = 'da';
    cuImagine(
      a,
      () => {
        joc.dupaActiune('', [{ tip: 'obiect', id: a.obiect, n: n > 0 && joc.primeste(a.obiect, n) }]);
        if (prima) joc.gand(a.primaData);
        else if (!n && a.gandNimic) joc.gand(a.gandNimic);
      },
      a.sunet,
    );
  }

  // Florile pe care le cere acum pasul unei misiuni în lucru („numara”), câte mai lipsesc, cel mult „maxCulese” la o
  // căutare. Și planta bună (decis de autor, P49): „Mama lui Finn” cere 3 luminițe, iar cu 2 pe cules trebuiau două
  // culesuri; cerută de o misiune, Vale o culege cât îi lipsește, dar nu mai puțin decât „nFaraJoc”, ca înainte
  function floriCerute(a, buna) {
    const s = joc.stare;
    const ids = new Set(a.plante.map((p) => p.id));
    const lipsa = new Map();
    for (const m of listaMisiuni(joc.date)) {
      const p = s.misiuni[m.id] === 'inceputa' && m.pasi[pasul(s, m.id)];
      if (!p) continue;
      for (const x of numaratori(p, s)) if (x.obiect && ids.has(x.obiect) && x.are < x.n) lipsa.set(x.obiect, (lipsa.get(x.obiect) || 0) + x.n - x.are);
    }
    let loc = a.maxCulese || 4;
    const rez = [];
    for (const [id, n] of lipsa) {
      const ia = Math.min(id === buna ? Math.max(n, a.nFaraJoc ?? 2) : n, loc);
      if (ia > 0) rez.push([id, ia]);
      loc -= ia;
    }
    return rez;
  }

  // Culesul cu recunoaștere (decis de autor: ierburile lui Elian): pe imaginea culesului apar plantele, bune și
  // greșite, la întâmplare în zona desenată în editor; culegi cel mult „maxCulese”, fiecare bună aduce o bucată.
  // Cu mini-jocurile oprite din Opțiuni, Vale o alege singur pe cea bună și primește „nFaraJoc”.
  // Doar la orele din „ora” (sunătoarea se culege dimineața, cu roua pe ea)
  function culege(a) {
    const s = joc.stare;
    if (a.ora && !verifica({ ora: a.ora }, context(s))) return joc.gand(a.gandOra || t('Nu e momentul potrivit.'));
    if (a.stamina && prea_obosit()) return joc.gand(t('Sunt prea obosit. Trebuie să mă odihnesc întâi.'));
    if (a.maxPeZi && folosiriAzi(a).n >= a.maxPeZi) return joc.gand(a.mesajMaxPeZi || t('Destul pentru azi. Mâine din nou.'));
    // Ca la lemne: încercarea zilei, ora și stamina se iau abia la sfârșit, ca un refresh la mijloc să nu le ia
    const facut = () => {
      if (a.maxPeZi) folosiriAzi(a).n++;
      if (joc.avanseaza(a.minute || 60)) return false;
      if (a.stamina) schimbaNevoie(s, 'stamina', -a.stamina);
      return true;
    };
    const buna = a.plante.find((p) => p.corecta).id;
    const primeste = (n) => joc.dupaActiune('', [{ tip: 'obiect', id: buna, n: n && joc.primeste(buna, n) }]);
    if (!miniJocuriPornite()) {
      // Cu mini-jocurile oprite, Vale culege singur ce-i trebuie: florile cerute acum de o misiune (alifia pentru
      // Ember: păpădie, piciorul-cocoșului, mușețel; luminițele pentru Marta), altfel planta bună, ca până acum
      const cerute = floriCerute(a, buna);
      if (cerute.length) return cuImagine(a, () => facut() && joc.dupaActiune('', cerute.map(([id, n]) => ({ tip: 'obiect', id, n: joc.primeste(id, n) }))), a.sunet);
      return cuImagine(a, () => facut() && primeste(a.nFaraJoc ?? 2), a.sunet);
    }
    joc.salveaza();
    if (a.sunet) setTimeout(() => joc.sunet.efect(a.sunet), 150);
    // Orice floare culeasă rămâne în rucsac (decis de autor): cea bună pentru misiune, celelalte pentru poțiunile
    // Bătrânei Morwen
    // „intrebare” poate fi și o listă { conditii, text }: îndemnul potrivit misiunii de acum (florile pentru alifia
    // lui Ember, nu sunătoarea lui Elian)
    mini.culege({ ...a, intrebare: textPotrivit(a.intrebare, joc.stare) }).then(({ culese }) => {
      if (!facut()) return;
      const numar = {};
      for (const id of culese) numar[id] = (numar[id] || 0) + (id === buna ? a.nPeCorecta || 1 : 1);
      joc.dupaActiune('', Object.entries(numar).map(([id, n]) => ({ tip: 'obiect', id, n: joc.primeste(id, n) })));
    });
  }

  // Un gând: un text, o listă din care se alege unul la întâmplare, sau gânduri cu condiții ({ conditii, text }),
  // dintre care câștigă primul îndeplinit (ieșirea de la Marginea: alt gând după ce l-a scos Roderick pe acolo)
  function alegeGand(text) {
    const lista = [].concat(text);
    const cuConditii = lista.find((x) => typeof x === 'object' && verifica(x.conditii, context(joc.stare)));
    if (cuConditii) return joc.gand(cuConditii.text);
    const simple = lista.filter((x) => typeof x === 'string');
    return joc.gand(simple[Math.floor(Math.random() * simple.length)]);
  }

  const tipuri = {
    culege,
    cauta,
    lucrare,
    dormi,
    obtine,
    magazin,
    cufar: () => joc.deschideInventarul({ cufar: true }),
    taxa: () => joc.platesteTaxa(),
    // Un loc unde Vale doar se gândește la ceva (ieșirea de la Marginea satului) sau unde pornește o scurtă
    // scenă (mormântul tatălui): fără muncă și fără magazin
    // „text” poate fi și o listă: Vale se gândește de fiecare dată la altceva (Marta, bolnavă, în pat), sau gânduri
    // cu condiții (vezi alegeGand)
    gand: (a) => alegeGand(a.text),
    // Cât nu poate reveni (mormântul: o dată pe zi), doar gândul lui Vale
    // „cand”: condițiile fără de care Vale doar se gândește („gandCand”): contrabandistul vine doar 18–02
    // „cand” poate fi și o listă { conditii, gand }: primul neîndeplinit spune de ce nu (lada colectorului: doar
    // noaptea, și nu chiar în noaptea în care i-a văzut orcul)
    eveniment: (a) => {
      const ctx = context(joc.stare);
      const cand = Array.isArray(a.cand) ? a.cand : a.cand ? [{ conditii: a.cand, gand: a.gandCand }] : [];
      const opreste = cand.find((c) => !verifica(c.conditii, ctx));
      if (opreste) return alegeGand(opreste.gand || t('Nu e momentul potrivit.'));
      // Și gândurile de aici pot avea condiții (cufărul lui Bram: altul după ce a văzut săbiile, altul când e gol)
      return joc.pornesteEveniment(a.eveniment) || (a.gandAltfel && alegeGand(a.gandAltfel));
    },
    lupta: (a) => {
      if (joc.avanseaza(a.minute || 0)) return;
      joc.pornesteLupta(a.lupta);
    },
  };

  return {
    munca,
    mini,
    executa(a) {
      const f = tipuri[a.tip];
      if (f) f(a);
      else joc.mesaj(`Acțiune necunoscută: ${a.tip}`);
    },
  };
}
