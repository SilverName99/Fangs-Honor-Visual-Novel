import { verifica } from './conditii.js';
import { ELEMENTE_UI, fisierUi } from './uiGrafica.js';
import { SLOTURI, NUME_SLOTURI } from './inventar.js';

// Transformă arborele din locations.json într-o listă plată de scene, cu care lucrează și jocul, și editorul
// Un interval din programul unui personaj poate cere alt sprite în același loc (Miriam la cină):
// devine o variantă a sprite-ului, activă doar în orele acelea
function varianteDinProgram(p, cheie, fisier) {
  const minusUnMinut = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    const t = (h * 60 + m + 1439) % 1440;
    return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
  };
  return (p.program || [])
    .filter((x) => x.sprite && x.loc === cheie)
    .map((x) => ({
      imagine: `sprites/${p.id}_${fisier}_${x.sprite}.png`,
      nume: x.sprite,
      // Un interval peste miezul nopții (18:00 → 02:00) e „după 18:00 SAU până la 01:59”
      conditii: {
        ...(x.de < x.pana ? { ora: { min: x.de, max: minusUnMinut(x.pana) } } : { oricare: [{ ora: { min: x.de } }, { ora: { max: minusUnMinut(x.pana) } }] }),
        ...(x.zile ? { zileSaptamana: x.zile } : {}),
      },
    }));
}

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

  // Personajele care au sprite într-un loc (cheie „zona/loc”) sau direct într-o zonă (cheie „zona”, ca piața)
  const spriteuri = (cheie, fisier) =>
    personaje
      .filter((p) => (p.locuriSprite || []).includes(cheie))
      .map((p) => ({ id: p.id, tip: 'sprite', nume: p.nume, imagine: `sprites/${p.id}_${fisier}.png`, variante: varianteDinProgram(p, cheie, fisier), tinta: null }));
  // Regula autorului: tot ce e clicabil (în afară de piesele de pe hartă) are o zonă desenată de el.
  // Fiecare personaj dintr-o scenă primește deci și o zonă; până e desenată, personajul răspunde pe forma lui.
  // Personajele marcate „clicabil: false” (de exemplu negustorul din piață) doar se văd, nu primesc zonă
  const neclicabili = new Set(personaje.filter((p) => p.clicabil === false).map((p) => p.id));
  const zonePersonaje = (obiecte) =>
    obiecte.filter((o) => !neclicabili.has(o.id)).map((o) => ({ id: `personaj_${o.id}`, nume: o.nume, personaj: o.id }));
  const actiuniCaTinte = (actiuni) => (actiuni || []).map((a, i) => ({ id: a.id || `actiune_${i}`, nume: a.nume, act: a, ascuns: a.ascuns || null }));

  for (const z of zone) {
    const tintaLoc = (l) => ({
      id: l.id,
      nume: l.nume,
      spre: l.actiune ? null : `${z.id}.${l.id}`,
      actiune: l.actiune || null,
      incuiat: l.incuiat || null,
      ascuns: l.ascuns || null,
    });
    scene.set(z.id, {
      id: z.id,
      tip: 'zona',
      titlu: z.nume,
      imagine: z.imagine,
      variante: z.variante || [],
      parinte: 'harta',
      tinte: [
        ...z.locuri.filter((l) => !l.din).map(tintaLoc),
        // O zonă fără locuri (piața) e ea însăși scena: acțiunile și personajele stau direct pe ea
        ...actiuniCaTinte(z.actiuni),
        ...zonePersonaje(spriteuri(z.id, z.id)),
      ],
      obiecte: spriteuri(z.id, z.id),
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
        // „din”: locul se deschide din alt loc al zonei, nu din imaginea zonei (camera fierarului e prin magazin)
        parinte: l.din ? `${z.id}.${l.din}` : z.id,
        // Acțiunile locului (dormit, cufăr, magazin...) au și ele zone care se pot desena pe imagine
        tinte: [...actiuniCaTinte(l.actiuni), ...zonePersonaje(spriteuri(cheieLoc, `${z.id}_${l.id}`))],
        obiecte: spriteuri(cheieLoc, `${z.id}_${l.id}`),
      });
    }
    // Ușa spre un loc „din” alt loc devine o țintă (zonă de desenat) în scena acelui loc
    for (const l of z.locuri.filter((x) => x.din)) scene.get(`${z.id}.${l.din}`)?.tinte.push(tintaLoc(l));
  }
  // Ecranul de echipament se aranjează în editor ca o scenă: figura lui Vale și sloturile peste ea
  scene.set('echipament', {
    id: 'echipament',
    tip: 'ecran',
    titlu: 'Ecranul de echipament',
    imagine: fisierUi('inventar_fundal'),
    variante: [],
    parinte: null,
    tinte: [],
    obiecte: [
      { id: 'figura', tip: 'figura', nume: 'Vale (A-pose)', imagine: fisierUi('vale_apoza'), variante: [], implicit: { x: 0.27, y: 0.96, scara: 0.86 } },
      ...SLOTURI.map((sl, i) => ({ id: sl, tip: 'slot', nume: NUME_SLOTURI[sl], imagine: fisierUi('slot'), variante: [], implicit: POZITII_SLOTURI[sl] })),
    ],
  });
  return scene;
}

