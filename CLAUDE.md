# Fangs&Honor: Recuperarea satului (demo). Instrucțiuni pentru Claude Code

Citește acest fișier integral înainte de orice. E sursa de adevăr pentru proiect. Dacă ceva din cod îl contrazice, întreabă înainte să schimbi.

## 1. Ce construim

Un joc single-player în browser, de tip **visual novel cu elemente de RPG, management și luptă pe ture**. E făcut pentru sora autorului (citește mult, iubește dragonii) și e **o surpriză**: nu se publică nimic public până nu e gata.

Unele personaje vin dintr-un joc mai vechi al autorului, *Fangs&Honor*.

Demo-ul are un singur sat uman ocupat de orci. Jucătorul e Vale Lightfinder: are grijă de o casă dărăpănată, trece timpul prin acțiuni, are nevoi (foame, sete), plătește o taxă săptămânală orcilor, vorbește cu oameni, își recrutează aliați, luptă și eliberează satul.

Nu e un joc 3D și personajele nu se plimbă. E un joc de **scene ilustrate, cu zone clicabile, dialoguri, evenimente și lupte pe ture**. Toată arta e imagini statice generate de autor cu AI (stil semi-realist, cinematic).

Dragonii, magia (în afară de abilitățile preotului), harta mare și fortăreața **nu** fac parte din demo. Dragonii apar doar ca **indicii**: în prolog sau într-o poveste spusă la tavernă (conținut `TODO`).

## 2. Cum lucrezi cu mine

- Autorul știe web, dar **nu știe unelte de build (Vite, Node, npm) și nici administrare de server**. Pentru astea dă **pași exacți, de copiat**, nu presupune nimic. În rest, răspunsuri scurte și directe.
- **Comentariile din cod sunt în română** și explică *de ce* se face un lucru, nu *ce* face.
- **Bun-făcut bate perfect.** Un sistem clar și funcțional, livrat, e mai bun decât unul perfect, dar întârziat.
- Construiește pe **etape jucabile** (secțiunea 17). Nu adăuga sisteme din etape viitoare.
- Nu inventa conținut de poveste (nume, recompense, replici importante). Pune valori temporare marcate `TODO` și spune-mi ce ai pus (secțiunea 18).
- **Împărțirea muncii:** autorul face tot ce e vizual, în editor (secțiunea 4), și scrie povestea, dialogurile și evenimentele **în cuvinte, liber**. Claude le transformă în date de joc (JSON), inclusiv condițiile și efectele.
- La fiecare etapă: spune ce ai făcut, cum o rulez și ce urmează. Fă commit-uri mici, cu mesaje clare.
- Întreabă doar când ești blocat. Altfel alege varianta simplă și notează alegerea.

## 3. Stack și reguli tehnice

- **HTML + JavaScript (ES modules) + CSS.** Fără motor de joc, fără framework obligatoriu. TypeScript doar dacă cer eu.
- **Vite** pentru dezvoltare și build. Autorul nu lucrează direct cu el.
- **Jocul în sine e doar fișiere statice**, fără backend, conturi sau API-uri externe, și merge **100% offline**. Backend-ul există doar pentru editor (secțiunea 4).
- **Conținutul stă în JSON** (secțiunea 5). Codul doar îl citește. Datele se încarcă prin `import` / `import.meta.glob`, nu prin `fetch`, ca să meargă și sub `file://` în versiunea `.exe`.
- **Scena e fixă 16:9**, proiectată la 1920×1080 și scalată să încapă în fereastră, cu bare negre dacă raportul diferă. Doar orizontal. Toate pozițiile din JSON sunt **normalizate 0-1** față de scenă (x, y, scară), nu în pixeli.
- **Salvare** în `localStorage`, cu câmp `versiuneSalvare`, plus **export/import** de fișier JSON ca backup. **La un refresh al paginii** (decis de autor: o misiune nu are voie să se blocheze), salvarea ține minte ce era în curs (`reluare`, `luptaInCurs`): discuția continuă de la replica la care rămăsese (cu imaginea de sub ea), un eveniment oprit în timpul imaginilor se arată din nou, iar o luptă începută pornește de la capăt. Orice schimbare de structură a salvării trebuie să aibă migrare sau să dea un mesaj clar.
- **Imagini: autorul lucrează doar cu PNG.** La build, un script convertește automat totul în WebP. Autorul nu atinge niciodată fișiere WebP. **Preîncarcă scenele vecine** în fundal, ca navigarea să fie instantanee.
- **Toate imaginile se încarcă la pornire** (decis de autor; **oprit deocamdată**, se pornește la final cu `incarcareLaPornire: true` în `config.json`), cu un ecran „Se pregătesc imaginile... %”, ca trecerile (noaptea pe hartă, evenimentele) să nu se vadă încărcându-se. **Între două imagini** (evenimente, imaginile din spatele replicilor) cea veche rămâne până se vede cea nouă, iar replicile și portretele apar abia odată cu imaginea.
- **Imaginile lipsă nu blochează nimic.** Dacă un fișier lipsește, afișează automat un **placeholder** (dreptunghi colorat cu numele fișierului). La interfață, se folosește stilul CSS implicit (secțiunea 9).
- Versiunea finală se împachetează cu **Electron** într-un `.exe` pentru Windows, offline. Păstrează codul compatibil: căi relative, `base: './'` în Vite, fără `fetch` către alte domenii. Asta se face la final.
- Include un **mod debug** (tastă sau panou): sari peste timp, setează resurse și nevoi, mută-te direct într-un loc, setează stări (de exemplu `acoperis`), pornește o luptă.

## 4. Editorul și serverul (VPS)

Autorul lucrează **doar din browser**, pe VPS-ul lui, fără să instaleze nimic local.

### Ce rulează pe VPS

- **VPS Hostinger, Ubuntu 24.04.** Nu pune IP-ul în repo.
- **Adresa:** `visual-novel.fangs-and-honor.com`, cu o înregistrare DNS de tip A către VPS.
- **Pe același VPS rulează deja alte site-uri** (printre ele jocul principal, `fangs-and-honor.com`). **Nu au voie să fie stricate.**
- Serverul web existent e **nginx** (porturile 80/443, fără Docker). Scriptul de instalare doar **adaugă un fișier nou** în `sites-available` / `sites-enabled` pentru subdomeniu, rulează `nginx -t` și face reload numai dacă testul trece. Nu modifică fișierele celorlalte site-uri și nu instalează un al doilea server web.
- Serverul Node ascultă doar pe `127.0.0.1`, iar nginx îi trimite cererile (reverse proxy).
- **HTTPS** pe subdomeniu și **parolă pe tot subdomeniul**, pentru că jocul e o surpriză.
- **Un server Node mic** care:
  - servește jocul (build-ul) și editorul;
  - primește imagini încărcate și le salvează în folderul de imagini;
  - salvează datele scrise de editor (secțiunea 5) și le trimite pe GitHub (commit + push, cu o cheie de deploy);
  - are un buton **„Actualizează jocul”**, care face `git pull` și rebuild când Claude a publicat cod nou.
- VPS-ul urmărește ramura `main`.
- **Nimic secret în repo:** parola site-ului, cheia de deploy și orice alt secret stau doar pe VPS, în fișiere din afara repo-ului.
- Instalarea se face **o singură dată**, cu un script din `tools/vps/`, lipit în *Web console* din panoul Hostinger. Scriptul **nu atinge firewall-ul**: serverul Node ascultă doar local, deci nu are nevoie de porturi noi.

### Imaginile NU intră în GitHub

- Imaginile stau **doar pe VPS**, într-un folder din afara repo-ului. `assets/` e în `.gitignore`.
- Claude nu are nevoie de imagini, doar de **numele** lor. Lucrează cu placeholdere.
- **Backup:** buton **„Descarcă backup”** în editor (zip cu toate imaginile și datele), plus snapshot-urile Hostinger.
- La build-ul `.exe`, imaginile se iau de pe VPS (zip-ul de backup).

### Cele trei ecrane ale editorului

1. **Galerie.** Tragi PNG-uri în pagină. Sunt grupate pe categorii (secțiunea 5). Un grup la care e totul încărcat (și opționalele) stă închis. O bifă, „Ascunde secțiunile la care nu mai e nimic de adăugat”, le ascunde de tot (ținută minte în browser). Editorul arată **ce lipsește** (cerut de date, dar neîncărcat) și **ce nu e folosit**. Numele se verifică după convenție și se propune numele corect.
2. **Aranjare.** Deschizi o scenă, harta sau ecranul de echipament și:
   - tragi sprite-urile și piesele, iar rotița mouse-ului le mărește (x, y, scară);
   - desenezi **zonele clicabile** punct cu punct (poligoane);
   - așezi sloturile de echipament peste figura lui Vale;
   - setezi marginile elementelor de interfață (secțiunea 9);
   - bifa **„Arată tot”** (decis de autor, ținută minte în browser) arată și personajele, decorul și orele care apar abia după o misiune sau o stare (de exemplu Kaia la marginea pădurii), ca să poată fi aranjate dinainte; la un personaj care nu e acolo la ora aleasă, „La ora lui” mută ziua și ora editorului când e el acolo.
3. **Testare.** Jocul, cu panoul debug deschis: schimbi ora, pui noapte, setezi stări și vezi variantele. Panoul debug (F2) are și: misiunile (pornește / resetează, cu pasul la care ești), „Toți cunoscuți de 3 zile”, „+1 vânătoare câștigată”, evenimentele pornite forțat. **„Resetează” la o misiune** (decis de autor: ca misiunile să se poată testa din nou fără joc nou) întoarce tot jocul la clipa dinainte să înceapă misiunea (cu tot ce a schimbat ea: acoperișul, stările, obiectele, încrederea, ora); clipa se ține minte în browser, separat de salvare, și se uită la „Joc nou” sau la încărcarea unei salvări.
4. **Misiuni** (decis de autor): tab-ul cu `docs/misiuni.md`, walkthrough-ul: fiecare misiune, cum pornește, ce imagini cere și cum se verifică la Testare (decis de autor: fără prompturi în el; prompturile le dă Claude în conversație).

**Ce NU face editorul:** dialoguri, evenimente, condiții, misiuni. Pe astea autorul le descrie în cuvinte, iar Claude le scrie în JSON. Un formular pentru ele se face doar dacă autorul îl cere mai târziu.

## 5. Structura proiectului

```
assets/                 (doar pe VPS, nu în git)
  map/                  sat_harta.png (+ _noapte), piese/ (clădirile decupate)
  locations/            imaginile de zonă și scenele locurilor
  events/               imaginile evenimentelor (scenele derulate, fără text), grupate în galerie pe eveniment
  portraits/            portrete de dialog (cu stări)
  sprites/              personaje în scene, fundal transparent
  combat/               pozele de luptă (secțiunea 15)
  items/                iconițele obiectelor
  ui/                   grafica interfeței (secțiunea 9)
data/
  config.json           valori de echilibru (taxă, nevoi, bani, luptă)
  locations.json        arborele hartă > zone > locuri, variante, condiții
  npcs.json             personaje, rutine, relații, recrutare, statistici de luptă
  items.json            obiecte (tip, stivă, sloturi ocupate, statistici)
  events.json           evenimente
  dialoguri.json        dialogurile (noduri cu vorbitor, emoție, text, alegeri)
  lupte.json            inamicii și luptele (participanți, recompense, înfrângere)
  misiuni.json          misiunile (cine o dă, descriere, pași, recompensă)
  aranjare/             SCRIS DE EDITOR: poziții, poligoane, sloturi, margini UI
src/                    codul jocului
editor/                 editorul (galerie, aranjare, testare)
server/                 serverul Node pentru VPS
tools/
  vps/                  scriptul de instalare și actualizare
  webp.js               conversia PNG → WebP la build
docs/                   documente de design (referință)
CLAUDE.md
```

**Cine scrie ce:** editorul scrie **doar** în `data/aranjare/`, iar Claude scrie restul din `data/`. Așa nu există conflicte între modificările autorului și ale lui Claude.

**Nume de fișiere:** litere mici, fără diacritice, cu `_` (de exemplu `fierar_interior.png`, `vale_suparat.png`). **Toate id-urile** (personaje, stări, emoții, locuri) sunt fără diacritice.

## 6. Povestea și starea inițială

**Toate misiunile, cum pornesc și cum se leagă: `docs/misiuni.md`** (decis de autor: evidența lor, viitorul walkthrough; se actualizează la fiecare misiune). **Regulă:** o misiune apare doar după prima discuție cu personajul și după câteva zile (`cunoscutDeZile`). **Tonul** (decis): începe întunecat și se încălzește odată cu încrederea totală; spre final se vorbește de revoltă (`TODO`). **Prologul** (decis, de făcut): la un joc nou, 5–7 imagini cu text (orcii vin, soldații satului și tatăl lui Vale cad, taxa, zidul), apoi Vale se trezește în camera lui: a fost un vis.

