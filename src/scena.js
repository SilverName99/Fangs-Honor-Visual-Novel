import { elementImagine } from './imagini.js';
import { candidati } from './lume.js';
import { verifica } from './conditii.js';

export const LATIME = 1920;
export const INALTIME = 1080;

// Scena e mereu 1920×1080 și doar se scalează; toate pozițiile din date rămân valabile la orice ecran.
// Editorul poate adăuga zoom și deplasare (vedere), jocul rămâne mereu „potrivit în fereastră”.
// Conturul automat al personajelor fără zonă desenată: aceeași bandă aurie estompată ca la zonele desenate
// (linie de ~7px pe margine, blur 5), dar construită din forma sprite-ului. Trei intensități: zi, noapte, mouse deasupra (60%, ca la zone).
function adaugaFiltreContur() {
  if (document.getElementById('contur-sprite-zi')) return;
  const filtru = (id, opacitate) =>
    `<filter id="${id}" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">` +
    '<feMorphology in="SourceAlpha" operator="dilate" radius="3.5" result="d"/>' +
    '<feMorphology in="SourceAlpha" operator="erode" radius="3.5" result="e"/>' +
    '<feComposite in="d" in2="e" operator="out" result="inel"/>' +
    `<feFlood flood-color="rgb(255,225,150)" flood-opacity="${opacitate}"/>` +
    '<feComposite in2="inel" operator="in" result="inelColorat"/>' +
    '<feGaussianBlur in="inelColorat" stdDeviation="5" result="b"/>' +
    '<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="b"/><feMergeNode in="b"/></feMerge></filter>';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  svg.innerHTML = `<defs>${filtru('contur-sprite-zi', 0.95 * 0.3)}${filtru('contur-sprite-noapte', 0.95 * 0.2)}${filtru('contur-sprite-plin', 0.95 * 0.6)}</defs>`;
  document.body.append(svg);
}

export function creeazaEcran(parinte) {
  adaugaFiltreContur();
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
      raport: o.tip === 'sprite' ? 0.45 : 1.2,
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
  const poligoane = new Map();
  for (const t of descriere.tinte) {
    const sufix = t.personaj ? sufixVarianta(descriere, t.personaj, context) : '';
    const poligon = (sufix && aranjare?.zone?.[t.id + sufix]) || aranjare?.zone?.[t.id];
    if (!poligon || poligon.length < 3) continue;
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    p.setAttribute('points', puncteSvg(poligon));
    p.setAttribute('class', 'zona-clic');
    p.setAttribute('filter', 'url(#contur-moale)');
    svg.append(p);
    poligoane.set(t.id, p);
  }
  strat.append(svg);
  return { fundal, obiecte, poligoane, svg };
}

// Coordonate 0-1 față de scenă, indiferent de cât e scalată pe ecran
export function punctNormalizat(scena, ev) {
  const r = scena.getBoundingClientRect();
  return [(ev.clientX - r.left) / r.width, (ev.clientY - r.top) / r.height];
}

// Folosită și de joc, și de editor (comutatorul zi/noapte), ca amândouă să arate la fel
export function aplicaMoment(strat, r, d, ctx) {
  strat.classList.remove('umbrit');
  strat.classList.toggle('e-noapte', ctx.moment === 'noaptea');
  // Seara și noaptea: o tentă de culoare din cod, în afară de scenele care au imagine proprie pentru momentul ăsta
  if (ctx.moment === 'seara' || ctx.moment === 'noaptea') {
    const tenta = Object.assign(document.createElement('div'), { className: `tenta ${ctx.moment}` });
    strat.append(tenta);
    // O variantă e „de moment” dacă e pentru ora asta; se recunoaște după sufix sau după numele exact al imaginii
    const deMoment = (variante) => variante.filter((v) => v.conditii?.moment?.includes(ctx.moment));
    const eVariantaMoment = (variante, cale) => variante.some((v) => (v.imagine ? cale === v.imagine : cale.includes(v.sufix)));
    const variante = deMoment(d.variante);
    if (variante.length) {
      r.fundal.addEventListener('incarcat', (e) => {
        if (eVariantaMoment(variante, e.detail)) {
          tenta.remove();
          // Imaginea de noapte e deja întunecată; doar piesele și personajele se întunecă puțin, ca să se potrivească
          strat.classList.add('umbrit');
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
