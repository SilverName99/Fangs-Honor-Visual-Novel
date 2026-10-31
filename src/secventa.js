import { elementImagine, preincarca } from './imagini.js';

const div = (clasa, text) => Object.assign(document.createElement('div'), { className: clasa, textContent: text ?? '' });

// Imaginile unui eveniment (de exemplu orcii care intră în tavernă), arătate pe tot ecranul una după alta.
// Nu au text: autorul spune povestea prin imagini; click, Spațiu sau Enter trec la următoarea.
export function creeazaSecventa(parinte) {
  const el = div('secventa');
  el.hidden = true;
  parinte.append(el);
  let activ = null;

  function deseneaza() {
    const { imagini, i } = activ;
    el.replaceChildren(elementImagine([imagini[i]], { clasa: 'fundal', fundal: true }), div('indicator-secventa', `${i + 1} / ${imagini.length} ▸`));
    // Următoarea se încarcă din timp, ca trecerea să fie instantanee
    if (imagini[i + 1]) preincarca(imagini[i + 1]);
  }

  function inainte() {
    if (!activ) return;
    activ.i++;
    if (activ.i < activ.imagini.length) return deseneaza();
    const gata = activ.gata;
    activ = null;
    el.hidden = true;
    el.replaceChildren();
    gata();
  }

  el.addEventListener('click', inainte);
  addEventListener('keydown', (e) => {
    if (!activ || (e.key !== ' ' && e.key !== 'Enter')) return;
    e.preventDefault();
    inainte();
  });

  return {
    arata(imagini, gata) {
      if (!imagini?.length) return gata();
      activ = { imagini, i: 0, gata };
      el.hidden = false;
      deseneaza();
    },
    activa: () => !!activ,
  };
}