- **Protagonist:** Vale Lightfinder, 25 de ani. Locuiește cu mama lui, **Miriam Lightfinder**, într-o casă pe jumătate dărăpănată. Tatăl a murit apărând satul într-o bătălie cu orcii.
- **Situația:** satul e ocupat de orci, care i-au cruțat pe localnici în schimbul unei **taxe săptămânale**. Ieșirea din sat e păzită de orci, deci tot demo-ul se petrece în sat și în pădurea de lângă el.
- **Libertate:** nu există o ordine impusă. Jucătorul decide ce face, iar taxa și evenimentele aduc presiunea.
- **Finalul demo-ului:** Vale recrutează aliați, îi adună la Camp site (adunarea secretă) și atacă poarta într-o luptă pe ture. Dacă o câștigă, satul e liber.
- **Misiunea de la mamă (acoperișul):** mama îi cere lui Vale să adune lemn din pădure ca să repare acoperișul. La final, imaginea casei (piesa de pe hartă și imaginea zonei) trece de la `acoperis: stricat` la `acoperis: reparat`. **Recompensa** (decis de autor): încrederea Miriamei +1 și somnul de acasă mai odihnitor cu acoperișul reparat (+30% stamina, `factorRefacere` la „Dormi”; cifra e aleasă de Claude). **Ciorna de acum** (autorul o poate schimba): în meniul Miriamei apare „Iar a plouat în casă !”, **doar dimineața, cât e ea în bucătărie** (până la 11, decis de autor); „Mă ocup eu” pornește misiunea (refuzul o lasă în meniu). Pasul 1: 10 lemne din pădure (în meniu „N-am apucat încă să adun lemnele ?” dă indicația). Pasul 2 (decis de autor): cu lemnele, **tot dimineața, în bucătărie, și odihnit** (sub 30 stamina mama îl trimite la odihnă), „Uite lemnele, mamă. Mă urc pe acoperiș. ?” → mama, apoi **imaginea cu Vale reparând acoperișul** (`events/acoperis_reparat.png`, evenimentul `acoperis_reparat`; consumă lemnele, 4 ore și 30 stamina), apoi mama îi mulțumește și misiunea e terminată.
- **Mama îl bandajează** (decis de autor): când Vale e rănit (sub 60 viață, ales de Claude), o dată pe zi, mama, acasă, se îngrijorează și îi oferă să-l bandajeze (la biserică, unde se roagă în weekend, îl ia acasă: Vale ajunge în camera ei, decis de autor); dacă acceptă, trece o oră, apare imaginea cu ei doi în camera ei (`events/miriam_bandaj.png`, evenimentul `miriam_bandaj`) și viața crește cu 30 (`TODO` echilibru); condiția `marcatAzi`.
- **Magul din biserică** (preotul) e de fapt mag al luminii, sub acoperire. Orcii nu știu.
- **Fierul lui Bram** (decis, `docs/misiuni.md`): orcul colector îi confiscă fierul; Vale îl ia înapoi de la poartă (60 de monede, zaruri cu paznicii sau o bătaie trucată, fără șanse); răsplata: bani, încredere și **magazinul lui Bram, închis până atunci**. **Când Vale ia fierul înapoi** (plată, zaruri sau bătaie; decis de autor): o imagine cu fierul primit (`events/poarta_fier_recuperat.png`, evenimentul `fier_recuperat`, `evenimentRecuperat` la obiect) și colectorul care îi spune că-l mai așteaptă la poartă; de atunci poarta e deschisă (`poarta_deschisa`). **Până atunci, poarta e închisă tot timpul** (decis de autor): un orc îl oprește pe Vale cu imaginea `poarta_fier_1.png` și îl întoarce pe hartă (`poarta_oprit`), iar noaptea (23–06) Vale nici nu ajunge acolo, doar se gândește că n-ar fi bine (`incuiat` la zona porții; o zonă de pe hartă poate fi încuiată ca un loc); în timpul misiunii, ziua și fără fier, discuția continuă cu colectorul (`poarta_fier`). Taxa se plătește atunci doar când vine colectorul acasă.
- **Ierburile lui Elian** (decis): 4 fire de sunătoare, culese dimineața în pădure, prin mini-jocul plantelor (secțiunea 11); locul „Caută ierburi” apare doar de când ai misiunea și rămâne după ea. Răsplata: încredere +1 și 2 pansamente; după misiune, Elian face oricând un pansament din 3 fire, pe ecranul magazinului (decis de autor: „Schimburi” în meniul lui; în stânga schimbul, ce dai → săgeata → ce primești, `schimburi` la `magazin` în `npcs.json`; săgeata e `ui_sageata.png` din carte, până atunci un simbol).
- **Camera fierarului:** încuiată. Fierarul îți dă cheia după altă misiune (`TODO`: care). În cameră e un cufăr cu un obiect bun (`TODO`: care).
- **Dragonii** (decis de autor, povestea mare): majoritatea oamenilor cred că dragonii au dispărut, dar **o organizație secretă a oamenilor încă folosește dragoni**. Foarte rar se naște un om care poate **comunica cu dragonii și îi înțelege**; și mai rar, unul care poate face **un legământ** cu un dragon (se unește cu el, îl călărește, luptă alături de el). Puterea se trezește **la 26 de ani**; magi puternici din organizație simt aceste „treziri” și îi caută mereu pe acești oameni. **Surpriza: Vale (25 de ani) e unul dintre cei care pot face legământul.** Restul lumii (cei 5 dragoni primordiali, Karzor și elfii de pădure): `docs/lore.md`. În demo, prima apariție: **o discuție cu Agnes** (ce-și amintește din povești), pe care **Roderick o aude**; de aici pornește căutarea a ceva legat de dragoni care să ajute la eliberarea satului (misiunea `TODO`). Fără dragoni adevărați în demo (secțiunea 17).
- **Făcute** (decis de autor): **Agnes, „Camera de sus”** (Vale golește camera fostului chiriaș, un soldat căzut în lupta cu orcii, peste 3 imagini: camera plină, camera curată și rucsacul de sub pat, apoi jos la Agnes, care îl trimite la Roderick; apoi camera se închiriază; hârtiile, `hartii_vechi`, stau la obiectele de poveste și **se citesc cu un clic** din inventar, `citeste` la obiect, decis de autor) și **Roderick, „Hârtiile soldatului”** (imediat după; discuția despre solz și dragoni, peste imagine; fără încredere, decis de autor), după care vine **primul vis**, la următorul somn (evenimentele `laTrezire`). **Fără pauză între misiunile unui personaj** (decis de autor); doar unele misiuni apar cu întârziere, unde se cere (condiția `misiuneTerminata: { id: zile }`).
- **Agnes, „Berea” și „Pivnița”** (făcute, decis de autor; **berea vine înaintea pivniței**, ca jucătorul să aibă timp să-și facă rost de o armă și de poțiuni, iar șobolanii vin la butoaiele cu berea nouă): pivnița (loc nou, `taverna/pivnita`, ușa din sala tavernei; 3 șobolani: doi cu gheare și unul care scuipă bale acide care otrăvesc; cei care scuipă revin în lupta finală la orci; **șobolanii vorbesc**, decis de autor: un clan de mutanți aliat cu o teroare care se apropie, ce e ea `TODO`; îi spun lui Vale să se gândească bine de partea cui stă; **vorbesc ca niște șobolani**, decis de autor, peste tot în univers: repede, repetă cuvintele, „da-da”, „om-lucru”, „Ssss!”, detalii în `docs/lore.md`; portretele `portraits/sobolan_*`, cu `rade`, rama roșie în medalion; **leacul de otravă**, `leac_otrava`, oprește otrava în luptă și se va vinde la bătrâna cu poțiuni din zona nouă a lui Finn), apoi berea (5 orz de la moară, câte 2 la fiecare muncă cât e misiunea, `bonus` la muncă; 2 miere de la fermier, 10 monede; obiecte de poveste care se numără, `numarabil`); detaliile în `docs/misiuni.md`.
- **Planul misiunilor următoare** (decis de autor; pe larg în `docs/misiuni.md`, cu 📝): **Roderick** — locul unde a căzut tata (amintiri, dramatic, încredere +1), apoi „Cina în familie” (Miriam), apoi antrenamentul (3 zile, o dată pe zi), plus căutarea solzilor după hârtii; **Bram** — foalele stricate, apoi cheia; **Elian** — cărțile (făcută: din ziua 8, când citește afară, 14–18; iei cărțile și te ascunzi, +1, sau refuzi și e ratată), apoi secretul (bolnavul a devenit misiunea lui Finn, decis de autor); **hoțul** — eliberarea (făcută: îl crezi, apoi drumul spre a doua hartă, Marginea satului: casa lui, ieșirea, contrabandistul, cimitirul, coliba ierbăresei), apoi deodată (decis de autor) **mâncarea** (făcută: 3 pâini și 2 carne, gătite la ceaun, peste 2 imagini) și **mama lui Finn** (făcută: Elian, luminița-nopții culeasă seara, vindecarea peste imagini; încredere +1 la Finn și la Elian; Finn, care lucrează în secret pentru contrabandist, îi dă cheia cocioabei), apoi **lada colectorului** (făcută: noaptea, cu Finn, furișatul pe 3 imagini, cu câte două locuri desenate în editor, unul sigur; greșit = fuga și încă o încercare noaptea următoare; +1, monede și ce au confiscat orcii); **încrederea**: fiecare personaj important are 10 întâmplări care dau +1, unele se pot rata (recrutarea de la 8), evidența în `docs/misiuni.md`, „Încrederea” (decis de autor); **semne** (vise după anumite misiuni) și **finalul** (Vale împlinește 26 de ani, răget sau mag străin). Toate cu imagini și replici peste ele. **Recrutarea** (sistemul, chemarea la Camp site, afișarea acolo) se face când primul personaj ajunge la 8/10 încredere.

## 7. Navigarea: hartă > zonă > loc

Lumea e un arbore de imagini, cu trei niveluri:

1. **Harta satului:** o imagine mare, cu piese separate (clădiri decupate, PNG transparent) puse peste harta goală.
2. **Imaginea zonei:** se deschide la click pe o zonă de pe hartă. Clădirea văzută din față, **fără personaje**. Locurile ei sunt zone clicabile pe imagine (uși, scări, cărări).
3. **Scena locului:** interiorul sau locul propriu-zis. Aici apar personajele.

Reguli:
- **Strălucirea (decis de autor):** **doar piesele de pe hartă** au strălucirea lor (CSS `drop-shadow` pe forma PNG-ului). **Tot restul** (locuri, acțiuni, personaje) folosește strălucirea zonelor desenate: o bandă aurie estompată pe conturul zonei. Un personaj fără zonă desenată primește automat o zonă trasată din forma sprite-ului (`src/contur.js`), afișată exact ca una desenată.
- **Zonele clicabile sunt poligoane**, desenate în editor. **Regula autorului:** tot ce e clicabil (locuri, acțiuni, personaje) are o zonă desenată de el; **excepție: piesele de pe hartă**, care răspund automat pe forma lor. Până e desenată zona, acțiunile apar ca butoane, iar personajele răspund pe forma sprite-ului.
- **Strălucirea în repaus** (ca să se vadă ce e clicabil): 30% ziua, 20% noaptea; completă cu mouse-ul deasupra.
- **Locuri încuiate:** un loc poate cere o condiție (secțiunea 12). Dacă nu e îndeplinită, apare un mesaj și locul nu se deschide. `incuiat` poate fi și o listă de lacăte, fiecare cu mesajul lui (camera fierarului: fără cheie / fierarul doarme).
- **Locuri ascunse:** apar pe imagine doar după o condiție (de exemplu Camp site).
- Buton de **înapoi** pe fiecare nivel. Mutarea între locuri **consumă timp** (configurabil). Întoarcerea la nivelul de deasupra nu consumă timp.

### Arborele de locuri (demo)

| Zonă (`id`) | Piesă pe hartă | Imagine de zonă | Locuri |
|---|---|---|---|
| `casa` | `casa.png` (+ `casa_reparata.png`) | `casa_zona.png` (+ `casa_zona_reparata.png`) | `camera_vale`, `camera_mama`, `bucatarie` (cufărul de acasă e aici sau în camera lui Vale) |
| `fierar` | `fierar.png` | `fierar_zona.png` | `interior` (magazin), `camera` (la etaj, **încuiată**, cu cufăr; se intră doar din magazin, `"din": "interior"`) |
| `taverna` | `taverna.png` | `taverna_zona.png` | `parter` (deschis 09:00–02:00), `pivnita` (din sala tavernei, de la misiunea lui Agnes „Pivnița”, decis de autor), `etaj` (camera plătită la Agnes, cu patul de dormit; **ascunsă până la misiunea lui Agnes „Camera de sus”**: cât e în lucru se intră fără chirie, ca s-o golești; după ea se închiriază) |
| `piata` | `piata.png` (+ `piata_fara_prizonier.png`) | `piata_zona.png` (+ `piata_zona_fara_prizonier.png`) | **fără locuri**: zona e chiar scena, cu negustorul, hoțul legat și magazinul |
| `campuri` | `culturi.png` (câmpul de grâu) și `ferma.png` (vacile), ambele lungi, lângă moară | `campuri_zona.png` | 2 zone care dau **acțiuni de muncă**, nu scene: câmpul de grâu (arat) și ferma de vaci (decis: fără porci). Doar **06–13** se lucrează aici (decis): fermierul (`fermier`, sprite, se poate vorbi cu el; misiunile lui sunt `TODO`), iar ceilalți săteni la muncă sunt desenați direct în imaginea zonei pentru orele acelea, `campuri_zona_lucru.png`; după 13:00, până a doua zi, câmpurile sunt goale (`campuri_zona.png`; noaptea `campuri_zona_noapte.png`) |
| `moara` | `moara.png` (stă **deasupra** pieselor câmpurilor, `deasupra` în `locations.json`) | `moara_zona.png` (+ `moara_zona_noapte.png`) | o zonă care dă **acțiunea de muncă** la moară (decis: moara e locație separată de câmpuri) |
| `padure` | fără piesă (poligon pe hartă) | `padure_zona.png` | `interior` (**vânătoarea**: nu e un loc în care stai; `padure_interior.png` apare câteva secunde ca ecran de încărcare, apoi pornește o luptă aleasă după șanse: 35% doi lupi, 25% trei lupi, 15% patru lupi conduși de **lupul negru** (`lup_alfa`: pozele lupului, întunecate și cu 20% mai mari), 25% un mistreț; pe `lupta_padure_interior.png`), `campsite` (**ascuns** până la întâlnirea cu vânătoarea; e campsite-ul ei). Acțiunea „Adună lemne” e pe imaginea zonei |
| `poarta` | `poarta.png` | `poarta_zona.png` | **fără locuri** (decis): zona e chiar scena, ca piața. Pe ea stau orcul colector (apeși pe el și plătești taxa), paznicul (`paznic_orc_1`, se poate vorbi cu el) și al doilea paznic (`paznic_orc_2`, doar se vede, nu se apasă) |
| `biserica` | `biserica.png` | `biserica_zona.png` | `interior` (preotul; 14–23 citește afară, pe scări, pe imaginea zonei) |

