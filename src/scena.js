import { elementImagine } from './imagini.js';
import { candidati } from './lume.js';
import { verifica } from './conditii.js';

export const LATIME = 1920;
export const INALTIME = 1080;

// Scena e mereu 1920×1080 și doar se scalează; toate pozițiile din date rămân valabile la orice ecran.
// Editorul poate adăuga zoom și deplasare (vedere), jocul rămâne mereu „potrivit în fereastră”.
export function creeazaEcran(parinte) {
  const ecran = document.createElement('div');
  ecran.className = 'ecran';
  const scena = document.createElement('div');
  scena.className = 'scena';
  const lume = document.createElement('div');
  lume.className = 'strat-lume';
  scena.append(lume);
  ecran.append(scena);
  parinte.append(ecran);

  const vedere = { zoom: 1, x: 0, y: 0 };
  const potrivire = () => {
    const r = ecran.getBoundingClientRect();
    return Math.min(r.width / LATIME, r.height / INALTIME) || 1;
  };
  const ajusteaza = () => {
    scena.style.transform = `translate(-50%, -50%) translate(${vedere.x}px, ${vedere.y}px) scale(${potrivire() * vedere.zoom})`;
  };
  new ResizeObserver(ajusteaza).observe(ecran);
  ajusteaza();

  // Zoom în jurul unui punct de pe ecran: punctul de sub mouse rămâne pe loc
  function zoomLa(zoomNou, clientX, clientY) {
    const r = ecran.getBoundingClientRect();
    const cx = clientX - (r.left + r.width / 2);
    const cy = clientY - (r.top + r.height / 2);
    const sVechi = potrivire() * vedere.zoom;
    vedere.zoom = Math.min(8, Math.max(1, zoomNou));
    const sNou = potrivire() * vedere.zoom;
    vedere.x = cx - ((cx - vedere.x) / sVechi) * sNou;
    vedere.y = cy - ((cy - vedere.y) / sVechi) * sNou;
    if (vedere.zoom === 1) vedere.x = vedere.y = 0;
    ajusteaza();
  }
  function muta(dx, dy) {
    vedere.x += dx;
    vedere.y += dy;
    ajusteaza();
  }
  function reseteaza() {
    Object.assign(vedere, { zoom: 1, x: 0, y: 0 });
    ajusteaza();
  }
  return { ecran, scena, lume, vedere, zoomLa, muta, reseteaza };
}

export function pozitieImplicita(index, tip) {
  // Până le aranjează autorul, obiectele stau într-un rând vizibil, ca să poată fi găsite și trase
  if (tip === 'sprite') return { x: 0.25 + (index % 4) * 0.17, y: 0.95, scara: 0.7 };
  return { x: 0.1 + (index % 6) * 0.16, y: 0.4 + Math.floor(index / 6) * 0.35, scara: 0.2 };
}

// Un sprite cu variantă „cu nume” (Miriam la cină) are poziția și zona lui, salvate sub „id@nume”;
// cât timp nu sunt aranjate, le moștenește pe cele de bază
export function sufixVarianta(descriere, idObiect, context) {
  const o = descriere.obiecte.find((x) => x.id === idObiect);
  if (o?.tip !== 'sprite') return '';
  const v = (o.variante || []).find((x) => x.nume && verifica(x.conditii, context));
  return v ? `@${v.nume}` : '';
}

export function pozitie(aranjare, obiect, index, sufix = '') {
  return (sufix && aranjare?.obiecte?.[obiect.id + sufix]) || aranjare?.obiecte?.[obiect.id] || obiect.implicit || pozitieImplicita(index, obiect.tip);
}

export function aplicaPozitie(el, p) {
  el.style.left = `${p.x * 100}%`;
  el.style.top = `${p.y * 100}%`;
  el.style.height = `${p.scara * 100}%`;
  // Ce e mai jos pe ecran e mai aproape de privitor, deci stă în față
  el.style.zIndex = String(Math.round(p.y * 1000));
}

export function puncteSvg(poligon) {
  return poligon.map(([x, y]) => `${x * LATIME},${y * INALTIME}`).join(' ');
}

// Fiecare desenare are masca ei, ca o scenă veche rămasă în pagină să nu împrumute forma prim-planului alteia
let numarMasca = 0;

