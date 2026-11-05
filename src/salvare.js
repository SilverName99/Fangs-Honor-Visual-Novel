import { VERSIUNE_SALVARE } from './stare.js';

// Fiecare migrare duce o salvare de la versiunea n la n+1, ca un joc început mai demult să meargă mai departe
const migrari = {
  // v0.2: lista simplă „obiecte” devine inventar cu stive; apar echipamentul, cufărul, taxa și grupul
  1: (s) => {
    const inventar = [];
    for (const id of s.obiecte || []) {
      const stiva = inventar.find((x) => x.id === id);
      if (stiva) stiva.n++;
      else inventar.push({ id, n: 1 });
    }
    const { obiecte, ...rest } = s;
    return {
      ...rest,
      inventar,
      echipat: {},
      cufar: [],
      poveste: [],
      taxa: { zi: 7, platita: false, ratari: 0, colectorZi: 0 },
      grup: ['vale'],
      formatie: { vale: { linie: 1, rand: 'fata' } },
      versiuneSalvare: 2,
    };
  },
  // Sloturile noi de armură (coif, armură, jambiere); mănușile și bocancii nu mai există în demo,
  // iar pantalonii de pânză au devenit jambierele de piele
  2: (s) => {
    const redenumit = { pantaloni_panza: 'jambiere_piele' };
    const scos = new Set(['manusi_piele', 'bocanci']);
    const lista = (l = []) => l.filter((x) => !scos.has(x.id)).map((x) => ({ ...x, id: redenumit[x.id] || x.id }));
    const e = s.echipat || {};
    const echipat = {};
    for (const [slot, id] of Object.entries(e)) {
      if (!id || scos.has(id)) continue;
      const nou = { haina: 'armura', pantaloni: 'jambiere' }[slot] || slot;
      if (['manusi', 'bocanci'].includes(nou)) continue;
      echipat[nou] = redenumit[id] || id;
    }
    return {
      ...s,
      inventar: lista(s.inventar),
      cufar: lista(s.cufar),
      echipat,
      confiscate: (s.confiscate || []).filter((id) => !scos.has(id)).map((id) => redenumit[id] || id),
      versiuneSalvare: 3,
    };
  },
};

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
