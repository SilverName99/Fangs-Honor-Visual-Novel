// Ce mai e de tradus în engleză (rulează: node tools/traduceri.mjs; cu --detalii, lista întreagă).
// - textele din date (data/*.json) fără perechea „_en” (vezi src/limba.js);
// - textele românești schimbate după ce au fost traduse (engleza poate fi veche): amprenta românei de la traducere
//   stă în tools/traduceri.lock.json; după ce ai pus engleza nouă, „node tools/traduceri.mjs --amprente” le reface;
// - cheile t('...') din cod (src/) fără traducere în data/texte_ui.json, și traducerile pe care nu le mai folosește
//   nimeni (textul românesc din cod s-a schimbat);
// - ce a schimbat autorul în editor (data/aranjare/texte.json) peste o replică schimbată între timp în date.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { colecteazaTexte } from '../src/limba.js';
import { createHash } from 'crypto';

const R = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const detalii = process.argv.includes('--detalii');
const citeste = (f) => JSON.parse(fs.readFileSync(path.join(R, f), 'utf8'));

const date = {};
for (const f of fs.readdirSync(path.join(R, 'data'))) if (f.endsWith('.json')) date[f.slice(0, -5)] = citeste(`data/${f}`);
const aranjare = fs.existsSync(path.join(R, 'data/aranjare/texte.json')) ? citeste('data/aranjare/texte.json') : {};

// ---------- datele ----------
const texte = colecteazaTexte(date);
const lipsa = texte.filter((x) => !x.en);
const peFisier = {};
for (const x of lipsa) peFisier[x.cale.split('/')[0]] = (peFisier[x.cale.split('/')[0]] || 0) + 1;
console.log(`Date: ${texte.length - lipsa.length} din ${texte.length} texte au engleza.`);
for (const [f, n] of Object.entries(peFisier)) console.log(`  ${f}: ${n} fără engleză`);
if (detalii) for (const x of lipsa) console.log(`    ${x.cale}: ${x.ro.slice(0, 90)}`);

// Amprenta românei la momentul traducerii: dacă româna se schimbă, engleza de lângă ea trebuie revăzută
const amprenta = (ro) => createHash('sha1').update(ro).digest('hex').slice(0, 10);
const LOCK = path.join(R, 'tools/traduceri.lock.json');
if (process.argv.includes('--amprente')) {
  const a = Object.fromEntries(texte.filter((x) => x.en).map((x) => [x.cale, amprenta(x.ro)]));
  fs.writeFileSync(LOCK, JSON.stringify(a, null, 0).replace(/,"/g, ',\n"') + '\n');
  console.log(`Amprente refăcute: ${Object.keys(a).length} texte traduse.`);
}
const amprente = fs.existsSync(LOCK) ? JSON.parse(fs.readFileSync(LOCK, 'utf8')) : {};
const vechi = texte.filter((x) => x.en && amprente[x.cale] && amprente[x.cale] !== amprenta(x.ro));
const faraAmprenta = texte.filter((x) => x.en && !amprente[x.cale]);
if (vechi.length) console.log(`  ${vechi.length} texte cu româna schimbată după traducere (engleza poate fi veche):`);
for (const x of vechi.slice(0, detalii ? Infinity : 30)) console.log(`    ${x.cale}: ${x.ro.slice(0, 70)}`);
if (faraAmprenta.length) console.log(`  ${faraAmprenta.length} texte traduse fără amprentă (după ce le verifici: --amprente).`);

// ---------- codul ----------
const chei = new Map();
const CHEIE = /\bt\(\s*(['"`])((?:\\.|(?!\1)[^\\])*)\1/g;
for (const f of fs.readdirSync(path.join(R, 'src'))) {
  if (!f.endsWith('.js')) continue;
  // Fără comentarii (rândurile care încep cu // și blocurile /* */): acolo t('...') e doar un exemplu
  const text = fs.readFileSync(path.join(R, 'src', f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  for (const m of text.matchAll(CHEIE)) {
    if (m[1] === '`' && m[2].includes('${')) {
      console.log(`  ATENȚIE src/${f}: t() cu \${...} în cheie (cheia trebuie să fie fixă): ${m[2].slice(0, 80)}`);
      continue;
    }
    const cheie = m[2].replace(/\\(['"`\\])/g, '$1').replace(/\\n/g, '\n');
    if (!chei.has(cheie)) chei.set(cheie, f);
  }
}
const dictionar = citeste('data/texte_ui.json').texte || {};
const faraEn = [...chei.keys()].filter((k) => !dictionar[k]);
const nefolosite = Object.keys(dictionar).filter((k) => !chei.has(k));
console.log(`Cod: ${chei.size - faraEn.length} din ${chei.size} texte t() au engleza; ${nefolosite.length} traduceri nefolosite.`);
if (detalii || faraEn.length < 30) for (const k of faraEn) console.log(`    fără engleză (src/${chei.get(k)}): ${k}`);
if (detalii) for (const k of nefolosite) console.log(`    nefolosită: ${k}`);

// ---------- schimbările autorului ----------
const dupaCale = new Map(texte.map((x) => [x.cale, x]));
let depasite = 0;
for (const [cale, s] of Object.entries(aranjare)) {
  if (cale.startsWith('ui/')) continue;
  const x = dupaCale.get(cale);
  if (!x) console.log(`  Schimbarea autorului la ${cale}: textul nu mai există în date.`), depasite++;
  else if (s.baza != null && s.baza !== x.ro) console.log(`  Schimbarea autorului la ${cale}: replica s-a schimbat între timp în date.`), depasite++;
}
console.log(`Editor: ${Object.keys(aranjare).length} texte schimbate de autor${depasite ? `, ${depasite} de revăzut` : ''}.`);
