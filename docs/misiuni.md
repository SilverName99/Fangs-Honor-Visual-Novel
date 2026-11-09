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
- **Fără pauză între misiunile unui personaj** (decis de autor): doar unele misiuni apar cu întârziere, unde e scris la ele (condiția `misiuneTerminata` poate cere zile de la o altă misiune).
- O misiune ratată sau refuzată nu închide drumul: doar nu dă încrederea (exemplu: Roderick, dacă nu-l ajuți în scandal).
- **Tonul** jocului începe întunecat și se încălzește pe măsură ce crește încrederea tuturor; spre final, oamenii vorbesc de revoltă. (📝 de făcut: replici care se schimbă după încrederea totală.)

## Cum testezi (panoul debug)

În editor, la **Testare**, apasă **F2** pentru panoul debug. Butoanele de care ai nevoie:

- **Timp:** „Dimineață” (07:00), „Amiază” (12:00), „Seară” (19:00), „Ziua următoare”, „+1 oră”.
- **Testare misiuni:**
  - „Toți cunoscuți de 3 zile”: sare peste așteptarea de după prima discuție;
  - „+1 vânătoare câștigată”: pentru Kaia.
- **Misiune:** o alegi din listă, apoi „Pornește” (ca după „Accept”) sau „Resetează”. Lista arată la ce pas ești. **„Resetează” întoarce tot jocul la clipa dinainte să înceapă misiunea** (ora, locul, obiectele, încrederea, acoperișul etc.), așa că o poți juca din nou de la ofertă, fără joc nou. Merge pentru misiunile începute de când ai jocul actualizat; la una mai veche doar o șterge din carte.
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
- **Pasul 1:** 10 lemne din pădure („Adună lemne”, de cel mult două ori pe zi). Mini-jocul: 3 lovituri, un cerc se strânge spre inelul auriu și apeși când ajunge pe el; o oră = 1 lemn pe lovitură reușită (0–3), două ore = 2 (0–6). Cu mini-jocurile oprite: 2 și 4 lemne.
- **Pasul 2:** cu lemnele, dimineața, în bucătărie, odihnit (cel puțin 30 stamina): „Uite lemnele, mamă…”. Urmează imaginea cu Vale pe acoperiș (`events/acoperis_reparat.png`, ✅ încărcată), cu 4 ore și 30 stamina consumate, apoi mama îi mulțumește.
- **Recompensa:** încrederea Miriamei +1; casa trece pe „reparată” (harta, zona, imaginile de somn); somnul de acasă reface cu 30% mai multă stamina.

**Cum verifici**
1. Timp „Dimineață” (07:00) într-o zi lucrătoare, apoi „Mergi la”: Bucătăria. Vorbește cu Miriam → „Iar a plouat în casă !” → „Mă ocup eu”.
2. Pune 10 lemne (Obiect: Lemn, de 10 ori; sau adună-le din pădure).
3. Iar dimineața, în bucătărie: „Uite lemnele, mamă…” → imaginea → mulțumirea. În carte, misiunea apare la „Terminate”.

### ✅ Mama îl bandajează (nu e misiune)
- **Când:** Vale e rănit (sub 60 viață) și vorbește cu mama acasă (bucătăria sau camera ei) sau la biserică (sâmbăta și duminica, 05–08: „Hai acasă, acum”, iar Vale ajunge în camera ei); **o dată pe zi**.
- Mama se sperie și îi oferă să-l bandajeze. „Bine, mamă.” → imaginea cu ea bandajându-l în camera ei → trece o oră, viața +30. „Nu-i nimic, mamă” → mama se supără puțin; nu mai întreabă în ziua aceea.

**Imagini:** `events/miriam_bandaj.png`.

**Cum verifici**
1. F2 → nevoi: viața 40. Timp „Dimineață” (07:00, zi lucrătoare), bucătăria.
2. Vorbește cu mama → „Vale! Doamne, ce-ai pățit?” → „Bine, mamă.” → imaginea → „Mulțumesc, mamă.” (viața 70, ceasul +1 oră).
3. Vorbește iar cu ea în aceeași zi: salutul obișnuit. A doua zi, rănit, te întreabă din nou.

