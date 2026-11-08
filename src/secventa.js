import { elementImagine, preincarca, schimbaImagine } from './imagini.js';

const div = (clasa, text) => Object.assign(document.createElement('div'), { className: clasa, textContent: text ?? '' });

// Imaginile unui eveniment (de exemplu orcii care intră în tavernă), arătate pe tot ecranul una după alta.
// Nu au text: autorul spune povestea prin imagini; click, Spațiu sau Enter trec la următoarea.
export function creeazaSecventa(parinte) {
  const el = div('secventa');
  el.hidden = true;
  parinte.append(el);
  let activ = null;
  const strat = div('strat-secventa');
  const indicator = div('indicator-secventa');

  function deseneaza() {
    const { imagini, i, opt } = activ;
    // Imaginea veche rămâne până se vede cea nouă (decis de autor: fără gol între imagini)
    if (!el.contains(strat)) el.replaceChildren(strat, indicator);
    indicator.textContent = opt.text || `${i + 1} / ${imagini.length} ▸`;
    schimbaImagine(strat, elementImagine([imagini[i]], { clasa: 'fundal', fundal: true }));
    // Ca ecran de încărcare (vânătoarea), imaginea trece singură după câteva secunde
    clearTimeout(activ.temporizator);
    if (opt.automat) activ.temporizator = setTimeout(inainte, opt.automat);
    // Următoarea se încarcă din timp, ca trecerea să fie instantanee
    if (imagini[i + 1]) preincarca(imagini[i + 1]);
  }

  function inainte() {
    if (!activ) return;
    activ.i++;
    if (activ.i < activ.imagini.length) return deseneaza();
    const gata = activ.gata;
    clearTimeout(activ.temporizator);
    activ = null;
    el.hidden = true;
    strat.replaceChildren();
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
    // opt.automat = câte milisecunde stă fiecare imagine; opt.text = ce scrie în colț în loc de „1 / 3”
    arata(imagini, gata, opt = {}) {
      if (!imagini?.length) return gata();
      activ = { imagini, i: 0, gata, opt };
      el.hidden = false;
      deseneaza();
    },
    activa: () => !!activ,
  };
}
