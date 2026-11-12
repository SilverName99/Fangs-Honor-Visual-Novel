// Tab-ul „Misiuni” (cerut de autor): documentul docs/misiuni.md, arătat pe căsuțe (personaj → misiuni → detalii),
// citit direct din repo (intră în build ca text). Un convertor mic, doar pentru ce folosește documentul:
// titluri, liste, tabele, citate, linii, aldin, cursiv și `cod`
import text from '../docs/misiuni.md?raw';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = (s) =>
  esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<i>$2</i>');

function caHtml(md) {
  const linii = md.split('\n');
  const iesire = [];
  let lista = 0;
  const inchideListe = () => {
    while (lista > 0) (iesire.push('</ul>'), lista--);
  };
  for (let i = 0; i < linii.length; i++) {
    const l = linii[i];
    // Blocurile de cod sunt prompturile: fiecare cu butonul lui „Copiază”
    if (/^\s*```/.test(l)) {
      inchideListe();
      const cod = [];
      while (++i < linii.length && !/^\s*```/.test(linii[i])) cod.push(linii[i]);
      iesire.push(`<div class="prompt"><button class="btn copiaza">Copiază</button><pre>${esc(cod.join('\n'))}</pre></div>`);
      continue;
    }
    if (/^\s*\|/.test(l)) {
      inchideListe();
      const rand = [];
      while (i < linii.length && /^\s*\|/.test(linii[i])) rand.push(linii[i++]);
      i--;
      const celule = (r) => r.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const cap = celule(rand[0]);
      const corp = rand.slice(2).map(celule);
      iesire.push(`<table><tr>${cap.map((c) => `<th>${inline(c)}</th>`).join('')}</tr>${corp.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</table>`);
      continue;
    }
    const titlu = l.match(/^(#{1,4})\s+(.*)/);
    if (titlu) {
      inchideListe();
      iesire.push(`<h${titlu[1].length}>${inline(titlu[2])}</h${titlu[1].length}>`);
      continue;
    }
    const element = l.match(/^(\s*)(?:[-*]|\d+\.)\s+(.*)/);
    if (element) {
      const nivel = Math.floor(element[1].length / 2) + 1;
      while (lista < nivel) (iesire.push('<ul>'), lista++);
      while (lista > nivel) (iesire.push('</ul>'), lista--);
      iesire.push(`<li>${inline(element[2])}</li>`);
      continue;
    }
    inchideListe();
    if (/^---+\s*$/.test(l)) iesire.push('<hr>');
    else if (/^>\s?/.test(l)) iesire.push(`<blockquote>${inline(l.replace(/^>\s?/, ''))}</blockquote>`);
    else if (l.trim()) iesire.push(`<p>${inline(l)}</p>`);
  }
  inchideListe();
  return iesire.join('\n');
}

// Documentul se împarte după titluri: „## ” = o căsuță (un personaj sau o secțiune generală),
// „### ” = o misiune în căsuță. Așa autorul vede întâi doar personajele, apoi titlurile, apoi detaliile (cerut de autor).
function imparte(md) {
  const linii = md.split('\n');
  const inceput = [];
  const sectiuni = [];
  let s = null;
  let m = null;
  let inCod = false;
  for (const l of linii) {
    if (/^\s*```/.test(l)) inCod = !inCod;
    const h2 = !inCod && l.match(/^##\s+(.*)/);
    const h3 = !inCod && l.match(/^###\s+(.*)/);
    if (h2) {
      s = { titlu: h2[1].trim(), intro: [], misiuni: [] };
      m = null;
      sectiuni.push(s);
    } else if (h3 && s) {
      m = { titlu: h3[1].trim(), corp: [] };
      s.misiuni.push(m);
    } else if (m) m.corp.push(l);
    else if (s) s.intro.push(l);
    else inceput.push(l);
  }
  return { inceput, sectiuni };
}

const SEMNE = ['✅', '📝', '💡', '➡️'];
const semnul = (t) => SEMNE.find((e) => t.startsWith(e)) || '';
const faraSemn = (t) => t.replace(/^(✅|📝|💡|➡️)\s*/, '').trim();
// Fără diacritice și litere mari, ca „Bram” din rezumat să se potrivească cu „Bram Emberforge (fierarul)”
const norm = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const primulCuvant = (t) => norm(faraSemn(t)).split(' ')[0];
// „Fratele Elian” e „Elian” în tabelul încrederii: se caută după oricare cuvânt din nume
const cauta = (harta, titlu) => norm(titlu.replace(/\s*\(.*\)\s*$/, '')).split(' ').map((c) => harta[c]).find(Boolean);
// Ultimele linii goale și „---” de la sfârșitul unei bucăți nu-și au rostul într-o căsuță
const curata = (linii) => {
  const l = [...linii];
  while (l.length && (!l[l.length - 1].trim() || /^---+\s*$/.test(l[l.length - 1]))) l.pop();
  while (l.length && !l[0].trim()) l.shift();
  return l;
};

// Din „Cum apar misiunile, pe personaje”: pentru fiecare personaj, ce trebuie făcut ca să apară fiecare misiune.
// Se arată sub titlul misiunii, ca să nu mai fie nevoie de rezumatul separat.
function cumApar(sectiune) {
  const harta = {};
  let pers = null;
  for (const l of sectiune?.intro || []) {
    const p = l.match(/^\*\*([^*]+)\*\*\s*$/);
    if (p) {
      pers = primulCuvant(p[1]);
      harta[pers] = [];
      continue;
    }
    const e = pers && l.match(/^\s*\d+\.\s+(.*)/);
    if (!e) continue;
    const nume = [...e[1].matchAll(/\*\*([^*]+)\*\*/g)].map((x) => x[1]);
    // Ce urmează după ultimul nume aldin și după „: ” (poate fi și „** (nu e misiune): ...”)
    const coada = e[1].slice(e[1].lastIndexOf('**') + 2);
    const dupa = coada.includes(':') ? coada.slice(coada.indexOf(':') + 1).trim() : '';
    harta[pers].push({ nume, cum: dupa || e[1] });
  }
  return harta;
}

function incredereDin(sectiune) {
  const harta = {};
  for (const l of sectiune?.intro || []) {
    const c = l.trim().replace(/^\||\|$/g, '').split('|').map((x) => x.trim());
    const n = c[0]?.match(/^\*\*([^*]+)\*\*$/);
    if (!n || c.length < 3) continue;
    const x = c[2].match(/(\d+)\s*\/\s*10/);
    harta[primulCuvant(n[1])] = { surse: c[1], acum: x ? +x[1] : null };
  }
  return harta;
}

const CHEIE = 'editor-misiuni-deschise';
const citesteDeschise = () => {
  try {
    return JSON.parse(localStorage.getItem(CHEIE)) || {};
  } catch {
    return {};
  }
};
const scrieDeschise = (d) => {
  try {
    localStorage.setItem(CHEIE, JSON.stringify(d));
  } catch {}
};

export function arataMisiunile(container) {
  const { inceput, sectiuni } = imparte(text);
  const rezumat = sectiuni.find((s) => /^Cum apar misiunile/.test(s.titlu));
  const incr = sectiuni.find((s) => /^Încrederea/.test(s.titlu));
  const cum = cumApar(rezumat);
  const incredere = incredereDin(incr);
  // Căsuțele de personaje sunt secțiunile cu misiuni; restul (regulile, testarea, prologul) stau separat, mai jos
  const personaje = sectiuni.filter((s) => s.misiuni.length);
  const generale = sectiuni.filter((s) => !s.misiuni.length && s !== rezumat);
  const deschise = citesteDeschise();

  const casuta = (s, idx, general) => {
    const nume = s.titlu.replace(/\s*\(.*\)\s*$/, '');
    const rol = s.titlu.match(/\(([^)]*)\)/)?.[1] || '';
    const numar = {};
    for (const m of s.misiuni) {
      const e = semnul(m.titlu) || '•';
      numar[e] = (numar[e] || 0) + 1;
    }
    const inc = cauta(incredere, s.titlu);
    const romburi = inc?.acum != null ? `<span class="romburi">${'◆'.repeat(inc.acum)}<span class="gol">${'◆'.repeat(10 - inc.acum)}</span></span> ${inc.acum}/10` : '';
    const listaCum = cauta(cum, s.titlu) || [];
    const misiuni = s.misiuni
      .map((m, j) => {
        const titlu = faraSemn(m.titlu);
        // Titlul fără paranteză („Vânătoarea împreună (după Lupul negru)” nu e „Lupul negru”); întâi potrivirea exactă
        const n = norm(titlu.replace(/\s*\(.*\)\s*$/, ''));
        const potrivire =
          listaCum.find((x) => x.nume.some((y) => norm(y) === n)) ||
          listaCum.find((x) => x.nume.some((y) => n.startsWith(norm(y)) || norm(y).startsWith(n)));
        const id = `${idx}:${j}`;
        return `<details class="misiune-casuta" data-id="${id}" ${deschise[id] ? 'open' : ''}>
          <summary><span class="semn-misiune">${semnul(m.titlu) || '•'}</span><span class="titlu-misiune">${inline(titlu)}</span>
          ${potrivire ? `<span class="cum-apare">${inline(potrivire.cum)}</span>` : ''}</summary>
          <div class="detalii-misiune">${caHtml(curata(m.corp).join('\n'))}</div></details>`;
      })
      .join('');
    const intro = curata(s.intro);
    return `<div class="casuta ${general ? 'generala' : ''} ${deschise['c' + idx] ? 'deschisa' : ''}" data-idx="${idx}">
      <button class="cap-casuta">
        <span class="nume-casuta">${inline(nume)}</span>
        ${rol ? `<span class="rol-casuta">${inline(rol)}</span>` : ''}
        ${general ? '' : `<span class="stare-casuta">${Object.entries(numar).map(([e, k]) => `<span>${e} ${k}</span>`).join('')}</span>`}
        ${romburi ? `<span class="incredere-casuta">${romburi}</span>` : ''}
      </button>
      <div class="corp-casuta">
        ${intro.length ? `<div class="intro-casuta">${caHtml(intro.join('\n'))}</div>` : ''}
        ${inc?.surse ? `<p class="surse-incredere"><b>Încrederea:</b> ${inline(inc.surse)}</p>` : ''}
        ${misiuni}
      </div>
    </div>`;
  };

  container.innerHTML = `<article class="document-misiuni casute-misiuni">
    ${caHtml(curata(inceput).join('\n'))}
    <h2>Personajele</h2>
    <div class="grila-casute">${personaje.map((s) => casuta(s, sectiuni.indexOf(s), false)).join('')}</div>
    <h2>Altele</h2>
    <div class="grila-casute">${generale.map((s) => casuta(s, sectiuni.indexOf(s), true)).join('')}</div>
  </article>`;

  for (const c of container.querySelectorAll('.casuta')) {
    c.querySelector('.cap-casuta').onclick = () => {
      const d = citesteDeschise();
      const deschide = !c.classList.contains('deschisa');
      c.classList.toggle('deschisa', deschide);
      d['c' + c.dataset.idx] = deschide;
      scrieDeschise(d);
      if (deschide) c.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    };
  }
  for (const m of container.querySelectorAll('.misiune-casuta')) {
    m.addEventListener('toggle', () => {
      const d = citesteDeschise();
      d[m.dataset.id] = m.open;
      scrieDeschise(d);
    });
  }
  for (const b of container.querySelectorAll('.copiaza')) {
    b.onclick = async () => {
      try {
        await navigator.clipboard.writeText(b.nextElementSibling.textContent);
        b.textContent = 'Copiat ✓';
        setTimeout(() => (b.textContent = 'Copiază'), 1500);
      } catch {
        b.textContent = 'Selectează și copiază de mână';
      }
    };
  }
}
