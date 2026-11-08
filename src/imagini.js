// Ce s-a dovedit lipsă nu se mai cere din nou la fiecare randare (evită zeci de 404 la navigare)
const lipsa = new Set();

export function uitaLipsurile() {
  lipsa.clear();
  incarcate.clear();
}

function culoare(text) {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return `hsl(${h} 35% 32%)`;
}

export function urlImagine(cale) {
  return `assets/${cale}`;
}

// Ce s-a încărcat deja o dată (cu raportul lui): la o nouă desenare apare pe loc, fără să clipească
// (de exemplu statuia lui Vale, când inventarul se redesenează la fiecare clic)
const incarcate = new Map();

// Încearcă pe rând fiecare candidat; dacă niciunul nu există, pune un placeholder cu numele fișierului,
// ca lipsa artei să nu blocheze nimic
export function elementImagine(candidati, { clasa = '', raport = 1, fundal = false, eticheta } = {}) {
  const el = document.createElement('div');
  el.className = `imagine ${clasa}`;
  if (!fundal) el.style.aspectRatio = raport;
  const deIncercat = candidati.filter((c) => !lipsa.has(c));

  const placeholder = () => {
    el.classList.add('lipsa');
    el.style.background = culoare(candidati.at(-1));
    const text = document.createElement('span');
    text.textContent = eticheta ?? candidati.at(-1);
    el.replaceChildren(text);
    el.dispatchEvent(new CustomEvent('gata'));
  };

  const incearca = (i) => {
    if (i >= deIncercat.length) return placeholder();
    const img = new Image();
    img.draggable = false;
    img.alt = '';
    img.onload = () => {
      incarcate.set(deIncercat[i], img.naturalWidth / img.naturalHeight);
      if (!fundal) el.style.aspectRatio = img.naturalWidth / img.naturalHeight;
      if (img.parentNode !== el) el.replaceChildren(img);
      // Jocul vrea să știe ce variantă s-a încărcat (de exemplu, dacă scena are deja imagine de noapte)
      el.dispatchEvent(new CustomEvent('incarcat', { detail: deIncercat[i] }));
      el.dispatchEvent(new CustomEvent('gata'));
    };
    img.onerror = () => {
      lipsa.add(deIncercat[i]);
      incearca(i + 1);
    };
    img.src = urlImagine(deIncercat[i]);
    // Deja încărcată: se pune imediat (evenimentul „incarcat” vine tot din onload, după ce jocul îl ascultă)
    // Ce e deja descărcat se desenează pe loc, fără un cadru gol (de exemplu la trecerea în noapte, pe hartă)
    if (incarcate.has(deIncercat[i])) {
      img.decoding = 'sync';
      if (!fundal) el.style.aspectRatio = incarcate.get(deIncercat[i]);
      el.replaceChildren(img);
      el.dataset.gata = '1';
    }
  };
  incearca(0);
  return el;
}

// Descarcă (și decodează) o imagine dinainte; întoarce o promisiune, ca încărcarea de la pornire să poată număra
export function preincarca(cale) {
  if (lipsa.has(cale) || incarcate.has(cale)) return Promise.resolve();
  return new Promise((gata) => {
    const img = new Image();
    img.onload = () => {
      incarcate.set(cale, img.naturalWidth / img.naturalHeight);
      img.decode().catch(() => {}).finally(gata);
    };
    img.onerror = () => {
      lipsa.add(cale);
      gata();
    };
    img.src = urlImagine(cale);
  });
}

// Pune imaginea nouă peste cea veche și o scoate pe cea veche abia când e gata cea nouă (decis de autor:
// între două imagini nu trebuie să se vadă ce e dedesubt). „gata” se cheamă când imaginea nouă se vede
export function schimbaImagine(container, el, gata) {
  const vechi = [...container.children];
  container.append(el);
  let terminat = false;
  const termina = () => {
    if (terminat) return;
    terminat = true;
    for (const v of vechi) v.remove();
    gata?.();
  };
  if (el.dataset.gata || el.classList.contains('lipsa')) return termina();
  el.addEventListener('gata', termina, { once: true });
  // O imagine care nu vine deloc nu ține totul pe loc
  setTimeout(termina, 4000);
}

// Încarcă dinainte toate imaginile date, câte câteva deodată; „progres(facute, total)” arată cât s-a ajuns
export async function incarcaToate(cai, progres, deodata = 6) {
  let facute = 0;
  const coada = [...cai];
  const lucrator = async () => {
    while (coada.length) {
      await preincarca(coada.shift());
      progres?.(++facute, cai.length);
    }
  };
  await Promise.all(Array.from({ length: deodata }, lucrator));
}
