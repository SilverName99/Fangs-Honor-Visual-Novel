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
    };
    img.onerror = () => {
      lipsa.add(deIncercat[i]);
      incearca(i + 1);
    };
    img.src = urlImagine(deIncercat[i]);
    // Deja încărcată: se pune imediat (evenimentul „incarcat” vine tot din onload, după ce jocul îl ascultă)
    if (incarcate.has(deIncercat[i])) {
      if (!fundal) el.style.aspectRatio = incarcate.get(deIncercat[i]);
      el.replaceChildren(img);
    }
  };
  incearca(0);
  return el;
}

export function preincarca(cale) {
  if (lipsa.has(cale)) return;
  const img = new Image();
  img.onerror = () => lipsa.add(cale);
  img.src = urlImagine(cale);
}
