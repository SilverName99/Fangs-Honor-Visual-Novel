# Misiunile: evidență și walkthrough

Documentul ține minte fiecare misiune: cum pornește, ce faci, ce primești și cu ce se leagă.
Pentru fiecare misiune are și **imaginile** cerute și **cum o verifici** în editor, la Testare.
Mai târziu devine walkthrough-ul jocului. Se actualizează la fiecare misiune nouă sau schimbată.
În editor se citește din tab-ul **Misiuni**.

**Starea fiecărei misiuni:** ✅ în joc · 📝 hotărâtă, nefăcută încă · 💡 idee, de discutat.
Replicile din joc sunt ciorne de-ale lui Claude, până le schimbă autorul.

## Regulile generale (decise de autor)

- O misiune apare la un personaj doar **după prima discuție cu el** și după **câteva zile** (diferit pentru fiecare).
- **Semnele** din meniul de discuție, de deasupra personajului și de pe hartă: **!** = misiune nouă, **?** gri = în lucru (dă indicația), **?** auriu = gata de predat.
- **Încrederea** (0–10) crește prin misiuni duse la capăt. Un personaj se poate **recruta de la 8/10**.
- O misiune ratată sau refuzată nu închide drumul: doar nu dă încrederea (exemplu: Roderick, dacă nu-l ajuți în scandal).
- **Tonul** jocului începe întunecat și se încălzește pe măsură ce crește încrederea tuturor; spre final, oamenii vorbesc de revoltă. (📝 de făcut: replici care se schimbă după încrederea totală.)

## Cum testezi (panoul debug)

În editor, la **Testare**, apasă **F2** pentru panoul debug. Butoanele de care ai nevoie:

- **Timp:** „Dimineață” (07:00), „Amiază” (12:00), „Seară” (19:00), „Ziua următoare”, „+1 oră”.
- **Testare misiuni:**
  - „Toți cunoscuți de 3 zile”: sare peste așteptarea de după prima discuție;
  - „+1 vânătoare câștigată”: pentru Kaia.
- **Misiune:** o alegi din listă, apoi „Pornește” (ca după „Accept”) sau „Resetează” (o ia de la capăt). Lista arată la ce pas ești.
- **Eveniment:** alegi un eveniment din listă și „Pornește”, chiar dacă s-a mai întâmplat (de exemplu imaginile cu fierul lui Bram).
- **Mergi la:** te duce direct într-un loc. Evenimentele care pornesc la sosire apar doar dacă mergi de pe hartă.
- **Monede, Obiect → Primește, Stări:** pui ce îți trebuie (de exemplu 60 de monede, 10 lemne).

Imaginile lipsă apar ca dreptunghiuri colorate, cu numele fișierului pe ele.

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
- **Pasul 2:** cu lemnele, dimineața, în bucătărie, odihnit (cel puțin 30 stamina): „Uite lemnele, mamă…”. Urmează imaginea cu Vale pe acoperiș (`events/acoperis_reparat.png`, ✅ încărcată), cu 4 ore și 30 stamina consumate, apoi mama îi mulțumește.
- **Recompensa:** încrederea Miriamei +1; casa trece pe „reparată” (harta, zona, imaginile de somn); somnul de acasă reface cu 30% mai multă stamina.

**Cum verifici**
1. Timp „Dimineață” (07:00) într-o zi lucrătoare, apoi „Mergi la”: Bucătăria. Vorbește cu Miriam → „Iar a plouat în casă !” → „Mă ocup eu”.
2. Pune 10 lemne (Obiect: Lemn, de 10 ori; sau adună-le din pădure).
3. Iar dimineața, în bucătărie: „Uite lemnele, mamă…” → imaginea → mulțumirea. În carte, misiunea apare la „Terminate”.

### 📝 Cina în familie
- După **scandalul din tavernă** (oricum s-ar fi terminat): mama îl roagă pe Vale să-l aducă pe Roderick la cină. Scenă caldă despre tată.
- Leagă misiunea mamei de drumul lui Roderick.

---

## Bram Emberforge (fierarul)

