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
- **Salvare** în `localStorage`, cu câmp `versiuneSalvare`, plus **export/import** de fișier JSON ca backup. Orice schimbare de structură a salvării trebuie să aibă migrare sau să dea un mesaj clar.
- **Imagini: autorul lucrează doar cu PNG.** La build, un script convertește automat totul în WebP. Autorul nu atinge niciodată fișiere WebP. **Preîncarcă scenele vecine** în fundal, ca navigarea să fie instantanee.
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

1. **Galerie.** Tragi PNG-uri în pagină. Sunt grupate pe categorii (secțiunea 5). Editorul arată **ce lipsește** (cerut de date, dar neîncărcat) și **ce nu e folosit**. Numele se verifică după convenție și se propune numele corect.
2. **Aranjare.** Deschizi o scenă, harta sau ecranul de echipament și:
   - tragi sprite-urile și piesele, iar rotița mouse-ului le mărește (x, y, scară);
   - desenezi **zonele clicabile** punct cu punct (poligoane);
   - așezi sloturile de echipament peste figura lui Vale;
   - setezi marginile elementelor de interfață (secțiunea 9).
3. **Testare.** Jocul, cu panoul debug deschis: schimbi ora, pui noapte, setezi stări și vezi variantele.

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

- **Protagonist:** Vale Lightfinder, 25 de ani. Locuiește cu mama lui, **Miriam Lightfinder**, într-o casă pe jumătate dărăpănată. Tatăl a murit apărând satul într-o bătălie cu orcii.
- **Situația:** satul e ocupat de orci, care i-au cruțat pe localnici în schimbul unei **taxe săptămânale**. Ieșirea din sat e păzită de orci, deci tot demo-ul se petrece în sat și în pădurea de lângă el.
- **Libertate:** nu există o ordine impusă. Jucătorul decide ce face, iar taxa și evenimentele aduc presiunea.
- **Finalul demo-ului:** Vale recrutează aliați, îi adună la Camp site (adunarea secretă) și atacă poarta într-o luptă pe ture. Dacă o câștigă, satul e liber.
- **Misiunea de la mamă (acoperișul):** mama îi cere lui Vale să adune lemn din pădure ca să repare acoperișul. La final, imaginea casei (piesa de pe hartă și imaginea zonei) trece de la `acoperis: stricat` la `acoperis: reparat`. Recompensa e `TODO`.
- **Magul din biserică** (preotul) e de fapt mag al luminii, sub acoperire. Orcii nu știu.
- **Camera fierarului:** încuiată. Fierarul îți dă cheia după ce îl ajuți cu o misiune (`TODO`: care). În cameră e un cufăr cu un obiect bun (`TODO`: care).
- **Dragonii:** doar indicii, în prolog sau într-o poveste la tavernă (`TODO`).

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
| `taverna` | `taverna.png` | `taverna_zona.png` | `parter` (deschis 09:00–02:00), `etaj` (camera plătită la Agnes, cu patul de dormit) |
| `piata` | `piata.png` (+ `piata_fara_prizonier.png`) | `piata_zona.png` (+ `piata_zona_fara_prizonier.png`) | **fără locuri**: zona e chiar scena, cu negustorul, hoțul legat și magazinul |
| `campuri` | `culturi.png` (câmpul de grâu) și `ferma.png` (vacile), ambele lungi, lângă moară | `campuri_zona.png` | 2 zone care dau **acțiuni de muncă**, nu scene: câmpul de grâu (arat) și ferma de vaci (decis: fără porci). Doar **06–13** se lucrează aici (decis): fermierul (`fermier`, sprite, se poate vorbi cu el; misiunile lui sunt `TODO`), iar ceilalți săteni la muncă sunt desenați direct în imaginea zonei pentru orele acelea, `campuri_zona_lucru.png`; după 13:00, până a doua zi, câmpurile sunt goale (`campuri_zona.png`; noaptea `campuri_zona_noapte.png`) |
| `moara` | `moara.png` (stă **deasupra** pieselor câmpurilor, `deasupra` în `locations.json`) | `moara_zona.png` (+ `moara_zona_noapte.png`) | o zonă care dă **acțiunea de muncă** la moară (decis: moara e locație separată de câmpuri) |
| `padure` | fără piesă (poligon pe hartă) | `padure_zona.png` | `interior` (**vânătoarea**: nu e un loc în care stai; `padure_interior.png` apare câteva secunde ca ecran de încărcare, apoi pornește o luptă aleasă după șanse: 35% doi lupi, 25% trei lupi, 15% patru lupi conduși de **lupul negru** (`lup_alfa`: pozele lupului, întunecate și cu 20% mai mari), 25% un mistreț; pe `lupta_padure_interior.png`), `campsite` (**ascuns** până la întâlnirea cu vânătoarea; e campsite-ul ei). Acțiunea „Adună lemne” e pe imaginea zonei |
| `poarta` | `poarta.png` | `poarta_zona.png` | **fără locuri** (decis): zona e chiar scena, ca piața. Pe ea stau orcul colector (apeși pe el și plătești taxa), paznicul (`paznic_orc_1`, se poate vorbi cu el) și al doilea paznic (`paznic_orc_2`, doar se vede, nu se apasă) |
| `biserica` | `biserica.png` | `biserica_zona.png` | `interior` (preotul; 14–23 citește afară, pe scări, pe imaginea zonei) |

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
| Chenarul de dialog | `ui_dialog.png` | se întinde (9-slice) |
| Plăcuța cu numele vorbitorului | `ui_nume.png` | 9-slice |
| Butoane | `ui_buton.png`, `ui_buton_hover.png`, `ui_buton_apasat.png` | 9-slice |
| Panouri (inventar, meniu, echipament) | `ui_panou.png` | 9-slice |
| Slot de inventar sau echipament | `ui_slot.png`, `ui_slot_hover.png` | |
| Bare (viață, stamina, foame, sete) | `ui_bara_rama.png`, `ui_bara_<tip>.png` | rama + umplutura |
| Cursorul | `ui_cursor.png`, `ui_cursor_click.png` | **maximum 64×64**, ideal 32×32 (browserele refuză cursoare mari) |
| Figura lui Vale pentru echipament | `ui_vale_apoza.png` | A-pose, fundal transparent |
| Fundalul meniului principal | `ui_meniu_fundal.png` | 1920×1080 |
| Cartea personajelor (deschisă, pagini goale) | `ui_carte.png` | 1600×1000 |
| Paharul și zarurile (jocul de zaruri) | `ui_pahar_zaruri.png`, `ui_zar_1.png` … `ui_zar_6.png` | 256×256 / 128×128, fundal transparent |

