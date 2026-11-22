# Misiunile: evidență și walkthrough

Documentul ține minte fiecare misiune: cum pornește, ce faci, ce primești și cu ce se leagă.
Pentru fiecare misiune are și **imaginile** cerute și **cum o verifici** în editor, la Testare.
Mai târziu devine walkthrough-ul jocului. Se actualizează la fiecare misiune nouă sau schimbată.
În editor se citește din tab-ul **Misiuni**, pe căsuțe: fiecare `##` e o căsuță, fiecare `###` e o misiune în ea (păstrează titlurile așa).

**Starea fiecărei misiuni:** ✅ în joc · 📝 hotărâtă, nefăcută încă · 💡 idee, de discutat.
Replicile din joc sunt ciorne de-ale lui Claude, până le schimbă autorul.

## Regulile generale (decise de autor)

- O misiune apare la un personaj doar **după prima discuție cu el** și după **câteva zile** (diferit pentru fiecare).
- **Semnele** din meniul de discuție, de deasupra personajului și de pe hartă: **!** = misiune nouă, **?** gri = în lucru (dă indicația), **?** auriu = gata de predat.
- **Încrederea** (0–10) crește prin misiuni duse la capăt. Un personaj se poate **recruta de la 8/10**.
- **Fără pauză între misiunile unui personaj** (decis de autor): doar unele misiuni apar cu întârziere, unde e scris la ele (condiția `misiuneTerminata` poate cere zile de la o altă misiune).
- O misiune ratată sau refuzată nu închide drumul: doar nu dă încrederea (exemplu: Roderick, dacă nu-l ajuți în scandal).
- **Tonul** jocului începe întunecat și se încălzește pe măsură ce crește încrederea tuturor; spre final, oamenii vorbesc de revoltă. (📝 de făcut: replici care se schimbă după încrederea totală.)

## Lumea, pe scurt (foarte important)

Tot ce e mare în universul *Fangs&Honor*, pe scurt, ca să nu uităm nimic (decis de autor; pe larg în `docs/lore.md`). ❓ = încă de lămurit.

**În ordine: ce s-a întâmplat până începe povestea lui Vale** (adunat din deciziile de mai jos; nimic nou)
- **Demult:** dragonii trăiesc în lumile lor. Sunt 5 primordiali (apă, foc, pământ, aer, moarte), fiecare cu un portal în lumea noastră: al focului îl păzesc oamenii, al aerului elfii de pădure, iar al morții nu-l știe nimeni (o crăpătură în pământ). Darul dragonilor se trezește la 26 de ani: trezirea mică sau, foarte rar, cea mare.
- **Acum ~2000 de ani** (decis de autor): elfii de pădure găsesc **primul portal, al aerului**. Multă vreme nu știe nimeni de el, până când, într-o luptă între elfi și oameni, elfii vin cu un dragon: **Karzor**, cu primul elf legat de el. **Cam 500 de ani mai târziu**, oamenii găsesc **portalul focului**; **încă ~1000 de ani** se află ce sunt porțile, cum funcționează și cine are trezirea.
- **Acum 200 de ani** (decis de autor): într-o mină, oamenii găsesc **Inima Luminii**, care, în lumina soarelui, face foarte rar cristale mici. Se înființează **Cercul Luminii**, din cei mai puternici magi, ca să ajute Ordinul Flăcării să-i găsească pe cei care se trezesc; trimite câte un mag în fiecare sat; rombul auriu de pe steaguri e forma cristalelor. **Ordinul Flăcării**, călăreții de dragoni, îi caută pe cei cu trezirea.
- **Regele Aldric** (decis de autor) e legat cu **Ardrax**, primordialul focului; **împăratul elfilor de pădure**, în taină, cu **Karzor**, primordialul aerului (lumea îl crede mort).
- **Acum 20 de ani:** **Arcon**, mag al Cercului Luminii corupt de necromanție, încearcă să corupă Inima Luminii. Regele îl oprește, sacrificându-se (dragonul focului moare odată cu el și renaște în lumea lui). De atunci domnește fiul lui, **Cedric**, iar trezirea mare n-a mai fost găsită la nimeni. Arcon scapă cu o vrajă interzisă și devine **Narco**; nimeni nu știe că trăiește.
- **Acum 10 ani, războiul** (decis de autor): Narco îi spune lui **Gorvak**, căpetenia Craniilor Sângerii: „Oamenii și-au pierdut dragonul. Loviți capitala acum, înainte să găsească altul, și luați-le Inima Luminii.” Orcii pornesc războiul și pregătesc asediul capitalei, cu wyverni; nimeni nu știe că Narco e în spatele lor. Lumea nu înțelege de ce au pornit orcii războiul: magia luminii nu le folosește la nimic (decis de autor). Departe, pădurile au tăcut: animale moarte fără nicio rană, care nu putrezesc (Kaia află abia în timpul poveștii; ❓ de când și ce le-a omorât).
- **În satul lui Vale, Baum** (retras, la marginea regatului; nimeni de aici n-a văzut un dragon): Cercul Luminii, la cererea Ordinului Flăcării, îl trimite pe **Elian**, cu un cristal mic, să găsească trezirea simțită aici; toți îl cred un preot-mag începător (❓ când a venit). Un soldat, chiriașul din camera de sus a tavernei și prietenul lui Roderick, găsise departe un solz de dragon și desenase o hartă până la o crăpătură în pământ: portalul morții.
- **Primăvara trecută:** lângă **copacul mare**, dincolo de gardul Marginii, cad **23 de oameni ai satului** care încercau să oprească orcii, printre ei **Edwin Lightfinder** și soldatul. Edwin îi poruncește lui Roderick să fugă: „Ai grijă de Miriam și de băiat.” Roderick îl duce pe Edwin în spate până la cimitir; de atunci bea și nu se mai poate uita în ochii Miriamei. **A doua zi, satul cade.** Înainte de răsărit, Bram strânge de pe câmp **22 de săbii**; a lui Edwin e la Miriam, care îi ascunde echipamentul.
- **De atunci:** orcii îi cruță pe săteni în schimbul unei **taxe săptămânale**, ridică zidul și păzesc ieșirea. Satul trăia mai ales din agricultură, unul dintre motivele pentru care a fost cruțat și ocupat (decis de autor); stă pe drumul mare spre capitală și muncește pentru asediul lor (grâu, fier, piei).
- **Când începe jocul:** Vale are 25 de ani și **trezirea mare**, dar nu știe; se va lega cu **primordialul morții** (Actul 2). Finn stă legat la butuc, în piață, pentru că a furat ca să-și hrănească mama bolnavă și sora.

**Universul și Actul 1**
- *Fangs&Honor* e lumea jocului principal al autorului (de acolo vin unele personaje; Kaia e Huntress). Jocul pe care îl facem e **Actul 1: Recuperarea satului**; în **Actul 2** (idee), Vale trece prin portalul morții și se leagă cu dragonul lui. În Actul 1 **nu** apar dragoni adevărați (doar indicii), altă magie decât a preotului, harta mare și fortăreața.
- **Ce știu oamenii:** neamul omenesc știe de magie, de dragoni, de Ordinul Flăcării și de Inima Luminii. Satul lui Vale e retras, la marginea regatului, și n-a luat parte la războaie: **nimeni de aici n-a văzut vreodată un dragon**. Lumea lor e **Aldaria**; regatul, **Aldenor**, cu capitala **Altaris**; satul lui Vale, **Baum** (decis de autor). Oamenii au **un rege**; elfii de pădure, **un împărat**.

**Dragonii, lumile lor și portalurile**
- Dragonii trăiesc **în lumile lor**, câte una pentru fiecare fel: a focului (pârjolită, dragoni roșii și portocalii), a aerului (munți plutitori, dragoni albi), **a morții** (doar moarte, dragoni din oase) etc.
- **Cei 5 dragoni primordiali:** apă, foc, pământ, aer și moarte (al morții e un fel de dragon necromant). Fiecare are lumea lui și **un portal** în lumea noastră. Se știe de două: al **aerului** (al elfilor de pădure, adânc în pădure; primul găsit, acum ~2000 de ani) și al **focului** (păzit de oameni, găsit cam 500 de ani mai târziu). Al **morții** nu-l știe nimeni: e adânc într-o crăpătură din pământ, unde duce harta soldatului. Apa și pământul: nedescoperite.
- Un portal îl deschid, greu, doar magi foarte puternici. Prin el trece **doar cine are darul dragonilor** (ceilalți mor), iar din lumea dragonilor **nu ieși decât legat cu un dragon**.

**Trezirea și legământul**
- Darul se trezește **la 26 de ani**, în două feluri: **mic** (vorbești cu dragonii, te legi cu **dragoni mai slabi**, fără viață mai lungă) și **mare**, foarte rar (te legi cu **un primordial** și trăiești până la vreo **300 de ani**, față de ~100). Magii puternici simt trezirile.
- **Legământul:** dragonul **ia înfățișarea rasei** celui cu care se leagă; sunt **legați pe viață și pe moarte** (moare unul, moare și celălalt), dar **un primordial renaște** în lumea lui. Dragonul îți spune **o incantație** cu care îl chemi printr-un portal; telepatic vorbiți oricând.

**Ordinul Flăcării și regele**
- **Ordinul Flăcării**: călăreții de dragoni ai oamenilor; **nu e secret**. Îi caută mereu pe cei cu trezirea. **Mai are călăreți**, cu dragoni mai mici (decis de autor), folosiți **doar la nevoie mare**: de 10 ani e război, totul se cântărește și resursele se drămuiesc, iar satele de la margine au rămas singure.
- **Regele Aldric** (decis de autor), mag-războinic, era legat cu **Ardrax**, **primordialul focului**. A murit **acum 20 de ani**, sacrificându-se ca să-l oprească pe Arcon; odată cu el a murit și dragonul (care a renăscut în lumea focului). De atunci domnește fiul lui, **Cedric** (decis de autor), iar oamenii n-au mai găsit pe cineva cu trezirea mare.

**Karzor și elfii de pădure**
- **Karzor**, primordialul **aerului**, cu fulgere: lumea îl crede mort. E primul dragon văzut de oameni: acum ~2000 de ani, într-o luptă între elfi și oameni, cu primul elf legat de el (decis de autor). E legat cu **împăratul elfilor de pădure**; știe doar **organizația secretă a elfilor**, singura organizație secretă rămasă (mai târziu, o întorsătură mare într-o bătălie). Arată ca un dragon al pădurii: solzi ca scoarța și frunze, aripi verzi-maronii pe oase ca ramurile, coarne ca niște crengi, pe piept un scut auriu cu un copac.

**Inima Luminii și Cercul Luminii**
- **Acum 200 de ani** (decis de autor), într-o **mină**, oamenii au găsit **un singur cristal** (cât să stea pe un piedestal; îl pot căra patru oameni): **Inima Luminii**. La lumina soarelui radiază putere și, foarte rar, **creează cristale mici**, care fac **magia luminii** mult mai puternică. E cea mai mare putere magică a oamenilor; necromanția o poate corupe. E păzită în **clădirea principală a capitalei**.
- **Cercul Luminii**, asociația magilor, nu e secret: s-a înființat tot atunci, din cei mai puternici magi, ca să ajute Ordinul Flăcării să-i găsească pe cei care se trezesc (decis de autor); trimite câte un mag în fiecare sat.
- **Rombul auriu** de pe steaguri și scuturi (steagul albastru al satului, platoșa și sabia lui Edwin) e **forma cristalelor mici**: doar pus acolo, le dă oamenilor încredere și putere.

**Narco**
- **Arcon**, unul dintre cei mai puternici magi ai Cercului Luminii, a fost corupt de **necromanție** (magia interzisă la oameni, la elfi, la toți). **Acum 20 de ani** a încercat să corupă Inima Luminii; regele l-a oprit, sacrificându-se, și toți l-au crezut mort. **N-a murit:** cu o vrajă interzisă, care merge o singură dată, a reapărut **la un steag pus de el dinainte**. De atunci e **Narco** (numele întors) și nimeni nu știe că trăiește.
- **Arată acum** ca un **schelet** cu ochi verzi, în glugă mov, cu armură cu cranii, un **felinar cu un cristal corupt** și un toiag cu un **steag mov cu un semn alb**. Pe spate are **un sarcofag** cu sufletele și oasele celor mai puternici luptători răpuși: deschis, ele se adună într-un **monstru din oase și foc verde**, pe care îl controlează.
- Vrea doar **Inima Luminii**. I-a spus lui **Gorvak**: „Oamenii și-au pierdut dragonul. Loviți capitala acum, înainte să găsească altul, și luați-le Inima Luminii.” **Nimeni nu știe că el e în spatele războiului.**

**Orcii**
- Trei triburi mari: **Craniile Sângerii** (*Blood Skulls*, steag roșu cu un craniu, căpetenia **Gorvak**), cel mai mare, care atacă acum oamenii; **toți orcii din sat sunt din el**. Al doilea: deocamdată nu contează. **Colții de Fier** (*Iron Tusks*, căpetenia **Urzhal**), cel mai mic, dar puternic: îi vor ajuta pe oameni mai târziu (nu în Actul 1).
- Orcii n-au dragoni: au **wyverni** (nu dragoni adevărați), cu ritualul lor, și **unelte împotriva dragonilor**. Craniile Sângerii pregătesc **asediul capitalei**.
- **Războiul a început acum 10 ani** (decis de autor), la 10 ani după moartea regelui, și nimeni nu știe exact de ce. Orcii **nu pot folosi magia luminii**: se bizuie pe **magia naturii**, iar **șamanii** le întăresc trupele și cheamă animalele în ajutor.
- **Drumul mare** (decis de autor) pleacă de la poarta satului și merge zile întregi, până la capitală; pe el pleacă, în căruțele orcilor, fierul, grâul și pieile satului. Noaptea, pe el trece spre capitală un **convoi cu wyverni în cuști** (misiunea Kaiei „Convoiul”): Vale și Kaia îi văd de departe și îi cred dragoni.
- **De ce n-au distrus satul:** trăia mai ales din agricultură (decis de autor); cucerit și pus să muncească pentru ei (taxa, grâul, fierul, topoarele ascuțite de Bram), satul îi ajută să se pregătească de asediu. În plus, stă chiar pe drumul mare spre capitală, pe unde trec convoaiele lor (decis de autor).

**Șobolanii și teroarea**
- **Un clan de șobolani mutanți care vorbesc**, aliat cu **„teroarea” care vine**: „cerul se face negru, iar morții ies din morminte”. **Teroarea e ce poate face Narco** (moartea, morții vii, magia interzisă); ei îi zic „Stăpânul-oaselor”. Îl avertizează pe Vale să se gândească de partea cui stă. În jocul principal, trei unități de șobolani îi ajută pe morți (Undead); în Actul 1, cei care scuipă bale acide revin în lupta finală, de partea orcilor.
- Vorbesc ca niște șobolani, peste tot în univers: repede, repetă cuvintele („da-da!”), leagă cuvintele cu cratimă („om-lucru”, „cei-mulți”), șuieră („Ssss!”); lăudăroși și lași în același timp.

**Vale și dragonul lui**
- Vale Lightfinder, 25 de ani, are **trezirea mare**. **Nu știe.** Se va lega cu **primordialul morții** (întorsătura cea mare), cel din vise (ochiul din al doilea vis), prin portalul din crăpătura de pe hartă. **Primul vis rămâne cu focul**: jucătorul se gândește la foc, iar întorsătura e moartea. ❓ (mai târziu) Cum arată dragonul după legământul cu un om.
- **Finalul Actului 1:** după eliberarea satului, Vale împlinește 26 de ani; în noaptea aceea se aude un răget în depărtare sau apare un mag străin.

**Satul și familia Lightfinder**
- Primăvara trecută, **23 de oameni ai satului** au încercat să oprească orcii pe câmpul de dincolo de gardul Marginii, lângă **copacul mare** (acolo se cățărau Edwin și Roderick când erau copii; tot acolo a cerut-o Edwin pe Miriam). Au căzut, printre ei **Edwin Lightfinder**, tatăl lui Vale. Edwin i-a poruncit fratelui lui: **„Fugi în sat, Roderick. Ai grijă de Miriam și de băiat.”** Roderick a ascultat; de atunci bea și nu se mai poate uita în ochii Miriamei. L-a dus pe Edwin în spate până la cimitirul de la Marginea.
- Satul a căzut a doua zi. Orcii i-au cruțat pe oameni în schimbul unei **taxe săptămânale**, au ridicat zidul și păzesc ieșirea.
- **Echipamentul lui Edwin** (coiful cu creasta albastră, platoșa cu rombul auriu, crăpată pe mijloc de lovitura care l-a doborât, jambierele, sabia cu rombul pe măciulie) l-a ascuns Miriam; i-l dă lui Vale de la 8/10 încredere, iar platoșa o repară Bram.

**Indiciile despre dragoni, în Actul 1**
- **Hârtiile soldatului** (camera de sus a tavernei; fostul chiriaș, prietenul lui Roderick, căzut în bătălie): un solz cât palma, „pe care nu-l zgâria nicio sabie”, găsit „departe, dincolo de pădure”; semne ciudate copiate de pe o piatră înaltă și urme de gheare uriașe în stâncă; o hartă până la o crăpătură în pământ însemnată cu X: **portalul morții**. Roderick: „Ca și cum l-aș mai fi văzut undeva.”
- **Visele**, doar după un somn peste noapte, cu ceață pe margini: primul (purtat de ceva uriaș care zboară, o căldură în piept „ca un al doilea foc”); al doilea (bătălia, Edwin căzut, ochiul lui trece în ochiul unui dragon); al treilea (după „Convoiul”: wyvernul din cușcă și umbra unui dragon peste Vale); al patrulea (după „Noaptea de la cimitir”: cei 23 se ridică din morminte, verzi și reci, și pleacă spre o crăpătură în pământ; Edwin se întoarce la margine: „Încă nu, Vale. Dar te așteaptă.”). **Semnele nu vin prin tigrul Kaiei.**
- **Filmulețele din vise** (decis de autor): fiecare vis are un filmuleț (primul la început; al doilea la sfârșit, ochiul lui Edwin → ochiul dragonului; al treilea între imagini, cușca → umbra; `events/vis_N.mp4`, MP4, încărcat din galerie, la grupul visului): pe tot ecranul, fără text, cu ceața visului; un clic îl sare; fără el, visul începe cu imaginea, ca înainte. Se descarcă întreg înainte să înceapă visul (decis de autor), încă din timpul somnului; dacă nu e gata, apare „Se pregătește visul... %”. **Cum verifici:** galeria → grupul visului → „▶ Pornește visul” (Testarea: Vale doarme, apoi visul).
- 📝 **Solzii de dragon**, cu Roderick, dincolo de gard: arată spre portalul morții.

**Personajele cu taină**
- **Fratele Elian**, preotul, e și **magul satului** (fiecare sat are unul, trimis de Cercul Luminii). **Toți, și orcii, îl cred un mag începător**; de fapt e foarte puternic. **Secretul lui:** are la el **un cristal mic** și a fost trimis să găsească **trezirea** simțită în sat, fără să știe a cui. L-a trimis **Cercul Luminii, la cererea Ordinului Flăcării**. În „Secretul lui Elian” Vale află doar o parte (mag adevărat, cristalul, încăperea de sub biserică), nu și de trezire; cristalul se aprinde lângă Vale, iar Elian tace (indiciu). Din săbiile celor căzuți (22; a lui Edwin e la Miriam), Bram bate **Toiagul celor 23**, cu cristalul în cap, pe care Elian i-l dă lui Vale pentru lupta finală.
- **Kaia** (doar Kaia, fără nume de familie) e din clanul **Wild Warden** (în joc: **Străjerii Sălbăticiei**): oamenii născuți cu **darul animalelor**. Clanul trăiește la marginea pădurilor mari, în așezări mici sau mijlocii, ca să apere pădurile și animalele și să țină echilibrul. Fiecare Străjer are **un tovarăș**, un animal care „și-a ales omul” (fără magie: încredere, pe viață; tigrul cu colți de sabie e cel mai rar); cine aduce un pui acasă îl crește singur. Coboară rar prin sate, după sare și fier. Tigrul ei e **Ember** („jar” pe limba veche a Străjerilor), găsit de ea pui, singur, într-o scorbură. **Pădurea de la hotar e chiar pădurea satului**, una obișnuită. **Motivul ei:** orcii strică echilibrul pădurii; odată cu eliberarea satului se întoarce și echilibrul, și ține la sat. Străjerii își trimit vești cu **șoimi**; departe, **pădurile au tăcut** (animale moarte fără nicio rană, care nu putrezesc; ❓ ce le-a omorât), iar Kaia, chemată acasă, a ales să rămână (misiunea „Șoimul Străjerilor”).

**Încrederea și finalul**
- Încredere au doar 6: **Bram, Elian, Kaia și Roderick** (se recrutează de la 8/10), **Finn** (ajută din umbră în lupta finală) și **Miriam** (echipamentul tatălui, de la 8/10).
- Finalul: adunarea secretă la locul de campare, apoi **lupta de la poartă, în mai multe valuri**. Recrutarea și finalul se fac la urmă. Tonul începe întunecat și se încălzește odată cu încrederea; spre final se vorbește de revoltă.

## Cum apar misiunile, pe personaje

Pe scurt, ce trebuie făcut ca să apară fiecare misiune (✅ făcută · 📝 plănuită · 💡 de discutat). Detaliile sunt mai jos, la fiecare personaj.

**Miriam (mama)**
1. ✅ **Acoperișul**: dimineața (până la 11), cât mama e în bucătărie. Acoperișul trebuie să fie încă stricat.
2. ✅ **Cina în familie**: după „Locul unde a căzut tata” (Roderick), dimineața, cât mama e în bucătărie.
3. ✅ **Păpușa Linei**: după „Mama lui Finn”, la Lina, când se joacă în fața casei (10–14): „Ce s-a întâmplat, Lina? De ce plângi? !”.
4. ✅ **Inelul mamei**: pornește singură (nu se poate refuza), din ziua 9, după „Fierul lui Bram”, dimineața (7–11), când intri în bucătărie și mama e acolo (nu duminica, ziua taxei). Deschide **Groapa**.
5. ✅ **Capa Kaiei**: după ce Kaia nu vrea să vină în Groapă fără deghizare, la mama: „Mamă, mi-ai putea coase o capă? !”.
6. ✅ **Pâinea văduvelor**: din ziua 6 (nu mai așteaptă după Roderick), dimineața (5–11), cât mama e în bucătărie: „Mamă, la ce te gândești? !”.
7. ✅ **Vorbele din somn** (+1 și la Elian): după al doilea vis și la o zi după „Cina în familie”, dimineața (5–11), cât mama e în bucătărie: „Mamă, de ce te uiți așa la mine? !”.
8. ✅ **Steagul satului** (+1 și la Roderick): după „Cina în familie”, seara (18–23), cât mama e în bucătărie: „Mamă... te gândești la tata? !”.
9. ✅⚠️ **Lemne pentru iarnă**: la o zi după „Pâinea văduvelor”, dimineața (5–11), cât mama e în bucătărie: „Mamă, ți-e frig? !”. Se ratează dacă refuzi sau dacă treci de cele 3 zile.
10. ✅⚠️ **Noaptea nașterii**: la 3 zile după „Lemne pentru iarnă” (dusă la capăt sau ratată) și după eliberarea lui Finn, seara (18–22), când vorbești cu mama în bucătărie, fata vecinei bate la ușă (pe mama: „!”). Se ratează dacă refuzi sau dacă n-o aduci pe bătrână până la 5 dimineața.
11. 📝 **Echipamentul tatălui**: misiunea ei specială, de la încredere 8/10 (de făcut; nu dă încredere, decis de autor).

