// Tab-ul „Prolog” (cerut de autor): cartea de la începutul jocului, „Cronica Aldariei”, împărțită pe capitole (decis de
// autor: pe capitole, nu pe pagini), cu un comutator Română / English. Textul vine din data/prolog.json (scris de
// Claude), citit de la server ca restul datelor, ca după „Actualizează jocul” să se vadă varianta nouă. Limba aleasă
// se ține minte în browser, ca la celelalte reglaje
const CHEIE = 'editor-prolog-limba';
const LIMBI = {
  ro: { nume: 'Română', capitol: 'Capitolul', lipsa: 'Capitolul acesta nu e scris încă în română.' },
  en: { nume: 'English', capitol: 'Chapter', lipsa: 'Traducerea în engleză a capitolului acestuia nu e gata încă.' },
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

const titluCapitol = (c, limba) => (c.titlu && c.titlu[limba]) || '';

function capitolele(prolog, limba) {
  return prolog.capitole
    .map((c, i) => {
      const paragrafe = (c.paragrafe && c.paragrafe[limba]) || [];
      const titlu = titluCapitol(c, limba);
      const corp = paragrafe.length
        ? paragrafe.map((t) => `<p>${esc(t)}</p>`).join('')
        : `<p class="lipsa-prolog">${esc(LIMBI[limba].lipsa)}</p>`;
      return `<section class="capitol-prolog" data-capitol="${i}">
        <div class="nr-capitol">${LIMBI[limba].capitol} ${i + 1}</div>
        ${titlu ? `<h2>${esc(titlu)}</h2>` : ''}
        ${corp}
      </section>`;
    })
    .join('');
}

export function arataPrologul(container, prolog) {
  if (!prolog || !Array.isArray(prolog.capitole)) {
    container.innerHTML = '<article class="document-prolog"><p class="lipsa-prolog">Prologul nu e încă în date (data/prolog.json).</p></article>';
    return;
  }
  let limba = limbaSalvata();
  const n = prolog.capitole.length;
  container.innerHTML = `<div class="cadru-prolog">
    <header class="cap-prolog">
      <div class="comutator-limba" role="group" aria-label="Limba prologului">
        ${Object.entries(LIMBI).map(([id, l]) => `<button type="button" data-limba="${id}">${l.nume}</button>`).join('')}
      </div>
      <select class="cuprins-prolog" aria-label="Sari la capitol"></select>
      <span class="nota-prolog">${n} capitole, la începutul jocului. Textul se lucrează în documentul „Fangs&amp;Honor: Prologul”; în joc nu intră încă.</span>
    </header>
    <article class="document-prolog"></article>
  </div>`;
  const doc = container.querySelector('.document-prolog');
  const cadru = container.querySelector('.cadru-prolog');
  const cap = container.querySelector('.cap-prolog');
  const cuprins = container.querySelector('.cuprins-prolog');

  // Capitolul citit e cel al cărui început a trecut de banda de sus (comutatorul acoperă primii pixeli ai textului)
  const capitolulDeSus = () => {
    const sus = cadru.scrollTop + cap.offsetHeight + 40;
    let idx = 0;
    for (const s of doc.querySelectorAll('.capitol-prolog')) if (s.offsetTop <= sus) idx = +s.dataset.capitol;
    // La capătul cărții ultimul capitol poate să nu ajungă sus: atunci el e cel citit
    if (cadru.scrollTop + cadru.clientHeight >= cadru.scrollHeight - 2 && cadru.scrollTop > 0) idx = n - 1;
    return idx;
  };
  const potrivesteCuprinsul = () => {
    const idx = String(capitolulDeSus());
    if (cuprins.value !== idx) cuprins.value = idx;
  };

  const deseneaza = () => {
    // Capitolele au aceleași paragrafe în ambele limbi: la schimbarea limbii rămâi în același capitol, la același loc din el
    let reper = null;
    const sus = cadru.scrollTop;
    for (const s of doc.querySelectorAll('.capitol-prolog')) {
      if (s.offsetTop + s.offsetHeight > sus) {
        reper = { idx: s.dataset.capitol, parte: Math.max(0, (sus - s.offsetTop) / Math.max(1, s.offsetHeight)) };
        break;
      }
    }
    doc.lang = limba;
    const titlu = (prolog.titlu && prolog.titlu[limba]) || '';
    doc.innerHTML = `${titlu ? `<h1 class="titlu-carte">${esc(titlu)}</h1>` : ''}${capitolele(prolog, limba)}`;
    cuprins.innerHTML = prolog.capitole
      .map((c, i) => {
        const t = titluCapitol(c, limba);
        return `<option value="${i}">${LIMBI[limba].capitol} ${i + 1}${t ? `: ${esc(t)}` : ''}</option>`;
      })
      .join('');
    for (const b of container.querySelectorAll('.comutator-limba button')) b.classList.toggle('activ', b.dataset.limba === limba);
    if (reper && sus > 0) {
      const s = doc.querySelector(`.capitol-prolog[data-capitol="${reper.idx}"]`);
      if (s) cadru.scrollTop = s.offsetTop + reper.parte * s.offsetHeight;
    }
    potrivesteCuprinsul();
  };

  for (const b of container.querySelectorAll('.comutator-limba button')) {
    b.onclick = () => {
      if (b.dataset.limba === limba) return;
      limba = b.dataset.limba;
      salveazaLimba(limba);
      deseneaza();
    };
  }
  cuprins.onchange = () => {
    const s = doc.querySelector(`.capitol-prolog[data-capitol="${cuprins.value}"]`);
    // Primul capitol se deschide de la titlul cărții; celelalte, de la rombul care le desparte, chiar sub banda de sus
    if (s) cadru.scrollTop = cuprins.value === '0' ? 0 : s.offsetTop - cap.offsetHeight;
    potrivesteCuprinsul();
  };
  cadru.addEventListener('scroll', potrivesteCuprinsul, { passive: true });
  deseneaza();
}