**Interfața de pe ecran** (decis, după designul autorului): panoul lui Vale stânga-sus (plăcuța cu numele, cele 4 bare, monedele, taxa, datoria de blăni), **închis la început: se deschide din butonul pătrat cu iconița lui Vale** (`ui_icon_vale.png`, tasta V), care pulsează roșu când ceva e grav (o nevoie scăzută, taxa de azi), numele locului sus la mijloc (pe banda de pergament), cele 4 butoane pătrate dreapta-sus, **doar cu iconițe, fără text** (Inventar, Personaje, Meniu, Ecran complet; numele apare la hover), ceasul stânga-jos și „Înapoi” dreapta-jos (decis de autor); centrul rămâne liber. Piesele, fără text (textul îl scrie jocul): `ui_hud_panou.png`, `ui_hud_nume.png`, `ui_hud_ceas.png`, `ui_hud_buton.png` (+ `_hover`), `ui_hud_placuta.png`, iconițele `ui_icon_vale/inventar/personaje/meniu/ecran/monede/inapoi.png` (numele locului e doar text, fără iconiță); barele folosesc `ui_bara_rama.png` și `ui_bara_<tip>.png`. Până se încarcă, ramele sunt din CSS și iconițele sunt simboluri. Barele colorate (grosimea umplerii, spațiul față de ramă) se reglează în editor, la Interfață → Rama barelor. Ceasul din stânga-jos e mai mic decât plăcuța „Înapoi”.

