import { elementImagine, urlImagine } from './imagini.js';

// Prologul din joc (cerut de autor): la „Joc nou” se deschide o carte, „Cronica Aldariei”, cu cele 7 capitole din
// data/prolog.json, iar pe pagina de după ultimul capitol, harta Aldenorului (decis de autor). Aceeași carte ca a
// personajelor (ui_carte.png, săgețile, foaia care se întoarce), dar textul se împarte singur pe pagini: un capitol
// lung trece pe pagina următoare, ca într-o carte adevărată, în loc să se deruleze. Limba (Română / English) se ține
// minte în browser, ca în tab-ul „Prolog” din editor.
// Cartea stă întâi închisă, pe o masă (cerut de autor): coperta (ui_prolog_coperta.png) peste masă
// (ui_prolog_masa.png); un clic pe ea o deschide acolo, iar coperta se întoarce spre stânga, ca o foaie. Până se
// încarcă imaginile, masa e un fundal întunecat și coperta e din CSS (piele, chenar auriu); titlul îl scrie jocul, în
// limba aleasă, ca să nu-l strice AI-ul.

const CHEIE_LIMBA = 'joc-prolog-limba';
const LIMBI = {
  ro: { capitol: 'Capitolul', alta: 'English', sari: 'Sari peste', incepe: 'Începe povestea', inchide: 'Închide', deschide: 'Apasă pe carte ca s-o deschizi' },
  en: { capitol: 'Chapter', alta: 'Română', sari: 'Skip', incepe: 'Begin the story', inchide: 'Close', deschide: 'Click the book to open it' },
};
const ROMANE = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

export const IMAGINI_PROLOG = { masa: 'ui/ui_prolog_masa.png', coperta: 'ui/ui_prolog_coperta.png' };

const div = (clasa, text) => Object.assign(document.createElement('div'), { className: clasa, textContent: text ?? '' });
const buton = (clasa, text, clic) => Object.assign(document.createElement('button'), { className: `buton ${clasa}`, textContent: text, onclick: clic });

// O imagine care, dacă lipsește, pur și simplu nu se vede (dedesubt rămâne rezerva din CSS), fără dreptunghiul cu numele
function imagineOptionala(cale, clasa) {
  const img = Object.assign(document.createElement('img'), { className: clasa, alt: '', draggable: false });
  img.onerror = () => img.remove();
  img.src = urlImagine(cale);
  return img;
}

function limbaSalvata() {
  try {
    const l = localStorage.getItem(CHEIE_LIMBA);
    if (LIMBI[l]) return l;
  } catch {
    // fără acces la browser: româna
  }
  return 'ro';
}
function salveazaLimba(l) {
  try {
    localStorage.setItem(CHEIE_LIMBA, l);
  } catch {
    // nu se ține minte, dar merge
  }
}

export function creeazaPrologul(parinte, joc) {
  let el = null;
  let limba = limbaSalvata();
  // Paginile cărții, pe rând: { tip: 'titlu' | 'text' | 'gol' | 'harta', noduri, capitol }; perechile sunt foile deschise
  let pagini = [];
  let foaie = 0;
  let inceputCapitol = [];
  let animatie = false;
  let laFinal = null;
  let recitire = false;
  let inchisa = true;

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
    prolog().capitole.forEach((c, i) => {
      inceputCapitol[i] = Math.floor(rezultat.length / 2);
      let m = masura();
      m.replaceChildren(div('nr-capitol-prolog', `${LIMBI[limba].capitol} ${ROMANE[i] || i + 1}`), div('titlu-capitol-prolog', c.titlu?.[limba] || ''));
      const inchidePagina = () => {
        rezultat.push({ tip: 'text', capitol: i, noduri: [...m.childNodes].map((n) => n.cloneNode(true)) });
        m = masura();
        m.replaceChildren();
      };
      for (const text of c.paragrafe?.[limba] || []) {
        let rest = text;
        let continuare = false;
        while (rest) {
          const p = document.createElement('p');
          if (continuare) p.className = 'continuare';
          p.textContent = rest;
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
      if (m.childNodes.length) inchidePagina();
      // Fiecare capitol începe pe o foaie nouă, cu titlul pe pagina din stânga
      if (rezultat.length % 2) rezultat.push({ tip: 'gol' });
    });
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
    if (!p || p.tip === 'gol' || p.tip === 'harta') return pag;
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
    el.querySelector('.inapoi-carte').disabled = foaie <= 0 || inchisa;
    el.querySelector('.inainte-carte').disabled = foaie >= numarFoi() - 1 || inchisa;
    el.querySelector('.comuta-carte').textContent = LIMBI[limba].alta;
    el.querySelector('.titlu-coperta-prolog') && (el.querySelector('.titlu-coperta-prolog').textContent = prolog().titlu?.[limba] || '');
    el.querySelector('.indemn-prolog') && (el.querySelector('.indemn-prolog').textContent = LIMBI[limba].deschide);
    // La recitire (din galerie) e doar „Închide”; la joc nou, „Sari peste”, iar la hartă „Începe povestea”
    const gata = el.querySelector('.inchide-carte');
    const ultima = !inchisa && foaie >= numarFoi() - 1;
    gata.textContent = recitire ? LIMBI[limba].inchide : ultima ? LIMBI[limba].incepe : LIMBI[limba].sari;
    gata.classList.toggle('incepe-prolog', !recitire && ultima);
  }

  // Coperta se întoarce spre stânga în jurul cotorului, iar pe spatele ei e pagina cu titlul; cartea alunecă la
  // mijloc cât se deschide (închisă, coperta stă ea la mijlocul ecranului)
  function deschideCartea() {
    if (!inchisa || animatie) return;
    inchisa = false;
    joc.sunet.efect('pagina');
    const cadru = el.querySelector('.cadru-prolog');
    const coperta = el.querySelector('.coperta-prolog');
    coperta.querySelector('.spate-coperta').replaceChildren(pagina(0));
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
    recitire = !!opt.recitire;
    laFinal = opt.laFinal || null;
    inchisa = true;
    el = div('ecran-carte ecran-prolog inchisa');
    // Cadrul are mărimea și locul cărții deschise; coperta stă peste jumătatea dreaptă (cotorul e la mijloc)
    const cadru = div('cadru-prolog inchisa');
    const coperta = div('coperta-prolog');
    const fata = div('fata-coperta');
    fata.append(imagineOptionala(IMAGINI_PROLOG.coperta, 'imagine-coperta-prolog'), div('titlu-coperta-prolog', prolog().titlu?.[limba] || ''));
    fata.onclick = deschideCartea;
    coperta.append(fata, div('spate-coperta'));
    cadru.append(div('carte carte-prolog'), coperta);
    el.append(
      imagineOptionala(IMAGINI_PROLOG.masa, 'masa-prolog'),
      cadru,
      div('indemn-prolog', LIMBI[limba].deschide),
      buton('inapoi-carte', '◀', () => intoarce(-1)),
      buton('inainte-carte', '▶', () => intoarce(1)),
      buton('buton-mic-meniu comuta-carte', '', schimbaLimba),
      buton('buton-mic-meniu inchide-carte', '', inchide),
    );
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
