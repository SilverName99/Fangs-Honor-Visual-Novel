import { urlImagine } from './imagini.js';
import { SLOTURI, NUME_SLOTURI } from './inventar.js';

// Lățimea chenarului de dialog pe scenă; celelalte piese ale dialogului se micșorează cu același factor ca el
const LATIME_DIALOG = 1640;
const marimeDialog = (px) => `calc(${px}px * var(--scala-dialog, 1))`;

// Toate elementele de interfață care pot primi grafică. Până se încarcă imaginea, rămâne stilul CSS implicit.
// tip: „9-slice” (ramă care se întinde), „fundal” (imagine întinsă pe tot elementul), „textura” (se repetă pe orizontală),
// „cursor”, „imagine” (folosită direct, de exemplu figura lui Vale)
export const ELEMENTE_UI = [
  // Piesele dialogului își păstrează proporțiile între ele, cum le-a generat autorul. Toate se micșorează cu același
  // factor, ales ca chenarul să fie lat de 1640 px pe scena de 1920 × 1080 (--scala-dialog); textul îl scrie jocul.
  // Chenarul: doar rama aurie, cu interiorul transparent; umplerea întunecată și străvezie e din cod. E un strat întins
  // până aproape de linia ramei; ca să stea sub ramă dar peste portrete, portretele coboară un strat (-2) și umplerea
  // stă între ele și chenar (-1). Rombul și plăcuța numelui stau pe linia de sus a ramei (--margine-dialog).
  // Marginea nu poate fi cu minus aici (0 = imaginea întreagă)
  { id: 'dialog', nume: 'Chenarul de dialog (rama aurie, interiorul transparent)', marime: 'lat (de exemplu 1640 × 300 px), fundal transparent', tip: '9-slice', margine: 40, faraMinus: true, selector: '.caseta',
    extra: (url, margine, img) => {
      const k = LATIME_DIALOG / img.naturalWidth;
      const m = margine * k;
      return (
        `.dialog{--scala-dialog:${k}}` +
        // Centrat fără transform: un transform ar face din chenar un strat separat, iar umplerea ar ajunge peste ramă
        `.caseta{--margine-dialog:${m}px;left:calc(50% - ${LATIME_DIALOG / 2}px);right:auto;width:${LATIME_DIALOG}px;min-height:${img.naturalHeight * k}px;border-width:${m}px;border-image-width:${m}px}` +
        `.dialog .loc-portret{z-index:-2}.caseta::before{content:'';position:absolute;inset:${6 - m}px;border-radius:16px;background:rgba(18,12,7,0.72);z-index:-1;pointer-events:none}`
      );
    } },
  { id: 'dialog_ornament', nume: 'Rombul auriu de pe marginea de sus a chenarului', marime: 'pe măsura chenarului, fundal transparent', tip: 'fundal', selector: '.ornament-dialog',
    extra: (url, m, img) => `.ornament-dialog{display:block;width:${marimeDialog(img.naturalWidth)};height:${marimeDialog(img.naturalHeight)};top:calc(4px - var(--margine-dialog, 0px))}` },
  { id: 'nume', nume: 'Plăcuța cu numele vorbitorului (panglica albastră)', marime: 'pe măsura chenarului, fundal transparent', tip: '9-slice', margine: 16, faraMinus: true, selector: '.nume-vorbitor',
    extra: (url, m, img) =>
      `.nume-vorbitor{width:${marimeDialog(img.naturalWidth)};height:${marimeDialog(img.naturalHeight)};border-width:${marimeDialog(m)};border-image-width:${marimeDialog(m)};padding:0;box-sizing:border-box;display:flex;align-items:center;justify-content:center;white-space:nowrap}` +
      `.caseta .nume-vorbitor{top:calc(-1 * var(--margine-dialog, 0px) - ${marimeDialog(img.naturalHeight / 2)})}` },
  { id: 'buton', nume: 'Buton', marime: '320 × 80 px', tip: '9-slice', margine: 20, selector: '.buton, .alegere, .lupta-meniu button' },
  { id: 'buton_hover', nume: 'Buton, cu mouse-ul deasupra', marime: '320 × 80 px (la fel ca butonul)', tip: '9-slice', ca: 'buton', selector: '.buton:hover, .alegere:hover, .lupta-meniu button:hover' },
  { id: 'buton_apasat', nume: 'Buton apăsat', marime: '320 × 80 px (la fel ca butonul)', tip: '9-slice', ca: 'buton', selector: '.buton:active, .alegere:active, .lupta-meniu button:active' },
  // Alegerile din dialog au rama lor (după butoane, ca să o înlocuiască pe a lor); hover-ul schimbă doar imaginea
  { id: 'alegere', nume: 'Alegerea din dialog (rândul subțire)', marime: '1400 × 64 px, fundal transparent', tip: '9-slice', margine: 16, faraMinus: true, selector: '.alegere',
    extra: (url, m, img) =>
      `.alegere{width:${marimeDialog(img.naturalWidth)};height:${marimeDialog(img.naturalHeight)};border-width:${marimeDialog(m)};border-image-width:${marimeDialog(m)};padding:0 24px;box-sizing:border-box;display:flex;align-items:center}` },
  // Hover-ul are mărimea lui (imaginea cu strălucire are de obicei spațiu gol în jur): stă centrat peste alegere,
  // micșorat cu același factor ca restul dialogului, în loc să fie strâns în cutia alegerii (ar părea mai mic).
  // E un strat sub text (alegerea devine strat propriu, ca stratul să rămână sub scris, dar peste chenar)
  { id: 'alegere_hover', nume: 'Alegerea din dialog, cu mouse-ul deasupra (cu strălucire)', marime: 'pe măsura alegerii, fundal transparent', tip: 'strat', selector: '.alegere:hover',
    extra: (url, m, img) =>
      `.alegere{position:relative;z-index:0}.alegere:hover{border-image-source:none;background:none;box-shadow:none}` +
      `.alegere:hover::after{content:'';position:absolute;left:50%;top:50%;width:${marimeDialog(img.naturalWidth)};height:${marimeDialog(img.naturalHeight)};` +
      `transform:translate(-50%,-50%);background:url("${url}") center / 100% 100% no-repeat;z-index:-1;pointer-events:none}` },
  { id: 'dialog_sageata', nume: 'Săgeata „continuă” din colțul chenarului de dialog', marime: 'pe măsura chenarului, fundal transparent', tip: 'fundal', selector: '.continua', // Pe jumătate față de restul pieselor (cerut de autor)
    extra: (url, m, img) => `.continua{width:${marimeDialog(img.naturalWidth * 0.5)};height:${marimeDialog(img.naturalHeight * 0.5)};color:transparent}` },
  { id: 'panou', nume: 'Panou (meniu, inventar, HUD, magazin)', marime: '800 × 600 px', tip: '9-slice', margine: 40, selector: '.hud, .panou-meniu, .panou-anunt, .panou-inv, .panou-actiune, .lupta-meniu, .debug' },
  // Interfața de pe ecran (designul autorului). Stau după butoane și panouri, ca să le înlocuiască pe acelea acolo unde sunt amândouă
  // Marginea implicită 0: panoul are o mărime aproape fixă, iar cu ramă tăiată în 9 bucăți apăreau linii fine între ele
  // (scena e scalată să încapă în fereastră și bucățile nu se mai lipesc perfect)
  { id: 'hud_panou', nume: 'Panoul lui Vale (stânga-sus), gol', marime: '900 × 600 px', tip: '9-slice', margine: 0, selector: '.hud' },
  { id: 'hud_nume', nume: 'Plăcuța cu numele lui Vale, goală', marime: '600 × 120 px', tip: '9-slice', margine: 30, selector: '.nume-hud' },
  { id: 'hud_ceas', nume: 'Banda de sus, la mijloc (numele locului), goală', marime: '1200 × 140 px', tip: '9-slice', margine: 60, selector: '.titlu-scena' },
  // Butonul pătrat e o ramă cu margine (0 = imaginea întinsă întreagă). Hover-ul are marginea lui: cu minus, imaginea
  // iese în afara butonului, ca rama din imaginea cu strălucire (care are spațiu gol în jur) să rămână cât cea normală
  { id: 'hud_buton', nume: 'Butonul pătrat din dreapta-sus, gol', marime: '256 × 256 px', tip: '9-slice', margine: 0, selector: '.buton.buton-hud', extra: '.buton.buton-hud,.buton.buton-hud:hover{box-shadow:none;border-radius:0}' },
  { id: 'hud_buton_hover', nume: 'Butonul pătrat, cu mouse-ul deasupra', marime: '256 × 256 px', tip: '9-slice', margine: -10, selector: '.buton.buton-hud:hover' },
  { id: 'hud_placuta', nume: 'Plăcuța de jos (ceasul și „Înapoi”), goală', marime: '700 × 120 px', tip: '9-slice', margine: 40, selector: '.ceas-hud, .buton.placuta-hud' },
  // Meniul: tabla atârnată (cu banda titlului goală) și butoanele de pergament; textul îl scrie jocul
  { id: 'meniu_panou', nume: 'Meniul: tabla de lemn cu lanțuri, lampa, steagul și banda titlului (goală)', marime: '1600 × 1000 px, fundal transparent', tip: 'fundal', selector: '.panou-meniu-nou', extra: '.panou-meniu-nou{border:none;border-radius:0;box-shadow:none}.panou-meniu-nou .titlu-meniu-nou{background:none;border:none}' },
  { id: 'meniu_buton', nume: 'Meniul: butonul de pergament, gol', marime: '700 × 220 px, fundal transparent', tip: 'fundal', selector: '.buton.buton-meniu, .buton.buton-mic-meniu', extra: '.buton.buton-meniu,.buton.buton-meniu:hover,.buton.buton-mic-meniu,.buton.buton-mic-meniu:hover{border:none;border-image:none;border-radius:0;box-shadow:none}' },
  { id: 'meniu_buton_hover', nume: 'Meniul: butonul de pergament, cu mouse-ul deasupra', marime: '700 × 220 px, fundal transparent', tip: 'fundal', selector: '.buton.buton-meniu:hover, .buton.buton-mic-meniu:hover, .buton.buton-mic-meniu.ales' },
  // Iconițele: până se încarcă, rămâne simbolul din text (care se ascunde când apare imaginea)
  ...[
    ['vale', 'Iconița lui Vale (butonul care deschide panoul lui)'],
    ['inventar', 'Iconița Inventar (rucsac)'],
    ['personaje', 'Iconița Personaje (carte)'],
    ['meniu', 'Iconița Meniu'],
    ['ecran', 'Iconița Ecran complet'],
    ['monede', 'Iconița monedelor'],
    ['inapoi', 'Iconița Înapoi (săgeată)'],
    ['continua', 'Meniu: iconița Continuă (ușa)'],
    ['salveaza', 'Meniu: iconița Salvează (pana)'],
    ['incarca', 'Meniu: iconița Încarcă (cufărul)'],
    ['joc_nou', 'Meniu: iconița Joc nou (răsăritul)'],
    ['galerie', 'Meniu: iconița Galerie (tabloul)'],
    ['optiuni', 'Meniu: iconița Opțiuni (rotițele și cheia)'],
  ].map(([id, nume]) => ({ id: `icon_${id}`, nume, marime: '256 × 256 px, fundal transparent', tip: 'fundal', selector: `.icon-hud.icon-${id}`, extra: `.icon-hud.icon-${id}{color:transparent}` })),
  // Inventarul (designul autorului): în galerie, la grupul „Inventarul”
  { id: 'inventar_fundal', grup: 'Inventarul', nume: 'Fundalul ecranului de inventar (cu piedestalul lui Vale)', marime: '1920 × 1080 px', tip: 'fundal', selector: '.ecran-inventar',
    // Imaginea are fundal transparent (decis de autor): ecranul stă peste locația în care ești, întunecată și estompată, ca la meniu
    extra: (url) => `.ecran-inventar{background:url("${url}") center / 100% 100% no-repeat, rgba(0, 0, 0, 0.6)}` },
  { id: 'vale_apoza', grup: 'Inventarul', nume: 'Vale în A-pose (ecranul de echipament)', marime: '700 × 1000 px, fundal transparent', tip: 'imagine' },
  { id: 'inventar_foaie', grup: 'Inventarul', nume: 'Foaia de pergament a inventarului, goală', marime: '900 × 1250 px, fundal transparent', tip: 'fundal', selector: '.foaie-inv', extra: '.foaie-inv{border:none;border-radius:0;box-shadow:none}' },
  { id: 'inventar_semn', grup: 'Inventarul', nume: 'Semnul de carte („Obiecte de poveste”), gol', marime: '240 × 360 px, fundal transparent', tip: 'fundal', selector: '.semn-inv', // Forma de panglică din CSS (tăiată jos) e doar pentru când lipsește imaginea; cu imaginea, nu se mai taie nimic
    extra: '.semn-inv{border:none;border-radius:0;box-shadow:none;clip-path:none}' },
  { id: 'slot_echipament', grup: 'Inventarul', nume: 'Slotul de echipament (rama de lângă Vale)', marime: '256 × 256 px, fundal transparent', tip: 'fundal', selector: '.slot', extra: '.slot,.slot:hover,.slot.selectata{border:none;border-radius:0;box-shadow:none}' },
  { id: 'slot_echipament_hover', grup: 'Inventarul', nume: 'Slotul de echipament, cu mouse-ul deasupra', marime: '256 × 256 px, fundal transparent', tip: 'fundal', selector: '.slot:hover, .slot.selectata' },
  { id: 'slot', grup: 'Inventarul', nume: 'Căsuța din inventar (pe foaie)', marime: '128 × 128 px', tip: 'fundal', selector: '.celula', extra: '.celula,.celula:hover,.celula.selectata,.celula.goala:hover{border:none;border-radius:0;box-shadow:none}' },
  { id: 'slot_hover', grup: 'Inventarul', nume: 'Căsuța din inventar, cu mouse-ul deasupra', marime: '128 × 128 px', tip: 'fundal', selector: '.celula:hover, .celula.selectata' },
  // Simbolul din slotul gol (coiful, pieptarul...); până se încarcă, în slot scrie numele lui
  ...SLOTURI.map((id) => ({ id: `slot_${id}`, grup: 'Inventarul', nume: `Simbolul slotului gol: ${NUME_SLOTURI[id]}`, marime: '256 × 256 px, fundal transparent', tip: 'fundal', selector: `.slot-gol.slot-gol-${id}`, extra: `.slot-gol.slot-gol-${id}{color:transparent}` })),
  { id: 'bara_rama', nume: 'Rama barelor (viață, stamina...)', marime: '300 × 24 px', tip: '9-slice', margine: 8, selector: '.bara-nevoie .cale, .bara-lupta' },
  { id: 'bara_viata', nume: 'Umplerea barei de viață', marime: '64 × 16 px, textură care se repetă', tip: 'textura', selector: '.viata .umplere, .bara-lupta.viata .umplere' },
  { id: 'bara_stamina', nume: 'Umplerea barei de stamina', marime: '64 × 16 px, textură care se repetă', tip: 'textura', selector: '.stamina .umplere, .bara-lupta.stamina .umplere' },
  { id: 'bara_foame', nume: 'Umplerea barei de foame', marime: '64 × 16 px, textură care se repetă', tip: 'textura', selector: '.foame .umplere' },
  { id: 'bara_sete', nume: 'Umplerea barei de sete', marime: '64 × 16 px, textură care se repetă', tip: 'textura', selector: '.sete .umplere' },
  { id: 'cursor', nume: 'Cursorul mouse-ului', marime: '32 × 32 px (maximum 64 × 64); vârful săgeții în colțul stânga-sus', tip: 'cursor' },
  { id: 'cursor_click', nume: 'Cursorul, cât timp apeși', marime: '32 × 32 px (maximum 64 × 64)', tip: 'cursor', apasat: true },
  { id: 'meniu_fundal', nume: 'Fundalul meniului și al ferestrelor', marime: '1920 × 1080 px', tip: 'fundal', selector: '.acoperitor' },
  { id: 'carte', nume: 'Cartea personajelor (cartea deschisă, două pagini goale)', marime: '1600 × 1000 px', tip: 'fundal', selector: '.carte', extra: (url) =>
      // Foaia care se întoarce e chiar hârtia din imagine: fiecare față arată bucata din imagine peste care stă (dreapta: de la 800 px, stânga: de la 40 px)
      `.carte{box-shadow:none;border-radius:0}.carte .pagina{background:none;box-shadow:none}` +
      `.carte .foaie .pagina{background:url("${url}") no-repeat;background-size:1600px 1000px}` +
      `.foaie.spre-stanga .fata-foaie .pagina,.foaie.spre-dreapta .spate-foaie .pagina{background-position:-800px -34px}` +
      `.foaie.spre-stanga .spate-foaie .pagina,.foaie.spre-dreapta .fata-foaie .pagina{background-position:-40px -34px}`,
  },
  // Săgețile cărții: o singură imagine, cu vârful spre dreapta; cea din stânga e aceeași, întoarsă din cod
  // Imaginea își păstrează forma (contain), oricât de lată ar fi generată
  { id: 'sageata', nume: 'Săgeata de răsfoit (cu vârful spre dreapta; cea spre stânga e aceeași, întoarsă)', marime: '256 × 256 px, fundal transparent', tip: 'fundal', selector: '.buton.inapoi-carte, .buton.inainte-carte',
    extra: '.buton.inapoi-carte,.buton.inainte-carte,.buton.inapoi-carte:hover,.buton.inainte-carte:hover,.buton.inapoi-carte:active,.buton.inainte-carte:active{width:150px;height:150px;padding:0;color:transparent;border:none;border-image:none;border-radius:0;box-shadow:none}' +
      '.buton.inapoi-carte,.buton.inainte-carte{background-size:contain}.buton.inapoi-carte{transform:translateY(-50%) scaleX(-1)}.buton.inapoi-carte:hover,.buton.inainte-carte:hover{filter:brightness(1.15) drop-shadow(0 0 10px rgba(255,210,120,.8))}' },
  { id: 'pahar_zaruri', nume: 'Paharul de zaruri (răsturnat, cu gura în jos)', marime: '256 × 256 px, fundal transparent', tip: 'fundal', selector: '.pahar-zar', extra: '.pahar-zar{border:none;border-radius:0;box-shadow:none}' },
  ...[1, 2, 3, 4, 5, 6].map((f) => ({
    id: `zar_${f}`,
    nume: `Zarul cu fața ${f}`,
    marime: '128 × 128 px, fundal transparent',
    tip: 'fundal',
    selector: `.zar[data-f="${f}"]`,
    // Cu imaginea încărcată, punctele desenate din cod nu se mai văd
    extra: `.zar[data-f="${f}"]{border:none;border-radius:0;box-shadow:none}.zar[data-f="${f}"] .punct{display:none}`,
  })),
];