**Meniul** (decis, după designul autorului): o tablă de lemn atârnată cu lanțuri, cu banda albastră a titlului și rombul auriu (culorile steagului de la biserică), și 6 butoane de pergament în grilă 2×3, fiecare cu iconița lui: Continuă, Salvează într-un fișier, Încarcă dintr-un fișier, Joc nou, **Galerie** (ilustrațiile evenimentelor pe care Vale le-a văzut deja; un clic o arată mare) și **Opțiuni** (viteza animațiilor ×1/×2/×4 și ecranul complet; sunetul vine mai târziu). Piesele, fără text: `ui_meniu_panou.png`, `ui_meniu_buton.png` (+ `_hover`), iconițele `ui_icon_continua/salveaza/incarca/joc_nou/galerie/optiuni.png`.

**9-slice:** colțurile ramei rămân neschimbate, iar mijlocul se întinde. Așa un singur chenar merge la orice mărime. Marginile (cât de lat e colțul) se setează în editor, la Aranjare. Marginea poate fi și **0** (imaginea se întinde întreagă) sau **cu minus** (se întinde întreagă și iese în afara elementului cu atâția pixeli; așa stă hover-ul butoanelor pătrate, a cărui imagine are spațiu pentru strălucire în jur). Fiecare ramă are butonul ei „Salvează marginea”.

## 10. Dialog

- NPC-ul în **dreapta**, Vale în **stânga**, amândoi la ~85-90% din înălțimea scenei, ancorați jos. Fundalul scenei rămâne vizibil.
- Chenarul de text stă jos (~25% din înălțime), **deasupra portretelor**, cu numele vorbitorului într-un colț.
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
- **Somnul** reface stamina. Se poate dormi acasă (gratis) sau la tavernă (contra cost).

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

**Taverna** (decis): deschisă 09:00–02:00 (închisă: gândul lui Vale, `TODO`). **Agnes** (hangița): 02–09 doarme, 09–12 pregătește taverna (sprite `_dimineata`), 12–16 servește afară (sprite pe imaginea zonei), 16–02 la tejghea. **Roderick**: 00–10 doarme (nimeni nu știe unde; poate, după recrutare, la Camp site), 10–14 la biserică (se roagă pentru fratele lui), 14–18 în tavernă, 18–00 în tavernă cu alt sprite (`_seara`). **Sala tavernei păstrează filtrul de seară până se închide** (23:00–02:00, în loc de cel de noapte), `filtruSeara` în `locations.json`. Fără program separat de weekend. **Camera de la tavernă** se închiriază de la Agnes (5 monede) și ține până la prânzul de după noaptea plătită; poți dormi și după ce se închide taverna.

**Programul fierarului** (decis): luni–vineri 06–12 lucrează afară (zona fierăriei), 12–14 prânzul la tavernă, 14–18 afară, 18–22 lucrează înăuntru (magazinul), 22–06 doarme în camera lui (fără sprite acolo: cât doarme, Vale nu intră nici cu cheia, se gândește că nu vrea să-l deranjeze; ziua camera e goală). Sâmbăta și duminica: 05–08 la biserică (se roagă), 08–12 afară, 12–14 tavernă, 14–18 afară (decis: nu mai ajută la câmpuri, acolo nu lucrează nimeni după 13), 18–22 înăuntru, 22–06 doarme. **Orcii de la poartă** (decis): colectorul 06–12 la masa taxei, 12–14 mănâncă acolo (`_pranz`), 14–18 plecat (nu joacă zaruri cu paznicii), 18–23 de pază cu o torță (`_noaptea`, în locul celui de-al doilea paznic; se poate plăti taxa și atunci), 23–06 plecat. Paznicul: 06–12 de pază, 12–14 mănâncă lângă foc (`_pranz`), 14–18 joacă zaruri cu al doilea paznic (`_zaruri`: **un singur sprite cu amândoi**), 18–23 la foc, ascute toporul (`_seara`), 23–06 doarme sprijinit de zid (`_doarme`; apăsat, Vale nu-l trezește). Al doilea paznic: 06–12 de pază, 12–14 plecat (cât mănâncă ceilalți), 14–18 la zaruri (e în sprite-ul primului), 18–06 plecat (noaptea e colectorul de pază). **Paznicul spune o replică la întâmplare** (dialogul `paznic_orc`, ciornă de Claude): seara, după scandal (ajutat/refuzat) sau după o taxă ratată are replici speciale; altfel una din listă (`aleator` în `start`). **Magazinul e închis când fierarul nu e acasă** (afară sau înăuntru, treaz); se poate deschide doar cu cheia fierarului, primită după o misiune (`TODO` care). Gândul lui Vale la ușa închisă e o ciornă.

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

