// Serverul editorului: servește jocul și editorul, primește imagini, salvează aranjarea și o trimite pe GitHub.
// Fără dependențe externe, ca instalarea pe VPS să fie doar „npm ci” pentru Vite.
import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const APP = path.resolve(process.env.APP_DIR || fileURLToPath(new URL('..', import.meta.url)));
const ASSETS = path.resolve(process.env.ASSETS_DIR || path.join(APP, 'assets'));
// Imaginile șterse ajung aici, nu dispar: o ștergere din greșeală se poate repara de pe VPS
const COS = path.join(path.dirname(ASSETS), 'cos');
const DIST = path.join(APP, 'dist');
const DATA = path.join(APP, 'data');
const PORT = Number(process.env.PORT) || 3217;
const HOST = process.env.HOST || '127.0.0.1';
const GIT_SYNC = process.env.GIT_SYNC === '1';

const CATEGORII = ['map', 'map/piese', 'locations', 'events', 'portraits', 'sprites', 'combat', 'items', 'ui'];
const NUME_IMAGINE = /^[a-z0-9]+(?:_[a-z0-9]+)*\.png$/;
const ID_SCENA = /^[a-z0-9_]+(?:\.[a-z0-9_]+)?$/;
const MAX_IMAGINE = 40 * 1024 * 1024;
const SEMNATURA_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const TIPURI = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// ---------- utilitare ----------

function trimite(res, cod, corp, tip = 'application/json; charset=utf-8') {
  res.writeHead(cod, { 'Content-Type': tip, 'Cache-Control': 'no-store' });
  res.end(typeof corp === 'string' || Buffer.isBuffer(corp) ? corp : JSON.stringify(corp));
}

function eroare(res, cod, mesaj) {
  trimite(res, cod, { eroare: mesaj });
}

function citesteCorp(req, limita) {
  return new Promise((rezolva, respinge) => {
    const bucati = [];
    let marime = 0;
    req.on('data', (b) => {
      marime += b.length;
      if (marime > limita) {
        respinge(new Error('Fișierul e prea mare.'));
        req.destroy();
      } else bucati.push(b);
    });
    req.on('end', () => rezolva(Buffer.concat(bucati)));
    req.on('error', respinge);
  });
}

function ruleaza(comanda, argumente, optiuni = {}) {
  return new Promise((rezolva) => {
    const p = spawn(comanda, argumente, { cwd: APP, ...optiuni });
    let iesire = '';
    p.stdout?.on('data', (d) => (iesire += d));
    p.stderr?.on('data', (d) => (iesire += d));
    p.on('error', (e) => rezolva({ cod: -1, iesire: iesire + e.message }));
    p.on('close', (cod) => rezolva({ cod, iesire }));
  });
}

async function ruleazaSauArunca(comanda, argumente, jurnal) {
  jurnal.push(`$ ${comanda} ${argumente.join(' ')}`);
  const r = await ruleaza(comanda, argumente);
  jurnal.push(r.iesire.trim());
  if (r.cod !== 0) throw new Error(`${comanda} ${argumente[0]} a eșuat (cod ${r.cod})`);
  return r.iesire;
}

// Calea cerută trebuie să rămână în folderul de imagini, într-o categorie cunoscută (fără ../ și alte trucuri)
function caleImagine(relativ) {
  const curat = decodeURIComponent(relativ);
  const categorie = path.posix.dirname(curat);
  const nume = path.posix.basename(curat);
  if (!CATEGORII.includes(categorie)) return { eroare: `Categorie necunoscută: ${categorie}` };
  if (!NUME_IMAGINE.test(nume)) return { eroare: `Nume invalid: ${nume} (doar litere mici, cifre și _, terminat în .png)` };
  const absolut = path.join(ASSETS, categorie, nume);
  if (!absolut.startsWith(ASSETS + path.sep)) return { eroare: 'Cale invalidă.' };
  return { absolut, relativ: `${categorie}/${nume}` };
}

