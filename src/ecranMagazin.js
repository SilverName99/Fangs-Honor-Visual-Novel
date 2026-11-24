import { pozitie, aplicaPozitie, INALTIME } from './scena.js';
import { iconita, descriere } from './ecranInventar.js';
import { ziua } from './stare.js';
import { t } from './limba.js';

// Magazinul (același la negustorul din piață, la Bram și la Agnes): după designul inventarului, cu două foi de
// pergament peste scena estompată. Stânga: marfa negustorului, dreapta: rucsacul lui Vale. Bucățile se aranjează
// în editor, la Aranjare → „Magazinul”. Un magazin poate avea și „schimburi” (Elian: 3 sunătoare → 1 pansament,
// decis de autor): în stânga stau schimburile, ce dai → ce primești, cu săgeata între ele, în loc de marfă.
const div = (clasa, text) => Object.assign(document.createElement('div'), { className: clasa, textContent: text ?? '' });
// Fiecare formă (singular / plural) are traducerea ei; se cheamă la desenare, deci urmează limba de acum
const monede = (n) => (n === 1 ? t('{n} monedă', { n }) : t('{n} monede', { n }));

export function creeazaEcranMagazin(parinte, joc) {
  const inv = joc.inventar;
  let el = null;
  let magazin = null; // acțiunea din date: { nume, titlu, vinde, cumpara }
  let selectat = null; // { din: 'marfa', id } | { din: 'rucsac', index }

  const pretVanzare = (id) => Math.max(1, Math.floor(inv.def(id).pret * (joc.date.config.magazin.procentVanzare / 100)));
  const cumparaDeLaMine = (id) => (magazin.cumpara || []).includes(id);

  function deschide(a) {
    magazin = a;
    selectat = null;
    if (!el) {
      el = div('ecran-magazin');
      parinte.append(el);
    }
    arata();
  }

  function inchide() {
    el?.remove();
    el = null;
    joc.dupaInventar();
  }

  function schimbat() {
    joc.salveaza();
    joc.actualizeazaHud();
    arata();
  }

  // Prețul la negustorul ăsta: „preturi” la magazin îl schimbă (săgețile, mai scumpe la Bram decât la Jarek,
  // decis de autor); altfel, prețul obiectului
  const pretAici = (id) => magazin.preturi?.[id] ?? inv.def(id).pret;

  function cumpara(id) {
    const s = joc.stare;
    const pret = pretAici(id);
    if (s.bani < pret) return joc.gand(t('N-am destui bani. Îmi trebuie {suma}.', { suma: monede(pret) }));
    if (!inv.incape(id)) return joc.gand(t('Nu mai am loc în rucsac.'));
    s.bani -= pret;
    inv.adauga(id, 1);
    joc.sunet.efect('monede');
    schimbat();
  }

  const cateAm = (id) => inv.numar(joc.stare.inventar, id);
  // Un schimb se numește „sch” (nu „t”), ca să nu ascundă t(), traducerea textelor
  const potSchimba = (sch) => Object.entries(sch.da).every(([id, n]) => cateAm(id) >= n);
  // „maxPeZi” la un schimb (carnea friptă la vatra de acasă: o bucată pe zi, decis de autor). Numărătoarea stă în
  // salvare ca la acțiuni (apa, pâinea), sub aceeași cheie, ca bucata gătită azi să conte și după o reîncărcare
  function folosiriAzi(sch) {
    const s = joc.stare;
    s.folosiri ||= {};
    const cheie = `${s.scena}/${sch.id}`;
    if (s.folosiri[cheie]?.zi !== ziua(s)) s.folosiri[cheie] = { zi: ziua(s), n: 0 };
    return s.folosiri[cheie];
  }
  const gataAzi = (sch) => sch.maxPeZi && folosiriAzi(sch).n >= sch.maxPeZi;

  function schimba(sch) {
    if (gataAzi(sch)) return joc.gand(sch.mesajMaxPeZi || t('Destul pentru azi. Mâine din nou.'));
    const lipsa = Object.entries(sch.da).find(([id, n]) => cateAm(id) < n);
    if (lipsa) return joc.gand(t('Îmi trebuie {n} × {obiect}. Am doar {am}.', { n: lipsa[1], obiect: inv.def(lipsa[0]).nume, am: cateAm(lipsa[0]) }));
    // Întâi dai, apoi primești: locul eliberat poate fi chiar cel în care intră ce primești
    for (const [id, n] of Object.entries(sch.da)) inv.scoate(id, n);
    const nuIncape = Object.keys(sch.primesti).find((id) => !inv.incape(id));
    if (nuIncape) {
      for (const [id, n] of Object.entries(sch.da)) inv.adauga(id, n);
      return joc.gand(t('Nu mai am loc în rucsac.'));
    }
    for (const [id, n] of Object.entries(sch.primesti)) inv.adauga(id, n);
    if (sch.maxPeZi) folosiriAzi(sch).n++;
    joc.sunet.efect('rucsac');
    // Un schimb care ține (carnea pe foc, 30 de minute): timpul trece; dacă Vale leșină, ecranul se închide
    if (sch.minute && joc.avanseaza(sch.minute)) return inchide();
    schimbat();
  }

  // Un rând de schimb: ce dai (cu cât ai sub el), săgeata, ce primești
  function randSchimb(sch, k) {
    const r = div('schimb');
    if (selectat?.din === 'marfa' && selectat.schimb === k) r.classList.add('selectat');
    const parte = (lista, cuCatAm) =>
      Object.entries(lista).map(([id, n]) => {
        const m = div('marfa');
        const cel = div('celula');
        cel.append(iconita(inv, id), div('numar', `×${n}`));
        cel.title = inv.def(id).nume;
        m.append(cel, cuCatAm ? Object.assign(div(`pret-marfa${cateAm(id) < n ? ' slab' : ''}`), { textContent: t('ai {n}', { n: cateAm(id) }) }) : div('pret-marfa', inv.def(id).nume));
        return m;
      });
    // Ce dai (unul sau mai multe materiale, unul lângă altul), săgeata, ce primești
    const grup = (lista, cuCatAm) => {
      const g = div('parte-schimb');
      g.append(...parte(lista, cuCatAm));
      return g;
    };
    r.append(grup(sch.da, true), Object.assign(div('sageata-schimb'), { textContent: '➜' }), grup(sch.primesti, false));
    // Un schimb pentru care n-ai destule (decis de autor) e decolorat, ca să se vadă repede ce nu poți face
    if (Object.entries(sch.da).some(([id, n]) => cateAm(id) < n) || gataAzi(sch)) r.classList.add('fara-materiale');
    r.onclick = () => ((selectat = { din: 'marfa', schimb: k }), arata());
    return r;
  }

  function vinde(index) {
    const s = joc.stare;
    const x = s.inventar[index];
    if (!x) return;
    const id = x.id;
    inv.scoate(id, 1);
    s.bani += pretVanzare(id);
    joc.sunet.efect('monede');
    // Dacă stiva s-a terminat, selecția trece pe nimic (altfel ar arăta alt obiect, venit pe același loc)
    if (!s.inventar[index] || s.inventar[index].id !== id) selectat = null;
    schimbat();
  }

  // Bucată pusă unde a așezat-o autorul; foile au designul fix de 900 × 1250, micșorat cât e foaia pe ecran
  function asaza(elem, o, i, z) {
    const p = pozitie(joc.date.aranjare.magazin, o, i);
    aplicaPozitie(elem, p);
    elem.classList.add('obiect');
    if (z) elem.style.zIndex = String(z);
    el.append(elem);
    return p;
  }
  function foaie(o, i) {
    const f = div('foaie-inv');
    const p = asaza(f, o, i, 1000);
    const c = div('continut-foaie');
    c.style.transform = `scale(${(p.scara * INALTIME) / 1250})`;
    f.append(c);
    return c;
  }
  function capFoaie(text, dreapta) {
    const cap = div('cap-foaie');
    cap.append(div('titlu-foaie', text));
    if (dreapta) cap.append(div('numar-foaie', dreapta));
    return cap;
  }
  function pret(n, slab = false) {
    const p = div(`pret-marfa${slab ? ' slab' : ''}`);
    p.append(Object.assign(div('icon-hud icon-monede'), { textContent: '🪙' }), div('', String(n)));
    return p;
  }

  // Caseta obiectului ales, jos pe foaia lui (ca la inventar)
  function detalii(pe) {
    const s = joc.stare;
    const casuta = div('detalii-inv');
    const schimbAles = selectat?.schimb !== undefined ? magazin.schimburi[selectat.schimb] : null;
    const id = schimbAles ? Object.keys(schimbAles.primesti)[0] : selectat?.din === 'marfa' ? selectat.id : selectat?.din === 'rucsac' ? s.inventar[selectat.index]?.id : null;
    if (!id || selectat.din !== pe) {
      const ajutor = magazin.schimburi
        ? pe === 'marfa' ? t('Apasă pe un schimb ca să vezi ce primești.') : t('Aici vezi ce ai în rucsac.')
        : pe === 'marfa' ? t('Apasă pe un obiect ca să vezi ce face și cât costă.') : t('Apasă pe un obiect din rucsac ca să-l vinzi.');
      casuta.append(div('ajutor-inv', ajutor));
      return casuta;
    }
    const d = inv.def(id);
    if (selectat.schimb !== undefined) {
      const sch = magazin.schimburi[selectat.schimb];
      const text = div('text-detalii');
      const lista = (o) => Object.entries(o).map(([x, n]) => `${n} × ${inv.def(x).nume}`).join(', ');
      // Cu durata, propoziția întreagă trece prin t(), ca engleza să poată spune minutele în felul ei
      const titlu = sch.minute ? t('{da} → {primesti} ({n} de minute)', { da: lista(sch.da), primesti: lista(sch.primesti), n: sch.minute }) : `${lista(sch.da)} → ${lista(sch.primesti)}`;
      text.append(div('nume-obiect', titlu), div('descriere-obiect', descriere(inv, id)));
      const act = div('actiuni-inv');
      act.append(Object.assign(document.createElement('button'), { className: 'buton buton-mic-meniu', textContent: sch.buton || t('Schimbă'), onclick: () => schimba(sch) }));
      if (gataAzi(sch)) act.append(div('ajutor-inv', sch.mesajMaxPeZi || t('Destul pentru azi.')));
      else if (!potSchimba(sch)) act.append(div('ajutor-inv', t('N-ai destule.')));
      text.append(act);
      const ic = div('iconita-detalii');
      ic.append(iconita(inv, id));
      casuta.append(ic, text);
      return casuta;
    }
    const ic = div('iconita-detalii');
    ic.append(iconita(inv, id));
    const text = div('text-detalii');
    text.append(div('nume-obiect', d.nume), div('descriere-obiect', descriere(inv, id)));
    const act = div('actiuni-inv');
    const b = (eticheta, clic) => act.append(Object.assign(document.createElement('button'), { className: 'buton buton-mic-meniu', textContent: eticheta, onclick: clic }));
    if (pe === 'marfa') b(t('Cumpără · {pret}', { pret: monede(pretAici(id)) }), () => cumpara(id));
    else if (cumparaDeLaMine(id)) b(t('Vinde · {pret}', { pret: monede(pretVanzare(id)) }), () => vinde(selectat.index));
    else act.append(div('ajutor-inv', t('Negustorul ăsta nu cumpără așa ceva.')));
    text.append(act);
    casuta.append(ic, text);
    return casuta;
  }

  function arata() {
    const s = joc.stare;
    const ecran = joc.lume.get('magazin');
    el.replaceChildren();
    ecran.obiecte.forEach((o, i) => {
      if (o.tip === 'mag-marfa') {
        const c = foaie(o, i);
        c.append(capFoaie(magazin.titlu || magazin.nume || t('Marfa')));
        const g = div('grila-inv grila-marfa');
        (magazin.schimburi || []).forEach((sch, k) => g.append(randSchimb(sch, k)));
        for (const id of magazin.vinde || []) {
          const m = div('marfa');
          const cel = div('celula');
          if (selectat?.din === 'marfa' && selectat.id === id) cel.classList.add('selectata');
          cel.append(iconita(inv, id));
          cel.title = inv.def(id).nume;
          m.append(cel, pret(pretAici(id), s.bani < pretAici(id)));
          m.onclick = () => ((selectat = { din: 'marfa', id }), arata());
          g.append(m);
        }
        c.append(g, detalii('marfa'));
      } else if (o.tip === 'mag-rucsac') {
        const c = foaie(o, i);
        c.append(capFoaie(t('Rucsacul tău'), `${inv.ocupate(s.inventar) + 1} / ${inv.capacitateRucsac()}`));
        const g = div('grila-inv grila-marfa');
        // Monedele stau și aici în rucsac, în căsuța lor (ocupă un loc), fără preț
        const mm = div('marfa');
        const cm = div('celula celula-monede');
        cm.append(iconita(inv, 'monede'), div('numar', String(s.bani)));
        cm.title = t('{n} monede', { n: s.bani });
        mm.append(cm, div('pret-marfa gol'));
        g.append(mm);
        s.inventar.forEach((x, index) => {
          const m = div('marfa');
          const lat = inv.sloturiStiva(x);
          if (lat > 1) m.style.gridColumn = `span ${lat}`;
          const cel = div('celula');
          if (selectat?.din === 'rucsac' && selectat.index === index) cel.classList.add('selectata');
          cel.append(iconita(inv, x.id));
          if (x.n > 1) cel.append(div('numar', String(x.n)));
          cel.title = inv.def(x.id).nume;
          // Sub ce cumpără negustorul se vede prețul de vânzare; restul e estompat
          // La schimburi, în rucsac e luminat doar ce se poate da (sunătoarea), fără prețuri
          const deDat = (magazin.schimburi || []).some((sch) => sch.da[x.id]);
          m.append(cel, cumparaDeLaMine(x.id) ? pret(pretVanzare(x.id)) : div('pret-marfa gol'));
          if (!cumparaDeLaMine(x.id) && !deDat) m.classList.add('nu-cumpara');
          m.onclick = () => ((selectat = { din: 'rucsac', index }), arata());
          g.append(m);
        });
        for (let k = inv.ocupate(s.inventar); k < inv.capacitate(); k++) {
          const m = div('marfa');
          m.append(div('celula goala'), div('pret-marfa gol'));
          g.append(m);
        }
        c.append(g, detalii('rucsac'));
      } else if (o.tip === 'mag-monede') {
        // La schimburi (Elian) nu se plătește nimic, deci monedele n-au ce căuta sus
        if (!magazin.vinde?.length && magazin.schimburi) return;
        const m = div('monede-magazin');
        m.append(Object.assign(div('icon-hud icon-monede'), { textContent: '🪙' }), div('', t('Ai {suma}', { suma: monede(s.bani) })));
        const p = asaza(m, o, i, 1700);
        m.style.fontSize = `${p.scara * INALTIME * 0.6}px`;
      } else if (o.tip === 'mag-inchide') {
        const b = Object.assign(document.createElement('button'), { className: 'buton buton-mic-meniu inchide-inv', textContent: t('Închide'), onclick: inchide });
        const p = asaza(b, o, i, 1700);
        b.style.fontSize = `${p.scara * INALTIME * 0.4}px`;
      }
    });
  }

  return { deschide, inchide, deschis: () => !!el };
}
