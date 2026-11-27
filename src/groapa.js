import { elementImagine } from './imagini.js';
import { aplicaEfecte } from './efecte.js';
import { context } from './stare.js';
import { verifica } from './conditii.js';
import { undeEste, intrareProgram } from './rutine.js';
// Textele panoului sunt în limba jocului; cele din config.json („texte”) și numele vin deja traduse din date
import { t } from './limba.js';

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
// Buton pe două rânduri (decis de autor: scrisul să încapă bine în pergament): sus ce alegi, dedesubt, mai mic,
// ce câștigi sau ce face aliatul acolo
function buton2(titlu, detaliu, clic) {
  const b = buton('', clic);
  b.classList.add('buton-groapa');
  b.append(div('titlu-buton-groapa', titlu));
  if (detaliu) b.append(div('detaliu-groapa', detaliu));
  return b;
}
const valuri = (n) => (n === 1 ? t('1 val') : t('{n} valuri', { n }));

// Cine poate intra cu Vale: cei din listă care luptă, au încrederea cerută (decis de autor: cel puțin 4) și au
// spus da când i-a întrebat (decis de autor: întrebarea lor din meniu; Kaia, abia după capa de la Miriam).
// Tot de aici ia și HUD-ul pătrățelele cu fețele lor, sub butonul lui Vale (decis de autor: să vezi cine vine)
export function aliatiGroapa(joc) {
  const cfg = joc.date.config.groapa || {};
  const s = joc.stare;
  return (cfg.aliati || []).filter((id) => {
    const p = joc.date.npcs.personaje.find((x) => x.id === id);
    return p?.lupta && (s.relatii?.[id] || 0) >= (cfg.incredereMin ?? 4) && s.stari?.[`groapa_aliat_${id}`] === 'da';
  });
}

