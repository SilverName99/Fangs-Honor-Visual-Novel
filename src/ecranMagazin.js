import { pozitie, aplicaPozitie, INALTIME } from './scena.js';
import { iconita, descriere } from './ecranInventar.js';

// Magazinul (același la negustorul din piață, la Bram și la Agnes): după designul inventarului, cu două foi de
// pergament peste scena estompată. Stânga: marfa negustorului, dreapta: rucsacul lui Vale. Bucățile se aranjează
// în editor, la Aranjare → „Magazinul”.
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
    const id = selectat?.din === 'marfa' ? selectat.id : selectat?.din === 'rucsac' ? s.inventar[selectat.index]?.id : null;
    if (!id || selectat.din !== pe) {
      casuta.append(div('ajutor-inv', pe === 'marfa' ? 'Apasă pe un obiect ca să vezi ce face și cât costă.' : 'Apasă pe un obiect din rucsac ca să-l vinzi.'));
      return casuta;
    }
    const d = inv.def(id);
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
        c.append(capFoaie('Rucsacul tău', `${inv.ocupate(s.inventar)} / ${inv.capacitate()}`));
        const g = div('grila-inv grila-marfa');
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
          m.append(cel, cumparaDeLaMine(x.id) ? pret(pretVanzare(x.id)) : div('pret-marfa gol'));
          if (!cumparaDeLaMine(x.id)) m.classList.add('nu-cumpara');
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
