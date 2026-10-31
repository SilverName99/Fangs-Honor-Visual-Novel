import { api } from './api.js';
import { imaginiCerute } from '../src/lume.js';
import { urlImagine, uitaLipsurile } from '../src/imagini.js';

const CATEGORII = [
  ['map', 'Harta'],
  ['map/piese', 'Piese pe hartă'],
  ['locations', 'Zone și locuri'],
  ['events', 'Evenimente'],
  ['sprites', 'Sprite-uri'],
  ['portraits', 'Portrete'],
  ['combat', 'Luptă'],
  ['items', 'Obiecte'],
  ['ui', 'Interfață'],
];
const NUME_OK = /^[a-z0-9]+(?:_[a-z0-9]+)*\.png$/;

const esc = (t) => String(t).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// „Vale Supărat.PNG” devine „vale_suparat.png”: autorul nu trebuie să țină minte regulile de nume
export function numeCorect(nume) {
  const baza = nume
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\.(png|jpe?g|webp)$/, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return `${baza || 'imagine'}.png`;
}

export function creeazaGalerie(container, comun, reincarcaImagini) {
  const asteptare = [];
  let cerute = imaginiCerute(comun.date, comun.lume);
  const cerutePeCale = () => new Map(cerute.map((c) => [c.cale, c]));

  function ghicesteCategoria(nume) {
    const potrivire = cerute.find((c) => c.cale.endsWith(`/${nume}`));
    if (potrivire) return potrivire.categorie;
    if (nume.startsWith('ui_')) return 'ui';
    return '';
  }

  function adaugaFisiere(fisiere) {
    const respinse = [];
    for (const f of fisiere) {
      if (f.type !== 'image/png' && !f.name.toLowerCase().endsWith('.png')) {
        respinse.push(f.name);
        continue;
      }
      const nume = numeCorect(f.name);
      asteptare.push({ fisier: f, nume, categorie: ghicesteCategoria(nume), url: URL.createObjectURL(f) });
    }
    if (respinse.length) alert(`Doar fișiere PNG. Nu am adăugat:\n${respinse.join('\n')}`);
    arata();
  }

  function verificaRand(r) {
    const cale = `${r.categorie}/${r.nume}`;
    if (!NUME_OK.test(r.nume)) return { ok: false, text: 'Nume invalid: doar litere mici, cifre și _ (fără diacritice), terminat în .png' };
    if (!r.categorie) return { ok: false, text: 'Alege categoria.' };
    const c = cerutePeCale().get(cale);
    const exista = comun.imagini.has(cale);
    const parti = [];
    if (c) parti.push(`<span class="bine">✓ ${esc(c.scop)}</span>`);
    else parti.push('<span class="avertisment">Jocul nu cere încă acest nume (verifică dacă e scris bine).</span>');
    if (exista) parti.push('<span class="avertisment">Înlocuiește imaginea existentă.</span>');
    return { ok: true, text: parti.join(' ') };
  }

  async function incarcaDirect(cale, fisier) {
    if (!fisier) return;
    if (fisier.type !== 'image/png' && !fisier.name.toLowerCase().endsWith('.png')) return alert('Doar fișiere PNG.');
    try {
      await api(`imagini/${cale}`, { method: 'PUT', body: fisier });
    } catch (e) {
      alert(`Nu s-a încărcat: ${e.message}`);
    }
    await reincarcaImagini();
    uitaLipsurile();
    arata();
  }

  async function incarcaToate(buton) {
    buton.disabled = true;
    const erori = [];
    for (const r of [...asteptare]) {
      if (!verificaRand(r).ok) continue;
      try {
        await api(`imagini/${r.categorie}/${r.nume}`, { method: 'PUT', body: r.fisier });
        URL.revokeObjectURL(r.url);
        asteptare.splice(asteptare.indexOf(r), 1);
      } catch (e) {
        erori.push(`${r.nume}: ${e.message}`);
      }
    }
    await reincarcaImagini();
    uitaLipsurile();
    arata();
    if (erori.length) alert(`Unele imagini nu s-au încărcat:\n${erori.join('\n')}`);
  }

  const deschise = new Set();
  function arata() {
    cerute = imaginiCerute(comun.date, comun.lume);
    const obligatorii = cerute.filter((c) => !c.optional);
    const lipsaObl = obligatorii.filter((c) => !comun.imagini.has(c.cale));
    const cerutSet = cerutePeCale();
    const incarcate = [...comun.imagini.keys()].sort();

    // Grupurile în ordinea jocului: harta, zonele, apoi restul; zonele stau deschise, listele lungi închise
    const grupuri = [...new Set(cerute.map((c) => c.grup))];
    const inchiseImplicit = new Set(['Portrete', 'Luptă', 'Obiecte', 'Interfață']);
    const carduri = (lista) =>
      lista
        .map((c) =>
          comun.imagini.has(c.cale)
            ? `<div class="card" title="${esc(c.scop)}">
                <img loading="lazy" src="${urlImagine(c.cale)}?v=${comun.imagini.get(c.cale)}">
                <div class="cale">${esc(c.cale)}</div>
                <div class="actiuni"><span class="sumar">${esc(c.scop)}</span><button class="btn pericol sterge" data-cale="${esc(c.cale)}">Șterge</button></div>
              </div>`
            : `<div class="card card-lipsa ${c.optional ? 'optional' : ''}" data-cale="${esc(c.cale)}" title="Trage un PNG aici: se încarcă direct cu numele ăsta">
                <div class="loc-lipsa">${c.optional ? 'opțional' : 'lipsă'}<br><small>trage PNG-ul aici<br>sau</small><button class="btn alege-aici">Alege fișierul</button></div>
                <div class="cale"><a href="#" class="copiaza" data-nume="${esc(c.cale.split('/').pop())}">${esc(c.cale)}</a></div>
                <div class="sumar">${esc(c.scop)}</div>
              </div>`,
        )
        .join('');
    const sectiuneGrup = (g) => {
      // Încărcate primele, apoi ce lipsește (obligatoriile înaintea opționalelor)
      const lista = cerute
        .filter((c) => c.grup === g)
        .sort((a, b) => Number(!comun.imagini.has(a.cale)) - Number(!comun.imagini.has(b.cale)) || Number(a.optional) - Number(b.optional));
      const obl = lista.filter((c) => !c.optional);
      const gataObl = obl.filter((c) => comun.imagini.has(c.cale)).length;
      const gataOpt = lista.filter((c) => c.optional && comun.imagini.has(c.cale)).length;
      const complet = gataObl === obl.length;
      return `<details class="grup-galerie" data-grup="${esc(g)}" ${inchiseImplicit.has(g) && !deschise.has(g) ? '' : 'open'}>
        <summary><b>${esc(g)}</b> <span class="${complet ? 'bine' : 'avertisment'}">${gataObl} / ${obl.length} obligatorii</span>
        <span class="sumar">· ${gataOpt} / ${lista.length - obl.length} opționale</span></summary>
        <div class="grila">${carduri(lista)}</div></details>`;
    };
    const nefolosite = incarcate.filter((c) => !cerutSet.has(c));

    // Reafișarea (după încărcare sau ștergere) păstrează locul din pagină, nu sare înapoi sus
    const zone = container.querySelector('.coloana-zone');
    const derulare = zone ? zone.scrollTop : 0;
    container.innerHTML = `
      <div class="galerie-impartita"><aside class="coloana-incarcare">
      <h2>Încarcă imagini</h2>
      <div class="zona-drop">Trage aici fișierele PNG sau apasă ca să le alegi.<br><small>Numele se corectează singure (litere mici, fără diacritice, cu _).</small></div>
      <input type="file" multiple accept="image/png" hidden>
      ${
        asteptare.length
          ? `<div class="asteptare">${asteptare
              .map((r, i) => {
                const v = verificaRand(r);
                return `<div class="rand-asteptare" data-i="${i}">
                  <img class="miniatura" src="${r.url}">
                  <div class="campuri-asteptare">
                    <input type="text" class="nume" value="${esc(r.nume)}">
                    <select class="categorie"><option value="">Alege categoria...</option>${CATEGORII.map(([c, e]) => `<option value="${c}" ${c === r.categorie ? 'selected' : ''}>${esc(e)}</option>`).join('')}</select>
                    <div class="${v.ok ? '' : 'greseala'}">${v.text}</div>
                  </div>
                  <button class="btn scoate">✕</button></div>`;
              })
              .join('')}</div>
            <div class="salvare"><button class="btn principal incarca">Încarcă ${asteptare.length === 1 ? 'imaginea' : `toate (${asteptare.length})`}</button><button class="btn goleste">Golește lista</button></div>`
          : ''
      }

      <p class="sumar">${obligatorii.length - lipsaObl.length} din ${obligatorii.length} imagini obligatorii sunt încărcate.</p>
      <p class="sumar">Opționalele (variante de noapte, stări de portret, interfață) au rezervă: fără ele jocul folosește imaginea de bază sau stilul implicit.</p>
      <p class="sumar">Mai simplu: trage un PNG direct pe cartonașul lipsă din dreapta și se încarcă cu numele potrivit.</p>
      </aside><div class="coloana-zone">
      <h2>Imagini pe zone</h2>
      ${grupuri.map(sectiuneGrup).join('')}
      ${
        nefolosite.length
          ? `<details class="grup-galerie" open><summary><b>Nefolosite</b> <span class="sumar">· ${nefolosite.length} încărcate, dar niciun loc din joc nu le cere (verifică numele)</span></summary>
            <div class="grila">${nefolosite
              .map(
                (cale) => `<div class="card"><img loading="lazy" src="${urlImagine(cale)}?v=${comun.imagini.get(cale)}"><div class="cale">${esc(cale)}</div>
                <div class="actiuni"><span class="eticheta-mica">nefolosită</span><button class="btn pericol sterge" data-cale="${esc(cale)}">Șterge</button></div></div>`,
              )
              .join('')}</div></details>`
          : ''
      }</div></div>`;

    container.querySelector('.coloana-zone').scrollTop = derulare;
    // Un PNG tras pe un cartonaș lipsă se încarcă direct cu numele lui (fără redenumire, fără categorie)
    for (const card of container.querySelectorAll('.card-lipsa')) {
      const cale = card.dataset.cale;
      card.ondragover = (e) => {
        e.preventDefault();
        card.classList.add('peste');
      };
      card.ondragleave = () => card.classList.remove('peste');
      card.ondrop = (e) => {
        e.preventDefault();
        card.classList.remove('peste');
        incarcaDirect(cale, e.dataTransfer.files[0]);
      };
      card.querySelector('.alege-aici').onclick = () => {
        const i = document.createElement('input');
        i.type = 'file';
        i.accept = 'image/png';
        i.onchange = () => incarcaDirect(cale, i.files[0]);
        i.click();
      };
    }
    for (const d of container.querySelectorAll('.grup-galerie[data-grup]')) {
      d.ontoggle = () => (d.open ? deschise.add(d.dataset.grup) : deschise.delete(d.dataset.grup));
    }
    const drop = container.querySelector('.zona-drop');
    const input = container.querySelector('input[type=file]');
    drop.onclick = () => input.click();
    input.onchange = () => adaugaFisiere([...input.files]);
    drop.ondragover = (e) => {
      e.preventDefault();
      drop.classList.add('peste');
    };
    drop.ondragleave = () => drop.classList.remove('peste');
    drop.ondrop = (e) => {
      e.preventDefault();
      drop.classList.remove('peste');
      adaugaFisiere([...e.dataTransfer.files]);
    };

    for (const tr of container.querySelectorAll('.rand-asteptare[data-i]')) {
      const r = asteptare[Number(tr.dataset.i)];
      tr.querySelector('.nume').onchange = (e) => {
        r.nume = numeCorect(e.target.value);
        // Un nume cerut de joc știe unde îi e locul, deci categoria se corectează odată cu numele
        r.categorie = ghicesteCategoria(r.nume) || r.categorie;
        arata();
      };
      tr.querySelector('.categorie').onchange = (e) => {
        r.categorie = e.target.value;
        arata();
      };
      tr.querySelector('.scoate').onclick = () => {
        URL.revokeObjectURL(r.url);
        asteptare.splice(asteptare.indexOf(r), 1);
        arata();
      };
    }
    container.querySelector('.incarca')?.addEventListener('click', (e) => incarcaToate(e.currentTarget));
    container.querySelector('.goleste')?.addEventListener('click', () => {
      asteptare.splice(0).forEach((r) => URL.revokeObjectURL(r.url));
      arata();
    });
    for (const a of container.querySelectorAll('.copiaza')) {
      a.onclick = async (e) => {
        e.preventDefault();
        await navigator.clipboard?.writeText(a.dataset.nume).catch(() => {});
        a.textContent = `${a.textContent.replace(/ ✓ copiat$/, '')} ✓ copiat`;
      };
    }
    for (const b of container.querySelectorAll('.sterge')) {
      b.onclick = async () => {
        if (!confirm(`Ștergi ${b.dataset.cale}?\n(Fișierul se mută în coșul de pe server, nu se pierde de tot.)`)) return;
        await api(`imagini/${b.dataset.cale}`, { method: 'DELETE' });
        await reincarcaImagini();
        uitaLipsurile();
        arata();
      };
    }
  }

  return { arata };
}
