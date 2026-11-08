# Misiunile: evidență și walkthrough

Documentul ține minte fiecare misiune: cum pornește, ce faci, ce primești și cu ce se leagă.
Mai târziu devine walkthrough-ul jocului. Se actualizează la fiecare misiune nouă sau schimbată.

**Starea fiecărei misiuni:** ✅ în joc · 📝 hotărâtă, nefăcută încă · 💡 idee, de discutat.
Replicile din joc sunt ciorne de-ale lui Claude, până le schimbă autorul.

## Regulile generale (decise de autor)

- O misiune apare la un personaj doar **după prima discuție cu el** și după **câteva zile** (diferit pentru fiecare).
- **Semnele** din meniul de discuție, de deasupra personajului și de pe hartă: **!** = misiune nouă, **?** gri = în lucru (dă indicația), **?** auriu = gata de predat.
- **Încrederea** (0–10) crește prin misiuni duse la capăt. Un personaj se poate **recruta de la 8/10**.
- O misiune ratată sau refuzată nu închide drumul: doar nu dă încrederea (exemplu: Roderick, dacă nu-l ajuți în scandal).
- **Tonul** jocului începe întunecat și se încălzește pe măsură ce crește încrederea tuturor; spre final, oamenii vorbesc de revoltă. (📝 de făcut: replici care se schimbă după încrederea totală.)

## Prologul 📝

La un joc nou, înainte de orice: 5–7 imagini cu text peste ele.
1. Orcii vin spre sat.
2. Soldații satului, printre ei tatăl lui Vale, încearcă să-l apere.
3. Sunt răpuși (soldatul din prim-plan e tatăl lui Vale).
4. Orcii pun taxe pe satul cucerit.
5. Orcii ridică zidul.

Apoi Vale se trezește în camera lui: câteva replici despre visul urât cu tatăl lui. Abia acum se înțelege că imaginile au fost visul lui.

---

## Miriam (mama)

### ✅ Acoperișul
- **Pornește:** dimineața, cât Miriam e în bucătărie (până la 11): „Iar a plouat în casă !” → „Mă ocup eu”. Dacă refuzi, opțiunea rămâne în meniu.
- **Pasul 1:** 10 lemne din pădure („Adună lemne”: o oră = 3, două ore = 6; de cel mult două ori pe zi).
- **Pasul 2:** cu lemnele, dimineața, în bucătărie, odihnit (cel puțin 30 stamina): „Uite lemnele, mamă…”. Urmează imaginea cu Vale pe acoperiș (`events/acoperis_reparat.png`), cu 4 ore și 30 stamina consumate, apoi mama îi mulțumește.
- **Recompensa:** încrederea Miriamei +1; casa trece pe „reparată” (harta, zona, imaginile de somn); somnul de acasă reface cu 30% mai multă stamina.

### 📝 Cina în familie
- După **scandalul din tavernă** (oricum s-ar fi terminat): mama îl roagă pe Vale să-l aducă pe Roderick la cină. Scenă caldă despre tată.
- Leagă misiunea mamei de drumul lui Roderick.

---

## Bram Emberforge (fierarul)

### ✅ Fierul lui Bram
- **Pornește:** din ziua 3, la cel puțin o zi după prima discuție cu Bram, când Vale vine la fierărie și Bram lucrează afară. Rulează evenimentul cu două imagini și replici peste ele:
  - `events/bram_fier_1.png`: colectorul găsește fierul ascuns sub cărbuni;
  - `events/bram_fier_2.png`: colectorul pleacă cu el.
  
  Fierul ajunge la orci.
- **Oferta:** la Bram, „Am văzut ce s-a întâmplat cu fierul... !”.
- **Pasul 1: iei fierul înapoi de la poartă.** De fiecare dată când Vale vine la poartă (06–23), cât e misiunea în lucru:
  - `events/poarta_fier_1.png`: un paznic îi face semn să plece. Vale se gândește că nu pleacă fără fier.
  - `events/poarta_fier_2.png`: colectorul râde și dă **trei căi**:
    - **plătești 60 de monede**;
    - **câștigi la zaruri** de la paznici (doar 14–18). Fierul e miza orcilor, iar Vale pune 20 de monede;
    - **te bați cu colectorul**: el trișează (cu bâta, 400 viață), iar Vale are doar pumnii. Nu se poate câștiga, doar iei bătaie.
- **Pasul 2:** duci fierul la Bram: „Ți-am adus fierul înapoi, Bram. ?”.
- **Recompensa:** 15 monede, încrederea lui Bram +1 și **magazinul lui deschis**. Până atunci, ușa fierăriei e zăvorâtă.
- **Legături:** folosește jocul de zaruri de la poartă.

### 💡 Cheia camerei lui Bram
- O altă misiune, mai târziu. În cufăr ar putea fi sabia tatălui lui Vale (de discutat).

---

## Fratele Elian (preotul)