async function listeazaImagini(dir = ASSETS, prefix = '') {
  let intrari;
  try {
    intrari = await fsp.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const rezultat = [];
  for (const i of intrari) {
    if (i.name.startsWith('.')) continue;
    const rel = prefix ? `${prefix}/${i.name}` : i.name;
    if (i.isDirectory()) rezultat.push(...(await listeazaImagini(path.join(dir, i.name), rel)));
    else if (i.name.endsWith('.png')) {
      const st = await fsp.stat(path.join(dir, i.name));
      rezultat.push({ cale: rel, marime: st.size, modificat: st.mtimeMs });
    }
  }
  return rezultat;
}

async function citesteDate() {
  const date = { aranjare: {} };
  for (const f of await fsp.readdir(DATA)) {
    if (f.endsWith('.json')) date[f.slice(0, -5)] = JSON.parse(await fsp.readFile(path.join(DATA, f), 'utf8'));
  }
  const dirAranjare = path.join(DATA, 'aranjare');
  for (const f of await fsp.readdir(dirAranjare).catch(() => [])) {
    if (f.endsWith('.json')) date.aranjare[f.slice(0, -5)] = JSON.parse(await fsp.readFile(path.join(dirAranjare, f), 'utf8'));
  }
  return date;
}

// ---------- build și sincronizare cu GitHub ----------

// O singură operație grea odată (build, git), altfel două salvări rapide s-ar călca pe picioare
let coada = Promise.resolve();
function inCoada(fn) {
  const rezultat = coada.then(fn, fn);
  coada = rezultat.catch(() => {});
  return rezultat;
}

const sincronizare = { stare: GIT_SYNC ? 'ok' : 'oprita', mesaj: GIT_SYNC ? '' : 'Sincronizarea cu GitHub e oprită (mod local).', la: Date.now() };

async function construieste(jurnal) {
  // Build-ul se face alături și apoi se mută peste, ca jocul să nu dispară cât timp se compilează
  const nou = path.join(APP, '.dist-nou');
  await ruleazaSauArunca(process.execPath, ['node_modules/vite/bin/vite.js', 'build', '--outDir', nou, '--emptyOutDir'], jurnal);
  await fsp.rm(DIST, { recursive: true, force: true });
  await fsp.rename(nou, DIST);
}

async function trimitePeGitHub(jurnal) {
  await ruleazaSauArunca('git', ['add', 'data/aranjare'], jurnal);
  const diferente = await ruleaza('git', ['diff', '--cached', '--quiet']);
  if (diferente.cod !== 0) {
    await ruleazaSauArunca('git', ['commit', '-m', 'Editor: aranjare actualizată'], jurnal);
  }
  await ruleazaSauArunca('git', ['pull', '--rebase', 'origin', 'main'], jurnal);
  await ruleazaSauArunca('git', ['push', 'origin', 'HEAD:main'], jurnal);
}

let temporizatorSincronizare;
function programeazaSincronizare() {
  sincronizare.stare = 'in_curs';
  sincronizare.mesaj = 'Se actualizează jocul...';
  // Așteaptă puțin: mai multe salvări una după alta devin un singur build și un singur commit
  clearTimeout(temporizatorSincronizare);
  temporizatorSincronizare = setTimeout(() => {
    inCoada(async () => {
      const jurnal = [];
      try {
        await construieste(jurnal);
        if (GIT_SYNC) await trimitePeGitHub(jurnal);
        Object.assign(sincronizare, { stare: GIT_SYNC ? 'ok' : 'oprita', mesaj: GIT_SYNC ? 'Salvat și trimis pe GitHub.' : 'Jocul e actualizat (fără GitHub, mod local).', la: Date.now() });
      } catch (e) {
        Object.assign(sincronizare, { stare: 'eroare', mesaj: `${e.message}\n\n${jurnal.join('\n')}`, la: Date.now() });
      }
    });
  }, 3000);
}

async function actualizeazaJocul() {
  const jurnal = [];
  let reporneste = false;
  if (GIT_SYNC) {
    const inainte = (await ruleazaSauArunca('git', ['rev-parse', 'HEAD'], jurnal)).trim();
    await ruleazaSauArunca('git', ['pull', '--rebase', 'origin', 'main'], jurnal);
    const dupa = (await ruleazaSauArunca('git', ['rev-parse', 'HEAD'], jurnal)).trim();
    if (inainte !== dupa) {
      const schimbate = (await ruleazaSauArunca('git', ['diff', '--name-only', inainte, dupa], jurnal)).split('\n');
      if (schimbate.some((f) => f === 'package.json' || f === 'package-lock.json')) {
        await ruleazaSauArunca('npm', ['ci', '--no-audit', '--no-fund'], jurnal);
      }
      reporneste = schimbate.some((f) => f.startsWith('server/'));
    } else jurnal.push('Nu e cod nou pe GitHub.');
  }
  await construieste(jurnal);
  jurnal.push(reporneste ? 'Serverul s-a schimbat: repornește singur în câteva secunde.' : 'Gata.');
  return { jurnal: jurnal.filter(Boolean).join('\n'), reporneste };
}

// ---------- fișiere statice ----------

async function servesteFisier(req, res, absolut, cacheLung = false) {
  let st;
  try {
    st = await fsp.stat(absolut);
    if (!st.isFile()) throw new Error();
  } catch {
    return trimite(res, 404, 'Nu există.', 'text/plain; charset=utf-8');
  }
  const modificat = st.mtime.toUTCString();
  const antete = {
    'Content-Type': TIPURI[path.extname(absolut)] || 'application/octet-stream',
    'Last-Modified': modificat,
    // Imaginile se pot înlocui oricând din galerie, deci browserul trebuie să verifice de fiecare dată
    'Cache-Control': cacheLung ? 'public, max-age=31536000, immutable' : 'no-cache',
  };
  if (!cacheLung && req.headers['if-modified-since'] === modificat) {
    res.writeHead(304, antete);
    return res.end();
  }
  res.writeHead(200, { ...antete, 'Content-Length': st.size });
  fs.createReadStream(absolut).pipe(res);
}

// ---------- rute ----------

async function api(req, res, ruta) {
  const metoda = req.method;

  if (metoda === 'GET' && ruta === 'date') return trimite(res, 200, await citesteDate());

  if (metoda === 'GET' && ruta === 'imagini') return trimite(res, 200, await listeazaImagini());

  if (ruta.startsWith('imagini/') && (metoda === 'PUT' || metoda === 'DELETE')) {
    const c = caleImagine(ruta.slice('imagini/'.length));
    if (c.eroare) return eroare(res, 400, c.eroare);
    if (metoda === 'DELETE') {
      await fsp.mkdir(COS, { recursive: true });
      await fsp.rename(c.absolut, path.join(COS, `${Date.now()}_${c.relativ.replaceAll('/', '__')}`)).catch(() => {});
      return trimite(res, 200, { ok: true });
    }
    const corp = await citesteCorp(req, MAX_IMAGINE);
    if (!corp.subarray(0, 8).equals(SEMNATURA_PNG)) return eroare(res, 400, 'Fișierul nu e un PNG adevărat.');
    await fsp.mkdir(path.dirname(c.absolut), { recursive: true });
    const temporar = `${c.absolut}.incarcare`;
    await fsp.writeFile(temporar, corp);
    await fsp.rename(temporar, c.absolut);
    return trimite(res, 200, { ok: true, cale: c.relativ });
  }

  if (metoda === 'PUT' && ruta.startsWith('aranjare/')) {
    const id = ruta.slice('aranjare/'.length);
    if (!ID_SCENA.test(id)) return eroare(res, 400, 'Id de scenă invalid.');
    let continut;
    try {
      continut = JSON.parse((await citesteCorp(req, 2 * 1024 * 1024)).toString('utf8'));
    } catch {
      return eroare(res, 400, 'JSON invalid.');
    }
    if (typeof continut !== 'object' || continut === null || Array.isArray(continut)) return eroare(res, 400, 'Aranjarea trebuie să fie un obiect.');
    await fsp.mkdir(path.join(DATA, 'aranjare'), { recursive: true });
    // Perechile de coordonate stau pe un rând, ca fișierul să fie ușor de citit și diff-urile mici
    const text = JSON.stringify(continut, null, 2).replace(/\[\s+(-?[\d.e-]+),\s+(-?[\d.e-]+)\s+\]/g, '[$1, $2]');
    await fsp.writeFile(path.join(DATA, 'aranjare', `${id}.json`), text + '\n');
    programeazaSincronizare();
    return trimite(res, 200, { ok: true });
  }

  if (metoda === 'GET' && ruta === 'stare') return trimite(res, 200, { sincronizare });

  if (metoda === 'POST' && ruta === 'actualizeaza') {
    try {
      const r = await inCoada(actualizeazaJocul);
      trimite(res, 200, { ok: true, jurnal: r.jurnal });
      // systemd îl repornește imediat (Restart=always), cu codul nou
      if (r.reporneste) setTimeout(() => process.exit(0), 500);
    } catch (e) {
      trimite(res, 500, { ok: false, eroare: e.message });
    }
    return;
  }

  if (metoda === 'GET' && ruta === 'backup') {
    const radacina = path.dirname(ASSETS);
    const elemente = [path.relative(radacina, ASSETS), path.relative(radacina, DATA)].filter((p) => fs.existsSync(path.join(radacina, p)));
    const zi = new Date().toISOString().slice(0, 10);
    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="fangs-vn-backup-${zi}.zip"`,
      'Cache-Control': 'no-store',
    });
    const zip = spawn('zip', ['-r', '-q', '-', ...elemente], { cwd: radacina });
    zip.stdout.pipe(res);
    zip.on('error', () => res.end());
    return;
  }

  eroare(res, 404, 'Rută necunoscută.');
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const cale = decodeURIComponent(url.pathname);

    if (cale.startsWith('/api/')) return await api(req, res, url.pathname.slice('/api/'.length));

    if (cale.startsWith('/assets/')) {
      const absolut = path.join(ASSETS, cale.slice('/assets/'.length));
      if (!absolut.startsWith(ASSETS + path.sep)) return eroare(res, 400, 'Cale invalidă.');
      return await servesteFisier(req, res, absolut);
    }

    const relativ = cale === '/' ? 'index.html' : cale.slice(1);
    const absolut = path.join(DIST, relativ);
    if (!absolut.startsWith(DIST + path.sep)) return eroare(res, 400, 'Cale invalidă.');
    return await servesteFisier(req, res, absolut, relativ.startsWith('build/'));
  } catch (e) {
    console.error(e);
    if (!res.headersSent) eroare(res, 500, e.message);
    else res.end();
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Server pe http://${HOST}:${PORT} (imagini: ${ASSETS}, GitHub: ${GIT_SYNC ? 'da' : 'nu'})`);
});