### 📝 Cina în familie
- După misiunea lui Roderick **„Locul unde a căzut tata”**: mama îi spune lui Vale să-l invite pe Roderick la cină. La cină vorbesc ca Roderick să-l antreneze pe Vale mai bine (de aici pornește **Antrenamentul**).
- Imagini, cu replicile peste ele.

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
    - **te bați cu colectorul**: el trișează (cu bâta, 400 viață), iar Vale are doar pumnii. Nu se poate câștiga, doar iei bătaie. Data următoare, colectorul își bate joc de Vale că s-a întors, apoi îi dă iar de ales.
- **Când iei fierul înapoi** (oricare cale): o imagine cu fierul primit, iar colectorul îi spune lui Vale că-l mai așteaptă pe la poartă. De acum poarta e deschisă, ziua și noaptea.
- **Pasul 2:** duci fierul la Bram: „Ți-am adus fierul înapoi, Bram. ?”.
- **Recompensa:** 15 monede, încrederea lui Bram +1 și **magazinul lui deschis**. Până atunci, ușa fierăriei e zăvorâtă.
- **Poarta e închisă până termini misiunea** (decis de autor): înainte de misiune sau cu fierul deja la tine, orcul te oprește (prima imagine de la poartă) și te întoarce pe hartă. Noaptea (23–06) Vale nici nu ajunge acolo: doar se gândește că n-ar fi bine. Taxa se plătește atunci doar când vine colectorul acasă.
- **Legături:** folosește jocul de zaruri de la poartă.

**Imagini:** `events/bram_fier_1.png`, `events/bram_fier_2.png`, `events/poarta_fier_1.png`, `events/poarta_fier_2.png`, `events/poarta_fier_recuperat.png`.

**Cum verifici**
1. F2 → „Toți cunoscuți de 3 zile”. Dacă ești în ziua 1 sau 2, apasă „Ziua următoare” până ajungi în ziua 3. Apoi timp „Dimineață” (07:00, zi lucrătoare).
2. De pe **hartă**, mergi la fierărie: rulează cele două imagini cu replici. (Sau: Eveniment `bram_fier_confiscat` → Pornește.)
3. Vorbește cu Bram → „Am văzut ce s-a întâmplat cu fierul... !” → „Îl aduc înapoi, Bram.”
4. Încearcă ușa fierăriei: e zăvorâtă. (Înainte de pasul 3, încearcă și poarta: orcul te întoarce pe hartă.)
5. De pe **hartă**, mergi la poartă: imaginea 1 → „Vreau să vorbesc cu colectorul” → imaginea 2 cu cele trei căi. Încearcă-le pe rând (după fiecare, ieși și intră iar la poartă):
   - **Plătesc:** pune 60 de monede din F2;
   - **Zaruri:** ora 14–18 (de exemplu „Amiază” + 2 × „+1 oră”). Miza orcilor e „Fierul lui Bram”;
   - **Mă bat:** lupta cu pumnii contra colectorului; pierzi.
   - După „Nu acum”, „Mă mai gândesc” sau o bătaie pierdută, Vale ajunge înapoi pe hartă: paznicul nu-l lasă la poartă cât e misiunea în lucru.
6. Cu fierul (îl vezi la Obiecte de poveste), vorbește cu Bram → „Ți-am adus fierul înapoi” → 15 monede, încredere +1. Ușa magazinului se deschide (când Bram e acasă).

### 📝 Foalele stricate
- Foalele forjei s-au stricat; Vale aduce **3 piei de mistreț** pentru unele noi. Imagini, cu replicile peste ele. Vine înaintea cheii.

### 💡 Cheia camerei lui Bram
- După „Foalele stricate”. Ce e în cufăr: de discutat.

---

## Fratele Elian (preotul)

