import { elementImagine, urlImagine } from './imagini.js';
import { limbaJoc, seteazaLimba } from './limba.js';

// Prologul din joc (cerut de autor): la „Joc nou” se deschide o carte, „Cronica Aldariei”, cu cele 7 capitole din
// data/prolog.json, iar pe pagina de după ultimul capitol, harta Aldenorului (decis de autor). Aceeași carte ca a
// personajelor (ui_carte.png, săgețile, foaia care se întoarce), dar textul se împarte singur pe pagini: un capitol
// lung trece pe pagina următoare, ca într-o carte adevărată, în loc să se deruleze. Limba (Română / English) se ține
// minte în browser, ca în tab-ul „Prolog” din editor.
// Cartea stă întâi închisă, pe o masă (cerut de autor): coperta (ui_prolog_coperta.png) peste masă
// (ui_prolog_masa.png); un clic pe ea o deschide acolo, iar coperta se întoarce spre stânga, ca o foaie. Până se
// încarcă imaginile, masa e un fundal întunecat și coperta e din CSS (piele, chenar auriu); titlul îl scrie jocul, în
// limba aleasă, ca să nu-l strice AI-ul.

// Limba aleasă aici e și limba jocului (decis de autor): o ține minte limba.js, sub aceeași cheie ca înainte
const LIMBI = {
  ro: { capitol: 'Capitolul', alta: 'English', sari: 'Sari peste', incepe: 'Începe povestea', inchide: 'Închide', deschide: 'Apasă pe carte ca s-o deschizi', fara: '🔇 Fără muzică', cu: '🔊 Pornește muzica' },
  en: { capitol: 'Chapter', alta: 'Română', sari: 'Skip', incepe: 'Begin the story', inchide: 'Close', deschide: 'Click the book to open it', fara: '🔇 Mute music', cu: '🔊 Play music' },
};
const ROMANE = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

export const IMAGINI_PROLOG = {
  masa: 'ui/ui_prolog_masa.png',
  coperta: 'ui/ui_prolog_coperta.png',
  // Butonul muzicii (făcut de autor): cât merge muzica și cu muzica oprită; până se încarcă, pergament cu text
  muzica: 'ui/ui_prolog_muzica.png',
  faraMuzica: 'ui/ui_prolog_fara_muzica.png',
};

const div = (clasa, text) => Object.assign(document.createElement('div'), { className: clasa, textContent: text ?? '' });
const buton = (clasa, text, clic) => Object.assign(document.createElement('button'), { className: `buton ${clasa}`, textContent: text, onclick: clic });

// O imagine care, dacă lipsește, pur și simplu nu se vede (dedesubt rămâne rezerva din CSS), fără dreptunghiul cu numele;
// „laIncarcare”: când se încarcă, rezerva se ascunde (coperta transparentă la colțuri nu mai arată pielea din CSS)
function imagineOptionala(cale, clasa, laIncarcare) {
  const img = Object.assign(document.createElement('img'), { className: clasa, alt: '', draggable: false });
  img.onerror = () => img.remove();
  img.onload = () => laIncarcare?.();
  img.src = urlImagine(cale);
  return img;
}

const limbaSalvata = () => limbaJoc();
// Schimbă și limba jocului: datele și interfața se rescriu pe loc (limba.js), cartea se reface aici
const salveazaLimba = (l) => seteazaLimba(l);