**Marginea satului** (decis de autor): **a doua hartă**, ca cea a satului, cu mai puține locuri (`harti` în `locations.json`; zonele ei au `"harta": "marginea"`). Trecerea dintr-o hartă în alta e **o zonă desenată în editor pe fiecare hartă** (decis de autor: fără piesă separată): pe harta satului („Marginea satului”, apare abia după eliberarea lui Finn) și pe Marginea satului („Satul”); „Înapoi” de pe ea duce tot în sat. Zonele: `casa_finn` (+ `interior`: Finn, Marta, mama lui, și Lina, sora lui, decis de autor; **cât e Marta bolnavă e desenată în imaginea casei**, în pat, `casa_finn_interior_bolnava.png` și seara, cu focul aprins, `_bolnava_seara.png`; apăsată, Vale doar se gândește, decis de autor; după vindecare e sprite și se vorbește cu ea; **programul** (decis de autor): Finn 06–08 acasă, 08–13 la câmpuri (muncește cu ziua), 13–18 acasă, 18–23 plecat pe ascuns, la Jarek; Lina 06–10 acasă, 10–14 afară, în fața casei, 14–18 la coliba Bătrânei Morwen, 18–23 acasă; seara, cât e Marta bolnavă, alt sprite, `_mama_bolnava`, pentru că mama stă în pat, decis de autor), `iesirea` (ieșirea mai puțin păzită, fără piesă pe hartă, doar o zonă desenată; deocamdată doar un gând), `contrabandist` (cocioaba lui **Jarek**, decis de autor, **încuiată** până la cheia de la Finn; înăuntru, `interior`, **scăunelul**: Vale așteaptă 30 de minute, doar 18–02, apoi vine contrabandistul, care rămâne cât stă Vale acolo, `laPlecare` la loc; marfă pe bani și **la schimb**, decis de autor), `cimitir` (mormântul tatălui, o dată pe zi), `coliba` (+ `interior`: **Bătrâna Morwen**, ierbăreasa, decis de autor, cu poțiuni și leacul de otravă; **ușa are altă zonă noaptea**, pe imaginea de noapte, decis de autor: `zoneVariante` la loc, zona se salvează ca `interior@noapte`; până e desenată, noaptea se folosește cea de zi). Harta: `map/marginea_harta.png`.

Fișierele scenelor: `<zona>_<loc>.png` (de exemplu `casa_camera_vale.png`, `padure_campsite.png`).

Piața e o singură scenă (decis): personajele (`sprites/<id>_piata.png`) și acțiunile stau direct pe imaginea zonei. Taraba negustorului e decor (`sprites/negustor_piata.png`, se vede ziua, nu se apasă). După eliberarea hoțului (`hot: eliberat`) se folosesc imaginile „fără prizonier”, iar hoțul nu mai apare.

## 8. Straturi vizuale

**1. Fundal.** O imagine de bază per scenă. Unele scene au **variante**, alese după condiții:

| Scenă | Variantă | Condiție |
|---|---|---|
| `taverna_parter` | de bază 09–12; `_pranz`; `_dupa_amiaza`; `_plin` (plină de oameni) | 12–14 / 14–18 / 18–02 |
| `taverna_zona` | `_noaptea_luminata` (geamuri luminate), `_noaptea` | 23–02 (deschisă) / 02–05 |
| piesa `taverna` (harta) | `_noapte_luminata` (geamuri luminate), `_noapte` | 23–02 (deschisă) / 02–05 |
| `padure_campsite` | `_seara` (foc aprins; seara rămâne imaginea de bază cu filtrul portocaliu) | noaptea (23–05) și adunarea secretă |
| `biserica_zona` | `_noaptea` | noaptea (23–05) |
| `biserica_interior` | `_dimineata`, `_noaptea` | 05–08 / noaptea (23–05) |
| `sat_harta` | `_noapte` | noaptea |
| `casa_zona` | `_noapte`, `_reparata` | noaptea / `acoperis = reparat` |
| `poarta_zona` | `_noapte`, `_liberata` | noaptea / satul eliberat |

**Estomparea hărții** (decis): imaginea hărții e estompată jos, ca o fotografie cu focus; codul estompează și piesele în aceleași benzi (de la 70% din înălțime în jos, tot mai mult), ca să se potrivească. Benzile se reglează în `locations.json`, la `harta.estompare`.

La **toate celelalte scene**, seara și noaptea vin dintr-un **filtru făcut din cod**: portocaliu seara, întunecat și albăstrui noaptea. Filtrul se aplică și pe sprite-uri.

**2. Sprite-uri.** Personajele cu nume sunt PNG-uri cu fundal transparent, puse **peste** fundal doar când rutina lor le aduce acolo. Un sprite per personaj și per loc: `sprites/<personaj>_<zona>_<loc>.png` (de exemplu `fierar_fierar_interior.png`). Locurile unde un personaj are sprite sunt în `npcs.json`, la `locuriSprite`.
- Sprite-urile sunt decupate strâns pe conturul personajului.
- **`y` înseamnă locul unde îi sunt picioarele** (ancorare jos-centru), ca personajele să stea pe podea indiferent de înălțime.
- Au highlight la hover și se pot apăsa pentru dialog.
- Oamenii anonimi (de exemplu clienții din taverna plină) rămân în fundal și nu se pot apăsa.
- **Decor** (`decor` la un loc, în `locations.json`): obiecte puse peste fundal, mereu acolo și neclicabile (de exemplu glaive-ul Kaiei la campsite, `sprites/glaive_padure_campsite.png`, care se vede doar cât e și Kaia acolo; `apare` cu `personajLa`). Se aranjează în editor ca sprite-urile și primesc filtrul de seară/noapte; noaptea, pe imaginea cu focul, decorul se întunecă.

**3. Portrete de dialog.** Bust, raport 4:5 (de exemplu 1024×1280), fundal transparent. Câte unul per **stare**: `normal`, `suparat`, `speriat`, `ranit`. „Normal" e o expresie ușor prietenoasă. Fișiere: `<personaj>_<stare>.png`. Dacă lipsește starea cerută, se folosește `normal`, fără să se strice nimic. Un personaj minor poate cere mai puține stări (`stariPortret` la personaj: negustorul are doar `normal`, decis). Un personaj poate avea stări în plus (`stariExtra` în `npcs.json`): **orcii** au și `rade` (râde zeflemitor, îl ia în derâdere pe Vale), `<id>_rade.png`. Portretele orcilor privesc spre stânga.

## 9. Grafica interfeței (UI)

Toată interfața poate primi grafică generată de autor, încărcată în galerie la categoria **Interfață** (`assets/ui/`). **Până la încărcare, fiecare element are un stil CSS implicit**, așa că jocul arată decent și fără grafică.

Elemente (lista poate crește):

| Element | Fișier | Note |
|---|---|---|
| Chenarul de dialog | `ui_dialog.png` | doar rama aurie fină, interiorul transparent (umplerea întunecată, străvezie, e din cod); 9-slice (decis, după designul autorului) |
| Rombul de pe marginea de sus a chenarului | `ui_dialog_ornament.png` | separat, ca să nu se întindă cu rama |
| Plăcuța cu numele vorbitorului | `ui_nume.png` | panglica albastră, pe linia de sus a ramei; 9-slice |
| Alegerile din dialog | `ui_alegere.png`, `ui_alegere_hover.png` | rânduri subțiri; 9-slice (hover-ul: strat la mărimea lui) |
| Săgeata „continuă” din dialog | `ui_dialog_sageata.png` | |
| Panoul mic (Dormi, Muncă, anunțuri) | `ui_panou.png` | tabla cu banda titlului (900×700); stă întreagă, cu forma imaginii (lată de cel mult 860 px), titlul pe banda albastră, butoanele de pergament din meniu, cu forma imaginii lor, late de 300 px, câte două pe rând (decis) |
| Slot de inventar / de echipament | `ui_slot.png`, `ui_slot_hover.png` / `ui_slot_echipament.png` (+ `_hover`) | căsuța de pe foaie / rama de lângă Vale |
| Bare (viață, stamina, foame, sete) | `ui_bara_rama.png`, `ui_bara_<tip>.png` | rama + umplutura |
| Cursorul | `ui_cursor.png`, `ui_cursor_click.png` | se poate încărca mare; jocul îl micșorează la mărimea aleasă în Opțiuni (16–96 px, implicit 32; vârful în colțul stânga-sus); rămâne și peste butoane, fără mânuța browserului; peste 32 px îl desenează jocul (Chrome înlocuiește cursoarele mari cu săgeata lui la marginea ecranului) |
| Figura lui Vale pentru echipament | `ui_vale_apoza.png` | A-pose, fundal transparent |
| Cartea personajelor (deschisă, pagini goale) | `ui_carte.png` | 1600×1000; „Închide” e pergamentul din meniu |
| Săgeata de răsfoit (cartea) | `ui_sageata.png` | 256×256, vârful spre dreapta; cea spre stânga e aceeași, întoarsă din cod |
| Paharul și zarurile (jocul de zaruri) | `ui_pahar_zaruri.png`, `ui_zar_1.png` … `ui_zar_6.png` | 256×256 / 128×128, fundal transparent |

**Piesele dialogului** (decis de autor): chenarul, rombul, plăcuța numelui, alegerile și săgeata **își păstrează proporțiile din imaginile încărcate** și se micșorează toate cu același factor, ales ca chenarul să fie lat de 1640 px pe scena de 1920×1080. La ele marginea nu poate fi cu minus (0 = imaginea întreagă). Hover-ul alegerilor stă la mărimea lui, centrat peste alegere (cu strălucirea din jur cu tot). Chenarul crește în jos doar dacă textul nu încape.

**Interfața de pe ecran** (decis, după designul autorului): panoul lui Vale stânga-sus (plăcuța cu numele, cele 4 bare, monedele, taxa, datoria de blăni), **închis la început: se deschide din butonul pătrat cu iconița lui Vale** (`ui_icon_vale.png`, tasta V), care pulsează roșu când ceva e grav (o nevoie scăzută, taxa de azi), numele locului sus la mijloc (pe banda de pergament), cele 4 butoane pătrate dreapta-sus, **doar cu iconițe, fără text** (Inventar, Personaje, Meniu, Ecran complet; numele apare la hover), ceasul stânga-jos și „Înapoi” dreapta-jos (decis de autor); centrul rămâne liber. Piesele, fără text (textul îl scrie jocul): `ui_hud_panou.png`, `ui_hud_nume.png`, `ui_hud_ceas.png`, `ui_hud_buton.png` (+ `_hover`), `ui_hud_placuta.png`, iconițele `ui_icon_vale/inventar/personaje/meniu/ecran/monede/inapoi.png` (numele locului e doar text, fără iconiță); barele folosesc `ui_bara_rama.png` și `ui_bara_<tip>.png`. Până se încarcă, ramele sunt din CSS și iconițele sunt simboluri. Toate iconițele își păstrează forma imaginii (nu se turtesc, decis). Barele colorate (grosimea umplerii, spațiul față de ramă) se reglează în editor, la Interfață → Rama barelor. Ceasul din stânga-jos e mai mic decât plăcuța „Înapoi”.

**Meniul** (decis, după designul autorului): o tablă de lemn atârnată cu lanțuri, cu banda albastră a titlului și rombul auriu (culorile steagului de la biserică), și 6 butoane de pergament în grilă 2×3, fiecare cu iconița lui: Continuă, Salvează (într-un fișier), Încarcă (dintr-un fișier), Joc nou, **Galerie** (ilustrațiile evenimentelor pe care Vale le-a văzut deja; un clic o arată mare) și **Opțiuni** (viteza animațiilor ×1/×2/×4, volumele sunetului, mărimea cursorului, semnele misiunilor, mini-jocurile și ecranul complet; se țin minte în browser). Piesele, fără text: `ui_meniu_panou.png`, `ui_meniu_buton.png` (+ `_hover`), iconițele `ui_icon_continua/salveaza/incarca/joc_nou/galerie/optiuni.png`. Tabla ține implicit tot ecranul pe înălțime (1728 × 1080); toate mărimile și spațiile meniului (tabla, butoanele, iconițele, cât de aproape e scrisul de ele (iconița și scrisul stau împreună, centrate pe pergament), textele, titlul) se reglează în editor, la Interfață → „Meniul: mărimi și spații”, cu previzualizare pe loc (`meniu` în `data/aranjare/ui.json`).

