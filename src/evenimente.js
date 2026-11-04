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

// Ce s-a întâmplat ultima dată într-o categorie: ziua și câte zile la rând au avut un eveniment
// (salvările mai vechi țineau doar ziua)
function istoricCategorie(stare, cat) {
  const v = stare.categorii?.[cat];
  return typeof v === 'number' ? { ultimaZi: v, sir: 1 } : v || null;
}

// Șansa ca azi să se întâmple ceva din categorie (orcii care fac scandal). Nu există pauză obligatorie:
// după o zi cu eveniment șansa scade, după două zile la rând scade și mai mult, iar fiecare zi liniștită o
// ridică la loc, până la un maxim (config.json, „categoriiEvenimente”)
export function sansaCategorie(c, istoric, zi) {
  if (!istoric) return c.sansaZi ?? 1;
  const linistite = Math.max(0, zi - istoric.ultimaZi - 1);
  const dupa = (c.sansaZi ?? 1) * (c.scadereDupa ?? 1) ** istoric.sir;
  return Math.min(c.sansaMax ?? 1, dupa + (c.crestereZiLinistita ?? 0) * linistite);
}

// Cel mult un eveniment pe zi din categorie; zarul zilei e fix, ca intrând și ieșind să nu-l arunci din nou
export function categoriePermite(ev, stare, zi, categorii = {}) {
  const c = ev.categorie && categorii[ev.categorie];
  if (!c) return true;
  const ist = istoricCategorie(stare, ev.categorie);
  if (ist?.ultimaZi === zi) return false;
  return aleatorFix(`${ev.categorie}|${zi}`) < sansaCategorie(c, ist, zi);
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
  if (ev.categorie) {
    const ist = istoricCategorie(stare, ev.categorie);
    const sir = ist && zi - ist.ultimaZi === 1 ? ist.sir + 1 : 1;
    (stare.categorii ||= {})[ev.categorie] = { ultimaZi: zi, sir };
  }
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