**Bram (fierarul)**
1. ✅ **Fierul lui Bram**: din ziua 3, la o zi după prima discuție cu Bram, când vii la fierărie și el lucrează afară. Mai întâi vezi cum îi ia colectorul fierul, apoi vorbești cu Bram.
2. ✅ **Foalele stricate**: imediat după „Fierul lui Bram”, la Bram: „De ce e forja rece, domnule Bram?”.
3. ✅ **O zi la forjă**: pornește singură, după „Foalele stricate”, când vii la fierărie și Bram lucrează afară, după-amiaza (14–18); „!” deasupra lui Bram și a fierăriei.
4. ✅ **Fierul plugului** (a fermierului, +1 la Bram): după „O zi la forjă”, la fermier: „Ce s-a întâmplat cu plugul? !”.
5. ✅ **Cercurile butoaielor** (a lui Agnes, +1 la Bram): după „Pivnița” și după „Fierul lui Bram”, la Agnes: „Doamna Agnes, de ce miroase toată taverna a bere? !”.
6. ✅ **Cufărul**: după ce plugul fermierului e reparat (la „Fierul plugului” acceptat, imediat; refuzat, după cele 2 zile) și după „Lumina din pădure” (Elian, decis de autor), la fierărie: Bram e îngândurat → „Ce vă frământă, domnule Bram? !”.
7. ✅ **Toiagul celor 23** (a lui Elian, +1 la Bram și la Elian): pornește singură, la sfârșitul „Secretului lui Elian”.
8. 📝 **Platoșa tatălui**: după misiunea specială a Miriamei (echipamentul tatălui), Bram repară platoșa crăpată.

**Fratele Elian (preotul)**
1. ✅ **Ierburile lui Elian**: la o zi după prima discuție, când Elian citește afară, pe scările bisericii (14–23): „Ce citești, frate Elian?”.
2. ✅ **Cărțile**: pornește singură, din ziua 8, când mergi la biserică între 14 și 18 și Elian e afară (semnul „!” pe biserică).
3. ✅ **Pasărea Linei** (de la Lina, se poate refuza): după „Cărțile” și după „Păpușa Linei”, la Lina, în fața casei (10–14): „Ce ai acolo, Lina? !”.
4. ✅ **Lumina din pădure** (nu se poate refuza): după „Pasărea Linei”, la Elian: „Pari îngrijorat, frate Elian. !”. Apoi, seara, în pădure.
5. ✅ **Secretul lui Elian**: după „Cufărul” (Bram), cât Elian citește afară (14–23): „Frate Elian, am nevoie de un sfat. !”.
6. ✅ **Toiagul celor 23**: pornește singură, la sfârșitul „Secretului lui Elian”.
7. ✅ **Vorbele din somn** (a Miriamei, +1 la Elian): după al doilea vis și la o zi după „Cina în familie”, la mama, dimineața.

**Kaia (vânătoarea)**
1. ✅ **Întâlnirea cu Kaia**: după o vânătoare câștigată, din ziua 4, la următoarea vânătoare.
2. ✅ **Lupul negru**: imediat după întâlnire (dacă ai ajutat-o); 15–17, la marginea pădurii.
3. ✅ **Vânătoarea împreună** (nu e misiune): după „Lupul negru”, dimineața (05–10), la locul de campare.
4. ✅ **Capcanele**: imediat după „Lupul negru”, la Kaia, la locul de campare: „Ce s-a întâmplat, Kaia? Pari supărată.”.
5. ✅ **Rana lui Ember**: la cel puțin două zile după „Capcanele” (și după eliberarea lui Finn), la locul de campare: Kaia stă lângă Ember rănit (un singur sprite) → „Ce i s-a întâmplat lui Ember? !”.
6. ✅ **Șoimul Străjerilor**: din ziua de după „Rana lui Ember”, la locul de campare: „Pot să stau puțin cu tine la foc? !”.
7. ✅ **Convoiul**: la o zi după ce Kaia a hotărât să rămână („Șoimul Străjerilor”): „Ești tăcută azi, Kaia. S-a întâmplat ceva? !”. Apoi, în noaptea de după (23–03), la locul de campare. Dacă ai mers cu ea, la somnul de după vine **al treilea vis**.
8. ✅ **Baza**: după „Convoiul”, seara (18–23), la locul de campare: „Kaia... la ce te gândești? !”. Hotărăsc revolta; tabăra ei devine baza.
9. ✅ **Cuștile vânătorilor** (a lui Finn, +1 și la Kaia): vezi la Finn.

**Roderick (unchiul)**
1. ✅ **Scandalul din tavernă**: din ziua 3, în tavernă, cât e și Agnes acolo (16–00).
2. ✅ **Hârtiile soldatului**: după „Camera de sus” (Agnes) și după scandal, cu hârtiile la tine, în tavernă.
3. ✅ **Lumânările**: după scandal (oricum s-a terminat), la biserică, cât se roagă Roderick (10–14).
4. ✅ **Locul unde a căzut tata**: după „Lumânările”, când Vale știe drumul spre Marginea satului (după eliberarea lui Finn). Apoi, la primul somn peste noapte, **al doilea vis**.
5. ✅ **Antrenamentul**: pornește singur, la sfârșitul „Cinei în familie” (Miriam).
6. ✅ **Steagul satului** (a Miriamei, +1 la Roderick): după „Cina în familie”, la mama, seara; apoi la Roderick și, seara, la gardul de la Marginea satului.
7. 📝 **Solzii de dragon**: după „Antrenamentul” (decis de autor: după cele 4 misiuni, Roderick îi povestește de solzi), dincolo de gardul de la Marginea satului.

**Agnes (hangița)**
1. ✅ **Camera de sus**: la 2 zile după prima discuție cu Agnes, în tavernă, cât e ea acolo.
2. ✅ **Berea**: imediat după „Camera de sus”.
3. ✅ **Pivnița**: după „Berea”, doar 09–11, cât taverna e goală.
4. ✅ **Cercurile butoaielor** (+1 la Bram): după „Pivnița” și după „Fierul lui Bram”, în tavernă: „Doamna Agnes, de ce miroase toată taverna a bere? !”.

**Fermierul**
1. ✅ **Patrula de orci** (deblocarea lui): din ziua 3, dimineața, la câmpuri. Abia după ea poți vorbi cu el.
2. ✅ **Fierul plugului** (+1 la Bram): după „O zi la forjă” (Bram), fermierul are plugul rupt (06–13, la câmpuri): „Ce s-a întâmplat cu plugul? !”.
3. 💡 Celelalte misiuni ale lui: de discutat.

**Finn (hoțul)**
1. ✅ **Eliberarea**: în piață, apeși pe Finn, legat la butuc → „Pot să vorbesc cu el?”.
2. ✅ **Mâncarea** și ✅ **Mama lui Finn**: amândouă deodată, imediat după eliberare, la Finn acasă.
3. ✅ **Lada colectorului**: după „Mâncarea” și „Mama lui Finn”, la Finn: „Ce te frământă, Finn?”. Apoi, după miezul nopții, Finn te așteaptă în fața casei.
4. ✅⚠️ **Ziua Linei**: la o zi după „Mama lui Finn”, la Finn: „Ce-i cu tine, Finn? Pari cu gândul în altă parte. !”. Se ratează dacă refuzi sau dacă trece ziua Linei.
5. ✅⚠️ **Datoria la Jarek**: după „Lada colectorului” și după „Ziua Linei” (dusă la capăt de o zi, sau ratată), la Finn: „Finn, ce te apasă? !”. Se ratează dacă refuzi sau dacă trec cele 5 zile.
6. ✅ **Noaptea de la cimitir** (nu se ratează; după ea, **al patrulea vis**): după „Camera de sus”, „Hârtiile soldatului” și „Pivnița”, și după „Datoria la Jarek” (dusă la capăt de o zi, sau ratată), la Finn: „Ce-i cu Lina? Pare obosită. !”.
7. ✅ **Zarurile orcilor** (fără încredere): de la 4/10 încredere cu Finn, acasă: „Ce meșterești acolo, Finn? !”.
8. ✅ **Cuștile vânătorilor** (+1 și la Kaia): de la 5/10 încredere cu Finn și după „Baza” (Kaia), acasă: „Finn... pot să-ți spun ceva? Dar încet. !”. Seara, la locul de campare; noaptea de după, pe furiș.
9. ✅⚠️ **Ultima treabă pentru Jarek**: după „Noaptea de la cimitir” și după „Datoria la Jarek” (dusă la capăt sau ratată), acasă: „Ce-i hârtia aia, Finn? !”. Se ratează dacă alegi „Avem nevoie de bani.”.
10. ✅ **Prietenii lui Finn** (pentru lupta finală, fluierul): de la 8/10 încredere cu Finn și după „Cuștile vânătorilor”: „Finn, pari că pui ceva la cale. !”.

---

## Încrederea: de unde vine fiecare punct

**Regula** (decis de autor): fiecare personaj important trebuie să aibă **10 întâmplări** care îi pot da câte +1 încredere, ca să poată ajunge la 10/10. Dintre ele, **cel puțin 3 se pot rata** (decis de autor: un refuz sau o alegere rea; cine nu e un sătean bun și refuză să ajute pierde punctul pentru totdeauna), iar recrutarea se face de la **8/10**. **Încredere au doar 6 personaje** (decis de autor): Bram, Elian, Kaia și Roderick (se recrutează), Finn (ajută în lupta finală, care are mai multe valuri) și Miriam (de la 8/10, echipamentul tatălui). Agnes, fermierul și ceilalți n-au încredere.

Semne: ✅ făcut · 📝 plănuit · 💡 de găsit · ⚠️ se poate rata.

| Personaj | De unde vine +1 | Acum |
|---|---|---|
| **Miriam** | ✅ Acoperișul · ✅ Cina în familie · ✅⚠️ Păpușa Linei (doar dacă duci păpușa la mama) · ✅ Inelul mamei · ✅ Capa Kaiei · ✅ Pâinea văduvelor · ✅ Vorbele din somn · ✅ Steagul satului · ✅⚠️ Lemne pentru iarnă (refuz sau 3 zile trecute) · ✅⚠️ Noaptea nașterii (refuz sau bătrâna neadusă până la 5) · (de la 8/10, misiunea specială, echipamentul tatălui, fără încredere) | 10 / 10 |
| **Roderick** | ✅⚠️ Scandalul (doar dacă îl ajuți) · ✅ Lumânările · ✅⚠️ Locul unde a căzut tata (doar dacă îl consolezi) · ✅ Cina în familie · ✅ Antrenamentul · ✅ Steagul satului (a Miriamei) · 💡 încă 4 (Hârtiile soldatului nu dau, decis) | 6 / 10 |
| **Bram** | ✅ Fierul lui Bram · ✅ Foalele stricate · ✅⚠️ Capcanele (doar dacă îi duci lui fierul capcanelor Kaiei, nu colectorului) · ✅ O zi la forjă · ✅⚠️ Fierul plugului (doar dacă accepți) · ✅ Cercurile butoaielor · ✅ Cufărul · ✅ Toiagul celor 23 · 📝 Platoșa tatălui · 💡 încă 1 | 8 / 10 |
| **Elian** | ✅ Ierburile · ✅ Mama lui Finn (Elian ajută) · ✅⚠️ Cărțile (doar dacă iei cărțile) · ✅⚠️ Pasărea Linei (doar dacă duci vrabia) · ✅ Lumina din pădure · ✅ Secretul lui Elian · ✅ Toiagul celor 23 · ✅ Vorbele din somn (a Miriamei) · 💡 încă 2 | 8 / 10 |
| **Kaia** | ✅ Întâlnirea (o ajuți; dacă pleci, o mai găsești după altă vânătoare) · ✅⚠️ Lupul negru (doar la victorie) · ✅ Capcanele (+1 pentru cele cinci capcane desfăcute) · ✅⚠️ și încă +1 doar dacă eliberezi căprioara; **−1** dacă vinzi capcanele colectorului · ✅ Rana lui Ember · ✅ Șoimul Străjerilor (orice i-ai spune) · ✅⚠️ Convoiul (doar dacă mergi cu ea) · ✅ Baza · ✅ Cuștile vânătorilor (a lui Finn, +1 oricum s-ar termina lupta) · 💡 încă 1 | 9 / 10 |
| **Finn** | ✅ Eliberarea · ✅ Mâncarea · ✅ Mama lui Finn · ✅ Lada colectorului (se reîncearcă, nu se ratează) · ✅⚠️ Ziua Linei (refuz sau ziua trecută) · ✅⚠️ Datoria la Jarek (refuz sau 5 zile trecute) · ✅ Noaptea de la cimitir · (Zarurile orcilor, fără încredere, decis de autor) · ✅ Cuștile vânătorilor (+1 oricum s-ar termina lupta, decis de autor) · ✅⚠️ Ultima treabă pentru Jarek (doar „Nu, Finn. Ai promis.”) · ✅ Prietenii lui Finn (de la 8/10) | 10 / 10 |

**Ordinea** (decis de autor): întâi misiunile obișnuite, până când fiecare dintre cei 6 are 10 puncte posibile, dintre care cel puțin 3 se pot rata (⚠️); abia apoi misiunile speciale (echipamentul tatălui, platoșa, recrutarea). Miriam e gata: 10 puncte posibile, dintre care 3 ⚠️ (Păpușa Linei, Lemne pentru iarnă, Noaptea nașterii). **Finn** e gata: 10 puncte posibile, dintre care 3 ⚠️ (Ziua Linei, Datoria la Jarek, Ultima treabă pentru Jarek).

---

## Cum testezi (panoul debug)

În editor, la **Testare**, apasă **F2** pentru panoul debug. Butoanele de care ai nevoie:

- **Timp:** „Dimineață” (07:00), „Amiază” (12:00), „Seară” (19:00), „Ziua următoare”, „+1 oră”.
- **Testare misiuni:**
  - „Toți cunoscuți de 3 zile”: sare peste așteptarea de după prima discuție;
  - „+1 vânătoare câștigată”: pentru Kaia.
- **Misiune:** o alegi din listă, apoi „Pornește” (ca după „Accept”) sau „Resetează”. Lista arată la ce pas ești. **„Resetează” întoarce tot jocul la clipa dinainte să înceapă misiunea** (ora, locul, obiectele, încrederea, acoperișul etc.), așa că o poți juca din nou de la ofertă, fără joc nou. O misiune care pornește în mijlocul unei discuții (de exemplu „Șoimul Străjerilor”) te întoarce chiar la alegerea de atunci, ca să încerci cealaltă cale. Merge pentru misiunile începute de când ai jocul actualizat; la una mai veche doar o șterge din carte.
- **Eveniment:** alegi un eveniment din listă și „Pornește”, chiar dacă s-a mai întâmplat (de exemplu imaginile cu fierul lui Bram).
- **Mergi la:** te duce direct într-un loc. Evenimentele care pornesc la sosire apar doar dacă mergi de pe hartă.
- **Monede, Obiect → Primește, Stări:** pui ce îți trebuie (de exemplu 60 de monede, 10 lemne).

Imaginile lipsă apar ca dreptunghiuri colorate, cu numele fișierului pe ele.

## Altele: mâncarea, florile, poțiunile și săgețile

Nu sunt misiuni, dar le folosești peste tot (decis de autor):
- **Carnea friptă:** la Agnes, „Schimburi” (2 carne → 1 friptă); acasă, în bucătărie, zona „Frige o bucată de carne” (desenată pe vatră, în editor) deschide ecranul de schimb, „Vatra” (decis de autor): 1 carne → 1 friptă, o dată pe zi, 30 de minute. Iconița: `items/carne_gatita.png`.
- **Orzul:** după „Berea” lui Agnes, munca la moară dă mereu orz (2 pe muncă).
- **Florile:** la cules (sunătoarea dimineața, luminița-nopții seara), orice floare culeasă rămâne în rucsac: păpădia, mușețelul, piciorul-cocoșului.
- **Bătrâna Morwen** nu vinde nimic (decis de autor); face poțiuni doar din florile aduse, la schimb (ciorne, TODO echilibru): viață (2 sunătoare + 1 mușețel), leacul de otravă (2 piciorul-cocoșului + 1 păpădie), **vigoare** (2 păpădie + 1 mușețel; +50 stamina), **pielea de piatră** (2 luminița-nopții + 1 piciorul-cocoșului; în luptă +15 armură), **furia** (2 luminița-nopții + 1 sunătoare; în luptă +3 atac). Iconițe: `items/potiune_vigoare.png`, `potiune_piatra.png`, `potiune_furie.png`.
- **Săgețile:** arcul trage doar cu săgeți (una pe atac); lângă Vale, în luptă, se vede câte mai are. Jarek le vinde cu 1 monedă, Bram cu 2.

## Prologul ✅

**Decis de autor:** jocul pornește cu **o carte, împărțită pe capitole** (decis de autor: pe capitole, nu pe pagini; acum 7), cu o **voce de cronică**: tot ce știu oamenii din Aldaria, de la primul portal, acum ~2000 de ani, până la primăvara în care a căzut apărarea satului Baum (doar 23 de oameni), cu descrieri frumoase și suspans în jurul regelui. Nu spune nimic din ce se descoperă în joc: vârsta lui Vale nu se spune, iar despre soarta lui Karzor nu se spune nimic (decis de autor).
- **Numele** (decis de autor): tărâmul **Aldaria**, regatul **Aldenor**, capitala **Altaris**, satul **Baum**, regele cel bătrân **Aldric**, fiul lui, regele de acum, **Cedric**, primordialul focului **Ardrax**.
- **Textul** (decis de autor): autorul a **rescris prologul în engleză**, „The Chronicle of Aldaria”, pornind de la ciorna lui Claude, cu completări cerute de el (lumile de dincolo și legământul, diferite pentru fiecare; lupta elfilor cu oamenii pentru pădure, câștigată de elfi; regele bătrân care a trimis expediția spre poarta focului și fiul lui, care a apucat s-o vadă deschisă; dialogul regelui cu Arcon). Claude a corectat greșelile de tipar și l-a **tradus în română**, „Cronica Aldariei”, cu aceleași capitole și paragrafe: (1) Tărâmurile celelalte, (2) Prima poartă, (3) Focul oamenilor, (4) Inima Luminii, (5) Regele cel bătrân, (6) Steagul roșu, (7) Baum. Amândouă limbile stau în `data/prolog.json`. Prima ciornă (în română, de Claude) a rămas în documentul „Fangs&Honor: Prologul”. În capitolul 7 cad „douăzeci și trei de viteji”, nu „toți”: Roderick a fost și el lângă copac și a scăpat.
- **Numele în engleză** (alese de Claude; aceleași dacă jocul se traduce vreodată): tărâmurile celelalte = *the Otherworlds* (ca în basme), Marginea = *the Edge*, Craniile Sângerii = *the Blood Skulls*, Ordinul Flăcării = *the Order of the Flame*, Cercul Luminii = *the Circle of Light*, Inima Luminii = *the Heart of Light*, trezirea mică / mare = *the lesser / greater awakening*, primordialii = *the primordials*, darul dragonilor = *the gift of dragons*, legământul = *the bond*, preotul-mag = *priest-mage*, rombul auriu = *the golden diamond*, drumul mare = *the great road*, copacul mare = *the great tree*. Dragonii în general sunt „it”, iar Karzor și Ardrax „he” (ales de Claude: așa nu se dă un gen primordialului morții). **Cum verifici:** editorul → tab-ul **Prolog** → comutatorul **Română / English** de sus și, lângă el, lista capitolelor (alegi unul și sari la el); limba aleasă rămâne ținută minte, iar la schimbare rămâi în același capitol.
- **În joc** (cerut de autor, `src/prolog.js`): la „Joc nou” (și la prima pornire, fără salvare; jocul de test, `?test=1`, nu-l deschide singur) cartea stă închisă pe o masă (`ui/ui_prolog_masa.png`; coperta `ui/ui_prolog_coperta.png`, fără scris, iar titlul îl scrie jocul, cu auriu, în limba aleasă; până se încarcă, ambele sunt din CSS); un clic pe ea o deschide acolo (coperta se întoarce spre stânga, iar pe dosul ei e chiar jumătatea stângă a cărții; titlul lung, în engleză, stă mai sus, ca să nu atingă rombul); pe prima pagină titlul, apoi capitolele, frumos așezate pe pagini (decis de autor: nu înghesuite; textul curge ca într-o carte tipărită, un capitol lung continuă pe paginile următoare, iar unul nou începe sub cel de dinainte doar dacă acela s-a terminat în prima treime a paginii, altfel pe pagina următoare (cerut de autor), deci fără pagini goale sau cu un singur cuvânt; numărul paginii jos); harta Aldenorului stă pe foaia de după ultimul capitol (decis de autor), întinsă pe amândouă paginile, iar un clic o mărește; un clic pe pagina din dreapta dă pagina, pe cea din stânga se întoarce (cerut de autor; fără săgeți pe ecran, decis de autor), sau tastele ← →, cu sunetul paginii; foaia care se întoarce e doar hârtia, fără marginile foilor și pielea copertei; jos: „English” / „Română” (schimbă limba și rămâi la același capitol), „Sari peste” și butonul muzicii (cerut de autor: oprește doar muzica de fundal a cărții; în joc, sunetele merg normal; imaginile lui, făcute de autor, `ui/ui_prolog_muzica.png` și `ui/ui_prolog_fara_muzica.png`, iau locul pergamentului când sunt încărcate); în colțul dreapta-sus, butonul de ecran complet, ca în joc (cerut de autor); la hartă rămâne doar „Începe povestea” (decis de autor), care pornește jocul; apoi Vale se trezește dintr-un coșmar și se gândește să meargă la mama, la masa de dimineață (cerut de autor; dialogul `inceput_joc`, gânduri, ciornă de Claude); se ține minte în salvare (`prolog`), ca după un refresh cartea să revină; se recitește din Meniu → Galerie → „Cronica Aldariei” (fără să strice grila de 6 butoane a meniului).
- **Cum verifici:** joacă un joc nou (Meniu → Joc nou): cartea închisă pe masă → clic pe ea → răsfoiește (clic pe pagina din dreapta) până la hartă → „Începe povestea” → gândurile lui Vale despre coșmar. Sau Meniu → Galerie → „Cronica Aldariei”. Imaginile, în galerie, la „Prologul”: harta, masa și coperta.
- **Harta Aldenorului** (decis de autor): prima pagină a cronicii e o hartă cu **Aldenor**, regatul oamenilor, și, la hotare, ținuturile elfilor și ale orcilor: **Stepele Roșii** (orcii, la răsărit, dincolo de munții de lângă Baum; satul e „ușa din spate” spre capitală, de-aia trec convoaiele pe lângă el), **Sylvareth** (marea pădure a elfilor de pădure, la apus) și **Caldrath** (decis de autor: orașul dragonilor oamenilor, **alb cu roșu**, fără vulcan: piatră albă, acoperișuri și steaguri roșii; în jurul porții focului, cu cetatea **Ordinului Flăcării**, școala călăreților, turnurile dragonilor și bibliotecile despre ei; în munți, decis de autor; în nord, ales de Claude). **Harta e 85% Aldenor** (decis de autor): elfii și orcii apar doar la marginile ei, ca un început de ținut. Pe hartă nu apare poarta morții (n-o știe nimeni). Imaginea (decis de autor): în stilul hărții satului, privită de foarte sus, **cu numele scrise chiar pe ea** (ALDENOR sus, cu auriu; ALTARIS, BAUM, CALDRATH, KOR, SYLVARETH, THE RED STEPPES pe hartă), fără hotare desenate, cu Caldrath construit în munte: `map/aldenor_harta.png`, în galerie la „Prologul”. Cele trei cetăți (pe drumul de răsărit, la marginea pădurii, la mare) n-au încă nume (propuse de Claude: Valdris, Eldmark, Corvan). Propus de Claude, încă neconfirmat: munții de lângă Baum = **Munții Colților**. Din prolog: mina Inimii Luminii e **la Kor**, iar Inima stă în **biblioteca Sol** din Altaris.
- **Visul cu bătălia** (decis de autor) rămâne **al doilea vis**, coșmarul lui Vale de după misiunea lui Roderick, „Locul unde a căzut tata”. Planul vechi, cu imaginile bătăliei la începutul jocului, nu mai e.

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