**Fără ferestrele browserului** (decis de autor): întrebările „ești sigur?” (arunci un obiect, joc nou) apar pe panoul mic al jocului, cu două butoane de pergament, nu în fereastra browserului (care scoate din ecranul complet).

**Fără rama generală de buton și fără fundalul ferestrelor** (decis de autor): toate butoanele sunt pergamentul din meniu (`ui_meniu_buton.png`; la zaruri doar alegerea mizei și foaia cu regulile, decis de autor: la masă „Licitează”, „Mincinosule!”, + și − rămân fără pergament, iar + și − sunt mai groase, aurii pe lemn închis), iar în spatele panourilor se vede scena întunecată.

**9-slice:** colțurile ramei rămân neschimbate, iar mijlocul se întinde. Așa un singur chenar merge la orice mărime. Marginile (cât de lat e colțul) se setează în editor, la Aranjare. Marginea poate fi și **0** (imaginea se întinde întreagă) sau **cu minus** (se întinde întreagă și iese în afara elementului cu atâția pixeli; așa stă hover-ul butoanelor pătrate, a cărui imagine are spațiu pentru strălucire în jur). Fiecare ramă are butonul ei „Salvează marginea”.

## 9b. Sunetul (decis)

- **Trei feluri** (`data/sunete.json`, scris de Claude; fișierele în `assets/sunete/`, doar pe VPS, încărcate din galerie la grupurile „Sunete: …”, doar **MP3**):
  - **ambianța** fiecărei scene (`sunete/ambianta/<id>.mp3`, se repetă): cheia e id-ul scenei; o scenă fără ambianță o moștenește pe a zonei, apoi pe a hărții; `variante` după condiții (noaptea, taverna închisă, poarta seara). La schimbarea locului, sunetele trec lin unul în altul. `volum` (față de Opțiuni) și `infundat` (`putin`/`mult`: același sunet auzit prin pereți, cu un filtru din cod; același fișier nu repornește, doar se potrivește lin);
  - **pe locuri** (decis de autor): zonele de afară care aud satul de pe hartă îl aud cu 10% mai încet; **casa**: zona aude satul ca afară (10% mai încet), cele două dormitoare puțin înfundat, bucătăria la fel, plus focul din vatră (`casa`, ca al doilea sunet, `strat`, clar); **taverna**: muzica cu vocile din fundal, într-un singur fișier (`taverna_muzica`), înăuntru, înfundată afară și în camera de sus (cât e închisă: 02–05 noaptea satului, 05–09 satul de zi, decis de autor); în pivniță, tot ea, înfundată (decis de autor: fără melodie specială pentru misiunea „Pivnița”); **moara**: vântul și aripile (`moara_vant`), fără râu; **poarta**: ziua ciori și vânt de vreme rea (`poarta_zi`), seara 18–23 focul orcilor (`poarta`); **pădurea**: doar sunetul ei, nimic din sat (la Camp site, noaptea, noaptea pădurii cu focul taberei peste ea, decis de autor); **noaptea** (decis de autor), noaptea satului (`sat_noapte`) se aude pe hartă întreagă, în camera lui Vale, a mamei și în biserică înfundat (`mult`), iar peste tot în rest la 80%, ca să pară că ai ajuns într-un loc (inclusiv exteriorul casei, al fierăriei, al morii și al porții);
  - **efectele** scurte (`sunete/efecte/<id>.mp3`): ușa la intrarea într-un loc, pașii spre o zonă, ușa încuiată, clicul pe butoane, monedele (magazin, taxa), mâncat/băut, pansamentul (`pansament`, `sunet` la obiect, decis de autor), poțiunea de viață ca apa (`baut`, decis de autor), somnul, rucsacul (inventarul), echiparea, pagina cărții, apa și lemnele (`sunet` la acțiune), munca, zarurile (agitate, aruncate), începutul unui eveniment cu imagini, în luptă: lovitura după armă (sabie, pumn, topor, arc, glaive; la mistreț `lupta_lovit`, la lupi mușcătura, `lupta_muscatura`, la șobolanii cu gheare doar sunetul lor, `lupta_sobolan`, fără strigătul `sobolan` (pe acela îl are doar cel care scuipă), decis de autor; glaive-ul Kaiei: sunetul lui o dată la aruncare, apoi `lupta_lovit` la fiecare țintă atinsă, și la ricoșeu, decis de autor), fără un sunet de impact în plus (decis: se aude doar ce se întâmplă), toporul în copac la fiecare clic din mini-jocul lemnelor (`topor_copac`, decis de autor), scutul, căderea, puterile preotului, strigătul inamicilor (`sunet` la inamic în `lupte.json`: lup, mistreț; orcii fără strigăt, decis de autor);
  - **muzica** (`sunete/muzica/<id>.mp3`): meniul, lupta (ține locul ambianței), victoria și înfrângerea (scurte), finalul.
- **Volumul fiecărui sunet** (decis de autor): se reglează în galerie, pe cardul sunetului, în procente (100% = cum e fișierul; `data/aranjare/volume_sunete.json`); se înmulțește cu volumul locului și cu cel din Opțiuni.
- **Un sunet lipsă e doar liniște.** Sunetul pornește după primul clic (regula browserelor).
- **Opțiuni:** volumul general, al locurilor, al efectelor, al muzicii și „Fără sunet”; se țin minte în browser, nu în salvare.
- **Sursele:** doar sunete cu licență **CC0** (de exemplu de pe OpenGameArt), cu lista lor în `CREDITE.md` lângă fișiere, ca jocul să poată fi publicat fără probleme.

## 10. Dialog

- NPC-ul în **dreapta**, Vale în **stânga**, amândoi la ~85-90% din înălțimea scenei, ancorați jos. Fundalul scenei rămâne vizibil, puțin întunecat; numele locului (banda de sus) face parte din fundal: stă în spatele portretelor și se întunecă odată cu scena (decis).
- Chenarul de text stă jos (~25% din înălțime), **deasupra portretelor**, cu numele vorbitorului într-un colț. **Când replicile stau peste o imagine** (personajele vorbesc între ele într-o misiune), lângă nume, în stânga plăcuței, stă **medalionul din luptă** cu fața vorbitorului (după emoția replicii, decis de autor; fără portretul acela, `normal`; rama aurie la oameni, roșie la orci; decis de autor), ca să se vadă repede cine vorbește.
- Fiecare replică are un câmp `emotie` (de exemplu `"emotie": "speriat"`) care alege portretul.
- Sub text apar 2-3 alegeri, care pot avea efecte (secțiunea 13).

## 11. Timp, nevoi, rutine, bani, taxă

### Timp

Fiecare acțiune consumă minute. Ceasul numără minutele de la ziua 1. Momentele zilei (fără suprapuneri):

| Moment | Interval |
|---|---|
| Dimineața | 05:00 – 09:59 |
| Amiaza | 10:00 – 17:59 |
| Seara | 18:00 – 22:59 |
| Noaptea | 23:00 – 04:59 |

### Nevoi (doar Vale)

Viață, stamina, foame, sete, toate pe scara 0-100. Recruții **nu** consumă nimic în demo. Pedepsele sunt **moi**: nimeni nu moare de foame. Toate valorile stau în `config.json` (cifrele de mai jos sunt de pornire).

| Nevoie | Scade cu | Sub 30 | La 0 |
|---|---|---|---|
| Foame | ~1 / oră | stamina se reface mai greu | pierzi viață în fiecare oră |
| Sete | ~1.5 / oră | acțiunile durează mai mult | pierzi viață mai repede |
| Stamina | munca, lupta | nu mai poți face muncă grea | trebuie să dormi |
| Viață | lupte, foame, sete | portretul lui Vale trece pe `ranit` | **leșin** |

- **Leșinul:** Vale se trezește acasă, iar mama l-a găsit. Pierde o jumătate de zi și o parte din bani sau un obiect (`TODO`: cât și ce). Nu e game over.
- **Somnul** reface stamina. Se poate dormi acasă (gratis) sau la tavernă (contra cost). Cât doarme, apare o imagine cu Vale dormind (`locations/somn_casa.png`, `somn_taverna.png`; ca la muncă, galeria „Munca și somnul”); imaginea de noapte dacă somnul prinde măcar o bucată din noapte (23–05: culcat noaptea, sau seara „până dimineața” ori 6 ore care trec de 23:00), altfel cea de zi (decis de autor) (`somn_casa_zi.png`, `somn_taverna_zi.png`, `imagineZi` la acțiune). Acasă, cu acoperișul reparat, alte două: `somn_casa_reparata.png` și `somn_casa_zi_reparata.png` (`varianteImagine` la acțiune, după condiții). Panoul are mereu 4 butoane (decis): „Dormi 2 ore”, „Dormi 6 ore”, „Dormi până dimineața” (seara și noaptea, până la ora trezirii) sau „Dormi până noaptea” (ziua, până la 23:00), „Închide”.
- **Bara de stamina pe panoul mic** (decis de autor): la Dormi, la muncă (câmp, vaci, moară) și la lemne, cu mouse-ul pe un buton, bara arată cât ar crește stamina (somnul, partea mai deschisă) sau cât ar scădea (munca, partea roșiatică), cu „+30” / „−20” lângă cifră. Locul și mărimea ei se aleg în editor, la Aranjare → „Panoul mic (Dormi, Muncă): bara de stamina” (`data/aranjare/panou.json`; panoul de acolo e doar reper).
- **Apa de la fântână** (bucătăria): cel mult de două ori pe zi (decis; `maxPeZi` la acțiune, numărătoarea în salvare, `folosiri`). **Pâinea de pe masă** (bucătăria, decis de autor): o pâine pe zi, cu imaginea ei (`locations/munca_paine.png`); **seara și noaptea nici apa, nici pâinea nu se mai pot lua** (zonele nu se mai apasă, decis de autor).
- **Lemnele** (pădurea, „Adună lemne”, decis de autor): pe panoul mic alegi o oră (−10 stamina) sau două ore (−20 stamina); cel mult de două ori pe zi (`variante` și `maxPeZi` la acțiune). Câte lemne aduci decide mini-jocul (mai jos).
- **Mini-jocurile** (decis de autor, `src/miniJocuri.js`; se opresc din Opțiuni, „Mini-jocurile”, ținut minte în browser), pe tot ecranul, peste imaginea muncii, cu „Începe”: **lemnele**, un cerc care se strânge spre un inel auriu, 3 lovituri, o oră = 1 lemn pe lovitură reușită (0–3), două ore = 2 (0–6), oprite: 2 / 4; **aratul**, oprești semnul în zona verde a barei (3 brazde); **mulsul**, clic în ritm când cercul pulsând e cel mai mare (6 bătăi); **moara**, clic repede să umpli sacul în 6 secunde (se mai și scurge). Bucata fiecărui mini-joc (inelul, bara, cercul, sacul și secundele) se mută și se mărește pe imaginea muncii în editor, la Aranjare → Ecrane → „Mini-joc: …” (decis de autor). Prea obosit: doar gândul lui Vale, fără panou (decis de autor). La muncă (`miniJoc` în `config.munca`): perfect = +50% monede, ratat de tot = jumătate, oprite = suma de pe oră. **Ierburile lui Elian**: 13 plante pe imaginea culesului (4 sunătoare, câte 3 din celelalte), la întâmplare în zona desenată de autor în editor (Aranjare → Ecrane → „Culesul (mini-joc)”, unde se alege și mărimea plantelor); culegi cel mult 4, fiecare sunătoare = 1 fir; oprite: 2 fire, alese singur.
- **Munca** (câmpul, vacile, moara) și **adunatul lemnelor**, cu mini-jocurile oprite, arată, cât durează, o imagine pe tot ecranul câteva secunde, ca la vânătoare (decis de autor; `imagine` și `text` la muncă în `config.json` / la acțiune: `locations/munca_arat.png`, `munca_vaci.png`, `munca_moara.png`, `munca_lemne.png`, iar la apa de la fântână `munca_apa.png`; un clic o sare). **Noaptea** nu se lucrează la câmp, la vaci sau la moară, nu se vânează și nu se adună lemne (decis de autor; plantele se culeg oricum doar dimineața): doar gândul lui Vale (`gandNoapte`, ciorne).

### Rutinele personajelor

Fiecare personaj cu nume are în `npcs.json` câte un loc pentru fiecare moment al zilei, cu o mică șansă de abatere și o listă de locuri unde se poate abate. **Zarul pentru abatere se aruncă o singură dată pe moment al zilei** (cu seed din zi + moment), ca personajele să nu apară și să dispară când ieși și reintri în scenă.

```json
"fierar": {
  "rutina": {
    "dimineata": { "loc": "fierar/interior", "sansaAbatere": 0.1, "abatere": ["piata"] },
    "amiaza":    { "loc": "fierar/interior", "sansaAbatere": 0.1, "abatere": ["taverna/parter"] },
    "seara":     { "loc": "taverna/parter",  "sansaAbatere": 0.2, "abatere": ["fierar/interior"] },
    "noaptea":   { "loc": "fierar/camera",   "sansaAbatere": 0.0 }
  }
}
```