export function creeazaGroapa(parinte, joc) {
  const cfg = () => joc.date.config.groapa || {};
  const nivel = (id) => (cfg().niveluri || []).find((n) => n.id === id);
  const personaj = (id) => joc.date.npcs.personaje.find((p) => p.id === id);

  const aliatiPosibili = () => aliatiGroapa(joc);
  // Și trebuie să fie prin preajmă acum: nu cine doarme (Bram, după 22) sau e plecat (Kaia, cât lipsește după
  // șoim sau stă lângă Ember rănit); ei apar stinși, cu motivul, ca jucătorul să știe de ce
  function deCeLipseste(id) {
    const ctx = context(joc.stare);
    const p = personaj(id);
    if (intrareProgram(p, ctx)?.doarme) return t('doarme acum');
    if (undeEste(p, ctx) == null) return t('nu e prin preajmă acum');
    return null;
  }

  // La fiecare intrare, întâi un gând al lui Vale peste imaginea Groapei (decis de autor: 3 gânduri diferite, de
  // câte 2-3 replici), apoi panoul. Alt gând decât data trecută, ca să nu pară că se repetă
  function deschide(loc) {
    const d = cfg().ganduri && joc.date.dialoguri?.[cfg().ganduri];
    const start = [].concat(d?.start || []);
    const toate = start.find((x) => x?.aleator)?.aleator || [];
    // Un gând cu condiții, înaintea listei (decis de autor: cât verigheta mamei e încă de câștigat, Vale o vede la
    // brâul colectorului); tot nu de două ori la rând, ca regula gândurilor să rămână (ales de Claude)
    const anume = start.find((x) => x?.nod && x.nod !== joc.stare.stari?.groapa_gand && verifica(x.conditii, context(joc.stare)))?.nod;
    if (!toate.length && !anume) return arataPanoul(loc);
    const altele = toate.filter((x) => x !== joc.stare.stari?.groapa_gand);
    const nod = anume || (altele.length ? altele : toate)[Math.floor(Math.random() * (altele.length || toate.length))];
    aplicaEfecte({ stare: { groapa_gand: nod } }, joc);
    joc.dialogApoi({ ...d, start: nod }, () => arataPanoul(loc));
  }

  // Ecranul Groapei: imaginea ei pe tot ecranul, iar peste ea panoul mic, cu pașii pe rând (nivelul, apoi aliații)
  function arataPanoul(loc) {
    const fundal = div('acoperitor ecran-groapa');
    if (loc?.imagine) fundal.append(elementImagine([loc.imagine], { clasa: 'fundal fundal-groapa', fundal: true }));
    const panou = div('panou-actiune panou-groapa');
    fundal.append(panou);
    const inchide = () => fundal.remove();
    fundal.onclick = (e) => e.target === fundal && inchide();
    parinte.append(fundal);

    // Textele din config.json („texte”), cu numele lor; nu „t”, ca să nu ascundă t() din limba.js
    const texte = cfg().texte || {};
    function alegeNivelul() {
      panou.replaceChildren(
        div('titlu-meniu', loc?.nume || t('Groapa')),
        div('text-panou-groapa', texte.intro || t('Câte valuri înfrunți?')),
        ...(cfg().niveluri || []).map((n) => {
          const lupta = joc.date.lupte.lupte[n.lupta];
          // Ce câștigi, pe rândul al doilea; răsplata se dă doar la prima victorie pe nivel, deci apare cât mai e de luat
          const prima = joc.stare.stari?.[`groapa_${n.id}`] !== 'castigat';
          return buton2(`${n.nume} · ${valuri(lupta?.valuri?.length || 1)}`, prima ? t('{bani} monede + o răsplată', { bani: n.bani }) : t('{bani} monede', { bani: n.bani }), () => alegeAliatii(n));
        }),
        buton(t('Pleacă'), inchide),
      );
    }

    function alegeAliatii(n) {
      const posibili = aliatiPosibili();
      const max = cfg().maxAliati ?? 2;
      const alesi = [];
      const note = cfg().note || {};
      const randuri = posibili.map((id) => {
        const lipsa = deCeLipseste(id);
        const b = buton2(personaj(id).nume, lipsa || note[id], () => {
          if (lipsa) return;
          const i = alesi.indexOf(id);
          if (i >= 0) alesi.splice(i, 1);
          else if (alesi.length < max) alesi.push(id);
          actualizeaza();
        });
        return [id, b, lipsa];
      });
      const intra = buton(posibili.length ? t('Intră în Groapă') : t('Intru singur'), () => incepe(n, alesi));
      const indemn = div('text-panou-groapa');
      function actualizeaza() {
        for (const [id, b, lipsa] of randuri) {
          b.classList.toggle('ales', alesi.includes(id));
          b.disabled = !!lipsa || (!alesi.includes(id) && alesi.length >= max);
        }
        indemn.textContent = posibili.length
          ? (texte.aliati ? texte.aliati.replace('{max}', String(max)) : t('Cine intră cu tine? Cel mult {max}.', { max })) + (alesi.length ? ` (${alesi.length}/${max})` : '')
          : texte.singur || t('N-am încă pe cine lua cu mine. Intru singur.');
      }
      actualizeaza();
      panou.replaceChildren(div('titlu-meniu', `${loc?.nume || t('Groapa')} · ${n.nume}`), indemn, ...randuri.map(([, b]) => b), intra, buton(t('Înapoi'), alegeNivelul));
    }

    function incepe(n, alesi) {
      inchide();
      const def = joc.date.lupte.lupte[n.lupta];
      if (!def) return joc.mesaj(t('Lupta „{id}” nu există.', { id: n.lupta }));
      const cu = (parte, rezultat) => ({ ...parte, efecte: { ...(parte?.efecte || {}), groapa: { nivel: n.id, rezultat } } });
      const lupta = () => {
        // O luptă pe seară (decis de autor), numărată de la intrare: nici după un refresh nu se poate lua de la capăt
        // ca să încerci altfel; lupta începută, da (o luptă începută pornește de la capăt)
        aplicaEfecte({ marcheaza: 'groapa' }, joc);
        joc.pornesteLupta({
          ...def,
          id: n.lupta,
          aliatiAlesi: alesi,
          victorie: cu(def.victorie, 'victorie'),
          infrangere: cu(def.infrangere, 'infrangere'),
        });
      };
      // O discuție înainte de luptă, pe un nivel anume, cât o cere o misiune („inainteDeLupta” în config.json: Vale
      // pariază pe ciocanul neamului lui Bram, pe nivelul greu). Seara se numără abia după ea: un refresh în timpul
      // discuției n-o pierde, iar Vale poate intra din nou și alege iar
      const inainte = (cfg().inainteDeLupta || []).find((x) => x.nivel === n.id && joc.date.dialoguri?.[x.dialog] && verifica(x.conditii, context(joc.stare)));
      if (inainte) return joc.dialogApoi(joc.date.dialoguri[inainte.dialog], lupta);
      lupta();
    }

    alegeNivelul();
  }

  // După luptă (efectul „groapa”): banii nivelului, reputația (satul se uită de după gard), răsplata primei victorii
  // pe fiecare nivel și, cât e misiunea „Inelul mamei”, inelul (decis de autor: prima victorie, oricare nivel);
  // apoi ce mai cer misiunile (dintele de orc, ciocanul lui Bram)
  function rezultat({ nivel: id, rezultat: r }) {
    const n = nivel(id);
    if (!n) return;
    const s = joc.stare;
    if (r !== 'victorie') return aplicaEfecte({ contor: { groapa_infrangeri: 1 } }, joc);
    const prima = s.stari?.[`groapa_${id}`] !== 'castigat';
    aplicaEfecte({ bani: n.bani || 0, reputatie: n.reputatie || 0, contor: { groapa_victorii: 1 }, stare: { [`groapa_${id}`]: 'castigat' }, ...(prima && n.primaData ? { obiect: n.primaData } : {}) }, joc);
    // „inel” (verigheta mamei) și „dupaVictorie” (ce mai cer misiunile: dintele de orc pentru Wil, prietenul lui Finn).
    // Condițiile se verifică toate înainte, ca o victorie să nu dea deodată două lucruri care se bat cap în cap
    // „nivel” la o intrare: doar după o victorie pe nivelul acela (ciocanul lui Bram, doar pe greu)
    const ctx = context(s);
    const deDat = [cfg().inel, ...(cfg().dupaVictorie || [])].filter((x) => x && (!x.nivel || x.nivel === id) && verifica(x.conditii, ctx));
    // Un singur eveniment pe seară: un al doilea n-ar mai porni cât ține discuția primului (s-ar pierde), așa că
    // așteaptă victoria următoare; ordinea din config.json spune care vine întâi
    let cuEveniment = false;
    for (const x of deDat) {
      if (x.efecte?.eveniment) {
        if (cuEveniment) continue;
        cuEveniment = true;
      }
      aplicaEfecte(x.efecte, joc);
    }
  }

  return { deschide, rezultat };
}
