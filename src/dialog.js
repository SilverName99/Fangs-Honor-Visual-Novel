import { elementImagine, schimbaImagine, urlImagine } from './imagini.js';
import { volumEfecte } from './sunet.js';

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
  // Un clic oriunde sare filmulețul (decis de autor), ca jocul să nu oblige pe nimeni să-l vadă din nou
  el.addEventListener('click', () => video && activ?.nod === video.nod && arataNod(video.nod.urmator ?? null));
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

  // Filmulețul de acum (visele, decis de autor). Când discuția trece mai departe, se oprește, ca să nu se mai
  // audă sub replici; unul care pornise rămâne ca fundal, oprit pe cadrul lui, până îl acoperă imaginea
  // replicii următoare, iar unul care încă nu pornise nu mai are ce căuta pe ecran
  let video = null;
  function opresteVideo() {
    if (!video) return;
    clearTimeout(video.asteptare);
    video.el.pause();
    if (!video.pornit) {
      video.strat.remove();
      // Replica următoare nu mai așteaptă un filmuleț care nu vine (o pune înapoi, dacă are o imagine a ei)
      el.classList.remove('asteapta-imaginea');
    }
    video = null;
  }

  // „video” la replică (decis de autor: câte un filmuleț la fiecare vis): pe tot ecranul, fără text și fără
  // portrete, cu ceața visului peste el; la sfârșit (sau la un clic) discuția trece singură mai departe.
  // Un filmuleț care lipsește (sau nu merge) se sare, iar visul merge cu imaginile lui, ca înainte: „faraVideo”
  // e replica de la care continuă atunci (al doilea vis: cele două imagini pe care filmulețul le înlocuiește)
  function arataVideo(nod, idNod) {
    const mai = (lipsa = false) => activ?.nod === nod && arataNod((lipsa && nod.faraVideo) || (nod.urmator ?? null));
    activ.alegeri = [];
    el.classList.add('cu-imagine', 'asteapta-imaginea', 'fara-caseta');
    // După un refresh, filmulețul pornește din nou de la început
    laNod?.(activ.original, idNod, activ.imagine);
    const strat = div('strat-video');
    const v = document.createElement('video');
    v.playsInline = true;
    v.preload = 'auto';
    const nivel = volumEfecte();
    v.volume = Math.min(1, nivel);
    v.muted = nivel <= 0;
    strat.append(v);
    fundal.append(strat);
    const acum = (video = { nod, el: v, strat, pornit: false });
    const sari = () => {
      if (video !== acum || acum.pornit) return;
      opresteVideo();
      mai(true);
    };
    v.onerror = sari;
    // Un filmuleț care nu vine deloc (rețeaua) nu ține visul pe loc
    acum.asteptare = setTimeout(sari, 12000);
    v.oncanplay = () => {
      if (video !== acum || acum.pornit) return;
      acum.pornit = true;
      clearTimeout(acum.asteptare);
      // Cele de dinainte (imaginea de sub replica veche) dispar abia când se vede filmulețul
      for (const x of [...fundal.children]) if (x !== strat) x.remove();
      strat.classList.add('vizibil');
      el.classList.remove('asteapta-imaginea');
      // Fără un clic în pagină, browserul nu lasă sunetul: atunci merge fără sunet, nu deloc
      v.play()?.catch(() => {
        v.muted = true;
        v.play()?.catch(() => {});
      });
    };
    v.onended = () => video === acum && mai();
    v.src = urlImagine(nod.video);
  }

  // „reluat”: discuția continuă după un refresh al paginii, de la replica la care rămăsese; efectele ei s-au
  // aplicat deja (și s-au salvat), deci nu se mai aplică o dată
  function arataNod(idNod, reluat = false) {
    opresteVideo();
    const nod = idNod ? activ.dialog.noduri[idNod] : null;
    if (!nod) return inchide();
    activ.nod = nod;
    activ.dupaImagine = null;
    if (nod.video) return arataVideo(nod, idNod);
    // „trezire” (visele, decis de autor): Vale se trezește; imaginea visului și ceața dispar, rămâne locul unde a dormit
    if (nod.trezire) {
      fundal.replaceChildren();
      el.classList.remove('cu-imagine', 'asteapta-imaginea', 'vis');
      activ.imagine = null;
      activ.imagineReluata = null;
    }
    // „amintire” (decis de autor: povestea Kaiei despre Ember): replicile peste o amintire au ceața de la vise, ca să
    // se vadă că e trecutul; o pune fiecare replică din amintire (și după un refresh), o ia „trezire”
    if (nod.amintire) el.classList.add('vis');
    // La reluare, imaginea de sub replici e cea de dinainte de refresh (replica de acum poate să n-o aibă pe a ei)
    const imagine = nod.imagine || (reluat ? activ.imagineReluata : null);
    if (imagine && imagine !== activ.imagine) {
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
    el.classList.toggle('fara-caseta', !!nod.durata);
    if (nod.durata) {
      const porneste = () => setTimeout(() => activ?.nod === nod && arataNod(nod.urmator ?? null), nod.durata);
      if (el.classList.contains('asteapta-imaginea')) activ.dupaImagine = porneste;
      else porneste();
    }
    if (!reluat) laEfecte(nod.efecte);
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
    if (nod.vorbitor && !vorbesteVale) {
      activ.emotiePartener = nod.emotie || 'normal';
      activ.inDreapta = nod.vorbitor;
    }
    const partener = activ.inDreapta || activ.dialog.partener;

    stanga.replaceChildren(portret('vale', vorbesteVale ? nod.emotie || 'normal' : emotieVale()));
    dreapta.replaceChildren(...(partener && partener !== 'vale' ? [portret(partener, activ.emotiePartener)] : []));
    // Cine nu vorbește e ușor întunecat, ca să fie clar cine are cuvântul
    stanga.classList.toggle('tacut', !vorbesteVale);
    dreapta.classList.toggle('tacut', vorbesteVale || !nod.vorbitor);

    // „nume” la replică: un vorbitor fără nume propriu care împrumută portretele altuia (orcii din tavernă)
    textNume.textContent = nod.vorbitor ? nod.nume || numeVorbitor(nod.vorbitor, activ.dialog) : '';
    // Fața din medalion urmează emoția replicii (decis de autor); fără portretul acela, cel „normal”
    const cheie = nod.vorbitor ? `${nod.vorbitor}_${nod.emotie || 'normal'}` : '';
    if (cheie !== cheieMedalion) {
      cheieMedalion = cheie;
      medalionNume.className = `medalion medalion-nume ${tabaraVorbitor?.(nod.vorbitor) || 'aliat'}`;
      medalionNume.replaceChildren(
        ...(nod.vorbitor
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
    if (el.classList.contains('asteapta-imaginea')) return;
    if (activ && !activ.alegeri.length) arataNod(activ.nod.urmator ?? null);
  }

  function inchide() {
    if (!activ) return;
    opresteVideo();
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
