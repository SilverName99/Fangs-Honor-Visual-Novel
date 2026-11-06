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
  ['sunete/ambianta', 'Sunete: locurile'],
  ['sunete/efecte', 'Sunete: efecte'],
  ['sunete/muzica', 'Sunete: muzică'],
];
const NUME_OK = /^[a-z0-9]+(?:_[a-z0-9]+)*\.(png|mp3)$/;
// Sunetele se încarcă la fel ca imaginile, dar doar ca MP3 (merg în orice browser și în .exe)
const eSunet = (nume) => /\.mp3$/i.test(nume);
const fisierBun = (f) => f.type === 'image/png' || f.type === 'audio/mpeg' || /\.(png|mp3)$/i.test(f.name);
// Cartonașul: imaginea, sau pentru un sunet butonul de ascultat
const previzualizare = (cale, v) =>
  eSunet(cale) ? `<audio class="sunet-card" controls preload="none" src="${urlImagine(cale)}?v=${v}"></audio>` : `<img loading="lazy" src="${urlImagine(cale)}?v=${v}">`;

const esc = (t) => String(t).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// „Vale Supărat.PNG” devine „vale_suparat.png”: autorul nu trebuie să țină minte regulile de nume
export function numeCorect(nume) {
  const baza = nume
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\.(png|jpe?g|webp|mp3)$/, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return eSunet(nume) ? `${baza || 'sunet'}.mp3` : `${baza || 'imagine'}.png`;
}

