import { elementImagine } from './imagini.js';
import { aplicaEfecte } from './efecte.js';
import { context } from './stare.js';
import { verifica } from './conditii.js';

// Groapa (cerută de autor): arena orcilor de lângă poartă. Se intră apăsând pe poartă, seara; alegi nivelul (câte
// valuri de orci) și cel mult doi aliați cu încrederea cerută, apoi lupta. Regulile și cifrele stau în config.json
// („groapa”), luptele în lupte.json, iar ce se întâmplă după (bani, prima victorie, inelul mamei) e aici
const div = (clasa, text) => Object.assign(document.createElement('div'), { className: clasa, textContent: text ?? '' });
function buton(text, clic, dezactivat = false) {
  const b = document.createElement('button');
  // Pergamentul din meniu (decis de autor), ca pe panoul mic de la Dormi și Muncă
  b.className = 'buton buton-mic-meniu';
  b.textContent = text;
  b.onclick = clic;
  b.disabled = dezactivat;
  return b;
}
const valuri = (n) => (n === 1 ? '1 val' : `${n} valuri`);

export function creeazaGroapa(parinte, joc) {
  const cfg = () => joc.date.config.groapa || {};
  const nivel = (id) => (cfg().niveluri || []).find((n) => n.id === id);
  const personaj = (id) => joc.date.npcs.personaje.find((p) => p.id === id);

  // Cine poate intra cu Vale: cei din listă care luptă și au încrederea cerută (decis de autor: cel puțin 4)
  function aliatiPosibili() {
    const s = joc.stare;
    return (cfg().aliati || []).filter((id) => personaj(id)?.lupta && (s.relatii?.[id] || 0) >= (cfg().incredereMin ?? 4));
  }

  // Ecranul Groapei: imaginea ei pe tot ecranul, iar peste ea panoul mic, cu pașii pe rând (nivelul, apoi aliații)
  function deschide(loc) {
    const fundal = div('acoperitor ecran-groapa');
    if (loc?.imagine) fundal.append(elementImagine([loc.imagine], { clasa: 'fundal fundal-groapa', fundal: true }));
    const panou = div('panou-actiune panou-groapa');
    fundal.append(panou);
    const inchide = () => fundal.remove();
    fundal.onclick = (e) => e.target === fundal && inchide();
    parinte.append(fundal);
    joc.sunet.efect('arena');

    const t = cfg().texte || {};
    function alegeNivelul() {
      panou.replaceChildren(
        div('titlu-meniu', loc?.nume || 'Groapa'),
        div('text-panou-groapa', t.intro || 'Câte valuri înfrunți?'),
        ...(cfg().niveluri || []).map((n) => {
          const lupta = joc.date.lupte.lupte[n.lupta];
          const b = buton(`${n.nume} · ${valuri(lupta?.valuri?.length || 1)}`, () => alegeAliatii(n));
          // Ce câștigi, pe rândul al doilea al butonului
          b.append(div('detaliu-groapa', `${n.bani} monede${joc.stare.stari?.[`groapa_${n.id}`] === 'castigat' ? '' : ' · prima dată și o răsplată'}`));
          return b;
        }),
        buton('Pleacă', inchide),
      );
    }

    function alegeAliatii(n) {
      const posibili = aliatiPosibili();
      const max = cfg().maxAliati ?? 2;
      const alesi = [];
      const note = cfg().note || {};
      const randuri = posibili.map((id) => {
        const b = buton(personaj(id).nume, () => {
          const i = alesi.indexOf(id);
          if (i >= 0) alesi.splice(i, 1);
          else if (alesi.length < max) alesi.push(id);
          actualizeaza();
        });
        if (note[id]) b.append(div('detaliu-groapa', note[id]));
        return [id, b];
      });
      const intra = buton(posibili.length ? 'Intră în Groapă' : 'Intru singur', () => incepe(n, alesi));
      const indemn = div('text-panou-groapa');
      function actualizeaza() {
        for (const [id, b] of randuri) {
          b.classList.toggle('ales', alesi.includes(id));
          b.disabled = !alesi.includes(id) && alesi.length >= max;
        }
        indemn.textContent = posibili.length
          ? (t.aliati || 'Cine intră cu tine? Cel mult {max}.').replace('{max}', String(max)) + (alesi.length ? ` (${alesi.length}/${max})` : '')
          : t.singur || 'N-am încă pe cine lua cu mine. Intru singur.';
      }
      actualizeaza();
      panou.replaceChildren(div('titlu-meniu', `${loc?.nume || 'Groapa'} · ${n.nume}`), indemn, ...randuri.map(([, b]) => b), intra, buton('Înapoi', alegeNivelul));
    }

    function incepe(n, alesi) {
      inchide();
      const def = joc.date.lupte.lupte[n.lupta];
      if (!def) return joc.mesaj(`Lupta „${n.lupta}” nu există.`);
      // O luptă pe seară (decis de autor), numărată de la intrare: nici după un refresh nu se poate lua de la capăt
      // ca să încerci altfel; lupta începută, da (o luptă începută pornește de la capăt)
      aplicaEfecte({ marcheaza: 'groapa' }, joc);
      const cu = (parte, rezultat) => ({ ...parte, efecte: { ...(parte?.efecte || {}), groapa: { nivel: n.id, rezultat } } });
      joc.pornesteLupta({
        ...def,
        id: n.lupta,
        aliatiAlesi: alesi,
        varianta: 'groapa',
        victorie: cu(def.victorie, 'victorie'),
        infrangere: cu(def.infrangere, 'infrangere'),
      });
    }

    alegeNivelul();
  }

  // După luptă (efectul „groapa”): banii nivelului, reputația (satul se uită de după gard), răsplata primei victorii
  // pe fiecare nivel și, cât e misiunea „Inelul mamei”, inelul (decis de autor: prima victorie, oricare nivel)
  function rezultat({ nivel: id, rezultat: r }) {
    const n = nivel(id);
    if (!n) return;
    const s = joc.stare;
    if (r !== 'victorie') return aplicaEfecte({ contor: { groapa_infrangeri: 1 } }, joc);
    const prima = s.stari?.[`groapa_${id}`] !== 'castigat';
    aplicaEfecte({ bani: n.bani || 0, reputatie: n.reputatie || 0, contor: { groapa_victorii: 1 }, stare: { [`groapa_${id}`]: 'castigat' }, ...(prima && n.primaData ? { obiect: n.primaData } : {}) }, joc);
    const inel = cfg().inel;
    if (inel && verifica(inel.conditii, context(s))) aplicaEfecte(inel.efecte, joc);
  }

  return { deschide, rezultat };
}