### ✅ Ierburile lui Elian
- **Pornește:** doar când Elian e **afară** (citește pe scările bisericii, 14–23), la cel puțin o zi după prima discuție. Opțiunea e „Ce citești, frate Elian? !”.
- **Pasul 1:** 4 fire de **sunătoare**. Dimineața (5–10), în pădure: „Caută ierburi” (1 oră, de cel mult două ori pe zi). Locul apare în pădure **doar de când ai misiunea** și rămâne și după ea.
  - **Mini-jocul:** pe imaginea culesului apar **13 plante** la întâmplare, în zona desenată de tine în editor: 4 sunătoare și câte 3 de păpădie, piciorul-cocoșului și mușețel. Culegi **cel mult 4**; fiecare sunătoare = 1 fir, celelalte nu aduc nimic (gândul „Unele nu semănau…”).
  - Descrierea lui Elian („flori galbene, mici, cu cinci petale, în mănunchi; frunzele, ținute în lumină, au găurele mici”) e sus pe ecran, în carte și în „Cum arăta sunătoarea?”.
  - Cu mini-jocurile oprite (Opțiuni), Vale o alege singur pe cea bună și primește 2 fire.
- **Pasul 2:** dai ierburile lui Elian.
- **Recompensa:** încrederea lui Elian +1 și 2 pansamente.
- **După misiune:** în meniul lui Elian apare „Schimburi (sunătoare pentru pansamente)”: se deschide un ecran ca la magazin, cu schimbul în stânga (3 sunătoare → săgeata → 1 pansament, cu câte fire ai) și rucsacul în dreapta; „Schimbă” se poate apăsa de câte ori ai fire.
- **Mecanica:** e diferită de a lui Bram (acolo alegi cum să iei fierul; aici recunoști planta).

**Imagini:** `locations/munca_ierburi.png` (fundalul mini-jocului), `items/sunatoare.png`, `items/papadie.png`, `items/piciorul_cocosului.png`, `items/musetel.png`.

**De aranjat în editor:** Aranjare → Ecrane → „Culesul (mini-joc): Caută ierburi”: desenezi „Zona în care apar plantele” (unde e iarbă pe imagine) și măreşti/micșorezi „O plantă” cu rotița, ca să alegi mărimea plantelor. Până desenezi zona, plantele stau în jumătatea de jos.

**Cum verifici**
1. F2 → „Toți cunoscuți de 3 zile”. Timp „Amiază”, apoi de două ori „+1 oră” (14:00).
2. Mergi la biserică (zona, unde Elian citește pe scări) → vorbește cu el → „Ce citești, frate Elian? !” → „Ți le aduc”.
3. Timp „Dimineață” → mergi în pădure → „Caută ierburi” → apar 13 plante; culege 4:
   - fiecare sunătoare culeasă dă +1 fir;
   - dacă ai luat și altele, gândul „Unele nu semănau…”;
   - a treia oară în aceeași zi, „Roua s-a uscat”;
   - la prânz, „se culege dimineața”.
4. Cu 4 fire (sau din F2: Obiect Sunătoare), vorbește cu Elian → „Ți-am adus sunătoarea” → încredere +1 și 2 pansamente.
5. Mai adu 3 fire (sau din F2) → la Elian, „Schimburi” → apasă pe schimb → „Schimbă” → 1 pansament în rucsac; cu mai puțin de 3 fire, gândul „Îmi trebuie 3…”. „Caută ierburi” e încă în pădure.
6. Opțiuni → „Mini-jocurile” → Oprește-le → „Caută ierburi” dă direct 2 fire.

### 📝 Bolnavul
- Elian îi spune lui Vale de o plantă specială care apare **doar seara** (18–23, în pădure, cu mini-jocul culesului); bolnavul e un sătean fără nume. Vale o găsește și i-o duce, iar seara merg împreună la casa bolnavului și i-o dau ca ceai sau pastă, ca să se facă bine. Imagini, cu replicile peste ele.

### 📝 Cărțile
- Orcii vor să percheziționeze biserica; Vale îl ajută pe Elian să ascundă niște cărți vechi. Primul semn că preotul ascunde ceva.

### 💡 Secretul lui Elian
- După „Cărțile” (poate încă una). Idee: Vale și Roderick luptă cu ceva prea puternic, iar Elian apare, îi apără cu un scut de lumină și le reface viața. De discutat.