- **Evenimente** (categoria `orci` în `events.json`, texte ciornă de Claude): colectorul, în rondul lui de după-amiază (14–18), la piață (ia marfa negustorului), la tavernă (bere gratis de la Agnes, 16–18); patrula de orci (orcul normal) care ia grâul fermierilor la câmpuri (08–13), răstoarnă taraba (08–14; doi orci, lupta e cu amândoi), bate la ușa casei (08–21) sau îi cere lui Bram să-i ascută toporul pe gratis, la fierărie (cât Bram lucrează afară; dacă intervii, te bați cu orcul alături de Bram); **interdicția de noapte** (afară, noaptea: amendă, fugi cu 50% șanse sau te bați). La fiecare poți interveni (reputație, relație, dar riști pedeapsa sau o bătaie fără fugă), plăti tu sau tăcea (reputația scade). Fiecare are **o imagine** pe tot ecranul înainte de text, `events/<id>.png` (în galerie: „Eveniment: Orcii prin sat”).
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
- **refuzi:** 3 imagini cu Roderick bătut și orcii plecând râzând, apoi un dialog cu el (rănit). Lipsește 2 zile din tavernă și **nu mai poate fi recrutat**.

Bețivul care te provoacă la bătaie apare doar după scandal. **Prima discuție** cu fiecare personaj e o prezentare, cu o singură replică (la Agnes și „Cumpără”).

**Efecte posibile:** timp, bani, nevoi, reputație, relație cu un personaj, obiect primit/dat, schimbare de stare, deblocare de loc, pornire de misiune, pornire de luptă. Efectele stau într-un **registru de funcții** (nu un `switch` uriaș). Același registru e folosit și de abilitățile din luptă.

Tipuri pentru cele ~10 evenimente de pornire: cereri de ajutor, oferte de muncă mărunte, negustori și schimburi, bârfe și străini la tavernă, vizita orcului colector, momente cu mama. Începe cu 3-5 evenimente de test.

## 14. Inventar și echipament

### Inventarul (sloturi, stive, cufăr)

- Inventarul are un număr de **sloturi**, iar rucsacul îl mărește: fără rucsac 8, rucsacul de pânză 12, cel de piele 16 (`TODO` cifre).
- **Stive:** obiectele de același fel stau în același slot, până la o limită per obiect (de exemplu 5 pâini, 3 sticle de apă, 10 bucăți de lemn, 20 de săgeți). Echipamentul nu se stivuiește.
- **Obiectele mari ocupă 2 sloturi:** armele cu două mâini, pieile mari.
- **Echipamentul purtat nu ocupă sloturi.**
- **Obiectele de poveste** (chei, scrisori) stau pe o pagină separată, fără limită, și nu se pot pierde.
- **Cufărul de acasă:** un depozit mare (~40 de sloturi, `TODO`).
- **Inventar plin:** apare mesajul „N-ai loc pentru X”, cu butoanele *Aruncă ceva* și *Lasă-l*.
- **Rucsac mai mic:** se poate echipa doar dacă încap obiectele. Altfel apare mesajul „Golește mai întâi N sloturi”.