### ✅ Cina în familie
- **Pornește** (decis de autor): după „Locul unde a căzut tata” (Roderick), **dimineața, cât e mama în bucătărie**: „Mamă... ai găsit crenguța? !”. Mama ține crenguța cu frunze aurii: sub copacul acela i-a cerut Edwin să-i fie nevastă. Recunoaște că i-a fost mai ușor să fie supărată pe Roderick decât tristă → „Cheamă-l diseară la cină.”
- **Pasul 1:** invitația, la Roderick (biserică sau tavernă): „Unchiule, mama te cheamă diseară la cină.” Dacă Vale l-a învinuit la copac, întâi se împacă.
- **Pasul 2:** **seara (18–22), acasă, în bucătărie**, la mama: „Mamă, vine unchiul?” → „Deschid eu.” → **3 imagini**: Roderick în prag, bărbierit; cina în tăcere, cu crenguța într-o cană pe masă; Roderick îi spune în sfârșit Miriamei ultimele cuvinte ale lui Edwin, iar mama îl ia în brațe. Mama insistă ca Roderick să-l învețe pe Vale să țină o sabie → pornește **„Antrenamentul”**.
- **Recompensa** (decis de autor): încrederea Miriamei +1 și a lui Roderick +1.
- **Imaginile:** `events/miriam_cina_1.png`, `_2`, `_3`.

**Cum verifici:** după „Locul”, F2 → „Ziua următoare”, „Dimineață”, Mergi la bucătărie → mama → „ai găsit crenguța?” → Roderick (15:00, tavernă) → seara, 19:00, bucătărie → mama → „Mamă, vine unchiul?”.

### ✅ Păpușa Linei
- **Pornește** (decis de autor): după „Mama lui Finn”, când Lina se joacă în fața casei (10–14). Lina plânge („Vale...”) → „Ce s-a întâmplat, Lina? De ce plângi? !” → „Arată-mi.”.
- **Peste prima imagine** (decis de autor): păpușa de cârpă s-a rupt cât se juca Lina cu ea; brațul îi atârnă de un fir și iese umplutura. I-a făcut-o Marta, dar acum n-are nici ac, nici ață: orcii au luat tot. Alegi:
  - „O duc la mama mea. Ea coase cel mai frumos din sat.”: misiunea pornește, iar păpușa intră la obiectele de poveste;
  - „N-am timp acum, Lina.”: misiunea e ratată, fără +1 (ca la „Cărțile”). Lina intră în casă, iar în ziua aceea e supărată.
- **Pasul 1:** la mama, cât coase în camera ei (11–14): „Mamă, poți să cârpești păpușa asta? ?”. Mama o ia și o coase **a doua zi** (decis de autor), la lumină bună. Cât păpușa e la mama, Lina îți spune că încă așteaptă (decis de autor).
- **Pasul 2:** a doua zi, tot 11–14, în camera ei: „Mamă, ai cusut păpușa? ?” → „Mă așez lângă tine.” → **peste o imagine** (decis de autor), mama o coase la fereastră și își amintește cum îi cârpea lui Vale jucăriile când era mic (calul de lemn cioplit de Edwin, cu coada de lână). Pe umărul păpușii pune un petic rotund, ca un scut.
- **Pasul 3:** la Lina, oriunde e: „Uite-o, Lina. Ca nouă! ?” → „Uite-o.” → **peste o imagine** (decis de autor), Lina o strânge în brațe; o botează „Cavalerița Petic”.
- **Recompensa** (decis de autor): încrederea Miriamei **+1**, pentru că s-a bucurat că a putut ajuta.

**Imagini:** `events/papusa_lina_1.png` (Lina plângând, cu păpușa ruptă), `events/papusa_lina_2.png` (Miriam cosând păpușa la fereastră), `events/papusa_lina_3.png` (Lina fericită, cu păpușa în brațe), galeria: „Păpușa Linei”; iconița `items/papusa_lina.png` (o singură păpușă, ruptă sau cusută).

**Cum verifici**
1. Termină „Mama lui Finn”. Ora 10:30 → Marginea satului → casa lui Finn (afară): Lina plânge → „Ce s-a întâmplat, Lina?” → „Arată-mi.” → imaginea → „O duc la mama mea.”.
2. Vorbește iar cu Lina: „Încă aștept.”
3. Ora 12:00 → acasă → camera mamei → mama → „Mamă, poți să cârpești păpușa asta?”. Aceeași zi, „Despre păpușa Linei...” → „Mâine, Vale.”
4. „Ziua următoare” → 12:00 → camera mamei → „Mamă, ai cusut păpușa?” → imaginea → păpușa e iar la tine.
5. La Lina (afară 10–14 sau la colibă 14–18) → „Uite-o, Lina. Ca nouă!” → imaginea → +1 la mama.
6. Refuzul: F2 → Misiune: „Păpușa Linei” → „Resetează” (revine la alegere) → „N-am timp acum, Lina.” → în carte, misiunea e „Ratată”.

### ✅ Inelul mamei
- **Pornește singură** (decis de autor: nu se poate refuza): din **ziua 9**, după „Fierul lui Bram” (poarta trebuie să fie deschisă), **dimineața (7–11), când intri în bucătărie și mama e acolo** (ziua și condițiile, alese de Claude). Cât ar porni, **„!” deasupra mamei**, a ușii bucătăriei și a casei de pe hartă (decis de autor; `ofertaEveniment`, ca la cărțile lui Elian). Peste o imagine: colectorul stă în prag și strânge „pentru Groapă” câte ceva de la fiecare casă; mama nu mai are nimic, așa că îi ia **verigheta**, de pe deget. Singura alegere: „Ți-l aduc înapoi, mamă.”
- **Pasul 1:** la **colector**, la poartă (dimineața la masa taxei, 6–12, sau seara cu torța, 18–23), cu **„?” auriu deasupra lui** și a porții de pe hartă (decis de autor; pasul e „la” colector), „Am venit pentru inelul mamei mele.” (lângă plata taxei). Colectorul îi spune de **Groapă**: o câștigi o dată acolo, oricât de greu alegi, și ți-o aruncă înapoi; poți aduce doi de-ai tăi, iar popa vostru poate coborî să vă oblojească. De acum **Groapa apare pe poartă** și rămâne.
- **Pasul 2:** o victorie în Groapă, **oricare nivel** (decis de autor). După luptă, peste o imagine, colectorul îi aruncă inelul: „Ce e al Groapei se câștigă în Groapă.”
- **Pasul 3:** la mama, oriunde e: „Mamă... uite ce ți-am adus.” Peste o imagine, Vale îi pune verigheta în palmă; mama povestește cum i-a pus-o Edwin pe deget, sub copacul mare.
- **Recompensa:** încrederea mamei **+1**.
- **Imagini:** `events/inel_colector.png`, `events/inel_primit.png` (decis de autor: doar colectorul, de aproape, supărat, aruncând inelul), `events/inel_miriam.png` (galeria: „Misiunea Miriamei: inelul”); iconița `items/inel_miriam.png`.

**Cum verifici**
1. F2: starea `poarta_deschisa` = `da` (sau termină „Fierul lui Bram”), treci la ziua 9, „Dimineață”; mergi de pe hartă în casă, apoi în bucătărie → imaginea cu colectorul → „Ți-l aduc înapoi, mamă.”
2. La poartă, 19:00 (sau dimineața), apeși pe colector → „Am venit pentru inelul mamei mele.” → pe poartă apare **Groapa** (până desenezi zona, e un buton jos: „Groapa”).
3. Apeși pe Groapa → „Ușor” → (aliații, dacă ai pe cineva cu încredere 4) → „Intră în Groapă” → câștigă → imaginea cu inelul.
4. A doua zi, la mama: „Mamă... uite ce ți-am adus.” → imaginea → +1.

### ✅ Capa Kaiei
- **Pornește** (decis de autor): în Groapă, Kaia refuză să vină („Dacă mă văd o dată la față, mâine îmi ard tabăra. Iar pe Ember l-ar vrea în cușcă.”); Vale îi propune o deghizare, o capă cusută de mama. Apoi, la mama: „Mamă, mi-ai putea coase o capă? !”. Mama își amintește de prima oară când a coborât Kaia în sat cu puiul de tigru: toată lumea și-a trântit ușile, iar Edwin i-a dat apă din găleata lor (ciornă de Claude).
- **Pasul 1:** **3 blăni de lup** (vânătoarea de lupi) și **un ghem de sfoară** (negustorul din piață, 2 monede); cantitățile, alese de Claude.
- **Pasul 2:** la mama, cât coase (11–14, în camera ei): „Mamă, am adus blănile și sfoara.”
- **Pasul 3:** **a doua zi**, tot 11–14: „Mamă, e gata capa?” → **peste o imagine**, mama arată capa: subțire, cenușie, strânsă în talie cu o curea, cu glugă adâncă, o fâșie pentru față și brațele libere, ca să poată arunca.
- **Pasul 4:** la Kaia (locul de campare): „Kaia, ți-am adus ceva.” → **peste o imagine**, Kaia o probează, iar Ember o adulmecă și strănută. De acum Kaia vine cu tine în Groapă.
- **Recompensa:** încrederea mamei **+1**.
- **Imagini:** `events/capa_miriam.png`, `events/capa_kaia.png` (galeria: „Misiunea Miriamei: capa Kaiei”); iconițele `items/capa_kaia.png`, `items/sfoara.png`.

**Cum verifici:** cu Groapa deschisă și încrederea Kaiei 4, la locul de campare (14–23): „Kaia... ai lupta cu mine în Groapa orcilor?” → refuzul. La mama: „Mamă, mi-ai putea coase o capă?” → F2 → Obiect: 3 blăni de lup și o sfoară → la amiază, în camera mamei: „Mamă, am adus blănile și sfoara.” → „Ziua următoare”, amiază: „Mamă, e gata capa?” → la Kaia: „Kaia, ți-am adus ceva.” → în panoul Groapei apare Kaia.

### ✅ Pâinea văduvelor
- **Pornește** (decis de autor: firul satului al Miriamei nu mai așteaptă după Roderick): din ziua 6 (ales de Claude), dimineața (5–11), cât mama e în bucătărie: „Mamă, la ce te gândești? !”. Dacă Vale a făcut deja „Lumânările”, mama pomenește de ele („Fratele Elian mi-a spus de lumânări...”); altfel, aceeași discuție, fără ele. Mama scutură sacul gol de făină: s-a gândit la femeile celor 23, care n-au ce le da copiilor. „Aduc eu făina, mamă.” pornește misiunea; „Altă dată, mamă.” o lasă în meniu.
- **Pasul 1** (decis de autor: făina vine de la moară): **4 măsuri de făină**. Cât e misiunea, fiecare muncă la moară dă și **2 făină** (ca orzul la bere; ales de Claude, TODO echilibru), până ai 4. Făina stă la obiectele de poveste și se numără.
- **Pasul 2:** cu făina, dimineața, în bucătărie: „Mamă, am adus făina.” → „Îmi suflec mânecile.” → **peste o imagine**, Vale și mama frământă și coc 23 de pâini în cuptorul din curte (decis de autor), apoi **peste 3 imagini** Vale le împarte prin sat și vorbește la fiecare cu cineva (decis de autor): o văduvă cu doi copii, bătrânul de la capătul uliței (fiul lui, Hal, a căzut printre cei 23) și o femeie la fântână, care spune primul cuvânt de revoltă: **„Dacă ar mai fi bărbați în sat...”**. Sătenii **n-au imagini și nici portrete** (decis de autor): doar numele („Văduva”, „Băiețelul”, „Bătrânul”, „Săteanca”); Vale își are portretul lui. Trec 4 ore (ales de Claude).
- **Recompensa:** încrederea mamei **+1**.
- **Imagini:** `events/paine_vaduve_1.png` (Miriam și Vale frământând pâinea), `events/paine_vaduve_2.png` (la ușa văduvei), `events/paine_vaduve_3.png` (bătrânul de pe bancă), `events/paine_vaduve_4.png` (femeile de la fântână), galeria: „Pâinea văduvelor”; iconița `items/faina.png`.

**Cum verifici**
1. Din ziua 6, dimineața, în bucătărie, la mama: „Mamă, la ce te gândești?” → „Aduc eu făina, mamă.”.
2. La moară, de două ori „Muncește 1 oră”: după fiecare urcă pe ecran „+2 Făină”.
3. Seara, la mama: doar „Despre pâine...” (pâinea se face dimineața).
4. Dimineața, în bucătărie: „Mamă, am adus făina.” → „Îmi suflec mânecile.” → cele 4 imagini → +1 la mama.

### ✅ Vorbele din somn (+1 și la Elian)
- **Pornește** (decis de autor: după **al doilea vis** și la o zi după „Cina în familie”, ca să nu vină în aceeași dimineață cu ea): dimineața (5–11), cât mama e în bucătărie: „Mamă, de ce te uiți așa la mine? !”. Mama îl aude vorbind în somn, de mai multe nopți, **într-o limbă pe care n-o știe nimeni**: veche, grea, „de parcă ar fi vorbit cineva foarte bătrân prin gura ta”. „Bine, mamă. Mergem.” → pornește; „Mamă, a fost doar un vis.” o lasă în meniu.
- **La biserică, peste o imagine** (ales de Claude): mama îi povestește tot lui Elian. Elian îi spune că visele grele vin după o pierdere grea și îi dă un **ceai pentru somn** (mușețel, sunătoare, valeriană). Când mama se duce să aprindă o lumânare, Elian îl întreabă pe Vale ce vede în vise; la **ochiul cu pupila tăiată**, se face alb la față și îi cere să vină întâi la el dacă mai visează ceva, fără să spună altcuiva. **De acum Elian bănuiește că trezirea e a lui Vale** (decis de autor), dar nu spune nimic. Trece o oră; Vale rămâne în biserică.
- **Recompensa:** încrederea mamei **+1** și a lui Elian **+1**.
- **Imagine:** `events/visele_elian.png` (în biserică: Elian pe bancă, ascultând, Miriam și Vale lângă el), galeria: „Vorbele din somn”.

**Cum verifici:** F2 → starea `vis_2` = `vazut` (sau visează al doilea vis), cu „Cina în familie” terminată de cel puțin o zi. Dimineața, în bucătărie: „Mamă, de ce te uiți așa la mine?” → „Bine, mamă. Mergem.” → imaginea → ajungi în biserică, +1 la mama și la Elian.

### ✅ Steagul satului (+1 și la Roderick)
- **Pornește** (ales de Claude): după **„Cina în familie”** (la cină, Roderick i-a spus mamei că steagul e tot pe câmp), seara (18–23), cât mama e în bucătărie: „Mamă... te gândești la tata? !”. Steagul albastru cu rombul auriu l-au cusut femeile satului în iarna dinaintea bătăliei, iar rombul l-a brodat mama, cu firul de aur din salba mamei ei (decis de autor). Mama vrea steagul acasă, dar nu-l lasă pe Vale singur: cu Roderick. „Nu acum, mamă.” o lasă în meniu.
- **Pasul 1:** la Roderick (biserica 10–14, taverna după-amiaza și seara): „Unchiule, mama vrea steagul de la copac.”. Roderick își amintește: steagul l-a ținut Tobin, fiul morarului, cel mai tânăr dintre ei; când a căzut, Roderick l-a înfipt în pământ lângă copac, iar când Edwin i-a strigat să fugă, l-a lăsat acolo.
- **Pasul 2:** seara (19–23), la gardul putred de la Marginea satului (Roderick e acolo cât e pasul ăsta): „Sunt gata, unchiule.” → **peste 2 imagini**, câmpul în lumina lunii și Roderick care scoate din pământ steagul, înfipt tot acolo, între rădăcini (ca în „Locul unde a căzut tata”): rupt pe jumătate și înnegrit, dar rombul strălucește ca nou. Trece o oră și jumătate; Vale ajunge în camera lui, cu steagul.
- **Pasul 3:** la mama, cât coase (11–14, în camera ei): „Mamă, am adus steagul.”. Îl spală și îl coase **a doua zi**, ca la păpușă.
- **Pasul 4:** a doua zi, 11–14: „Mamă, e gata steagul?” → **peste o imagine**, mama la fereastră, cu steagul pe genunchi; cele două jumătăți sunt cusute la loc, iar unde lipsea pânza e un petic din rochia ei. „Du-i-l lui Roderick. El l-a lăsat acolo, el să-l poarte de acum.”
- **Pasul 5:** la Roderick: „Unchiule, mama ți-a trimis ceva.” → **peste o imagine**, Roderick ia steagul în mâini: „De azi încolo nu-l mai las jos.” Steagul rămâne la el (starea `steag` = `roderick`).
- **Recompensa:** încrederea mamei **+1** și a lui Roderick **+1**.
- **În lupta finală** (decis de autor): **Roderick luptă cu steagul în mână**, cu alte poze, `combat/soldat_steag_*.png` (5, ca de obicei, aceeași pânză 2:3; galeria: „Lupta finală”). Cât stă el în picioare, **ceilalți aliați lovesc cu +2** și au o strălucire aurie (ales de Claude, TODO echilibru; rombul de pe steag e forma cristalelor). În Groapă luptă fără el.
- **Imagini:** `events/steag_camp_1.png` (câmpul bătăliei noaptea, cu copacul mare), `events/steag_camp_2.png` (Roderick scoate steagul din pământ), `events/steag_miriam.png` (Miriam cu steagul cusut, la fereastră), `events/steag_roderick.png` (Roderick cu steagul în mâini), galeria: „Steagul satului”; iconițele `items/steag_rupt.png` și `items/steagul_satului.png`.

**Cum verifici**
1. Termină „Cina în familie”. Seara, în bucătărie: „Mamă... te gândești la tata?” → „Îl aduc acasă, mamă.”.
2. La Roderick: „Unchiule, mama vrea steagul de la copac.”.
3. Seara, 19–23, Marginea satului → Ieșirea → Roderick: „Sunt gata, unchiule.” → „Să mergem.” → 2 imagini → ajungi acasă.
4. Amiaza, camera mamei: „Mamă, am adus steagul.” → „Ziua următoare”, amiază: „Mamă, e gata steagul?” → imaginea.
5. La Roderick: „Unchiule, mama ți-a trimis ceva.” → imaginea → +1 la mama și la Roderick.
6. Lupta: F2 → Lupta de test → bifează Roderick și „Ca în lupta finală” → în jurnal: „Roderick ridică steagul satului...”.

### ✅⚠️ Lemne pentru iarnă (se poate rata)
- **Pornește** (ales de Claude): la o zi după „Pâinea văduvelor”, dimineața (5–11), cât mama e în bucătărie: „Mamă, ți-e frig? !”. E toamnă (decis de autor: peste tot e toamnă, nu iarnă): plouă mărunt, nopțile s-au răcit, iar bătrânii zic că în trei zile vin ploile lungi, după care lemnul din pădure nu mai arde. Trei văduve n-au lemne uscate de foc (decis de autor): **Hanna**, nevasta lui Owen, care așteaptă un copil; **Ilse**, femeia de la fântână (cea cu „Dacă ar mai fi bărbați în sat...”); **Greta**, văduva cu cei doi copii (amândouă din „Pâinea văduvelor”). Numele sunt ciorne de Claude.
- **„Le duc eu, mamă.”** pornește misiunea; **„N-am timp de asta, mamă.”** o **ratează** pe loc (decis de autor: cine nu ajută pierde punctul): „Tatăl tău n-a întrebat niciodată dacă are timp, când era vorba de un vecin.”
- **Pașii** (decis de autor: câte 5 lemne la fiecare, în 3 zile): lemnele le aduni din pădure („Adună lemne”, cu mini-jocul). Cu 5 lemne, la mama (oriunde e ea, până la 22; mai târziu îți spune să le duci mâine): „Am cinci lemne, mamă.” → ea îți spune unde să le duci → „Mă duc.” → **peste o imagine** (ales de Claude: câte una la fiecare casă), Vale le duce: întâi la Hanna, apoi la Ilse, apoi la Greta, unde le stivuiește sub streașină, iar copiii se uită la el (decis de autor). Fiecare casă: o oră. Sătenii n-au portret, doar numele, ca la pâine.
- **Ratată și dacă trec cele 3 zile** (3 × 24 de ore de când ai acceptat): la mama apare „Mamă... au venit ploile?”, iar ea îți spune cum s-au descurcat (cine are lemne uscate și cine și-a ars scaunele).
- **Recompensa:** încrederea mamei **+1**. După, la „Ce mai faci, mamă?”, o replică despre Greta (sau, dacă ai ratat-o, despre vreascurile duse de mama în șorț).
- **Imagini:** `events/lemne_iarna_1.png` (la Hanna), `events/lemne_iarna_2.png` (la Ilse), `events/lemne_iarna_3.png` (la Greta, cu copiii), galeria: „Lemne pentru iarnă”.

**Cum verifici**
1. Termină „Pâinea văduvelor”, apoi „Ziua următoare”. Dimineața, în bucătărie: „Mamă, ți-e frig?” → „Le duc eu, mamă.”.
2. F2 → Obiect: 5 lemne → la mama: „Am cinci lemne, mamă.” → „Mă duc.” → imaginea de la Hanna. De încă două ori, pentru Ilse și Greta → +1 la mama.
3. Ratarea: pornește-o din nou (F2 → Resetează), acceptă, apoi „Ziua următoare” de 4 ori → la mama: „Mamă... au venit ploile?”.
4. Amândouă misiunile (și „Noaptea nașterii”) se pornesc doar din discuția cu mama, nu din F2 → „Pornește”: alegerea din discuție pune și ora de la care curge termenul. Sau refuză-o de la început.

### ✅⚠️ Noaptea nașterii (se poate rata)
- **Pornește** (decis de autor: la 3–4 zile după „Lemne pentru iarnă”, ca misiunile să nu vină grămadă; ales de Claude: 3 zile; dusă la capăt sau ratată) și după eliberarea lui Finn (Marginea satului e deschisă), seara (18–22), când vorbești cu mama în bucătărie (pe ea e „!”), fata vecinei bate grăbită la ușă: **Hanna naște, cu o lună mai devreme**. Mama se duce la ea și îl trimite pe Vale după **Bătrâna Morwen**, la Marginea satului, pe drumul din spate, ferindu-se de orci (decis de autor).
- **„Alerg după ea.”** pornește misiunea; **„Mamă, e noapte. Orcii...”** o **ratează** pe loc: mama se duce singură. În noaptea aceea, mama e la Hanna (nu e acasă până la 7 dimineața).
- **Pasul** (decis de autor: „până se luminează”): la Bătrâna Morwen, **până la 5 dimineața**: „Bunico, mama m-a trimis după dumneata!”. În noaptea asta **coliba nu e încuiată**, iar după 23 Vale o trezește pe bătrână (discuția începe cu bătaia în ușă). → „Să mergem.” → **peste 3 imagini**: drumul pe întuneric, cu felinarul stins când trece torța orcilor; casa Hannei, cu mama și bătrâna lângă pat, iar Vale pe prag toată noaptea; în zori, mama iese cu copilul în brațe. **Copilul primește numele tatălui lui, Owen**, unul dintre cei 23 (decis de autor; numele e ciornă). E primul copil născut în Baum de la bătălie. Mama: „O să avem noi grijă să crească, Morwen.” La sfârșit e ora 6 dimineața, iar Vale ajunge în camera lui.
- **Ratată și dacă n-o aduci pe bătrână până la 5:** a doua zi, la mama („Mamă... cum a fost la Hanna?”) sau la bătrână („Bunico... ce s-a întâmplat cu Hanna?”): fata vecinei a alergat după Morwen în zori, copilul s-a născut greu și Hanna aproape s-a dus; trăiesc amândoi.
- **Recompensa:** încrederea mamei **+1**. După, replici noi la mama și la bătrână, despre micul Owen.
- **Imagini:** `events/nastere_1.png` (Vale și bătrâna pe ulița întunecată), `events/nastere_2.png` (casa Hannei, noaptea), `events/nastere_3.png` (în zori, mama cu copilul), galeria: „Noaptea nașterii”.