---

## Kaia (vânătoarea)

### ✅ Întâlnirea cu Kaia
- **Pornește:** prima vânătoare câștigată deblochează întâlnirea. Din **ziua 4**, la următoarea vânătoare, în locul vânatului obișnuit:
  - **prima imagine:** Vale o vede pe Kaia, călare pe tigru, față în față cu 3 lupi care o înconjoară; încă nu se luptă, se pândesc (decis de autor). Vale se gândește ce să facă.
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
3. Vorbește cu ea → „Sunt gata” → „Înainte!” → imaginea adâncului pădurii („Cauți urme de vânat...”, trece o oră) → lupta.
   - Victorie: replicile și tabăra. Camp site apare apoi în pădure.
   - Înfrângere: „Mâine, aceeași oră”.

### Vânătoarea împreună (după Lupul negru)
- **Când:** dimineața, 05–10, la Camp site, Kaia e acolo. În meniul ei apare „Mergem împreună la vânătoare?”.
- „Să mergem.” → vânătoarea obișnuită (lupi sau mistreț), cu Kaia sigur alături în luptă. „Poate altă dată.” te întoarce la meniu.
- După luptă: un scurt dialog (altul după înfrângere), apoi Kaia se întoarce în pădure (nu mai e la campsite până la 14:00), iar Vale rămâne în tabără.

**Cum verifici:** după Lupul negru, mergi la Camp site la 07:00 → apasă pe Kaia → „Mergem împreună la vânătoare?” → „Să mergem.” → lupta are două tabere: Vale și Kaia contra animalelor. La 15:00 opțiunea nu mai apare.

---

## Roderick Lightfinder (unchiul)

### 📝 Locul unde a căzut tata
- Vale și Roderick merg la locul bătăliei unde a căzut tatăl lui Vale, **prin ieșirea din zona hoțului** (deci după eliberarea hoțului). Amintiri din copilăria lui Vale; Vale plânge, Roderick îl consolează. Nu găsesc nimic: e o misiune de poveste. Dialoguri lungi și dramatice, peste imagini. La final, încrederea lui Roderick +1.
- După ea vine „Cina în familie” (Miriam).

### 📝 Antrenamentul
- După cină: Roderick îl antrenează pe Vale, **de 3 ori, o dată pe zi**. Fiecare antrenament: **+5 viață maximă**; la final, încrederea lui Roderick +1.

### ✅ Hârtiile soldatului
- **Pornește:** după „Camera de sus”, cu hârtiile la Vale, în meniul lui Roderick: „Unchiule, am găsit niște hârtii... !”.
- Toată discuția stă peste o imagine: Roderick recunoaște scrisul prietenului lui, povestea solzului pe care „nu-l zgâria nicio sabie”, dragonii pe care toată lumea îi crede pieriți; dacă e adevărat, ar fi ceva de folosit împotriva orcilor, dar drumul trece dincolo de zid.
- Fără încredere (doar discuție); după ea vine **primul vis**.
- **Imagine:** `events/roderick_hartii.png` (Vale și Roderick la o masă din tavernă, aplecați peste hârtii, la lumina lumânării).

**Cum verifici:** după „Camera de sus”, 15:00, sala tavernei → Roderick → „Unchiule, am găsit niște hârtii...”.

### ✅ Primul vis (nu e misiune)
- Data următoare când doarme (oriunde, oricât), după discuția despre hârtii: Vale visează că e purtat de ceva uriaș care zboară, simte o căldură în piept „ca un al doilea foc”, apoi se trezește speriat.
- **Imagine:** `events/vis_1.png`.

**Cum verifici:** după „Hârtiile soldatului”, acasă → Dormi 2 ore → după imaginea somnului, visul.

### 📝 Solzii de dragon
- După discuția despre hârtii: Vale și Roderick pleacă în căutarea solzilor, prin ieșirea din zona hoțului (deci după eliberarea hoțului).

