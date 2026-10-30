// Datele intră în bundle prin import.meta.glob, ca jocul să meargă și sub file:// în .exe (fetch nu merge acolo)
const fisiere = import.meta.glob('../data/**/*.json', { eager: true, import: 'default' });

// Aceeași formă o întoarce și serverul (/api/date), ca editorul și jocul să folosească același cod
export function normalizeaza(perechi) {
  const date = { aranjare: {} };
  for (const [cheie, continut] of perechi) {
    if (cheie.startsWith('aranjare/')) date.aranjare[cheie.slice('aranjare/'.length)] = continut;
    else date[cheie] = continut;
  }
  return date;
}

export const dateBundle = normalizeaza(
  Object.entries(fisiere).map(([cale, continut]) => [cale.replace('../data/', '').replace(/\.json$/, ''), continut]),
);