**Cum verifici**
1. Termină „Lemne pentru iarnă” (sau ratează-o), eliberează-l pe Finn și treci 3 zile („Ziua următoare”). Seara (18–22), în bucătărie: apasă pe mama: fata vecinei bate la ușă → „Alerg după ea.”. Mama nu mai e în bucătărie.
2. Marginea satului → Coliba ierbăresei (și după 23 se intră) → „Bunico, mama m-a trimis după dumneata!” → „Să mergem.” → cele 3 imagini → în camera ta, la 6 dimineața, +1 la mama.
3. Ratarea: acceptă, apoi nu te duce; a doua zi după 7, la mama: „Mamă... cum a fost la Hanna?”. Sau refuză-o de la început.

### 📝 Echipamentul tatălui (misiunea specială a Miriamei)
- Decis de autor: **de la încredere 8/10**, Miriam îi dă lui Vale echipamentul lui Edwin, ascuns de ea: coiful, jambierele, sabia (`coif_tata`, `jambiere_tata`, `sabia_tata`) și **platoșa crăpată pe mijloc** (`platosa_tata_crapata`, obiect de poveste: lovitura orcului din al doilea vis). **Nu dă încredere** (decis de autor): doar echipamentul (și emoții). O scriem după ce toți au cele 10 întâmplări (misiunile speciale la urmă), dar în joc apare de cum ajunge Miriam la 8/10. Cum anume: de făcut. Cifrele obiectelor: TODO echilibru.
- **Legături:** platoșa o repară Bram („Platoșa tatălui”).

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

### ✅ Foalele stricate
- **Pornește:** imediat după „Fierul lui Bram”, la Bram: „De ce e forja rece, domnule Bram? !”. Pielea foalelor a crăpat de tot, iar orcii iau toate blănurile din sat la taxă → „Îți aduc eu pieile, domnule Bram.”
- **Pasul 1:** 3 piei de mistreț (de la vânătoare: mistrețul apare în 25% din vânători). Indicația: „Despre foale...”.
- **Pasul 2:** la Bram, „Ți-am adus pieile de mistreț! ?” → „Hai să le facem.” Peste 2 imagini (decis de autor): Bram și Vale cos pielea pe rama veche, apoi Vale trage de foale, focul se încinge, Bram bate fierul și râde; îi spune lui Vale că tatăl lui stătea exact acolo, la foale. Trec 2 ore.
- **Recompensa:** încrederea lui Bram +1 (alta, `TODO` dacă vrei).
- **Imagini:** `events/bram_foale_1.png`, `bram_foale_2.png` (galeria: „Misiunea lui Bram: foalele”).

**Cum verifici:** după „Fierul lui Bram”, cu 3 piei de mistreț (F2 → Obiect), la Bram: „De ce e forja rece...” → „Îți aduc eu pieile” → „Ți-am adus pieile de mistreț!” → „Hai să le facem” → cele 2 imagini → Bram 2/10.

### ✅ O zi la forjă
- **Pornește singură** (decis de autor): după „Foalele stricate”, când vii la fierărie și Bram lucrează afară, după-amiaza (14–18, ales de Claude). Semnul „!” stă deasupra lui Bram și a fierăriei cât evenimentul ar porni la sosire. Bram și-a ars mâna pentru că se grăbea: orcii i-au dat foarte mult de lucru (douăzeci de topoare, le vor diseară, altfel plătește tot satul). Vale lucrează în locul lui și îl ajută să termine la timp.
- **Peste 4 imagini, cu 2 mini-jocuri** (fără eșec, decis de autor):
  - **foalele**: în ritm, ca la muls;
  - **ciocanul**: pe inel, ca la lemne, 3 lovituri, cu sunetul `nicovala`.
- Ține 4 ore și ia 30 stamina (ales de Claude).
- **Recompensa:** încrederea lui Bram +1.
- **Imagini:** `events/bram_forja_1.png` … `bram_forja_4.png` (galeria: „Bram: o zi la forjă”); sunetul `sunete/efecte/nicovala.mp3`.
- **De aranjat în editor:** Aranjare → Ecrane → „Mini-joc: Foalele” și „Mini-joc: Ciocanul”.

**Cum verifici:** după „Foalele stricate”, între 14:00 și 17:59, intră de pe **hartă** la fierărie, cu Bram afară: pornește singură.

### ✅ Cufărul
- **Pornește** (decis de autor: Bram e îngândurat și pare supărat): după „Fierul plugului”, când plugul fermierului e reparat (dacă ai acceptat, imediat; dacă ai refuzat, după cele 2 zile), și după „Lumina din pădure” (misiunile lui Elian, decis de autor). Doar la fierărie (ales de Claude). Bram ține ciocanul în poală și se uită în gol (salutul de dinaintea meniului) → „Ce vă frământă, domnule Bram? !”.
- **Ce s-a întâmplat** (ales de Claude): colectorul a văzut plugul nou al fermierului și bănuiește că Bram ascunde fier; a zis că vine într-o zi să-i întoarcă fierăria pe dos. „Ce o să găsească?” pornește misiunea; „Nu vreau să știu” o lasă în meniu.
- Bram îi dă lui Vale **cheia cufărului** (`cheie_fierar`, obiect de poveste) și îl roagă să urce și să-l deschidă: el nu mai poate.
- **Pasul 1:** în camera lui Bram (sus, din magazin, cât lucrează Bram), un clic pe cufăr → imaginea cu cufărul deschis și **săbiile celor căzuți** (decis de autor: unele rupte, altele ciobite). Vale le numără: douăzeci și două. Caută sabia tatei, cu rombul auriu pe gardă: nu e acolo (ales de Claude: e la Miriam, cu echipamentul lui Edwin).
- **Pasul 2:** înapoi la Bram, „Am deschis cufărul, domnule Bram.” → le-a strâns de pe câmp a doua zi după bătălie, câte patru odată; sabia lui Edwin n-a găsit-o. Nu le poate topi, nu le poate da orcilor și nici nu le mai poate ține acolo; nu știe ce să facă (decis de autor). Vale se gândește la Fratele Elian.
- **Recompensa:** încrederea lui Bram +1. Apoi Elian are „!” („Secretul lui Elian”).
- **Cufărul, după:** gândul lui Vale se schimbă (săbiile dorm pe pânza lor; după toiag, cufărul e gol).
- **Imagini:** `events/bram_cufar.png` (cufărul deschis, cu săbiile; galeria: „Bram: cufărul”), `items/cheie_fierar.png`. **De desenat în editor:** zona „Cufărul lui Bram”, pe cufărul din imaginea camerei.

**Cum verifici:** după „Fierul plugului” (F2: misiunea terminată și stările `plug_reparat`, `fermier_deblocat`), la fierărie, ziua: Bram îngândurat → „Ce vă frământă” → „Ce o să găsească” → sus, în camera lui, cufărul → înapoi la Bram → „Am deschis cufărul”.

### ✅ Toiagul celor 23 (a lui Elian)
- Vine după „Cufărul” și „Secretul lui Elian”; Bram bate toiagul din săbii. +1 la Bram și la Elian. Pe larg, la Elian.

### 📝 Platoșa tatălui
- Decis de autor: după misiunea specială a Miriamei, Bram repară platoșa crăpată a lui Edwin (`platosa_tata_crapata` → `platosa_tata`). Ce cere și cum: de făcut. (Bram îl știa pe Edwin: „Tatăl tău venea aici să-i ascut sabia.”)
- **Imagini:** `items/platosa_tata_crapata.png` (aceeași platoșă, crăpată pe mijloc, prin romb).

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

### ➡️ Bolnavul
- A devenit misiunea lui Finn **„Mama lui Finn”** (decis de autor; Elian e foarte implicat și primește și el încredere +1). Vezi la Finn.

### ✅ Cărțile
- **Pornește singură** (decis de autor): după cel puțin 7 zile (din ziua 8), următoarea dată când mergi la biserică și Elian citește afară. Ales de Claude: doar 14–18 (cât colectorul își face rondul prin sat) și abia după ce l-ai cunoscut pe Elian. **Semnul „!”** (decis de autor, ca să nu te ia prin surprindere): deasupra lui Elian și a bisericii de pe hartă, cât evenimentul ar porni când ajungi acolo (`ofertaEveniment` la misiune).
- **Imaginile** (decis de autor): (1) Elian vine agitat, cu 3 cărți în brațe; (2) te roagă să le iei și să te ascunzi după biserică, orice s-ar întâmpla. Alegi:
  - **le iei** (misiunea pornește): (3) din spatele bisericii, colectorul vorbește cu Elian, se aude doar ce strigă el; (4) colectorul îl lovește pe Elian cu bâta în stomac; (5) Elian în genunchi, colectorul pleacă; (6) mergi la Elian: îți mulțumește, își ia cărțile și intră în biserică. **Încrederea lui Elian +1.**
  - **refuzi:** o singură imagine, Elian fuge mai departe cu cărțile; misiunea apare în carte ca **ratată**, fără încredere.
- Primul semn că Elian ascunde ceva: colectorul strigă de „cărți vrăjitorești” (ciornă).
- **Imagini:** `events/elian_carti_1.png` … `elian_carti_6.png`, `elian_carti_refuz.png` (galeria: „Elian: cărțile”).

**Cum verifici:** din ziua 8, 14:00–17:59, intră pe imaginea bisericii (Elian e afară) → evenimentul pornește singur. Pentru a doua variantă: F2 → „Resetează” la misiune (sau joc nou).

### ✅ Pasărea Linei (de la Lina, +1 la Elian)
- **Pornește** (decis de autor): după „Cărțile” (oricum s-a terminat), la Lina, când se joacă în fața casei (10–14). Ales de Claude: și după „Păpușa Linei”, ca Lina să nu ceară două lucruri deodată. Lina îl cheamă („Vino repede! Adică... încet. Dar repede!”) → „Ce ai acolo, Lina? !” → „Arată-mi.”
- **Peste o imagine:** Lina ține în palme o vrabie cu aripa ruptă (o cheamă Ciripel, ciornă de Claude). N-are voie să meargă singură până la biserică.
  - **o duci** (misiunea pornește): vrabia ajunge în căciula lui Vale (obiect de poveste);
  - **refuzi** (decis de autor: se poate refuza): misiunea e ratată, fără +1. În ziua aceea Lina e tristă („Ciripel doarme. Nu vorbi tare.”), iar a doua zi îți spune că Finn a dus-o la Elian și că vrabia a zburat.
- **Pasul 1:** la Elian (oriunde e treaz), „Frate Elian, Lina ți-a trimis o vrabie rănită.” → „Uite-o.” → peste 2 imagini, Elian ține vrabia în căușul palmelor și șoptește un cuvânt; printre degete se vede o clipă o lumină albă și aurie, apoi vrabia zboară. „Era doar speriată, Vale.” Dar aripa îi fusese ruptă (indiciul mic, decis de autor).
- **Pasul 2:** la Lina, „Lina, vrabia ta a zburat!”.
- **Recompensa:** încrederea lui Elian +1.
- **Imagini:** `events/pasarea_lina_1.png` (Lina cu vrabia), `pasarea_lina_2.png` (lumina dintre degetele lui Elian), `pasarea_lina_3.png` (vrabia zboară), iconița `items/vrabia_linei.png` (galeria: „Elian: pasărea Linei”).

**Cum verifici:** după „Cărțile” și „Păpușa Linei”, la Marginea satului, 10–14, la Lina, în fața casei → „Ce ai acolo, Lina?” → „Arată-mi” → „I-o duc eu” → Elian → Lina. Pentru refuz: F2 → „Resetează”, apoi „N-am timp acum”; a doua zi, Lina îți spune ce s-a întâmplat.

### ✅ Lumina din pădure (+1)
- **Pornește** (decis de autor: **nu se poate refuza**): după „Pasărea Linei” (dusă sau refuzată), la Elian: „Pari îngrijorat, frate Elian. !” → vine iarna, la Marginea copiii tușesc, iar din luminița-nopții face un ceai; floarea se deschide doar la apus, în pădure, și el nu poate lăsa biserica → „Ți le aduc diseară, frate Elian.” (singura alegere).
- **Pasul 1:** seara (18–23), când Vale ajunge în pădure, pornește singură, peste 6 imagini (ales de Claude: fără luptă, ca să nu se poată pierde):
  1. la apus, Vale culege trei flori;
  2. (decis de autor, ca atacul să nu vină prea brusc) se face întuneric și e prea liniște; lupii se arată printre copaci și îi dau târcoale, iar Vale îi simte și vrea să se uite în spate; când se uită, în întuneric se aprind ochi;
  3. lupii îl încercuiesc, îl mușcă, Vale cade; strigă, dar nu-l aude nimeni, și își dă seama că sunt prea mulți, că nu mai are scăpare (decis de autor: o scenă tensionată, cu suspans);
  3b. (decis de autor) prim-planul feței lui Vale, însângerat, cu ochii pe jumătate închiși (irișii încă se văd), iar lângă fața lui botul unui lup, din care îi curg bale pe obraz: crede că așa se termină și se gândește la mama, care o să-l aștepte acasă cum l-a așteptat pe tata;
  4. (decis de autor) dintre copaci, raze albe-aurii, arzătoare, care ard lupii; lupii fug schelălăind, cu blana fumegând; Vale, plin de sânge, aproape leșinat, cu ochii dați peste cap; fără nicio siluetă în lumină;
  5. Vale se trezește la marginea pădurii, cu rănile închise; lângă el, Elian, palid, cu mâinile ascunse în mâneci: „Te-am găsit așa. Ai avut noroc.” Iarba e arsă într-un cerc perfect, iar pe sub mâneci palmele lui încă lucesc (indiciul mare, decis de autor).
  Ia 20 stamina (ales de Claude). La sfârșit, „Hai acasă”: **Vale apare noaptea în fața casei** (decis de autor), la 00:30 (ales de Claude: misiunea pornește între 18 și 23, deci e mereu noaptea de după).
- **Pasul 2:** la Elian, „Frate Elian, ce s-a întâmplat în pădure?” → „Unele lucruri le vezi abia când ești gata să le vezi, Vale. Iar eu nu știu încă dacă ești.”
- **Recompensa:** încrederea lui Elian +1. **După ea apare „Cufărul” lui Bram** (decis de autor).
- **Imagini:** `events/lumina_padure_1.png`, `lumina_padure_1b.png` (lupii printre copaci), `lumina_padure_2.png`, `lumina_padure_2b.png` (prim-planul feței lui Vale, decis de autor), `lumina_padure_3.png`, `lumina_padure_4.png` (galeria: „Elian: lumina din pădure”, în ordinea din joc).

**Cum verifici:** după „Pasărea Linei”, la Elian → „Pari îngrijorat” → „Ți le aduc diseară”. De pe hartă, în pădure, la 19:00 (la 17:40 nu pornește) → cele 6 imagini → Elian → „ce s-a întâmplat în pădure?” → +1. Abia acum Bram are „Ce vă frământă, domnule Bram? !”.

### ✅ Secretul lui Elian
- **Pornește** (decis de autor): după „Cufărul” (Bram), cât Elian citește afară, pe scări (14–23): „Frate Elian, am nevoie de un sfat. !”. Vale îi spune de cele douăzeci și două de săbii. Elian are o singură idee, dar întâi trebuie să-i arate ceva: „Vreau.” pornește misiunea; „Nu încă” o lasă în meniu.
- **Peste 3 imagini** (ales de Claude: imagini, nu un loc nou pe hartă):
  1. în spatele bisericii, Elian dă la o parte crengi, frunze și iarbă: o **trapă ascunsă** (decis de autor). Dacă în „Cărțile” Vale s-a ascuns cu ele, își amintește că s-a ghemuit chiar acolo; dacă a refuzat, că pe acolo a fugit Elian;
  2. jos, o **încăpere strâmtă**, luminată de lumina care îi iese lui Elian direct din palme (decis de autor); pe raft, cărțile cu soarele cu raze frânte;
  3. Elian arată **cristalul** (mic, auriu, în romb, ca pe steagul satului).
- **Ce spune Elian** (decis de autor: doar o parte): e mag al Cercului Luminii, nu un începător; își ascunde puterea, pentru că un mag puternic într-un sat ocupat e un mag mort și satul plătește pentru el; „Un om singur nu eliberează un sat. Un sat se eliberează singur.” **De ce l-a trimis Cercul aici nu spune** (trezirea rămâne secret).
- **Indiciul** (ales de Claude): când Vale se apleacă, cristalul începe să lucească ușor, auriu (decis de autor: puterile lui Vale abia se trezesc, deci lumina e slabă). Elian își strânge degetele peste el și tace: „Se mai întâmplă. Uneori.”
- **Ideea lui:** din oțelul săbiilor, Bram să bată un toiag (un toiag de preot nu-l numără niciun orc), iar el să-i pună cristalul în cap, „pentru ceva neprevăzut”. Vale îi poate spune lui Bram, dar numai după ce Bram jură să tacă.
- **Recompensa:** încrederea lui Elian +1. Apoi pornește singură „Toiagul celor 23”.
- **În carte:** descrierea lui Elian se schimbă după misiune.
- **Imagini:** `events/elian_secret_1.png`, `elian_secret_2.png`, `elian_secret_3.png` (galeria: „Elian: secretul”).

**Cum verifici:** după „Cufărul”, la biserică, 14–23 (Elian afară) → „am nevoie de un sfat” → „Vreau.” → cele 3 imagini. Înăuntru, dimineața, oferta nu apare.

### ✅ Toiagul celor 23 (+1 la Bram și la Elian)
- **Pornește singură**, la sfârșitul „Secretului lui Elian”.
- **Pasul 1** (decis de autor): la Bram, „Domnule Bram, trebuie să-mi jurați ceva.” → Bram jură pe nicovala tatălui lui; Vale îi spune că Elian e mag adevărat, cu un cristal, și ideea toiagului, ca să-i crească puterea, pentru ceva neprevăzut. Bram îl bate seara, cu obloanele trase.
- **Pasul 2:** seara, cât lucrează Bram înăuntru (18–22), intri în fierărie → peste 3 imagini, coboară săbiile din cufăr, Vale stă la foale, Bram bate toiagul (oțel negru cu dungi argintii, cu un loc gol în romb). 3 ore, 20 stamina (ales de Claude; fără mini-joc, au fost la „O zi la forjă”). Primești „Toiagul lui Bram”.
- **Pasul 3:** la Elian (oriunde e treaz), „Frate Elian, toiagul e gata.” → „Nu aici. Vino.” → peste 2 imagini, sub biserică, Elian pune cristalul în capul toiagului și i-l dă lui Vale: are încredere în el și simte că o să aibă nevoie de el, că ceva mare se apropie (decis de autor). Vale nu înțelege de ce el (decis de autor). Cristalul lucește iar în mâinile lui, auriu, ceva mai tare decât prima dată, iar palmele lui Vale lucesc și ele, abia văzut (indiciu, ales de Claude; lumina rămâne slabă, puterile lui abia se trezesc, decis de autor). „Douăzeci și două de săbii, pentru douăzeci și trei de oameni. Iar pentru al douăzeci și treilea, îl ține acum în mână fiul lui.”
- **Unde stă toiagul** (decis de autor: în cufărul lui Vale, pentru lupta finală): în joc, la **obiectele de poveste**, ca să nu se piardă sau să se vândă; în descriere, Vale spune că l-a ascuns pe fundul cufărului de acasă.
- **În lupta finală** (decis de autor): la „Obiect”, doar Vale, **o singură dată** (cu toate valurile): **golește bara tuturor inamicilor și pune scutul de lumină pe toți aliații**. O lumină albă-aurie umple câmpul de luptă; e prima dată când Vale folosește magia luminii (în jurnal: lumina nu vine doar din cristal, ci și din mâinile lui).
- **Recompensa:** încrederea lui Bram +1 și a lui Elian +1.
- **Imagini:** `events/toiag_forja_1.png` … `toiag_forja_3.png`, `events/toiag_cristal_1.png`, `toiag_cristal_2.png` (galeria: „Toiagul celor 23”), iconițele `items/toiag_fara_cristal.png` și `items/toiagul_celor_23.png`, poza de luptă `combat/vale_toiag.png` (Vale ridică toiagul; până o încarci, se vede poza lui de atac).

**Cum verifici**
1. După „Secretul lui Elian”, la Bram → „trebuie să-mi jurați ceva”.
2. Seara (18–22), de pe zona fierăriei → Magazinul → cele 3 imagini. (La 17:30, cu Bram afară, nu pornește.)
3. La Elian → „toiagul e gata” → „Te urmez” → cele 2 imagini → +1 Bram, +1 Elian; toiagul e la Obiecte de poveste.
4. **Toiagul în luptă:** F2 → Testare luptă → bifa „Ca în lupta finală” → câțiva inamici → Pornește. La rândul lui Vale: Obiect → Toiagul celor 23. Barele inamicilor se golesc, fiecare aliat primește scutul; la tura următoare, toiagul nu mai e.

---

## Kaia (vânătoarea)

### ✅ Întâlnirea cu Kaia (nu e misiune)
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
- **Victorie:** încrederea Kaiei +1, apoi îl duce în **tabăra ei** (locul de campare se deblochează).
- **Înfrângere:** „Mâine, aceeași oră”.
- **Recompensa:** încredere și locul de campare.

**Imagini:** `sprites/vanatoare_padure.png`.

**Cum verifici**
1. F2 → Misiune: Lupul negru → Pornește (sau vino din întâlnirea cu Kaia).
2. Timp „Amiază”, apoi de trei ori „+1 oră” (15:00) → zona pădurii: Kaia e acolo.
3. Vorbește cu ea → „Sunt gata” → „Înainte!” → imaginea adâncului pădurii („Cauți urme de vânat...”, trece o oră) → lupta.
   - Victorie: replicile și tabăra. Locul de campare apare apoi în pădure.
   - Înfrângere: „Mâine, aceeași oră”.

### ✅ Vânătoarea împreună (nu e misiune, după Lupul negru)
- **Când:** dimineața, 05–10, la locul de campare, Kaia e acolo. În meniul ei apare „Mergem împreună la vânătoare?”.
- „Să mergem.” → vânătoarea obișnuită (lupi sau mistreț), cu Kaia sigur alături în luptă. „Poate altă dată.” te întoarce la meniu.
- După luptă: un scurt dialog (altul după înfrângere), apoi Kaia se întoarce în pădure (nu mai e la locul de campare până la 14:00), iar Vale rămâne în tabără.

**Cum verifici:** după Lupul negru, mergi la locul de campare la 07:00 → apasă pe Kaia → „Mergem împreună la vânătoare?” → „Să mergem.” → lupta are două tabere: Vale și Kaia contra animalelor. La 15:00 opțiunea nu mai apare.

