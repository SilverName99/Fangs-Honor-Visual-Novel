import { elementImagine, schimbaImagine } from './imagini.js';
import { volumEfecte } from './sunet.js';
import { urlFilm, filmLipsa } from './filme.js';

const div = (clasa) => Object.assign(document.createElement('div'), { className: clasa });

// Dialogul: Vale în stânga, celălalt personaj în dreapta, textul jos, deasupra portretelor.
// Același ecran arată și evenimentele (un singur nod cu alegeri).
// Meniul de discuție (decis de autor): un dialog cu „meniu: true” nu se închide la capătul unei ramuri; sub ultima
// replică apar opțiunile personajului (Vorbește, misiunile cu semnul lor, La revedere), date de „optiuniMeniu”
export function creeazaDialog(parinte, { numeVorbitor, emotieVale, verificaConditii, laEfecte, laFinal, optiuniMeniu, laCapatulRamurii, laImagine, laNod, tabaraVorbitor }) {
  const el = div('dialog');
  el.hidden = true;
  const stanga = div('loc-portret stanga');
  const dreapta = div('loc-portret dreapta');
  const caseta = div('caseta');
  const nume = div('nume-vorbitor');
  // Când replicile stau peste o imagine (personajele vorbesc între ele), lângă nume stă medalionul din luptă,
  // ca să se vadă repede cine vorbește (cerut de autor)
  const textNume = document.createElement('span');
  const medalionNume = div('medalion medalion-nume aliat');
  nume.append(medalionNume, textNume);
  let cheieMedalion = '';
  const text = div('text-dialog');
  const alegeri = div('alegeri');
  const mai = div('continua');
  mai.textContent = '▸';
  // Rombul de pe marginea de sus: piesă separată, ca să nu se întindă odată cu chenarul (se vede doar cu imaginea lui)
  const ornament = div('ornament-dialog');
  caseta.append(ornament, nume, text, alegeri, mai);
  // Imaginea pe tot ecranul din spatele replicilor (decis de autor: la unele evenimente replicile stau peste imagine);
  // rămâne de la un nod la altul până o schimbă altul sau se termină dialogul
  const fundal = div('fundal-dialog');
  // Ochiul din colțul stânga-jos (cerut de autor): ascunde chenarul și portretele, ca să se vadă toată imaginea;
  // încă un clic oriunde (sau pe ochi) le aduce înapoi
  const ochi = Object.assign(document.createElement('button'), { className: 'buton-ochi' });
  ochi.setAttribute('aria-label', 'Ascunde dialogul');
  ochi.append(Object.assign(div('icon-hud icon-ochi'), { textContent: '👁' }));
  const ascuns = () => el.classList.contains('ascuns-text');
  ochi.onclick = (e) => {
    e.stopPropagation();
    el.classList.toggle('ascuns-text');
  };
  el.addEventListener('click', () => ascuns() && el.classList.remove('ascuns-text'));
  // Un clic oriunde sare bucata de filmuleț care merge (decis de autor: nimeni nu e obligat să-l vadă din nou);
  // nu și clicul care tocmai a pornit-o (cel de pe chenar, care a trecut la replica ei)
  el.addEventListener('click', (e) => film?.bucata && e.timeStamp > film.bucata.start && film.bucata.sari());
  el.append(fundal, stanga, dreapta, caseta, ochi);
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

  // Filmulețele din vise (decis de autor: câte unul la fiecare vis). Un singur <video> pe vis, care merge pe
  // bucăți, de la o replică la alta: „video” la replică = filmulețul; „de” / „pana” (secunde) = bucata pe care o
  // arată replica (fără „pana”, până la sfârșit). Textul replicii apare abia când bucata ajunge la capăt, pe cadrul
  // ei, ca la imagini (al doilea vis: filmulețul se oprește la fiecare imagine-cheie, cu replicile peste ea).
  // Un filmuleț care lipsește: replica își arată imaginea, ca înainte; fără imagine și fără text, se sare
  // („faraVideo” = replica de la care merge visul atunci)
  const filmeLipsa = new Set();
  let film = null;

  // Oprește bucata care merge (s-a trecut mai departe); filmulețul rămâne ca fundal, pe cadrul lui
  function opresteFilmul() {
    if (!film) return;
    cancelAnimationFrame(film.raf);
    if (film.bucata) film.el.pause();
    film.bucata = null;
    film.laGata = null;
  }
  function lasaFilmul() {
    opresteFilmul();
    film = null;
  }

  function filmNou(src, deLa) {
    lasaFilmul();
    const strat = div('strat-video');
    const v = document.createElement('video');
    v.playsInline = true;
    v.preload = 'auto';
    const nivel = volumEfecte();
    v.volume = Math.min(1, nivel);
    v.muted = nivel <= 0;
    strat.append(v);
    fundal.append(strat);
    const f = { src, el: v, strat, pornit: false, gata: false };
    film = f;
    const lipsa = () => {
      if (film !== f || f.gata) return;
      filmeLipsa.add(src);
      const bucata = f.bucata;
      strat.remove();
      lasaFilmul();
      el.classList.remove('asteapta-imaginea');
      // Replica se arată din nou, fără filmuleț (cu imaginea ei), fără să-și mai aplice efectele
      if (!activ || !bucata || activ.nod !== bucata.nod) return;
      activ.imagine = null;
      arataNod(bucata.idNod, false, true);
    };
    v.onerror = lipsa;
    // Un filmuleț care nu vine deloc (rețeaua) nu ține visul pe loc
    f.asteptare = setTimeout(lipsa, 12000);
    v.oncanplay = () => {
      if (f.gata) return;
      f.gata = true;
      clearTimeout(f.asteptare);
      const laGata = f.laGata;
      f.laGata = null;
      laGata?.();
    };
    // Filmulețul descărcat întreg înainte de vis (din memorie), altfel cel de pe server
    v.src = urlFilm(src);
    // Pornește direct de la bucata cerută (după un refresh în mijlocul visului), fără să arate întâi începutul
    if (deLa) v.currentTime = deLa;
    return f;
  }

  function arataFilmul(nod, idNod) {
    const deLa = nod.de ?? 0;
    const f = film?.src === nod.video ? film : filmNou(nod.video, deLa);
    const v = f.el;
    const bucata = { nod, idNod, start: performance.now() };
    f.bucata = bucata;
    el.classList.add('cu-imagine', 'asteapta-imaginea');
    const ajuns = () => {
      if (f.bucata !== bucata) return;
      cancelAnimationFrame(f.raf);
      f.bucata = null;
      if (nod.pana != null) {
        v.pause();
        v.currentTime = nod.pana;
      }
      el.classList.remove('asteapta-imaginea');
      const dupa = activ?.dupaImagine;
      if (activ) activ.dupaImagine = null;
      dupa?.();
      // O bucată fără text (filmulețul de la începutul visului, ultima bucată) trece singură mai departe, după ce
      // ultimul ei cadru mai stă puțin pe ecran („tine”, ms)
      if (!nod.text && activ?.nod === nod) setTimeout(() => activ?.nod === nod && arataNod(nod.urmator ?? null), nod.tine || 0);
    };
    // Clicul (sau Spațiu, Enter): o bucată cu „pana” sare la capătul ei; una până la sfârșit, peste tot ce a rămas
    bucata.sari = () => {
      if (f.bucata !== bucata) return;
      if (nod.pana != null) return ajuns();
      opresteFilmul();
      arataNod(nod.urmator ?? null);
    };
    const porneste = () => {
      if (f.bucata !== bucata) return;
      if (!f.pornit) {
        f.pornit = true;
        // Cele de dinainte (imaginea de sub replica veche) dispar abia când se vede filmulețul
        for (const x of [...fundal.children]) if (x !== f.strat) x.remove();
        f.strat.classList.add('vizibil');
      }
      // Imaginea-cheie a replicii intră în galeria din meniu și rămâne fundalul ei după un refresh
      if (nod.imagine && activ) {
        activ.imagine = nod.imagine;
        laImagine?.(nod.imagine);
        laNod?.(activ.original, idNod, activ.imagine);
      }
      if (Math.abs(v.currentTime - deLa) > 0.25) v.currentTime = deLa;
      // „de” = „pana”: doar cadrul acela, oprit (începutul visului, cu prima replică peste el)
      if (nod.pana != null && v.currentTime >= nod.pana - 0.05) return ajuns();
      v.onended = () => f.bucata === bucata && ajuns();
      // Fără un clic în pagină, browserul nu lasă sunetul: atunci merge fără sunet, nu deloc
      v.play()?.catch(() => {
        v.muted = true;
        v.play()?.catch(() => {});
      });
      if (nod.pana != null) {
        const urmareste = () => {
          if (f.bucata !== bucata) return;
          if (v.currentTime >= nod.pana - 0.03) return ajuns();
          f.raf = requestAnimationFrame(urmareste);
        };
        f.raf = requestAnimationFrame(urmareste);
      }
    };
    if (f.gata) porneste();
    else f.laGata = porneste;
  }

  // „reluat”: discuția continuă după un refresh al paginii, de la replica la care rămăsese; efectele ei s-au
  // aplicat deja (și s-au salvat), deci nu se mai aplică o dată. „faraFilm”: aceeași replică, arătată din nou
  // fiindcă filmulețul ei lipsește (efectele s-au aplicat deja)
  function arataNod(idNod, reluat = false, faraFilm = false) {
    const nod = idNod ? activ.dialog.noduri[idNod] : null;
    if (!nod) return inchide();
    activ.nod = nod;
    activ.dupaImagine = null;
    // O bucată de filmuleț care încă mergea se oprește pe cadrul ei
    opresteFilmul();
    const cuFilm = !!nod.video && !filmeLipsa.has(nod.video) && !filmLipsa(nod.video);
    if (nod.video && !cuFilm && !nod.imagine && !nod.text) return arataNod(nod.faraVideo ?? nod.urmator ?? null, reluat);
    // „trezire” (visele, decis de autor): Vale se trezește; imaginea visului și ceața dispar, rămâne locul unde a dormit
    if (nod.trezire) {
      lasaFilmul();
      fundal.replaceChildren();
      el.classList.remove('cu-imagine', 'asteapta-imaginea', 'vis');
      activ.imagine = null;
      activ.imagineReluata = null;
    }
    // „amintire” (decis de autor: povestea Kaiei despre Ember): replicile peste o amintire au ceața de la vise, ca să
    // se vadă că e trecutul; o pune fiecare replică din amintire (și după un refresh), o ia „trezire”
    if (nod.amintire) el.classList.add('vis');
    // La reluare, imaginea de sub replici e cea de dinainte de refresh (replica de acum poate să n-o aibă pe a ei)
    const imagine = cuFilm ? null : nod.imagine || (reluat ? activ.imagineReluata : null);
    if (cuFilm) arataFilmul(nod, idNod);
    else if (imagine && imagine !== activ.imagine) {
      // O imagine nouă acoperă filmulețul (care se scoate odată cu imaginea veche, când se vede cea nouă)
      lasaFilmul();
      activ.imagine = imagine;
      // Galeria din meniu ține minte și imaginile de sub replici (scandalul din tavernă se petrece peste ele)
      laImagine?.(imagine);
      el.classList.add('cu-imagine', 'asteapta-imaginea');
      // Replicile și portretele apar abia când se vede imaginea, ca între două imagini să nu clipească dialogul
      const nou = elementImagine([imagine], { clasa: 'imagine-fundal-dialog', fundal: true, eticheta: imagine });
      // „apropiere” (visul, decis de autor): imaginea se apropie încet cât stă pe ecran, ca într-un film
      if (nod.apropiere) {
        nou.classList.add('apropiere-lenta');
        nou.style.animationDuration = `${nod.durata || 4000}ms`;
      }
      schimbaImagine(fundal, nou, () => {
        el.classList.remove('asteapta-imaginea');
        const dupa = activ?.dupaImagine;
        if (activ) activ.dupaImagine = null;
        dupa?.();
      }, nod.trecere || 0);
    }
    // „durata” (ochiul de dragon din vis, decis de autor): imaginea stă doar câteva secunde, fără text și fără
    // portrete, apoi discuția trece singură mai departe; ceasul pornește abia când se vede imaginea
    el.classList.toggle('fara-caseta', !!nod.durata || (cuFilm && !nod.text));
    if (nod.durata) {
      const porneste = () => setTimeout(() => activ?.nod === nod && arataNod(nod.urmator ?? null), nod.durata);
      if (el.classList.contains('asteapta-imaginea')) activ.dupaImagine = porneste;
      else porneste();
    }
    if (!reluat && !faraFilm) laEfecte(nod.efecte);
    if (!activ) return; // un efect (de exemplu leșinul) poate închide dialogul
    // „arataCastiguri” (decis de autor: punctul de încredere pentru capcanele desfăcute): ce a primit Vale urcă pe
    // ecran chiar la replica asta, nu abia la capătul discuției; odată cu imaginea ei, dacă încă se încarcă
    if (nod.arataCastiguri && !reluat) {
      if (el.classList.contains('asteapta-imaginea')) {
        const inainte = activ.dupaImagine;
        activ.dupaImagine = () => (inainte?.(), laCapatulRamurii?.());
      } else laCapatulRamurii?.();
    }
    // Jocul ține minte unde a rămas discuția, ca la un refresh să continue de aici (nu să se piardă o misiune)
    laNod?.(activ.original, idNod, activ.imagine);

    // În dreapta stă cel care vorbește (într-o scenă cu mai mulți, de exemplu orcul și Bram); cât vorbește Vale,
    // rămâne ultimul dintre ei
    const vorbesteVale = nod.vorbitor === 'vale';
    // După un refresh, cine stătea în dreapta se află din replicile de dinainte (de la sătenii fără portret: nimeni),
    // nu din partenerul dialogului, care poate fi altcineva (mama, care a rămas acasă)
    if (reluat && !nod.faraPartener && !(nod.vorbitor && !vorbesteVale)) {
      for (let id = idNod, i = 0; id && i < 80; i++) {
        const n = activ.dialog.noduri[id];
        if (n?.faraPartener || n?.faraPortret) {
          activ.dreaptaGoala = true;
          break;
        }
        if (n?.vorbitor && n.vorbitor !== 'vale') {
          activ.inDreapta = n.vorbitor;
          activ.emotiePartener = n.emotie || 'normal';
          break;
        }
        id = Object.keys(activ.dialog.noduri).find((k) => activ.dialog.noduri[k].urmator === id);
      }
    }
    // „faraPartener”: de la replica asta, în dreapta nu mai stă nimeni (Vale pleacă de acasă cu pâinea), până vorbește altcineva
    if (nod.faraPartener) activ.dreaptaGoala = true;
    if (nod.vorbitor && !vorbesteVale) {
      activ.emotiePartener = nod.emotie || 'normal';
      activ.inDreapta = nod.vorbitor;
      // „faraPortret” (decis de autor: sătenii de la pâinea văduvelor n-au imagini): în dreapta nu stă nimeni, nici
      // cât îi răspunde Vale, iar lângă nume nu e medalion; Vale are portretul lui, ca mereu
      activ.dreaptaGoala = !!nod.faraPortret;
    }
    const partener = activ.dreaptaGoala ? null : activ.inDreapta || activ.dialog.partener;

    stanga.replaceChildren(portret('vale', vorbesteVale ? nod.emotie || 'normal' : emotieVale()));
    dreapta.replaceChildren(...(partener && partener !== 'vale' ? [portret(partener, activ.emotiePartener)] : []));
    // Cine nu vorbește e ușor întunecat, ca să fie clar cine are cuvântul
    stanga.classList.toggle('tacut', !vorbesteVale);
    dreapta.classList.toggle('tacut', vorbesteVale || !nod.vorbitor);

    // „nume” la replică: un vorbitor fără nume propriu care împrumută portretele altuia (orcii din tavernă)
    textNume.textContent = nod.vorbitor ? nod.nume || numeVorbitor(nod.vorbitor, activ.dialog) : '';
    // Fața din medalion urmează emoția replicii (decis de autor); fără portretul acela, cel „normal”
    const cheie = nod.vorbitor && !nod.faraPortret ? `${nod.vorbitor}_${nod.emotie || 'normal'}` : '';
    if (cheie !== cheieMedalion) {
      cheieMedalion = cheie;
      medalionNume.className = `medalion medalion-nume ${tabaraVorbitor?.(nod.vorbitor) || 'aliat'}`;
      medalionNume.replaceChildren(
        ...(cheie
          ? [elementImagine([`portraits/${cheie}.png`, `portraits/${nod.vorbitor}_normal.png`], { clasa: 'portret-medalion', raport: 1, eticheta: nod.vorbitor }), div('rama-medalion')]
          : []),
      );
    }
    nume.hidden = !nod.vorbitor;
    text.textContent = nod.text || '';
    caseta.classList.toggle('gand', !!nod.gand);

    let vizibile = (nod.alegeri || []).filter((a) => verificaConditii(a.conditii));
    // Ultima replică a unei ramuri: acum urcă pe ecran ce a primit Vale, dacă tocmai a terminat o misiune
    if (!vizibile.length && !nod.urmator) laCapatulRamurii?.();
    // La capătul unei ramuri (fără alegeri și fără continuare), meniul personajului apare direct sub replică
    if (activ.dialog.meniu && !vizibile.length && !nod.urmator && !nod.sfarsit) vizibile = meniu();
    alegeri.replaceChildren(
      ...vizibile.map((a, i) => {
        const b = document.createElement('button');
        b.className = 'alegere';
        b.textContent = `${i + 1}. ${a.text}`;
        // Semnul misiunii, lângă text: ! nouă, ? gri în lucru, ? auriu gata de predat
        if (a.semn) b.append(Object.assign(document.createElement('span'), { className: `semn-misiune ${a.semn}`, textContent: a.semn === 'nou' ? '!' : '?' }));
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

  // Opțiunile meniului; nodurile misiunilor (din alte dialoguri) se adaugă la dialogul de acum
  function meniu() {
    const { alegeri: lista, noduri } = optiuniMeniu(activ.dialog);
    activ.dialog = { ...activ.dialog, noduri: { ...noduri, ...activ.dialog.noduri } };
    return lista;
  }

  function alege(a) {
    laEfecte(a.efecte);
    if (!activ) return;
    // „inchide”: alegerea încheie discuția (La revedere, sau ceva care pornește după dialog: un eveniment, o luptă)
    if (a.inchide) return inchide();
    arataNod(a.spre ?? null);
  }

  function continua() {
    // Cu dialogul ascuns (ochiul), prima apăsare doar îl arată înapoi, nu sare peste replică
    if (ascuns()) return el.classList.remove('ascuns-text');
    // Cât merge o bucată de filmuleț, Spațiu și Enter o sar, ca și clicul
    if (film?.bucata) return film.bucata.sari();
    if (el.classList.contains('asteapta-imaginea')) return;
    if (activ && !activ.alegeri.length) arataNod(activ.nod.urmator ?? null);
  }

  function inchide() {
    if (!activ) return;
    lasaFilmul();
    el.hidden = true;
    fundal.replaceChildren();
    el.classList.remove('cu-imagine', 'asteapta-imaginea', 'vis', 'fara-caseta', 'ascuns-text');
    parinte.classList.remove('in-dialog');
    const { dialog } = activ;
    activ = null;
    laCapatulRamurii?.();
    laFinal(dialog);
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
    // „cuEfecte”: discuția continuă după un mini-joc (nu după un refresh), deci replica de la care continuă își
    // aplică efectele (punctul de încredere pentru capcanele desfăcute)
    porneste(dialog, { delaNod = null, imagine = null, cuEfecte = false } = {}) {
      activ = { dialog, original: dialog, emotiePartener: 'normal', alegeri: [], imagineReluata: imagine };
      el.hidden = false;
      // Visele (decis de autor): ceață pe marginile ecranului, ca să se vadă că e un vis
      el.classList.toggle('vis', !!dialog.vis);
      parinte.classList.add('in-dialog');
      if (delaNod) return arataNod(delaNod, !cuEfecte);
      // „start” poate fi o listă: primul nod ale cărui condiții sunt îndeplinite (prima întâlnire cu un personaj e o prezentare)
      // „aleator”: un nod ales la întâmplare din listă (replicile paznicului de la poartă), ca discuția să nu fie mereu aceeași
      const start = [].concat(dialog.start).find((s) => typeof s === 'string' || verificaConditii(s.conditii));
      const nod = typeof start === 'string' ? start : start?.aleator ? start.aleator[Math.floor(Math.random() * start.aleator.length)] : start?.nod;
      arataNod(nod);
    },
    inchide,
    activ: () => !!activ,
  };
}