**Program pe ore** (decis pentru Miriam): în loc de rutina pe momente, un personaj poate avea `program` cu intervale exacte (`de`, `pana`, `loc`, opțional `zile` și `doarme`). Miriam: în timpul săptămânii doarme până la 07 și e în bucătărie 07–11 (micul dejun); sâmbăta și duminica e 05–08 la biserică (se roagă) și în bucătărie 08–11; 11–14 camera ei (coase), 14–18 piața (la tarabe; are dialogul ei acolo), 18–23 bucătărie (cina, alt sprite), 23–05 camera ei (doarme). Cât doarme, camera ei e încuiată (gândul lui Vale). **Zilele săptămânii:** ziua 1 e luni; se văd în HUD.

**Taverna** (decis): deschisă 09:00–02:00 (închisă: gândul lui Vale; noaptea, 02–05, „Agnes a închis pe ziua de azi. Revin mâine dimineață.”; dimineața, 05–09, „Agnes n-a deschis încă. Revin mai târziu.”, decis de autor). **Agnes** (hangița): 02–09 doarme, 09–12 pregătește taverna (sprite `_dimineata`), 12–16 servește afară (sprite pe imaginea zonei), 16–02 la tejghea. **Roderick**: 00–10 doarme (nimeni nu știe unde; poate, după recrutare, la Camp site), 10–14 la biserică (se roagă pentru fratele lui), 14–18 în tavernă, 18–00 în tavernă cu alt sprite (`_seara`). **Sala tavernei păstrează filtrul de seară până se închide** (23:00–02:00, în loc de cel de noapte), `filtruSeara` în `locations.json`. Fără program separat de weekend. **Camera de la tavernă** se închiriază de la Agnes (5 monede) și ține până la prânzul de după noaptea plătită; poți dormi și după ce se închide taverna.

**Programul fierarului** (decis): luni–vineri 06–12 lucrează afară (zona fierăriei), 12–14 prânzul la tavernă, 14–18 afară, 18–22 lucrează înăuntru (magazinul), 22–06 doarme în camera lui (fără sprite acolo: cât doarme, Vale nu intră nici cu cheia, se gândește că nu vrea să-l deranjeze; ziua camera e goală). Sâmbăta și duminica: 05–08 la biserică (se roagă), 08–12 afară, 12–14 tavernă, 14–18 afară (decis: nu mai ajută la câmpuri, acolo nu lucrează nimeni după 13), 18–22 înăuntru, 22–06 doarme. **Orcii de la poartă** (decis): colectorul 06–12 la masa taxei, 12–14 mănâncă acolo (`_pranz`), 14–18 plecat (nu joacă zaruri cu paznicii), 18–23 de pază cu o torță (`_noaptea`, în locul celui de-al doilea paznic; se poate plăti taxa și atunci), 23–06 plecat. Paznicul: 06–12 de pază, 12–14 mănâncă lângă foc (`_pranz`), 14–18 joacă zaruri cu al doilea paznic (`_zaruri`: **un singur sprite cu amândoi**), 18–23 la foc, ascute toporul (`_seara`), 23–06 doarme sprijinit de zid (`_doarme`; apăsat, Vale nu-l trezește). Al doilea paznic: 06–12 de pază, 12–14 plecat (cât mănâncă ceilalți), 14–18 la zaruri (e în sprite-ul primului), 18–06 plecat (noaptea e colectorul de pază). **Paznicul spune o replică la întâmplare** (dialogul `paznic_orc`, ciornă de Claude): seara, după scandal (ajutat/refuzat) sau după o taxă ratată are replici speciale; altfel una din listă (`aleator` în `start`). **Noaptea, cât doarme Bram (22–06), la ușa fierăriei Vale se gândește că revine mâine** (decis de autor). **Magazinul e închis când fierarul nu e acasă** (afară sau înăuntru, treaz); se poate deschide doar cu cheia fierarului, primită după o misiune (`TODO` care). Gândul lui Vale la ușa închisă e o ciornă.

### Bani

O singură monedă: **monede**. Cifrele de pornire sunt în `config.json`.

- **De unde vin banii:** muncă la câmpuri (~3 monede pe oră, deci ~15-20 pe o zi de muncă), vânat (carne și piei vândute la negustor), evenimente, misiuni.
- **Pe ce se duc:** taxa (50 pe săptămână), mâncare, cameră la tavernă, echipament, eliberarea hoțului, materiale pentru casă.
- **Regula de echilibru:** dacă muncești în jumătate din zile, taxa îți ia cam jumătate din venit.

### Taxa orcilor

- `taxa.suma`: 50 de monede, `taxa.interval`: 7 zile.
- Se plătește la poartă (apeși pe orcul colector, `dialogTaxa` în `npcs.json`) **sau** când orcul colector vine la casa lui Vale, la fiecare 7 zile. Replicile lui sunt `TODO` în `config.json` (`taxa.textColector`, `textColectorPoarta`, `textColectorPlatit`).
- **Ratările au trepte** (`TODO`, propunere de pornire):
  1. orcii iau un obiect (`TODO`: care) și scade reputația în sat;
  2. o pedeapsă mai grea (`TODO`);
  3. game over.

**Reputația** în sat e un număr. Efectul ei (prețuri, relații, evenimente) e `TODO`.

### Orcii care fac dezordine (decis)

- **Evenimente** (categoria `orci` în `events.json`, texte ciornă de Claude): colectorul, în rondul lui de după-amiază (14–18), la piață (ia marfa negustorului), la tavernă (bere gratis de la Agnes, 16–18); patrula de orci (orcul normal) care ia grâul fermierilor la câmpuri (08–13; „Lasă grâul!” duce la o bătaie cu orcul, decis de autor), răstoarnă taraba (08–14; doi orci, lupta e cu amândoi), bate la ușa casei (08–21) sau îi cere lui Bram să-i ascută toporul pe gratis, la fierărie (cât Bram lucrează afară; dacă intervii, te bați cu orcul alături de Bram); **interdicția de noapte** (afară, noaptea: amendă, fugi cu 50% șanse sau te bați). La fiecare poți interveni (reputație, dar riști pedeapsa sau o bătaie fără fugă; fără încredere, decis de autor: încrederea vine doar din misiuni), plăti tu sau tăcea (reputația scade). Fiecare are **o imagine** pe tot ecranul înainte de text, `events/<id>.png` (în galerie: „Eveniment: Orcii prin sat”).
- **Ritmul** (decis: „să nu se învârtă jocul doar în jurul lor”): cel mult un eveniment cu orci pe zi, **fără pauză obligatorie**, și **niciunul în prima săptămână** (încep din ziua 8, `dinZiua`). În fiecare zi e o șansă (40%); după o zi cu eveniment scade la jumătate (20%), după două zile la rând încă la jumătate (10%), iar fiecare zi liniștită o ridică cu 15%, până la 70% (`categoriiEvenimente` în `config.json`). Fiecare eveniment în parte revine abia după 6 zile.
- **Pedepsele** (`pedepse` în `config.json`): cu o șansă (35%), orcii sunt „binevoitori” și te lasă să alegi; altfel aleg ei: **biciuire** (−25 viață, minimum 5), **taxa crește** cu 10, **predai un obiect** (îl alegi tu sau îl iau ei la întâmplare), **3 blăni de lup în 3 zile** la colector (altfel **taxa următoare e dublă**). Blana de lup (`blana_lup`) vine de la vânătoarea de lupi; datoria se vede în HUD.

## 12. Condiții

Jocul verifică condiții în **patru locuri**: evenimente, locuri încuiate, locuri ascunse și variante de imagine. Toate folosesc **același format** și sunt verificate de **o singură funcție**:

```json
"conditii": {
  "moment": ["amiaza", "seara"],
  "ora": { "min": "17:30" },
  "loc": "padure/interior",
  "stare": { "acoperis": "reparat" },
  "areObiect": "cheie_fierar",
  "misiune": { "vanatoare_01": "terminata" },
  "relatie": { "fierar": { "min": 40 } },
  "sansa": 0.2
}
```

Toate câmpurile trebuie îndeplinite (ȘI). Tipurile de condiții stau într-un **registru de funcții**, ca să se poată adăuga altele ușor.

## 13. Evenimente

Un eveniment e o scenă cu imagine sau portret, text și 2-3 alegeri, declanșată de condiții. Tot conținutul stă în `events.json`.

```json
{
  "id": "barfa_taverna",
  "conditii": { "loc": "taverna/parter", "moment": ["seara"], "sansa": 0.5 },
  "repetare": { "pauzaZile": 3 },
  "vorbitor": "hangita",
  "emotie": "normal",
  "text": "Ai auzit ce s-a întâmplat la moară?",
  "alegeri": [
    { "text": "Mai spune-mi.", "efecte": { "timp": 20, "relatie": { "hangita": 1 } } },
    { "text": "Altă dată.", "efecte": {} }
  ]
}
```

**`repetare`** spune dacă evenimentul poate reveni:
- `"o_data"` (implicit): apare o singură dată în tot jocul, de exemplu scandalul din tavernă;
- `"mereu"`: poate reveni oricând, de exemplu vânatul;
- `{ "pauzaZile": 3 }`: poate reveni, dar nu mai des de o dată la 3 zile, de exemplu bârfele de la tavernă.

**Evenimente cu imagini** (decis): un eveniment poate avea `imagini` (scene pe tot ecranul, fără text, derulate cu click), apoi text cu alegeri sau un `dialog` întreg. `manual: true` = pornește doar dintr-un efect (`"eveniment": id`), din dialog sau după o luptă (`victorie`/`infrangere` din `lupte.json`). Imaginile stau în `assets/events/`, iar galeria le grupează pe eveniment (`grup`).

**Scandalul din tavernă** (decis, o singură dată): o replică din dialogul cu Roderick (doar când Agnes e în tavernă, deci 16–00) pornește 3 imagini cu orcii care intră, o agresează pe Agnes și fac dezordine. Alegi:
- **îl ajuți:** luptă Vale + Roderick contra 2 orci slabi, fără fugă (pozele paznicilor de la poartă). **Victorie:** o imagine, Agnes te hrănește (foame și sete pline), îți dă 3 pâini și 2 beri, iar taxa crește cu 10 de atunci încolo. **Înfrângere:** o imagine, rămâi cu 10 viață și trec 2 ore. În ambele cazuri Roderick devine recrutabil (cum: `TODO`).
- **refuzi:** 2 imagini (decis de autor) cu Roderick bătut și orcii plecând râzând, apoi un dialog cu el (rănit). **Tot scandalul se petrece peste imaginile lui** (decis de autor): replicile stau peste imagini (`imagine` la replică), de la prima imagine până la ultima replică, fără să se întoarcă la tavernă; victoria și înfrângerea la fel. Galeria din meniu ține minte și imaginile de sub replici (`imaginiVazute` în salvare). Lipsește 2 zile din tavernă; **tot poate fi recrutat** mai târziu, doar nu primește încrederea (decis de autor). **Până la scandal, Roderick nu-l bagă în seamă pe Vale**; scandalul pornește din misiunea lui, din ziua 3 („*Orcii fac multă dezordine și gălăgie...*”).

Bețivul care te provoacă la bătaie apare doar după scandal; **bătaia e unu la unu, doar Vale și un bețiv, cu pumnii și fără armură, iar muzica tavernei continuă** (decis de autor; `doarVale`, `faraEchipament`, `faraMuzica` la luptă în `lupte.json`). **Prima discuție** cu fiecare personaj e o prezentare, cu o singură replică (la Agnes și „Cumpără”).

**Efecte posibile:** timp, bani, nevoi, reputație, relație cu un personaj, obiect primit/dat, schimbare de stare, deblocare de loc, pornire de misiune, pornire de luptă. Efectele stau într-un **registru de funcții** (nu un `switch` uriaș). Același registru e folosit și de abilitățile din luptă.

Tipuri pentru cele ~10 evenimente de pornire: cereri de ajutor, oferte de muncă mărunte, negustori și schimburi, bârfe și străini la tavernă, vizita orcului colector, momente cu mama. Începe cu 3-5 evenimente de test.

## 14. Inventar și echipament

### Inventarul (sloturi, stive, cufăr)

- Inventarul are un număr de **sloturi**, iar rucsacul îl mărește: fără rucsac 3 (decis), rucsacul de pânză 8 (decis), cel de piele 16 (`TODO`). Rucsacul de pânză stă deocamdată în cufărul de acasă de la începutul jocului (`start.cufar`; `TODO`: cum face rost Vale de el); din cufăr, echipamentul se poate echipa direct (ce se dă jos rămâne în cufăr). Salvarea e la versiunea 4: cine n-are rucsacul îl primește în cufăr.
- **Stive:** obiectele de același fel stau în același slot, până la o limită per obiect (de exemplu 5 pâini, 3 sticle de apă, 10 bucăți de lemn, 20 de săgeți). Echipamentul nu se stivuiește.
- **Obiectele mari ocupă 2 sloturi:** armele cu două mâini, pieile mari (blana de lup, pielea de mistreț și arcul ocupă doar unul, decis de autor; arcul tot ține ambele mâini).
- **Echipamentul purtat nu ocupă sloturi.**
- **Obiectele de poveste** (chei, scrisori) stau pe o pagină separată, fără limită, și nu se pot pierde.
- **Cufărul de acasă:** un depozit mare (~40 de sloturi, `TODO`).
- **Inventar plin:** apare mesajul „N-ai loc pentru X”, cu butoanele *Aruncă ceva* și *Lasă-l*.
- **Rucsac mai mic:** se poate echipa doar dacă încap obiectele. Altfel apare mesajul „Golește mai întâi N sloturi”.