### ✅ Capcanele
- **Pornește** (decis de autor): imediat după „Lupul negru”, la Kaia, la locul de campare: „Ce s-a întâmplat, Kaia? Pari supărată. !”. Ember a scăpat la un fir de păr de o capcană de fier cu craniul Craniilor Sângerii; Kaia a numărat cinci pe poteca de la izvor și îi cere lui Vale să le desfacă împreună → „Le desfacem împreună.” (sau „Altă dată, Kaia.”, iar oferta rămâne în meniu).
- **Pasul 1: desfaci capcanele cu Kaia.** La Kaia, „Sunt gata. Hai la capcane! ?”, doar ziua (05–10 sau 14–18, cât e ea la locul de campare) și odihnit (cel puțin 30 stamina; obosit, Kaia te trimite la odihnă). Apoi, peste **3 imagini**, cu replici peste ele:
  1. Kaia îi arată prima capcană, ascunsă sub frunze, cu craniul bătut cu dalta pe arc. Orcii prind tot ce mișcă; carnea și pieile pleacă în căruțe pe drumul mare, ca fierul lui Bram. Pădurea e prea liniștită.
  2. Desfacerea: creanga între fălci, Vale apasă arcul, Kaia scoate cuiul. **Mini-jocul** (decis de autor): jocul barei de la arat, peste imaginea asta; trebuie **5 reușite** (cele cinci capcane), cu **cel mult o ratare** („dacă îți scapă o dată, creanga ține; a doua oară nu mai ține”). A doua ratare: capcana se închide (sunetul `capcana`), Vale se zgârie (−10 viață), iar Kaia îl trimite acasă: **se încearcă iar a doua zi**. Cu mini-jocurile oprite, reușește singur. **Cu toate cinci desfăcute: încrederea Kaiei +1**, care urcă pe ecran chiar atunci (decis de autor).
  3. După ce le-a desfăcut, Kaia le însemnează pe arc cu cuțitul („dacă le mai văd în pădure, știu că sunt aceleași”). Lângă izvor, **o căprioară prinsă** într-o capcană pe care n-o văzuseră. Alegi:
     - **„O eliberăm.”**: o imagine nouă, căprioara fuge în fundal, iar Kaia și Vale se uită după ea; **al doilea punct de încredere** al Kaiei, care urcă pe ecran chiar atunci (decis de autor);
     - **„E carne bună. O iau.”**: o imagine nouă, Kaia întoarsă cu spatele, cu o lacrimă pe obraz, iar Vale aplecat în fundal (căprioara nu se vede); 3 carne, fără al doilea punct (Kaia: „Fierul orcilor a prins-o, iar tu i-ai terminat treaba.”).
  - Vale primește **Capcanele orcilor** (obiect de poveste). Trec 3 ore în total, −15 stamina.
- **Pasul 2: ce faci cu fierul capcanelor** (decis de autor):
  - **la Bram** (oricând îl găsești, ? auriu): „Am niște capcane de fier pentru dumneata.” → Bram le topește pentru vârfuri de săgeți, îi dă lui Vale **10 săgeți** din cele gata și îi trimite vorbă Kaiei că-i mulțumește. **Încrederea lui Bram +1.**
  - **la colector** (la poartă sau când vine acasă după taxă, lângă plata taxei): „Am găsit niște capcane de-ale voastre în pădure.” („le-am găsit așa, dezarmate”) → **20 de monede**. Bram nu primește punctul. **La următoarea discuție cu Kaia**, ea le-a găsit din nou în pădure, armate, cu linia ei pe arc: **încrederea Kaiei −1** (urcă pe ecran cu roșu).
- **Recompensa:** încrederea Kaiei +1 (capcanele) și încă +1 (căprioara eliberată); săgeți și încrederea lui Bram, sau monede de la colector (cifrele, `TODO` echilibru, alese de Claude).

**Imagini:** `events/kaia_capcane_1.png` (Kaia îi arată capcana de sub frunze), `events/kaia_capcane_2.png` (desfacerea: creanga între fălci, Vale apasă arcul; peste ea stă mini-jocul), `events/kaia_capcane_3.png` (căprioara prinsă, Kaia îi ține palma pe gât), `events/kaia_capcane_eliberata.png` (căprioara fuge în fundal, Kaia și Vale se uită după ea), `events/kaia_capcane_carne.png` (Kaia întoarsă cu spatele, cu o lacrimă pe obraz; Vale aplecat în fundal); iconița `items/capcane_orci.png` (galeria: „Kaia: capcanele” și „Iconiță: Capcanele orcilor”). Sunetul: `sunete/efecte/capcana.mp3` (capcana care se închide).

**De aranjat în editor:** Aranjare → Ecrane → „Mini-joc: Capcanele orcilor”: muți și mărești bara pe imaginea desfacerii (până atunci stă jos, la mijloc).

**Cum verifici**
1. F2 → Misiune: Lupul negru → Pornește, apoi termin-o (sau setează starea `lup_negru` = `ucis`). Timp „Dimineață” (07:00) → Pădure → Locul de campare.
2. Vorbește cu Kaia → „Ce s-a întâmplat, Kaia? Pari supărată. !” → „Le desfacem împreună.” → în meniu apare „Sunt gata. Hai la capcane! ?” → „Să mergem.”.
3. Imaginea 1 cu replici → imaginea 2 → „Apăs arcul.” → mini-jocul. Ratează de două ori: capcana se închide, −10 viață; la Kaia, „Despre capcane...” spune „Azi nu mai”. Apasă „Ziua următoare” și încearcă din nou.
4. Câștigă (5 reușite, cel mult o ratare) → „Toate cinci, desfăcute.” și +1 Kaia urcă pe ecran → imaginea 3, căprioara → „O eliberăm.” → imaginea cu ea fugind, iar la „Eu țin minte sigur.” urcă al doilea +1 → la final, Capcanele orcilor.
5. Calea lui Bram: vorbește cu Bram → „Am niște capcane de fier pentru dumneata. ?” → 10 săgeți, +1 Bram, misiunea terminată.
6. Calea colectorului (F2 → „Resetează” la misiune, apoi refă pașii 2–4): la poartă, apasă pe colector → „Am găsit niște capcane de-ale voastre în pădure.” → 20 de monede. Apoi la Kaia: ea începe cu „Am fost la izvor, Vale...” și pierzi 1 încredere (−1, cu roșu). A doua oară vorbește normal.
7. Încearcă și „E carne bună. O iau.”: 3 carne, fără încredere.

### ✅ Rana lui Ember
- **Pornește** (decis de autor): la cel puțin **două zile după „Capcanele”** (ales de Claude: și după eliberarea lui Finn, ca Vale să poată ajunge la Bătrâna Morwen, la Marginea satului), când vii la locul de campare. Acolo e **un singur sprite nou: Kaia lângă Ember, rănit de un mistreț**; până la vindecare, Kaia și Ember nu mai apar separat, zi și noapte, iar Kaia nu mai pleacă la vânătoare (nici dimineața, cu Vale, nici 10–14, singură). Când apeși pe el, răspunde Kaia: „Vale... Bine că ai venit.” → „Ce i s-a întâmplat lui Ember? !”. Un mistreț bătrân i-a înfipt colțul în coapsă; rana trebuie unsă până nu se infectează, iar Kaia nu-l poate lăsa singur → „Mă duc chiar acum.” (sau „Nu acum, Kaia.”, iar oferta rămâne).
- **Pasul 1:** la Bătrâna Morwen (Marginea satului, coliba, 06–23): „Bunico, am nevoie de o alifie pentru un tigru. ?”. Morwen o știe pe „fata cu tigrul” și cere florile (decis de autor, fără schimb nou): **2 păpădii, 2 fire de piciorul-cocoșului și 3 de mușețel**.
- **Pasul 2: culegi florile.** În pădure, „Caută ierburi”, dimineața (locul apare și cât e misiunea asta, chiar fără misiunea lui Elian). Sus, pe ecranul culesului, scrie ce cere Morwen. Cu mini-jocurile oprite, Vale culege singur florile care îi lipsesc (cel mult 4 o dată).
- **Pasul 3:** cu florile, la Morwen: „Ți-am adus florile, bunico. ?” → **Alifia pentru Ember** (obiect de poveste).
- **Pasul 4:** la Kaia: „Am adus alifia de la Bătrâna Morwen. ?” → „Îngenunchez lângă Ember.” → **fără alegeri** (decis de autor): Vale ține capul tigrului cât Kaia curăță rana, **peste o imagine** (decis de autor: Vale cu capul lui Ember în brațe, Kaia punând alifia; replicile stau peste ea până la amintiri, iar după amintiri se revine la ea); cât îi pune alifia, Kaia povestește cum l-a găsit pe Ember pui, peste **2 imagini-amintire** (au ceața de la vise, ca să se vadă că e trecutul; decis de autor: Kaia e copil, cu haine de copil, iar în a doua se văd și alți Străjeri, cu tovarășii lor): puiul singur, într-o scorbură (mama lui n-a mai venit), apoi cum a avut grijă de el, de unde îi vine numele („jar” pe limba veche), tovarășii Străjerilor și colțul de la gâtul ei, primul colț de lapte al lui Ember (decis de autor). Apoi înapoi la locul de campare: „De atunci n-am mai fost despărțiți.”, iar prima oară când a coborât cu el în sat, doar Edwin nu și-a închis ușa.
- **Recompensa:** încrederea Kaiei **+1** (ales de Claude, nu se poate rata) și povestea lui Ember. După vindecare, Kaia și Ember apar iar separat, ca înainte.

**Imagini:** `sprites/kaia_ember_padure_campsite.png` (Kaia lângă Ember rănit, fundal transparent), `events/kaia_ember_alifie.png` (Vale ține capul lui Ember, Kaia îi pune alifia), `events/kaia_amintire_1.png`, `events/kaia_amintire_2.png` (galeria: „Kaia: rana lui Ember”), iconița `items/alifie_ember.png`.

**De aranjat în editor:** Aranjare → Locul de campare → bifează „Arată tot” → „Kaia și Ember”: îl muți și îl mărești, apoi îi desenezi zona (până atunci răspunde pe forma sprite-ului).

**Cum verifici**
1. Termină „Capcanele” și eliberează-l pe Finn. Apoi apasă „Ziua următoare” de două ori.
2. Pădure → Locul de campare: în locul Kaiei și al lui Ember e sprite-ul comun, cu „!” deasupra. Apasă pe el → „Ce i s-a întâmplat lui Ember?” → „Mă duc chiar acum.”.
3. Marginea satului → coliba → Morwen → „Bunico, am nevoie de o alifie...” → ea cere florile. „Despre alifie...” le repetă.
4. Dimineața, în pădure, „Caută ierburi”: culege păpădii, piciorul-cocoșului și mușețel (sau F2 → Obiect). Cu ele, la Morwen → „Ți-am adus florile” → alifia.
5. La locul de campare → „Am adus alifia” → „Îngenunchez lângă Ember.” → replicile, cele 2 amintiri (cu ceață), înapoi la locul de campare → +1 Kaia. După dialog, Kaia și Ember sunt iar separat.

### ✅ Șoimul Străjerilor
- **Pornește** (decis de autor: după „Rana lui Ember”; K4 și K5 inversate, întâi șoimul, apoi wyvernii). Decis de autor: din ziua de după vindecare. La Kaia, la locul de campare: „Pot să stau puțin cu tine la foc? !” → „Mă așez lângă foc.” (sau „Altă dată, Kaia.”, iar oferta rămâne).
- **Peste 4 imagini** (decis de autor): (1) Vale și Kaia stau la foc și văd cum vine un șoim cu o scrisoare legată de picior; (2) șoimul se pune pe umărul Kaiei, iar ea ține scrisoarea; (3) o citesc împreună: **pădurile de departe au tăcut**, animale moarte **fără nicio rană, care nu putrezesc**, toți Străjerii sunt chemați acasă; (4) Kaia îi spune lui Vale că are nevoie de timp, să se gândească dacă pleacă sau rămâne.
- **Alegerea** (decis de autor): „Rămâi, Kaia. Avem nevoie de tine aici.” sau „Du-te. Ai tăi au nevoie de tine.”. Misiunea pornește aici.
- **Cele două zile** (decis de autor): Kaia pleacă în pădure cu Ember (și cu șoimul), să se gândească. 48 de ore de la alegere, cei doi lipsesc din locul de campare (deci nici vânătoarea împreună, nici întâlnirea de la vânătoare, 10–14).
- **După două zile** (decis de autor): la locul de campare, Kaia: „Te-am auzit de la marginea luminișului. Tot ca un urs.” → „Te-ai hotărât, Kaia? ?”. Au hotărât să rămână, iar replicile diferă după ce i-a spus Vale (decis de autor). Kaia a trimis șoimul înapoi, cu o scrisoare: și pădurea de la marginea satului are nevoie de ajutor (decis de autor).
- **Recompensa:** încrederea Kaiei **+1**, orice ar alege Vale (decis de autor).

**Imagini:** `events/kaia_soim_1.png` … `events/kaia_soim_4.png` (galeria: „Kaia: șoimul”).

**Cum verifici**
1. Termină „Rana lui Ember”, apoi apasă „Ziua următoare”.
2. Pădure → Locul de campare → Kaia → „Pot să stau puțin cu tine la foc?” → „Mă așez lângă foc.” → cele 4 imagini → alege una dintre replici. Kaia și Ember pleacă.
3. Calea cealaltă: F2 → Misiune: „Șoimul Străjerilor” → „Resetează”: discuția revine pe loc la alegere.
4. Apasă „Ziua următoare” de două ori: Kaia și Ember sunt iar la locul de campare (dimineața, 05–10, sau 14–23). La Kaia: „Te-ai hotărât, Kaia?” → replicile (altele, după alegere) → +1 Kaia.

### ✅ Convoiul
- **Pornește** (decis de autor): la o zi după ce Kaia a hotărât să rămână. La Kaia: „Ești tăcută azi, Kaia. S-a întâmplat ceva? !” → „Te ascult.” (sau „Nu acum, Kaia.”, iar oferta rămâne). Kaia povestește, **peste o imagine-amintire** (decis de autor, cu ceața amintirilor, ca la povestea despre Ember), cum a auzit, ieri, la vânătoare, doi orci: „mâine noapte” trece pe **drumul mare** un convoi cu cuști, spre capitală, cu niște fiare care „o să întoarcă războiul”. „Mâine noapte” e, deci, **la noapte**: Kaia vrea să vadă cu ochii ei, de pe un deal de lângă drum. Alegi „Vin cu tine.” sau „E prea periculos, Kaia. Nu vin.” (misiunea pornește oricum).
- **Doar noaptea de după** (decis de autor). **Accepți:** Kaia te așteaptă **23–03** la locul de campare (decis de autor, ca Finn la ladă); când ajungi acolo, **pornește direct** (decis de autor; dacă ești deja acolo când se face 23, din meniul ei: „Sunt gata, Kaia. Mergem? ?”). Peste **8 imagini**, cu replici, gândurile lui Vale și descrieri (decis de autor): (1) Kaia te întâmpină; (2) prin pădure, până la ieșirea din ea; (3) călare amândoi pe Ember, ocolind satul pe departe, să nu-i vadă orcii; (4) ascunși pe un deal, așteaptă; (5) la capătul drumului apare convoiul, de departe; (6) convoiul ajunge în dreptul lor (decis de autor): în prim-plan casca Kaiei; în focus, o cușcă mare, trasă de un bizon, cu un wyvern care stă liniștit, dar legat cu lanțuri; restul convoiului, cu mai mulți orci, în spate, neclar (căruțele convoiului sunt trase de bizoni); (7) fețele lor, uimiți: se întreabă dacă orcii au găsit un portal, dacă i-au făcut cu o vrajă, din fiare obișnuite; Ember tremură; (8) drumul înapoi, călare pe Ember. Drumul ține 4 ore și ia 20 stamina (decis de autor). **+1** la Kaia.
- **Refuzi** (decis de autor): în noaptea aceea (23–05) Kaia nu mai e la locul de campare; a doua zi (de la 05) o găsești: „Ce-ai văzut la drumul mare, Kaia? ?” → îți povestește, **fără +1**. Decis de autor: povestea stă peste imaginea cu cuștile (a 6-a), cu ceața amintirilor.
- **Accepți, dar nu vii până la 3** (decis de autor): Kaia pleacă singură, ca la refuz (lipsește 03–05), iar a doua zi începe cu „Te-am așteptat până la trei, Vale...”; tot fără +1.
- **Wyvernii nu sunt numiți** (decis de autor): Vale și Kaia îi cred dragoni. Ce sunt de fapt (ritualul orcilor, `docs/lore.md`) rămâne pentru mai târziu.

**Imagini:** `events/kaia_wyverni_orci.png` (amintirea Kaiei: doi orci vorbind, ea ascunsă după o tufă), `events/kaia_wyverni_1.png` … `events/kaia_wyverni_8.png` (galeria: „Kaia: convoiul”). **Casca Kaiei** (decis de autor, doar în misiunea asta): în afara locului de campare (amintirea cu orcii și imaginile 2–8) Kaia poartă casca (cea cu păr albastru, ca în imaginea cu ea și Ember); în prima imagine, la locul de campare, e fără cască, ca în portret, și și-o pune la sfârșitul ei.

**Cum verifici**
1. Termină „Șoimul Străjerilor”, apoi apasă „Ziua următoare”.
2. La Kaia → „Ești tăcută azi...” → „Te ascult.” → imaginea cu orcii (cu ceață) → „Vin cu tine.”.
3. Mută ora la 23 (F2) → Pădure → Locul de campare: pornește direct drumul, cu cele 8 imagini → +1 Kaia.
4. Refuzul: F2 → Misiune: „Convoiul” → „Resetează” (revine la alegere) → „E prea periculos...”. Noaptea, Kaia nu e la locul de campare; dimineața: „Ce-ai văzut la drumul mare, Kaia?” → povestea peste imaginea cu cuștile, fără +1.
5. „N-am venit”: accepți, apoi lași ora să treacă de 03:00 fără să mergi; dimineața, Kaia începe cu „Te-am așteptat până la trei...”.

### ✅ Al treilea vis (nu e misiune)
- **Când** (decis de autor): după „Convoiul”, dacă Vale a mers cu Kaia și a văzut wyvernii, la somnul de după. Misiunea se termină noaptea târziu, deci ajunge **o oră de somn noaptea** (ales de Claude; celelalte vise cer 4). Dacă se culcă ziua, visul vine la noapte.
- **Peste 2 imagini, cu ceață** (ciornă de Claude):
  1. drumul mare, gol, cu torțele înfipte în pământ; Vale stă în fața cuștii, iar wyvernul se trage înapoi și tremură, ca Ember, uitându-se **deasupra lui Vale**;
  2. (decis de autor) **Vale, văzut de sus**, se uită în jos: peste el și peste drum cade **umbra unui dragon**, cu aripile întinse de la un capăt al drumului la celălalt; dragonul nu se vede, iar cușca nu mai e acolo (decis de autor). Vale nu ridică ochii, dar simte că îl privește, cu ochiul auriu din al doilea vis. Căldura din piept, „ca un al doilea foc”, ca în primul vis.
- La trezire: „Fiarele din cuști tremurau, ca Ember. De ce s-ar teme un dragon de alt dragon?” (un indiciu că wyvernii nu sunt dragoni, fără să afle ce sunt).
- **Imagini:** `events/vis_3_1.png`, `events/vis_3_2.png` (galeria: „Al treilea vis”).
- **Filmulețul** (decis de autor): `events/vis_3.mp4`, între cele două imagini, după „Torțele se apleacă toate deodată...”: un close-up cu fața lui Vale, care se uită atent, încercând să înțeleagă ce are în față; apoi camera trece în spatele lui, ca în prima imagine, umbra crește de sub el și sfărâmă cușca, iar wyvernul, speriat, țipă; imediat după, mult praf, care acoperă tot (camera nu se mai ridică); după praf, a doua imagine apare încet. Dreamina, Seedance 2.0 Mini, „Orice tip de referință”, cu `vis_3_1.png` și `vis_3_2.png` (decis de autor: cu „Primul și ultimul cadru”, ultimul cadru nu ieșea ca imaginea), 15 secunde. Fără el, visul trece direct la a doua imagine, ca înainte.

**Cum verifici:** F2 → Stări: `kaia_wyverni_vazut` = `impreuna` (sau joacă „Convoiul” cu Kaia). Timp 03:30, acasă, în camera ta → Dormi → „Dormi până dimineața” → visul la trezire.

### ✅ Baza
- **Pornește** (decis de autor): după „Convoiul” (oricum s-a terminat), **seara (18–23)**, la locul de campare, la foc: „Kaia... la ce te gândești? !” → „(Mă așez lângă ea.)” (sau „Altă dată, Kaia.”, iar oferta rămâne). Nu se ratează.
- **Peste 2 imagini** (ciornă de Claude): (1) seara, la foc, Vale și Kaia, cu Ember dormind; Kaia vorbește despre cuști și despre focurile orcilor, tot mai multe; „Nu vine nimeni, Vale.” → Vale: „Atunci... ne ridicăm noi.” (2) Kaia desenează cu un băț înnegrit, în cenușă, satul, gardul și poarta, cu tabăra orcilor dincolo de zid: **tabăra ei devine baza** (decis de autor): orcii nu vin niciodată atât de adânc în pădure, iar Ember îi simte de departe. Vale se gândește la Bram, la unchiul lui, la Elian și la Finn („Adu-l. Dar nu-i spune nimic până nu-l văd cu ochii mei.”). „Nimeni nu trebuie să știe de locul ăsta. Nici mama ta.”
- **Recompensa:** încrederea Kaiei **+1**; starea `revolta` = `hotarata` (de aici pornesc misiunile despre revoltă, de exemplu „Cuștile vânătorilor”).
- **Imagini:** `events/kaia_baza_1.png`, `events/kaia_baza_2.png` (galeria: „Kaia: baza”).

**Cum verifici:** cu „Convoiul” terminat, ora 19:00 → Pădure → Locul de campare → Kaia → „Kaia... la ce te gândești?” → „(Mă așez lângă ea.)” → cele 2 imagini → +1 Kaia.

---

## Roderick Lightfinder (unchiul)

### ✅ Scandalul din tavernă
- **Până la scandal,** Roderick nu-l bagă în seamă pe Vale („Unchiul Roderick nici nu ridică ochii din cană”).
- **Pornește:** din **ziua 3**, în tavernă, cât e și Agnes acolo (16–00). În meniul lui apare „*Orcii fac multă dezordine și gălăgie...* !”: o scurtă poveste (orcii de la masa din colț cer bere, Agnes se teme, Roderick strânge cana), apoi orcul o apucă pe Agnes de braț → „(Te uiți spre ei.)” → toată scena peste cele 3 imagini (replicile stau peste ele): orcii cer bere, unul o apucă pe Agnes, Roderick se ridică și îi cere lui Vale să aleagă (dialogul `taverna_scandal`).
  - **Îl ajuți:** „Nu ești singur, unchiule.” → luptă alături de Roderick contra a doi orci. Încrederea lui +1. Mai departe:
    - victorie: o imagine, apoi Agnes și Roderick vorbesc cu Vale (pentru prima dată Roderick chiar se uită la el); Agnes te hrănește, primești 3 pâini și 2 beri, iar taxa crește cu 10;
    - înfrângere: o imagine, apoi Agnes îl îngrijește pe Vale și Roderick îi spune că a stat lângă el, atât i-a cerut; rămâi cu 10 viață și trec 2 ore.
  - **Refuzi:** 2 imagini (decis de autor): Roderick se bate singur și e doborât, apoi orcii pleacă râzând; dialogul cu el, rănit, tot peste imagine. Nu primești încredere, dar **tot îl poți recruta** mai târziu.
- **Legături:** după scandal vine „Lumânările” (la biserică), oricum s-ar fi terminat.
- **Imaginile:** `events/taverna_scandal_1.png`, `_2`, `_3` (orcii la masă, orcul o apucă pe Agnes, dezordinea și Roderick ridicându-se), `taverna_scandal_victorie.png`, `taverna_scandal_infrangere.png`, `taverna_scandal_refuz_1.png`, `taverna_scandal_refuz_2.png`.

