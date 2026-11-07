import { verifica } from './conditii.js';
import { context } from './stare.js';
import { aplicaEfecte } from './efecte.js';

// Misiunile (data/misiuni.json): pașii se bifează singuri, în ordine, când sunt îndeplinite.
// Pasul la care a ajuns fiecare misiune stă în salvare (pasiMisiuni), ca un pas făcut să rămână făcut
// (lemnul folosit la reparație nu „desface” pasul cu adunatul lemnului)

export const cateAre = (stare, id) => (stare.inventar || []).filter((x) => x.id === id).reduce((s, x) => s + x.n, 0);

export function pasGata(p, stare) {
  if (p.numara && cateAre(stare, p.numara.obiect) < p.numara.n) return false;
  return verifica(p.gata, context(stare));
}

export const listaMisiuni = (date) => date.misiuni?.misiuni || [];
export const pasul = (stare, id) => stare.pasiMisiuni?.[id] ?? 0;

// Se cheamă după fiecare schimbare (la redesenarea HUD-ului); întoarce misiunile terminate acum
export function actualizeazaMisiuni(joc) {
  const s = joc.stare;
  s.pasiMisiuni ||= {};
  for (const m of listaMisiuni(joc.date)) {
    if (s.misiuni[m.id] !== 'inceputa') continue;
    let i = pasul(s, m.id);
    while (i < m.pasi.length && pasGata(m.pasi[i], s)) i++;
    if (i === pasul(s, m.id)) continue;
    s.pasiMisiuni[m.id] = i;
    if (i < m.pasi.length) continue;
    s.misiuni[m.id] = 'terminata';
    aplicaEfecte(m.recompensa?.efecte, joc);
    joc.mesaj(`Misiune terminată: ${m.titlu}`);
  }
}

// Un nod fix sau o listă { nod, conditii } din care se ia primul îndeplinit (același format ca „start” la dialoguri)
function alegeNod(spec, ctx) {
  if (typeof spec === 'string') return spec;
  return [].concat(spec || []).find((x) => verifica(x.conditii, ctx))?.nod ?? null;
}

// Misiunile din meniul de discuție al unui personaj (decis de autor): ! = nouă, ? gri = în lucru (dă indicația
// pasului de acum), ? auriu = gata de predat. Un personaj poate avea mai multe deodată, iar pasul unei misiuni
// poate fi la alt personaj decât cel care a dat-o („la” la pas). Nodurile vin din dialogul misiunii („dialog”,
// implicit dialogul celui care o dă), ca să poată fi folosite și din dialogul altcuiva
export function optiuniMisiuni(joc, idPersonaj) {
  const s = joc.stare;
  const ctx = context(s);
  const rez = [];
  for (const m of listaMisiuni(joc.date)) {
    const st = s.misiuni[m.id];
    const dialog = m.dialog || joc.date.npcs.personaje.find((p) => p.id === m.dela)?.dialog || m.dela;
    if (!st && m.oferta && (m.oferta.la || m.dela) === idPersonaj && verifica(m.oferta.conditii, ctx)) {
      rez.push({ alegere: { text: m.oferta.text, spre: alegeNod(m.oferta.nod, ctx), semn: 'nou' }, dialog });
      continue;
    }
    if (st !== 'inceputa') continue;
    const p = m.pasi[pasul(s, m.id)];
    if (!p || (p.la || m.dela) !== idPersonaj) continue;
    const gata = p.predare && verifica(p.predare.conditii, ctx);
    if (gata) rez.push({ alegere: { text: p.predare.text, spre: alegeNod(p.predare.nod, ctx), semn: 'gata' }, dialog });
    else if (p.indiciu) rez.push({ alegere: { text: p.indiciu.text, spre: alegeNod(p.indiciu.nod, ctx), semn: 'lucru' }, dialog });
  }
  return rez;
}
