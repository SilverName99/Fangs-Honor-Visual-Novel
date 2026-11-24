import { t } from './limba.js';

// O bară de nevoie (viață, stamina, foame, sete) cu previzualizare, ca în panoul din HUD și cu aceeași grafică:
// partea mai deschisă = cât ar crește (mâncare, somn), partea roșiatică = cât ar scădea (muncă). Folosită în
// inventar (obiectul ales) și pe panourile de somn și muncă (butonul de sub mouse)
const div = (clasa, text) => Object.assign(document.createElement('div'), { className: clasa, textContent: text ?? '' });
// Numele nevoilor se traduc la fiecare desenare (nu o dată, la încărcarea modulului), ca bara să urmeze limba aleasă
// în Opțiuni; cheile sunt aceleași ca la barele din panoul lui Vale (HUD)
const numeNevoie = (cheie) => ({ viata: t('Viață'), stamina: t('Stamina'), foame: t('Foame'), sete: t('Sete') })[cheie];

export function baraNevoie(cheie, valoare, schimbare, inaltime, latime, prag = 30) {
  const v = Math.round(valoare);
  const dupa = Math.max(0, Math.min(100, v + schimbare));
  const bara = div(`bara-nevoie bara-inv ${cheie} ${v < prag ? 'scazut' : ''}`);
  const cale = div('cale');
  const umplere = div('umplere');
  umplere.style.width = `${Math.min(v, dupa)}%`;
  cale.append(umplere);
  if (dupa !== v) {
    const parte = div(`umplere ${dupa > v ? 'previzualizare' : 'pierdere'}`);
    parte.style.width = `${Math.abs(dupa - v)}%`;
    cale.append(parte);
  }
  bara.style.width = `${latime}px`;
  bara.style.fontSize = `${Math.max(11, inaltime * 0.5)}px`;
  const semn = dupa > v ? ` +${dupa - v}` : dupa < v ? ` −${v - dupa}` : '';
  bara.append(cale, div('eticheta', numeNevoie(cheie) || cheie), div('valoare', `${v}${semn}`));
  return bara;
}
