import { verifica } from './conditii.js';

export function poateReveni(ev, istoric, zi) {
  if (!istoric) return true;
  const r = ev.repetare ?? 'o_data';
  if (r === 'mereu') return true;
  if (r === 'o_data') return false;
  if (r.pauzaZile != null) return zi - istoric.ultimaZi >= r.pauzaZile;
  return false;
}

// Un număr „aleator” fix pentru aceeași zi și aceeași categorie: o zi e „liniștită” sau nu, oricât ai intra și ieși
function aleatorFix(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return ((h >>> 0) % 100000) / 100000;
}

// Evenimentele dintr-o categorie (orcii care fac scandal) nu vin unul după altul: cel mult unul pe zi,
// o pauză de câteva zile după el și, în unele zile, deloc (config.json, „categoriiEvenimente”)
export function categoriePermite(ev, stare, zi, categorii = {}) {
  const c = ev.categorie && categorii[ev.categorie];
  if (!c) return true;
  const ultima = stare.categorii?.[ev.categorie];
  if (ultima != null && zi - ultima < Math.max(1, c.pauzaZile ?? 1)) return false;
  return aleatorFix(`${ev.categorie}|${zi}`) < (c.sansaZi ?? 1);
}

// Primul eveniment ale cărui condiții sunt îndeplinite acum (ordinea din events.json e prioritatea)
export function alegeEveniment(lista, stare, ctx, categorii) {
  return (
    lista.find(
      (ev) => !ev.manual && poateReveni(ev, stare.evenimente[ev.id], ctx.zi) && categoriePermite(ev, stare, ctx.zi, categorii) && verifica(ev.conditii, ctx),
    ) || null
  );
}

export function noteazaEveniment(stare, ev, zi) {
  const vechi = stare.evenimente[ev.id];
  stare.evenimente[ev.id] = { deCateOri: (vechi?.deCateOri || 0) + 1, ultimaZi: zi };
  if (ev.categorie) (stare.categorii ||= {})[ev.categorie] = zi;
}

// Un eveniment se arată cu aceeași interfață ca dialogul: un singur nod, cu alegeri care închid dialogul
export function caDialog(ev) {
  return {
    partener: ev.vorbitor,
    numePartener: ev.numeVorbitor,
    start: 'e',
    noduri: {
      e: {
        vorbitor: ev.vorbitor,
        emotie: ev.emotie,
        text: ev.text,
        efecte: ev.efecte,
        alegeri: (ev.alegeri || []).map((a) => ({ ...a, spre: null })),
      },
    },
  };
}