### Ecranul de inventar și echipament (decis, după designul autorului)

- **Stânga, „Echipament”:** figura lui Vale în A-pose (`ui_vale_apoza.png`), pe piedestalul din fundal (`ui_inventar_fundal.png`, cu fundal transparent: ecranul stă peste locația în care ești, întunecată și estompată, ca meniul), cu sloturile în jur, **legate de corp cu linii aurii desenate din cod**; capătul de pe corp al fiecărei linii e un punct care se trage în editor („Capătul liniei: …”). Figura nu se schimbă după echipament; în sloturi apar **iconițele** obiectelor, iar un slot gol arată simbolul lui (`ui_slot_<slot>.png`; până se încarcă, numele slotului).
- **Dreapta, „Inventar”:** o foaie de pergament (`ui_inventar_foaie.png`, 900×1250) cu rucsacul (grilă de 4 coloane, „Rucsac x / N”) și, jos, caseta obiectului ales (iconiță, nume, ce face, butoane de pergament: Mănâncă/Bea, Echipează, În cufăr, Aruncă, Dă jos). **Semnul de carte** (`ui_inventar_semn.png`) comută foaia pe **obiectele de poveste**. Butonul „Închide” e pergamentul din meniu.
- **La cufăr** (camera lui Vale): în stânga apare a doua foaie, cufărul (40 de locuri), în locul lui Vale; rucsacul rămâne în dreapta, ca peste tot (decis de autor: mereu în aceeași parte).
- **Bara nevoii în inventar** (decis de autor): una singură, așezată în editor („Bara nevoii”); apare doar când alegi ceva de mâncat sau de băut și arată nevoia pe care o umple (pâinea → foamea, apa → setea, poțiunea → viața), cu partea mai deschisă, pulsând, cât ar crește, și „+25” lângă cifră; un obiect care umple două nevoi (berea: setea și stamina) are două bare, una sub alta. Aceleași piese ca barele din HUD.
- **Monedele în rucsac** (decis de autor): o căsuță cu iconița lor (`items/monede.png`), mereu prima, cu toate monedele una peste alta și numărul pe ea; **ocupă un loc** din rucsac (fără rucsac: monedele + 2 obiecte). La fel în rucsacul din magazin.
- Toate bucățile (figura, sloturile, foaia, semnul, titlurile, „Închide”, bara nevoii) se mută și se măresc în editor, la Aranjare → „Ecranul de inventar și echipament”. Piesele se încarcă în galerie, la grupul **Inventarul** (`ui_slot_echipament.png` + `_hover` pentru ramele de lângă Vale, `ui_slot.png` + `_hover` pentru căsuțele de pe foaie).
- **Drag & drop** din inventar în sloturi și înapoi (și între rucsac și cufăr). Un slot nepotrivit refuză obiectul (de exemplu jambierele pe cap).
- **Sloturi** (decis: fără mănuși și bocanci): `cap` (Coif), `armura` (Armură, pentru tors), `jambiere` (Jambiere), `arma_primara`, `arma_secundara`, `rucsac`. **Armele cu două mâini ocupă ambele sloturi de armă.** Migrarea la versiunea 3 mută haina pe `armura`, pantalonii pe `jambiere` și scoate mănușile și bocancii.
- Fiecare obiect are o **iconiță** (`assets/items/<id>.png`, ideal 512 × 512, fundal transparent); peste tot își păstrează forma (una care nu e pătrată stă centrată, nu se turtește) și se centrează după partea ei plină (golul transparent și umbra fină dintr-o parte nu o mai împing într-o latură a căsuței); în ramele de lângă Vale, iconița și simbolul stau pe mijlocul deschiderii ramei (măsurată din `ui_slot_echipament.png`), nu al pătratului.

### Magazinul (decis, după designul inventarului)

- Același ecran la negustorul din piață, la Bram și la Agnes (`src/ecranMagazin.js`): peste scena estompată, cu fundalul lui (`ui_magazin_fundal.png`, 1920×1080, transparent; în galerie la grupul **Magazinul**), două foi de pergament (aceleași piese ca la inventar): **stânga, marfa** („Marfa lui Bram”, „Marfa negustorului”, „Marfa Agnesei”, `titlu` la magazin), cu prețul sub fiecare obiect (roșu dacă n-ai destui bani); **dreapta, rucsacul lui Vale**, cu prețul de vânzare sub ce cumpără negustorul (restul e estompat). Jos, pe foaia obiectului ales, caseta cu „Cumpără · X monede” / „Vinde · X monede”. Sus, monedele lui Vale. Fără bani sau fără loc în rucsac: gândul lui Vale.
- Bucățile (cele două foi, monedele, „Închide”) se aranjează în editor, la Aranjare → „Magazinul”.
- **Schimburile** (decis de autor, Elian și Miriam): același ecran, dar în stânga stau schimburile (ce dai, unul sau mai multe materiale → săgeata → ce primești, cu câte ai sub ce dai), iar jos „Schimbă”; fără monede sus. **Un schimb pentru care n-ai destule e decolorat** (decis de autor); lista lungă se derulează.
- **Miriam coase piesele de piele** (decis de autor): glugă, vestă, jambiere și rucsacul de piele **nu le mai vinde Bram**; le face mama, cât coase (11–14, în camera ei), din piei („Mamă, mi-ai putea coase ceva din piei?”): glugă = 2 blăni de lup, jambiere = 2 piei de mistreț, vestă = 3 piei de mistreț, rucsac = 2 piei de mistreț + 2 blăni de lup (`TODO` echilibru, ales de Claude; `magazin` la Miriam în `npcs.json`).

## 15. Lupta pe ture

Același sistem e folosit peste tot: vânătoare, bătăi la tavernă, salvarea cuiva de orci, lupta finală. Fiecare luptă e descrisă în `lupte.json`: participanți, fundal (refolosește scena locului), dacă se poate fugi, recompense și **ce se întâmplă la înfrângere** (diferit de la o luptă la alta).

### Așezarea

- Echipa ta e în **stânga**, inamicii în **dreapta**. Grupul are **maximum 6 personaje**. La început Vale luptă singur.
- Fiecare tabără are **3 linii orizontale**. Pe fiecare linie e un loc **în față** și unul **în spate**.
- **Atacurile apropiate** pot ținti doar personaje din față. Pot ținti pe cineva din spate **numai dacă locul din fața lui, pe aceeași linie, e gol sau personajul de acolo a căzut**. Exemplu: Vale e în spate, fierarul în fața lui. Cât timp fierarul stă în picioare, Vale nu poate fi atacat apropiat. Când fierarul cade, Vale poate fi atacat apropiat.
- **Atacurile de la distanță și magia** pot ținti pe oricine.
- **Din spate nu se poate ataca apropiat**, doar de la distanță, cu magie sau cu abilități de sprijin.
- Formația se alege înainte de luptă și rămâne salvată.

### Bara de stamina (bara de acțiune)

- Se umple în timp, de la 0 la 100. **Cu cât `staminaMax` e mai mare, cu atât se umple mai repede**, iar personajul acționează mai des.
- Când bara e plină, personajul acționează și bara se golește.
- **Abilitățile grele** fac bara să se umple **mai încet** până la mișcarea următoare (costul e per abilitate: durează cât ar fi durat de la −cost la 100), deci personajul așteaptă mai mult. Bara pornește de la 0 și se vede cum urcă.
- Când un personaj al jucătorului e gata, **timpul se oprește** până se alege acțiunea.
- Sus pe ecran se vede **ordinea următoare**: medalioane cu portrete, în ordinea în care vor acționa (vezi „Ecranul de luptă”).
- Vale obosit (stamina din nevoi sub 30) pornește lupta cu bara goală, iar Vale odihnit o pornește pe jumătate plină.
- Fiecare personaj are o bară de **viață** (cu armura gri peste vârful ei) și una de **stamina**, pe verticală, în stânga lui.

### Acțiuni

| Acțiune | Ce face |
|---|---|
| **Atac** | Daunele vin din **arma echipată**: un număr întreg la întâmplare între minimul și maximul ei, inclusiv capetele (de exemplu sabie 11-13 dă 11, 12 sau 13). Arma spune și tipul: apropiat sau distanță. Fără armă: pumni, 1-3. Recruții au arma lor în `npcs.json`. |
| **Apărare** | Până la tura următoare a personajului, daunele primite scad cu procentul de **blocare**: 50% implicit, iar cu scut cât spune scutul (de exemplu 70%). |
| **Obiect** | Inventarul lui Vale e **comun în luptă**: orice aliat îl poate folosi în tura lui (de exemplu o poțiune de viață). Consumă tura. |
| **Schimbă locul** | Se mută pe un loc liber sau face schimb cu cel de pe aceeași linie (față ↔ spate). Consumă tura. |
| **Schimbă arma** | Doar Vale (decis de autor): alege o armă sau scutul din rucsac și o echipează de-adevăratelea (cea veche intră în rucsac; dacă nu încape, apare de ce și tura rămâne a lui). Pozele, atacul, blocarea și armura scutului urmează noul echipament. Consumă tura (decis de Claude, ca la „Schimbă locul”). |
| **Abilitate** | Doar personajele care au abilități. **Preotul nu atacă normal** (`faraAtac`), are doar 3 puteri: vindecare, **golește bara de stamina a unui inamic** și **scutul de lumină** (pus în fața unui aliat, oprește complet următoarea lovitură, fără daune, nici la armură; rămâne până e lovit). Imaginea scutului: `combat/scut_lumina.png`, cu mărimea reglabilă în galerie. Efectele folosesc registrul din secțiunea 13. |
| **Fugi** | Doar în luptele unde e permis. Reușește sigur (alegere simplă, se poate schimba). |

**Armura** (decis de autor, simplu și vizibil):
- Fiecare piesă de echipament adaugă **puncte de armură** la o **bară gri, peste viață**: griul acoperă vârful roșului (bara e doar viața). Așa se vede cât aduce fiecare piesă.
- **La lovituri, griul se retrage în sus până dă de viață, apoi viața scade în jos** (decis de autor).
- **Loviturile golesc întâi armura, apoi viața.** *Apărarea* scade lovitura (50%, cu scut cât spune scutul) înainte să ajungă la armură.
- La **fiecare luptă** armura pornește plină (nu se uzează între lupte). Inamicii și recruții pot avea și ei armură (`armura` în `lupte.json` / `npcs.json`).
- Cifrele de pornire: glugă 5, vestă 10, jambiere 5, scut 5 (Vale are 100 viață); Roderick 15, Bram 30, Kaia 8; lupul negru 8, mistrețul și colectorul 10 (`TODO` echilibru).

**Otrava** (decis de autor, șobolanul care scuipă): un atac cu `otrava` (`daune`, `ture`) otrăvește ținta; la fiecare tură a ei pierde viața aceea, trecând de armură (număr verde, tentă verzuie pe luptător).

**Căderea:** la viață 0, personajul **cade**, dar nu moare. După luptă se ridică: recruții cu viața plină, Vale cu puțină viață (`TODO` cât).

**Inamicii** aleg o țintă validă la întâmplare. **Se și apără** (decis de autor): uneori (10%), mai des când sunt răniți (35% sub 35% din viață); un inamic din spate care nu poate lovi de acolo **trece în față**, pe un loc liber (întâi pe linia lui), altfel se apără (`lupta.inamici` în `config.json`, `TODO` echilibru). Unii pot avea preferințe în JSON (de exemplu „lovește pe cel mai slăbit”).

### Ecranul de luptă (decis, după designul autorului: „sat sărac, dar îngrijit”, lemn simplu, fier, pânză albastră)

