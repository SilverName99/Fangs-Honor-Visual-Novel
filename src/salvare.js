import { VERSIUNE_SALVARE } from './stare.js';

// Fiecare migrare duce o salvare de la versiunea n la n+1. Exemplu, când va fi nevoie:
//   1: (s) => ({ ...s, inventar: { sloturi: [] }, versiuneSalvare: 2 }),
const migrari = {};

export function cheieSalvare(test) {
  // Testarea din editor are salvarea ei, ca să nu strice jocul obișnuit
  return test ? 'fangs-vn-salvare-test' : 'fangs-vn-salvare';
}

export function pregateste(s) {
  if (!s || typeof s !== 'object' || typeof s.versiuneSalvare !== 'number') throw new Error('Fișierul nu e o salvare a acestui joc.');
  if (s.versiuneSalvare > VERSIUNE_SALVARE) throw new Error('Salvarea e dintr-o versiune mai nouă a jocului.');
  let x = s;
  while (x.versiuneSalvare < VERSIUNE_SALVARE) {
    const m = migrari[x.versiuneSalvare];
    if (!m) throw new Error(`Salvarea e dintr-o versiune veche (${x.versiuneSalvare}) care nu mai poate fi încărcată.`);
    x = m(x);
  }
  return x;
}

export function citeste(cheie) {
  try {
    const text = localStorage.getItem(cheie);
    return text ? pregateste(JSON.parse(text)) : null;
  } catch (e) {
    console.warn('Salvarea nu s-a putut citi:', e.message);
    return null;
  }
}

export function scrie(cheie, stare) {
  try {
    localStorage.setItem(cheie, JSON.stringify(stare));
  } catch (e) {
    console.warn('Salvarea nu s-a putut scrie:', e.message);
  }
}

export function exporta(stare, nume) {
  const blob = new Blob([JSON.stringify(stare, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nume;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function importa() {
  return new Promise((rezolva, respinge) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = async () => {
      try {
        rezolva(pregateste(JSON.parse(await input.files[0].text())));
      } catch (e) {
        respinge(e instanceof SyntaxError ? new Error('Fișierul nu e o salvare validă.') : e);
      }
    };
    input.click();
  });
}
