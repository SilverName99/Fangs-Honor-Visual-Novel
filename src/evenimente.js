import { verifica } from './conditii.js';

function poateReveni(ev, istoric, zi) {
  if (!istoric) return true;
  const r = ev.repetare ?? 'o_data';
  if (r === 'mereu') return true;
  if (r === 'o_data') return false;
  if (r.pauzaZile != null) return zi - istoric.ultimaZi >= r.pauzaZile;
  return false;
}

// Primul eveniment ale cărui condiții sunt îndeplinite acum (ordinea din events.json e prioritatea)
export function alegeEveniment(lista, stare, ctx) {
  return lista.find((ev) => poateReveni(ev, stare.evenimente[ev.id], ctx.zi) && verifica(ev.conditii, ctx)) || null;
}

export function noteazaEveniment(stare, ev, zi) {
  const vechi = stare.evenimente[ev.id];
  stare.evenimente[ev.id] = { deCateOri: (vechi?.deCateOri || 0) + 1, ultimaZi: zi };
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
        alegeri: (ev.alegeri || []).map((a) => ({ ...a, spre: null })),
      },
    },
  };
}
