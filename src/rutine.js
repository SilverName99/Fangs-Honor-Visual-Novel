// Un număr „aleator” care e mereu același pentru aceeași zi și același moment:
// personajul nu apare și dispare când ieși și reintri în scenă
function aleatorFix(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return ((h >>> 0) % 100000) / 100000;
}

// Programul pe ore („de”/„pana”), pentru personajele cu orar exact (de exemplu Miriam).
// Un interval care trece de miezul nopții (23:00 → 05:00) se citește peste zi.
// „zile” limitează intervalul la anumite zile ale săptămânii (de exemplu biserica doar în weekend).
export function intrareProgram(personaj, ctx) {
  if (!personaj?.program) return null;
  const minuteZi = ctx.minuteZi;
  const min = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };
  return personaj.program.find((p) => {
    if (p.zile && !p.zile.includes(ctx.ziSaptamana)) return false;
    const de = min(p.de);
    const pana = min(p.pana);
    return de < pana ? minuteZi >= de && minuteZi < pana : minuteZi >= de || minuteZi < pana;
  }) || null;
}

export function undeEste(personaj, ctx) {
  if (personaj.program) return intrareProgram(personaj, ctx)?.loc ?? null;
  if (!personaj.rutina) return personaj.locuriSprite?.[0] ?? null;
  const r = personaj.rutina[ctx.moment];
  if (!r) return null;
  const cheie = `${personaj.id}|${ctx.zi}|${ctx.moment}`;
  if (r.abatere?.length && aleatorFix(cheie) < (r.sansaAbatere || 0)) {
    return r.abatere[Math.floor(aleatorFix(`${cheie}|unde`) * r.abatere.length)];
  }
  return r.loc;
}
