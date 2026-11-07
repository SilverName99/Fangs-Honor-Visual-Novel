import { elementImagine } from './imagini.js';
import { listaMisiuni, pasul, cateAre } from './misiuni.js';

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
  // Cartea are două părți (decis de autor): misiunile (se deschide la ele) și personajele
  let mod = 'misiuni';
  let aleasa = null;

  // ---------- misiunile ----------
  // În lucru întâi (în ordinea în care au început), apoi cele terminate și cele ratate
  function misiuniCunoscute() {
    const s = joc.stare;
    const toate = listaMisiuni(joc.date).filter((m) => s.misiuni?.[m.id]);
    const ordine = (m) => {
      const i = (s.ordineMisiuni || []).indexOf(m.id);
      return i < 0 ? Infinity : i;
    };
    toate.sort((a, b) => ordine(a) - ordine(b));
    return { inLucru: toate.filter((m) => s.misiuni[m.id] === 'inceputa'), gata: toate.filter((m) => s.misiuni[m.id] !== 'inceputa') };
  }

  const numeDela = (id) => {
    const p = joc.date.npcs.personaje.find((x) => x.id === id);
    return p?.carte?.nume || p?.nume || id;
  };

  function paginaListaMisiuni({ inLucru, gata }) {
    const pag = div('pagina stanga');
    pag.append(div('nume-carte', 'Misiuni'));
    if (!inLucru.length && !gata.length) {
      pag.append(div('descriere-carte', 'Încă n-am nicio misiune.'));
      return pag;
    }
    const sectiune = (titlu, lista, clasa) => {
      if (!lista.length) return;
      pag.append(div('titlu-sectiune-misiuni', titlu));
      for (const m of lista) {
        const r = div(`rand-misiune ${clasa}${aleasa === m.id ? ' aleasa' : ''}`, m.titlu);
        r.onclick = () => {
          aleasa = m.id;
          joc.sunet.efect('pagina');
          arata();
        };
        pag.append(r);
      }
    };
    sectiune('În lucru', inLucru, 'in-lucru');
    sectiune('Terminate', gata, 'terminata');
    return pag;
  }

  function paginaMisiune(m) {
    const pag = div('pagina dreapta pagina-misiune');
    if (!m) return pag;
    const s = joc.stare;
    const st = s.misiuni[m.id];
    const i = st === 'inceputa' ? pasul(s, m.id) : m.pasi.length;
    pag.append(div('nume-carte titlu-misiune', m.titlu));
    if (m.dela) pag.append(div('dela-misiune', `De la: ${numeDela(m.dela)}`));
    pag.append(div('descriere-carte', (m.descriere || '').replace(/^CIORNĂ:\s*/, '')));
    const pasi = div('pasi-misiune');
    // Pașii făcuți sunt bifați, pasul de acum e scris clar (cu cât ai strâns); cei de după nu se văd încă
    m.pasi.forEach((p, k) => {
      if (k > i || (k === i && st !== 'inceputa')) return;
      const facut = k < i;
      const cat = p.numara && !facut ? ` (${Math.min(cateAre(s, p.numara.obiect), p.numara.n)}/${p.numara.n})` : '';
      pasi.append(div(`pas-misiune${facut ? ' facut' : ' acum'}`, `${facut ? '✓' : '▸'} ${p.text}${cat}`));
    });
    pag.append(pasi);
    if (st === 'terminata') pag.append(div('stare-misiune', 'Gata!'));
    if (st === 'ratata') pag.append(div('stare-misiune ratata', 'Ratată.'));
    if (m.recompensa?.text) pag.append(div('recompensa-misiune', `Recompensă: ${m.recompensa.text}`));
    return pag;
  }

  function arataMisiunile() {
    const lista = misiuniCunoscute();
    const toate = [...lista.inLucru, ...lista.gata];
    if (!toate.some((m) => m.id === aleasa)) aleasa = toate[0]?.id ?? null;
    el.querySelector('.carte').replaceChildren(paginaListaMisiuni(lista), paginaMisiune(toate.find((m) => m.id === aleasa)));
  }

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
    // Săgețile de răsfoit sunt doar la personaje; misiunile se aleg din listă
    el.querySelector('.inapoi-carte').hidden = mod !== 'personaje';
    el.querySelector('.inainte-carte').hidden = mod !== 'personaje';
    el.querySelector('.comuta-carte').textContent = mod === 'misiuni' ? 'Personaje' : 'Misiuni';
    if (mod === 'misiuni') return arataMisiunile();
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
    if (mod !== 'personaje') return;
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

  function deschide(cu = 'misiuni') {
    mod = cu;
    if (!el) {
      el = div('ecran-carte');
      const carte = div('carte');
      const inapoi = Object.assign(document.createElement('button'), { className: 'buton inapoi-carte', textContent: '◀' });
      const inainte = Object.assign(document.createElement('button'), { className: 'buton inainte-carte', textContent: '▶' });
      const inchideB = Object.assign(document.createElement('button'), { className: 'buton buton-mic-meniu inchide-carte', textContent: 'Închide' });
      inapoi.onclick = () => intoarce(-1);
      inainte.onclick = () => intoarce(1);
      inchideB.onclick = inchide;
      // Lângă „Închide”, același pergament: trece între misiuni și personaje
      const comuta = Object.assign(document.createElement('button'), { className: 'buton buton-mic-meniu comuta-carte' });
      comuta.onclick = () => {
        if (animatie) return;
        mod = mod === 'misiuni' ? 'personaje' : 'misiuni';
        joc.sunet.efect('pagina');
        arata();
      };
      el.append(carte, inapoi, inainte, comuta, inchideB);
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
