// Limba jocului (decis de autor): română sau engleză. Limba aleasă în cartea prologului e și limba jocului, ca jucătorul
// să aleagă o singură dată, de la început; se mai schimbă din Meniu → Opțiuni. E o preferință a jucătorului, ca
// volumele, deci stă în browser (aceeași cheie ca prologul), nu în salvare.
//
// Textele din date (data/*.json): traducerea stă chiar lângă textul românesc, în același obiect, cu sufixul „_en”
// („text” + „text_en”, „nume” + „nume_en”). O listă de texte are lista ei („castig” + „castig_en”), element cu
// element; într-o listă amestecată (texte cu condiții și un text la urmă), lista „_en” are traducerea pe locul
// textelor simple și null în rest (obiectele cu condiții au fiecare „text_en”-ul lor). Așa o replică și traducerea
// ei rămân mereu împreună, iar o replică nouă se scrie din prima în ambele limbi.
// Textele din cod (butoane, mesaje): t('Închide'), cu dicționarul român → englez din data/texte_ui.json.
// Ce schimbă autorul în editor (tab-ul „Traduceri”) stă în data/aranjare/texte.json și are întâietate (editorul scrie
// doar în data/aranjare/, ca să nu se încurce cu Claude).
//
// Fișierul nu folosește nimic din browser în afară de localStorage (prins în try), ca să-l poată folosi și editorul,
// și scriptul de verificare (tools/traduceri.mjs), din Node.

const CHEIE = 'joc-prolog-limba';
export const LIMBI = { ro: 'Română', en: 'English' };

// ---------- ce e text de tradus ----------