**Cum verifici**
1. Ziua 1 sau 2, ora 17:00 („Amiază” + 5 × „+1 oră”), sala tavernei: Roderick te ignoră și ai doar „La revedere”.
2. Treci în ziua 3, tot la 17:00: apare „*Orcii fac multă dezordine și gălăgie...* !” → „(Te uiți spre ei.)” → imaginile scandalului și alegerea.
3. Victoria și înfrângerea se văd și direct: F2 → Eveniment → `taverna_scandal_victorie` / `taverna_scandal_infrangere` → Pornește.

### ✅ Hârtiile soldatului
- **Pornește:** după „Camera de sus”, cu hârtiile la Vale, **doar în tavernă** (Roderick e acolo 14–00; la biserică nu), în meniul lui Roderick: „Unchiule, am găsit niște hârtii... !”.
- Toată discuția stă peste o imagine: Roderick recunoaște scrisul prietenului lui, povestea solzului pe care „nu-l zgâria nicio sabie”, dragonii, pe care în sat nu i-a văzut nimeni (sunt ai călăreților Ordinului, de la capitală); dacă e adevărat, ar fi ceva de folosit împotriva orcilor, dar drumul trece dincolo de zid.
- Fără încredere (doar discuție); după ea vine **primul vis**.
- **Imagine:** `events/roderick_hartii.png` (Vale și Roderick la o masă din tavernă, aplecați peste hârtii, la lumina lumânării).

**Cum verifici:** după „Camera de sus”, 15:00, sala tavernei → Roderick → „Unchiule, am găsit niște hârtii...”.

### ✅ Primul vis (nu e misiune)
- **Prima noapte dormită** după discuția despre hârtii (oriunde; decis de autor: visele vin doar după un somn peste noapte, care prinde cel puțin 4 ore din 23–05, nu după câteva ore): Vale visează că e purtat de ceva uriaș care zboară, simte o căldură în piept „ca un al doilea foc”, apoi se trezește speriat.
- **Imagine:** `events/vis_1.png`. Ca toate visele, cu ceață pe marginile ecranului (`vis: true` la dialog).
- **Filmulețul** (decis de autor): `events/vis_1.mp4`, 15 secunde: ochii lui Vale de aproape, care se deschid încet, ca la trezire; apoi camera se dă înapoi până la încadrarea din `vis_1.png` (Vale pe spatele dragonului, deasupra norilor) și, la sfârșit, dragonul plonjează. Galeria: „Primul vis”.

**Cum verifici:** după „Hârtiile soldatului”, acasă, seara sau noaptea → „Dormi până dimineața” (sau „Dormi 6 ore” de la 22:00) → după imaginea somnului, visul. „Dormi 2 ore” nu aduce visul.

### ✅ Lumânările
- **Pornește** (decis de autor): după scandal, **la biserică, cât se roagă Roderick (10–14)**: „Unchiule... pot să stau puțin lângă tine? !”. Începutul e altfel după cum l-ai ajutat sau nu în scandal (cald: „mi-ai ținut spatele”; rece: „Ai venit să vezi dacă mai respir?”), apoi Vale îl întreabă cum a murit tata. Roderick nu poate răspunde; îi arată cioturile celor 23 de lumânări pe care le aprinde în fiecare zi pentru cei căzuți. Orcii i-au luat toată ceara.
- **Pasul 1:** faguri de ceară de la **fermier** (la câmpuri, 6–13). Fermierul i-a ascuns sub grajd; pentru cei căzuți îi dă pe degeaba (Tobin, fiul morarului, a arat cu el).
- **Pasul 2:** ceara la **Elian** („poți turna lumânări?”); Elian ține fagurii în palme și ceara parcă se înmoaie singură (încă un semn că e mag).
- **Pasul 3:** **a doua zi**, lumânările de la Elian (în aceeași zi: „Încă se răcesc în tipare”). Decis de autor: nu în timpul slujbei de dimineață (05–08), nici ceara, nici lumânările.
- **Pasul 4:** la Roderick (biserică sau tavernă), „Am adus lumânările, unchiule.” → „Diseară, la biserică.” (decis de autor).
- **Pasul 5:** **seara (18–23), când Vale ajunge la biserică, pornește direct prima imagine** (decis de autor) → în biserică, peste **2 imagini**: Roderick aprinde lumânările una câte una și spune numele fiecăruia (Hal, Tobin, frații Corwin, soldatul din camera de sus...); la ultima nu poate rosti numele. Vale o aprinde: „Edwin Lightfinder. Tata.” Apoi îi cere: „Arată-mi unde a căzut.” Roderick: nu pe la poartă, ci pe la gardul putred de la Marginea satului.
- **Recompensa:** încrederea lui Roderick +1. Vale rămâne în biserică.
- **Imaginile:** `events/roderick_lumanari_1.png` (biserica goală, noaptea: Roderick, în genunchi pe treapta de sus a altarului, aprinde lumânările în șir; Vale, jos pe culoar, ține mănunchiul), `events/roderick_lumanari_2.png` (mai aproape, aceeași biserică: 22 de flăcări pe treaptă, Roderick cu ultima lumânare în mâna care tremură, Vale îngenuncheat lângă el îi ia lumânarea). Obiecte: `items/ceara.png`, `items/lumanari.png`.
- Numele celor căzuți sunt ciorne (Claude).

**Cum verifici**
1. F2: „Toți cunoscuți de 3 zile”, apoi starea `scandal_taverna` = `ajutat` (sau `refuzat`, pentru celălalt început); Mergi la biserică (interior), ora 11:00 → Roderick → „Unchiule... pot să stau puțin lângă tine?” → „Ți le aduc eu.”
2. Fermierul (dacă nu e deblocat: starea `fermier_deblocat` = `da`), dimineața, la câmpuri → „Mai ai ceva ceară?”.
3. Elian → „Frate Elian, poți turna lumânări...” → încă o dată în aceeași zi („Încă se răcesc”) → „Ziua următoare” → „Sunt gata lumânările?”.
4. Roderick → „Am adus lumânările” → „Diseară, la biserică.” → seara (19:00), mergi de pe hartă la biserică → cele 2 imagini pornesc singure. Elian la 06:00: „Acum e slujba de dimineață”.

### ✅ Locul unde a căzut tata
- **Pornește** (decis de autor): după „Lumânările”, **doar după eliberarea lui Finn** (Vale trebuie să știe drumul spre Marginea satului), la Roderick: „Unchiule, știu drumul spre Marginea satului. !” → „Diseară, unchiule.”
- **Seara (19–23), Roderick îl așteaptă la Ieșirea de la Marginea satului**, la gardul putred (decis de autor: gardul e doar putred și jos, ușor de sărit; acolo nu păzesc orcii). Sprite: `sprites/soldat_iesirea.png`. „Sunt gata, unchiule.” → „Să mergem.”
- **Peste 7 imagini:** sar gardul; merg prin iarba uscată; câmpul bătăliei (lame ruginite, scuturi, steagul albastru cu rombul auriu) și **copacul mare, cu frunze aurii** (toamnă; lupta a fost primăvara, cu copacul înflorit); Roderick pune palma pe scoarță și îi arată creanga de jos, pe care se cățărau cei doi frați când erau copii (decis de autor: fără inscripții pe copac); Roderick, între rădăcini, povestește: linia s-a rupt, iar **Edwin i-a poruncit: „Fugi în sat, Roderick. Ai grijă de Miriam și de băiat.”** (decis de autor). A ascultat și de atunci se urăște pentru asta.
- **Alegerea ⚠️:** „Ai făcut ce ți-a cerut. Tata știa ce face, unchiule.” → **+1** (Roderick plânge, pentru prima oară) / „Trebuia să rămâi lângă el!” → fără punct (Roderick nu se apără). Apoi o **crenguță cu frunze aurii** cade la picioarele lui Vale; Roderick spune că Miriam iubea copacul și că l-a dus el pe Edwin în spate, până la cimitir. Se întorc pe întuneric (decis de autor: acasă e noapte, 23:30, ca somnul de după să aducă visul); acasă, Vale lasă crenguța pe masa din bucătărie.
- **După:** la primul somn peste noapte, **al doilea vis**; dimineața, mama găsește crenguța („Cina în familie”). Gardul de la Ieșire are alt gând după misiune.
- **Imaginile:** `events/roderick_locul_1.png` … `roderick_locul_7.png`.

**Cum verifici:** după „Lumânările” și eliberarea lui Finn: Roderick (biserică sau tavernă) → „Unchiule, știu drumul...” → „Diseară, unchiule.” → Mergi la Marginea satului → Ieșirea, ora 20:00 → Roderick → „Sunt gata” → imaginile → alegerea. Ca să vezi și cealaltă alegere: F2 → Misiune `roderick_locul` → Resetează.

### ✅ Al doilea vis (nu e misiune)
- **La primul somn peste noapte** după „Locul unde a căzut tata” (decis de autor), cu ceață: copacul **înflorit** și soldații satului, orcii care vin în fugă; lupta, cu **Edwin** în prim-plan; un orc mare îl lovește pe Edwin drept în piept și îi crapă platoșa pe mijloc (decis de autor: de aici, misiunea lui Bram cu platoșa); apoi Edwin căzut cu fața la pământ, cu ochii deschiși spre noi (imaginea se apropie încet, `apropiere`), din care ochiul lui trece în **ochiul uriaș al unui dragon** (`trecere`), care stă câteva secunde, fără text (`durata` la replică), apoi rămâne pentru câteva replici ale lui Vale (decis de autor: ca visul să nu se închidă prea repede): tata nu mai e, liniștea, ochiul care nu clipește, „Cine... ce ești?”. Vale se trezește ud de sudoare (`trezire`: imaginea și ceața dispar).
- **Imaginile:** `events/vis_2_1.png` … `vis_2_5.png` (4 = Edwin căzut, 5 = ochiul dragonului).
- **Filmulețul** (decis de autor: doar ultima secvență, după ce „Cadre multiple” n-a ieșit bine): `events/vis_2.mp4`, după „Nu... nu, nu, nu!”, în locul imaginilor 4 și 5: Edwin căzut, ochiul lui se închide încet, iar din întuneric, în același loc, se deschide ochiul dragonului (decis de autor). Dreamina, Seedance 2.0 Mini, „Primul și ultimul cadru”: `vis_2_4.png` → `vis_2_5.png`, 10 secunde. Ochiul mai stă 2,5 secunde, apoi rămâne pentru replicile lui Vale, apoi trezirea. Fără filmuleț, visul merge cu imaginile, ca înainte. Galeria: „Al doilea vis”. Edwin poartă echipamentul lui (`items/coif_tata.png`, `platosa_tata.png`, `jambiere_tata.png`, `sabia_tata.png`).

**Cum verifici:** după „Locul”, acasă, seara → „Dormi până dimineața”.

### ✅ Antrenamentul
- **Pornește singur**, la sfârșitul „Cinei în familie” (decis de autor: Roderick acceptă insistențele mamei). Pe harta Marginii apare **locul de antrenament** (piesă nouă, `map/piese/antrenament.png`, pe un loc liber ales de autor). Cât e misiunea, **Roderick e acolo 07–10** (orele în care „nu știe nimeni unde e”). Sprite: `sprites/soldat_antrenament.png`.
- **Pasul 1:** materialele pentru manechin: **6 lemne** (pădurea), **3 snopi de paie** (câte unul la fiecare arat, la câmpul de grâu, cât e misiunea; ales de Claude) și **o frânghie** (negustorul din piață, 4 monede). Cartea arată „(lemne 4/6, paie 1/3, frânghie 0/1)”.
- **Pasul 2** (cerut de autor): cu tot strâns, **i le arăți lui Roderick**, oriunde e (dimineața la locul de antrenament, 10–14 la biserică, apoi la tavernă): „Unchiule, am adunat tot ce trebuie pentru manechin!”. Le cercetează, zice că sunt bune și îi spune lui Vale să vină cu ele **dimineața, între 7 și 10, la locul de la Marginea**. Dacă îl găsești chiar acolo la ora aceea, vă apucați direct de construit (pasul 3 vine imediat).
- **Pasul 3:** la locul de antrenament, 7–10, „Am adus tot ce trebuie pentru manechin!” → construcția peste o imagine (3 ore, −20 stamina). De atunci manechinul rămâne acolo (piesa și imaginea zonei, varianta `_manechin`).
- **Pasul 4** (decis de autor): **cu o sabie de o mână la Vale** (în rucsac sau echipată; Bram vinde; fără ea Roderick îl trimite după una), **o dată pe zi, 3 zile**, „Să ne antrenăm, unchiule!” (odihnit: −20 stamina, 2 ore). **Mini-jocul lemnelor** peste imaginea în care Vale se pregătește să lovească (Roderick îl privește din spate); **la fiecare lovitură reușită se vede o clipă imaginea loviturii**, la ratare nu. Ziua se pune doar cu măcar 2 lovituri din 3 (ales de Claude); altfel Roderick îl trimite să revină mâine. Cu mini-jocurile oprite, cele două imagini una după alta, și ziua se pune. Inelul se mută pe manechin în editor: Aranjare → Ecrane → „Mini-joc: Antrenamentul cu Roderick”.
- **Recompensa:** încrederea lui Roderick +1 și **+2 la atac, pentru totdeauna** (`bonusVale` în `config.json`; ales de Claude, aprobat de autor).
- **Imaginile:** zona `locations/antrenament_zona.png` (+ `_manechin`), piesa `map/piese/antrenament.png` (+ `_noapte`, `_manechin`, `_manechin_noapte`), `events/antrenament_constructie.png`, `events/antrenament_pregatire.png`, `events/antrenament_lovitura.png`. Obiecte: `items/paie.png`, `items/franghie.png`. Sunetul loviturii: același ca lovitura de sabie din luptă (`lupta_sabie`, decis de autor).

**Cum verifici:** după cină, F2 → Mergi la Marginea satului → locul de antrenament, ora 08:00 → Roderick („Despre manechin...”). Obiect → Primește: 6 lemne, 1 frânghie; paiele: munca la arat (sau F2 → Obiect → paie de 3 ori) → la tavernă, după-amiaza, „Unchiule, am adunat tot” (te cheamă dimineața la loc) → a doua zi, 08:00, la locul de antrenament, „Am adus tot” → construcția → a doua zi „Să ne antrenăm” → încă două zile.

### ✅ Steagul satului (a Miriamei, +1 la Roderick)
- Detaliile, la Miriam. Pe scurt: Roderick și Vale aduc noaptea steagul satului de pe câmpul bătăliei, Miriam îl coase, iar Roderick îl primește de la ea și îl poartă de atunci; în lupta finală luptă cu el în mână (ceilalți lovesc cu +2 cât stă el în picioare).

### 📝 Solzii de dragon
- **După „Antrenamentul”** (decis de autor: după cele 4 misiuni, Roderick are destulă încredere ca să-i povestească de solzi), dincolo de gardul de la Marginea satului. **Arată spre portalul morții** (decis de autor): crăpătura din pământ de pe harta soldatului. Restul: de discutat.

---

## Agnes (hangița)

### ✅ Camera de sus (prima misiune a lui Agnes)
- **Pornește:** la câteva zile după prima discuție cu Agnes, în tavernă, cât e ea acolo: „Ce s-a întâmplat cu camera de sus? !”. Agnes povestește de fostul chiriaș, un soldat căzut în ziua în care a căzut și tatăl lui Vale. „Las-o pe mine, doamna Agnes. O golesc eu.”
- **Pasul 1:** ușa camerei de sus apare în zona tavernei (cât e misiunea în lucru, se intră fără chirie). Până strângi lucrurile, camera arată ca în `agnes_camera_1.png` (plină de lucrurile soldatului; decis de autor). Acolo, cât e taverna deschisă (9 dimineața – 2 noaptea): „Strânge lucrurile chiriașului” (1 oră și jumătate, −10 stamina), apoi scena, peste 3 imagini (decis de autor):
  1. camera cu lucrurile soldatului prin ea; Vale se apucă de strâns;
  2. camera curată, Vale aproape a terminat și vede ceva sub pat: un rucsac cu niște hârtii vechi (nu le citește);
  3. jos, în tavernă: Vale îi arată lui Agnes ce a găsit; ea nu înțelege ce sunt și îl trimite la Roderick. Vale rămâne în sala tavernei.
- **Hârtiile** (`hartii_vechi`) ajung la obiectele de poveste și rămân acolo. **Se citesc cu un clic** pe ele (inventar → „Obiecte de poveste” → Hârtii vechi → „Citește”), fiecare peste imaginea ei (decis de autor): (1) un solz desenat în creion, cu o mână pentru mărime, o lamă știrbită și nota „Nici sabia, nici focul nu l-au zgâriat.”; (2) semne ciudate copiate de pe o piatră înaltă și urme de gheare uriașe în stâncă; (3) o hartă: satul, zidul, un drum prin pădure, peste un râu, pe lângă niște ruine, până la o râpă însemnată cu X (propunerea lui Claude, de confirmat).
- **Recompensa:** camera de sus se poate închiria (5 monede). (Agnes n-are încredere, decis de autor.)
- **Imagini:** `events/agnes_camera_1.png` (camera cu lucrurile soldatului, fără Vale), `events/agnes_camera_2.png` (camera curată, Vale vede rucsacul sub pat), `events/agnes_camera_3.png` (jos, la tejghea, Agnes se uită la hârtii), `events/hartie_1.png`, `hartie_2.png`, `hartie_3.png` (fiecare hârtie de aproape, la citit).

**Cum verifici**
1. F2 → „Toți cunoscuți de 3 zile”. Timp 10:00, sala tavernei, vorbește cu Agnes → „Ce s-a întâmplat cu camera de sus?” → „Las-o pe mine”.
2. Înapoi la zona tavernei → ușa de sus → „Strânge lucrurile chiriașului” → cele 3 imagini; la final ești în sala tavernei, cu încredere +1 la Agnes și „Închiriază o cameră” la ea.
3. Inventar (I) → semnul „Obiecte de poveste” → Hârtii vechi → citești hârtiile.

### ✅ Berea
- **Pornește:** după „Camera de sus” (decis de autor: înaintea pivniței, ca jucătorul să aibă timp să-și facă rost de o armă și de poțiuni), la Agnes: „Taverna miroase a apă cu spumă... !”. Orcii i-au golit butoaiele; ar face bere nouă, dar îi trebuie **5 orz** și **2 miere**.
- **Orzul:** cât e misiunea în lucru, fiecare muncă la moară dă și **2 orz** (până la 5). Obiect de poveste, fără loc în rucsac, se numără.
- **Mierea:** la fermier, „Îmi vinzi două măsuri de miere? (10 monede)”. Cu fermierul se poate vorbi abia după prima patrulă de orci de pe câmpuri; cât e misiunea berii în lucru, patrula vine sigur la prima intrare pe câmpuri, între 06 și 13, cât e și fermierul acolo (din ziua 3).
- **Predarea:** la Agnes, „Am adus orzul și mierea!” → scena peste 2 imagini: fac bere în pivniță toată după-amiaza, apoi seara (19:00) taverna e plină și Agnes îi dă prima cană.
- **Recompensa:** o bere. (Agnes n-are încredere, decis de autor.)
- **Imagini:** `events/agnes_bere_1.png` (Agnes și Vale fac bere în pivniță), `agnes_bere_2.png` (seara, taverna plină și veselă); iconițele `items/orz.png` și `items/miere.png`.

**Cum verifici:** după „Camera de sus”, la Agnes → „apă cu spumă” → „Ți le aduc eu”. Moara de 3 ori (2+2+1 orz), fermierul (6–13, la câmpuri) → miere, apoi Agnes → „Am adus orzul și mierea!”.

### ✅ Pivnița
- **Pornește:** după „Berea”, la Agnes, în tavernă, **doar 09–11**, cât taverna e încă goală (decis de autor): „Doamna Agnes, sunteți albă ca varul... !”. A auzit zgârieturi în pivniță, la butoaiele cu berea nouă (șobolanii au venit după ea), a deschis ușa, ceva mare s-a mișcat în întuneric și a trântit-o. „Cobor eu să văd ce e acolo.”
- **Pivnița** e un loc nou (`taverna/pivnita`), cu ușa doar din sala tavernei; apare cu misiunea și rămâne deschisă după ea.
- **Muzica** (decis de autor): fără melodie specială; în pivniță se aude muzica tavernei de sus, înfundată.
- **La intrare** (cât e misiunea în lucru), peste 2 imagini: Vale coboară cu torța, apoi lumina îi arată pe cei 3 șobolani. **Șobolanii vorbesc** (decis de autor): îi spun despre o teroare care se apropie, de partea căreia stă clanul lor (morții care nu mai stau în morminte; sună a bazaconii), și că trebuie să se gândească bine de partea cui stă. La a doua coborâre (după o înfrângere), doar câteva replici. Apoi **lupta**: doi șobolani cu gheare (în față) și unul care scuipă bale acide (în spate, de la distanță, **otrăvește**: 3 viață la fiecare tură a țintei, 3 ture, trece de armură).
- **Victorie:** peste 2 imagini: șobolanii răpuși; Vale nu găsește pe unde au intrat, nicio gaură (decis de autor: gaura a fost scoasă din imagini), își spune că au fost bazaconii și nu-i spune lui Agnes că vorbeau; sus, Agnes cu un făcăleț în mâini, ușurată. Încredere +1.
- **Înfrângere:** fără imagine, în sala tavernei: Vale urcă rănit (10 viață), Agnes se sperie și îl trimite să se lege la răni și să mănânce. **Fugă:** Vale urcă în sala tavernei, fără discuție. În ambele cazuri misiunea rămâne în lucru și poate coborî din nou (atunci șobolanii spun doar câteva replici).
- **Imagini:** `locations/taverna_pivnita.png` (pivnița), `locations/lupta_taverna_pivnita.png` (harta de luptă), `events/pivnita_1.png` (coborârea cu torța), `pivnita_2.png` (cei 3 șobolani), `pivnita_3.png` (după luptă), `pivnita_4.png` (sus, Agnes); pozele de luptă `combat/sobolan_gheare_*.png` și `combat/sobolan_scuipa_*.png` (câte 5); portretele `portraits/sobolan_gheare_<stare>.png` și `portraits/sobolan_scuipa_<stare>.png` (`normal`, `suparat`, `ranit`, `rade`; fața din `normal` apare și în medalionul din luptă).

**Cum verifici:** după „Berea”, la Agnes, între 9 și 11 → „sunteți albă ca varul” → „Cobor eu”. În sala tavernei, ușa „Pivnița” → coborârea → lupta → victoria.

### ✅ Cercurile butoaielor (+1 la Bram)
- **Pornește** (decis de autor): după „Pivnița” (ales de Claude: și după „Fierul lui Bram”, când e deschis magazinul lui), la Agnes: „Doamna Agnes, de ce miroase toată taverna a bere? !”. Berea nouă a fermentat prea tare și a sărit cercurile ruginite ale butoaielor.
- **De ce nu-l roagă ea pe Bram** (decis de autor: nu-i datorează nimic; motivul, ales de Claude): orcii îi numără fierul lui Bram și nu vrea să aibă el necazuri din cauza ei. În taină, Bram îi place (decis de autor).
- **Pasul 1:** la Bram, „Domnule Bram, Agnes are nevoie de cercuri noi pentru butoaie.” → Bram se încurcă (îi place de Agnes); fierul vechi nu-l numără orcii: îi trebuie cercurile vechi.
- **Pasul 2** (decis de autor): cercurile vechi le iei **din pivniță**, de lângă butoaie: zona „Cercurile vechi”, o desenezi tu în pivniță, la Aranjare (până atunci e un buton jos); apare după ce l-ai rugat pe Bram și dispare după ce le-ai luat. Vale se gândește puțin („s-au strâns singure”) și le ia pe umăr. La Agnes, „Unde sunt cercurile vechi, doamna Agnes?” te trimite în pivniță.
- **Pasul 3:** la Bram, „Uite cercurile vechi.” → le bate din nou; seara vine în pivniță.
- **Pasul 4:** la Agnes, „Despre diseară...”: să se ferească de ochii din sală și să vină **direct în pivniță, după ora 22** (decis de autor). Seara, după 22 (cât e taverna deschisă, până la 2), cobori în pivniță (sau ești deja acolo când trece de 22) → peste 2 imagini, Bram și Vale pun cercurile, iar Agnes îi aduce lui Bram prima cană din berea nouă. **Bram se înroșește** (portretul nou `fierar_inrosit.png`).
- **Recompensa:** încrederea lui Bram +1 (Agnes n-are încredere).
- **Imagini:** `events/cercuri_pivnita_1.png`, `cercuri_pivnita_2.png`, `items/cercuri_vechi.png`, `portraits/fierar_inrosit.png` (galeria: „Cercurile butoaielor”).

