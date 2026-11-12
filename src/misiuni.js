import { verifica } from './conditii.js';
import { context } from './stare.js';
import { aplicaEfecte } from './efecte.js';

// Misiunile (data/misiuni.json): pașii se bifează singuri, în ordine, când sunt îndeplinite.
// Pasul la care a ajuns fiecare misiune stă în salvare (pasiMisiuni), ca un pas făcut să rămână făcut
// (lemnul folosit la reparație nu „desface” pasul cu adunatul lemnului)

// Și obiectele de poveste care se numără (orzul pentru bere) intră la socoteală
export const cateAre = (stare, id) => (stare.inventar || []).filter((x) => x.id === id).reduce((s, x) => s + x.n, 0) + (stare.povesteNumar?.[id] || 0);

// „numara” la un pas: un obiect ({ obiect, n }), o listă de obiecte (materialele manechinului lui Roderick) sau o
// numărătoare din salvare ({ contor, n }: zilele de antrenament); pentru fiecare, cât are Vale acum
export const numaratori = (p, stare) =>
  [].concat(p.numara || []).map((x) => ({ ...x, are: x.contor ? stare.contoare?.[x.contor] || 0 : cateAre(stare, x.obiect) }));

export function pasGata(p, stare) {
  if (numaratori(p, stare).some((x) => x.are < x.n)) return false;
  return verifica(p.gata, context(stare));
}

export const listaMisiuni = (date) => date.misiuni?.misiuni || [];
export const pasul = (stare, id) => stare.pasiMisiuni?.[id] ?? 0;

// Se cheamă după fiecare schimbare (la redesenarea HUD-ului); întoarce misiunile terminate acum
// Întoarce misiunile terminate acum (ca jocul să arate ce a primit Vale pentru ele)
export function actualizeazaMisiuni(joc) {
  const s = joc.stare;
  s.pasiMisiuni ||= {};
  const terminate = [];
  for (const m of listaMisiuni(joc.date)) {
    if (s.misiuni[m.id] !== 'inceputa') continue;
    let i = pasul(s, m.id);
    while (i < m.pasi.length && pasGata(m.pasi[i], s)) i++;
    if (i === pasul(s, m.id)) continue;
    s.pasiMisiuni[m.id] = i;
    if (i < m.pasi.length) continue;
    s.misiuni[m.id] = 'terminata';
    // Ziua în care s-a terminat: misiunea următoare a aceluiași personaj vine abia după o zi (decis de autor)
    (s.terminateLa ||= {})[m.id] = Math.floor(s.minute / 1440) + 1;
    aplicaEfecte(m.recompensa?.efecte, joc);
    joc.mesaj(`Misiune terminată: ${m.titlu}`);
    terminate.push(m.id);
  }
  return terminate;
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
// „loc”: unde e personajul, când semnul lui se pune de departe (pe ușa din zonă sau pe clădirea de pe hartă);
// condițiile de loc ale ofertei se verifică acolo unde e el, nu unde e Vale (Elian în biserică: „!” doar afară, pe scări)
export function optiuniMisiuni(joc, idPersonaj, loc) {
  const s = joc.stare;
  const ctx = loc ? { ...context(s), loc } : context(s);
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

// Semnul cel mai important al unui personaj, pentru scenă și hartă: ? auriu (de predat), ! (nouă), ? gri (în lucru)
export function semnPersonaj(joc, idPersonaj, loc) {
  const semne = optiuniMisiuni(joc, idPersonaj, loc).map((x) => x.alegere.semn);
  // O misiune care pornește singură, dintr-un eveniment („ofertaEveniment”: cărțile lui Elian), are și ea „!” cât
  // evenimentul ar porni la sosire (decis de autor: ca jucătorul să nu fie luat prin surprindere); nu e și în meniu
  const s = joc.stare;
  const ctx = loc ? { ...context(s), loc } : context(s);
  for (const m of listaMisiuni(joc.date)) {
    if (!m.ofertaEveniment || m.dela !== idPersonaj || s.misiuni[m.id]) continue;
    const ev = (joc.date.events?.evenimente || []).find((e) => e.id === m.ofertaEveniment);
    if (ev && s.evenimente?.[ev.id] == null && verifica(ev.conditii, ctx)) semne.push('nou');
  }
  return ['gata', 'nou', 'lucru'].find((s) => semne.includes(s)) || null;
}
