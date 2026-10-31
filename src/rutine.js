// Un număr „aleator” care e mereu același pentru aceeași zi și același moment:
// personajul nu apare și dispare când ieși și reintri în scenă
function aleatorFix(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return ((h >>> 0) % 100000) / 100000;
}

export function undeEste(personaj, ctx) {
  if (!personaj.rutina) return personaj.locuriSprite?.[0] ?? null;
  const r = personaj.rutina[ctx.moment];
  if (!r) return null;
  const cheie = `${personaj.id}|${ctx.zi}|${ctx.moment}`;
  if (r.abatere?.length && aleatorFix(cheie) < (r.sansaAbatere || 0)) {
    return r.abatere[Math.floor(aleatorFix(`${cheie}|unde`) * r.abatere.length)];
  }
  return r.loc;
}
