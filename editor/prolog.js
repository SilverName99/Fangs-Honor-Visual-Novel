// Tab-ul „Prolog” (cerut de autor): paginile cărții de la începutul jocului, „Cronica Aldariei”, cu un comutator
// Română / English. Textul vine din data/prolog.json (scris de Claude), citit de la server ca restul datelor, ca
// după „Actualizează jocul” să se vadă varianta nouă. Limba aleasă se ține minte în browser, ca la celelalte reglaje
const CHEIE = 'editor-prolog-limba';
const LIMBI = {
  ro: { nume: 'Română', pagina: 'Pagina', lipsa: 'Pagina asta nu e scrisă încă în română.' },
  en: { nume: 'English', pagina: 'Page', lipsa: 'Traducerea în engleză a paginii acesteia nu e gata încă.' },
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function limbaSalvata() {
  try {
    const l = localStorage.getItem(CHEIE);
    if (LIMBI[l]) return l;
  } catch {}
  return 'ro';
}
function salveazaLimba(l) {
  try {
    localStorage.setItem(CHEIE, l);
  } catch {}
}

function paginile(prolog, limba) {
  const pagini = prolog.pagini || [];
  return pagini
    .map((p, i) => {
      const paragrafe = (p.paragrafe && p.paragrafe[limba]) || [];
      const titlu = (p.titlu && p.titlu[limba]) || '';
      const corp = paragrafe.length
        ? paragrafe.map((t) => `<p>${esc(t)}</p>`).join('')
        : `<p class="lipsa-prolog">${esc(LIMBI[limba].lipsa)}</p>`;
      return `<section class="pagina-prolog" data-pagina="${i}">
        <div class="nr-pagina">${LIMBI[limba].pagina} ${i + 1}</div>
        ${titlu ? `<h2>${esc(titlu)}</h2>` : ''}
        ${corp}
      </section>`;
    })
    .join('');
}

export function arataPrologul(container, prolog) {
  if (!prolog || !Array.isArray(prolog.pagini)) {
    container.innerHTML = '<article class="document-prolog"><p class="lipsa-prolog">Prologul nu e încă în date (data/prolog.json).</p></article>';
    return;
  }
  let limba = limbaSalvata();
  container.innerHTML = `<div class="cadru-prolog">
    <header class="cap-prolog">
      <div class="comutator-limba" role="group" aria-label="Limba prologului">
        ${Object.entries(LIMBI).map(([id, l]) => `<button type="button" data-limba="${id}">${l.nume}</button>`).join('')}
      </div>
      <span class="nota-prolog">7 pagini de carte, la începutul jocului. Textul se lucrează în documentul „Fangs&amp;Honor: Prologul”; în joc nu intră încă.</span>
    </header>
    <article class="document-prolog"></article>
  </div>`;
  const doc = container.querySelector('.document-prolog');
  const cadru = container.querySelector('.cadru-prolog');

  const deseneaza = () => {
    // Paginile au aceleași paragrafe în ambele limbi: la schimbarea limbii rămâi pe aceeași pagină, la același loc din ea
    let reper = null;
    const sus = cadru.scrollTop;
    for (const s of doc.querySelectorAll('.pagina-prolog')) {
      if (s.offsetTop + s.offsetHeight > sus) {
        reper = { idx: s.dataset.pagina, parte: Math.max(0, (sus - s.offsetTop) / Math.max(1, s.offsetHeight)) };
        break;
      }
    }
    doc.lang = limba;
    const titlu = (prolog.titlu && prolog.titlu[limba]) || '';
    doc.innerHTML = `${titlu ? `<h1 class="titlu-carte">${esc(titlu)}</h1>` : ''}${paginile(prolog, limba)}`;
    for (const b of container.querySelectorAll('.comutator-limba button')) b.classList.toggle('activ', b.dataset.limba === limba);
    if (reper && sus > 0) {
      const s = doc.querySelector(`.pagina-prolog[data-pagina="${reper.idx}"]`);
      if (s) cadru.scrollTop = s.offsetTop + reper.parte * s.offsetHeight;
    }
  };

  for (const b of container.querySelectorAll('.comutator-limba button')) {
    b.onclick = () => {
      if (b.dataset.limba === limba) return;
      limba = b.dataset.limba;
      salveazaLimba(limba);
      deseneaza();
    };
  }
  deseneaza();
}
