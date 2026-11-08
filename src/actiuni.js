import { inMinute, MINUTE_ZI, momentZi } from './timp.js';
import { minuteInZi, schimbaNevoie, ziua, context } from './stare.js';
import { verifica } from './conditii.js';
import { aplicaEfecte } from './efecte.js';
import { baraNevoie } from './baraNevoie.js';
import { pozitie, aplicaPozitie, INALTIME } from './scena.js';
import { RAPORT_BARA_INV } from './lume.js';
import { creeazaMiniJocuri } from './miniJocuri.js';
import { miniJocuriPornite } from './uiGrafica.js';

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
    p.append(div('titlu-meniu', titlu), ...continut(inchide), buton('Închide', inchide));
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

  function munca(idMunca) {
    const m = cfg.munca[idMunca];
    if (!m) return joc.mesaj('Munca asta nu e definită în config.');
    // Noaptea nu se lucrează la câmp, la vaci sau la moară (decis de autor): doar gândul lui Vale
    if (m.gandNoapte && momentZi(minuteInZi(joc.stare)) === 'noaptea') return joc.gand(m.gandNoapte);
    panou(m.nume, (inchide) => {
      const s = joc.stare;
      const cuJoc = m.miniJoc && miniJocuriPornite();
      const info = div('text-anunt', `${m.monedePeOra} monede și −${m.staminaPeOra} stamina pe oră.${cuJoc ? ' Cât de bine lucrezi: de la jumătate până la +50%.' : ''}`);
      if (prea_obosit()) return [info, div('text-anunt', 'Ești prea obosit pentru muncă grea. Odihnește-te întâi.')];
      const ore = [1, 2, 4].map((h) =>
        cuBaraStamina(buton(`Muncește ${h} ${h === 1 ? 'oră' : 'ore'} (+${h * m.monedePeOra} monede)`, async () => {
          inchide();
          if (joc.avanseaza(h * 60)) return;
          schimbaNevoie(s, 'stamina', -h * m.staminaPeOra);
          // Cu mini-jocul (decis de autor): perfect = +50%, ratat de tot = jumătate; oprit din Opțiuni = cât era
          if (cuJoc) {
            joc.salveaza();
            setTimeout(() => joc.sunet.efect('munca'), 150);
            const scor = await mini[m.miniJoc]({ imagine: m.imagine, titlu: m.nume });
            const bani = Math.round(h * m.monedePeOra * (0.5 + scor));
            s.bani += bani;
            return joc.dupaActiune(`+${bani} monede`);
          }
          s.bani += h * m.monedePeOra;
          // Întâi imaginea cu Vale la muncă (cu sunetul muncii), apoi ce a câștigat
          cuImagine(m, () => joc.dupaActiune(`+${h * m.monedePeOra} monede`), 'munca');
        }, s.nevoi.stamina < h * m.staminaPeOra), () => -h * m.staminaPeOra),
      );
      return [info, ...ore];
    });
  }

  function dormi(a) {
    const s = joc.stare;
    if (a.cost && s.bani < a.cost) return joc.gand(`N-am destui bani. Îmi trebuie ${a.cost} monede.`);
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
      const deZi = momentZi(acum) !== 'noaptea';
      cuImagine({ ...a, imagine: (deZi && (v.imagineZi || a.imagineZi)) || v.imagine || a.imagine }, () => joc.dupaActiune('Te-ai odihnit.'), 'somn');
    };
    // Mereu patru butoane, în ordinea cerută de autor: 2 ore, 6 ore, apoi „până dimineața” seara și noaptea
    // (până la ora trezirii) sau „până noaptea” ziua (până la 23:00, când începe noaptea), și „Închide”
    const acum = minuteInZi(s);
    const ziua = momentZi(acum) === 'dimineata' || momentZi(acum) === 'amiaza';
    const tinta = ziua ? inMinute('23:00') : inMinute(cfg.somn.oraTrezire);
    const pana = (tinta - acum + MINUTE_ZI) % MINUTE_ZI || MINUTE_ZI;
    panou(a.nume || 'Dormi', (inchide) => [
      cuBaraStamina(buton('Dormi 2 ore', () => (inchide(), somn(120))), () => refacereSomn(120)),
      cuBaraStamina(buton('Dormi 6 ore', () => (inchide(), somn(360))), () => refacereSomn(360)),
      cuBaraStamina(buton(ziua ? 'Dormi până noaptea' : 'Dormi până dimineața', () => (inchide(), somn(pana))), () => refacereSomn(pana)),
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
    if (a.stamina && prea_obosit()) return joc.gand('Sunt prea obosit. Trebuie să mă odihnesc întâi.');
    if (a.maxPeZi && folosiriAzi(a).n >= a.maxPeZi) return joc.gand(a.mesajMaxPeZi || 'Destul pentru azi. Mâine din nou.');
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
    if (a.maxPeZi) folosiriAzi(a).n++;
    if (joc.avanseaza(a.minute || 0)) return;
    if (a.stamina) schimbaNevoie(joc.stare, 'stamina', -a.stamina);
    // Lemnele cu mini-jocul cercului (decis de autor): fiecare lovitură reușită aduce „nPeLovitura” lemne;
    // cu mini-jocurile oprite din Opțiuni, „n” (cât la o lovitură din două, cam)
    if (a.miniJoc && miniJocuriPornite()) {
      joc.salveaza();
      setTimeout(() => a.sunet && joc.sunet.efect(a.sunet), 150);
      return mini[a.miniJoc]({ imagine: a.imagine, titlu: a.titlu || a.nume, incercari: a.incercari }).then((lovituri) => {
        const n = lovituri * (a.nPeLovitura || 1);
        if (n) joc.primeste(a.obiect, n);
        joc.dupaActiune(n ? `+${n} ${inv.def(a.obiect).nume}` : '');
        if (!n && a.gandNimic) joc.gand(a.gandNimic);
      });
    }
    // Sunetul acțiunii, dacă are (apa de la fântână, lemnele); cu imagine (lemnele), sunetul vine odată cu ea
    cuImagine(
      a,
      () => {
        joc.primeste(a.obiect, a.n || 1);
        joc.dupaActiune(`+${a.n || 1} ${inv.def(a.obiect).nume}`);
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
      if (are < n) return joc.gand(`Îmi mai trebuie ${n - are} × ${inv.def(id).nume}. Am ${are} din ${n}.`);
    }
    if (a.stamina && s.nevoi.stamina < a.stamina) return joc.gand('Sunt prea obosit pentru asta. Trebuie să mă odihnesc întâi.');
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
    if (a.stamina && prea_obosit()) return joc.gand('Sunt prea obosit. Trebuie să mă odihnesc întâi.');
    if (a.maxPeZi && folosiriAzi(a).n >= a.maxPeZi) return joc.gand(a.mesajMaxPeZi || 'Destul pentru azi. Mâine din nou.');
    if (a.maxPeZi) folosiriAzi(a).n++;
    if (joc.avanseaza(a.minute || 60)) return;
    if (a.stamina) schimbaNevoie(s, 'stamina', -a.stamina);
    let z = Math.random() * a.tabel.reduce((t, x) => t + x.sansa, 0);
    const n = (a.tabel.find((x) => (z -= x.sansa) < 0) || a.tabel.at(-1)).n;
    const prima = a.primaData && !s.stari[`cautat_${a.id}`];
    if (prima) s.stari[`cautat_${a.id}`] = 'da';
    cuImagine(
      a,
      () => {
        if (n > 0) joc.primeste(a.obiect, n);
        joc.dupaActiune(n > 0 ? `+${n} ${inv.def(a.obiect).nume}` : '');
        if (prima) joc.gand(a.primaData);
        else if (!n && a.gandNimic) joc.gand(a.gandNimic);
      },
      a.sunet,
    );
  }

  // Culesul cu recunoaștere (decis de autor: ierburile lui Elian): pe imaginea culesului apar plantele, bune și
  // greșite, la întâmplare în zona desenată în editor; culegi cel mult „maxCulese”, fiecare bună aduce o bucată.
  // Cu mini-jocurile oprite din Opțiuni, Vale o alege singur pe cea bună și primește „nFaraJoc”.
  // Doar la orele din „ora” (sunătoarea se culege dimineața, cu roua pe ea)
  function culege(a) {
    const s = joc.stare;
    if (a.ora && !verifica({ ora: a.ora }, context(s))) return joc.gand(a.gandOra || 'Nu e momentul potrivit.');
    if (a.stamina && prea_obosit()) return joc.gand('Sunt prea obosit. Trebuie să mă odihnesc întâi.');
    if (a.maxPeZi && folosiriAzi(a).n >= a.maxPeZi) return joc.gand(a.mesajMaxPeZi || 'Destul pentru azi. Mâine din nou.');
    if (a.maxPeZi) folosiriAzi(a).n++;
    if (joc.avanseaza(a.minute || 60)) return;
    if (a.stamina) schimbaNevoie(s, 'stamina', -a.stamina);
    const buna = a.plante.find((p) => p.corecta).id;
    const primeste = (n) => {
      if (n) joc.primeste(buna, n);
      joc.dupaActiune(n ? `+${n} ${inv.def(buna).nume}` : '');
    };
    if (!miniJocuriPornite()) return cuImagine(a, () => primeste(a.nFaraJoc ?? 2), a.sunet);
    joc.salveaza();
    if (a.sunet) setTimeout(() => joc.sunet.efect(a.sunet), 150);
    mini.culege(a).then(({ corecte, gresite }) => {
      primeste(corecte * (a.nPeCorecta || 1));
      if (gresite) joc.gand(a.gandGresit || 'Unele nu semănau cu ce mi-a descris. Le-am lăsat acolo.');
    });
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
    lupta: (a) => {
      if (joc.avanseaza(a.minute || 0)) return;
      joc.pornesteLupta(a.lupta);
    },
  };

  return {
    munca,
    executa(a) {
      const f = tipuri[a.tip];
      if (f) f(a);
      else joc.mesaj(`Acțiune necunoscută: ${a.tip}`);
    },
  };
}
