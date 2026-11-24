// Tab-ul „Traduceri” (cerut de autor): toate textele jocului, în română și în engleză, alăturate, pe căsuțe (dialogurile
// fiecărui personaj, misiunile, evenimentele, obiectele, locurile, interfața). Autorul poate schimba orice text, în
// oricare limbă: schimbarea se salvează în data/aranjare/texte.json (editorul scrie doar în data/aranjare/, ca să nu
// se încurce cu Claude) și are întâietate în joc. Textele de bază (data/*.json, cu engleza în cheile „_en”, și
// data/texte_ui.json pentru textele din cod) le scrie Claude.
// O schimbare ține minte și textul românesc peste care a fost făcută („baza”): dacă replica se schimbă apoi în date,
// jocul păstrează textul nou, iar aici schimbarea apare „de revăzut”.
import { api } from './api.js';

const CHEIE_DESCHISE = 'editor-traduceri-deschise';
const MAX_REZULTATE = 300;
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Căutarea nu ține cont de diacritice și de litere mari („acoperis” găsește „Acoperișul”)
const simplu = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const CATEGORII = [
  ['dialoguri', 'Dialogurile'],
  ['misiuni', 'Misiunile (cartea)'],
  ['events', 'Evenimentele'],
  ['npcs', 'Personajele (nume, cartea personajelor)'],
  ['items', 'Obiectele'],
  ['locations', 'Locurile și acțiunile'],
  ['lupte', 'Luptele'],
  ['config', 'Reglajele (munca, taxa, zarurile, Masa regelui, Groapa)'],
  ['ui', 'Interfața (butoane, mesaje)'],
];

function citesteDeschise() {
  try {
    return JSON.parse(localStorage.getItem(CHEIE_DESCHISE)) || {};
  } catch {
    return {};
  }
}

