import { verifica } from './conditii.js';
import { ELEMENTE_UI, fisierUi } from './uiGrafica.js';
import { fisierCarte } from './carte.js';
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
      // Un interval peste miezul nopții (18:00 → 02:00) e „după 18:00 SAU până la 01:59”; unul care se oprește fix la 00:00 nu trece peste
      conditii: {
        ...(x.de < x.pana || x.pana === '00:00' ? { ora: { min: x.de, max: minusUnMinut(x.pana) } } : { oricare: [{ ora: { min: x.de } }, { ora: { max: minusUnMinut(x.pana) } }] }),
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
    estompare: harta.estompare || [],
    parinte: null,
    tinte: zone.map((z) => ({ id: z.id, nume: z.nume, spre: z.id })),
    obiecte: zone.flatMap((z) =>
      (z.piese || []).map((p) => ({ id: p.id, tip: 'piesa', nume: z.nume, imagine: p.imagine, variante: p.variante || [], tinta: z.id, deasupra: !!p.deasupra })),
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

  const decor = (x) => ({ id: x.id, tip: 'decor', nume: x.nume, imagine: x.imagine, variante: x.variante || [], apare: x.apare || null });
  for (const z of zone) {
    const tintaLoc = (l) => ({
      id: l.id,
      nume: l.nume,
      // Un loc de vânătoare nu se deschide: arată imaginea lui câteva secunde și pornește lupta
      spre: l.actiune || l.vanatoare ? null : `${z.id}.${l.id}`,
      actiune: l.actiune || null,
      vanatoare: l.vanatoare ? { ...l.vanatoare, imagine: l.imagine } : null,
      incuiat: l.incuiat || null,
      ascuns: l.ascuns || null,
    });
    scene.set(z.id, {
      id: z.id,
      tip: 'zona',
      titlu: z.nume,
      imagine: z.imagine,
      variante: z.variante || [],
      filtruSeara: z.filtruSeara || null,
      parinte: 'harta',
      tinte: [
        ...z.locuri.filter((l) => !l.din).map(tintaLoc),
        // O zonă fără locuri (piața) e ea însăși scena: acțiunile și personajele stau direct pe ea
        ...actiuniCaTinte(z.actiuni),
        ...zonePersonaje(spriteuri(z.id, z.id)),
      ],
      // Și o zonă care e ea însăși scena poate avea decor (taraba negustorului din piață)
      obiecte: [...spriteuri(z.id, z.id), ...(z.decor || []).map(decor)],
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
        filtruSeara: l.filtruSeara || null,
        // „din”: locul se deschide din alt loc al zonei, nu din imaginea zonei (camera fierarului e prin magazin)
        parinte: l.din ? `${z.id}.${l.din}` : z.id,
        // Acțiunile locului (dormit, cufăr, magazin...) au și ele zone care se pot desena pe imagine
        tinte: [...actiuniCaTinte(l.actiuni), ...zonePersonaje(spriteuri(cheieLoc, `${z.id}_${l.id}`))],
        // „decor”: obiecte puse peste fundal, mereu acolo și neclicabile (glaive-ul Kaiei la campsite);
        // se aranjează în editor ca sprite-urile și primesc filtrul de seară/noapte ca restul scenei
        obiecte: [
          ...spriteuri(cheieLoc, `${z.id}_${l.id}`),
          ...(l.decor || []).map(decor),
        ],
      });
    }
    // Ușa spre un loc „din” alt loc devine o țintă (zonă de desenat) în scena acelui loc
    for (const l of z.locuri.filter((x) => x.din)) scene.get(`${z.id}.${l.din}`)?.tinte.push(tintaLoc(l));
  }
  // Hărțile de luptă: câte una pentru locurile din „harti” (lupte.json); deocamdată sala tavernei și adâncul pădurii.
  // Imaginea e separată (locations/lupta_<zona>_<loc>.png); până e încărcată, se vede scena locului.
  // Cele 12 locuri ale luptătorilor (6 aliați, 6 inamici) se mută în editor, peste imagine.
  // Doar locurile din lista „harti” din lupte.json au hartă separată; celelalte lupte folosesc scena locului
  for (const fundal of date.lupte?.harti || []) {
    const loc = scene.get(fundal);
    if (!loc) continue;
    const id = idHartaLupta(fundal);
    scene.set(id, {
      id,
      tip: 'lupta',
      titlu: `Luptă: ${loc.titlu}`,
      imagine: loc.imagine,
      harta: `locations/${id}.png`,
      variante: [{ imagine: `locations/${id}.png`, nume: 'harta de luptă' }],
      parinte: null,
      tinte: [],
      obiecte: LOCURI_LUPTA.map((l) => ({
        id: l.id,
        tip: 'loc-lupta',
        nume: l.nume,
        eticheta: l.nume,
        imagine: l.tabara === 'aliat' ? 'combat/vale_pumni_idle.png' : 'combat/paznic_orc_1_idle.png',
        variante: [],
        implicit: { x: l.x, y: l.y, scara: l.scara },
      })),
    });
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
  // Masa de zaruri de la poartă: fundalul văzut prin ochii lui Vale, cu buturuga; peste el orcii și paharele lor
  scene.set('zaruri', {
    id: 'zaruri',
    tip: 'ecran',
    titlu: 'Jocul de zaruri (la poartă)',
    titluObiecte: 'Orcii și paharele',
    titluFundal: 'Masa de zaruri, privită de Vale',
    // Prim-planul (buturuga) taie orcii și paharele; zarurile și baloanele stau peste el
    primPlan: true,
    imagine: 'locations/zaruri_masa.png',
    variante: [],
    parinte: null,
    tinte: [],
    obiecte: [
      ...(date.config.jocZaruri?.jucatori || []).map((j, i) => ({
        id: j.id,
        tip: 'figura',
        nume: `${j.nume} la masă`,
        imagine: `sprites/zaruri_${j.id}.png`,
        raport: 0.8,
        variante: [],
        implicit: { x: i ? 0.8 : 0.2, y: 0.72, scara: 0.6 },
      })),
      ...(date.config.jocZaruri?.jucatori || []).map((j, i) => ({
        id: `pahar_${j.id}`,
        tip: 'pahar-masa',
        pentru: j.id,
        nume: `Paharul: ${j.nume}`,
        imagine: fisierUi('pahar_zaruri'),
        raport: 1,
        variante: [],
        implicit: { x: i ? 0.66 : 0.34, y: 0.64, scara: 0.12 },
      })),
    ],
  });
  return scene;
}

// Locurile din luptă: 3 linii (sus, mijloc, jos), câte un loc în față și unul în spate, pe fiecare tabără.
// Fața e spre mijlocul ecranului, spatele spre margine. Pozițiile sunt cele implicite, până le mută autorul.
const NUME_LINII = ['sus', 'mijloc', 'jos'];
export const LOCURI_LUPTA = ['aliat', 'inamic'].flatMap((tabara) =>
  [0, 1, 2].flatMap((linie) =>
    ['fata', 'spate'].map((rand) => ({
      id: `${tabara}_${linie}_${rand}`,
      tabara,
      linie,
      rand,
      nume: `${tabara === 'aliat' ? 'Aliat' : 'Inamic'} · ${NUME_LINII[linie]} · ${rand === 'fata' ? 'față' : 'spate'}`,
      x: { aliat: { fata: 0.29, spate: 0.12 }, inamic: { fata: 0.71, spate: 0.88 } }[tabara][rand],
      y: [0.5, 0.72, 0.94][linie],
      scara: 0.25,
    })),
  ),
);
export const idHartaLupta = (fundal) => `lupta_${fundal.replace('.', '_')}`;

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

const ZILE_SCURT = { luni: 'L', marti: 'Ma', miercuri: 'Mi', joi: 'J', vineri: 'V', sambata: 'S', duminica: 'D' };
const MOMENTE = { dimineata: 'dimineața', amiaza: 'amiaza', seara: 'seara', noaptea: 'noaptea' };

// Când e personajul în locul ăsta cu sprite-ul dat (null = cel de bază), pe scurt: „09:00–12:00 (S,D) pregătește taverna”
function candApare(p, cheie, sprite) {
  if (p?.program) {
    return p.program
      .filter((x) => x.loc === cheie && (x.sprite || null) === sprite)
      .map((x) => `${x.de}–${x.pana}${x.zile ? ` (${x.zile.map((z) => ZILE_SCURT[z]).join(',')})` : ''}${x.ce ? ` ${x.ce}` : ''}`)
      .join('; ');
  }
  if (p?.rutina && !sprite) return Object.entries(p.rutina).filter(([, r]) => r.loc === cheie).map(([m]) => MOMENTE[m] || m).join(', ');
  return '';
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
    if (s.tip === 'lupta') {
      grup = 'Hărți de luptă';
      adauga(s.harta, `Hartă de luptă: ${s.titlu.replace('Luptă: ', '')} (până o încarci, se vede scena locului)`);
      continue;
    }
    const tipScena = { harta: 'Harta', zona: 'Zona', loc: 'Loc' }[s.tip];
    grup = s.tip === 'harta' ? 'Harta' : s.tip === 'zona' ? s.titlu : scene.get(s.parinte).titlu;
    cuVariante(s.imagine, s.variante, `${tipScena}: ${s.titlu}`);
    for (const o of s.obiecte) {
      // Piesa de pe hartă stă la zona ei (casa la Casa), nu la Harta
      if (o.tip === 'piesa') grup = o.nume;
      if (o.tip !== 'sprite') {
        cuVariante(o.imagine, o.variante, o.tip === 'piesa' ? `Piesă pe hartă: ${o.id}` : o.nume);
        continue;
      }
      // La sprite-uri scrie și orele, ca autorul să știe ce face personajul în poza aceea
      const p = date.npcs.personaje.find((x) => x.id === o.id);
      const cheie = s.id.replace('.', '/');
      const cand = (sprite) => {
        const ore = candApare(p, cheie, sprite);
        return ore ? ` · ${ore}` : '';
      };
      adauga(o.imagine, `Sprite: ${o.nume} în ${s.titlu}${cand(null)}`);
      for (const v of o.variante) adauga(v.imagine, `Sprite: ${o.nume} în ${s.titlu} (varianta ${v.nume})${cand(v.nume)}`, true);
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
    if (p.faraPortret) continue;
    // Unele personaje au stări în plus (orcii râd zeflemitor), doar pentru ele
    // Un personaj minor poate cere mai puține stări (negustorul: doar „normal”, celelalte ar cădea oricum pe el)
    for (const st of [...(p.stariPortret || date.npcs.stariPortret), ...(p.stariExtra || [])]) {
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
  const POZE = ['idle', 'atac', 'aparare', 'lovit', 'cazut'];
  grup = 'Luptă';
  for (const arma of ['pumni', 'sabie', 'sabie_scut', 'sabie_doua_maini', 'topor_doua_maini', 'arc']) {
    for (const p of POZE) adauga(`combat/vale_${arma}_${p}.png`, `Luptă: Vale cu ${arma.replaceAll('_', ' ')} (${p})`, arma !== 'pumni' || p !== 'idle');
  }
  // Cine nu atacă normal (preotul, doar puteri) nu are nevoie de poza „atac”
  const luptatori = [...date.npcs.personaje.filter((p) => p.lupta).map((p) => [p.id, p.nume, p.lupta.faraAtac]), ...Object.entries(date.lupte?.inamici || {}).filter(([, x]) => !x.poze).map(([id, x]) => [id, x.nume, x.faraAtac])];
  // Pozele refolosite (orcii din tavernă arată ca paznicul de la poartă) trebuie cerute și ele, o singură dată
  for (const x of Object.values(date.lupte?.inamici || {})) {
    if (!x.poze || luptatori.some(([id]) => id === x.poze)) continue;
    luptatori.push([x.poze, date.npcs.personaje.find((p) => p.id === x.poze)?.nume || x.poze, false]);
  }
  for (const [id, nume, faraAtac] of luptatori) for (const p of POZE) if (!(faraAtac && p === 'atac')) adauga(`combat/${id}_${p}.png`, `Luptă: ${nume} (${p})`, p !== 'idle');
  // Puterile: poza personajului când o folosește (altfel „atac”) și, unde e cazul, imaginea efectului (scutul de lumină)
  for (const p of date.npcs.personaje) {
    for (const ab of p.lupta?.abilitati || []) {
      if (ab.poza) adauga(`combat/${p.id}_${ab.poza}.png`, `Luptă: ${p.nume} (${ab.nume})`, true);
      if (ab.imagine) adauga(ab.imagine, `Luptă: ${ab.nume} (efectul puterii lui ${p.nume})`);
    }
  }
  // Schițele din cartea personajelor (pagina din dreapta)
  grup = 'Cartea personajelor';
  for (const p of date.npcs.personaje) if (p.carte) adauga(fisierCarte(p.id), `Carte: ${p.nume} (schiță în cerneală sau cărbune, 4:5, de exemplu 1024 × 1280, fundal transparent)`);
  // Jocul de zaruri: fundalul cu buturuga și orcii la masă (stă, amestecă zarurile, se gândește)
  grup = 'Jocul de zaruri';
  adauga('locations/zaruri_masa.png', 'Zaruri: masa văzută prin ochii lui Vale, cu buturuga în față, fără orci (1920 × 1080)');
  for (const j of date.config.jocZaruri?.jucatori || []) {
    adauga(`sprites/zaruri_${j.id}.png`, `Zaruri: ${j.nume}, stă la masă (fundal transparent)`);
    adauga(`sprites/zaruri_${j.id}_amesteca.png`, `Zaruri: ${j.nume}, amestecă zarurile în pahar`, true);
    adauga(`sprites/zaruri_${j.id}_gandeste.png`, `Zaruri: ${j.nume}, se gândește`, true);
  }
  grup = 'Obiecte';
  for (const [id, o] of Object.entries(date.items?.obiecte || {})) adauga(`items/${id}.png`, `Iconiță: ${o.nume}`);
  grup = 'Interfață';
  for (const el of ELEMENTE_UI) adauga(fisierUi(el.id), `Interfață: ${el.nume} (${el.marime})`, true);
  return [...rezultat.values()];
}