- **Sus:** bara de lemn (`ui_lupta_bara_sus.png`) cu **medalioanele** celor care urmează, în ordinea turelor (**următorii 6**, la mărimea lor, nu întinși; primul e puțin mai mare și luminat; rândul de medalioane e o bucată separată în editor, „Medalioanele”, așezată peste lemnul barii; rama stă fix pe marginea portretului, fața umple exact fereastra ramei, măsurată din imagine, iar eticheta e lată cât rama), cu rama aurie la aliați și roșie la inamici (`ui_lupta_rama.png`, `ui_lupta_rama_inamic.png`) și **numele dedesubt**, pe o etichetă de pânză (`ui_lupta_eticheta.png`). Portretul din medalion e fața din portretul de dialog (decis: fără poze separate de medalion), tăiată pătrat, doar în fereastra ramei; medalioanele cresc odată cu bara. Sub bară, **jurnalul** (`ui_lupta_jurnal.png`).
- **Lângă fiecare luptător**, în stânga lui (la inamici în dreapta), **viața și stamina pe verticală**, fără nume (`ui_lupta_bara_verticala.png` e rama; umplerea e din cod); armura e griul de peste vârful vieții.
- **Jos:** tabla de acțiuni (`ui_lupta_actiuni.png`) cu **butoane pătrate doar cu iconițe** (`ui_lupta_buton.png` + `_hover`; numele apare deasupra, pe eticheta de pânză, la hover): Atac, fiecare putere separat (preotul n-are Atac, are Vindecare, Golește bara, Scutul de lumină), Apărare, Obiect (deschide obiectele de luptă, cu iconița și câte bucăți ai), Schimbă arma (doar Vale), Schimbă locul, Fugi. Când alegi ținta sau locul, pe tablă e îndemnul și „Înapoi”. Iconițele: `ui_icon_atac/aparare/obiect/schimba/schimba_arma/fugi/vindecare/goleste_bara/scut_lumina.png` (o putere ia iconița după id-ul ei: `golesteBara` → `goleste_bara`).
- **Pe jos:** inelul auriu sub cel care e la rând (`ui_lupta_inel.png`), cel roșu sub inamicul de sub mouse când alegi ținta (`ui_lupta_inel_tinta.png`).
- **Rezultatul** (victorie, înfrângere, fugă) apare pe panoul mic (ca la Dormi). Butonul de viteză folosește butonul pătrat de lemn.
- **Aranjarea** (decis): bara de sus, jurnalul, tabla de acțiuni și butonul de viteză se mută și se măresc în editor, la Aranjare → „Ecranul de luptă: interfața” (`data/aranjare/lupta_interfata.json`); medalioanele, butoanele și textele cresc odată cu înălțimea bucății, iar lățimea urmează forma imaginii. În luptă, tabla stă jos (și la „Schimbă locul”). **La formație** (înainte de luptă), bara turelor și jurnalul nu apar: doar tabla cu „Începe lupta”, sus, în locul barii (bucata „Tabla de la formație”, aranjabilă separat).
- **Locurile libere** (formația, „Schimbă locul”) sunt inelul auriu de pe jos (`ui_lupta_inel.png`), stins, aprins la hover (decis: fără cercurile verzi). La „Schimbă locul”, partea din stânga a tablei de jos devine străvezie și lasă clicul să treacă, ca să se vadă și să se poată alege și locurile de sub ea.
- **Barele verticale:** la aliați în stânga, **la inamici în dreapta** (decis).
- **Hover pe un luptător** (oricând în luptă): o strălucire fină și numele lui pe eticheta de pânză, **în dreapta aliaților, în stânga inamicilor**. Sub medalion se scrie numele scurt, unde e lung (`numeScurt` în `npcs.json` / `lupte.json`: „F. Elian”, „Orc C.”).
- Iconițele din butoane își păstrează forma (nu se turtesc); hover-ul butonului iese în afară cu marginea lui (cu minus, reglabilă la Interfață), ca lemnul să nu pară mai mic; fără căsuța albă de nume a browserului.
- Toate piesele: în galerie la grupul **„Luptă: interfața”**.

### Imaginile de luptă (`assets/combat/`)

Fiecare personaj are **5 poze**: `idle`, `atac`, `aparare`, `lovit` (reacția scurtă la o lovitură) și `cazut` (răpus, rămâne așa până la sfârșitul luptei). Poza de luptă e `lovit`, nu `ranit`, ca să nu se confunde cu portretul rănit (`<id>_ranit.png`). Toate pe aceeași pânză 2:3 și la aceeași mărime. Codul adaugă mișcarea (se aruncă înainte la atac, tremură la lovitură). Dacă `cazut` lipsește, căderea folosește `lovit`, înclinată și pălită din cod.

- **Vale** are câte un set de 5 poze **pentru fiecare tip de armă** (nu pentru fiecare armă): `vale_<tipArma>_<poza>.png`, de exemplu `vale_sabie_atac.png`. Tipurile de armă (6 seturi, deci 30 de poze):

  | `tipArma` | Când |
  |---|---|
  | `pumni` | fără armă |
  | `sabie` | sabie într-o mână, fără scut |
  | `sabie_scut` | sabie într-o mână și scut în mâna a doua |
  | `sabie_doua_maini` | sabie mare, cu două mâini |
  | `topor_doua_maini` | topor mare, cu două mâini |
  | `arc` | arc (ocupă ambele mâini) |

  Setul se alege din arma primară, plus dacă în mâna a doua e un scut.
- **Restul personajelor:** `<id>_<poza>.png`, de exemplu `fierar_atac.png`, `paznic_orc_1_lovit.png`. Un inamic poate refolosi pozele altuia (`poze` în `lupte.json`).
- **Personaje late** (`locuri: 2` la statisticile de luptă, de exemplu vânătoarea pe tigru): țin toată linia (față și spate), stau pe mijlocul ei și au pozele de luptă **late, 3:2** (1536×1024), nu 2:3. Se mută doar pe o linie întreagă liberă.
- O luptă poate avea **aliați de o singură luptă** (`aliati` în `lupte.json`), de exemplu Roderick în scandal, fără să fie recrutat.
- **Aliații privesc spre dreapta, inamicii spre stânga.**
- **Mărimea fiecărei poze de luptă, pe fiecare zonă de luptă**, se reglează în galerie, pe cardul pozei, în procente (`data/aranjare/marimi_lupta.json`, `imaginiHarti`; dacă lipsește, se folosește mărimea ei generală mai veche, `marimi`); butonul „Primul procent la toate zonele” de pe card (decis de autor) pune procentul primei zone pe toate zonele, **doar la poza aceea**. În plus, **fiecare hartă de luptă** are mărimea tuturor personajelor de pe ea (`harti`). Procentele se înmulțesc.
- **Hărțile de luptă** (decis): imagini separate, `locations/lupta_<zona>_<loc>.png`, doar pentru locurile din `harti` în `lupte.json` (acum sala tavernei, adâncul pădurii, poarta, piața, fierăria și câmpurile: toate locurile cu lupte, decis de autor). Până e încărcată, se vede scena locului. Cele 12 locuri ale luptătorilor (6 aliați, 6 inamici) se mută în editor, la Aranjare → Hărți de luptă (sau din galerie, „Aranjează locurile luptătorilor”).
- **Armă aruncată** (`proiectil` la atac, de exemplu glaive-ul Kaiei, aceeași imagine ca decorul de la campsite): în poza `atac` mâna e goală, iar arma zboară rotindu-se la fiecare țintă (ricoșeul) și se întoarce. Mărimea ei în luptă se reglează în galerie, pe cardul imaginii.
- **Săgeata arcului** (decis): când Vale trage cu arcul, din el zboară drept spre țintă `combat/sageata.png` (orizontală, vârful spre dreapta, 1024×256, fundal transparent; `sageata` la atacul arcului în `items.json`), fără să se întoarcă; arcașul nu se aruncă înainte ca la sabie. Mărimea ei în luptă se reglează în galerie, pe cardul imaginii. Săgețile din inventar nu se consumă (deocamdată).
- Abilitățile folosesc poza `atac`, fără strălucire din cod (decis de autor: poza de cast ajunge). O putere poate avea **poza ei** (`poza` la abilitate): preotul are câte una pentru fiecare putere, `mag_vindecare.png`, `mag_goleste_bara.png`, `mag_scut_lumina.png`; până e încărcată, se folosește `atac` (la preot, care nu atacă și n-are poza `atac`, se folosește `idle`).

## 16. Personaje

| `id` | Rol | Unde îl găsești | Recrutare |
|---|---|---|---|
| `vale` | Protagonist | – | – |
| `miriam` | Mama | Casă | nu se recrutează |
| `soldat` | **Roderick Lightfinder**, unchiul lui Vale (fratele tatălui), fost soldat, în hainele lui vechi de soldat; luptă apropiat | Taverna, biserica dimineața | încredere 8/10 (decis: și dacă nu l-ai ajutat în scandal; atunci doar nu primește +1); cum anume, `TODO` |
| `fierar` | **Bram Emberforge**, fierarul; tank | Fierăria | relație suficientă |
| `hot` | **Finn** (decis de autor), tânărul hoț, legat la butuc; a furat din nevoie, ca să-și hrănească familia (decis de autor). Negustorul îl eliberează pentru **40 de monede** (`TODO` suma), dar abia după ce Vale vorbește cu el la butuc și îl crede (misiunea „Eliberarea”, făcută); apoi Finn îl duce acasă, la **Marginea satului**. Familia lui (decis de autor): **mama, Marta, bolnavă** (o vindecă Elian în misiunea lui Finn „Mama lui Finn”), și **sora mică, Lina**; amândouă vorbesc. **Nu luptă** (decis: cele 6 locuri din luptă sunt pline, deci n-are poze de luptă); ajută din umbră: înainte de lupta finală se strecoară la poartă și fură cheia sau strică ceva, ca lupta să fie mai ușoară (un orc în minus sau orcii pornesc cu bara goală), iar până atunci aduce zvonuri și indicii sau deschide lucruri încuiate (toate `TODO`) | Piața | plătești o sumă unui negustor ca să-l elibereze |
| `vanatoare` | **Kaia, vânătoarea** (Huntress în *Fangs&Honor*; numele tigrului: `TODO`), călare pe un tigru: „Vânătoare crescută în pădurile de la hotar, cu lame care se întorc în mână. Glaive-ul ei ricoșează din țintă în țintă, până la trei deodată, antrenată împotriva grupurilor strânse.” Programul ei: 05–10 la campsite (decis de autor: atunci o poți întreba „Mergem împreună la vânătoare?”; vânătoarea obișnuită, cu ea sigur alături în luptă, efectul `vanatoareCu`; după luptă, un scurt dialog, după victorie sau înfrângere, apoi ea se întoarce în pădure și nu mai e la campsite până la 14:00, iar Vale rămâne în tabără, decis de autor, `dupaCuInsotitor` la vânătoare), 10–14 plecată la vânătoare (nu e nicăieri; dacă vânezi atunci, 10% șanse s-o întâlnești: o scurtă discuție, apoi luptă alături de tine), 14–23 la campsite (alt sprite, `_dupa_amiaza`), 23–05 doarme (sprite `_doarme`); dacă apeși pe ea cât doarme, Vale se gândește că nu vrea s-o trezească. Atac de la distanță care lovește până la 3 inamici (`ricoseu: 3`); **în luptă ține două locuri** (față și spate pe aceeași linie, `locuri: 2`). **Povestea** (decis): era o prietenă bună a sătenilor, venea rar prin sat; s-a strecurat prin pădure; din ziua 4, după o vânătoare câștigată, Vale o găsește față în față cu 3 lupi, încă fără luptă (se pândesc; decis de autor, ca să poată vorbi), (`kaia_intalnire`): o ajută (luptă împreună, încredere +1) sau pleacă (și o mai găsește după încă o vânătoare singur). Apoi misiunea **lupul negru** (15–17 la marginea pădurii; după „Înainte!” apare întâi imaginea vânătorii, câteva secunde, ca la o vânătoare obișnuită, apoi lupta, decis de autor, efectul `luptaVanatoare`); după ea o duce la micul ei campsite, care devine **Camp site**, locul ascuns al grupului (detalii în `docs/misiuni.md`) | Camp site-ul din pădure | `TODO` (încă nedecis) |
| `tigru` | Tigrul cu colți de sabie al Kaiei (nume `TODO`); la campsite în aceleași ore ca ea (3 sprite-uri: dimineața, `_dupa_amiaza`, `_doarme`); se vede, dar nu se apasă; fără portrete | Camp site-ul din pădure | – |
| `mag` | **Fratele Elian**, preotul-mag al luminii, **tânăr** (decis); vindecare și abilități de control, slab la început. Programul lui: 05–08 tămâie în biserică (sprite `_dimineata`), 08–14 pe bancă, privește altarul, 14–23 citește pe scări, afară (sprite pe imaginea zonei), 23–05 doarme pe o bancă în biserică (sprite `_doarme`; apăsat, Vale nu vrea să-l trezească) | Biserica | relație suficientă; orcii nu știu de el |
| `hangita` | **Agnes**, hangița; vinde mâncare și băutură, închiriază camera | Taverna | – |
| `negustor` | Personaj minor; **fără sprite** (decis): apare doar în dialog, când apeși pe hoțul legat; doar portretul `normal` | Piața | – |
| `orc_colector`, `paznic_orc_1`, `paznic_orc_2` | Orcii: **doi deocamdată** (decis), colectorul și orcul normal (paznicul); `paznic_orc_2` e doar un al doilea paznic care se vede la poartă (sprite, fără portrete, nu se apasă). **Orice orc generic** (de exemplu cei din tavernă) folosește portretele, sprite-ul și pozele de luptă ale lui `paznic_orc_1` | Poarta, casa lui Vale (colectorul) | – |

Unele personaje vin din jocul *Fangs&Honor*. Numele celorlalți recruți și motivul personal al fiecăruia împotriva orcilor sunt `TODO`.

**Încrederea (decis):** fiecare personaj important are o încredere de la 0 la 10 (`relatie` în efecte și condiții, `incredere.max` în `config.json`; nu iese din scară). **Se câștigă prin misiuni duse la capăt; recrutarea se poate de la 8/10** (decis de autor); o misiune refuzată doar nu dă încrederea, nu închide drumul. La 10 apare în dialog misiunea de recrutare; la cei care nu se recrutează (Miriam, Agnes, fermierul), la 10 apare **o misiune specială** (toate `TODO`, condiția `"relatie": { "<id>": { "min": 10 } }`). Orcii n-au încredere. În demo nu există schimb de inventar cu recruții.

**Dialogurile** (decis): toate replicile din joc sunt ciorne scrise de Claude, la cererea autorului; autorul spune ce și unde schimbă. **La misiuni, dialogurile sunt lungi, ca o poveste** (decis de autor): mai multe replici, cu personajele care vorbesc între ele și gândurile lui Vale, nu doar o replică și alegerea. Un orc fără nume propriu vorbește cu portretele lui `paznic_orc_1` și numele „Orc” (`nume` la replică).

