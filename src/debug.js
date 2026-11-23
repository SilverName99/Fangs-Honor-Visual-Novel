import { schimbaNevoie, ziua, formatOra } from './stare.js';
import { MINUTE_ZI, inMinute, ziSaptamana, NUME_ZILE } from './timp.js';
import { urlImagine } from './imagini.js';

const NEVOI = ['viata', 'stamina', 'foame', 'sete'];
const NUME_NEVOI = { viata: 'Viață', stamina: 'Stamina', foame: 'Foame', sete: 'Sete' };

// Taburile (cerut de autor: panoul era o listă lungă, greu de parcurs). „cauta” = tab-ul are căsuța de căutare
const TABURI = [
  { id: 'vale', nume: 'Vale' },
  { id: 'misiuni', nume: 'Misiuni', cauta: 'Caută o misiune sau un personaj...' },
  { id: 'stari', nume: 'Stări', cauta: 'Caută o stare...' },
  { id: 'locuri', nume: 'Locuri', cauta: 'Caută un loc...' },
  { id: 'evenimente', nume: 'Evenimente', cauta: 'Caută un eveniment...' },
  { id: 'obiecte', nume: 'Obiecte', cauta: 'Caută un obiect...' },
  { id: 'lupta', nume: 'Luptă', cauta: 'Caută o luptă...' },
];
const NUME_STATUS = { inceputa: 'în lucru', terminata: 'terminată', ratata: 'ratată' };
const NUME_TIP_OBIECT = { consumabil: 'De mâncat și de băut', material: 'Materiale', echipament: 'Echipament', poveste: 'Obiecte de poveste' };