const POZITII_SLOTURI = {
  cap: { x: 0.27, y: 0.2, scara: 0.1 },
  haina: { x: 0.27, y: 0.42, scara: 0.1 },
  manusi: { x: 0.13, y: 0.55, scara: 0.1 },
  pantaloni: { x: 0.27, y: 0.66, scara: 0.1 },
  bocanci: { x: 0.27, y: 0.9, scara: 0.1 },
  arma_primara: { x: 0.42, y: 0.55, scara: 0.1 },
  arma_secundara: { x: 0.13, y: 0.72, scara: 0.1 },
  rucsac: { x: 0.42, y: 0.3, scara: 0.1 },
};

// Lista de imagini încearcă întâi variantele cu nume exact (de exemplu casa_reparata_zona_noapte.png),
// apoi combinația de sufixe, apoi câte unul, apoi imaginea de bază,
// ca să nu fie nevoie de o imagine pentru fiecare combinație
export function candidati(imagine, variante, context) {
  const toate = (variante || []).filter((v) => verifica(v.conditii, context));
  const potrivite = toate.filter((v) => v.sufix).map((v) => v.sufix);
  const baza = imagine.replace(/\.png$/, '');
  const lista = toate.filter((v) => v.imagine).map((v) => v.imagine);
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
  // grup = unde apare imaginea în galerie (Harta, Casa, Piața..., Portrete, Luptă...), ca autorul să vadă pe zone ce mai lipsește
  let grup = '';
  const adauga = (cale, scop, optional = false) => {
    if (!rezultat.has(cale)) rezultat.set(cale, { cale, categorie: categorie(cale), scop, optional, grup });
  };
  const cuVariante = (imagine, variante, scop) => {
    adauga(imagine, scop);
    for (const v of variante || []) {
      if (v.imagine) adauga(v.imagine, `${scop} (varianta ${v.nume || 'specială'})`, true);
      else adauga(imagine.replace(/\.png$/, `${v.sufix}.png`), `${scop} (varianta ${v.sufix.slice(1)})`, true);
    }
  };

  for (const s of scene.values()) {
    if (s.tip === 'ecran') continue;
    const tipScena = { harta: 'Harta', zona: 'Zona', loc: 'Loc' }[s.tip];
    grup = s.tip === 'harta' ? 'Harta' : s.tip === 'zona' ? s.titlu : scene.get(s.parinte).titlu;
    cuVariante(s.imagine, s.variante, `${tipScena}: ${s.titlu}`);
    for (const o of s.obiecte) {
      // Piesa de pe hartă stă la zona ei (casa la Casa), nu la Harta
      if (o.tip === 'piesa') grup = o.nume;
      cuVariante(o.imagine, o.variante, o.tip === 'piesa' ? `Piesă pe hartă: ${o.id}` : `Sprite: ${o.nume} în ${s.titlu}`);
    }
  }
  // Imaginile evenimentelor (scenele derulate), grupate pe eveniment: tot ce ține de el se încarcă într-un loc
  for (const ev of date.events?.evenimente || []) {
    if (!ev.imagini?.length) continue;
    grup = `Eveniment: ${ev.grup || ev.nume || ev.id}`;
    ev.imagini.forEach((cale, i) => adauga(cale, `${ev.nume || ev.id}: imaginea ${i + 1}`));
  }
  grup = 'Portrete';
  for (const p of date.npcs.personaje) {
    for (const st of date.npcs.stariPortret) {
      adauga(`portraits/${p.id}_${st}.png`, `Portret: ${p.nume} (${st})`, st !== 'normal');
    }
  }
  // Personajele care apar doar în evenimente (de exemplu călătorul rănit) au și ele nevoie de portret
  const cunoscute = new Set(date.npcs.personaje.map((p) => p.id));
  for (const ev of date.events?.evenimente || []) {
    if (!ev.vorbitor || cunoscute.has(ev.vorbitor)) continue;
    adauga(`portraits/${ev.vorbitor}_normal.png`, `Portret: ${ev.numeVorbitor || ev.vorbitor} (eveniment)`);
    if (ev.emotie && ev.emotie !== 'normal') adauga(`portraits/${ev.vorbitor}_${ev.emotie}.png`, `Portret: ${ev.numeVorbitor || ev.vorbitor} (${ev.emotie})`, true);
  }
  // Pozele de luptă: Vale are câte un set pentru fiecare tip de armă; ceilalți câte unul (un inamic cu „poze” le refolosește pe ale altuia)
  const POZE = ['idle', 'atac', 'aparare', 'ranit'];
  grup = 'Luptă';
  for (const arma of ['pumni', 'sabie', 'sabie_scut', 'sabie_doua_maini', 'topor_doua_maini', 'arc']) {
    for (const p of POZE) adauga(`combat/vale_${arma}_${p}.png`, `Luptă: Vale cu ${arma.replaceAll('_', ' ')} (${p})`, arma !== 'pumni' || p !== 'idle');
  }
  const luptatori = [...date.npcs.personaje.filter((p) => p.lupta).map((p) => [p.id, p.nume]), ...Object.entries(date.lupte?.inamici || {}).filter(([, x]) => !x.poze).map(([id, x]) => [id, x.nume])];
  for (const [id, nume] of luptatori) for (const p of POZE) adauga(`combat/${id}_${p}.png`, `Luptă: ${nume} (${p})`, p !== 'idle');
  grup = 'Obiecte';
  for (const [id, o] of Object.entries(date.items?.obiecte || {})) adauga(`items/${id}.png`, `Iconiță: ${o.nume}`);
  grup = 'Interfață';
  for (const el of ELEMENTE_UI) adauga(fisierUi(el.id), `Interfață: ${el.nume} (${el.marime})`, true);
  return [...rezultat.values()];
}