**Cum verifici:** după „Pivnița”, în tavernă → Agnes → „de ce miroase...” → Bram → pivnița, zona „Cercurile vechi” → Bram → seara, după 22, ușa „Pivnița”.

---

## Fermierul

### ✅ Patrula de orci (nu e misiune: deblocarea fermierului)
- **Până atunci,** nu se poate vorbi cu el.
- **Prima patrulă de orci pe câmpuri** vine sigur și devreme: din ziua 3, dimineața (06–13, cât e și fermierul acolo), 80% la fiecare intrare pe câmpuri.
- După ea (oricum ai ales), fermierul devine cel cu care poți vorbi.
- **Dacă te bați cu orcul și câștigi** (decis de autor): o imagine, `events/fermier_multumeste.png`, cu o discuție peste ea: fermierul îi mulțumește lui Vale, îi spune că poate veni la el oricând și că are stupi (de acolo e mierea pentru berea lui Agnes).
- Imaginea e cea de la patrula de orci de pe câmpuri, `events/orci_patrula_campuri.png`.
- Misiunile lui: ✅ „Fierul plugului” (mai jos); celelalte 💡 de discutat.

**Cum verifici**
1. Ziua 1 sau 2, ora 08–13, câmpuri: fermierul nu se poate apăsa.
2. Ziua 3, 06:00: de pe **hartă**, mergi la câmpuri (de câteva ori, dacă nu vine din prima): patrula de orci.
3. După alegere, fermierul se poate apăsa.

### ✅ Fierul plugului (+1 la Bram)
- **Pornește** (decis de autor): după „O zi la forjă” (Bram), fermierul apare cu un sprite nou, cu plugul rupt (`sprites/fermier_campuri_plug.png`), iar la câmp nu mai ară nimeni (gândul lui Vale la „Ară”). La fermier: „Ce s-a întâmplat cu plugul? !”.
  - **refuzi:** după 2 zile plugul e reparat; fermierul spune că a vorbit el cu Bram și s-a descurcat. Fără încredere la Bram (⚠️).
  - **accepți:** misiunea pornește.
- **Pasul 1:** la Bram, „Domnule Bram, poți repara plugul fermierului?” → îi trebuie **4 lemne, o frânghie și metal** (fierul lui îl numără orcii).
- **Pasul 2:** strângi lucrurile. De atunci, **toți** au întrebarea „De unde pot face rost de niște metal?” (decis de autor); doar **Finn** îl trimite la Jarek. Jarek vinde **fier vechi** (15 monede, decis de autor). Poți merge și direct la Jarek.
- **Pasul 3:** la Bram, „Am adus tot ce trebuie pentru plug.” → Bram repară plugul cu Vale, peste o imagine (2 ore, 15 stamina, ales de Claude).
- **Pasul 4:** la fermier, „Uite plugul, reparat de Bram!” → peste o imagine, fermierul ară din nou.
- **Recompensa:** încrederea lui Bram +1.
- **Imagini:** `sprites/fermier_campuri_plug.png`, `events/plug_bram.png`, `events/plug_fermier.png`, iconițele `items/fier_vechi.png` și `items/plugul_fermierului.png` (galeria: „Fierul plugului”).

**Cum verifici:** după „O zi la forjă”, dimineața, la câmpuri: fermierul cu plugul rupt → „Ce s-a întâmplat cu plugul?”. Încearcă „Ară” (gândul). Acceptă → Bram → întrebarea despre metal la câțiva (doar Finn zice de Jarek) → Jarek (18–02), fier vechi → Bram → fermierul. Pentru refuz: F2 → „Resetează”, refuză, apoi de două ori „Ziua următoare”.

---

## Finn (hoțul)

### ✅ Eliberarea
- **Pornește** (decis de autor): în piață, apeși pe Finn, legat la butuc; răspunde negustorul. „Pot să vorbesc cu el?” → discuția de la butuc, peste o imagine: Finn spune că a furat ca să-și hrănească **mama bolnavă și sora mică**; nimeni nu-l crede, dar Vale îl crede → misiunea pornește („Așteaptă-mă. Mă întorc cu banii.”).
- **Pasul:** negustorul cere 40 de monede (`TODO` suma); „Cât vrei ca să-l eliberezi?” apare abia după discuția cu Finn.
- **Eliberarea**, peste 3 imagini: Vale îl dezleagă de la butuc; Finn îl duce pe drumul din spatele gardurilor spre marginea satului (Vale îl știe de copil, dar de când au venit orcii n-a mai avut ce căuta pe acolo; decis de autor); casa lui Finn: sora îi sare în brațe, mama, bolnavă, în pat, îl cunoscuse pe tatăl lui Vale. La final Vale rămâne în casa lui Finn.
- **Recompensa:** încrederea lui Finn +1 și **drumul spre Marginea satului**, **a doua hartă** (decis de autor: ca cea a satului, cu mai puține locuri). Trecerea dintr-o hartă în alta e o zonă desenată în editor pe fiecare hartă (decis de autor: fără piesă separată); „Înapoi” de pe Marginea satului duce tot în sat.
- **Marginea satului** (`harti` în `locations.json`, zonele cu `"harta": "marginea"`):
  - **Casa lui Finn** (zona + interiorul): Finn, mama lui, **Marta**, și sora lui, **Lina** (decis de autor); noaptea casa e încuiată, dorm. **Cât e Marta bolnavă** (decis de autor), e desenată în imaginea casei, în pat (`casa_finn_interior_bolnava.png`, seara `_bolnava_seara.png`, cu focul aprins); apăsată (zona „Marta”, desenată în editor), Vale doar se gândește; după vindecare apare ca sprite și se vorbește cu ea. **Programul** (decis de autor): Finn 06–08 acasă, 08–13 la câmpuri (muncește cu ziua la fermier), 13–18 acasă, 18–23 plecat pe ascuns (lucrează pentru Jarek; Lina: „Finn a plecat cu treburi...”); Lina 06–10 acasă, 10–14 afară, în fața casei (se joacă), 14–18 la coliba Bătrânei Morwen (o ajută la plante), 18–23 acasă (cât e Marta bolnavă, cu alt sprite, `sora_finn_casa_finn_interior_mama_bolnava.png`, decis de autor: în pat stă mama ei). **Mama lui Finn e bolnava** din misiunea „Mama lui Finn” (decis de autor).
  - **Ieșirea** (fără piesă pe hartă, doar zonă desenată): poteca de lângă zid; deocamdată doar gândul lui Vale („...dar nu singur. Nu încă.”). O folosesc mai târziu misiunile lui Roderick.
  - **Contrabandistul, Jarek** (decis de autor): cocioaba lui (zona, cu ușa închisă și lacătul) e **încuiată** până când Finn îi dă lui Vale cheia (după „Mama lui Finn”). Înăuntru (`interior`), **scăunelul**: Vale stă și așteaptă **30 de minute** (contrabandistul se asigură că nu l-a urmărit nimeni), doar **18–02**; ziua, doar gândul lui Vale. Apoi apare contrabandistul (sprite în cocioabă) și discuția cu el pornește singură; rămâne acolo cât stă Vale în cocioabă (la plecare, data viitoare trebuie așteptat din nou). Marfa: unele lucruri pe bani, altele **doar la schimb** (decis de autor; `TODO` ce anume, ciornă de Claude: săgeți, arc, sabie mare pe bani; 3 blăni de lup → topor mare, 2 piei + 2 carne → poțiune de viață, 2 blăni → leac de otravă). Mai târziu poate avea și misiuni. **Finn lucrează în secret pentru el** (decis de autor).
  - **Cimitirul:** „Mormântul tatălui”, o scurtă scenă cu gândurile lui Vale, o dată pe zi (20 de minute).
  - **Coliba ierbăresei** (zona + interiorul): **Bătrâna Morwen** (decis de autor), 06–23; **nu vinde nimic** (decis de autor): „Schimburi” deschide schimburile, poțiunile și **leacul de otravă** din florile aduse de Vale; noaptea doarme.
- **Imagini:** `events/finn_butuc.png`, `finn_eliberat_1.png`, `finn_eliberat_2.png`, `finn_eliberat_3.png`; harta `map/marginea_harta.png` (+ `_noapte`); piesele `map/piese/casa_finn.png`, `contrabandist.png`, `cimitir.png`, `coliba.png` (+ `_noapte`); scenele `locations/casa_finn_zona.png`, `casa_finn_interior.png`, `casa_finn_interior_bolnava.png`, `casa_finn_interior_bolnava_seara.png`, `iesirea_zona.png`, `contrabandist_zona.png`, `contrabandist_interior.png`, `cimitir_zona.png`, `coliba_zona.png`, `coliba_interior.png` (zonele și cu `_noapte`); sprite-urile `sprites/hot_casa_finn_interior.png`, `hot_campuri.png`, `sora_finn_casa_finn.png`, `sora_finn_coliba_interior.png`, `mama_finn_casa_finn_interior.png`, `sora_finn_casa_finn_interior.png`, `contrabandist_contrabandist_interior.png`, `ierbareasa_coliba_interior.png`; portretele `portraits/mama_finn_*`, `sora_finn_*`, `contrabandist_*`, `ierbareasa_*`; schițele din carte `ui/carte_<id>.png`.

**Cum verifici:** în piață, ziua, cu 40 de monede: apasă pe Finn → „Pot să vorbesc cu el?” → discuția → „Așteaptă-mă”. Apasă din nou → „Cât vrei...” → „Plătesc” → cele 3 imagini → ești în casa lui Finn. Pe harta satului apare zona spre Marginea satului (desenată în editor; până atunci, un buton jos).

### ✅ Mâncarea
- **Pornește** (decis de autor: odată cu „Mama lui Finn”, imediat după eliberare): la Finn, acasă, „Când ați mâncat ultima oară ceva cald?” → „Atunci vin cu ele.”
- **Pașii:** 3 pâini (negustorul, Agnes), 2 bucăți de carne (vânătoare), apoi la Finn „Am adus pâine și carne!” → „Hai să gătim.”
- **Masa**, peste 2 imagini (decis de autor): Vale gătește carnea la ceaun, cu sora lui Finn la lingură; apoi mănâncă toți patru, mama mai greu, din pat. Trec 90 de minute; Vale se satură și el (foame +40).
- **Recompensa:** încrederea lui Finn +1. După ea, Finn și sora lui au replici noi în „Ce mai faci?”.
- **Imagini:** `events/finn_masa_1.png`, `finn_masa_2.png` (galeria: „Finn: mâncarea”).

**Cum verifici:** cu 3 pâini și 2 carne (F2 → Obiect), la Finn: „Când ați mâncat...” → „Atunci vin cu ele” → „Am adus pâine și carne!” → „Hai să gătim” → cele 2 imagini cu replicile → „Mâncarea” terminată, Finn +1.

### ✅ Mama lui Finn
- **Pornește** (decis de autor: misiunea lui Finn, în locul „Bolnavului” lui Elian): la Finn, „Mama ta... de cât timp e bolnavă?” → „Vorbesc eu cu el.”
- **Pasul 1:** la Elian (biserica, oricând e treaz), „Frate Elian, am nevoie de ajutorul tău.” Elian recunoaște boala și îi spune de **luminița-nopții** (ciornă de Claude: e numele popular al unei plante adevărate, care își deschide florile la apus): galbenă, mare cât o monedă, cu patru petale late ca niște inimioare, miros de lămâie.
- **Pasul 2:** 3 flori, **seara (18–23)**, în pădure: „Caută luminița-nopții (1 oră)”, mini-jocul culesului (13 plante: 4 luminițe, câte 3 din celelalte; zona plantelor se desenează în editor, la Aranjare → Ecrane → „Culesul”, ca la sunătoare). Apare de la discuția cu Elian și rămâne și după misiune (decis de autor: luminița intră în poțiunile Bătrânei Morwen); orice floare culeasă rămâne în rucsac. Indicația o dă Elian („Cum arăta luminița-nopții?”).
- **Pasul 3:** cu florile, **seara**, la Elian (pe scările bisericii): „Am adus luminița-nopții.” → „Hai la Finn.” (ziua, Elian îl trimite să vină după apus).
- **Vindecarea**, peste 4 imagini (decis de autor): Finn îi așteaptă pe Vale și Elian la capătul potecii și intră toți trei în casă; Elian face ceaiul la vatra lui Finn, cu Lina la ajutor; mama îl bea, Elian se roagă cu mâna pe fruntea ei (Vale crede o clipă că lumina lumânării s-a făcut mai albă, un mic semn pentru secretul lui Elian); afară, Finn îi spune că lucrează în secret pentru contrabandist și îi dă **cheia cocioabei**. Trec 2 ore; Vale rămâne afară, la casa lui Finn.
- **Recompensa:** încrederea lui Finn +1, a lui Elian +1 și cheia (`cheie_contrabandist`, la obiectele de poveste). Mama lui Finn are replici noi (s-a vindecat).
- **Imagini** (decis de autor: 4): `events/finn_vindecare_1.png` (cei trei ajung la casă, noaptea), `_2.png` (ceaiul), `_3.png` (Marta bea, Elian se roagă), `_4.png` (cheia, afară) (galeria: „Finn: mama”); planta `items/luminita_noptii.png`; imaginea culesului `locations/munca_luminita.png`; cheia `items/cheie_contrabandist.png`.

**Cum verifici:** pornește misiunea la Finn; la Elian, „Frate Elian, am nevoie...”; seara, în pădure, „Caută luminița-nopții” (sau F2 → Obiect: 3 Luminiță-nopții); seara la Elian, „Am adus luminița-nopții” → „Hai la Finn” → cele 3 imagini → cheia în inventar, la obiectele de poveste. Apoi, la Marginea satului, cocioaba se deschide; înăuntru, seara (18–02), „Scăunelul” → 30 de minute → contrabandistul și marfa lui.

### ✅ Lada colectorului
- **Pornește** (decis de autor): după „Mâncarea” și „Mama lui Finn”, la Finn: „Ce te frământă, Finn?” → „Sunt cu tine.” Colectorul ține banii taxei într-o ladă, la poartă; noaptea pleacă, paznicul doarme, rămâne doar un orc cu o torță.
- **Pasul:** după miezul nopții (23–03, ales de Claude), **Finn te așteaptă în fața casei lui, cu sacul** (decis de autor: sprite-ul `sprites/hot_casa_finn.png`, pe imaginea casei de afară); apeși pe el → „Să mergem.” În noaptea de după o încercare ratată îți spune „Mâine noapte”.
- **Imaginile** (decis de autor): (1) vă apropiați de poartă; (2), (3), (4) **furișatul**, din ascunzătoare în ascunzătoare, toate văzute încă din prima imagine (decis de autor): lemnele de lângă casă / căruța stricată, apoi butoaiele de lângă palisadă / căruța, apoi, din spatele butoaielor (orcul cu torța s-a dus la cel de la foc), pe după taraba cu lada, prin umbră / drept prin noroi, pe lângă căruță; pe fiecare imagine sunt două locuri, unul sigur, celălalt îl alertează pe orc (le desenezi tu în editor, la Aranjare → Ecrane → „Furișatul: Lada colectorului (1/2/3)”, zonele „Pe aici e sigur” și „Pe aici te vede orcul”; arată la fel, deci jucătorul alege după ce vede în imagine, de exemplu lumina torței); (5) Finn deschide lada și puneți totul în sac; (6) plecați cu sacul.
- **Greșit** la oricare pas: imaginea fugii (`finn_lada_esec.png`), orcul se uită din depărtare; încerci din nou abia noaptea următoare.
- **Recompensa:** încrederea lui Finn +1, 30 de monede (`TODO` echilibru) și **tot ce au luat orcii la pedepse** (afară de fierul lui Bram, care are drumul lui). Jumătate din bani îi împarte Finn oamenilor de la margine.
- Cu mini-jocurile oprite din Opțiuni, furișatul trece singur.
- **Imagini:** `events/finn_lada_1.png` … `finn_lada_6.png`, `finn_lada_esec.png` (galeria: „Finn: lada colectorului”).

**Cum verifici:** cu misiunea pornită, la 23:30, pe imaginea casei lui Finn → apasă pe Finn → „Să mergem.” Alege o dată locul greșit (vezi fuga; imediat după, Vale zice „Mâine noapte”), apoi în noaptea următoare pe cele sigure → +1, monedele și lucrurile confiscate.

### ✅⚠️ Ziua Linei (se poate rata)
- **Pornește** (ales de Claude): la o zi după „Mama lui Finn”, la Finn: „Ce-i cu tine, Finn? Pari cu gândul în altă parte. !”. **Peste 3 zile e ziua Linei** (decis de autor; face 8 ani, ciornă). În primăvară, înainte de orci, Finn a luat-o la piață, iar ea s-a uitat o zi întreagă la o panglică albastră. Finn vrea să-i dea panglica albastră de la negustor și un tort de la Agnes, dar a promis că nu mai fură și n-are bani. „Te ajut, Finn.” pornește misiunea; „N-am timp de așa ceva.” o **ratează** pe loc.
- **Panglica** (decis de autor: în piață nu se vorbește direct cu negustorul): de cum ai misiunea, **negustorul te oprește de fiecare dată când intri în piață** (ziua și seara), până cumperi panglica sau trece ziua Linei: „Aveți o panglică pentru o fetiță?” → 5 monede (ales de Claude) → „O iau.”, sau „Nu, mulțumesc.”, și te oprește data viitoare. După ziua Linei rămân doar sacii lui obișnuiți.
- **Tortul** (decis de autor), la Agnes: „Doamna Agnes, ați putea face un tort?”. Agnes e încântată și cere **2 măsuri de făină** (moara), **2 căni de lapte** (vacile) și **o măsură de miere** (fermierul, 5 monede). Cât e misiunea, munca la moară dă și 2 făină, iar mulsul 2 lapte (ales de Claude). Cu toate: „Am adus tot pentru tort.” → o oră → tortul. În seara zilei Linei, după 21:30, Agnes nu mai începe tortul („Până se coace un tort, fata doarme demult.”, ales de Claude).
- **Seara zilei** (decis de autor: în a treia zi de după discuție), **după 18 (până la 23), Finn te așteaptă în fața casei lui**, cu alt sprite: „Am tot, Finn. Panglica și tortul.” → „Intrăm.” → **peste 3 imagini**: Vale și Finn în fața ușii; înăuntru, Marta bucuroasă (știa de surpriză) și Lina, uimită; apoi toți patru la masă, Lina cu panglica în păr. Trec două ore; Vale iese în fața casei.
- **Ratată** dacă refuzi sau dacă trece seara zilei ei fără daruri: la Finn, „Finn... ziua Linei.” → „I-am cântat... Dar s-a uitat toată seara la ușă.”
- **Recompensa:** încrederea lui Finn **+1**.
- **Imagini:** `events/lina_ziua_1.png`, `_2.png`, `_3.png` (galeria: „Finn: ziua Linei”); sprite-ul `sprites/hot_casa_finn_ziua.png` (Finn în fața casei, cu mâinile goale); iconițele `items/panglica_lina.png`, `items/tort_lina.png`, `items/lapte.png`.

**Cum verifici**
1. Termină „Mama lui Finn”, apoi „Ziua următoare”. La Finn: „Ce-i cu tine, Finn?” → „Te ajut, Finn.”.
2. Intră în piață de pe hartă: te oprește negustorul → „Aveți o panglică...” → „O iau.”. Intră din nou: nu te mai oprește.
3. La Agnes: „Doamna Agnes, ați putea face un tort?” → F2 → Obiect: 2 Făină, 2 Lapte, 1 Miere → „Am adus tot pentru tort.”.
4. „Ziua următoare” de 3 ori, „Seară”, Marginea satului → casa lui Finn (afară) → Finn → „Am tot, Finn.” → „Intrăm.” → cele 3 imagini → +1.
5. Ratarea: refuză-o, sau lasă să treacă ziua și vorbește apoi cu Finn.

Din F2 → Misiuni, „Pornește” nu ajunge aici (și nici la „Datoria la Jarek”): zilele se numără de la discuția cu Finn, deci pornește-le din discuție.

### ✅⚠️ Datoria la Jarek (se poate rata)
- **Pornește** (ales de Claude): după „Lada colectorului” și după „Ziua Linei” (dusă la capăt de o zi, sau ratată), la Finn: „Finn, ce te apasă? !”. În noaptea în care l-a prins negustorul, Finn ducea în sac și 3 blăni de-ale lui Jarek, pe care negustorul le-a luat și le-a vândut (ales de Claude); acum Jarek vrea **3 blăni de lup** înapoi, **în 5 zile** (decis de autor; zile din calendar, cu tot cu a cincea noapte, până la 3 dimineața). „Te ajut. Aduc eu blănile.” pornește misiunea; „Descurcă-te singur, Finn.” o **ratează** pe loc.
- **Pasul 1:** cu 3 blăni de lup, la Finn: „Am blănile pentru Jarek.”.
- **Pasul 2** (decis de autor): **în fiecare noapte (23–03), Finn te așteaptă la Ieșire** (sprite nou, `sprites/hot_iesirea.png`, pe imaginea de noapte): „Să mergem.” → „Sar gardul.” → **peste 2 imagini**: sar gardul putred și, mai încolo, pe lângă gard, îi dau lui Jarek sacul. Trece o oră.
- **Ratată** dacă refuzi sau dacă trec cele 5 zile: la Finn, „Finn... ce ai pe față?”: buza spartă, un ochi vânăt. Fără blăni, Jarek a vândut datoria orcilor; cu blănile date, dar fără Vale la ieșire, Finn a dus singur sacul și l-au prins paznicii la gard (ales de Claude).
- **Recompensa:** încrederea lui Finn **+1**.
- **Imagini:** `events/datoria_jarek_1.png` (gardul, noaptea), `events/datoria_jarek_2.png` (Jarek, mai încolo, lângă gard) (galeria: „Finn: datoria la Jarek”); sprite-ul `sprites/hot_iesirea.png`.

**Cum verifici:** cu „Lada colectorului” și „Ziua Linei” gata, la Finn: „Finn, ce te apasă?” → „Te ajut.” → F2 → Obiect: 3 Blăni de lup → „Am blănile pentru Jarek.” → „Noapte” → Marginea satului → Ieșirea → Finn → „Să mergem.” → „Sar gardul.” → cele 2 imagini → +1.