### ✅ Scandalul din tavernă
- **Până la scandal,** Roderick nu-l bagă în seamă pe Vale („Unchiul Roderick nici nu ridică ochii din cană”).
- **Pornește:** din **ziua 3**, în tavernă, cât e și Agnes acolo (16–00). În meniul lui apare „*Orcii fac multă dezordine și gălăgie...* !”: o scurtă poveste (orcii de la masa din colț cer bere, Agnes se teme, Roderick strânge cana), apoi orcul o apucă pe Agnes de braț → „(Te uiți spre ei.)” → toată scena peste cele 3 imagini (replicile stau peste ele): orcii cer bere, unul o apucă pe Agnes, Roderick se ridică și îi cere lui Vale să aleagă (dialogul `taverna_scandal`).
  - **Îl ajuți:** „Nu ești singur, unchiule.” → luptă alături de Roderick contra a doi orci. Încrederea lui +1. Mai departe:
    - victorie: o imagine, apoi Agnes și Roderick vorbesc cu Vale (pentru prima dată Roderick chiar se uită la el); Agnes te hrănește, primești 3 pâini și 2 beri, iar taxa crește cu 10;
    - înfrângere: o imagine, apoi Agnes îl îngrijește pe Vale și Roderick îi spune că a stat lângă el, atât i-a cerut; rămâi cu 10 viață și trec 2 ore.
  - **Refuzi:** 2 imagini (decis de autor): Roderick se bate singur și e doborât, apoi orcii pleacă râzând; dialogul cu el, rănit, tot peste imagine. Nu primești încredere, dar **tot îl poți recruta** mai târziu.
- **Legături:** după scandal vine „Cina în familie” (Miriam).
- **Imaginile:** `events/taverna_scandal_1.png`, `_2`, `_3` (orcii la masă, orcul o apucă pe Agnes, dezordinea și Roderick ridicându-se), `taverna_scandal_victorie.png`, `taverna_scandal_infrangere.png`, `taverna_scandal_refuz_1.png`, `taverna_scandal_refuz_2.png`.

**Cum verifici**
1. Ziua 1 sau 2, ora 17:00 („Amiază” + 5 × „+1 oră”), sala tavernei: Roderick te ignoră și ai doar „La revedere”.
2. Treci în ziua 3, tot la 17:00: apare „*Orcii fac multă dezordine și gălăgie...* !” → „(Te uiți spre ei.)” → imaginile scandalului și alegerea.
3. Victoria și înfrângerea se văd și direct: F2 → Eveniment → `taverna_scandal_victorie` / `taverna_scandal_infrangere` → Pornește.

---

## Agnes (hangița)

### ✅ Camera de sus (prima misiune a lui Agnes)
- **Pornește:** la câteva zile după prima discuție cu Agnes, în tavernă, cât e ea acolo: „Ce s-a întâmplat cu camera de sus? !”. Agnes povestește de fostul chiriaș, un soldat căzut în ziua în care a căzut și tatăl lui Vale. „Las-o pe mine, doamna Agnes. O golesc eu.”
- **Pasul 1:** ușa camerei de sus apare în zona tavernei (cât e misiunea în lucru, se intră fără chirie). Acolo, cât e taverna deschisă (9 dimineața – 2 noaptea): „Strânge lucrurile chiriașului” (1 oră și jumătate, −10 stamina), apoi scena, peste 3 imagini (decis de autor):
  1. camera cu lucrurile soldatului prin ea; Vale se apucă de strâns;
  2. camera curată, Vale aproape a terminat și vede ceva sub pat: un rucsac cu niște hârtii vechi (nu le citește);
  3. jos, în tavernă: Vale îi arată lui Agnes ce a găsit; ea nu înțelege ce sunt și îl trimite la Roderick. Vale rămâne în sala tavernei.
