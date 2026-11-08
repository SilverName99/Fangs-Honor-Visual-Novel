// Tab-ul „Misiuni” (cerut de autor): documentul docs/misiuni.md, cu toate misiunile și cum se testează,
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

export function arataMisiunile(container) {
  container.innerHTML = `<article class="document-misiuni">${caHtml(text)}</article>`;
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