### ✅ Fierul lui Bram
- **Pornește:** din ziua 3, la cel puțin o zi după prima discuție cu Bram, când Vale vine la fierărie și Bram lucrează afară (luni–vineri 06–12 și 14–18). Rulează două imagini, cu replici peste ele: colectorul găsește fierul ascuns, apoi pleacă cu el. Fierul ajunge la orci.
- **Oferta:** la Bram, „Am văzut ce s-a întâmplat cu fierul... !”.
- **Pasul 1: iei fierul înapoi de la poartă.** De fiecare dată când Vale vine la poartă (06–23), cât e misiunea în lucru:
  - un paznic îi face semn să plece, iar Vale se gândește că nu pleacă fără fier;
  - colectorul râde și dă **trei căi**:
    - **plătești 60 de monede**;
    - **câștigi la zaruri** de la paznici (doar 14–18). Fierul e miza orcilor, iar Vale pune 20 de monede;
    - **te bați cu colectorul**: el trișează (cu bâta, 400 viață), iar Vale are doar pumnii. Nu se poate câștiga, doar iei bătaie.
- **Pasul 2:** duci fierul la Bram: „Ți-am adus fierul înapoi, Bram. ?”.
- **Recompensa:** 15 monede, încrederea lui Bram +1 și **magazinul lui deschis**. Până atunci, ușa fierăriei e zăvorâtă.
- **Legături:** folosește jocul de zaruri de la poartă.

**Imagini:** `events/bram_fier_1.png`, `events/bram_fier_2.png`, `events/poarta_fier_1.png`, `events/poarta_fier_2.png`.

**Cum verifici**
1. F2 → „Toți cunoscuți de 3 zile”. Dacă ești în ziua 1 sau 2, apasă „Ziua următoare” până ajungi în ziua 3. Apoi timp „Dimineață” (07:00, zi lucrătoare).
2. De pe **hartă**, mergi la fierărie: rulează cele două imagini cu replici. (Sau: Eveniment `bram_fier_confiscat` → Pornește.)
3. Vorbește cu Bram → „Am văzut ce s-a întâmplat cu fierul... !” → „Îl aduc înapoi, Bram.”
4. Încearcă ușa fierăriei: e zăvorâtă.
5. De pe **hartă**, mergi la poartă: imaginea 1 → „Vreau să vorbesc cu colectorul” → imaginea 2 cu cele trei căi. Încearcă-le pe rând (după fiecare, ieși și intră iar la poartă):
   - **Plătesc:** pune 60 de monede din F2;
   - **Zaruri:** ora 14–18 (de exemplu „Amiază” + 2 × „+1 oră”). Miza orcilor e „Fierul lui Bram”;
   - **Mă bat:** lupta cu pumnii contra colectorului; pierzi.
6. Cu fierul (îl vezi la Obiecte de poveste), vorbește cu Bram → „Ți-am adus fierul înapoi” → 15 monede, încredere +1. Ușa magazinului se deschide (când Bram e acasă).

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

**Imagini:** `locations/munca_ierburi.png`, `items/sunatoare.png`, `items/papadie.png`, `items/piciorul_cocosului.png`, `items/musetel.png`.

**Cum verifici**
1. F2 → „Toți cunoscuți de 3 zile”. Timp „Amiază”, apoi de două ori „+1 oră” (14:00).
2. Mergi la biserică (zona, unde Elian citește pe scări) → vorbește cu el → „Ce citești, frate Elian? !” → „Ți le aduc”.
3. Timp „Dimineață” → mergi în pădure → „Caută ierburi” → alege o plantă:
   - sunătoarea dă +2 fire;
   - alta, gândul „Nu seamănă…”;
   - a treia oară, „Roua s-a uscat”;
   - la prânz, „se culege dimineața”.
4. Cu 4 fire (sau din F2: Obiect Sunătoare), vorbește cu Elian → „Ți-am adus sunătoarea” → încredere +1 și 2 pansamente.

### 💡 Secretul lui Elian
- Vale, rănit grav, e vindecat de Elian cu lumina. Află că e mag și îi păstrează secretul. De discutat.

---

## Kaia (vânătoarea)

### ✅ Întâlnirea cu Kaia
- **Pornește:** prima vânătoare câștigată deblochează întâlnirea. Din **ziua 4**, la următoarea vânătoare, în locul vânatului obișnuit:
  - **prima imagine:** Vale o vede pe Kaia luptându-se cu 3 lupi și se gândește ce să facă.
    - **„Nu e lupta mea. Plec.”**: nu se întâmplă nimic. Vale trebuie să mai vâneze o dată singur, iar la vânătoarea de după o poate întâlni din nou.
    - **„O ajut!”**: urmează a doua imagine.
  - **a doua imagine:** se recunosc și se pregătesc de luptă.
