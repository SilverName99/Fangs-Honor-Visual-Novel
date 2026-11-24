import { elementImagine } from './imagini.js';
import { listaMisiuni, pasul, numaratori, textPotrivit, subpasGata } from './misiuni.js';
// Textele cărții sunt în limba jocului; se cer la fiecare desenare, ca să urmeze limba aleasă (misiunile, numele și
// descrierile vin deja traduse din date)
import { t } from './limba.js';

// Cartea personajelor: câte un personaj pe fiecare două pagini (stânga: nume, încredere, descriere; dreapta: schița lui).
// Fonturile de scris de mână se importă în joc.js (editorul folosește doar numele fișierelor de aici).

const div = (clasa, text) => Object.assign(document.createElement('div'), { className: clasa, textContent: text ?? '' });

export const fisierCarte = (id) => `ui/carte_${id}.png`;

// Personajele din carte, în ordinea în care le-a cunoscut Vale (cine e marcat doar prin stare vine la urmă)
export function personajeCunoscute(date, stare) {
  const din = date.npcs.personaje.filter((p) => p.carte);
  // „dupaStare”: cine nu se cunoaște dintr-o discuție obișnuită intră în carte după o întâmplare (șobolanii din pivniță)
  const cunoscut = (p) =>
    stare.cunoscuti?.includes(p.id) || stare.stari?.[`cunoscut_${p.id}`] === 'da' || (p.carte.dupaStare && stare.stari?.[p.carte.dupaStare] != null);
  // Orcii stau mereu la sfârșitul cărții (decis de autor): colectorul penultimul, paznicul ultimul
  const LA_URMA = ['orc_colector', 'paznic_orc_1'];
  const ordine = (p) => {
    if (LA_URMA.includes(p.id)) return 1e6 + LA_URMA.indexOf(p.id);
    const i = stare.cunoscuti?.indexOf(p.id) ?? -1;
    return i < 0 ? 1e5 : i;
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

  // Conținutul unei pagini de misiuni stă într-un strat care se derulează între marginile paginii
  function paginaDerulata(clasa) {
    const pag = div(clasa);
    const continut = div('derulare-carte');
    pag.append(continut);
    return { pag, continut };
  }

  function paginaListaMisiuni({ inLucru, gata }) {
    const { pag: cadru, continut: pag } = paginaDerulata('pagina stanga lista-misiuni');
    pag.append(div('nume-carte', t('Misiuni')));
    if (!inLucru.length && !gata.length) {
      pag.append(div('descriere-carte', t('Încă n-am nicio misiune.')));
      return cadru;
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
    sectiune(t('În lucru'), inLucru, 'in-lucru');
    sectiune(t('Terminate'), gata, 'terminata');
    return cadru;
  }

  function paginaMisiune(m) {
    const { pag: cadru, continut: pag } = paginaDerulata('pagina dreapta pagina-misiune');
    if (!m) return cadru;
    const s = joc.stare;
    const st = s.misiuni[m.id];
    // O misiune ratată arată doar pașii făcuți cu adevărat (refuzată de la început: niciunul), nu pe toți bifați
    const i = st === 'terminata' ? m.pasi.length : pasul(s, m.id);
    pag.append(div('nume-carte titlu-misiune', m.titlu));
    if (m.dela) pag.append(div('dela-misiune', t('De la: {nume}', { nume: numeDela(m.dela) })));
    // Și descrierea poate depinde de ce a ales Vale (o listă { conditii, text }: la un refuz, nu mai zice „i-am promis”)
    pag.append(div('descriere-carte', (textPotrivit(m.descriere, s) || '').replace(/^CIORNĂ:\s*/, '')));
    const pasi = div('pasi-misiune');
    // Pașii făcuți sunt bifați, pasul de acum e scris clar (cu cât ai strâns); cei de după nu se văd încă
    m.pasi.forEach((p, k) => {
      if (k > i || (k === i && st !== 'inceputa')) return;
      const facut = k < i;
      // Cât a strâns: „(4/10)”, iar la mai multe obiecte deodată, fiecare cu numele lui („lemne 4/6, paie 1/3”)
      const num = facut ? [] : numaratori(p, s);
      const cate = (x) => `${Math.min(x.are, x.n)}/${x.n}`;
      const cat = !num.length ? '' : num.length === 1 ? ` (${cate(num[0])})` : ` (${num.map((x) => `${x.nume || joc.date.items.obiecte[x.obiect]?.nume.toLowerCase() || x.obiect} ${cate(x)}`).join(', ')})`;
      // Textul pasului și sfatul pot depinde de ce a ales Vale (o listă { conditii, text }, ca la „Convoiul” Kaiei)
      pasi.append(div(`pas-misiune${facut ? ' facut' : ' acum'}`, `${facut ? '✓' : '▸'} ${textPotrivit(p.text, s)}${cat}`));
      // Bucățile care se fac în orice ordine: fiecare pe rândul ei, bifată când e gata
      if (!facut) for (const sp of p.subpasi || []) {
        const gata = subpasGata(sp, s);
        pasi.append(div(`subpas-misiune${gata ? ' facut' : ''}`, `${gata ? '✓' : '·'} ${textPotrivit(sp.text, s)}`));
      }
      const sfat = !facut && textPotrivit(p.sfat, s);
      if (sfat) pasi.append(div('sfat-misiune', sfat));
    });
    pag.append(pasi);
    if (st === 'terminata') pag.append(div('stare-misiune', t('Gata!')));
    if (st === 'ratata') pag.append(div('stare-misiune ratata', t('Ratată.')));
    if (m.recompensa?.text) pag.append(div('recompensa-misiune', t('Recompensă: {text}', { text: m.recompensa.text })));
    return cadru;
  }

  function arataMisiunile() {
    const lista = misiuniCunoscute();
    const toate = [...lista.inLucru, ...lista.gata];
    if (!toate.some((m) => m.id === aleasa)) aleasa = toate[0]?.id ?? null;
    // Lista rămâne derulată unde era (decis de autor: la alegerea unei misiuni nu sare înapoi sus)
    const sus = el.querySelector('.lista-misiuni .derulare-carte')?.scrollTop || 0;
    el.querySelector('.carte').replaceChildren(paginaListaMisiuni(lista), paginaMisiune(toate.find((m) => m.id === aleasa)));
    const lst = el.querySelector('.lista-misiuni .derulare-carte');
    if (lst) lst.scrollTop = sus;
  }

  const max = () => joc.date.config.incredere?.max ?? 10;
  const incredere = (id) => Math.max(0, Math.min(max(), joc.stare.relatii[id] ?? 0));

  function paginaStanga(p) {
    const pag = div('pagina stanga');
    if (!p) {
      pag.append(div('descriere-carte', t('Încă n-am cunoscut pe nimeni.')));
      return pag;
    }
    const n = incredere(p.id);
    const bara = div('incredere');
    bara.append(div('eticheta-incredere', t('Încredere')));
    const romburi = div('romburi');
    // Punctele de încredere (decis de autor): aceeași iconiță ca la recompensele de pe ecran (ui_icon_incredere.png,
    // până se încarcă rombul auriu), colorată pentru punctele câștigate și decolorată pentru cele care lipsesc
    for (let i = 0; i < max(); i++) romburi.append(div(`icon-hud icon-incredere punct-incredere${i < n ? ' plin' : ''}`, '◆'));
    bara.append(romburi, div('cifra-incredere', `${n}/${max()}`));
    // Orcii sunt în carte, dar nu au încredere (nu se recrutează)
    pag.append(div('nume-carte', p.carte.nume || p.nume), ...(p.carte.faraIncredere ? [] : [bara]), div('descriere-carte', textPotrivit(p.carte.descriere, joc.stare) || ''));
    return pag;
  }

  function paginaDreapta(p, index, total) {
    const pag = div('pagina dreapta');
    if (p) pag.append(elementImagine([fisierCarte(p.id)], { clasa: 'schita', raport: 0.8, eticheta: t('{nume} (schiță)', { nume: p.carte.nume || p.nume }) }));
    pag.append(div('numar-pagina', total ? `${index + 1} / ${total}` : ''));
    return pag;
  }

  function arata() {
    // Săgețile de răsfoit sunt doar la personaje; misiunile se aleg din listă
    el.querySelector('.inapoi-carte').hidden = mod !== 'personaje';
    el.querySelector('.inainte-carte').hidden = mod !== 'personaje';
    // Textele butoanelor se scriu la fiecare desenare, ca să urmeze limba jocului și cât stă cartea deschisă
    el.querySelector('.comuta-carte').textContent = mod === 'misiuni' ? t('Personaje') : t('Misiuni');
    el.querySelector('.inchide-carte').textContent = t('Închide');
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
      const inchideB = Object.assign(document.createElement('button'), { className: 'buton buton-mic-meniu inchide-carte' });
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
