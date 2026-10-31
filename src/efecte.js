import { schimbaNevoie } from './stare.js';

// Registru de efecte: evenimentele, dialogurile (și mai târziu abilitățile din luptă) folosesc aceleași funcții.
// Un efect nou = o funcție nouă aici, fără să atingi restul codului.
const efecte = {
  timp: (v, joc) => joc.avanseaza(v),
  bani: (v, joc) => (joc.stare.bani = Math.max(0, joc.stare.bani + v)),
  nevoi: (v, joc) => Object.entries(v).forEach(([k, cu]) => schimbaNevoie(joc.stare, k, cu)),
  reputatie: (v, joc) => (joc.stare.reputatie += v),
  relatie: (v, joc) => Object.entries(v).forEach(([id, cu]) => (joc.stare.relatii[id] = (joc.stare.relatii[id] || 0) + cu)),
  obiect: (v, joc) => [].concat(v).forEach((id) => joc.stare.obiecte.push(id)),
  daObiect: (v, joc) =>
    [].concat(v).forEach((id) => {
      const i = joc.stare.obiecte.indexOf(id);
      if (i >= 0) joc.stare.obiecte.splice(i, 1);
    }),
  stare: (v, joc) => Object.assign(joc.stare.stari, v),
  deblocheaza: (v, joc) => [].concat(v).forEach((loc) => joc.stare.deblocate.includes(loc) || joc.stare.deblocate.push(loc)),
  misiune: (v, joc) => Object.assign(joc.stare.misiuni, v),
  lupta: (v, joc) => joc.mesaj(`Lupta „${v}” vine în v0.3.`),
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