- **Lupta:** Vale și Kaia contra 3 lupi.
  - La victorie: replici, carne și o blană.
  - La înfrângere: alte replici.
  - În ambele cazuri: încrederea Kaiei +1, ea povestește ce s-a întâmplat și pornește misiunea lupului negru.

**Imagini:** `events/kaia_intalnire_1.png`, `events/kaia_intalnire_2.png`.

**Cum verifici**
1. F2 → „+1 vânătoare câștigată”. Apasă „Ziua următoare” până ajungi în ziua 4. Timp „Dimineață”.
2. Pădure → vânătoarea → prima imagine. Alege „Plec”.
3. Vânează iar: o vânătoare obișnuită (lupi sau mistreț).
4. Vânează încă o dată: iar prima imagine. Alege „O ajut!” → a doua imagine → lupta cu Kaia.
5. După luptă (o câștigi sau o pierzi): replicile Kaiei și „Misiune nouă: Lupul negru”.

### ✅ Lupul negru
- **Pasul:** între 15 și 17, Kaia îl așteaptă pe Vale la **marginea pădurii** (pe imaginea pădurii). „Sunt gata. Hai după lupul negru. ?” duce la lupta cu Kaia contra lupului negru și a doi lupi.
- **Victorie:** încrederea Kaiei +1, apoi îl duce în **tabăra ei** (Camp site se deblochează).
- **Înfrângere:** „Mâine, aceeași oră”.
- **Recompensa:** încredere și Camp site.

**Imagini:** `sprites/vanatoare_padure.png`.

**Cum verifici**
1. F2 → Misiune: Lupul negru → Pornește (sau vino din întâlnirea cu Kaia).
2. Timp „Amiază”, apoi de trei ori „+1 oră” (15:00) → zona pădurii: Kaia e acolo.
3. Vorbește cu ea → „Sunt gata” → „Înainte!” → lupta.
   - Victorie: replicile și tabăra. Camp site apare apoi în pădure.
   - Înfrângere: „Mâine, aceeași oră”.

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
- **Imaginile scandalului** (`events/taverna_scandal_*.png`) le facem când lucrăm la scandal.

**Cum verifici**
1. Ziua 1 sau 2, ora 17:00 („Amiază” + 5 × „+1 oră”), sala tavernei: Roderick te ignoră și ai doar „La revedere”.
2. Treci în ziua 3, tot la 17:00: apare „*Orcii fac multă dezordine și gălăgie...* !” → „(Te uiți spre ei.)” → imaginile scandalului și alegerea.

---

## Agnes (hangița)

### 💡 Camera de la tavernă
- **Camera de sus e ascunsă** (nu se vede, nu se poate închiria) până la o misiune a lui Agnes. De ales misiunea.

**Cum verifici:** la tavernă nu mai apare ușa spre camera de sus. La Agnes nu mai apare „Închiriază o cameră”.

---

## Fermierul

### ✅ Deblocarea fermierului
- **Până atunci,** nu se poate vorbi cu el.
- **Prima patrulă de orci pe câmpuri** vine sigur și devreme: din ziua 3, dimineața (08–13), 80% la fiecare intrare pe câmpuri.
- După ea (oricum ai ales), fermierul devine cel cu care poți vorbi.
- Imaginea e cea de la patrula de orci de pe câmpuri, `events/orci_patrula_campuri.png`.
- Misiunile lui: 💡 de discutat.

**Cum verifici**
1. Ziua 1 sau 2, ora 08–13, câmpuri: fermierul nu se poate apăsa.
2. Ziua 3, 08:00: de pe **hartă**, mergi la câmpuri (de câteva ori, dacă nu vine din prima): patrula de orci.
3. După alegere, fermierul se poate apăsa.

---

## Hoțul

### 💡 De discutat
- Eliberarea (40 de monede la negustor), apoi ajutor din umbră înainte de lupta finală.

---

## Dragonii 💡

- Doar indicii. Rămâne de hotărât cum află Vale de ei și prin ce (o poveste, un obiect, ceva găsit în pădure).