export const fisierUi = (id) => `ui/ui_${id}.png`;

function regula(el, url, margine) {
  switch (el.tip) {
    case '9-slice':
      // Varianta (hover, apăsat) schimbă doar imaginea; rama și marginile rămân ale butonului de bază
      if (el.ca) return `${el.selector}{border-image-source:url("${url}");}`;
      // Margine cu minus: imaginea se întinde întreagă și iese în afara elementului cu atâția pixeli
      // (când imaginea are spațiu gol în jur și rama ar părea prea mică pe lângă text)
      if (margine < 0)
        return `${el.selector}{border-style:solid;border-color:transparent;border-width:0;border-image:url("${url}") 0 fill / 0 / ${-margine}px stretch;background:none;border-radius:0;box-shadow:none;}`;
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
// Barele colorate din panoul lui Vale: cât de groasă e umplerea și cât spațiu lasă față de ramă (din editor)
export const BARE_IMPLICIT = { grosime: 24, sus: 0, lateral: 0 };
export function aplicaBare(bare = {}) {
  const b = { ...BARE_IMPLICIT, ...bare };
  const r = document.documentElement.style;
  r.setProperty('--bara-grosime', `${b.grosime}px`);
  r.setProperty('--bara-sus', `${b.sus}px`);
  r.setProperty('--bara-lateral', `${b.lateral}px`);
}

// Mărimile meniului, reglate de autor în editor (Interfață → Meniul): [cheie, nume, valoare implicită în px, pas]
// Implicit, tabla ține tot ecranul pe înălțime (cerut de autor), cu forma imaginii (1600 × 1000)
export const REGLAJE_MENIU = [
  ['latime', 'Lățimea tablei', 1728, 10],
  ['inaltime', 'Înălțimea tablei', 1080, 10],
  ['sus', 'Unde încep butoanele (de sus)', 305, 5],
  ['jos', 'Spațiu jos', 127, 5],
  ['lateral', 'Spațiu stânga și dreapta', 250, 5],
  ['butonInaltime', 'Înălțimea butoanelor', 165, 5],
  ['butonInterior', 'Spațiul din buton (stânga și dreapta)', 46, 2],
  ['spatiuRanduri', 'Distanța dintre rânduri', 44, 2],
  ['spatiuColoane', 'Distanța dintre coloane', 46, 2],
  ['iconita', 'Mărimea iconițelor', 115, 5],
  ['text', 'Mărimea textului din butoane', 34, 1],
  ['titluSus', 'Poziția titlului (de sus)', 107, 2],
  ['titlu', 'Mărimea titlului', 74, 2],
];
export function aplicaMeniu(meniu = {}) {
  const r = document.documentElement.style;
  for (const [k, , implicit] of REGLAJE_MENIU) r.setProperty(`--meniu-${k}`, `${meniu[k] ?? implicit}px`);
}

export function aplicaGraficaUi(aranjareUi = {}) {
  aplicaBare(aranjareUi.bare);
  aplicaMeniu(aranjareUi.meniu);
  const stil = document.createElement('style');
  document.head.append(stil);
  const reguli = new Map();
  for (const el of ELEMENTE_UI) {
    if (el.tip === 'imagine') continue;
    const img = new Image();
    img.onload = () => {
      const baza = el.ca ? ELEMENTE_UI.find((x) => x.id === el.ca) : el;
      const ales = aranjareUi.margini?.[baza.id] ?? baza.margine ?? 0;
      // Piesele care stau la mărimea imaginii nu ies în afară (o margine cu minus ar mări rama peste mărimea ei)
      const margine = baza.faraMinus ? Math.max(0, ales) : ales;
      // „extra”: ce se mai schimbă când există imaginea (paginile cărții devin transparente, ca să se vadă hârtia din ea)
      reguli.set(el.id, regula(el, img.src, margine) + (typeof el.extra === 'function' ? el.extra(img.src, margine, img) : el.extra || ''));
      // Ordinea contează (hover după bază), deci regulile se scriu în ordinea din listă
      stil.textContent = ELEMENTE_UI.map((x) => reguli.get(x.id) || '').join('\n');
    };
    img.src = urlImagine(fisierUi(el.id));
  }
}
