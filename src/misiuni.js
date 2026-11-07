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