### Ecranul de echipament

- **Stânga:** figura lui Vale în A-pose (`ui_vale_apoza.png`), cu sloturile de echipament puse peste ea. Pozițiile sloturilor se aranjează în editor. Figura nu se schimbă după echipament; în sloturi apar **iconițele** obiectelor.
- **Dreapta:** inventarul.
- **Drag & drop** din inventar în sloturi și înapoi. Un slot nepotrivit refuză obiectul (de exemplu bocanci pe cap).
- **Sloturi:** cap, haină, mănuși, pantaloni, bocanci, armă primară, armă secundară, rucsac. **Armele cu două mâini ocupă ambele sloturi de armă.**
- Fiecare obiect are o **iconiță** (`assets/items/<id>.png`).

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
- Sus pe ecran se vede **ordinea următoare**: portrete mici, în ordinea în care vor acționa.
- Vale obosit (stamina din nevoi sub 30) pornește lupta cu bara goală, iar Vale odihnit o pornește pe jumătate plină.
- Fiecare personaj are o bară de **viață** și una de **stamina**, afișate deasupra lui.

### Acțiuni

| Acțiune | Ce face |
|---|---|
| **Atac** | Daunele vin din **arma echipată**: un număr întreg la întâmplare între minimul și maximul ei, inclusiv capetele (de exemplu sabie 11-13 dă 11, 12 sau 13). Arma spune și tipul: apropiat sau distanță. Fără armă: pumni, 1-3. Recruții au arma lor în `npcs.json`. |
| **Apărare** | Până la tura următoare a personajului, daunele primite scad cu procentul de **blocare**: 50% implicit, iar cu scut cât spune scutul (de exemplu 70%). |
| **Obiect** | Inventarul lui Vale e **comun în luptă**: orice aliat îl poate folosi în tura lui (de exemplu o poțiune de viață). Consumă tura. |
| **Schimbă locul** | Se mută pe un loc liber sau face schimb cu cel de pe aceeași linie (față ↔ spate). Consumă tura. |
| **Abilitate** | Doar personajele care au abilități. **Preotul nu atacă normal** (`faraAtac`), are doar 3 puteri: vindecare, **golește bara de stamina a unui inamic** și **scutul de lumină** (pus în fața unui aliat, oprește complet următoarea lovitură, fără daune și fără uzura armurii; rămâne până e lovit). Imaginea scutului: `combat/scut_lumina.png`, cu mărimea reglabilă în galerie. Efectele folosesc registrul din secțiunea 13. |
| **Fugi** | Doar în luptele unde e permis. Reușește sigur (alegere simplă, se poate schimba). |

**Armura:**
- Fiecare piesă de echipament poate avea **puncte de armură** și o **rezistență** (câte lovituri suportă, de exemplu 5).
- Daunele primite = daunele atacului − armura pieselor întregi, **minimum 1**. Blocarea din *Apărare* se aplică după armură.
- **Fiecare lovitură primită** scade cu 1 rezistența fiecărei piese întregi. La 0, piesa **crapă**: până la sfârșitul luptei nu mai dă armură. Pe ecran se vede că s-a crăpat.
- După luptă, piesele crăpate revin la normal singure (alegere simplă; se poate schimba, de exemplu reparat la fierar).
- Toate cifrele stau în `config.json` și `items.json`.

**Căderea:** la viață 0, personajul **cade**, dar nu moare. După luptă se ridică: recruții cu viața plină, Vale cu puțină viață (`TODO` cât).