// Căutarea nu ține cont de diacritice și de litere mari („lumanari” găsește „Lumânările”)
const simplu = (t) => String(t ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

// Ce alegeri rămân de la o deschidere la alta (tab-ul, partea ecranului): doar în browser, nu în salvare
const CHEIE = 'fh_debug';
function citestePref() {
  try {
    return JSON.parse(localStorage.getItem(CHEIE) || '{}');
  } catch {
    return {};
  }
}
function scriePref(p) {
  try {
    localStorage.setItem(CHEIE, JSON.stringify(p));
  } catch {
    // Fără loc în browser: panoul pornește doar de la tab-ul implicit
  }
}

// Ce stări folosesc datele (de exemplu acoperis: stricat/reparat), ca panoul să le ofere ca liste
function stariCunoscute(date) {
  const gasite = {};
  const cauta = (x) => {
    if (Array.isArray(x)) return x.forEach(cauta);
    if (!x || typeof x !== 'object') return;
    for (const [k, v] of Object.entries(x)) {
      if (k === 'stare' && v && typeof v === 'object' && !Array.isArray(v)) {
        for (const [cheie, val] of Object.entries(v)) (gasite[cheie] ||= new Set()).add(val);
      } else cauta(v);
    }
  };
  cauta([date.locations, date.events, date.dialoguri]);
  for (const [k, v] of Object.entries(date.config.start.stari || {})) (gasite[k] ||= new Set()).add(v);
  return gasite;
}

export function creeazaDebug(parinte, joc) {
  const el = document.createElement('div');
  el.className = 'debug';
  el.hidden = true;
  parinte.append(el);
  const stari = stariCunoscute(joc.date);
  const stariOrdonate = Object.keys(stari).sort();
  const pref = { tab: 'vale', dreapta: false, filtruMisiuni: 'toate', doarSetate: false, ...citestePref() };
  if (!TABURI.some((t) => t.id === pref.tab)) pref.tab = 'vale';
  // Textul căutat și cât era derulat, pe fiecare tab: panoul se redesenează la fiecare schimbare din joc
  const cautare = {};
  const derulare = {};
  // Alegerile din „Testare luptă” rămân ținute minte cât e pagina deschisă (panoul se redesenează des)
  const test = { fundal: null, arma: '__echipat', scut: false, aliati: new Set(), inamici: {}, puternici: false, slabi: false, finala: false };
  const LOCURI = [1, 0, 2].map((l) => ({ linie: l, rand: 'fata' })).concat([1, 0, 2].map((l) => ({ linie: l, rand: 'spate' })));
  const numePersonaj = (id) => joc.date.npcs.personaje.find((p) => p.id === id)?.nume || id;
  // Încrederea o au doar cei 6 din carte fără „faraIncredere” (decis de autor)
  const cuIncredere = joc.date.npcs.personaje.filter((p) => p.carte && !p.carte.faraIncredere);
  const maxIncredere = joc.date.config.incredere?.max ?? 10;

  // Scheletul se face o singură dată: așa căsuța de căutare nu-și pierde textul și cursorul la fiecare redesenare
  el.innerHTML = `
    <div class="d-cap">
      <b>Debug</b><span class="d-acum"></span>
      <button class="d-latura" title="Mută panoul în cealaltă parte a ecranului">⇄</button>
      <button class="d-inchide" title="Închide (F2)">✕</button>
    </div>
    <div class="d-taburi">${TABURI.map((t) => `<button data-tab="${t.id}">${t.nume}</button>`).join('')}</div>
    <div class="d-cauta"><input type="search" spellcheck="false"><button class="d-sterge" title="Șterge căutarea">✕</button></div>
    <div class="d-corp"></div>`;
  const corp = el.querySelector('.d-corp');
  const camp = el.querySelector('.d-cauta input');

  el.querySelectorAll('[data-tab]').forEach((b) => {
    b.onclick = () => {
      derulare[pref.tab] = corp.scrollTop;
      pref.tab = b.dataset.tab;
      scriePref(pref);
      arata();
    };
  });
  el.querySelector('.d-latura').onclick = () => {
    pref.dreapta = !pref.dreapta;
    scriePref(pref);
    arata();
  };
  el.querySelector('.d-inchide').onclick = () => {
    el.hidden = true;
  };
  camp.oninput = () => {
    cautare[pref.tab] = camp.value;
    corp.scrollTop = 0;
    deseneazaCorp();
  };
  el.querySelector('.d-sterge').onclick = () => {
    camp.value = '';
    cautare[pref.tab] = '';
    deseneazaCorp();
    camp.focus();
  };

  function laOra(hhmm) {
    const s = joc.stare;
    s.minute = Math.floor(s.minute / MINUTE_ZI) * MINUTE_ZI + inMinute(hhmm);
    joc.dupaSchimbare(true);
  }

  function arata() {
    if (el.hidden) return;
    const s = joc.stare;
    el.classList.toggle('dreapta', pref.dreapta);
    const zi = ziua(s);
    el.querySelector('.d-acum').textContent = `Ziua ${zi}, ${NUME_ZILE[ziSaptamana(zi)]}, ${formatOra(s)} · ${joc.lume.get(s.scena)?.titlu || s.scena}`;
    el.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('activ', b.dataset.tab === pref.tab));
    const tab = TABURI.find((t) => t.id === pref.tab);
    el.querySelector('.d-cauta').hidden = !tab.cauta;
    camp.placeholder = tab.cauta || '';
    if (camp.value !== (cautare[pref.tab] || '')) camp.value = cautare[pref.tab] || '';
    deseneazaCorp();
  }

  // Doar conținutul tab-ului, cu derularea păstrată (un clic pe „Pornește” nu te mai aruncă la începutul listei)
  function deseneazaCorp() {
    const sus = corp.dataset.tab === pref.tab ? corp.scrollTop : derulare[pref.tab] || 0;
    const filtru = simplu(cautare[pref.tab]);
    const potriveste = (...texte) => !filtru || texte.some((t) => simplu(t).includes(filtru));
    corp.innerHTML = { vale: tabVale, misiuni: tabMisiuni, stari: tabStari, locuri: tabLocuri, evenimente: tabEvenimente, obiecte: tabObiecte, lupta: tabLupta }[pref.tab](potriveste);
    corp.dataset.tab = pref.tab;
    corp.scrollTop = sus;
  }

  const gol = (t = 'Nimic nu se potrivește cu ce ai căutat.') => `<p class="d-gol">${t}</p>`;
  const sectiune = (titlu, continut) => `<section class="d-sectiune"><h5>${titlu}</h5>${continut}</section>`;

  // ---------- Vale și timpul ----------
  function tabVale() {
    const s = joc.stare;
    return (
      sectiune(
        'Timpul',
        `<div class="d-rand"><button data-act="plus" data-min="10">+10 min</button><button data-act="plus" data-min="60">+1 oră</button><button data-act="plus" data-min="360">+6 ore</button><button data-act="zi-noua">Ziua următoare, 07:00</button></div>
        <div class="d-rand"><button data-act="ora" data-ora="06:00">06:00</button><button data-act="ora" data-ora="09:00">09:00</button><button data-act="ora" data-ora="12:00">12:00</button><button data-act="ora" data-ora="15:00">15:00</button><button data-act="ora" data-ora="18:00">18:00</button><button data-act="ora" data-ora="21:00">21:00</button><button data-act="ora" data-ora="23:30">23:30</button></div>
        <div class="d-rand">Ora exactă <input type="time" class="d-ora" value="${formatOra(s)}"><button data-act="ora-exacta">Mergi</button>
          · Ziua <input type="number" min="1" class="d-zi" value="${ziua(s)}"><button data-act="zi-exacta">Sari</button></div>`,
      ) +
      sectiune(
        'Nevoile lui Vale',
        NEVOI.map((n) => `<label class="d-rand d-nevoie"><span>${NUME_NEVOI[n]}</span><input type="range" min="0" max="100" data-nevoie="${n}" value="${Math.round(s.nevoi[n])}"><b>${Math.round(s.nevoi[n])}</b></label>`).join('') +
          `<div class="d-rand"><button data-act="nevoi-pline">Toate la 100</button><button data-act="nevoi-obosit">Obosit și flămând (20)</button><button data-act="ranit">Rănit (40 viață)</button></div>`,
      ) +
      sectiune(
        'Bani și reputație',
        `<div class="d-rand">Monede <input type="number" min="0" class="d-bani" value="${s.bani}"><button data-act="bani" data-n="10">+10</button><button data-act="bani" data-n="50">+50</button><button data-act="bani" data-n="200">+200</button></div>
        <div class="d-rand">Reputație <input type="number" class="d-reputatie" value="${s.reputatie}"></div>
        <div class="d-rand d-info">Taxa: ziua ${s.taxa.zi}, ${s.taxa.platita ? 'plătită' : 'neplătită'}, ratări ${s.taxa.ratari}</div>`,
      ) +
      sectiune(
        `Încrederea (0–${maxIncredere})`,
        `<div class="d-grila">${cuIncredere
          .map((p) => {
            const v = s.relatii[p.id] || 0;
            return `<div class="d-rand d-incredere"><span>${esc(p.nume)}</span><button data-act="relatie" data-id="${p.id}" data-n="-1">−</button><b>${v}</b><button data-act="relatie" data-id="${p.id}" data-n="1">+</button><button data-act="relatie-max" data-id="${p.id}" title="Până la ${maxIncredere}">max</button></div>`;
          })
          .join('')}</div>
        <div class="d-rand"><button data-act="toti-cunoscuti">Toți cunoscuți de 3 zile</button><button data-act="vanatoare">+1 vânătoare câștigată</button></div>`,
      ) +
      sectiune('Jocul', `<div class="d-rand"><button data-act="joc-nou" class="d-periculos">Joc nou</button></div>`)
    );
  }

  // ---------- Misiunile, pe personaje ----------
  function tabMisiuni(potriveste) {
    const s = joc.stare;
    const filtre = [
      ['toate', 'Toate'],
      ['inceputa', 'În lucru'],
      ['terminata', 'Terminate'],
      ['neinceputa', 'Neîncepute'],
    ];
    const dupaFiltru = (m) => pref.filtruMisiuni === 'toate' || (s.misiuni[m.id] || 'neinceputa') === pref.filtruMisiuni || (pref.filtruMisiuni === 'terminata' && s.misiuni[m.id] === 'ratata');
    const toate = (joc.date.misiuni?.misiuni || []).filter((m) => dupaFiltru(m) && potriveste(m.titlu, m.id, numePersonaj(m.dela)));
    const grupuri = new Map();
    for (const m of toate) (grupuri.get(m.dela) || grupuri.set(m.dela, []).get(m.dela)).push(m);
    const rand = (m) => {
      const st = s.misiuni[m.id];
      const pas = st === 'inceputa' ? `, pasul ${(s.pasiMisiuni?.[m.id] ?? 0) + 1} din ${m.pasi?.length || '?'}` : '';
      return `<div class="d-rand d-element ${st ? `d-${st}` : ''}"><span class="d-nume">${esc(m.titlu)}<small>${m.id} · ${NUME_STATUS[st] || 'neîncepută'}${pas}</small></span>
        ${st !== 'inceputa' && st !== 'terminata' ? `<button data-act="mis-porneste" data-id="${m.id}">Pornește</button>` : ''}
        ${st ? `<button data-act="mis-reseteaza" data-id="${m.id}">Resetează</button>` : ''}</div>`;
    };
    return (
      `<div class="d-rand d-filtre">${filtre.map(([id, t]) => `<button data-act="filtru-mis" data-id="${id}" class="${pref.filtruMisiuni === id ? 'activ' : ''}">${t}</button>`).join('')}</div>` +
      ([...grupuri].map(([dela, lista]) => sectiune(esc(numePersonaj(dela)), lista.map(rand).join(''))).join('') || gol())
    );
  }

  // ---------- Stările ----------
  function tabStari(potriveste) {
    const s = joc.stare;
    const lista = stariOrdonate.filter((k) => (!pref.doarSetate || s.stari[k] !== undefined) && potriveste(k, s.stari[k]));
    return (
      `<label class="d-rand"><input type="checkbox" data-ch="doar-setate" ${pref.doarSetate ? 'checked' : ''}> Doar stările care au o valoare acum</label>` +
      (lista
        .map(
          (k) => `<label class="d-rand d-element ${s.stari[k] !== undefined ? 'd-setata' : ''}"><span class="d-nume">${k}</span><select data-stare="${k}"><option value="">—</option>${[...stari[k]]
            .map((v) => `<option ${s.stari[k] === v ? 'selected' : ''}>${esc(v)}</option>`)
            .join('')}</select></label>`,
        )
        .join('') || gol())
    );
  }

  // ---------- Locurile: hărțile, zonele și locurile lor, ca un arbore ----------
  function tabLocuri(potriveste) {
    const s = joc.stare;
    const scene = [...joc.lume.values()].filter((d) => ['harta', 'zona', 'loc'].includes(d.tip));
    const copii = (id) => scene.filter((d) => d.parinte === id);
    const linii = [];
    const pune = (d, nivel) => {
      const sub = [];
      for (const c of copii(d.id)) sub.push(...(pune(c, nivel + 1) || []));
      const eu = potriveste(d.titlu, d.id) ? [`<div class="d-rand d-element d-${d.tip} ${d.id === s.scena ? 'd-aici' : ''}" style="padding-left:${6 + nivel * 22}px"><span class="d-nume">${esc(d.titlu)}<small>${d.id}</small></span><button data-act="mergi" data-id="${d.id}">${d.id === s.scena ? 'Ești aici' : 'Mergi'}</button></div>`] : [];
      return eu.length || sub.length ? [...eu, ...sub] : null;
    };
    // Rădăcinile: hărțile (și orice scenă rămasă fără părinte cunoscut, ca să nu lipsească nimic)
    for (const d of scene.filter((x) => !x.parinte || !joc.lume.has(x.parinte))) linii.push(...(pune(d, 0) || []));
    return `<p class="d-info">Mergi fără să treacă timpul.</p>` + (linii.join('') || gol());
  }

  // ---------- Evenimentele ----------
  function tabEvenimente(potriveste) {
    const s = joc.stare;
    const lista = joc.evenimente.filter((e) => potriveste(e.id, e.grup, e.categorie));
    return (
      `<p class="d-info">„Pornește” îl arată chiar dacă a mai fost sau nu-i e ora.</p>` +
      (lista
        .map((e) => {
          const v = s.evenimente[e.id];
          const detalii = [e.grup, e.categorie && `categoria ${e.categorie}`, e.manual && 'manual', v && `văzut de ${v.deCateOri} ori, ziua ${v.ultimaZi}`].filter(Boolean).join(' · ');
          return `<div class="d-rand d-element ${v ? 'd-vazut' : ''}"><span class="d-nume">${e.id}<small>${esc(detalii) || '&nbsp;'}</small></span><button data-act="eveniment" data-id="${e.id}">Pornește</button></div>`;
        })
        .join('') || gol())
    );
  }

  // ---------- Obiectele, pe feluri ----------
  function tabObiecte(potriveste) {
    const s = joc.stare;
    const cate = (id) => [...s.inventar, ...s.cufar].filter((x) => x.id === id).reduce((n, x) => n + x.n, 0) + (s.poveste.includes(id) ? s.povesteNumar?.[id] || 1 : 0) + (Object.values(s.echipat).includes(id) ? 1 : 0);
    const grupuri = new Map();
    for (const [id, o] of Object.entries(joc.date.items.obiecte)) {
      if (o.tip === 'bani' || !potriveste(o.nume, id)) continue;
      const tip = NUME_TIP_OBIECT[o.tip] || 'Altele';
      (grupuri.get(tip) || grupuri.set(tip, []).get(tip)).push([id, o]);
    }
    const rand = ([id, o]) => {
      const n = cate(id);
      const stiva = (o.stiva || 1) > 1 || o.numarabil;
      return `<div class="d-rand d-element ${n ? 'd-are' : ''}"><img class="d-iconita" src="${urlImagine(`items/${id}.png`)}" alt="" onload="this.style.visibility='visible'"><span class="d-nume">${esc(o.nume)}<small>${id}${n ? ` · are ${n}` : ''}</small></span>
        <button data-act="obiect" data-id="${id}" data-n="1">+1</button>${stiva ? `<button data-act="obiect" data-id="${id}" data-n="5">+5</button>` : ''}</div>`;
    };
    return (
      `<p class="d-info">Intră în rucsac; dacă nu mai e loc, apare întrebarea obișnuită.</p>` +
      ([...grupuri].map(([tip, lista]) => sectiune(tip, lista.map(rand).join(''))).join('') || gol())
    );
  }

  // ---------- Lupta, grupul, zarurile și Masa regelui ----------
  function tabLupta(potriveste) {
    const s = joc.stare;
    const lupte = Object.entries(joc.date.lupte.lupte).filter(([id, l]) => potriveste(l.nume, id));
    return (
      testareLupta() +
      sectiune(
        'Luptele din joc',
        lupte.map(([id, l]) => `<div class="d-rand d-element"><span class="d-nume">${esc(l.nume)}<small>${id}</small></span><button data-act="lupta" data-id="${id}">Pornește</button></div>`).join('') || gol(),
      ) +
      sectiune(
        'Grupul lui Vale (recruții)',
        `<div class="d-rand">${joc.date.npcs.personaje
          .filter((p) => p.lupta)
          .map((p) => `<label><input type="checkbox" data-grup="${p.id}" ${s.grup.includes(p.id) ? 'checked' : ''}> ${esc(p.nume)}</label>`)
          .join('')}</div>`,
      ) +
      sectiune(
        'Zarurile cu paznicii',
        `<div class="d-rand"><button data-act="zaruri">Joacă acum</button><label><input type="checkbox" data-ch="putere-zaruri" ${s.stari.zaruri_hot === 'da' ? 'checked' : ''}> puterea de la Finn</label></div>
        <div class="d-rand d-info">Câștiguri azi: ${s.zaruri?.castiguri ?? 0} <button data-act="reset-zaruri">Golește</button></div>`,
      ) +
      sectiune('Masa regelui (bătrânul)', `<div class="d-rand"><button data-act="tafl" data-nivel="usor">Ușor</button><button data-act="tafl" data-nivel="mediu">Mediu</button><button data-act="tafl" data-nivel="greu">Greu</button></div>`)
    );
  }

  // Doar zonele de luptă (hărțile din „harti”, lupte.json), nu toate locurile,
  // și hărțile fără un loc al lor în sat („hartiNoi”: tabăra orcilor vânători)
  function testareLupta() {
    const s = joc.stare;
    const noi = Object.entries(joc.date.lupte?.hartiNoi || {}).filter(([id]) => !id.startsWith('_'));
    const harti = [...(joc.date.lupte?.harti || []), ...noi.map(([id]) => id)];
    const titlu = (id) => joc.lume.get(id)?.titlu || noi.find(([x]) => x === id)?.[1] || id;
    if (!harti.includes(test.fundal)) test.fundal = harti[0] || s.scena;
    const scene = harti.map((id) => `<option value="${id}" ${id === test.fundal ? 'selected' : ''}>${esc(titlu(id))}</option>`).join('');
    const arme = Object.entries(joc.date.items.obiecte)
      .filter(([, o]) => o.slot === 'arma_primara')
      .map(([id, o]) => `<option value="${id}" ${test.arma === id ? 'selected' : ''}>${esc(o.nume)}</option>`)
      .join('');
    const recruti = joc.date.npcs.personaje.filter((p) => p.lupta);
    const inamici = Object.entries(joc.date.lupte.inamici || {});
    // Doi inamici cu același nume (orcul colector de la poartă și cel din Groapă) se deosebesc după id
    const dubluri = new Set(inamici.map(([, x]) => x.nume).filter((n, i, t) => t.indexOf(n) !== i));
    return sectiune(
      'Lupta de test',
      `<label class="d-rand"><span class="d-eticheta">Zona</span><select data-ch="tl-fundal">${scene}</select></label>
      <div class="d-rand"><span class="d-eticheta">Arma lui Vale</span><select data-ch="tl-arma">
        <option value="__echipat" ${test.arma === '__echipat' ? 'selected' : ''}>ce are echipat</option>
        <option value="" ${test.arma === '' ? 'selected' : ''}>pumni</option>${arme}
        <option value="__tata" ${test.arma === '__tata' ? 'selected' : ''}>tot echipamentul tatălui</option></select>
        <label><input type="checkbox" data-ch="tl-scut" ${test.scut ? 'checked' : ''}> cu scut</label></div>
      <div class="d-rand"><span class="d-eticheta">Aliați</span>${recruti.map((p) => `<label><input type="checkbox" data-tl-aliat="${p.id}" ${test.aliati.has(p.id) ? 'checked' : ''}> ${esc(p.nume)}</label>`).join('')}</div>
      <div class="d-eticheta">Inamici (câți din fiecare, cel mult 6 în total)</div>
      <div class="d-grila">${inamici.map(([id, x]) => `<label class="d-rand d-inamic" title="${id}"><span>${esc(x.nume)}${dubluri.has(x.nume) ? `<small>${id}</small>` : ''}</span><input type="number" min="0" max="6" data-tl-inamic="${id}" value="${test.inamici[id] || 0}"></label>`).join('')}</div>
      <label class="d-rand"><input type="checkbox" data-ch="tl-puternici" ${test.puternici ? 'checked' : ''}> Inamici foarte puternici (lovesc de 10 ori mai tare)</label>
      <label class="d-rand"><input type="checkbox" data-ch="tl-slabi" ${test.slabi ? 'checked' : ''}> Inamici foarte slabi (cad dintr-o lovitură)</label>
      <label class="d-rand"><input type="checkbox" data-ch="tl-finala" ${test.finala ? 'checked' : ''}> Ca în lupta finală (toiagul, fluierul și steagul, chiar dacă nu le-au primit încă)</label>
      <div class="d-rand"><button data-act="lupta-test" class="d-principal">Pornește lupta de test</button><small>nu schimbă viața, timpul sau echipamentul</small></div>`,
    );
  }

  function pornesteLuptaTest() {
    // Inamicii iau locurile pe rând: întâi rândul din față (mijloc, sus, jos), apoi spatele; maximum 6
    const inamici = Object.entries(test.inamici)
      .flatMap(([id, n]) => Array(n).fill(id))
      .slice(0, 6)
      .map((id, i) => ({ id, ...LOCURI[i] }));
    if (!inamici.length) return joc.mesaj('Alege măcar un inamic.');
    el.hidden = true;
    const fundal = test.fundal || joc.stare.scena;
    joc.pornesteLupta({
      nume: 'Luptă de test',
      test: true,
      fundal,
      // Pe harta unei lupte cu variantă (Groapa: Kaia pe jos, fără Ember; Elian doar cu vindecarea), aliații luptă
      // ca acolo, ca testul să arate pozele și puterile din lupta adevărată
      varianta: Object.values(joc.date.lupte.lupte).find((l) => l.fundal === fundal && l.varianta)?.varianta,
      fuga: true,
      armaVale: test.arma === '__echipat' ? undefined : test.arma,
      scutVale: test.scut,
      inamiciPuternici: test.puternici,
      inamiciSlabi: test.slabi,
      finala: test.finala,
      aliati: [...test.aliati].slice(0, 5).map((id) => ({ id })),
      inamici,
      victorie: { text: 'Lupta de test s-a terminat.' },
      infrangere: { text: 'Lupta de test s-a terminat.' },
    });
  }

  // ---------- Clicurile: un singur ascultător pentru tot corpul (conținutul se refață des) ----------
  const actiuni = {
    plus: (b) => (joc.avanseaza(Number(b.dataset.min)), joc.dupaSchimbare(true)),
    ora: (b) => laOra(b.dataset.ora),
    'ora-exacta': () => corp.querySelector('.d-ora').value && laOra(corp.querySelector('.d-ora').value),
    'zi-noua': () => {
      const s = joc.stare;
      s.minute = (Math.floor(s.minute / MINUTE_ZI) + 1) * MINUTE_ZI + inMinute('07:00');
      joc.dupaSchimbare(true);
    },
    'zi-exacta': () => {
      const s = joc.stare;
      const zi = Math.max(1, Math.floor(Number(corp.querySelector('.d-zi').value) || 1));
      s.minute = (zi - 1) * MINUTE_ZI + (s.minute % MINUTE_ZI);
      joc.dupaSchimbare(true);
    },
    'nevoi-pline': () => seteazaNevoi({ viata: 100, stamina: 100, foame: 100, sete: 100 }),
    'nevoi-obosit': () => seteazaNevoi({ stamina: 20, foame: 20, sete: 20 }),
    ranit: () => seteazaNevoi({ viata: 40 }),
    bani: (b) => {
      joc.stare.bani += Number(b.dataset.n);
      joc.dupaSchimbare(true);
    },
    relatie: (b) => {
      const s = joc.stare;
      s.relatii[b.dataset.id] = Math.max(0, Math.min(maxIncredere, (s.relatii[b.dataset.id] || 0) + Number(b.dataset.n)));
      joc.dupaSchimbare(true);
    },
    'relatie-max': (b) => {
      joc.stare.relatii[b.dataset.id] = maxIncredere;
      joc.dupaSchimbare(true);
    },
    // Misiunile apar la câteva zile după prima discuție: așa se sare peste așteptare
    'toti-cunoscuti': () => {
      const s = joc.stare;
      s.cunoscutLa ||= {};
      for (const p of joc.date.npcs.personaje)
        if (p.carte) {
          if (!s.cunoscuti.includes(p.id)) s.cunoscuti.push(p.id);
          s.cunoscutLa[p.id] = Math.min(s.cunoscutLa[p.id] ?? 99, Math.floor(s.minute / MINUTE_ZI) + 1 - 3);
        }
      joc.dupaSchimbare(true);
      joc.mesaj('Toți din carte sunt cunoscuți de 3 zile.');
    },
    vanatoare: () => {
      joc.aplicaEfecte({ contor: { vanatori_castigate: 1 } });
      joc.dupaSchimbare(true);
      joc.mesaj('+1 vânătoare câștigată.');
    },
    'joc-nou': () => joc.intreaba('Începi un joc nou? Salvarea curentă se pierde.').then((da) => da && joc.jocNou()),
    'filtru-mis': (b) => {
      pref.filtruMisiuni = b.dataset.id;
      scriePref(pref);
      deseneazaCorp();
    },
    // Misiunile, pentru testare: pornită direct (ca după „Accept”) sau ștearsă de tot, ca să se ia de la capăt
    'mis-porneste': (b) => {
      joc.aplicaEfecte({ misiune: { [b.dataset.id]: 'inceputa' } });
      joc.dupaSchimbare(true);
    },
    'mis-reseteaza': (b) => {
      const id = b.dataset.id;
      const s = joc.stare;
      // Întâi jocul de dinainte de misiune (cu tot ce a schimbat ea în lume); fără el, doar se șterge misiunea
      if (joc.revinoInainteDeMisiune(id)) return joc.mesaj('Jocul s-a întors la clipa dinainte de misiune.');
      delete s.misiuni[id];
      if (s.pasiMisiuni) delete s.pasiMisiuni[id];
      s.ordineMisiuni = (s.ordineMisiuni || []).filter((x) => x !== id);
      joc.dupaSchimbare(true);
    },
    mergi: (b) => b.dataset.id !== joc.stare.scena && joc.mergi(b.dataset.id, { faraTimp: true }),
    eveniment: (b) => joc.pornesteEveniment(b.dataset.id, true),
    obiect: (b) => {
      joc.primeste(b.dataset.id, Number(b.dataset.n));
      joc.dupaSchimbare(true);
    },
    lupta: (b) => joc.pornesteLupta(b.dataset.id),
    'lupta-test': pornesteLuptaTest,
    // Jocul de zaruri și Masa regelui pornesc de oriunde, fără să mergi la poartă sau la tavernă (doar pentru testare)
    zaruri: () => joc.pornesteZaruri(),
    'reset-zaruri': () => {
      joc.stare.zaruri = null;
      joc.dupaSchimbare(true);
    },
    tafl: (b) => joc.pornesteTafl({ nivel: b.dataset.nivel }),
  };

  function seteazaNevoi(valori) {
    const s = joc.stare;
    for (const [n, v] of Object.entries(valori)) schimbaNevoie(s, n, v - s.nevoi[n]);
    joc.dupaSchimbare(true);
  }

  corp.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (b && actiuni[b.dataset.act]) actiuni[b.dataset.act](b);
  });

  // Glisoarele nevoilor: HUD-ul se schimbă pe loc, fără să se refacă panoul (s-ar pierde glisorul din mână)
  corp.addEventListener('input', (e) => {
    const i = e.target;
    if (!i.dataset.nevoie) return;
    schimbaNevoie(joc.stare, i.dataset.nevoie, Number(i.value) - joc.stare.nevoi[i.dataset.nevoie]);
    i.nextElementSibling.textContent = i.value;
    joc.dupaSchimbare(false);
  });

  corp.addEventListener('change', (e) => {
    const t = e.target;
    const s = joc.stare;
    if (t.dataset.stare) {
      if (t.value) s.stari[t.dataset.stare] = t.value;
      else delete s.stari[t.dataset.stare];
      return joc.dupaSchimbare(true);
    }
    if (t.dataset.grup) {
      const id = t.dataset.grup;
      s.grup = t.checked ? [...new Set([...s.grup, id])].slice(0, 6) : s.grup.filter((x) => x !== id);
      return joc.dupaSchimbare(false);
    }
    if (t.dataset.tlAliat) return t.checked ? test.aliati.add(t.dataset.tlAliat) : test.aliati.delete(t.dataset.tlAliat);
    if (t.dataset.tlInamic) return (test.inamici[t.dataset.tlInamic] = Math.max(0, Math.min(6, Number(t.value) || 0)));
    if (t.classList.contains('d-bani')) {
      s.bani = Math.max(0, Number(t.value) || 0);
      return joc.dupaSchimbare(false);
    }
    if (t.classList.contains('d-reputatie')) {
      s.reputatie = Number(t.value) || 0;
      return joc.dupaSchimbare(false);
    }
    const ch = t.dataset.ch;
    if (ch === 'doar-setate') {
      pref.doarSetate = t.checked;
      scriePref(pref);
      return deseneazaCorp();
    }
    if (ch === 'putere-zaruri') {
      if (t.checked) s.stari.zaruri_hot = 'da';
      else delete s.stari.zaruri_hot;
      return joc.dupaSchimbare(false);
    }
    if (ch === 'tl-fundal') test.fundal = t.value;
    if (ch === 'tl-arma') test.arma = t.value;
    if (ch === 'tl-scut') test.scut = t.checked;
    if (ch === 'tl-puternici') test.puternici = t.checked;
    if (ch === 'tl-slabi') test.slabi = t.checked;
    if (ch === 'tl-finala') test.finala = t.checked;
  });

  return {
    arata,
    comuta() {
      el.hidden = !el.hidden;
      arata();
    },
  };
}