**Cartea (decis de autor):** butonul cu cartea din HUD (sau tasta P) o deschide **la misiuni**; cartea e puțin mai mică (90%) și urcată, iar sub ea, la mijloc, stau „Închide” și un pergament la fel, „Personaje”, care trece la cartea personajelor (și înapoi, „Misiuni”). Cartea se închide **doar din „Închide”** (decis de autor): nu și cu clic pe fundal, Esc sau P. **Misiunile** (`data/misiuni.json`, `src/misiuni.js`): în stânga lista („În lucru”, apoi „Terminate”, tăiate), în dreapta misiunea aleasă (când textul nu încape, pagina se derulează cu rotița, doar între marginile paginii, decis de autor; la fel lista, care rămâne derulată unde era când alegi o misiune): de la cine e, descrierea în vocea lui Vale, pașii făcuți bifați și tăiați, pasul de acum îngroșat (cu cât ai strâns, de exemplu „(4/10)”) și, sub el, un sfat scurt (`sfat`), cei de după ascunși. O misiune are: `dela`, `titlu`, `descriere`, `pasi` (fiecare cu `text` și `gata` = condiții, sau `numara` = obiect și câte), `recompensa` (`text` în carte, `efecte` la final); pornește cu efectul `misiune: { id: "inceputa" }` („Misiune nouă” pe ecran); pașii se bifează singuri, iar la ultimul misiunea devine `terminata`. **Recompensele pe ecran** (decis de autor): când se termină o misiune, sau când primește ceva într-o discuție ori într-un eveniment (de exemplu de la Agnes după scandal), ce a primit Vale (+15 cu iconița monedelor, +1 cu iconița încrederii și numele personajului, obiectele cu iconița lor) urcă ușor pe ecran și dispare, la ultima replică a discuției (`ui_icon_incredere.png`, până atunci un romb auriu). Acțiunea `lucrare` (în `locations.json`) consumă materiale, durează, obosește, arată o imagine și aplică efecte (acum nefolosită). **Semnele** `!`/`?` apar și deasupra personajului în scenă și deasupra clădirii de pe hartă (sau a ușii din zonă) unde e el acum (decis de autor; cel mai important câștigă: ? auriu, apoi !, apoi ? gri); nu la cine doarme; pe hartă și pe ușile din zone, doar dacă Vale mai ajunge la timp (decis de autor: drumul ia timp, iar la sosire personajul trebuie să fie tot acolo, cu ceva de spus); se pot opri din Opțiuni („Semnele misiunilor”, ținut minte în browser).

**Meniul de discuție (decis de autor):** un dialog cu `meniu: true` începe cu salutul personajului (`start`), iar sub el apar opțiunile: **„Ce mai faci?”** (discuția generală, decis de autor; la cei mai în vârstă cu formă de respect, `intrebareVorba` în `npcs.json`: „Ce mai faci, mamă?”, „Ce mai faci, unchiule?”, „Ce mai faceți, domnule Bram?”, „Ce mai faceți, doamna Agnes?”, „Ce mai faceți?” la fermier și negustor; replicile din `vorbeste`, cu condiții; cele neauzite vin primele, apoi la întâmplare; stau în dialogul principal al personajului, deci sunt aceleași oriunde îl găsești), **misiunile** lui (din `misiuni.json`): **!** auriu = nouă (`oferta`, cu condițiile ei: de exemplu după o misiune a altcuiva), **?** gri = în lucru (`indiciu`: indicația pasului de acum), **?** auriu = gata de predat (`predare`); un personaj poate avea mai multe deodată, iar un pas poate fi la alt personaj (`la`); apoi `optiuni` (de exemplu „Cumpără”) și **„La revedere”**. La capătul fiecărei ramuri meniul reapare; o alegere cu `inchide: true` încheie discuția (pentru ce urmează după ea: un eveniment, o luptă). Au meniul: Miriam (acasă și în piață), Roderick (cu replica ce pornește scandalul), Agnes (Cumpără, Închiriază o cameră), Bram, Elian, Kaia și fermierul; întrebările vechi ale fiecăruia au devenit replici în „Ce mai faci?” (decis de autor). Prezentarea (prima discuție) vine înaintea meniului. Fără meniu rămân negustorul (eliberarea hoțului), orcii și discuțiile din evenimente.

**Cartea personajelor (decis):** O carte cu pagini care se întorc, câte un personaj pe fiecare două pagini: în stânga numele, încrederea (10 romburi, „x/10”) și o descriere scurtă, în vocea lui Vale, cu font de scris de mână (Dancing Script și Caveat, incluse în build, merg offline); în dreapta schița lui, `ui/carte_<id>.png` (desen în cerneală sau cărbune, 4:5, fundal transparent; în galerie la „Cartea personajelor”). Cartea deschisă poate primi o imagine, `ui/ui_carte.png` (1600×1000, două pagini goale). Săgețile au doar sunetul paginii (fără clic). Un personaj intră în carte după prima discuție cu el, în ordinea în care i-a cunoscut Vale (orcii mereu la sfârșit: colectorul penultimul, paznicul ultimul, decis de autor); Miriam e acolo de la început (`start.cunoscuti`). În carte: Miriam, Roderick, Bram, Kaia, Elian, Agnes, fermierul, hoțul, plus cei doi șobolani din pivniță (după prima coborâre, `dupaStare`; înaintea orcilor, decis de autor), orcul colector și paznicul orc (fără bara de încredere, `faraIncredere`). Schițele își păstrează forma (o schiță mai pătrată nu se turtește, stă întreagă în pagină) (`carte` în `npcs.json`; descrierile sunt ciorne de Claude).

**Recrutarea și finalul:**
1. Fiecare om se alătură pe drumul lui (relație, questline sau plată).
2. Întâlnirea cu vânătoarea deblochează **Camp site** (campsite-ul ei din pădure), locul unde se întâlnește grupul.
3. **Adunarea secretă:** ora 19:30, cu minimum 3 recruți și relație suficientă cu fiecare. Fiecare spune cum se simte, în scene de dialog. Apoi apare opțiunea „Recuperarea satului nostru!".
4. **Lupta finală:** la poartă, grupul lui Vale împotriva orcilor. Victorie înseamnă sat liber și finalul demo-ului. Înfrângerea e `TODO`.

## 17. Etape de construcție

Fiecare etapă trebuie să fie **jucabilă** și arătabilă înainte să începi următoarea.

1. **v0.1**, făcută în două etape, ca autorul să poată încărca imagini cât mai repede:
   - **Etapa A (prima):** scaffold Vite; motorul de scene cu 3 niveluri și **tot arborele de locuri** din secțiunea 7, cu placeholdere; poligoane și highlight; editorul (galerie și aranjare); serverul Node; scriptul de instalare pe VPS (nginx, HTTPS, parolă, cheie de deploy, backup, „Actualizează jocul”) cu pași de copiat pentru autor.
   - **Etapa B:** restul listei de mai jos.

   Lista completă v0.1: scaffold Vite; încărcare JSON; motorul de scene cu 3 niveluri; poligoane și highlight; ceasul și momentele zilei; barele de nevoi ale lui Vale, cu leșinul; casa ca scene clicabile; dialogul cu portrete și stări; evaluatorul de condiții și registrul de efecte; 3-5 evenimente de test; salvare plus export/import; placeholdere și stilul UI implicit; modul debug. **Editorul** (galerie, aranjare, testare) și **serverul de pe VPS**, cu scriptul de instalare, parola și backup-ul.
2. **v0.2:** bani și muncă; inventarul cu sloturi, stive și cufăr; ecranul de echipament; acțiunile de supraviețuire (mâncat, băut, dormit); reparațiile casei și misiunea acoperișului; rutinele personajelor; taxa cu orcul colector; grafica UI încărcabilă (9-slice, cursor).
3. **v0.3:** lupta pe ture (formație, bara de acțiune, acțiuni, armură, abilități, căderea); primele lupte: vânătoare, bătaie la tavernă.
4. **v0.4:** relații; recrutarea; questline-ul vânătoarei; Camp site; misiunea și cheia fierarului.
5. **v0.5:** adunarea secretă; lupta finală; finalul demo-ului; build-ul `.exe` cu Electron.

**Stadiu:** v0.1 gata. Din v0.2 și v0.3 e făcută **baza** (inventar, echipament, muncă, somn, magazin, rutine, taxa cu colectorul, grafica UI, lupta). Autorul a cerut ca misiunile (acoperișul, fierarul, vânătoarea) și consecințele (taxa ratată, înfrângerea) să aștepte: rămân `TODO`.

**Jocul de zaruri cu orcii** (decis, `src/zaruri.js`, `jocZaruri` în `config.json`): la poartă, 14–18, apeși pe paznicii care joacă zaruri și te cheamă la masă. Un fel de *Liar's Dice*: Vale și cei doi paznici, **fiecare pe cont propriu, câștigă doar unul**; câte **3 zaruri** sub pahar; se licitează câte zaruri cu o față sunt pe toată masa (mai multe zaruri, sau tot atâtea cu o față mai mare), iar următorul licitează mai sus sau strigă „Mincinosule!”; cine greșește pierde un zar; fără regula sumei la final. Se termină când Vale rămâne fără zaruri (pierde) sau rămâne singurul cu zaruri (câștigă). **Miza:** Vale pune monede (2/5/10), **orcii pun lucruri** (`premii`, `TODO` de ales); un obiect luat de orci la o pedeapsă (`confiscate` în salvare) are întâietate și se poate câștiga înapoi (miza = jumătate din preț). Câștigi: primești lucrul și îți iei banii înapoi. O partidă durează 30 de minute. **După un câștig într-o zi nu te mai lasă la masă în ziua aceea** (decis de autor; `maxCastiguriPeZi`). Orcii joacă normal (nu trișează), se gândesc 1.5–4.5 secunde înainte să spună. **Puterea de la hoț:** după o misiune a hoțului (`TODO`, pune starea `zaruri_hot: da`), o dată pe joc te uiți sub paharul unui orc fără să-și dea seama. Replicile orcilor sunt ciornă. **Imaginile:** `locations/zaruri_masa.png` (privirea lui Vale, buturuga în față, fără orci), peste ea fiecare orc cu 3 sprite-uri, `sprites/zaruri_<id>.png`, `_amesteca`, `_gandeste` (galeria: „Jocul de zaruri”), plus paharul `ui/ui_pahar_zaruri.png` și zarurile `ui/ui_zar_1.png`…`ui_zar_6.png` (până se încarcă, zarurile și paharul sunt desenate din cod). Orcii și paharele se aranjează în editor, la Aranjare → „Jocul de zaruri (la poartă)”; tot acolo se desenează **prim-planul** (buturuga), care taie **doar orcii** (paharele, zarurile și baloanele stau peste el).

**Viteza animațiilor** (decis): în luptă și la zaruri, un buton în colțul din dreapta-jos trece prin ×1 / ×2 / ×4 (`src/viteza.js`); grăbește pauzele, animațiile și umplerea barelor din luptă, ca jucătorul să nu fie obligat să aștepte. Se ține minte în browser (nu în salvare). **Miza** (decis de autor): alegerile una lângă alta, pe două rânduri („Pui 5 monede” / „Ei pun: …”), iar „?” de lângă titlu (și „? Regulile” din colț, la masă) deschide regulile pe foaia de pergament a inventarului. La zaruri nu mai e titlu sau istoric sus (decis): licitațiile se văd în baloane, iar ultima licitație apare în panou când e rândul tău.

**Jocul din tavernă:** altul decât zarurile, îl stabilim mai târziu.

**De scos la final:** butoanele de schimbat ora din joc (`ceasRapid` în `config.json`), puse doar pentru testare. **De pornit la final:** încărcarea imaginilor la pornire (`incarcareLaPornire: true` în `config.json`).

**Unde stau lucrurile în cod:** acțiunile unui loc (dormit, magazin, muncă, luptă) stau în `locations.json` la `actiuni`; muncile de la câmpuri în `config.json` la `munca`; elementele de interfață și dimensiunile lor în `src/uiGrafica.js`; ecranul de inventar și echipament se aranjează în editor ca „scena” `echipament`.

**Nu face în demo:** managementul grupului (somn, mâncare, băutură pentru recruți), schimbul de inventar cu recruții, mana și magia (în afară de abilitățile preotului), amuletele și inelele, dragonii (în afară de indicii), harta mare, fortăreața.

## 18. Imagini: formate și flux (informativ)

- Scene și imagini de zonă: 16:9, 1920×1080. Portrete: 4:5, de exemplu 1024×1280. Sprite-uri, piese, poze de luptă, iconițe: PNG cu fundal transparent.
- Imaginile le generează autorul și le încarcă din galeria editorului. Claude **nu** generează imagini.
- Dacă o imagine nu se potrivește (poziție, scară), se reglează în editor, nu se regenerează.

## 19. Ce nu e decis (nu inventa)

Pune `TODO` în date și întreabă când e nevoie:

- Numele recruților și motivul lor personal.
- Misiunea fierarului (pentru cheie) și obiectul din cufărul lui.
- Ce se întâmplă la înfrângerea în lupta finală.
- Treptele pentru taxa ratată: ce obiect iau orcii, care e pedeapsa a doua.
- Ce efect are reputația în sat.
- Ce pierde Vale la leșin.
- Prologul și povestea despre dragoni de la tavernă.

## 20. Primul pas

1. Citește acest fișier și spune-mi, în 5-8 rânduri, planul pentru **v0.1** (ordinea lucrurilor și ce vei folosi).
2. Așteaptă confirmarea mea, apoi implementează **v0.1** în pași mici, cu commit-uri.
3. La final: cum rulez jocul, ce funcționează și ce urmează.
