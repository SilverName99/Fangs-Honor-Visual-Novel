// Logica inventarului: stive, sloturi, echipament, cufăr. Fără interfață, ca s-o poată folosi și lupta, și magazinul.
// Sloturile de echipament (decis de autor): armura se îmbunătățește din coif, armură și jambiere; fără mănuși și bocanci în demo
export const SLOTURI = ['cap', 'armura', 'jambiere', 'arma_primara', 'arma_secundara', 'rucsac'];
export const NUME_SLOTURI = {
  cap: 'Coif',
  armura: 'Armură',
  jambiere: 'Jambiere',
  arma_primara: 'Armă primară',
  arma_secundara: 'Armă secundară',
  rucsac: 'Rucsac',
};

export function creeazaInventar(date, getStare) {
  const defs = date.items.obiecte;
  const cfg = date.config.inventar;
  const def = (id) => defs[id] || { nume: id, tip: 'material', stiva: 1 };
  const sloturiStiva = (x) => def(x.id).sloturi || 1;
  const ocupate = (lista) => lista.reduce((s, x) => s + sloturiStiva(x), 0);
  // Monedele stau și ele în rucsac, într-o singură căsuță (decis de autor: ocupă un loc), deci obiectele au un loc mai puțin
  const LOC_BANI = 1;
  const capacitateRucsac = () => {
    const r = getStare().echipat.rucsac;
    return r ? def(r).capacitate : cfg.faraRucsac;
  };
  const capacitate = () => capacitateRucsac() - LOC_BANI;

  // Pune întâi în stivele începute, apoi în stive noi cât e loc; întoarce câte n-au încăput
  function adaugaIn(lista, cap, id, n) {
    const d = def(id);
    const max = d.stiva || 1;
    for (const x of lista) {
      if (n <= 0) break;
      if (x.id !== id || x.n >= max) continue;
      const pune = Math.min(n, max - x.n);
      x.n += pune;
      n -= pune;
    }
    while (n > 0 && ocupate(lista) + (d.sloturi || 1) <= cap) {
      const pune = Math.min(n, max);
      lista.push({ id, n: pune });
      n -= pune;
    }
    return n;
  }

  function scoateDin(lista, id, n) {
    for (let i = lista.length - 1; i >= 0 && n > 0; i--) {
      if (lista[i].id !== id) continue;
      const ia = Math.min(n, lista[i].n);
      lista[i].n -= ia;
      n -= ia;
      if (lista[i].n === 0) lista.splice(i, 1);
    }
    return n;
  }

  const numar = (lista, id) => lista.filter((x) => x.id === id).reduce((s, x) => s + x.n, 0);
  const incape = (lista, cap, id, n) => adaugaIn(structuredClone(lista), cap, id, n) === 0;

  // Mută o stivă întreagă dintr-o listă în alta (inventar ↔ cufăr)
  function mutaStiva(din, spre, capSpre, index) {
    const x = din[index];
    if (!x) return 'Nu există.';
    const rest = adaugaIn(spre, capSpre, x.id, x.n);
    x.n = rest;
    if (rest === 0) din.splice(index, 1);
    return rest ? 'Nu e loc pentru tot.' : null;
  }

  function echipeaza(index) {
    const s = getStare();
    const x = s.inventar[index];
    const d = def(x?.id);
    if (!x || d.tip !== 'echipament') return 'Obiectul ăsta nu se poate echipa.';
    const slot = d.slot;
    // Ce trebuie dat jos: ce e deja în slot, plus cealaltă mână dacă una dintre arme e cu două mâini
    const josDe = new Set([slot]);
    if (d.douaMaini) josDe.add('arma_secundara');
    if (slot === 'arma_secundara' && def(s.echipat.arma_primara).douaMaini) josDe.add('arma_primara');
    const dateJos = [...josDe].map((sl) => s.echipat[sl]).filter(Boolean);

    const proba = structuredClone(s.inventar);
    proba.splice(index, 1);
    const capNoua = slot === 'rucsac' ? d.capacitate - LOC_BANI : capacitate();
    for (const id of dateJos) if (adaugaIn(proba, capNoua, id, 1) > 0) return slot === 'rucsac' ? `Rucsacul e prea mic: golește mai întâi ${ocupate(proba) + 1 - capNoua} sloturi.` : 'Nu e loc în inventar pentru ce dai jos.';
    if (ocupate(proba) > capNoua) return `Rucsacul e prea mic: golește mai întâi ${ocupate(proba) - capNoua} sloturi.`;

    s.inventar = proba;
    for (const sl of josDe) delete s.echipat[sl];
    s.echipat[slot] = x.id;
    return null;
  }

  // Echipează direct din cufărul de acasă (de exemplu rucsacul, cât inventarul e plin); ce se dă jos rămâne în cufăr
  function echipeazaDinCufar(index) {
    const s = getStare();
    const x = s.cufar[index];
    const d = def(x?.id);
    if (!x || d.tip !== 'echipament') return 'Obiectul ăsta nu se poate echipa.';
    const slot = d.slot;
    const josDe = new Set([slot]);
    if (d.douaMaini) josDe.add('arma_secundara');
    if (slot === 'arma_secundara' && def(s.echipat.arma_primara).douaMaini) josDe.add('arma_primara');
    if (slot === 'rucsac' && ocupate(s.inventar) > d.capacitate - LOC_BANI) return `Rucsacul e prea mic: golește mai întâi ${ocupate(s.inventar) - d.capacitate + LOC_BANI} sloturi.`;
    const cufar = structuredClone(s.cufar);
    if (--cufar[index].n <= 0) cufar.splice(index, 1);
    for (const id of [...josDe].map((sl) => s.echipat[sl]).filter(Boolean)) if (adaugaIn(cufar, cfg.cufar, id, 1) > 0) return 'Nu e loc în cufăr pentru ce dai jos.';
    s.cufar = cufar;
    for (const sl of josDe) delete s.echipat[sl];
    s.echipat[slot] = x.id;
    return null;
  }

  function dezechipeaza(slot) {
    const s = getStare();
    const id = s.echipat[slot];
    if (!id) return null;
    const proba = structuredClone(s.inventar);
    const cap = slot === 'rucsac' ? cfg.faraRucsac - LOC_BANI : capacitate();
    if (adaugaIn(proba, cap, id, 1) > 0 || ocupate(proba) > cap) return slot === 'rucsac' ? 'Fără rucsac nu încape tot ce ai. Golește întâi inventarul.' : 'Nu e loc în inventar.';
    s.inventar = proba;
    delete s.echipat[slot];
    return null;
  }

  return {
    def,
    capacitate,
    // Toate locurile rucsacului, cu tot cu căsuța monedelor (pentru „Rucsac x / N”)
    capacitateRucsac,
    ocupate,
    sloturiStiva,
    numar,
    incape: (id, n = 1) => def(id).tip === 'poveste' || incape(getStare().inventar, capacitate(), id, n),
    // Întoarce câte n-au încăput (obiectele de poveste încap mereu)
    adauga(id, n = 1) {
      const s = getStare();
      if (def(id).tip === 'poveste') {
        if (!s.poveste.includes(id)) s.poveste.push(id);
        return 0;
      }
      return adaugaIn(s.inventar, capacitate(), id, n);
    },
    scoate: (id, n = 1) => scoateDin(getStare().inventar, id, n),
    scoateOriunde(id, n = 1) {
      const s = getStare();
      const i = s.poveste.indexOf(id);
      if (i >= 0) return s.poveste.splice(i, 1);
      scoateDin(s.inventar, id, n);
    },
    spreCufar: (index) => mutaStiva(getStare().inventar, getStare().cufar, cfg.cufar, index),
    dinCufar: (index) => mutaStiva(getStare().cufar, getStare().inventar, capacitate(), index),
    echipeaza,
    echipeazaDinCufar,
    dezechipeaza,
    // Ce poză de luptă folosește Vale: după arma primară, plus scutul din mâna a doua
    tipArmaVale() {
      const e = getStare().echipat;
      const tip = e.arma_primara ? def(e.arma_primara).tipArma || 'pumni' : 'pumni';
      return tip === 'sabie' && e.arma_secundara && def(e.arma_secundara).scut ? 'sabie_scut' : tip;
    },
  };
}
