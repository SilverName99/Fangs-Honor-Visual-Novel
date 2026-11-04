import { urlImagine } from './imagini.js';

// Toate elementele de interfață care pot primi grafică. Până se încarcă imaginea, rămâne stilul CSS implicit.
// tip: „9-slice” (ramă care se întinde), „fundal” (imagine întinsă pe tot elementul), „textura” (se repetă pe orizontală),
// „cursor”, „imagine” (folosită direct, de exemplu figura lui Vale)
export const ELEMENTE_UI = [
  { id: 'dialog', nume: 'Chenarul de dialog', marime: '1640 × 260 px', tip: '9-slice', margine: 40, selector: '.caseta' },
  { id: 'nume', nume: 'Plăcuța cu numele vorbitorului', marime: '320 × 64 px', tip: '9-slice', margine: 16, selector: '.nume-vorbitor' },
  { id: 'buton', nume: 'Buton', marime: '320 × 80 px', tip: '9-slice', margine: 20, selector: '.buton, .alegere, .lupta-meniu button' },
  { id: 'buton_hover', nume: 'Buton, cu mouse-ul deasupra', marime: '320 × 80 px (la fel ca butonul)', tip: '9-slice', ca: 'buton', selector: '.buton:hover, .alegere:hover, .lupta-meniu button:hover' },
  { id: 'buton_apasat', nume: 'Buton apăsat', marime: '320 × 80 px (la fel ca butonul)', tip: '9-slice', ca: 'buton', selector: '.buton:active, .alegere:active, .lupta-meniu button:active' },
  { id: 'panou', nume: 'Panou (meniu, inventar, HUD, magazin)', marime: '800 × 600 px', tip: '9-slice', margine: 40, selector: '.hud, .panou-meniu, .panou-anunt, .panou-inv, .panou-actiune, .lupta-meniu, .debug' },
  { id: 'slot', nume: 'Slot de inventar / echipament', marime: '128 × 128 px', tip: 'fundal', selector: '.slot, .celula' },
  { id: 'slot_hover', nume: 'Slot, cu mouse-ul deasupra', marime: '128 × 128 px', tip: 'fundal', selector: '.slot:hover, .celula:hover, .celula.selectata' },
  { id: 'bara_rama', nume: 'Rama barelor (viață, stamina...)', marime: '300 × 24 px', tip: '9-slice', margine: 8, selector: '.bara-nevoie .cale, .bara-lupta' },
  { id: 'bara_viata', nume: 'Umplerea barei de viață', marime: '64 × 16 px, textură care se repetă', tip: 'textura', selector: '.viata .umplere, .bara-lupta.viata .umplere' },
  { id: 'bara_stamina', nume: 'Umplerea barei de stamina', marime: '64 × 16 px, textură care se repetă', tip: 'textura', selector: '.stamina .umplere, .bara-lupta.stamina .umplere' },
  { id: 'bara_foame', nume: 'Umplerea barei de foame', marime: '64 × 16 px, textură care se repetă', tip: 'textura', selector: '.foame .umplere' },
  { id: 'bara_sete', nume: 'Umplerea barei de sete', marime: '64 × 16 px, textură care se repetă', tip: 'textura', selector: '.sete .umplere' },
  { id: 'cursor', nume: 'Cursorul mouse-ului', marime: '32 × 32 px (maximum 64 × 64); vârful săgeții în colțul stânga-sus', tip: 'cursor' },
  { id: 'cursor_click', nume: 'Cursorul, cât timp apeși', marime: '32 × 32 px (maximum 64 × 64)', tip: 'cursor', apasat: true },
  { id: 'vale_apoza', nume: 'Vale în A-pose (ecranul de echipament)', marime: '700 × 1000 px, fundal transparent', tip: 'imagine' },
  { id: 'meniu_fundal', nume: 'Fundalul meniului și al ferestrelor', marime: '1920 × 1080 px', tip: 'fundal', selector: '.acoperitor' },
  { id: 'carte', nume: 'Cartea personajelor (cartea deschisă, două pagini goale)', marime: '1600 × 1000 px', tip: 'fundal', selector: '.carte', extra: '.carte{box-shadow:none;border-radius:0}.carte .pagina{background:none;box-shadow:none}.carte .foaie .pagina{background:linear-gradient(90deg,#e9dcc0,#f3e9d2)}' },
  { id: 'inventar_fundal', nume: 'Fundalul ecranului de inventar', marime: '1920 × 1080 px', tip: 'fundal', selector: '.ecran-inventar' },
];

export const fisierUi = (id) => `ui/ui_${id}.png`;

function regula(el, url, margine) {
  switch (el.tip) {
    case '9-slice':
      // Varianta (hover, apăsat) schimbă doar imaginea; rama și marginile rămân ale butonului de bază
      if (el.ca) return `${el.selector}{border-image-source:url("${url}");}`;
      return `${el.selector}{border-style:solid;border-color:transparent;border-width:${margine}px;border-image:url("${url}") ${margine} fill / ${margine}px stretch;background:none;border-radius:0;box-shadow:none;}`;
    case 'fundal':
      return `${el.selector}{background:url("${url}") center / 100% 100% no-repeat;border-color:transparent;}`;
    case 'textura':
      return `${el.selector}{background-image:url("${url}");background-repeat:repeat-x;background-size:auto 100%;}`;
    case 'cursor':
      return el.apasat ? `body:active, body *:active{cursor:url("${url}") 0 0, auto;}` : `body, body *{cursor:url("${url}") 0 0, auto;}`;
    default:
      return '';
  }
}

// Încarcă grafica existentă și o aplică peste stilul implicit; ce lipsește rămâne cum e
export function aplicaGraficaUi(aranjareUi = {}) {
  const stil = document.createElement('style');
  document.head.append(stil);
  const reguli = new Map();
  for (const el of ELEMENTE_UI) {
    if (el.tip === 'imagine') continue;
    const img = new Image();
    img.onload = () => {
      const baza = el.ca ? ELEMENTE_UI.find((x) => x.id === el.ca) : el;
      const margine = aranjareUi.margini?.[baza.id] ?? baza.margine ?? 0;
      // „extra”: ce se mai schimbă când există imaginea (paginile cărții devin transparente, ca să se vadă hârtia din ea)
      reguli.set(el.id, regula(el, img.src, margine) + (el.extra || ''));
      // Ordinea contează (hover după bază), deci regulile se scriu în ordinea din listă
      stil.textContent = ELEMENTE_UI.map((x) => reguli.get(x.id) || '').join('\n');
    };
    img.src = urlImagine(fisierUi(el.id));
  }
}
