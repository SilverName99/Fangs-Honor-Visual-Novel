// Viteza animațiilor din luptă și din jocul de zaruri (×1, ×2, ×4): jucătorul care nu vrea să aștepte nu e obligat.
// E o preferință a jucătorului, nu ține de salvare, deci stă separat în localStorage (dacă browserul îl permite).

const CHEIE = 'fangs-vn-viteza';
const VITEZE = [1, 2, 4];

let v = 1;
try {
  v = VITEZE.includes(Number(localStorage.getItem(CHEIE))) ? Number(localStorage.getItem(CHEIE)) : 1;
} catch {
  v = 1;
}
// CSS-ul folosește aceeași viteză pentru animațiile lui (var(--viteza))
document.documentElement.style.setProperty('--viteza', String(v));

export const viteza = () => v;

// O pauză care se scurtează odată cu viteza aleasă
export const asteapta = (ms) => new Promise((r) => setTimeout(r, ms / v));

// Butonul din colțul din dreapta-jos: la fiecare apăsare trece la viteza următoare
export function butonViteza() {
  const b = document.createElement('button');
  b.className = 'buton viteza-joc';
  b.title = 'Viteza animațiilor';
  b.textContent = `×${v}`;
  b.onclick = (e) => {
    e.stopPropagation();
    v = VITEZE[(VITEZE.indexOf(v) + 1) % VITEZE.length];
    document.documentElement.style.setProperty('--viteza', String(v));
    try {
      localStorage.setItem(CHEIE, String(v));
    } catch {
      // fără localStorage, viteza ține doar până se închide jocul
    }
    for (const x of document.querySelectorAll('.viteza-joc')) x.textContent = `×${v}`;
  };
  return b;
}
