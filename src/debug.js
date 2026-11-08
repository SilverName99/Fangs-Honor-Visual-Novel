import { schimbaNevoie } from './stare.js';
import { MINUTE_ZI, inMinute } from './timp.js';

const NEVOI = ['viata', 'stamina', 'foame', 'sete'];

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
  // Alegerile din „Testare luptă” rămân ținute minte cât e pagina deschisă (panoul se redesenează des)
  const test = { deschis: false, fundal: null, arma: '__echipat', scut: false, aliati: new Set(), inamici: {}, puternici: false, slabi: false };
  const LOCURI = [1, 0, 2].map((l) => ({ linie: l, rand: 'fata' })).concat([1, 0, 2].map((l) => ({ linie: l, rand: 'spate' })));

  function laOra(hhmm) {
    const s = joc.stare;
    s.minute = Math.floor(s.minute / MINUTE_ZI) * MINUTE_ZI + inMinute(hhmm);
    joc.dupaSchimbare(true);
  }

  function arata() {
    if (el.hidden) return;
    const s = joc.stare;
    const optiuniScene = [...joc.lume.values()].filter((d) => d.tip !== 'ecran').map((d) => `<option value="${d.id}" ${d.id === s.scena ? 'selected' : ''}>${d.titlu} (${d.id})</option>`).join('');
    el.innerHTML = `
      <h4>Debug <small>(F2 închide)</small></h4>
      <div class="rand-d"><b>Timp</b>
        <button data-plus="10">+10 min</button><button data-plus="60">+1 oră</button><button data-plus="360">+6 ore</button></div>
      <div class="rand-d"><button data-ora="07:00">Dimineață</button><button data-ora="12:00">Amiază</button><button data-ora="19:00">Seară</button><button data-ora="23:30">Noapte</button><button class="zi-noua">Ziua următoare</button></div>
      ${NEVOI.map((n) => `<label class="rand-d"><span>${n}</span><input type="range" min="0" max="100" data-nevoie="${n}" value="${Math.round(s.nevoi[n])}"><span>${Math.round(s.nevoi[n])}</span></label>`).join('')}
      <label class="rand-d"><span>monede</span><input type="number" class="d-bani" value="${s.bani}"></label>
      <div class="rand-d"><b>Stări</b></div>
      ${Object.entries(stari)
        .map(
          ([k, vals]) => `<label class="rand-d"><span>${k}</span><select data-stare="${k}"><option value="">—</option>${[...vals]
            .map((v) => `<option ${s.stari[k] === v ? 'selected' : ''}>${v}</option>`)
            .join('')}</select></label>`,
        )
        .join('')}
      <label class="rand-d"><span>Mergi la</span><select class="d-scena">${optiuniScene}</select></label>
      <div class="rand-d"><span>Eveniment</span><select class="d-eveniment">${joc.evenimente.map((e) => `<option>${e.id}</option>`).join('')}</select><button class="porneste-ev">Pornește</button></div>
      <div class="rand-d"><span>Misiune</span><select class="d-misiune">${(joc.date.misiuni?.misiuni || []).map((m) => `<option value="${m.id}">${m.titlu} (${s.misiuni[m.id] || 'neîncepută'}${s.misiuni[m.id] === 'inceputa' ? `, pasul ${(s.pasiMisiuni?.[m.id] ?? 0) + 1}` : ''})</option>`).join('')}</select><button class="porneste-mis">Pornește</button><button class="reseteaza-mis">Resetează</button></div>
      <div class="rand-d"><span>Testare misiuni</span><button class="cunoscuti-vechi">Toți cunoscuți de 3 zile</button><button class="vanatoare-castigata">+1 vânătoare câștigată</button></div>
      <div class="rand-d"><span>Obiect</span><select class="d-obiect">${Object.entries(joc.date.items.obiecte).filter(([, o]) => !['bani', 'planta'].includes(o.tip)).map(([id, o]) => `<option value="${id}">${o.nume}</option>`).join('')}</select><button class="adauga-ob">Primește</button></div>
      <div class="rand-d"><span>Luptă</span><select class="d-alege-lupta">${Object.entries(joc.date.lupte.lupte).map(([id, l]) => `<option value="${id}">${l.nume}</option>`).join('')}</select><button class="porneste-lupta">Pornește</button></div>
      <div class="rand-d"><span>Zaruri</span><button class="porneste-zaruri">Joacă cu paznicii</button><label><input type="checkbox" class="d-putere-zaruri" ${s.stari.zaruri_hot === 'da' ? 'checked' : ''}> puterea de la hoț</label><span>câștiguri azi: ${s.zaruri?.castiguri ?? 0}</span><button class="reset-zaruri">Golește</button></div>
      <div class="rand-d"><span>Grup</span>${joc.date.npcs.personaje.filter((p) => p.lupta).map((p) => `<label><input type="checkbox" data-grup="${p.id}" ${s.grup.includes(p.id) ? 'checked' : ''}> ${p.id}</label>`).join(' ')}</div>
      ${testareLupta(optiuniTest())}
      <div class="rand-d"><span>Taxă: ziua ${s.taxa.zi}, ${s.taxa.platita ? 'plătită' : 'neplătită'}, ratări ${s.taxa.ratari}</span></div>
      <div class="rand-d"><span>Relații: ${Object.entries(s.relatii).map(([k, v]) => `${k} ${v}`).join(', ') || '—'} · reputație ${s.reputatie}</span></div>
      <div class="rand-d"><button class="joc-nou">Joc nou</button></div>`;

    el.querySelectorAll('[data-plus]').forEach((b) => (b.onclick = () => (joc.avanseaza(Number(b.dataset.plus)), joc.dupaSchimbare(true))));
    el.querySelectorAll('[data-ora]').forEach((b) => (b.onclick = () => laOra(b.dataset.ora)));
    el.querySelector('.zi-noua').onclick = () => {
      s.minute = (Math.floor(s.minute / MINUTE_ZI) + 1) * MINUTE_ZI + inMinute('07:00');
      joc.dupaSchimbare(true);
    };
    el.querySelectorAll('[data-nevoie]').forEach((i) => {
      i.oninput = () => {
        schimbaNevoie(s, i.dataset.nevoie, Number(i.value) - s.nevoi[i.dataset.nevoie]);
        i.nextElementSibling.textContent = i.value;
        joc.dupaSchimbare(false);
      };
    });
    el.querySelector('.d-bani').onchange = (e) => {
      s.bani = Math.max(0, Number(e.target.value) || 0);
      joc.dupaSchimbare(false);
    };
    el.querySelectorAll('[data-stare]').forEach((sel) => {
      sel.onchange = () => {
        if (sel.value) s.stari[sel.dataset.stare] = sel.value;
        else delete s.stari[sel.dataset.stare];
        joc.dupaSchimbare(true);
      };
    });
    el.querySelector('.d-scena').onchange = (e) => joc.mergi(e.target.value, { faraTimp: true });
    // Misiunile, pentru testare: pornită direct (ca după „Accept”) sau ștearsă de tot, ca să se ia de la capăt
    el.querySelector('.porneste-mis').onclick = () => {
      joc.aplicaEfecte({ misiune: { [el.querySelector('.d-misiune').value]: 'inceputa' } });
      joc.dupaSchimbare(true);
    };
    el.querySelector('.reseteaza-mis').onclick = () => {
      const id = el.querySelector('.d-misiune').value;
      delete s.misiuni[id];
      if (s.pasiMisiuni) delete s.pasiMisiuni[id];
      s.ordineMisiuni = (s.ordineMisiuni || []).filter((x) => x !== id);
      joc.dupaSchimbare(true);
    };
    // Misiunile apar la câteva zile după prima discuție: așa se sare peste așteptare
    el.querySelector('.cunoscuti-vechi').onclick = () => {
      s.cunoscutLa ||= {};
      for (const p of joc.date.npcs.personaje) if (p.carte) {
        if (!s.cunoscuti.includes(p.id)) s.cunoscuti.push(p.id);
        s.cunoscutLa[p.id] = Math.min(s.cunoscutLa[p.id] ?? 99, Math.floor(s.minute / MINUTE_ZI) + 1 - 3);
      }
      joc.dupaSchimbare(true);
    };
    el.querySelector('.vanatoare-castigata').onclick = () => {
      joc.aplicaEfecte({ contor: { vanatori_castigate: 1 } });
      joc.dupaSchimbare(true);
    };
    el.querySelector('.porneste-ev').onclick = () => joc.pornesteEveniment(el.querySelector('.d-eveniment').value, true);
    el.querySelector('.adauga-ob').onclick = () => {
      joc.primeste(el.querySelector('.d-obiect').value, 1);
      joc.dupaSchimbare(true);
    };
    el.querySelector('.porneste-lupta').onclick = () => joc.pornesteLupta(el.querySelector('.d-alege-lupta').value);
    // Jocul de zaruri pornește de oriunde, fără să mergi la poartă la 14–18 (doar pentru testare)
    el.querySelector('.porneste-zaruri').onclick = () => joc.pornesteZaruri();
    el.querySelector('.d-putere-zaruri').onchange = (e) => {
      if (e.target.checked) joc.stare.stari.zaruri_hot = 'da';
      else delete joc.stare.stari.zaruri_hot;
      joc.dupaSchimbare(false);
    };
    el.querySelector('.reset-zaruri').onclick = () => {
      joc.stare.zaruri = null;
      joc.dupaSchimbare(true);
    };
    legaTestareLupta();
    el.querySelectorAll('[data-grup]').forEach((c) => {
      c.onchange = () => {
        const id = c.dataset.grup;
        s.grup = c.checked ? [...new Set([...s.grup, id])].slice(0, 6) : s.grup.filter((x) => x !== id);
        joc.dupaSchimbare(false);
      };
    });
    el.querySelector('.joc-nou').onclick = () => joc.intreaba('Începi un joc nou? Salvarea curentă se pierde.').then((da) => da && joc.jocNou());
  }

  // ---------- Testare luptă: fundal, arma lui Vale, aliați și inamici aleși de mână ----------
  function optiuniTest() {
    const s = joc.stare;
    // Doar zonele de luptă (hărțile din „harti”, lupte.json), nu toate locurile
    const harti = joc.date.lupte?.harti || [];
    if (!harti.includes(test.fundal)) test.fundal = harti[0] || s.scena;
    return {
      scene: harti.map((id) => `<option value="${id}" ${id === test.fundal ? 'selected' : ''}>${joc.lume.get(id)?.titlu || id}</option>`).join(''),
      arme: Object.entries(joc.date.items.obiecte).filter(([, o]) => o.slot === 'arma_primara').map(([id, o]) => `<option value="${id}" ${test.arma === id ? 'selected' : ''}>${o.nume}</option>`).join(''),
    };
  }

  function testareLupta({ scene, arme }) {
    const recruti = joc.date.npcs.personaje.filter((p) => p.lupta);
    const inamici = Object.entries(joc.date.lupte.inamici || {});
    return `<details class="test-lupta" ${test.deschis ? 'open' : ''}><summary><b>Testare luptă</b></summary>
      <label class="rand-d"><span>Zona de luptă</span><select class="tl-fundal">${scene}</select></label>
      <div class="rand-d"><span>Arma lui Vale</span><select class="tl-arma">
        <option value="__echipat" ${test.arma === '__echipat' ? 'selected' : ''}>ce are echipat</option>
        <option value="" ${test.arma === '' ? 'selected' : ''}>pumni</option>${arme}</select>
        <label><input type="checkbox" class="tl-scut" ${test.scut ? 'checked' : ''}> cu scut</label></div>
      <div class="rand-d"><span>Aliați</span>${recruti.map((p) => `<label><input type="checkbox" data-tl-aliat="${p.id}" ${test.aliati.has(p.id) ? 'checked' : ''}> ${p.nume}</label>`).join(' ')}</div>
      <div class="rand-d"><span>Inamici</span>${inamici
        .map(([id, x]) => `<label>${x.nume} <input type="number" min="0" max="6" style="width:52px" data-tl-inamic="${id}" value="${test.inamici[id] || 0}"></label>`)
        .join(' ')}</div>
      <div class="rand-d"><label><input type="checkbox" class="tl-puternici" ${test.puternici ? 'checked' : ''}> Inamici foarte puternici (lovesc de 10 ori mai tare)</label></div>
      <div class="rand-d"><label><input type="checkbox" class="tl-slabi" ${test.slabi ? 'checked' : ''}> Inamici foarte slabi (cad dintr-o lovitură)</label></div>
      <div class="rand-d"><button class="tl-porneste">Pornește lupta de test</button> <small>(nu schimbă viața, timpul sau echipamentul)</small></div>
    </details>`;
  }

  function legaTestareLupta() {
    const d = el.querySelector('.test-lupta');
    d.ontoggle = () => (test.deschis = d.open);
    el.querySelector('.tl-fundal').onchange = (e) => (test.fundal = e.target.value);
    el.querySelector('.tl-arma').onchange = (e) => (test.arma = e.target.value);
    el.querySelector('.tl-scut').onchange = (e) => (test.scut = e.target.checked);
    el.querySelector('.tl-puternici').onchange = (e) => (test.puternici = e.target.checked);
    el.querySelector('.tl-slabi').onchange = (e) => (test.slabi = e.target.checked);
    el.querySelectorAll('[data-tl-aliat]').forEach((c) => (c.onchange = () => (c.checked ? test.aliati.add(c.dataset.tlAliat) : test.aliati.delete(c.dataset.tlAliat))));
    el.querySelectorAll('[data-tl-inamic]').forEach((i) => (i.onchange = () => (test.inamici[i.dataset.tlInamic] = Math.max(0, Math.min(6, Number(i.value) || 0)))));
    el.querySelector('.tl-porneste').onclick = () => {
      // Inamicii iau locurile pe rând: întâi rândul din față (mijloc, sus, jos), apoi spatele; maximum 6
      const inamici = Object.entries(test.inamici).flatMap(([id, n]) => Array(n).fill(id)).slice(0, 6).map((id, i) => ({ id, ...LOCURI[i] }));
      if (!inamici.length) return joc.mesaj('Alege măcar un inamic.');
      el.hidden = true;
      joc.pornesteLupta({
        nume: 'Luptă de test',
        test: true,
        fundal: test.fundal || joc.stare.scena,
        fuga: true,
        armaVale: test.arma === '__echipat' ? undefined : test.arma,
        scutVale: test.scut,
        inamiciPuternici: test.puternici,
        inamiciSlabi: test.slabi,
        aliati: [...test.aliati].slice(0, 5).map((id) => ({ id })),
        inamici,
        victorie: { text: 'Lupta de test s-a terminat.' },
        infrangere: { text: 'Lupta de test s-a terminat.' },
      });
    };
  }

  return {
    arata,
    comuta() {
      el.hidden = !el.hidden;
      arata();
    },
  };
}