export function creeazaGalerie(container, comun, reincarcaImagini) {
  const asteptare = [];
  let cerute = imaginiCerute(comun.date, comun.lume);
  const cerutePeCale = () => new Map(cerute.map((c) => [c.cale, c]));

  // Același nume poate fi cerut în două categorii (fierar_ranit.png: portret și poză de luptă);
  // se alege întâi cea încă neîncărcată, ca să nu se înlocuiască din greșeală imaginea care există deja
  const potriviri = (nume) => cerute.filter((c) => c.cale.endsWith(`/${nume}`));
  function ghicesteCategoria(nume) {
    const toate = potriviri(nume);
    const potrivire = toate.find((c) => !comun.imagini.has(c.cale)) || toate[0];
    if (potrivire) return potrivire.categorie;
    if (nume.startsWith('ui_')) return 'ui';
    return '';
  }

  function adaugaFisiere(fisiere) {
    const respinse = [];
    for (const f of fisiere) {
      if (!fisierBun(f)) {
        respinse.push(f.name);
        continue;
      }
      const nume = numeCorect(f.name);
      asteptare.push({ fisier: f, nume, categorie: ghicesteCategoria(nume), url: URL.createObjectURL(f) });
    }
    if (respinse.length) alert(`Doar imagini PNG și sunete MP3. Nu am adăugat:\n${respinse.join('\n')}`);
    arata();
  }

  function verificaRand(r) {
    const cale = `${r.categorie}/${r.nume}`;
    if (!NUME_OK.test(r.nume)) return { ok: false, text: 'Nume invalid: doar litere mici, cifre și _ (fără diacritice), terminat în .png (sau .mp3 la sunete)' };
    if (!r.categorie) return { ok: false, text: 'Alege categoria.' };
    if (eSunet(r.nume) !== r.categorie.startsWith('sunete/')) return { ok: false, text: 'Sunetele merg la categoriile „Sunete”, imaginile la celelalte.' };
    const c = cerutePeCale().get(cale);
    const exista = comun.imagini.has(cale);
    const parti = [];
    if (c) parti.push(`<span class="bine">✓ ${esc(c.scop)}</span>`);
    else parti.push('<span class="avertisment">Jocul nu cere încă acest nume (verifică dacă e scris bine).</span>');
    const altele = potriviri(r.nume).filter((x) => x.categorie !== r.categorie);
    if (altele.length) parti.push(`<span class="avertisment">Numele ăsta e cerut și la: ${altele.map((x) => esc(x.scop)).join(', ')}. Verifică categoria!</span>`);
    if (exista) parti.push('<span class="avertisment">Înlocuiește imaginea existentă (cea veche se mută în coș, pe server).</span>');
    return { ok: true, text: parti.join(' ') };
  }

  async function incarcaDirect(cale, fisier) {
    if (!fisier) return;
    if (eSunet(cale) ? !/\.mp3$/i.test(fisier.name) && fisier.type !== 'audio/mpeg' : fisier.type !== 'image/png' && !fisier.name.toLowerCase().endsWith('.png'))
      return alert(eSunet(cale) ? 'Aici merge doar un fișier MP3.' : 'Doar fișiere PNG.');
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
    const inchiseImplicit = new Set(['Portrete', 'Luptă', 'Obiecte', 'Interfață', 'Sunete: locurile', 'Sunete: efecte', 'Sunete: muzică']);
    // Pozele de luptă au mărimea lor în procente; hărțile de luptă au butonul spre locurile luptătorilor
    const marimi = comun.date.aranjare?.marimi_lupta?.marimi || {};
    const marimiHarti = comun.date.aranjare?.marimi_lupta?.harti || {};
    const marimiImaginiHarti = comun.date.aranjare?.marimi_lupta?.imaginiHarti || {};
    // Zonele de luptă (hărțile): fiecare poză de luptă are mărimea ei pe fiecare zonă
    const zoneLupta = [...comun.lume.values()].filter((d) => d.tip === 'lupta').map((d) => [d.id, d.titlu.replace('Luptă: ', '')]);
    // Imaginile folosite și ca armă aruncată în luptă (glaive-ul Kaiei) au și ele mărimea lor în luptă
    const proiectile = new Set(comun.date.npcs.personaje.map((p) => p.lupta?.atac?.proiectil).filter(Boolean));
    // La fel efectele puterilor (scutul de lumină)
    const efecte = new Set(comun.date.npcs.personaje.flatMap((p) => (p.lupta?.abilitati || []).map((a) => a.imagine)).filter(Boolean));
    const extraCard = (c) => {
      if (proiectile.has(c.cale))
        return `<label class="marime-lupta" title="Cât de mare se vede arma aruncată în luptă (100% = normal)">Mărime în luptă (aruncat)
          <input type="number" min="20" max="400" step="5" data-marime="${esc(c.cale)}" value="${marimi[c.cale] ?? 100}">%</label>`;
      if (efecte.has(c.cale))
        return `<label class="marime-lupta" title="Cât de mare se vede efectul în luptă, față de personaj (100% = normal)">Mărime în luptă
          <input type="number" min="20" max="400" step="5" data-marime="${esc(c.cale)}" value="${marimi[c.cale] ?? 100}">%</label>`;
      // Pe fiecare zonă de luptă, cât de mare se vede poza (implicit, mărimea ei veche, generală)
      if (c.cale.startsWith('combat/'))
        return zoneLupta
          .map(
            ([id, nume]) => `<label class="marime-lupta" title="Cât de mare se vede poza în luptă pe zona asta (100% = normal)">${esc(nume)}
              <input type="number" min="20" max="400" step="5" data-marime-img-harta="${esc(c.cale)}|${esc(id)}" value="${marimiImaginiHarti[c.cale]?.[id] ?? marimi[c.cale] ?? 100}">%</label>`,
          )
          .join('');
      if (c.grup === 'Hărți de luptă') {
        const id = c.cale.split('/').pop().replace(/\.png$/, '');
        return `<label class="marime-lupta" title="Cât de mari se văd toți luptătorii pe harta asta (100% = normal)">Mărimea personajelor aici
            <input type="number" min="20" max="300" step="5" data-marime-harta="${esc(id)}" value="${marimiHarti[id] ?? 100}">%</label>
          <button class="btn locuri-lupta" data-scena="${esc(id)}">Aranjează locurile luptătorilor</button>`;
      }
      return '';
    };
    const carduri = (lista) =>
      lista
        .map((c) =>
          comun.imagini.has(c.cale)
            ? `<div class="card" title="${esc(c.scop)}">
                ${previzualizare(c.cale, comun.imagini.get(c.cale))}
                <div class="cale">${esc(c.cale)}</div>
                <div class="actiuni"><span class="sumar">${esc(c.scop)}</span><button class="btn pericol sterge" data-cale="${esc(c.cale)}">Șterge</button></div>
                ${extraCard(c)}
              </div>`
            : `<div class="card card-lipsa ${c.optional ? 'optional' : ''}" data-cale="${esc(c.cale)}" title="Trage un PNG aici: se încarcă direct cu numele ăsta">
                <div class="loc-lipsa">${c.optional ? 'opțional' : 'lipsă'}<br><small>trage ${eSunet(c.cale) ? 'MP3-ul' : 'PNG-ul'} aici<br>sau</small><button class="btn alege-aici">Alege fișierul</button></div>
                <div class="cale"><a href="#" class="copiaza" data-nume="${esc(c.cale.split('/').pop())}">${esc(c.cale)}</a></div>
                <div class="sumar">${esc(c.scop)}</div>
                ${c.grup === 'Hărți de luptă' ? extraCard(c) : ''}
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
      <h2>Încarcă imagini și sunete</h2>
      <div class="zona-drop">Trage aici fișierele PNG (sau sunetele MP3) ori apasă ca să le alegi.<br><small>Numele se corectează singure (litere mici, fără diacritice, cu _). Poți trage multe deodată.</small></div>
      <input type="file" multiple accept="image/png,audio/mpeg,.mp3" hidden>
      ${
        asteptare.length
          ? `<div class="asteptare">${asteptare
              .map((r, i) => {
                const v = verificaRand(r);
                return `<div class="rand-asteptare" data-i="${i}">
                  ${eSunet(r.nume) ? `<audio class="miniatura" controls preload="none" src="${r.url}"></audio>` : `<img class="miniatura" src="${r.url}">`}
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
                (cale) => `<div class="card">${previzualizare(cale, comun.imagini.get(cale))}<div class="cale">${esc(cale)}</div>
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
        i.accept = eSunet(cale) ? 'audio/mpeg,.mp3' : 'image/png';
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
    for (const b of container.querySelectorAll('.locuri-lupta')) {
      b.onclick = () => document.dispatchEvent(new CustomEvent('deschide-aranjare', { detail: b.dataset.scena }));
    }
    // Mărimea armei aruncate („marimi”), a tuturor luptătorilor de pe o hartă („harti”) și a fiecărei poze
    // de luptă pe fiecare zonă („imaginiHarti”) stau în același fișier
    for (const i of container.querySelectorAll('[data-marime], [data-marime-harta], [data-marime-img-harta]')) {
      i.onchange = async () => {
        const v = Math.max(20, Math.min(400, Math.round(Number(i.value) || 100)));
        i.value = v;
        const a = structuredClone(comun.date.aranjare.marimi_lupta || {});
        if (i.dataset.marimeImgHarta) {
          // Se ține mereu valoarea (și 100), ca să bată mărimea veche, generală, a pozei
          const [cale, harta] = i.dataset.marimeImgHarta.split('|');
          ((a.imaginiHarti ||= {})[cale] ||= {})[harta] = v;
        } else {
          const lista = (a[i.dataset.marime ? 'marimi' : 'harti'] ||= {});
          const cheie = i.dataset.marime || i.dataset.marimeHarta;
          if (v === 100) delete lista[cheie];
          else lista[cheie] = v;
        }
        i.disabled = true;
        try {
          await api('aranjare/marimi_lupta', { method: 'PUT', body: JSON.stringify(a), headers: { 'Content-Type': 'application/json' } });
          comun.date.aranjare.marimi_lupta = a;
        } catch (e) {
          alert(`Nu s-a salvat mărimea:\n${e.message}`);
        }
        i.disabled = false;
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