### ✅ Ierburile lui Elian
- **Pornește:** doar când Elian e **afară** (citește pe scările bisericii, 14–23), la cel puțin o zi după prima discuție. Opțiunea e „Ce citești, frate Elian? !”.
- **Pasul 1:** 4 fire de **sunătoare**. Dimineața (5–10), în pădure: „Caută ierburi” (1 oră, de cel mult două ori pe zi).
  - Pe panou apar 4 plante, doar ca imagini și amestecate: sunătoare, păpădie, piciorul-cocoșului, mușețel.
  - Alegi după descrierea lui Elian: „flori galbene, mici, cu cinci petale, în mănunchi; frunzele, ținute în lumină, au găurele mici”.
  - Planta bună aduce 2 fire, cea greșită doar o oră pierdută.
- **Pasul 2:** dai ierburile lui Elian.
- **Recompensa:** încrederea lui Elian +1 și 2 pansamente.
- **Mecanica:** e diferită de a lui Bram (acolo alegi cum să iei fierul; aici recunoști planta).

### 💡 Secretul lui Elian
- Vale, rănit grav, e vindecat de Elian cu lumina. Află că e mag și îi păstrează secretul. De discutat.

---

## Kaia (vânătoarea)

### ✅ Întâlnirea cu Kaia
- **Pornește:** prima vânătoare câștigată deblochează întâlnirea. Din **ziua 4**, la următoarea vânătoare, în locul vânatului obișnuit:
  - `events/kaia_intalnire_1.png`: Vale o vede pe Kaia luptându-se cu 3 lupi și se gândește ce să facă.
    - **„Nu e lupta mea. Plec.”**: nu se întâmplă nimic. Vale trebuie să mai vâneze o dată singur, iar la vânătoarea de după o poate întâlni din nou.
    - **„O ajut!”**: urmează imaginea 2.
  - `events/kaia_intalnire_2.png`: se recunosc și se pregătesc de luptă.
- **Lupta:** Vale și Kaia contra 3 lupi.
  - La victorie: replici, carne și o blană.
  - La înfrângere: alte replici.
  - În ambele cazuri: încrederea Kaiei +1, ea povestește ce s-a întâmplat și pornește misiunea lupului negru.

### ✅ Lupul negru
- **Pasul:** între 15 și 17, Kaia îl așteaptă pe Vale la **marginea pădurii** (pe imaginea pădurii; sprite `sprites/vanatoare_padure.png`). „Sunt gata. Hai după lupul negru. ?” duce la lupta cu Kaia contra lupului negru și a doi lupi.
- **Victorie:** încrederea Kaiei +1, apoi îl duce în **tabăra ei** (Camp site se deblochează).
- **Înfrângere:** „Mâine, aceeași oră”.
- **Recompensa:** încredere și Camp site.

---

## Roderick Lightfinder (unchiul)

### ✅ Scandalul din tavernă
- **Până la scandal,** Roderick nu-l bagă în seamă pe Vale („Unchiul Roderick nici nu ridică ochii din cană”).
- **Pornește:** din **ziua 3**, în tavernă, cât e și Agnes acolo (16–00). În meniul lui apare „*Orcii fac multă dezordine și gălăgie...* !”, care pornește scandalul (3 imagini).
  - **Îl ajuți:** luptă alături de Roderick contra a doi orci. Încrederea lui +1. Mai departe:
    - victorie: Agnes te hrănește, primești pâine și bere, iar taxa crește cu 10;
    - înfrângere: rămâi cu 10 viață și trec 2 ore.
  - **Refuzi:** Roderick e bătut. Nu primești încredere, dar **tot îl poți recruta** mai târziu.
- **Legături:** după scandal vine „Cina în familie” (Miriam).

---

## Agnes (hangița)

### 💡 Camera de la tavernă
- **Camera de sus e ascunsă** (nu se vede, nu se poate închiria) până la o misiune a lui Agnes. De ales misiunea.

---

## Fermierul

### ✅ Deblocarea fermierului
- **Până atunci,** nu se poate vorbi cu el.
- **Prima patrulă de orci pe câmpuri** vine sigur și devreme: din ziua 3, dimineața (08–13), 80% la fiecare intrare pe câmpuri.
- După ea (oricum ai ales), fermierul devine cel cu care poți vorbi.
- Misiunile lui: 💡 de discutat.

---

## Hoțul

### 💡 De discutat
- Eliberarea (40 de monede la negustor), apoi ajutor din umbră înainte de lupta finală.

---

## Dragonii 💡

- Doar indicii. Rămâne de hotărât cum află Vale de ei și prin ce (o poveste, un obiect, ceva găsit în pădure).

---

## Imaginile cerute de misiunile de mai sus

| Fișier | Ce arată |
|---|---|
| `events/acoperis_reparat.png` | Vale pe acoperiș (încărcată) |
| `events/bram_fier_1.png`, `bram_fier_2.png` | colectorul găsește fierul / pleacă cu el |
| `events/poarta_fier_1.png`, `poarta_fier_2.png` | paznicul care îl trimite înapoi / colectorul cu cele trei căi |
| `locations/munca_ierburi.png` | Vale culegând ierburi în rouă |
| `items/sunatoare.png`, `papadie.png`, `piciorul_cocosului.png`, `musetel.png` | plantele de la cules |
| `events/kaia_intalnire_1.png`, `kaia_intalnire_2.png` | Kaia contra lupilor / Vale lângă Kaia |
| `sprites/vanatoare_padure.png` | Kaia la marginea pădurii |
