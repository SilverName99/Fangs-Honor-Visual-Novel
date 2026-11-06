import { elementImagine } from './imagini.js';

// Cartea personajelor: câte un personaj pe fiecare două pagini (stânga: nume, încredere, descriere; dreapta: schița lui).
// Fonturile de scris de mână se importă în joc.js (editorul folosește doar numele fișierelor de aici).

const div = (clasa, text) => Object.assign(document.createElement('div'), { className: clasa, textContent: text ?? '' });

export const fisierCarte = (id) => `ui/carte_${id}.png`;

// Personajele din carte, în ordinea în care le-a cunoscut Vale (cine e marcat doar prin stare vine la urmă)
export function personajeCunoscute(date, stare) {
  const din = date.npcs.personaje.filter((p) => p.carte);
  const cunoscut = (p) => stare.cunoscuti?.includes(p.id) || stare.stari?.[`cunoscut_${p.id}`] === 'da';
  const ordine = (p) => {
    const i = stare.cunoscuti?.indexOf(p.id) ?? -1;
    return i < 0 ? Infinity : i;
  };
  return din.filter(cunoscut).sort((a, b) => ordine(a) - ordine(b));
}

export function creeazaCarte(parinte, joc) {
  let el = null;
  let pagina = 0;
  let animatie = false;

  const max = () => joc.date.config.incredere?.max ?? 10;
  const incredere = (id) => Math.max(0, Math.min(max(), joc.stare.relatii[id] ?? 0));

  function paginaStanga(p) {
    const pag = div('pagina stanga');
    if (!p) {
      pag.append(div('descriere-carte', 'Încă n-am cunoscut pe nimeni.'));
      return pag;
    }
    const n = incredere(p.id);
    const bara = div('incredere');
    bara.append(div('eticheta-incredere', 'Încredere'));
    const romburi = div('romburi');
    for (let i = 0; i < max(); i++) romburi.append(div(i < n ? 'romb plin' : 'romb'));
    bara.append(romburi, div('cifra-incredere', `${n}/${max()}`));
    // Orcii sunt în carte, dar nu au încredere (nu se recrutează)
    pag.append(div('nume-carte', p.carte.nume || p.nume), ...(p.carte.faraIncredere ? [] : [bara]), div('descriere-carte', p.carte.descriere || ''));
    return pag;
  }

  function paginaDreapta(p, index, total) {
    const pag = div('pagina dreapta');
    if (p) pag.append(elementImagine([fisierCarte(p.id)], { clasa: 'schita', raport: 0.8, eticheta: `${p.carte.nume || p.nume} (schiță)` }));
    pag.append(div('numar-pagina', total ? `${index + 1} / ${total}` : ''));
    return pag;
  }

  function arata() {
    const lista = personajeCunoscute(joc.date, joc.stare);
    pagina = Math.max(0, Math.min(pagina, lista.length - 1));
    const carte = el.querySelector('.carte');
    carte.replaceChildren(paginaStanga(lista[pagina]), paginaDreapta(lista[pagina], pagina, lista.length));
    butoane(lista.length);
  }

  function butoane(total) {
    el.querySelector('.inapoi-carte').disabled = pagina <= 0;
    el.querySelector('.inainte-carte').disabled = pagina >= total - 1;
  }

  // Foaia care se întoarce: fața e pagina de acum, spatele e pagina care vine; dedesubt se vede deja pagina nouă
  function intoarce(dir) {
    const lista = personajeCunoscute(joc.date, joc.stare);
    const noua = pagina + dir;
    if (animatie || noua < 0 || noua >= lista.length) return;
    joc.sunet.efect('pagina');
    const carte = el.querySelector('.carte');
    const [stanga, dreapta] = carte.children;
    const p = lista[noua];
    const foaie = div(`foaie ${dir > 0 ? 'spre-stanga' : 'spre-dreapta'}`);
    const fata = div('fata-foaie');
    const spate = div('spate-foaie');
    if (dir > 0) {
      fata.append(dreapta.cloneNode(true));
      spate.append(paginaStanga(p));
      carte.replaceChild(paginaDreapta(p, noua, lista.length), dreapta);
    } else {
      fata.append(stanga.cloneNode(true));
      spate.append(paginaDreapta(p, noua, lista.length));
      carte.replaceChild(paginaStanga(p), stanga);
    }
    foaie.append(fata, spate);
    carte.append(foaie);
    // Fiecare întoarcere are semnul ei: plasa de siguranță a unei foi vechi nu încheie foaia de acum (dădea pagina greșită la răsfoit repede)
    const semn = {};
    animatie = semn;
    const gata = () => {
      if (animatie !== semn) return;
      animatie = false;
      pagina = noua;
      if (!el) return;
      // Pagina de pe spatele foii se mută la locul ei (nu se mai desenează din nou), ca schița să nu clipească la final
      carte.replaceChild(spate.firstChild, dir > 0 ? stanga : dreapta);
      foaie.remove();
      butoane(lista.length);
    };
    foaie.addEventListener('animationend', gata);
    // Dacă animația nu pornește (tab ascuns), cartea nu rămâne blocată
    setTimeout(gata, 1200);
  }

  function deschide() {
    if (!el) {
      el = div('ecran-carte');
      const carte = div('carte');
      const inapoi = Object.assign(document.createElement('button'), { className: 'buton inapoi-carte', textContent: '◀' });
      const inainte = Object.assign(document.createElement('button'), { className: 'buton inainte-carte', textContent: '▶' });
      const inchideB = Object.assign(document.createElement('button'), { className: 'buton buton-mic-meniu inchide-carte', textContent: 'Închide' });
      inapoi.onclick = () => intoarce(-1);
      inainte.onclick = () => intoarce(1);
      inchideB.onclick = inchide;
      // Un clic pe fundal (în afara cărții) o închide, ca la o carte pusă pe masă
      el.onclick = (e) => e.target === el && inchide();
      el.append(carte, inapoi, inainte, inchideB);
      parinte.append(el);
    }
    arata();
  }

  function inchide() {
    el?.remove();
    el = null;
    animatie = false;
  }

  addEventListener('keydown', (e) => {
    if (!el) return;
    if (e.key === 'ArrowRight') intoarce(1);
    if (e.key === 'ArrowLeft') intoarce(-1);
  });

  return { deschide, inchide, deschisa: () => !!el };
}