**Inamicii** aleg o țintă validă la întâmplare. Unii pot avea preferințe în JSON (de exemplu „lovește pe cel mai slăbit”).

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
- **Mărimea fiecărei poze de luptă, pe fiecare zonă de luptă**, se reglează în galerie, pe cardul pozei, în procente (`data/aranjare/marimi_lupta.json`, `imaginiHarti`; dacă lipsește, se folosește mărimea ei generală mai veche, `marimi`). În plus, **fiecare hartă de luptă** are mărimea tuturor personajelor de pe ea (`harti`). Procentele se înmulțesc.
- **Hărțile de luptă** (decis): imagini separate, `locations/lupta_<zona>_<loc>.png`, doar pentru locurile din `harti` în `lupte.json` (acum sala tavernei și adâncul pădurii). Până e încărcată, se vede scena locului. Cele 12 locuri ale luptătorilor (6 aliați, 6 inamici) se mută în editor, la Aranjare → Hărți de luptă (sau din galerie, „Aranjează locurile luptătorilor”).
- **Armă aruncată** (`proiectil` la atac, de exemplu glaive-ul Kaiei, aceeași imagine ca decorul de la campsite): în poza `atac` mâna e goală, iar arma zboară rotindu-se la fiecare țintă (ricoșeul) și se întoarce. Mărimea ei în luptă se reglează în galerie, pe cardul imaginii.
- Abilitățile folosesc poza `atac`, fără strălucire din cod (decis de autor: poza de cast ajunge). O putere poate avea **poza ei** (`poza` la abilitate): preotul are câte una pentru fiecare putere, `mag_vindecare.png`, `mag_goleste_bara.png`, `mag_scut_lumina.png`; până e încărcată, se folosește `atac` (la preot, care nu atacă și n-are poza `atac`, se folosește `idle`).

## 16. Personaje

| `id` | Rol | Unde îl găsești | Recrutare |
|---|---|---|---|
| `vale` | Protagonist | – | – |
| `miriam` | Mama | Casă | nu se recrutează |
| `soldat` | **Roderick Lightfinder**, unchiul lui Vale (fratele tatălui), fost soldat, în hainele lui vechi de soldat; luptă apropiat | Taverna, biserica dimineața | doar dacă l-ai ajutat în scandalul din tavernă; cum anume, `TODO` |
| `fierar` | **Bram Emberforge**, fierarul; tank | Fierăria | relație suficientă |
| `hot` | Tânărul hoț, legat la butuc (numele: `TODO`). Negustorul îl eliberează pentru **40 de monede** (`TODO` suma), apoi hoțul îi mulțumește lui Vale; unde merge după aceea e `TODO`. **Nu luptă** (decis: cele 6 locuri din luptă sunt pline, deci n-are poze de luptă); ajută din umbră: înainte de lupta finală se strecoară la poartă și fură cheia sau strică ceva, ca lupta să fie mai ușoară (un orc în minus sau orcii pornesc cu bara goală), iar până atunci aduce zvonuri și indicii sau deschide lucruri încuiate (toate `TODO`) | Piața | plătești o sumă unui negustor ca să-l elibereze |
| `vanatoare` | **Kaia, vânătoarea** (Huntress în *Fangs&Honor*; numele tigrului: `TODO`), călare pe un tigru: „Vânătoare crescută în pădurile de la hotar, cu lame care se întorc în mână. Glaive-ul ei ricoșează din țintă în țintă, până la trei deodată, antrenată împotriva grupurilor strânse.” Programul ei: 05–10 la campsite, 10–14 plecată la vânătoare (nu e nicăieri; dacă vânezi atunci, 10% șanse s-o întâlnești: o scurtă discuție, apoi luptă alături de tine), 14–23 la campsite (alt sprite, `_dupa_amiaza`), 23–05 doarme (sprite `_doarme`); dacă apeși pe ea cât doarme, Vale se gândește că nu vrea s-o trezească. Atac de la distanță care lovește până la 3 inamici (`ricoseu: 3`); **în luptă ține două locuri** (față și spate pe aceeași linie, `locuri: 2`). **Povestea** (decis): era o prietenă bună a sătenilor, venea rar prin sat; s-a strecurat prin pădure și îl găsește pe Vale la vânătoare (după prima vânătoare, evenimentul `intalnire_vanatoare`). El o recunoaște, își povestesc ce s-a întâmplat, apoi ea îl duce la micul ei campsite, care devine **Camp site**, locul ascuns al grupului | Camp site-ul din pădure | `TODO` (încă nedecis) |
| `tigru` | Tigrul cu colți de sabie al Kaiei (nume `TODO`); la campsite în aceleași ore ca ea (3 sprite-uri: dimineața, `_dupa_amiaza`, `_doarme`); se vede, dar nu se apasă; fără portrete | Camp site-ul din pădure | – |
| `mag` | **Fratele Elian**, preotul-mag al luminii, **tânăr** (decis); vindecare și abilități de control, slab la început. Programul lui: 05–08 tămâie în biserică (sprite `_dimineata`), 08–14 pe bancă, privește altarul, 14–23 citește pe scări, afară (sprite pe imaginea zonei), 23–05 doarme pe o bancă în biserică (sprite `_doarme`; apăsat, Vale nu vrea să-l trezească) | Biserica | relație suficientă; orcii nu știu de el |
| `hangita` | **Agnes**, hangița; vinde mâncare și băutură, închiriază camera | Taverna | – |
| `negustor` | Personaj minor; **fără sprite** (decis): apare doar în dialog, când apeși pe hoțul legat; doar portretul `normal` | Piața | – |
| `orc_colector`, `paznic_orc_1`, `paznic_orc_2` | Orcii: **doi deocamdată** (decis), colectorul și orcul normal (paznicul); `paznic_orc_2` e doar un al doilea paznic care se vede la poartă (sprite, fără portrete, nu se apasă). **Orice orc generic** (de exemplu cei din tavernă) folosește portretele, sprite-ul și pozele de luptă ale lui `paznic_orc_1` | Poarta, casa lui Vale (colectorul) | – |