- **Hârtiile** (`hartii_vechi`) ajung la obiectele de poveste și rămân acolo. **Se citesc cu un clic** pe ele (inventar → „Obiecte de poveste” → Hârtii vechi → „Citește”), fiecare peste imaginea ei (decis de autor): (1) un solz desenat în creion, cu o mână pentru mărime, o lamă știrbită și nota „Nici sabia, nici focul nu l-au zgâriat.”; (2) semne ciudate copiate de pe o piatră înaltă și urme de gheare uriașe în stâncă; (3) o hartă: satul, zidul, un drum prin pădure, peste un râu, pe lângă niște ruine, până la o râpă însemnată cu X (propunerea lui Claude, de confirmat).
- **Recompensa:** încrederea lui Agnes +1; camera de sus se poate închiria (5 monede).
- **Imagini:** `events/agnes_camera_1.png` (camera cu lucrurile soldatului, fără Vale), `events/agnes_camera_2.png` (camera curată, Vale vede rucsacul sub pat), `events/agnes_camera_3.png` (jos, la tejghea, Agnes se uită la hârtii), `events/hartie_1.png`, `hartie_2.png`, `hartie_3.png` (fiecare hârtie de aproape, la citit).

**Cum verifici**
1. F2 → „Toți cunoscuți de 3 zile”. Timp 10:00, sala tavernei, vorbește cu Agnes → „Ce s-a întâmplat cu camera de sus?” → „Las-o pe mine”.
2. Înapoi la zona tavernei → ușa de sus → „Strânge lucrurile chiriașului” → cele 3 imagini; la final ești în sala tavernei, cu încredere +1 la Agnes și „Închiriază o cameră” la ea.
3. Inventar (I) → semnul „Obiecte de poveste” → Hârtii vechi → citești hârtiile.

### 📝 Pivnița
- Agnes aude zgomote ciudate din pivniță; a deschis ușa, s-a speriat și a închis-o repede, fără să vadă ce era. Jos sunt **3 șobolani**: unul care scuipă bale acide (otravă, de la distanță) și doi care atacă cu ghearele. Luptă în pivniță (loc nou, `taverna/pivnita`, cu hartă de luptă; se intră doar din sala tavernei; după misiune rămâne deschisă, pentru mai mult lore).
- Șobolanii care scuipă revin în lupta finală, ca ajutoare de la distanță ale orcilor.

### 📝 Berea
- Orcii i-au golit butoaiele. Vale aduce **5 orz** (cât e misiunea în lucru, munca la moară dă și orz, obiect de poveste, fără loc în rucsac, până are destul) și **2 miere** (de la fermier, 5 monede bucata). Agnes face bere nouă.

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

## Finn (hoțul)

### 📝 Eliberarea
- După discuția cu negustorul, Vale poate cere să vorbească cu hoțul. Hoțul îi spune de ce a furat: din nevoie, ca să-și hrănească familia; nimeni nu-l crede, dar Vale îl crede și îl eliberează.
- După eliberare apare pe hartă un **drum nou**, spre o mică zonă (o zonă obișnuită a hărții, cu imaginea ei ca o hartă mică): **casa lui Finn** (hoțul), **ieșirea mai puțin păzită** de orci (pe unde Vale și Roderick ies în misiuni), **contrabandistul** (lucruri care nu se găsesc în piață), **cimitirul satului** (mormântul tatălui) și **coliba ierbăresei**.

### 📝 Mâncarea
- Vale aduce mâncare familiei hoțului.

### 📝 Lada colectorului
- Seara, cu hoțul, Vale recuperează bani și alte lucruri de la orcul colector. Nu ajută la lupta finală: ajută sătenii.

---

## Dragonii

- Doar indicii în demo. Prima apariție: **hârtiile din camera de la tavernă** (misiunea lui Agnes), apoi căutarea solzilor cu Roderick. Lumea mare: `docs/lore.md`.
- 📝 **Semne pe parcurs** (decis de autor): după anumite misiuni, data următoare când doarme, Vale visează ceva; uneori simte ceva ciudat. Nu prin tigrul Kaiei (Vale și Kaia se cunosc de mult).
- 📝 **Finalul demo-ului** (decis de autor): după ce satul e eliberat, Vale împlinește 26 de ani. În noaptea aceea se aude un răget în depărtare sau apare un mag străin. Cliffhanger pentru jocul mare.
