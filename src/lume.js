import { verifica } from './conditii.js';

// Transformă arborele din locations.json într-o listă plată de scene, cu care lucrează și jocul, și editorul
export function construiesteLumea(date) {
  const scene = new Map();
  const { harta, zone } = date.locations;
  const personaje = date.npcs.personaje;

  scene.set('harta', {
    id: 'harta',
    tip: 'harta',
    titlu: harta.nume,
    imagine: harta.imagine,
    variante: harta.variante || [],
    parinte: null,
    tinte: zone.map((z) => ({ id: z.id, nume: z.nume, spre: z.id })),
    obiecte: zone.flatMap((z) =>
      (z.piese || []).map((p) => ({ id: p.id, tip: 'piesa', nume: z.nume, imagine: p.imagine, variante: p.variante || [], tinta: z.id })),
    ),
  });

  for (const z of zone) {
    scene.set(z.id, {
      id: z.id,
      tip: 'zona',
      titlu: z.nume,
      imagine: z.imagine,
      variante: z.variante || [],
      parinte: 'harta',
      tinte: z.locuri.map((l) => ({
        id: l.id,
        nume: l.nume,
        spre: l.actiune ? null : `${z.id}.${l.id}`,
        actiune: l.actiune || null,
        incuiat: l.incuiat || null,
        ascuns: l.ascuns || null,
      })),
      obiecte: [],
    });

    for (const l of z.locuri) {
      if (l.actiune) continue;
      const cheieLoc = `${z.id}/${l.id}`;
      scene.set(`${z.id}.${l.id}`, {
        id: `${z.id}.${l.id}`,
        tip: 'loc',
        titlu: l.nume,
        imagine: l.imagine,
        variante: l.variante || [],
        parinte: z.id,
        tinte: [],
        obiecte: personaje
          .filter((p) => (p.locuriSprite || []).includes(cheieLoc))
          .map((p) => ({ id: p.id, tip: 'sprite', nume: p.nume, imagine: `sprites/${p.id}_${z.id}_${l.id}.png`, variante: [], tinta: null })),
      });
    }
  }
  return scene;
}

// Lista de imagini încearcă întâi combinația de variante, apoi câte una, apoi imaginea de bază,
// ca să nu fie nevoie de o imagine pentru fiecare combinație (de exemplu reparată + noapte)
export function candidati(imagine, variante, context) {
  const potrivite = (variante || []).filter((v) => verifica(v.conditii, context)).map((v) => v.sufix);
  const baza = imagine.replace(/\.png$/, '');
  const lista = [];
  if (potrivite.length > 1) lista.push(`${baza}${potrivite.join('')}.png`);
  for (const s of potrivite) lista.push(`${baza}${s}.png`);
  lista.push(imagine);
  return lista;
}

export function categorie(cale) {
  return cale.includes('/') ? cale.slice(0, cale.lastIndexOf('/')) : '';
}

// Tot ce cere jocul, pentru lista „lipsă” din galerie. Variantele și stările în plus sunt opționale (au rezervă)
export function imaginiCerute(date, scene) {
  const rezultat = new Map();
  const adauga = (cale, scop, optional = false) => {
    if (!rezultat.has(cale)) rezultat.set(cale, { cale, categorie: categorie(cale), scop, optional });
  };
  const cuVariante = (imagine, variante, scop) => {
    adauga(imagine, scop);
    for (const v of variante || []) adauga(imagine.replace(/\.png$/, `${v.sufix}.png`), `${scop} (varianta ${v.sufix.slice(1)})`, true);
  };

  for (const s of scene.values()) {
    const tipScena = { harta: 'Harta', zona: 'Zona', loc: 'Loc' }[s.tip];
    cuVariante(s.imagine, s.variante, `${tipScena}: ${s.titlu}`);
    for (const o of s.obiecte) {
      cuVariante(o.imagine, o.variante, o.tip === 'piesa' ? `Piesă pe hartă: ${o.id}` : `Sprite: ${o.nume} în ${s.titlu}`);
    }
  }
  for (const p of date.npcs.personaje) {
    for (const st of date.npcs.stariPortret) {
      adauga(`portraits/${p.id}_${st}.png`, `Portret: ${p.nume} (${st})`, st !== 'normal');
    }
  }
  for (const ui of date.config.uiImagini || []) adauga(ui, 'Interfață', true);
  return [...rezultat.values()];
}