export function creeazaTraduceri(container, comun, verificaSincronizarea) {
  const { date } = comun;
  // Ce a schimbat autorul până acum (copia de lucru; se trimite întreagă la salvare)
  const suprascrieri = structuredClone(date.aranjare.texte || {});
  const deschise = citesteDeschise();
  let filtru = 'toate';
  let cautare = '';
  let desenat = false;

  const numePersonaj = (id) => date.npcs.personaje.find((p) => p.id === id)?.nume || id;
  const misiune = (id) => date.misiuni.misiuni.find((m) => m.id === id);
  const eveniment = (id) => date.events.evenimente.find((e) => e.id === id);

  // Căsuța unui text, după calea lui: dialogul, misiunea, evenimentul... (o căsuță = un lucru din joc)
  function grup(cale) {
    const b = cale.split('/');
    const cat = b[0];
    if (cat === 'dialoguri') {
      const d = date.dialoguri[b[1]];
      const cine = d?.partener ? numePersonaj(d.partener) : '';
      return { cat, id: `dialoguri/${b[1]}`, nume: [cine, d?.grup || b[1]].filter(Boolean).join(' · ') };
    }
    if (cat === 'misiuni') {
      const id = b[2]?.replace(/^#/, '');
      return { cat, id: `misiuni/${id}`, nume: misiune(id) ? `${misiune(id).titlu} (${numePersonaj(misiune(id).dela)})` : id };
    }
    if (cat === 'events') {
      const id = b[2]?.replace(/^#/, '');
      return { cat, id: `events/${id}`, nume: eveniment(id)?.nume || id };
    }
    if (cat === 'npcs') {
      const id = b[2]?.replace(/^#/, '');
      return { cat, id: `npcs/${id || 'altele'}`, nume: id ? numePersonaj(id) : 'Altele' };
    }
    if (cat === 'items') return { cat, id: `items/${b[2]}`, nume: date.items.obiecte?.[b[2]]?.nume || b[2] };
    if (cat === 'locations') {
      const id = b[1] === 'zone' ? b[2]?.replace(/^#/, '') : b[1];
      const z = date.locations.zone.find((x) => x.id === id);
      return { cat, id: `locations/${id}`, nume: z?.nume || (b[1] === 'harti' ? 'Hărțile' : b[1] === 'harta' ? 'Harta satului' : id) };
    }
    if (cat === 'lupte') {
      const id = b[1] === 'lupte' ? b[2] : b[1];
      return { cat, id: `lupte/${id}`, nume: date.lupte.lupte?.[id]?.nume || id };
    }
    if (cat === 'config') return { cat, id: `config/${b[1]}`, nume: b[1] };
    return { cat: 'ui', id: 'ui', nume: 'Textele din cod' };
  }

  // Ce scrie deasupra fiecărui text: unde stă (replica, alegerea, pasul) și cine vorbește, pe înțeles
  const NUME_CAMP = { titlu: 'titlul', descriere: 'descrierea', text: 'textul', sfat: 'sfatul din carte', nume: 'numele', numeScurt: 'numele scurt', grup: 'numele din galerie', mesaj: 'mesajul de pe ecran' };
  function context(x) {
    const b = x.cale.split('/');
    if (x.cale.startsWith('ui/')) return '';
    const cine = x.context?.vorbitor ? ` · <b>${esc(numePersonaj(x.context.vorbitor))}</b>` : '';
    if (b[0] === 'dialoguri' && b[2] === 'noduri') {
      const alegere = b[4] === 'alegeri' ? ` · alegerea ${Number(b[5]) + 1}` : '';
      const varianta = b[4] === 'text' && b[5] != null ? ` · varianta ${Number(b[5]) + 1}` : '';
      return `replica <b>${esc(b[3])}</b>${alegere}${varianta}${alegere ? '' : cine}`;
    }
    // Misiunile, evenimentele, personajele: după numele căsuței, doar câmpul („pasul 1: sfatul din carte”)
    const coada = b.slice(b[0] === 'dialoguri' ? 2 : 3);
    const text = coada
      .map((p, i) => (coada[i - 1] === 'pasi' || coada[i - 1] === 'subpasi' ? `${Number(p) + 1}:` : /^\d+$/.test(p) ? `(${Number(p) + 1})` : NUME_CAMP[p] || p.replace(/^#/, '')))
      .join(' ')
      .replace(/\bpasi (\d+):/, 'pasul $1:')
      .replace(/\bsubpasi (\d+):/, 'bucata $1:');
    return `${esc(text)}${cine}`;
  }

  // Toate textele: cele din date (perechile adunate la pornire) și cele din cod (dicționarul)
  function texte() {
    const dinDate = comun.texte.map((x) => ({ cale: x.cale, roBaza: x.roBaza ?? x.ro, enBaza: x.enBaza ?? x.en ?? '', context: x.context }));
    const dinCod = Object.entries(date.texte_ui?.texte || {}).map(([ro, en]) => ({ cale: `ui/${ro}`, roBaza: ro, enBaza: en || '' }));
    return [...dinDate, ...dinCod].map((x) => {
      const s = suprascrieri[x.cale];
      const depasit = !!s && s.baza != null && s.baza !== x.roBaza;
      const ro = s && !depasit && s.ro != null ? s.ro : x.roBaza;
      const en = s && !depasit && s.en != null ? s.en : x.enBaza;
      return { ...x, ro, en, schimbat: !!s && !depasit, depasit, s, grup: grup(x.cale) };
    });
  }

  const trecePrinFiltru = (x) =>
    (filtru === 'toate' || (filtru === 'fara' && !x.en.trim()) || (filtru === 'schimbate' && x.schimbat) || (filtru === 'revazut' && x.depasit)) &&
    (!cautare || simplu(`${x.ro} ${x.en} ${x.cale} ${x.grup.nume}`).includes(cautare));

  function randHtml(x) {
    const clase = ['rand-traducere', !x.en.trim() && 'fara-en', x.schimbat && 'schimbat', x.depasit && 'depasit'].filter(Boolean).join(' ');
    const randuri = (t) => Math.min(8, Math.max(2, Math.ceil(String(t).length / 70)));
    return `<div class="${clase}" data-cale="${esc(x.cale)}">
      <div class="context-traducere">${context(x)}
        ${x.schimbat ? '<span class="eticheta-traducere">schimbat de tine</span>' : ''}
        ${x.depasit ? `<span class="eticheta-traducere rosie" title="${esc(`Ai scris: ${x.s.ro ?? ''} / ${x.s.en ?? ''}`)}">replica s-a schimbat în date: de revăzut</span>` : ''}
        ${!x.en.trim() ? '<span class="eticheta-traducere gri">fără engleză</span>' : ''}</div>
      <div class="campuri-traducere">
        <label><span>Română</span><textarea data-limba="ro" rows="${randuri(x.ro)}">${esc(x.ro)}</textarea></label>
        <label><span>English</span><textarea data-limba="en" rows="${randuri(x.en || x.ro)}">${esc(x.en)}</textarea></label>
      </div>
      <div class="butoane-traducere">
        <button class="btn principal salveaza-traducere" hidden>Salvează</button>
        ${x.s ? '<button class="btn original-traducere">Înapoi la textul lui Claude</button>' : ''}
      </div>
    </div>`;
  }

  function deseneaza() {
    const toate = texte();
    const vizibile = toate.filter(trecePrinFiltru);
    const n = { toate: toate.length, fara: toate.filter((x) => !x.en.trim()).length, schimbate: toate.filter((x) => x.schimbat).length, revazut: toate.filter((x) => x.depasit).length };
    const filtre = [
      ['toate', `Toate (${n.toate})`],
      ['fara', `Fără engleză (${n.fara})`],
      ['schimbate', `Schimbate de tine (${n.schimbate})`],
      ['revazut', `De revăzut (${n.revazut})`],
    ];
    let corp;
    if (cautare || filtru !== 'toate') {
      // Căutare sau filtru: rezultatele, direct (fără căsuțe), cu numele căsuței deasupra fiecăruia
      const lista = vizibile.slice(0, MAX_REZULTATE);
      corp = lista.length
        ? `${vizibile.length > MAX_REZULTATE ? `<p class="ajutor">Primele ${MAX_REZULTATE} din ${vizibile.length}. Caută mai precis ca să le vezi pe celelalte.</p>` : ''}
          ${lista.map((x) => `<div class="grup-rezultat">${esc(x.grup.nume)}</div>${randHtml(x)}`).join('')}`
        : '<p class="ajutor">Nimic de arătat.</p>';
    } else {
      corp = CATEGORII.map(([cat, numeCat]) => {
        const grupuri = new Map();
        for (const x of toate.filter((y) => y.grup.cat === cat)) {
          if (!grupuri.has(x.grup.id)) grupuri.set(x.grup.id, { ...x.grup, texte: [] });
          grupuri.get(x.grup.id).texte.push(x);
        }
        if (!grupuri.size) return '';
        const casute = [...grupuri.values()].sort((a, b) => a.nume.localeCompare(b.nume, 'ro'));
        return `<h2 class="categorie-traduceri">${esc(numeCat)}</h2><div class="casute-traduceri">${casute
          .map((g) => {
            const fara = g.texte.filter((x) => !x.en.trim()).length;
            return `<details class="casuta-traducere" data-grup="${esc(g.id)}" ${deschise[g.id] ? 'open' : ''}>
              <summary><span class="nume-casuta-traducere">${esc(g.nume)}</span>
              <span class="numar-traducere ${fara ? 'incomplet' : 'complet'}">${g.texte.length - fara} / ${g.texte.length} traduse</span></summary>
              <div class="texte-casuta" data-incarcat="${deschise[g.id] ? '1' : ''}">${deschise[g.id] ? g.texte.map(randHtml).join('') : ''}</div>
            </details>`;
          })
          .join('')}</div>`;
      }).join('');
    }
    container.innerHTML = `<div class="traduceri">
      <header class="cap-traduceri">
        <input type="search" class="cauta-traduceri" placeholder="Caută (fără diacritice): o replică, un cuvânt, un nume..." value="${esc(cautare)}">
        <div class="filtre-traduceri">${filtre.map(([id, t]) => `<button class="btn ${filtru === id ? 'principal' : ''}" data-filtru="${id}">${t}</button>`).join('')}</div>
        <p class="ajutor">Schimbi un text (în română sau în engleză) și apeși „Salvează”: în joc se vede textul tău. „Înapoi la textul lui Claude” șterge schimbarea. Textele „fără engleză” apar în joc în română.</p>
      </header>
      <div class="corp-traduceri">${corp}</div>
    </div>`;
    lega();
  }

  // Căsuțele se umplu doar când se deschid (sunt mii de texte)
  function lega() {
    const cauta = container.querySelector('.cauta-traduceri');
    let temporizator;
    cauta.oninput = () => {
      clearTimeout(temporizator);
      temporizator = setTimeout(() => {
        cautare = simplu(cauta.value.trim());
        deseneaza();
        const c = container.querySelector('.cauta-traduceri');
        c.focus();
        c.setSelectionRange(c.value.length, c.value.length);
      }, 250);
    };
    for (const b of container.querySelectorAll('[data-filtru]'))
      b.onclick = () => {
        filtru = b.dataset.filtru;
        deseneaza();
      };
    for (const d of container.querySelectorAll('.casuta-traducere')) {
      d.ontoggle = () => {
        deschise[d.dataset.grup] = d.open;
        if (!d.open) delete deschise[d.dataset.grup];
        try {
          localStorage.setItem(CHEIE_DESCHISE, JSON.stringify(deschise));
        } catch {}
        const corp = d.querySelector('.texte-casuta');
        if (d.open && !corp.dataset.incarcat) {
          corp.innerHTML = texte().filter((x) => x.grup.id === d.dataset.grup).map(randHtml).join('');
          corp.dataset.incarcat = '1';
          legaRanduri(corp);
        }
      };
    }
    legaRanduri(container);
  }

  function legaRanduri(radacina) {
    for (const r of radacina.querySelectorAll('.rand-traducere')) {
      if (r.dataset.legat) continue;
      r.dataset.legat = '1';
      const salveaza = r.querySelector('.salveaza-traducere');
      for (const ta of r.querySelectorAll('textarea')) ta.oninput = () => (salveaza.hidden = false);
      salveaza.onclick = () => salveazaRand(r);
      const original = r.querySelector('.original-traducere');
      if (original) original.onclick = () => salveazaRand(r, true);
    }
  }

  async function salveazaRand(r, original = false) {
    const cale = r.dataset.cale;
    const x = texte().find((y) => y.cale === cale);
    if (!x) return;
    const ro = r.querySelector('[data-limba="ro"]').value;
    const en = r.querySelector('[data-limba="en"]').value;
    if (original || (ro === x.roBaza && en === x.enBaza)) delete suprascrieri[cale];
    else {
      const s = { baza: x.roBaza };
      if (ro !== x.roBaza) s.ro = ro;
      if (en !== x.enBaza) s.en = en;
      suprascrieri[cale] = s;
    }
    const butoane = r.querySelectorAll('button');
    butoane.forEach((b) => (b.disabled = true));
    try {
      await api('aranjare/texte', { method: 'PUT', body: JSON.stringify(suprascrieri), headers: { 'Content-Type': 'application/json' } });
      date.aranjare.texte = structuredClone(suprascrieri);
      verificaSincronizarea?.();
      // Doar rândul acesta se redesenează (restul paginii, cu ce era deschis și unde erai, rămâne la fel)
      const nou = texte().find((y) => y.cale === cale);
      const tmp = document.createElement('div');
      tmp.innerHTML = randHtml(nou);
      r.replaceWith(tmp.firstElementChild);
      legaRanduri(container);
    } catch (e) {
      alert(`Nu s-a putut salva: ${e.message}`);
      butoane.forEach((b) => (b.disabled = false));
    }
  }

  return {
    arata() {
      if (!desenat) deseneaza();
      desenat = true;
    },
  };
}
