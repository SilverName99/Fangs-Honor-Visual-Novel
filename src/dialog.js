import { elementImagine } from './imagini.js';

const div = (clasa) => Object.assign(document.createElement('div'), { className: clasa });

// Dialogul: Vale în stânga, celălalt personaj în dreapta, textul jos, deasupra portretelor.
// Același ecran arată și evenimentele (un singur nod cu alegeri).
export function creeazaDialog(parinte, { numeVorbitor, emotieVale, verificaConditii, laEfecte, laFinal }) {
  const el = div('dialog');
  el.hidden = true;
  const stanga = div('loc-portret stanga');
  const dreapta = div('loc-portret dreapta');
  const caseta = div('caseta');
  const nume = div('nume-vorbitor');
  const text = div('text-dialog');
  const alegeri = div('alegeri');
  const mai = div('continua');
  mai.textContent = '▸';
  caseta.append(nume, text, alegeri, mai);
  el.append(stanga, dreapta, caseta);
  parinte.append(el);

  // Portretele se refolosesc: un portret deja încărcat nu mai clipește la fiecare replică
  const portrete = new Map();
  function portret(id, emotie) {
    const cheie = `${id}_${emotie}`;
    if (!portrete.has(cheie)) {
      portrete.set(cheie, elementImagine([`portraits/${id}_${emotie}.png`, `portraits/${id}_normal.png`], { clasa: 'portret', raport: 0.8 }));
    }
    return portrete.get(cheie);
  }

  let activ = null;

  function arataNod(idNod) {
    const nod = idNod ? activ.dialog.noduri[idNod] : null;
    if (!nod) return inchide();
    activ.nod = nod;
    laEfecte(nod.efecte);
    if (!activ) return; // un efect (de exemplu leșinul) poate închide dialogul

    const partener = activ.dialog.partener;
    const vorbesteVale = nod.vorbitor === 'vale';
    if (nod.vorbitor && !vorbesteVale) activ.emotiePartener = nod.emotie || 'normal';

    stanga.replaceChildren(portret('vale', vorbesteVale ? nod.emotie || 'normal' : emotieVale()));
    dreapta.replaceChildren(...(partener && partener !== 'vale' ? [portret(partener, activ.emotiePartener)] : []));
    // Cine nu vorbește e ușor întunecat, ca să fie clar cine are cuvântul
    stanga.classList.toggle('tacut', !vorbesteVale);
    dreapta.classList.toggle('tacut', vorbesteVale || !nod.vorbitor);

    nume.textContent = nod.vorbitor ? numeVorbitor(nod.vorbitor, activ.dialog) : '';
    nume.hidden = !nod.vorbitor;
    text.textContent = nod.text || '';

    const vizibile = (nod.alegeri || []).filter((a) => verificaConditii(a.conditii));
    alegeri.replaceChildren(
      ...vizibile.map((a, i) => {
        const b = document.createElement('button');
        b.className = 'alegere';
        b.textContent = `${i + 1}. ${a.text}`;
        b.onclick = (e) => {
          e.stopPropagation();
          alege(a);
        };
        return b;
      }),
    );
    activ.alegeri = vizibile;
    mai.hidden = vizibile.length > 0;
  }

  function alege(a) {
    laEfecte(a.efecte);
    if (activ) arataNod(a.spre ?? null);
  }

  function continua() {
    if (activ && !activ.alegeri.length) arataNod(activ.nod.urmator ?? null);
  }

  function inchide() {
    if (!activ) return;
    el.hidden = true;
    parinte.classList.remove('in-dialog');
    activ = null;
    laFinal();
  }

  caseta.addEventListener('click', continua);
  addEventListener('keydown', (e) => {
    if (!activ) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      continua();
    }
    const n = Number(e.key);
    if (n >= 1 && n <= activ.alegeri.length) alege(activ.alegeri[n - 1]);
  });

  return {
    porneste(dialog) {
      activ = { dialog, emotiePartener: 'normal', alegeri: [] };
      el.hidden = false;
      parinte.classList.add('in-dialog');
      arataNod(dialog.start);
    },
    inchide,
    activ: () => !!activ,
  };
}
