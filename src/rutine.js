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

// Condițiile care depind de unde e un personaj, înregistrate dintr-un singur loc,
// ca jocul și editorul să aleagă la fel variantele (de exemplu nicovala fierarului)
export function registreazaConditiiPersonaje(personaje, registreaza) {
  const gaseste = (id) => personaje.find((p) => p.id === id);
  // „nuDoarme: miriam” = personajul nu doarme acum, după programul lui (camera mamei e încuiată cât doarme)
  registreaza('nuDoarme', (id, c) => !intrareProgram(gaseste(id), c)?.doarme);
  // „personajIn: { fierar: [locuri] }” = personajul e acum într-unul din locuri și nu doarme
  registreaza('personajIn', (v, c) =>
    Object.entries(v).every(([id, locuri]) => {
      const p = gaseste(id);
      return locuri.includes(undeEste(p, c)) && !intrareProgram(p, c)?.doarme;
    }),
  );
  // „personajLa: { vanatoare: [locuri] }” = personajul e acum într-unul din locuri, treaz sau adormit
  // (glaive-ul Kaiei stă la campsite cât e și ea acolo)
  registreaza('personajLa', (v, c) => Object.entries(v).every(([id, locuri]) => locuri.includes(undeEste(gaseste(id), c))));
  // „prezent: miriam” = personajul e, după programul lui, chiar în locul ăsta acum (de exemplu evenimentul cu supa)
  registreaza('prezent', (id, c) => undeEste(gaseste(id), c) === c.loc);
}