// Ramurile care nu se traduc: condițiile (doar id-uri și ore), notele pentru autor („_nota”, „_...”), fișierele cu
// alt fel de texte (prologul are româna și engleza lui; sunetele și aranjarea sunt ale editorului)
const RAMURI_FARA_TEXT = new Set(['conditii', 'gata', 'apare', 'ascuns']);
const FISIERE_FARA_TEXT = new Set(['aranjare', 'prolog', 'sunete', 'texte_ui']);
// Câmpuri tehnice, chiar dacă au spații (filtrele CSS) sau litere mari; „ce” = descrierea programului, doar în editor
const CHEI_TEHNICE = new Set([
  'id', 'ce', 'filtru', 'imagine', 'imagini', 'imagineZi', 'sunet', 'sprite', 'poza', 'pozaTata', 'poze', 'fundal', 'loc',
  'locuri', 'din', 'spre', 'urmator', 'nod', 'video', 'dialog', 'dialogTaxa', 'eveniment', 'lupta', 'vorbitor', 'emotie',
  'partener', 'tip', 'slot', 'tipArma', 'sufix', 'harta', 'tinta', 'obiect', 'cale', 'personaj', 'cineRaspunde', 'semneDe',
  'proiectil', 'sageata', 'portret', 'varianta', 'joc', 'miniJoc', 'categorie', 'de', 'pana', 'la', 'marcaj', 'contor',
]);
// Câmpuri care sunt mereu text de citit, chiar și un singur cuvânt mic, fără diacritice („lemne”, „paie”)
const CHEI_TEXT = new Set([
  'text', 'nume', 'titlu', 'descriere', 'sfat', 'numeScurt', 'numePlural', 'grup', 'grupGalerie', 'indemn', 'scurt',
  'mesaj', 'gand', 'bine', 'rau', 'final', 'ritm', 'buton', 'reusite', 'ratari', 'reusit', 'esuat', 'alegere',
  'intrebare', 'intrebareVorba', 'numeVorbitor', 'jurnal', 'numeProiectil', 'motivBlocat',
]);
const ARE_LITERA = /\p{L}/u;
const PARE_ID = /^[a-z0-9_./@:#-]+$/;

// E un text de citit (de tradus)? cheia și valoarea, din obiectul de date
export function eText(cheie, valoare) {
  if (typeof valoare !== 'string' || !ARE_LITERA.test(valoare)) return false;
  if (typeof cheie === 'string' && (cheie.startsWith('_') || cheie.endsWith('_en') || CHEI_TEHNICE.has(cheie))) return false;
  if (CHEI_TEXT.has(cheie)) return true;
  return !PARE_ID.test(valoare) && /[\s\p{Lu}ăâîșțĂÂÎȘȚ]/u.test(valoare);
}

// O bucată din cale: elementele de listă cu „id” se scriu „#id” (calea rămâne aceeași dacă se adaugă o misiune
// înaintea lor), celelalte cu numărul lor
const bucata = (lista, i) => (lista[i] && typeof lista[i] === 'object' && !Array.isArray(lista[i]) && typeof lista[i].id === 'string' ? `#${lista[i].id}` : String(i));

// Toate textele de tradus din date, cu locul lor: { cale, obiect, cheie, ro, en, context }. „obiect”[„cheie”] e
// textul (cheia e un număr pentru un element de listă). „en” vine din perechea „_en” (sau null). „context”: cine
// vorbește / al cui e textul, pentru editor.
export function colecteazaTexte(date) {
  const rez = [];
  // Din efecte se citește doar mesajul de pe ecran („mesaj”), oricât de adânc ar sta (laIntamplare: [{ efecte }])
  const viziteazaEfecte = (o, cale, ctx) => {
    if (Array.isArray(o)) return o.forEach((x, i) => viziteazaEfecte(x, `${cale}/${bucata(o, i)}`, ctx));
    if (!o || typeof o !== 'object') return;
    for (const [k, v] of Object.entries(o)) {
      if (k === 'mesaj' && typeof v === 'string' && eText(k, v)) rez.push({ cale: `${cale}/mesaj`, obiect: o, cheie: 'mesaj', ro: v, en: typeof o.mesaj_en === 'string' ? o.mesaj_en : null, context: ctx });
      else if (v && typeof v === 'object') viziteazaEfecte(v, `${cale}/${k}`, ctx);
    }
  };
  const viziteaza = (o, cale, ctx) => {
    if (Array.isArray(o)) {
      o.forEach((x, i) => x && typeof x === 'object' && viziteaza(x, `${cale}/${bucata(o, i)}`, ctx));
      return;
    }
    if (!o || typeof o !== 'object') return;
    const c = o.vorbitor ? { ...ctx, vorbitor: o.nume || o.vorbitor } : ctx;
    for (const [k, v] of Object.entries(o)) {
      if (k.startsWith('_') || k.endsWith('_en') || RAMURI_FARA_TEXT.has(k)) continue;
      if (k === 'efecte') {
        viziteazaEfecte(v, `${cale}/efecte`, c);
        continue;
      }
      if (typeof v === 'string') {
        if (eText(k, v)) rez.push({ cale: `${cale}/${k}`, obiect: o, cheie: k, ro: v, en: typeof o[`${k}_en`] === 'string' ? o[`${k}_en`] : null, context: c });
      } else if (Array.isArray(v)) {
        if (CHEI_TEHNICE.has(k)) continue;
        const en = Array.isArray(o[`${k}_en`]) ? o[`${k}_en`] : [];
        v.forEach((x, i) => {
          if (typeof x === 'string' && eText(k, x)) rez.push({ cale: `${cale}/${k}/${i}`, obiect: v, cheie: i, ro: x, en: typeof en[i] === 'string' ? en[i] : null, context: c, lista: { parinte: o, cheie: k } });
        });
        viziteaza(v, `${cale}/${k}`, c);
      } else if (v && typeof v === 'object') viziteaza(v, `${cale}/${k}`, c);
    }
  };
  for (const [fisier, continut] of Object.entries(date)) {
    if (FISIERE_FARA_TEXT.has(fisier)) continue;
    viziteaza(continut, fisier, { fisier });
  }
  return rez;
}

// Scoate cheile „_en” din obiecte (după ce perechile au fost adunate), ca restul codului să nu le vadă niciodată
function scoateTraducerile(o) {
  if (Array.isArray(o)) return o.forEach(scoateTraducerile);
  if (!o || typeof o !== 'object') return;
  for (const k of Object.keys(o)) {
    if (k.endsWith('_en') && !k.startsWith('_')) delete o[k];
    else scoateTraducerile(o[k]);
  }
}

// ---------- limba de acum ----------

function citeste() {
  try {
    const l = globalThis.localStorage?.getItem(CHEIE);
    if (LIMBI[l]) return l;
  } catch {
    // fără acces la browser: româna
  }
  return 'ro';
}
let limba = citeste();
let perechi = [];
let dictionar = {};
let suprascrieriUi = {};
// Editorul e mereu în română (e al autorului), chiar dacă în același browser jocul e în engleză
let doarRomana = false;
const ascultatori = new Set();

export const limbaJoc = () => (doarRomana ? 'ro' : limba);

// Pregătește datele o singură dată, la pornire: adună perechile, aplică ce a schimbat autorul în editor, scoate
// cheile „_en” și pune textele în limba de acum. Întoarce perechile (le folosește editorul, cu doarRomana: true).
export function pregatesteDate(date, optiuni = {}) {
  if (optiuni.doarRomana) doarRomana = true;
  const toate = colecteazaTexte(date);
  const suprascrieri = date.aranjare?.texte || {};
  for (const p of toate) {
    p.roBaza = p.ro;
    p.enBaza = p.en;
    const s = suprascrieri[p.cale];
    if (!s) continue;
    // O schimbare a autorului se aplică doar cât textul de bază e cel peste care a scris-o el; dacă între timp
    // replica s-a schimbat în date, editorul o arată ca „de revăzut”, iar jocul păstrează textul nou
    if (s.baza == null || s.baza === p.ro) {
      if (typeof s.ro === 'string' && s.ro.trim()) p.ro = s.ro;
      if (typeof s.en === 'string' && s.en.trim()) p.en = s.en;
      p.suprascris = s;
    } else p.depasit = s;
  }
  perechi = toate.filter((p) => p.en != null || p.ro !== p.obiect[p.cheie]);
  dictionar = date.texte_ui?.texte || {};
  suprascrieriUi = Object.fromEntries(Object.entries(suprascrieri).filter(([k]) => k.startsWith('ui/')).map(([k, v]) => [k.slice(3), v]));
  scoateTraducerile(date);
  aplica();
  return toate;
}

function aplica() {
  const l = limbaJoc();
  for (const p of perechi) p.obiect[p.cheie] = l === 'en' && p.en ? p.en : p.ro;
  try {
    if (globalThis.document) document.documentElement.lang = l;
  } catch {
    // în Node, fără document
  }
}

// Schimbă limba pe loc: datele se rescriu, iar cine ascultă (jocul) își redesenează ecranul
export function seteazaLimba(l) {
  if (!LIMBI[l] || l === limba || doarRomana) return;
  limba = l;
  try {
    globalThis.localStorage?.setItem(CHEIE, l);
  } catch {
    // nu se ține minte, dar merge
  }
  aplica();
  for (const f of ascultatori) f(l);
}
export function laSchimbareaLimbii(f) {
  ascultatori.add(f);
  return () => ascultatori.delete(f);
}

// Un text din cod, în limba de acum. Cheia e textul românesc (așa codul rămâne ușor de citit); „{nume}” se
// înlocuiește cu valorile date. Fără traducere în dicționar, rămâne româna (scriptul de verificare o arată).
export function t(ro, valori) {
  const s = suprascrieriUi[ro];
  let text = limbaJoc() === 'en' ? (s?.en?.trim() ? s.en : dictionar[ro] ?? ro) : s?.ro?.trim() ? s.ro : ro;
  if (valori) text = text.replace(/\{(\w+)\}/g, (m, k) => (valori[k] != null ? String(valori[k]) : m));
  return text;
}