export function randeaza(strat, descriere, aranjare, context) {
  strat.replaceChildren();
  const fundal = elementImagine(candidati(descriere.imagine, descriere.variante, context), { clasa: 'fundal', fundal: true });
  strat.append(fundal);

  // Prim-planul: bucăți din fundal (de exemplu zidul fântânii) desenate din nou PESTE personaje,
  // ca acestea să pară în spatele lor. Nu se taie nimic din sprite-uri, deci merge oriunde ar fi mutate.
  for (const poligon of aranjare?.primPlan || []) {
    if (poligon.length < 3) continue;
    const pp = elementImagine(candidati(descriere.imagine, descriere.variante, context), { clasa: 'fundal prim-plan', fundal: true });
    pp.style.clipPath = `polygon(${poligon.map(([x, y]) => `${x * 100}% ${y * 100}%`).join(', ')})`;
    strat.append(pp);
  }

  const obiecte = new Map();
  descriere.obiecte.forEach((o, i) => {
    const el = elementImagine(candidati(o.imagine, o.variante, context), {
      clasa: `obiect ${o.tip}`,
      raport: o.tip === 'sprite' ? 0.45 : o.tip === 'loc-lupta' ? 0.6 : 1.2,
      eticheta: o.eticheta,
    });
    el.dataset.id = o.id;
    aplicaPozitie(el, pozitie(aranjare, o, i, sufixVarianta(descriere, o.id, context)));
    strat.append(el);
    obiecte.set(o.id, el);
  });

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'zone');
  svg.setAttribute('viewBox', `0 0 ${LATIME} ${INALTIME}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  // Din contur rămâne doar strălucirea (linia însăși nu se desenează), ca la piese
  svg.innerHTML =
    '<defs><filter id="contur-moale" x="-10%" y="-10%" width="120%" height="120%">' +
    '<feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b"/>' +
    '<feMerge><feMergeNode in="b"/><feMergeNode in="b"/></feMerge></filter></defs>';
  // Strălucirea personajelor se oprește la prim-plan: dacă Agnes stă după tejghea, conturul ei nu trece peste tejghea.
  // Doar la personaje, pentru că ele sunt cele din spatele prim-planului; ușile și acțiunile se văd întregi
  let masca = null;
  const primPlan = (aranjare?.primPlan || []).filter((p) => p.length >= 3);
  if (primPlan.length) {
    masca = `fara-prim-plan-${++numarMasca}`;
    svg.querySelector('defs').insertAdjacentHTML(
      'beforeend',
      // Marginea măștii e estompată: strălucirea se stinge treptat spre prim-plan, nu se taie brusc
      `<filter id="${masca}-moale" filterUnits="userSpaceOnUse" x="0" y="0" width="${LATIME}" height="${INALTIME}"><feGaussianBlur stdDeviation="7"/></filter>` +
        `<mask id="${masca}" maskUnits="userSpaceOnUse" x="0" y="0" width="${LATIME}" height="${INALTIME}">` +
        `<rect width="${LATIME}" height="${INALTIME}" fill="white"/>` +
        `<g filter="url(#${masca}-moale)">${primPlan.map((p) => `<polygon fill="black" points="${puncteSvg(p)}"/>`).join('')}</g>` +
        '</mask>',
    );
  }
  const poligoane = new Map();
  for (const t of descriere.tinte) {
    const sufix = t.personaj ? sufixVarianta(descriere, t.personaj, context) : '';
    const poligon = (sufix && aranjare?.zone?.[t.id + sufix]) || aranjare?.zone?.[t.id];
    if (!poligon || poligon.length < 3) continue;
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    p.setAttribute('points', puncteSvg(poligon));
    p.setAttribute('class', 'zona-clic');
    p.setAttribute('filter', 'url(#contur-moale)');
    if (t.personaj && masca) p.setAttribute('mask', `url(#${masca})`);
    svg.append(p);
    poligoane.set(t.id, p);
  }
  strat.append(svg);
  return { fundal, obiecte, poligoane, svg, masca };
}

// Coordonate 0-1 față de scenă, indiferent de cât e scalată pe ecran
export function punctNormalizat(scena, ev) {
  const r = scena.getBoundingClientRect();
  return [(ev.clientX - r.left) / r.width, (ev.clientY - r.top) / r.height];
}

// Folosită și de joc, și de editor (comutatorul zi/noapte), ca amândouă să arate la fel
export function aplicaMoment(strat, r, d, ctx) {
  // „filtruSeara”: scena păstrează tenta de seară și după 23:00 (taverna, cât e lume în ea, până la închidere)
  const moment = ctx.moment === 'noaptea' && d.filtruSeara && verifica(d.filtruSeara.conditii, ctx) ? 'seara' : ctx.moment;
  strat.classList.remove('umbrit', 'umbrit-seara');
  strat.classList.toggle('e-noapte', moment === 'noaptea');
  // Seara și noaptea: o tentă de culoare din cod, în afară de scenele care au imagine proprie pentru momentul ăsta
  if (moment === 'seara' || moment === 'noaptea') {
    const tenta = Object.assign(document.createElement('div'), { className: `tenta ${moment}` });
    strat.append(tenta);
    // O variantă e „de moment” dacă e pentru ora asta; se recunoaște după sufix sau după numele exact al imaginii
    const deMoment = (variante) => variante.filter((v) => v.conditii?.moment?.includes(moment));
    const eVariantaMoment = (variante, cale) => variante.some((v) => (v.imagine ? cale === v.imagine : cale.includes(v.sufix)));
    const variante = deMoment(d.variante);
    if (variante.length) {
      r.fundal.addEventListener('incarcat', (e) => {
        if (eVariantaMoment(variante, e.detail)) {
          tenta.remove();
          // Imaginea de noapte e deja întunecată; doar piesele și personajele se întunecă puțin, ca să se potrivească
          // Noaptea personajele se întunecă mult; seara (focul de la campsite) doar puțin și mai cald
          strat.classList.add(moment === 'noaptea' ? 'umbrit' : 'umbrit-seara');
        }
      });
    }
    // O piesă cu imagine proprie pentru momentul ăsta nu se mai întunecă din cod și stă peste tentă
    for (const o of d.obiecte) {
      const varianteO = deMoment(o.variante);
      if (!varianteO.length) continue;
      const el = r.obiecte.get(o.id);
      el.addEventListener('incarcat', (e) => {
        if (!eVariantaMoment(varianteO, e.detail)) return;
        el.classList.add('varianta-moment');
        el.style.zIndex = String(Number(el.style.zIndex) + 4100);
      });
    }
  }
}