Unele personaje vin din jocul *Fangs&Honor*. Numele celorlalți recruți și motivul personal al fiecăruia împotriva orcilor sunt `TODO`.

**Încrederea (decis):** fiecare personaj important are o încredere de la 0 la 10 (`relatie` în efecte și condiții, `incredere.max` în `config.json`; nu iese din scară). La 10 apare în dialog misiunea de recrutare; la cei care nu se recrutează (Miriam, Agnes, fermierul), la 10 apare **o misiune specială** (toate `TODO`, condiția `"relatie": { "<id>": { "min": 10 } }`). Orcii n-au încredere. În demo nu există schimb de inventar cu recruții.

**Dialogurile** (decis): toate replicile din joc sunt ciorne scrise de Claude, la cererea autorului; autorul spune ce și unde schimbă.

**Cartea personajelor (decis):** butonul „📖 Personaje” din HUD (sau tasta P). O carte cu pagini care se întorc, câte un personaj pe fiecare două pagini: în stânga numele, încrederea (10 romburi, „x/10”) și o descriere scurtă, în vocea lui Vale, cu font de scris de mână (Dancing Script și Caveat, incluse în build, merg offline); în dreapta schița lui, `ui/carte_<id>.png` (desen în cerneală sau cărbune, 4:5, fundal transparent; în galerie la „Cartea personajelor”). Cartea deschisă poate primi o imagine, `ui/ui_carte.png` (1600×1000, două pagini goale). Un personaj intră în carte după prima discuție cu el, în ordinea în care i-a cunoscut Vale; Miriam e acolo de la început (`start.cunoscuti`). În carte: Miriam, Roderick, Bram, Kaia, Elian, Agnes, fermierul, hoțul, plus orcul colector și paznicul orc (fără bara de încredere, `faraIncredere`) (`carte` în `npcs.json`; descrierile sunt ciorne de Claude).

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