### ✅ Noaptea de la cimitir (nu se ratează; după ea, al patrulea vis)
- **Pornește** (decis de autor: doar după „Camera de sus”, „Hârtiile soldatului” și „Pivnița”; ales de Claude: și după „Datoria la Jarek”), la Finn: „Ce-i cu Lina? Pare obosită. !”. Lina vede noaptea lumini la cimitir, iar Finn a găsit pământul răscolit pe mormintele celor 23. „La noapte mergem să vedem.” pornește misiunea; „Altă dată, Finn.” o lasă în meniu.
- **Noaptea** (după 23), când ajungi la cimitir, pornește singură (Finn e deja după gardul cimitirului), **peste 2 imagini**: luminițele Linei sunt felinarul unor șobolani ca cei din pivniță; în prima imagine se văd chiar **cei patru șobolani din luptă, cu spatele, săpând la mormintele celor 23** (decis de autor: doi cu gheare sapă, doi care scuipă bale în gropi): „Stăpânul-oaselor vrea morții, da-da!”; Finn îi aude și el vorbind și nu-i vine să creadă. A doua imagine: al treilea mormânt de la poartă, al lui Edwin, aproape dezgropat → „Sar peste gard.” → **lupta**: Vale și **Finn** (decis de autor: Finn luptă de data asta, cu un cuțit; poze de luptă noi) împotriva **acelorași patru șobolani**, doi cu gheare și doi care scuipă (decis de autor), pe harta de luptă nouă a cimitirului.
- **Lupta nu se poate pierde** (decis de autor): la înfrângere, Vale cade, iar **Finn se ridică în genunchi și aruncă în iarba uscată felinarul scăpat de un șobolan**; iarba ia foc și șobolanii fug (ales de Claude; o imagine în plus, doar atunci). Lui Finn îi spune Linei că erau felinarele paznicului de noapte. Apoi, la amândouă, pun pământul la loc, peste o imagine; Vale ajunge acasă, noaptea.
- **Recompensa:** încrederea lui Finn **+1**.
- **Al patrulea vis** (decis de autor), la somnul de după (ajunge o oră de somn noaptea, ales de Claude), cu ceață, **peste 6 imagini**: întâi cimitirul noaptea, în ceață, cu o lumină verde deasupra mormintelor (decis de autor, `vis_4_0`); apoi cei 23 se ridică din morminte ca fantome verzi, străvezii, cu armurile lovite în luptă (decis de autor), semi-transparente și putrezite, sinistre, care ies din morminte, cu ochii albi (decis de autor), cu Edwin în prim-plan, recunoscut după platoșa lui crăpată pe mijloc, și doar câțiva în spatele lui; Vale vrea să alerge la tatăl lui, dar nu se poate mișca, doar plutește în urma lor; pleacă spre nord, pe drumul de pe harta soldatului (râul, pădurea, poarta de piatră surpată), spre crăpătura din pământ, o prăpastie adâncă între stânci, ca pe hartă (decis de autor); un șir lung de stafii, cu Edwin ultimul, iar Vale plutește în urma lui; la intrare, **Edwin se întoarce**, cu jumătate de față întreagă și jumătate putrezită (decis de autor), și îi vorbește într-o limbă veche, pe care Vale n-a auzit-o niciodată, dar în vis o înțelege: „Încă nu, Vale. Dar te așteaptă.” (ciornă). Imaginile de la prăpastie (decis de autor): în a treia, Edwin stă cu spatele la margine; în a patra, întors spre Vale, cu fața pe jumătate putrezită, îi vorbește; în a cincea plutește în prăpastie, cu spatele la Vale; filmulețul (opțional, ca la celelalte vise) stă între a patra și a cincea: Edwin se întoarce spre prăpastie și coboară plutind în ea (decis de autor).
- **Imagini:** `events/finn_cimitir_1.png` (printre scândurile gardului, cei 4 șobolani cu spatele, săpând la morminte), `_2.png` (mormântul lui Edwin, aproape dezgropat), `_3.png` (pământul pus la loc), `events/finn_cimitir_foc.png` (doar la înfrângere: Finn în genunchi, iarba aprinsă de felinar) (galeria: „Finn: noaptea de la cimitir”); harta de luptă `locations/lupta_cimitir.png`; pozele de luptă ale lui Finn `combat/hot_idle/atac/aparare/lovit/cazut.png` (galeria: „Luptă”); visul `events/vis_4_0.png`, `vis_4_1.png`, `_2.png`, `_3.png`, `_4.png`, `_5.png`, `events/vis_4.mp4` (galeria: „Al patrulea vis”).

**Cum verifici:** F2 → misiunile „Camera de sus”, „Hârtiile soldatului”, „Pivnița” terminate (sau joacă-le) și „Datoria la Jarek” gata. La Finn: „Ce-i cu Lina?” → „La noapte mergem să vedem.” → „Noapte” → Marginea satului → Cimitirul → imaginile → „Sar peste gard.” → lupta (câștigată sau pierdută) → acasă. „Dormi până dimineața” → al patrulea vis. (Visul se poate porni și din F2 → Eveniment → `vis_4`.)

### ✅ Zarurile orcilor (fără încredere)
- **Pornește** (decis de autor): de la **4/10 încredere** cu Finn, când e acasă: „Ce meșterești acolo, Finn? !” → „Arată-mi.” → **peste o imagine**, Finn îi arată trucul lui Jarek: la zaruri, cu soarele în spate, te uiți în lama toporului lustruit de pe masă și vezi ce e sub paharul unui orc. **O dată la fiecare partidă** (o a doua oară te-ar prinde). Nu dă încredere (decis de autor).
- **Imagine:** `events/finn_zaruri.png` (galeria: „Finn: zarurile orcilor”).

**Cum verifici:** cu încrederea lui Finn 4, acasă la el, ziua: „Ce meșterești acolo, Finn?” → „Arată-mi.” → la zaruri, la poartă (14–18), apare puterea. Pornește-o din discuție, nu din F2 (puterea vine din imaginea de la Finn).

### ✅ Cuștile vânătorilor (+1 și la Kaia; nu se ratează)
- **Pornește** (decis de autor): de la **5/10 încredere** cu Finn și după „Baza” (Kaia), acasă la Finn (06–08 sau 13–18): „Finn... pot să-ți spun ceva? Dar încet. !”. **Acasă, Finn află doar o parte** (decis de autor), în șoaptă, cât Marta coase: „Kaia și cu mine punem ceva la cale. Nu aici. Vino diseară cu mine la locul de campare.” → „Diseară, după șase.” (sau „Mai bine altă dată.”, iar oferta rămâne).
- **Seara (18–23), la locul de campare** (decis de autor), când ajungi acolo pornește direct (Finn vine cu tine), **peste 2 imagini**: (1) Finn încremenit, cu Ember care îl adulmecă, iar Kaia râde („Ce-ai adus, Vale? Un iepure?”); îi spun de revoltă; Finn: „Eu deschid orice lacăt.” (2) La foc, Kaia povestește de **tabăra orcilor vânători**, la o oră spre răsărit, la marginea pădurii, lângă drumul mare: țin în cuști **o lupoaică și puii ei** (ales de Claude: doi pui), ca s-o crească pentru asediu, ca pe bestiile din convoi. Cinci orci: trei dorm la foc, doi stau de pază, cu topoare de aruncat. „Mâine noapte e lună nouă.”
- **Noaptea de după** (decis de autor; ales de Claude: din noaptea de după, **în fiecare noapte, 23–03**, Kaia și Finn te așteaptă la locul de campare, până vii), pornește direct: pe furiș, **ca la lada colectorului**, peste **3 imagini, cu câte două locuri desenate de tine** (unul sigur, unul unde te văd orcii; Aranjare → Ecrane → „Furișatul: Cuștile vânătorilor (1–3)”). Ember rămâne la tabără. Drumul ține 2 ore și ia 20 stamina. Dacă pagina se reîncarcă în timpul furișatului, furișatul o ia de la capăt (noaptea, la locul de campare), ca misiunea să nu se blocheze.
  - **Reușit:** Finn deschide lacătele, peste o imagine (cuștile deschise, lupoaica iese cu un pui în gură); lupoaica și puii fug în pădure.
  - **Prinși** (o alegere greșită): orcii dau alarma, peste o imagine → **lupta**: Vale, Finn și **Kaia pe jos** (decis de autor: pozele ei din Groapă, fără Ember) împotriva celor **5 orci** (ales de Claude: 3 orci și 2 aruncători), fără fugă, pe harta de luptă nouă a taberei. **Câștigată:** cuștile se deschid (aceeași imagine ca la reușită). **Pierdută** (decis de autor): o imagine cu cei trei care fug; cuștile rămân închise; **a doua zi**, Finn: „A fost o încercare bună. Dar nu putem risca soarta satului pentru niște animale.”, iar Kaia, foarte supărată: „Finn zice că erau doar niște animale. Pentru el, poate. Pentru mine, ea era pădurea asta.”
  - Când lupoaica scapă, a doua zi Finn și Kaia au și ei câte o replică (Kaia a găsit urmele lor lângă pârâu).
- **Recompensa** (decis de autor): încrederea lui Finn **+1** și a Kaiei **+1**, **oricum s-ar termina** („am făcut tot ce s-a putut”).
- **Imagini:** `events/finn_custi_1.png` (Finn și Ember, Kaia râde), `_2.png` (la foc, Kaia desenează tabăra vânătorilor), `_3.png`, `_4.png`, `_5.png` (furișatul, cu locurile de desenat), `_6.png` (cuștile deschise), `events/finn_custi_alarma.png` (prinși), `events/finn_custi_fuga.png` (fuga, doar la înfrângere) (galeria: „Finn: cuștile vânătorilor”); harta de luptă `locations/lupta_tabara_vanatori.png` (galeria: „Hărți de luptă”; locurile luptătorilor, la Aranjare → Hărți de luptă → „Tabăra vânătorilor”).

**Cum verifici:** cu „Baza” gata și încrederea lui Finn 5, acasă la Finn (14:00): „Finn... pot să-ți spun ceva?” → „Diseară, după șase.” → ora 19:00 → Pădure → Locul de campare → cele 2 imagini. Apoi „Ziua următoare” și ora 23:00 → Locul de campare → furișatul (cu mini-jocurile oprite din Opțiuni, trece singur; cu ele pornite și zonele nedesenate, apar două butoane: „Pe aici te vede orcul” duce la luptă).

### ✅⚠️ Ultima treabă pentru Jarek (se poate rata)
- **Pornește** (ales de Claude: după „Noaptea de la cimitir” și după „Datoria la Jarek”, dusă la capăt sau ratată), acasă la Finn: „Ce-i hârtia aia, Finn? !” → „(Mă așez lângă el.)” → **peste o imagine** (decis de autor): Finn, la masă, cu un bilet de la Jarek, lăsat sub piatra de la gard: Jarek vrea ca Finn să-i golească negustorului **caseta cu bani** de sub tarabă, „ultima treabă”. Alegi:
  - **„Nu, Finn. Ai promis.”** (a promis că nu mai fură, la „Ziua Linei”): în noaptea aceea (sau în oricare de după), după 23, Finn te așteaptă în fața casei: „Să mergem.” → **peste o imagine**, la cocioaba lui Jarek, Finn își pune sculele pe masă: „Am terminat.” Jarek: „Bine. Măcar ai un prieten care te ține drept. Eu n-am avut.” și îi lasă sculele („Un lacăt deschis nu e întotdeauna un furt.”). **+1**. De atunci, seara (18–23) Finn stă acasă, nu mai lucrează pentru Jarek (ales de Claude).
  - **„Avem nevoie de bani.”** (decis de autor): a doua zi, Finn îi dă lui Vale **15 monede**, rușinat: „Lina m-a întrebat de unde sunt banii.” Fără +1; misiunea e **ratată**.
- **Imagini:** `events/finn_jarek_1.png` (Finn cu biletul), `events/finn_jarek_2.png` (la Jarek, sculele pe masă) (galeria: „Finn: ultima treabă pentru Jarek”).

**Cum verifici:** cu „Noaptea de la cimitir” și „Datoria la Jarek” gata, acasă la Finn: „Ce-i hârtia aia, Finn?” → imaginea → „Nu, Finn. Ai promis.” → ora 23:30 → Marginea satului → Casa lui Finn (afară) → Finn → „Să mergem.” → imaginea → +1. Cealaltă alegere: F2 → Misiune „Ultima treabă pentru Jarek” → „Resetează” → „Avem nevoie de bani.” → „Ziua următoare” → la Finn: cele 15 monede.

### ✅ Prietenii lui Finn (de la 8/10; pentru lupta finală)
- **Pornește** (decis de autor): de la **8/10 încredere** cu Finn (ales de Claude: și după „Cuștile vânătorilor”, ca Finn să știe de revoltă, și cu Groapa deschisă, de unde vine dintele pentru Wil): „Finn, pari că pui ceva la cale. !” → Finn are **trei prieteni din copilărie**, de la Marginea satului, puțin mai mici decât el, care ar ajuta în ziua cea mare, dar doar dacă primește fiecare ceva → „Vorbește cu ei.” → **peste o imagine**, după un șopron, cei trei își spun ce vor (numele și ce cer: ciorne de Claude; fără portrete, ca sătenii):
  - **Tobin:** 3 bucăți de **carne friptă** și 3 **pâini**, pentru frații lui mai mici;
  - **Ned:** un **arc**, cu 3 săgeți (decis de autor: ori îi duci **Kaiei 4 lemne și o sfoară** și ea îl face peste noapte, „Kaia, ai putea face un arc?”, ori **cumperi un arc** de la Jarek și 3 săgeți);
  - **Wil:** vrea să vadă că Vale nu e doar gură: un **dinte de orc** (decis de autor), luat după ce **câștigi o luptă în Groapă**, după ce ai primit misiunea (ales de Claude: oricare nivel; nu în seara în care câștigi verigheta mamei).
  Le duci lui Finn, în orice ordine (? auriu pe el cât ai ceva de predat); în carte se bifează pe rând. Cât face Kaia arcul, nu se poate da lui Ned unul cumpărat.
- **La sfârșit**, „Ce zic prietenii tăi, Finn?” → **peste o imagine**, cei trei sunt de acord, iar Finn îi dă lui Vale **fluierul** (decis de autor), cioplit dintr-un os de gâscă: „Când o să vină prea mulți deodată, suflă în el. O singură dată. Și noi o să fim acolo.” **+1**.
- **Fluierul în lupta finală** (decis de autor): la „Obiect”, doar Vale, **o singură dată**, pe valul ales de tine: peste luptă apare **imaginea cu cei patru băieți** (Finn și ceilalți trei, în haine rupte, cu glugi, trăgând cu arcul), cu gândurile lui Vale, apoi **toți orcii din valul acela sunt răniți cu 50%** (ales de Claude: jumătate din viața lor întreagă, trecând de armură; cine era deja slăbit poate cădea; TODO echilibru). Se încearcă din F2 → Testare luptă → „Ca în lupta finală” (ca toiagul).
- **Imagini:** `events/finn_prieteni_1.png` (cei trei băieți, cu Finn), `events/finn_prieteni_2.png` (Finn îi dă fluierul) (galeria: „Finn: prietenii lui Finn”); `events/fluier_ambuscada.png` (cei patru, în lupta finală; galeria: „Lupta finală: fluierul”); iconițele `items/arc_ned.png`, `items/dinte_orc.png`, `items/fluier.png`. Sunetul `fluier` (efect).

**Cum verifici:** cu încrederea lui Finn 8 și „Cuștile vânătorilor” gata: „Finn, pari că pui ceva la cale.” → „Vorbește cu ei.” → imaginea. F2 → Obiect: 3 Carne friptă și 3 Pâini → la Finn, „Am carnea și pâinea pentru Tobin.”. La Kaia: „Kaia, ai putea face un arc?” → 4 Lemne și o Sfoară → „Am adus lemnele...” → „Ziua următoare” → „E gata arcul?” → la Finn. Seara, la Groapă, o victorie → dintele → la Finn. Apoi „Ce zic prietenii tăi, Finn?” → fluierul. În luptă: F2 → Testare luptă → bifa „Ca în lupta finală” → Obiect → Fluierul lui Finn.

---

## Groapa (arena orcilor)

### ✅ Groapa
- **Ce e** (decis de autor): arena săpată de orci dincolo de poartă (decis de autor), în tabăra lor de lângă zid, din lemnele satului, ca orcii din convoaie să-și treacă serile. Seara, la torțe, oamenii coboară să se bată cu orcii, iar ceilalți pariază; sătenii se uită de după gard.
- **Cum intri:** apeși pe **poartă**, pe imaginea zonei porții (zona „Groapa”, o desenezi tu în editor, la Aranjare → Poarta; până atunci e un buton jos). Apare după ce colectorul îți spune de ea („Inelul mamei”) și rămâne. **Doar seara (18–23)** și **o luptă pe seară** (altfel, gândul lui Vale). **La fiecare intrare**, Vale se gândește întâi la ceva, peste imaginea Groapei (decis de autor: 3 gânduri, de câte 3 replici, la întâmplare, niciodată același de două ori la rând: noroiul de pe fund, orcii care pun pariuri, sătenii de după parii porții), apoi vine panoul.
- **Cine vine cu tine** (decis de autor): fiecare aliat care a spus da are fața într-un pătrățel sub butonul lui Vale, din stânga-sus (numele la hover); „×” din colțul pătrățelului îl scoate, iar ca să vină din nou îl întrebi din nou: în meniul lui apare o întrebare scurtă („Domnule Bram, mai veniți cu mine în Groapă?”, „Unchiule, mai vii cu mine în Groapă?”, „Frate Elian, mai vii cu mine în Groapă?”, „Kaia, mai lupți cu mine în Groapă?”), cu un răspuns scurt, și pătrățelul revine.
- **Nivelurile:** **ușor** = 1 val (doi orci), **mediu** = 2 valuri (orc + Aruncătorul, apoi Zdrobitorul + Toboșarul), **greu** = 3 valuri, cu **Campionul Groapei** la sfârșit. Între valuri aliații nu se refac. Fără fugă.
- **Aliații:** cel mult **2**, dintre cei cu **încredere de cel puțin 4** care **au spus da** (decis de autor): după ce se deschide Groapa, fiecare primește în meniu întrebarea lui („Domnule Bram... ați auzit de Groapa de la poartă?”, „Unchiule... vii cu mine în Groapa orcilor?”, „Frate Elian, ai veni cu mine în Groapă?”, „Kaia... ai lupta cu mine în Groapa orcilor?”). Cine doarme sau nu e prin preajmă (Bram după 22, Kaia cât lipsește) apare stins în panou. **Kaia** vine pe jos, în capa cusută de mama („Capa Kaiei”), fără Ember. **Elian** vine ca vraci: doar vindecarea; celelalte puteri sunt stinse („Nu în fața lor, Vale.”).
- **Orcii:** paznicul (topor), **Zdrobitorul** (măciucă, multă armură), **Aruncătorul** (topoare aruncate, de la distanță), **Toboșarul** (decis de autor: e gras și nu atacă niciodată; la fiecare tură bate toba pentru un orc anume, întâi pentru cel care lovește cel mai tare: orcul acela pulsează roșu, primește „+3 atac” și lovește mai tare cât stă toboșarul în picioare, cu o strălucire roșiatică; rămas singur, se prăbușește: „Gâfâie, se împiedică de tobă și se prăbușește.”), **Campionul** (Zdrobitorul, mai mare și mai întunecat).
- **Câștigul** (TODO echilibru, ales de Claude): 10 / 25 / 50 de monede și reputație +1 / +2 / +3; la prima victorie pe fiecare nivel, o răsplată: poțiunea de viață / pielea de piatră / furia și încă o poțiune de viață. **Înfrângerea:** te trezești în noroi, lângă Groapă, cu puțină viață.
- **Imagini:** locul `locations/poarta_arena.png` (ce vezi când intri; peste ea, panoul), harta de luptă `locations/lupta_poarta_arena.png`; galeria, la grupul **„Groapa (arena)”**: Kaia pe jos (`combat/vanatoare_pejos_*.png`), Zdrobitorul, Aruncătorul, Toboșarul (câte 5 poze de luptă și un portret pentru medalion), toporul aruncat (`combat/topor_aruncat.png`). Sunetele: `toba`, `lupta_val` (cornul unui val nou); fără sunet la intrare (decis de autor: nu s-a găsit unul potrivit).

**Cum verifici:** F2: starea `groapa` = `deschisa`, încrederea cu Bram / Kaia / Elian pe 4 sau mai mult, ora 19:00, „Mergi la” Poarta → apasă pe Groapa → alege nivelul și aliații → lupta. A doua oară în aceeași seară: „Pentru azi am luptat destul.” O luptă din Groapă se poate porni și din F2 → Luptă (`Groapa · Mediu` etc.), cu grupul obișnuit.

---

## Masa regelui (jocul din tavernă)

### ✅ Masa regelui (nu e misiune)
- **Ce e** (decis de autor): Fetlar Hnefatafl, cu **Bătrânul Hagen** (ciornă), afară, la o masă în fața tavernei, **11–22** (decis de autor: înăuntru n-avea loc). Regele, cu cei 12 apărători, trebuie să scape într-un colț; cei 24 de atacatori trebuie să-l prindă. Regulile întregi: CLAUDE.md, secțiunea 17, și „? Regulile”, în joc.
- **Cum pornește:** apeși pe bătrân → prima dată se prezintă și explică jocul; apoi, de fiecare dată, una din 3 discuții scurte → „Ei, spune: cât de tare să joc?” → **Ușor / Mediu / Greu** (sau „Altă dată.”) → alegi tabăra (regele sau atacatorii) și miza (5 / 10 / 20).
- **Câștigul** (ales de Claude, TODO echilibru): miza înapoi, plus jumătate (Ușor), cât ai pus (Mediu) sau de două ori cât ai pus (Greu). Remiză: banii înapoi. Pierdere sau „Renunț”: pierzi miza. O partidă ține o oră. După o victorie, în ziua aceea: „Pentru azi ajunge, băiete... Vino mâine.” Cu mai puțin de o oră până pleacă (21–22) nu mai începe o partidă (ales de Claude).
- **Imagini:** masa de sub tablă, văzută de sus (`locations/tafl_masa.png`, opțională: fără ea se vede taverna întunecată), tabla și cele 3 piese, plus al doilea set, cu tabla și piesele lui (`_2`, ales din panoul „?”, „Tabla și piesele: Setul 1 / Setul 2”; tabla 2 și căsuțele ei se aranjează la Aranjare → Ecrane → „Masa regelui: setul 2 (tabla 2)”) (galeria „Masa regelui (tavernă)”), portretele bătrânului (`normal`, `zambet`), sprite-ul lui pe imaginea tavernei (`sprites/batran_taverna.png`). Pe ecranul jocului nu e portretul bătrânului (decis de autor): ce spune el stă într-un rând deasupra tablei, iar panoul partidei se deschide din „?”, stânga-sus. Tabla, căsuțele și rândul cu ce spune bătrânul se aranjează la Aranjare → Ecrane → „Masa regelui (tavernă)”; căsuțele (grila) se trag exact peste pătratele desenate pe tablă.

**Cum verifici:** ora 15:00 → Taverna (afară, pe imaginea tavernei) → bătrânul → discuția → un nivel → tabăra și miza → joacă (sau „Renunț”). Viteza animațiilor (×1 / ×2 / ×4) grăbește și gânditul bătrânului.

---

## Dragonii

- Doar indicii în Actul 1. Prima apariție: **hârtiile din camera de la tavernă** (misiunea lui Agnes), apoi căutarea solzilor cu Roderick, spre **portalul morții**. Lumea mare: `docs/lore.md`.
- 📝 **Semne pe parcurs** (decis de autor): după anumite misiuni, data următoare când doarme, Vale visează ceva; uneori simte ceva ciudat. Nu prin tigrul Kaiei (Vale și Kaia se cunosc de mult).
- 📝 **Finalul Actului 1** (decis de autor): după ce satul e eliberat, Vale împlinește 26 de ani. În noaptea aceea se aude un răget în depărtare sau apare un mag străin. Cliffhanger pentru jocul mare.
