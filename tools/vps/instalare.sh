#!/usr/bin/env bash
# Instalează editorul și jocul pe VPS, lângă site-urile care există deja.
# Se poate rula de mai multe ori: ce e deja făcut se sare.
# Rulare (ca root, în Web console):
#   curl -fsSL https://raw.githubusercontent.com/SilverName99/Fangs-Honor-Visual-Novel/main/tools/vps/instalare.sh -o /root/instalare-vn.sh && bash /root/instalare-vn.sh
set -euo pipefail

DOMENIU="visual-novel.fangs-and-honor.com"
REPO="git@github.com:SilverName99/Fangs-Honor-Visual-Novel.git"
UTILIZATOR="fangsvn"
BAZA="/srv/fangs-vn"
APP="$BAZA/app"
ASSETS="$BAZA/assets"
PORT=3217
SERVICIU="fangs-vn"
SITE="/etc/nginx/sites-available/$DOMENIU"
PAROLE="/etc/nginx/fangs-vn.htpasswd"

pas() { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
gata() { printf '\033[1;32m    %s\033[0m\n' "$*"; }
opreste() { printf '\n\033[1;31mOPRIT: %s\033[0m\n' "$*"; exit 1; }
ca_utilizator() { sudo -H -u "$UTILIZATOR" "$@"; }
# ssh -T iese mereu cu cod 1 la GitHub, chiar și când cheia e bună, deci verificăm mesajul, nu codul
cheie_acceptata() {
  local iesire
  iesire=$(ca_utilizator ssh -o BatchMode=yes -T git@github.com 2>&1 || true)
  grep -q "successfully authenticated" <<<"$iesire"
}

[ "$(id -u)" = 0 ] || opreste "Rulează scriptul ca root."

pas "1/8 Verific nginx (site-urile existente nu se ating)"
command -v nginx >/dev/null || opreste "nginx nu e instalat."
# Dacă nginx are deja o problemă, nu schimbăm nimic: altfel n-am ști cine a stricat-o
nginx -t >/dev/null 2>&1 || opreste "nginx -t dă deja eroare, înainte de orice schimbare. Nu ating nimic."
gata "nginx e în regulă."

pas "2/8 Pachete necesare"
lipsa=()
for p in git zip openssl curl sudo; do command -v "$p" >/dev/null || lipsa+=("$p"); done
command -v certbot >/dev/null || lipsa+=(certbot python3-certbot-nginx)
command -v node >/dev/null || lipsa+=(nodejs npm)
if [ ${#lipsa[@]} -gt 0 ]; then
  apt-get update -qq
  DEBIAN_FRONTEND=noninteractive apt-get install -y -qq "${lipsa[@]}"
fi
NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
# Node-ul existent poate fi folosit de alt site, deci nu îl schimbăm; doar cerem minimum 18
[ "$NODE_MAJOR" -ge 18 ] || opreste "Node e prea vechi (v$NODE_MAJOR). E nevoie de minimum 18. Nu îl actualizez singur, ca să nu stric alt site."
command -v npm >/dev/null || opreste "npm lipsește."
gata "Node v$(node -v | tr -d v), git, zip, certbot: ok."

pas "3/8 Utilizatorul serviciului și folderele"
id "$UTILIZATOR" >/dev/null 2>&1 || useradd --system --create-home --home-dir "/home/$UTILIZATOR" --shell /bin/bash "$UTILIZATOR"
mkdir -p "$BAZA" "$ASSETS"
chown "$UTILIZATOR:$UTILIZATOR" "$BAZA" "$ASSETS"
gata "Imaginile vor sta în $ASSETS (nu în GitHub)."

pas "4/8 Cheia pentru GitHub"
CHEIE="/home/$UTILIZATOR/.ssh/id_ed25519"
if [ ! -f "$CHEIE" ]; then
  ca_utilizator mkdir -p -m 700 "/home/$UTILIZATOR/.ssh"
  ca_utilizator ssh-keygen -q -t ed25519 -N "" -C "fangs-vn@vps" -f "$CHEIE"
fi
ca_utilizator bash -c "ssh-keyscan -t ed25519 github.com >> ~/.ssh/known_hosts 2>/dev/null; sort -u -o ~/.ssh/known_hosts ~/.ssh/known_hosts"
while ! cheie_acceptata; do
  echo
  echo "Trebuie adăugată cheia de mai jos în GitHub (o singură dată):"
  echo "  1. Deschide https://github.com/SilverName99/Fangs-Honor-Visual-Novel/settings/keys/new"
  echo "  2. Title: VPS editor"
  echo "  3. Key: copiază TOT rândul de mai jos"
  echo "  4. Bifează „Allow write access”, apoi „Add key”"
  echo
  cat "$CHEIE.pub"
  echo
  read -r -p "Apasă Enter după ce ai adăugat cheia... " _
done
gata "GitHub acceptă cheia."

pas "5/8 Codul jocului"
if [ -d "$APP/.git" ]; then
  ca_utilizator git -C "$APP" pull --rebase origin main
else
  ca_utilizator git clone "$REPO" "$APP"
fi
ca_utilizator git -C "$APP" config user.name "Editor Fangs&Honor"
ca_utilizator git -C "$APP" config user.email "editor@$DOMENIU"
ca_utilizator bash -c "cd '$APP' && npm ci --no-audit --no-fund && npm run build"
gata "Jocul e compilat."

pas "6/8 Serviciul (pornește singur și la restart)"
if [ -n "$(ss -Hltn "sport = :$PORT")" ] && ! systemctl is-active --quiet "$SERVICIU"; then
  opreste "Portul $PORT e deja folosit de altceva. Spune-i lui Claude, schimbăm portul."
fi
cat > "/etc/systemd/system/$SERVICIU.service" <<EOF
[Unit]
Description=Fangs&Honor visual novel (joc + editor)
After=network.target

[Service]
User=$UTILIZATOR
WorkingDirectory=$APP
Environment=PORT=$PORT
Environment=HOST=127.0.0.1
Environment=APP_DIR=$APP
Environment=ASSETS_DIR=$ASSETS
Environment=GIT_SYNC=1
ExecStart=$(command -v node) server/server.js
Restart=always
RestartSec=2

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable --quiet "$SERVICIU"
systemctl restart "$SERVICIU"
sleep 2
curl -fsS -o /dev/null "http://127.0.0.1:$PORT/" || opreste "Serverul nu pornește. Vezi: journalctl -u $SERVICIU -n 50"
gata "Serverul merge (doar local, pe portul $PORT; din afară se intră prin nginx)."

pas "7/8 Parola site-ului"
if [ ! -s "$PAROLE" ] || [ "${PAROLA_NOUA:-0}" = 1 ]; then
  read -r -p "Nume de utilizator pentru site: " U
  while true; do
    read -r -s -p "Parola: " P1; echo
    read -r -s -p "Parola din nou: " P2; echo
    [ -n "$P1" ] && [ "$P1" = "$P2" ] && break
    echo "Parolele nu coincid (sau e goală). Încă o dată."
  done
  printf '%s:%s\n' "$U" "$(openssl passwd -apr1 "$P1")" > "$PAROLE"
  chown root:www-data "$PAROLE"
  chmod 640 "$PAROLE"
  gata "Parola e setată."
else
  gata "Parola există deja (ca s-o schimbi: PAROLA_NOUA=1 bash /root/instalare-vn.sh)."
fi

pas "8/8 Subdomeniul în nginx + HTTPS"
if [ ! -f "$SITE" ]; then
  cat > "$SITE" <<EOF
# Fangs&Honor visual novel. Adăugat de tools/vps/instalare.sh; celelalte site-uri nu sunt atinse.
server {
    listen 80;
    listen [::]:80;
    server_name $DOMENIU;

    client_max_body_size 50m;

    # Certbot trebuie să poată verifica domeniul fără parolă
    location /.well-known/acme-challenge/ {
        auth_basic off;
        root /var/www/html;
    }

    location / {
        auth_basic "Fangs&Honor";
        auth_basic_user_file $PAROLE;
        proxy_pass http://127.0.0.1:$PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_request_buffering off;
        proxy_read_timeout 600s;
    }
}
EOF
  ln -sf "$SITE" "/etc/nginx/sites-enabled/$DOMENIU"
  if ! nginx -t >/dev/null 2>&1; then
    rm -f "/etc/nginx/sites-enabled/$DOMENIU" "$SITE"
    nginx -t || true
    opreste "Configurația nouă nu trece nginx -t. Am scos-o la loc, celelalte site-uri merg ca înainte."
  fi
  systemctl reload nginx
  gata "Subdomeniul e adăugat în nginx."
fi

if grep -q "listen 443" "$SITE"; then
  gata "HTTPS e deja activ."
else
  IP_DOMENIU=$(getent ahostsv4 "$DOMENIU" | awk '{print $1; exit}' || true)
  if [ -n "$IP_DOMENIU" ] && hostname -I | tr ' ' '\n' | grep -qx "$IP_DOMENIU"; then
    certbot --nginx -d "$DOMENIU" --non-interactive --agree-tos --register-unsafely-without-email --redirect
    gata "HTTPS activ."
  else
    echo
    echo "ATENȚIE: $DOMENIU nu arată încă spre acest VPS (DNS: ${IP_DOMENIU:-nimic})."
    echo "Adaugă în DNS o înregistrare A: visual-novel -> IP-ul VPS-ului, așteaptă 15-30 de minute"
    echo "și rulează din nou: bash /root/instalare-vn.sh (restul se sare, face doar HTTPS-ul)."
    exit 0
  fi
fi

printf '\n\033[1;32mGATA!\033[0m\n'
echo "  Editorul: https://$DOMENIU/editor.html"
echo "  Jocul:    https://$DOMENIU/"