**Jocul de zaruri cu orcii** (decis, `src/zaruri.js`, `jocZaruri` în `config.json`): la poartă, 14–18, apeși pe paznicii care joacă zaruri și te cheamă la masă. Un fel de *Liar's Dice*: Vale și cei doi paznici, **fiecare pe cont propriu, câștigă doar unul**; câte **3 zaruri** sub pahar; se licitează câte zaruri cu o față sunt pe toată masa (mai multe zaruri, sau tot atâtea cu o față mai mare), iar următorul licitează mai sus sau strigă „Mincinosule!”; cine greșește pierde un zar; fără regula sumei la final. Se termină când Vale rămâne fără zaruri (pierde) sau rămâne singurul cu zaruri (câștigă). **Miza:** Vale pune monede (2/5/10), **orcii pun lucruri** (`premii`, `TODO` de ales); un obiect luat de orci la o pedeapsă (`confiscate` în salvare) are întâietate și se poate câștiga înapoi (miza = jumătate din preț). Câștigi: primești lucrul și îți iei banii înapoi. O partidă durează 30 de minute. **După două câștiguri într-o zi nu te mai lasă la masă.** Orcii joacă normal (nu trișează), se gândesc 1.5–4.5 secunde înainte să spună. **Puterea de la hoț:** după o misiune a hoțului (`TODO`, pune starea `zaruri_hot: da`), o dată pe joc te uiți sub paharul unui orc fără să-și dea seama. Replicile orcilor sunt ciornă. **Imaginile:** `locations/zaruri_masa.png` (privirea lui Vale, buturuga în față, fără orci), peste ea fiecare orc cu 3 sprite-uri, `sprites/zaruri_<id>.png`, `_amesteca`, `_gandeste` (galeria: „Jocul de zaruri”), plus paharul `ui/ui_pahar_zaruri.png` și zarurile `ui/ui_zar_1.png`…`ui_zar_6.png` (până se încarcă, zarurile și paharul sunt desenate din cod). Orcii și paharele se aranjează în editor, la Aranjare → „Jocul de zaruri (la poartă)”; tot acolo se desenează **prim-planul** (buturuga), care taie **doar orcii** (paharele, zarurile și baloanele stau peste el).

**Viteza animațiilor** (decis): în luptă și la zaruri, un buton în colțul din dreapta-jos trece prin ×1 / ×2 / ×4 (`src/viteza.js`); grăbește pauzele, animațiile și umplerea barelor din luptă, ca jucătorul să nu fie obligat să aștepte. Se ține minte în browser (nu în salvare). La zaruri nu mai e titlu sau istoric sus (decis): licitațiile se văd în baloane, iar ultima licitație apare în panou când e rândul tău.

**Jocul din tavernă:** altul decât zarurile, îl stabilim mai târziu.

**De scos la final:** butoanele de schimbat ora din joc (`ceasRapid` în `config.json`), puse doar pentru testare.

**Unde stau lucrurile în cod:** acțiunile unui loc (dormit, magazin, muncă, luptă) stau în `locations.json` la `actiuni`; muncile de la câmpuri în `config.json` la `munca`; elementele de interfață și dimensiunile lor în `src/uiGrafica.js`; ecranul de echipament se aranjează în editor ca „scena” `echipament`.

**Nu face în demo:** managementul grupului (somn, mâncare, băutură pentru recruți), schimbul de inventar cu recruții, mana și magia (în afară de abilitățile preotului), amuletele și inelele, dragonii (în afară de indicii), harta mare, fortăreața.

## 18. Imagini: formate și flux (informativ)

- Scene și imagini de zonă: 16:9, 1920×1080. Portrete: 4:5, de exemplu 1024×1280. Sprite-uri, piese, poze de luptă, iconițe: PNG cu fundal transparent.
- Imaginile le generează autorul și le încarcă din galeria editorului. Claude **nu** generează imagini.
- Dacă o imagine nu se potrivește (poziție, scară), se reglează în editor, nu se regenerează.

## 19. Ce nu e decis (nu inventa)

Pune `TODO` în date și întreabă când e nevoie:

- Numele recruților și motivul lor personal.
- Recompensa misiunii cu acoperișul.
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
