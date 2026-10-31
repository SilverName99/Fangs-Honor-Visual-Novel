import { MINUTE_ZI, inMinute, momentZi } from './timp.js';

// Crește doar când se schimbă forma salvării; atunci se adaugă și o migrare în salvare.js
export const VERSIUNE_SALVARE = 1;

export function stareNoua(config) {
  const s = config.start;
  return {
    versiuneSalvare: VERSIUNE_SALVARE,
    scena: s.scena,
    minute: (s.zi - 1) * MINUTE_ZI + inMinute(s.ora),
    nevoi: { ...config.nevoi.start },
    bani: s.bani ?? 0,
    reputatie: 0,
    stari: { ...(s.stari || {}) },
    obiecte: [],
    misiuni: {},
    relatii: {},
    deblocate: [],
    // Istoricul evenimentelor: de câte ori și în ce zi au apărut ultima dată (pentru „repetare”)
    evenimente: {},
  };
}

export const ziua = (stare) => Math.floor(stare.minute / MINUTE_ZI) + 1;
export const minuteInZi = (stare) => stare.minute % MINUTE_ZI;

export function formatOra(stare) {
  const m = minuteInZi(stare);
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

export function context(stare) {
  const m = minuteInZi(stare);
  return { ...stare, minuteZi: m, moment: momentZi(m), zi: ziua(stare), loc: stare.scena.replace('.', '/') };
}

const limiteaza = (v) => Math.max(0, Math.min(100, v));

export function schimbaNevoie(stare, nume, cu) {
  stare.nevoi[nume] = limiteaza((stare.nevoi[nume] ?? 0) + cu);
}

// Timpul curge în pași mici, ca foamea și setea să scadă treptat și leșinul să vină la momentul potrivit
export function avanseaza(stare, minute, cfg) {
  const n = stare.nevoi;
  let ramas = Math.max(0, Math.round(minute));
  while (ramas > 0) {
    const pas = Math.min(ramas, 10);
    ramas -= pas;
    const ore = pas / 60;
    n.foame = limiteaza(n.foame - cfg.foamePeOra * ore);
    n.sete = limiteaza(n.sete - cfg.setePeOra * ore);
    if (n.foame <= 0) n.viata = limiteaza(n.viata - cfg.viataPeOraFaraMancare * ore);
    if (n.sete <= 0) n.viata = limiteaza(n.viata - cfg.viataPeOraFaraApa * ore);
    stare.minute += pas;
    if (n.viata <= 0) return { lesin: true };
  }
  return { lesin: false };
}

// Cu sete mare, orice acțiune durează mai mult (pedeapsă moale, din config)
export function costTimp(stare, minute, cfg) {
  return stare.nevoi.sete < cfg.prag ? Math.round(minute * cfg.durataCandESete) : minute;
}
