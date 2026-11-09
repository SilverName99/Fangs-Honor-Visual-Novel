import { pozitie, aplicaPozitie, INALTIME } from './scena.js';
import { iconita, descriere } from './ecranInventar.js';

// Magazinul (același la negustorul din piață, la Bram și la Agnes): după designul inventarului, cu două foi de
// pergament peste scena estompată. Stânga: marfa negustorului, dreapta: rucsacul lui Vale. Bucățile se aranjează
// în editor, la Aranjare → „Magazinul”. Un magazin poate avea și „schimburi” (Elian: 3 sunătoare → 1 pansament,
// decis de autor): în stânga stau schimburile, ce dai → ce primești, cu săgeata între ele, în loc de marfă.
const div = (clasa, text) => Object.assign(document.createElement('div'), { className: clasa, textContent: text ?? '' });
const monede = (n) => `${n} ${n === 1 ? 'monedă' : 'monede'}`;

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

  function cumpara(id) {
    const s = joc.stare;
    const pret = inv.def(id).pret;
    if (s.bani < pret) return joc.gand(`N-am destui bani. Îmi trebuie ${monede(pret)}.`);
    if (!inv.incape(id)) return joc.gand('Nu mai am loc în rucsac.');
    s.bani -= pret;
    inv.adauga(id, 1);
    joc.sunet.efect('monede');
    schimbat();
  }

  const cateAm = (id) => inv.numar(joc.stare.inventar, id);
  const potSchimba = (t) => Object.entries(t.da).every(([id, n]) => cateAm(id) >= n);

  function schimba(t) {
    const lipsa = Object.entries(t.da).find(([id, n]) => cateAm(id) < n);
    if (lipsa) return joc.gand(`Îmi trebuie ${lipsa[1]} × ${inv.def(lipsa[0]).nume}. Am doar ${cateAm(lipsa[0])}.`);
    // Întâi dai, apoi primești: locul eliberat poate fi chiar cel în care intră ce primești
    for (const [id, n] of Object.entries(t.da)) inv.scoate(id, n);
    const nuIncape = Object.keys(t.primesti).find((id) => !inv.incape(id));
    if (nuIncape) {
      for (const [id, n] of Object.entries(t.da)) inv.adauga(id, n);
      return joc.gand('Nu mai am loc în rucsac.');
    }
    for (const [id, n] of Object.entries(t.primesti)) inv.adauga(id, n);
    joc.sunet.efect('rucsac');
    schimbat();
  }

  // Un rând de schimb: ce dai (cu cât ai sub el), săgeata, ce primești
  function randSchimb(t, k) {
    const r = div('schimb');
    if (selectat?.din === 'marfa' && selectat.schimb === k) r.classList.add('selectat');
    const parte = (lista, cuCatAm) =>
      Object.entries(lista).map(([id, n]) => {
        const m = div('marfa');
        const cel = div('celula');
        cel.append(iconita(inv, id), div('numar', `×${n}`));
        cel.title = inv.def(id).nume;
        m.append(cel, cuCatAm ? Object.assign(div(`pret-marfa${cateAm(id) < n ? ' slab' : ''}`), { textContent: `ai ${cateAm(id)}` }) : div('pret-marfa', inv.def(id).nume));
        return m;
      });
    // Ce dai (unul sau mai multe materiale, unul lângă altul), săgeata, ce primești
    const grup = (lista, cuCatAm) => {
      const g = div('parte-schimb');
      g.append(...parte(lista, cuCatAm));
      return g;
    };
    r.append(grup(t.da, true), Object.assign(div('sageata-schimb'), { textContent: '➜' }), grup(t.primesti, false));
    // Un schimb pentru care n-ai destule (decis de autor) e decolorat, ca să se vadă repede ce nu poți face
    if (Object.entries(t.da).some(([id, n]) => cateAm(id) < n)) r.classList.add('fara-materiale');
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
        ? pe === 'marfa' ? 'Apasă pe un schimb ca să vezi ce primești.' : 'Aici vezi ce ai în rucsac.'
        : pe === 'marfa' ? 'Apasă pe un obiect ca să vezi ce face și cât costă.' : 'Apasă pe un obiect din rucsac ca să-l vinzi.';
      casuta.append(div('ajutor-inv', ajutor));
      return casuta;
    }
    const d = inv.def(id);
    if (selectat.schimb !== undefined) {
      const t = magazin.schimburi[selectat.schimb];
      const text = div('text-detalii');
      const lista = (o) => Object.entries(o).map(([x, n]) => `${n} × ${inv.def(x).nume}`).join(', ');
      text.append(div('nume-obiect', `${lista(t.da)} → ${lista(t.primesti)}`), div('descriere-obiect', descriere(inv, id)));
      const act = div('actiuni-inv');
      act.append(Object.assign(document.createElement('button'), { className: 'buton buton-mic-meniu', textContent: 'Schimbă', onclick: () => schimba(t) }));
      if (!potSchimba(t)) act.append(div('ajutor-inv', 'N-ai destule.'));
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
    const b = (t, clic) => act.append(Object.assign(document.createElement('button'), { className: 'buton buton-mic-meniu', textContent: t, onclick: clic }));
    if (pe === 'marfa') b(`Cumpără · ${monede(d.pret)}`, () => cumpara(id));
    else if (cumparaDeLaMine(id)) b(`Vinde · ${monede(pretVanzare(id))}`, () => vinde(selectat.index));
    else act.append(div('ajutor-inv', 'Negustorul ăsta nu cumpără așa ceva.'));
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
        c.append(capFoaie(magazin.titlu || magazin.nume || 'Marfa'));
        const g = div('grila-inv grila-marfa');
        (magazin.schimburi || []).forEach((t, k) => g.append(randSchimb(t, k)));
        for (const id of magazin.vinde || []) {
          const m = div('marfa');
          const cel = div('celula');
          if (selectat?.din === 'marfa' && selectat.id === id) cel.classList.add('selectata');
          cel.append(iconita(inv, id));
          cel.title = inv.def(id).nume;
          m.append(cel, pret(inv.def(id).pret, s.bani < inv.def(id).pret));
          m.onclick = () => ((selectat = { din: 'marfa', id }), arata());
          g.append(m);
        }
        c.append(g, detalii('marfa'));
      } else if (o.tip === 'mag-rucsac') {
        const c = foaie(o, i);
        c.append(capFoaie('Rucsacul tău', `${inv.ocupate(s.inventar) + 1} / ${inv.capacitateRucsac()}`));
        const g = div('grila-inv grila-marfa');
        // Monedele stau și aici în rucsac, în căsuța lor (ocupă un loc), fără preț
        const mm = div('marfa');
        const cm = div('celula celula-monede');
        cm.append(iconita(inv, 'monede'), div('numar', String(s.bani)));
        cm.title = `${s.bani} monede`;
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
          const deDat = (magazin.schimburi || []).some((t) => t.da[x.id]);
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
        m.append(Object.assign(div('icon-hud icon-monede'), { textContent: '🪙' }), div('', `Ai ${monede(s.bani)}`));
        const p = asaza(m, o, i, 1700);
        m.style.fontSize = `${p.scara * INALTIME * 0.6}px`;
      } else if (o.tip === 'mag-inchide') {
        const b = Object.assign(document.createElement('button'), { className: 'buton buton-mic-meniu inchide-inv', textContent: 'Închide', onclick: inchide });
        const p = asaza(b, o, i, 1700);
        b.style.fontSize = `${p.scara * INALTIME * 0.4}px`;
      }
    });
  }

  return { deschide, inchide, deschis: () => !!el };
}
