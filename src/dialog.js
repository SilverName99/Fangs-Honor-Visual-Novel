import { elementImagine, schimbaImagine } from './imagini.js';

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
  el.append(fundal, stanga, dreapta, caseta);
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

  // „reluat”: discuția continuă după un refresh al paginii, de la replica la care rămăsese; efectele ei s-au
  // aplicat deja (și s-au salvat), deci nu se mai aplică o dată
  function arataNod(idNod, reluat = false) {
    const nod = idNod ? activ.dialog.noduri[idNod] : null;
    if (!nod) return inchide();
    activ.nod = nod;
    // La reluare, imaginea de sub replici e cea de dinainte de refresh (replica de acum poate să n-o aibă pe a ei)
    const imagine = nod.imagine || (reluat ? activ.imagineReluata : null);
    if (imagine && imagine !== activ.imagine) {
      activ.imagine = imagine;
      // Galeria din meniu ține minte și imaginile de sub replici (scandalul din tavernă se petrece peste ele)
      laImagine?.(imagine);
      el.classList.add('cu-imagine', 'asteapta-imaginea');
      // Replicile și portretele apar abia când se vede imaginea, ca între două imagini să nu clipească dialogul
      schimbaImagine(fundal, elementImagine([imagine], { clasa: 'imagine-fundal-dialog', fundal: true, eticheta: imagine }), () =>
        el.classList.remove('asteapta-imaginea'),
      );
    }
    if (!reluat) laEfecte(nod.efecte);
    if (!activ) return; // un efect (de exemplu leșinul) poate închide dialogul
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
    if (el.classList.contains('asteapta-imaginea')) return;
    if (activ && !activ.alegeri.length) arataNod(activ.nod.urmator ?? null);
  }

  function inchide() {
    if (!activ) return;
    el.hidden = true;
    fundal.replaceChildren();
    el.classList.remove('cu-imagine', 'asteapta-imaginea', 'vis');
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
    porneste(dialog, { delaNod = null, imagine = null } = {}) {
      activ = { dialog, original: dialog, emotiePartener: 'normal', alegeri: [], imagineReluata: imagine };
      el.hidden = false;
      // Visele (decis de autor): ceață pe marginile ecranului, ca să se vadă că e un vis
      el.classList.toggle('vis', !!dialog.vis);
      parinte.classList.add('in-dialog');
      if (delaNod) return arataNod(delaNod, true);
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
