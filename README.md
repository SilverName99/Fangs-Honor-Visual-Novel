# Fangs&Honor: Recuperarea satului

Visual novel cu elemente de RPG. Documentul de design și regulile proiectului: [`CLAUDE.md`](CLAUDE.md).

## Unde e ce

| Folder | Ce conține |
|---|---|
| `src/` | jocul |
| `editor/` | editorul (galerie, aranjare) |
| `server/` | serverul de pe VPS |
| `data/` | conținutul jocului (JSON); `data/aranjare/` e scris de editor |
| `tools/vps/` | scriptul de instalare pe VPS |

Imaginile **nu** sunt în GitHub: stau pe VPS, în `/srv/fangs-vn/assets`.

## Instalarea pe VPS (o singură dată)

În panoul Hostinger → VPS → **Web console**, lipește:

```bash
curl -fsSL https://raw.githubusercontent.com/SilverName99/Fangs-Honor-Visual-Novel/main/tools/vps/instalare.sh -o /root/instalare-vn.sh && bash /root/instalare-vn.sh
```

Scriptul cere pe parcurs: adăugarea unei chei în GitHub și o parolă pentru site.
La final: editorul e la `https://visual-novel.fangs-and-honor.com/editor.html`.

## Local (pentru dezvoltare)

```bash
npm install
npm start
```

Apoi `http://127.0.0.1:3217/` (jocul) și `http://127.0.0.1:3217/editor.html` (editorul).
