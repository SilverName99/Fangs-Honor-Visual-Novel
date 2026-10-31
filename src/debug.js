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

  function laOra(hhmm) {
    const s = joc.stare;
    s.minute = Math.floor(s.minute / MINUTE_ZI) * MINUTE_ZI + inMinute(hhmm);
    joc.dupaSchimbare(true);
  }

  function arata() {
    if (el.hidden) return;
    const s = joc.stare;
    const optiuniScene = [...joc.lume.values()].map((d) => `<option value="${d.id}" ${d.id === s.scena ? 'selected' : ''}>${d.titlu} (${d.id})</option>`).join('');
    el.innerHTML = `
      <h4>Debug <small>(F2 închide)</small></h4>
      <div class="rand-d"><b>Timp</b>
        <button data-plus="10">+10 min</button><button data-plus="60">+1 oră</button><button data-plus="360">+6 ore</button></div>
      <div class="rand-d"><button data-ora="07:00">Dimineață</button><button data-ora="12:00">Amiază</button><button data-ora="19:00">Seară</button><button data-ora="23:30">Noapte</button><button class="zi-noua">Ziua următoare</button></div>
      ${NEVOI.map((n) => `<label class="rand-d"><span>${n}</span><input type="range" min="0" max="100" data-nevoie="${n}" value="${Math.round(s.nevoi[n])}"><span>${Math.round(s.nevoi[n])}</span></label>`).join('')}
      <label class="rand-d"><span>monede</span><input type="number" class="bani" value="${s.bani}"></label>
      <div class="rand-d"><b>Stări</b></div>
      ${Object.entries(stari)
        .map(
          ([k, vals]) => `<label class="rand-d"><span>${k}</span><select data-stare="${k}"><option value="">—</option>${[...vals]
            .map((v) => `<option ${s.stari[k] === v ? 'selected' : ''}>${v}</option>`)
            .join('')}</select></label>`,
        )
        .join('')}
      <label class="rand-d"><span>Mergi la</span><select class="scena">${optiuniScene}</select></label>
      <label class="rand-d"><span>Eveniment</span><select class="eveniment">${joc.evenimente.map((e) => `<option>${e.id}</option>`).join('')}</select><button class="porneste-ev">Pornește</button></label>
      <div class="rand-d"><span>Obiecte: ${s.obiecte.join(', ') || '—'}</span></div>
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
    el.querySelector('.bani').onchange = (e) => {
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
    el.querySelector('.scena').onchange = (e) => joc.mergi(e.target.value, { faraTimp: true });
    el.querySelector('.porneste-ev').onclick = () => joc.pornesteEveniment(el.querySelector('.eveniment').value);
    el.querySelector('.joc-nou').onclick = () => confirm('Începi un joc nou? Salvarea curentă se pierde.') && joc.jocNou();
  }

  return {
    arata,
    comuta() {
      el.hidden = !el.hidden;
      arata();
    },
  };
}