export function creeazaPrologul(parinte, joc) {
  let el = null;
  let limba = limbaSalvata();
  // Paginile cărții, pe rând: { tip: 'titlu' | 'text' | 'sfarsit' | 'harta', noduri, capitol }; perechile sunt foile deschise
  let pagini = [];
  let foaie = 0;
  let inceputCapitol = [];
  let animatie = false;
  let laFinal = null;
  let recitire = false;
  let inchisa = true;
  let faraMuzica = false;

  const prolog = () => joc.date.prolog || { capitole: [] };
  const numarFoi = () => Math.ceil(pagini.length / 2);
  const eHarta = (f) => pagini[f * 2]?.tip === 'harta';

  // ---------- împărțirea textului pe pagini ----------
  // Se măsoară în pagini ascunse, cu aceleași margini ca cele adevărate (stânga și dreapta diferă, după imaginea
  // cărții), așa că o pagină nu iese niciodată peste marginea hârtiei, oricât de lung ar fi un capitol
  function paginiPentru(carteAscunsa) {
    const masuri = ['stanga', 'dreapta'].map((parte) => {
      const p = div(`pagina ${parte}`);
      const t = div('text-prolog');
      t.lang = limba;
      p.append(t);
      carteAscunsa.append(p);
      return t;
    });
    const rezultat = [{ tip: 'titlu' }];
    inceputCapitol = [];
    const masura = () => masuri[rezultat.length % 2];
    const incape = (m) => m.scrollHeight <= m.clientHeight + 1;
    // Textul curge de la un capitol la altul, ca într-o carte tipărită (cerut de autor): fără pagini goale sau cu un
    // singur cuvânt; un capitol nou începe sub cel de dinainte doar dacă acela s-a terminat în prima parte a paginii
    let m = null;
    let capitolPagina = null;
    const paginaNoua = () => {
      m = masura();
      m.replaceChildren();
      capitolPagina = null;
    };
    const inchidePagina = () => {
      rezultat.push({ tip: 'text', capitol: capitolPagina, noduri: [...m.childNodes].map((n) => n.cloneNode(true)) });
      paginaNoua();
    };
    paginaNoua();
    prolog().capitole.forEach((c, i) => {
      const paragrafe = c.paragrafe?.[limba] || [];
      const antet = () => [
        div(`nr-capitol-prolog${m.childNodes.length ? ' dupa-text' : ''}`, `${LIMBI[limba].capitol} ${ROMANE[i] || i + 1}`),
        div('titlu-capitol-prolog', c.titlu?.[limba] || ''),
      ];
      if (m.childNodes.length) {
        // Dacă textul de dinainte trece de aproape jumătatea paginii, capitolul nou începe pe pagina următoare (cerut de
        // autor); sub un capitol care s-a terminat sus pe pagină, începe chiar acolo, ca să nu rămână pagina goală
        const ultim = m.lastElementChild;
        const folosit = ultim ? ultim.offsetTop + ultim.offsetHeight - m.offsetTop : 0;
        const proba = [...antet(), Object.assign(document.createElement('p'), { textContent: (paragrafe[0] || '').slice(0, 140) })];
        m.append(...proba);
        const incapeAici = incape(m) && folosit < m.clientHeight * 0.35;
        proba.forEach((n) => n.remove());
        if (!incapeAici) inchidePagina();
      }
      inceputCapitol[i] = Math.floor(rezultat.length / 2);
      capitolPagina ??= i;
      m.append(...antet());
      for (const text of paragrafe) {
        let rest = text;
        let continuare = false;
        while (rest) {
          const p = document.createElement('p');
          if (continuare) p.className = 'continuare';
          p.textContent = rest;
          capitolPagina ??= i;
          m.append(p);
          if (incape(m)) break;
          // Paragraful nu încape tot: atâtea cuvinte câte încap rămân aici, restul trece pe pagina următoare
          const cuvinte = rest.split(' ');
          let lo = 0;
          let hi = cuvinte.length - 1;
          while (lo < hi) {
            const mij = Math.ceil((lo + hi) / 2);
            p.textContent = cuvinte.slice(0, mij).join(' ');
            if (incape(m)) lo = mij;
            else hi = mij - 1;
          }
          if (lo === 0) p.remove();
          else p.textContent = cuvinte.slice(0, lo).join(' ');
          rest = cuvinte.slice(lo).join(' ');
          continuare = lo > 0;
          // O pagină goală care tot nu primește nimic ar bucla la nesfârșit: atunci paragraful rămâne întreg aici
          if (!m.childNodes.length) {
            p.textContent = rest;
            m.append(p);
            rest = '';
          }
          inchidePagina();
        }
      }
    });
    if (m.childNodes.length) inchidePagina();
    // Dacă ultima pagină cu text e în stânga, pe dreapta stă semnul de sfârșit al cronicii, nu o pagină goală
    if (rezultat.length % 2) rezultat.push({ tip: 'sfarsit' });
    // Harta, pe foaia de după ultimul capitol (decis de autor), întinsă pe amândouă paginile
    rezultat.push({ tip: 'harta' }, { tip: 'harta' });
    return rezultat;
  }

  function imparte() {
    const ascunsa = div('carte carte-prolog masurare-prolog');
    el.querySelector('.cadru-prolog').append(ascunsa);
    pagini = paginiPentru(ascunsa);
    ascunsa.remove();
  }

  // ---------- desenarea ----------
  function pagina(i) {
    const p = pagini[i];
    const pag = div(`pagina ${i % 2 ? 'dreapta' : 'stanga'}`);
    // Un clic pe pagina din dreapta dă pagina, pe cea din stânga se întoarce (cerut de autor)
    if (p && p.tip !== 'harta') {
      pag.classList.add('se-da-prolog');
      pag.onclick = () => intoarce(i % 2 ? 1 : -1);
    }
    if (!p || p.tip === 'harta') return pag;
    if (p.tip === 'sfarsit') {
      pag.append(div('sfarsit-prolog', '◆  ◆  ◆'));
      return pag;
    }
    if (p.tip === 'titlu') {
      const t = div('pagina-titlu-prolog');
      t.append(div('ornament-prolog', '◆'), div('titlu-carte-prolog', prolog().titlu?.[limba] || ''), div('ornament-prolog', '◆'));
      pag.append(t);
      return pag;
    }
    const t = div('text-prolog');
    t.lang = limba;
    t.append(...p.noduri.map((n) => n.cloneNode(true)));
    // Numărul paginii jos, ca într-o carte; titlul nu se numără
    pag.append(t, div('folio-prolog', String(i)));
    return pag;
  }

  function harta() {
    const h = div('harta-prolog');
    const cale = prolog().harta?.imagine;
    if (!cale) return h;
    h.append(elementImagine([cale], { clasa: 'imagine-harta-prolog', raport: 16 / 9, eticheta: cale }));
    // Un clic o arată mare, pe tot ecranul; încă un clic o închide
    h.onclick = () => {
      const mare = div('harta-mare-prolog');
      mare.append(elementImagine([cale], { clasa: 'imagine-harta-prolog', raport: 16 / 9, eticheta: cale }));
      mare.onclick = () => mare.remove();
      el.append(mare);
    };
    return h;
  }

  const carteaDeschisa = () => el.querySelector('.cadru-prolog .carte-prolog');

  function arata() {
    const carte = carteaDeschisa();
    carte.replaceChildren(pagina(foaie * 2), pagina(foaie * 2 + 1));
    if (eHarta(foaie)) carte.append(harta());
    butoane();
  }

  function butoane() {
    el.querySelector('.comuta-carte').textContent = LIMBI[limba].alta;
    const titlu = el.querySelector('.titlu-coperta-prolog');
    if (titlu) {
      titlu.textContent = prolog().titlu?.[limba] || '';
      // Un titlu lung (în engleză, pe două rânduri) urcă mai sus și e puțin mai mic, ca să nu atingă rombul (cerut de autor)
      titlu.classList.toggle('titlu-lung', titlu.textContent.length > 18);
    }
    const indemn = el.querySelector('.indemn-prolog');
    if (indemn) indemn.textContent = LIMBI[limba].deschide;
    // La un joc nou: „Sari peste”, iar pe ultima foaie „Începe povestea”; la recitire (din galerie): „Închide”.
    // Lângă el, muzica de fundal a cărții (cerut de autor): se oprește doar aici; în joc, sunetele merg ca de obicei.
    // La hartă rămâne doar „Începe povestea”
    const ultima = !inchisa && foaie >= numarFoi() - 1;
    const gata = el.querySelector('.inchide-carte');
    gata.textContent = recitire ? LIMBI[limba].inchide : ultima ? LIMBI[limba].incepe : LIMBI[limba].sari;
    gata.classList.toggle('incepe-prolog', !recitire && ultima);
    const bs = el.querySelector('.sunet-prolog');
    bs.querySelector('.text-sunet-prolog').textContent = faraMuzica ? LIMBI[limba].cu : LIMBI[limba].fara;
    bs.title = (faraMuzica ? LIMBI[limba].cu : LIMBI[limba].fara).replace(/^\S+\s/, '');
    bs.querySelector('.img-muzica')?.classList.toggle('activ', !faraMuzica);
    bs.querySelector('.img-fara-muzica')?.classList.toggle('activ', faraMuzica);
    el.classList.toggle('la-harta', !inchisa && eHarta(foaie));
  }

  // Butonul muzicii: textul pe pergament sau, când autorul a încărcat imaginile lui, chiar imaginea (fără pergament)
  function butonMuzica() {
    const b = buton('buton-mic-meniu sunet-prolog', '', comutaSunetul);
    const cuImagine = () => b.classList.add('cu-imagine');
    b.append(
      Object.assign(document.createElement('span'), { className: 'text-sunet-prolog' }),
      imagineOptionala(IMAGINI_PROLOG.muzica, 'img-muzica', cuImagine),
      imagineOptionala(IMAGINI_PROLOG.faraMuzica, 'img-fara-muzica', cuImagine),
    );
    return b;
  }

  function comutaSunetul() {
    faraMuzica = !faraMuzica;
    joc.sunet.muzica(faraMuzica ? null : 'meniu');
    butoane();
  }

  // Coperta se întoarce spre stânga în jurul cotorului, iar pe spatele ei e pagina cu titlul; cartea alunecă la
  // mijloc cât se deschide (închisă, coperta stă ea la mijlocul ecranului)
  function deschideCartea() {
    if (!inchisa || animatie) return;
    inchisa = false;
    joc.sunet.efect('pagina');
    const cadru = el.querySelector('.cadru-prolog');
    const coperta = el.querySelector('.coperta-prolog');
    // Pe dosul copertei e chiar jumătatea stângă a cărții deschise (imaginea ei și pagina cu titlul), nu o hârtie
    // din CSS: la sfârșitul întoarcerii stă exact peste ea, fără o pată albă (cerut de autor)
    const spateCarte = div('carte carte-prolog spate-carte-prolog');
    spateCarte.append(pagina(0));
    coperta.querySelector('.spate-coperta').replaceChildren(spateCarte);
    // Cartea alunecă la mijloc și se mărește cât se întoarce coperta; paginile apar pe la jumătatea întoarcerii
    cadru.classList.remove('inchisa');
    cadru.classList.add('se-deschide');
    el.classList.remove('inchisa');
    const semn = {};
    animatie = semn;
    const gata = () => {
      if (animatie !== semn) return;
      animatie = false;
      if (!el) return;
      coperta.remove();
      cadru.classList.remove('se-deschide');
      butoane();
    };
    coperta.addEventListener('animationend', (e) => e.target === coperta && gata());
    setTimeout(gata, 2000);
  }

  // Foaia care se întoarce, ca la cartea personajelor; spre hartă și înapoi, foaia nu se întoarce (harta stă peste
  // amândouă paginile), ci harta apare încet
  function intoarce(dir) {
    if (inchisa) return dir > 0 && deschideCartea();
    const noua = foaie + dir;
    if (animatie || noua < 0 || noua >= numarFoi()) return;
    joc.sunet.efect('pagina');
    const carte = carteaDeschisa();
    if (eHarta(noua) || eHarta(foaie)) {
      foaie = noua;
      arata();
      carte.classList.remove('apare-prolog');
      void carte.offsetWidth;
      carte.classList.add('apare-prolog');
      return;
    }
    const [stanga, dreapta] = carte.children;
    const f = div(`foaie ${dir > 0 ? 'spre-stanga' : 'spre-dreapta'}`);
    const fata = div('fata-foaie');
    const spate = div('spate-foaie');
    if (dir > 0) {
      fata.append(dreapta.cloneNode(true));
      spate.append(pagina(noua * 2));
      carte.replaceChild(pagina(noua * 2 + 1), dreapta);
    } else {
      fata.append(stanga.cloneNode(true));
      spate.append(pagina(noua * 2 + 1));
      carte.replaceChild(pagina(noua * 2), stanga);
    }
    f.append(fata, spate);
    carte.append(f);
    const semn = {};
    animatie = semn;
    const gata = () => {
      if (animatie !== semn) return;
      animatie = false;
      foaie = noua;
      if (!el) return;
      carte.replaceChild(spate.firstChild, dir > 0 ? stanga : dreapta);
      f.remove();
      butoane();
    };
    f.addEventListener('animationend', gata);
    // Dacă animația nu pornește (tab ascuns), cartea nu rămâne blocată
    setTimeout(gata, 1200);
  }

  function schimbaLimba() {
    if (animatie) return;
    // Rămâi la același capitol (ca în editor): foaia la care începe capitolul de acum, în cealaltă limbă
    const capitol = pagini[foaie * 2]?.capitol ?? pagini[foaie * 2 + 1]?.capitol;
    const laHarta = eHarta(foaie);
    limba = limba === 'ro' ? 'en' : 'ro';
    salveazaLimba(limba);
    joc.sunet.efect('pagina');
    imparte();
    foaie = laHarta ? numarFoi() - 1 : capitol != null ? inceputCapitol[capitol] : 0;
    arata();
  }

  // Cât e deschis, tastele sunt ale cărții (săgețile răsfoiesc): nu deschid inventarul sau cartea personajelor pe
  // dedesubt și nu mută scena; panoul debug (F2) merge în continuare
  function taste(e) {
    if (!el || e.key === 'F2' || e.key === '`') return;
    e.stopImmediatePropagation();
    if (e.key === 'ArrowRight') intoarce(1);
    if (e.key === 'ArrowLeft') intoarce(-1);
    if ((e.key === 'Enter' || e.key === ' ') && inchisa) deschideCartea();
  }

  function inchide() {
    if (!el) return;
    el.remove();
    el = null;
    animatie = false;
    removeEventListener('keydown', taste, true);
    joc.sunet.muzica(null);
    const dupa = laFinal;
    laFinal = null;
    dupa?.();
  }

  // „recitire”: deschis din galerie, doar ca să fie citit; altfel e începutul unui joc nou, iar „laFinal” pornește jocul
  async function deschide(opt = {}) {
    if (el) return;
    // Limba poate fi schimbată între timp din Opțiuni: cartea se deschide în limba jocului de acum
    limba = limbaSalvata();
    recitire = !!opt.recitire;
    laFinal = opt.laFinal || null;
    inchisa = true;
    faraMuzica = false;
    el = div('ecran-carte ecran-prolog inchisa');
    // Cadrul are mărimea și locul cărții deschise; coperta stă peste jumătatea dreaptă (cotorul e la mijloc)
    const cadru = div('cadru-prolog inchisa');
    const coperta = div('coperta-prolog');
    const fata = div('fata-coperta');
    fata.append(imagineOptionala(IMAGINI_PROLOG.coperta, 'imagine-coperta-prolog', () => fata.classList.add('cu-imagine')), div('titlu-coperta-prolog'));
    fata.onclick = deschideCartea;
    coperta.append(fata, div('spate-coperta'));
    cadru.append(div('carte carte-prolog'), coperta);
    el.append(
      imagineOptionala(IMAGINI_PROLOG.masa, 'masa-prolog'),
      cadru,
      div('indemn-prolog', LIMBI[limba].deschide),
      // Fără săgeți (cerut de autor): paginile se dau cu un clic pe ele (sau cu tastele ← →)
      // Butoanele de jos stau unul lângă altul, la mijloc; cele ascunse (la hartă) nu lasă loc gol
      Object.assign(div('butoane-prolog'), {}),
    );
    el.querySelector('.butoane-prolog').append(
      buton('buton-mic-meniu comuta-carte', '', schimbaLimba),
      buton('buton-mic-meniu inchide-carte', '', inchide),
      butonMuzica(),
    );
    // Ecranul complet, ca în joc, în colțul dreapta-sus (cerut de autor)
    const ecran = joc.butonEcranComplet?.();
    if (ecran) {
      const colt = div('butoane-hud colt-prolog');
      colt.append(ecran);
      el.append(colt);
    }
    parinte.append(el);
    addEventListener('keydown', taste, true);
    // Cartea are melodia meniului, ca o pauză înainte de poveste
    joc.sunet.muzica('meniu');
    // Fonturile trebuie să fie gata înainte de măsurat, altfel paginile s-ar împărți după alt scris
    try {
      await document.fonts?.ready;
    } catch {
      // se măsoară cu ce e
    }
    if (!el) return;
    imparte();
    foaie = 0;
    arata();
  }

  return { deschide, inchide, deschis: () => !!el };
}
