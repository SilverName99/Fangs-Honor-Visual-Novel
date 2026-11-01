import { schimbaNevoie } from './stare.js';
import { MINUTE_ZI, inMinute } from './timp.js';

// Registru de efecte: evenimentele, dialogurile (și mai târziu abilitățile din luptă) folosesc aceleași funcții.
// Un efect nou = o funcție nouă aici, fără să atingi restul codului.
const efecte = {
  timp: (v, joc) => joc.avanseaza(v),
  bani: (v, joc) => (joc.stare.bani = Math.max(0, joc.stare.bani + v)),
  nevoi: (v, joc) => Object.entries(v).forEach(([k, cu]) => schimbaNevoie(joc.stare, k, cu)),
  reputatie: (v, joc) => (joc.stare.reputatie += v),
  relatie: (v, joc) => Object.entries(v).forEach(([id, cu]) => (joc.stare.relatii[id] = (joc.stare.relatii[id] || 0) + cu)),
  obiect: (v, joc) => [].concat(v).forEach((id) => joc.primeste(id, 1)),
  daObiect: (v, joc) => [].concat(v).forEach((id) => joc.inventar.scoateOriunde(id, 1)),
  stare: (v, joc) => Object.assign(joc.stare.stari, v),
  deblocheaza: (v, joc) => [].concat(v).forEach((loc) => joc.stare.deblocate.includes(loc) || joc.stare.deblocate.push(loc)),
  misiune: (v, joc) => Object.assign(joc.stare.misiuni, v),
  lupta: (v, joc) => joc.pornesteLupta(v),
  plataTaxa: (v, joc) => joc.platesteTaxa(),
  // Pune o nevoie la o valoare fixă (de exemplu viața 10 după bătaie, foamea plină după masa de la Agnes)
  seteazaNevoi: (v, joc) => Object.entries(v).forEach(([k, val]) => (joc.stare.nevoi[k] = Math.max(0, Math.min(100, val)))),
  // Ține minte când s-a întâmplat ceva, pentru condiția „trecut” (unchiul lipsește 2 zile după bătaie)
  marcheaza: (v, joc) => [].concat(v).forEach((k) => ((joc.stare.marcaje ||= {})[k] = joc.stare.minute)),
  // Camera de la tavernă ține până la prânzul de după noaptea pentru care ai plătit-o:
  // plătită seara sau după miezul nopții, tot în dimineața următoare expiră
  inchiriaza: (v, joc) => {
    const peste = joc.stare.minute + 10 * 60;
    let pana = Math.floor(peste / MINUTE_ZI) * MINUTE_ZI + inMinute(joc.date.config.somn.cameraPanaLa || '12:00');
    if (pana <= peste) pana += MINUTE_ZI;
    (joc.stare.inchirieri ||= {})[v] = pana;
  },
  // Taxa crește de acum înainte (orcii țin minte cine s-a bătut cu ei)
  taxaCrestere: (v, joc) => (joc.stare.taxa.extra = (joc.stare.taxa.extra || 0) + v),
  // Alt eveniment, după ce se închide ce e acum pe ecran (dialogul sau lupta)
  eveniment: (v, joc) => joc.pornesteEvenimentDupa(v),
  // Vale e dus altundeva, după ce se închide dialogul (vânătoarea îl duce la campsite-ul ei)
  mergi: (v, joc) => setTimeout(() => joc.mergi(v, { faraTimp: true }), 0),
  // Magazinul unui personaj, deschis din dialog (Agnes: „Cumpără”)
  magazin: (v, joc) => joc.deschideMagazin(v),
};

export function registreazaEfect(nume, functie) {
  efecte[nume] = functie;
}

export function aplicaEfecte(lista, joc) {
  for (const [tip, valoare] of Object.entries(lista || {})) {
    const f = efecte[tip];
    if (f) f(valoare, joc);
    else console.warn('Efect necunoscut:', tip);
  }
}
