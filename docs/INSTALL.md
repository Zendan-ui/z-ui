# Z-UI Installation Guide

## Quick install

```bash
sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/Zendan-ui/z-ui/main/scripts/install.sh)" -- install
```

The installer will:
- install Docker if needed
- pull the latest `ghcr.io/zendan-ui/z-ui:latest` image
- create the runtime files under `/opt/z-ui`
- ask for:
  - admin username
  - admin password
  - panel port
  - subscription port
- configure the panel automatically
- install a `z-ui` helper command

---

## Default access

After installation the panel is usually available at:

```text
http://SERVER_IP:2095/app/
```

Default paths:
- Panel path: `/app/`
- Subscription path: `/sub/`

Recommended first step after login:
- open **Settings**
- verify panel port/path
- verify subscription port/path
- configure your domain and TLS if needed

---

## Installed paths

Main runtime directory:

```text
/opt/z-ui
```

Persistent data:

```text
/opt/z-ui/db
```

Certificates:

```text
/opt/z-ui/cert
```

---

## Management commands

```bash
z-ui start
z-ui stop
z-ui restart
z-ui status
z-ui logs
z-ui update
z-ui info
z-ui admin show
z-ui admin set <username> <password>
z-ui setting show
z-ui setting set-port <port>
z-ui uninstall
```

---

## Manual Docker install

If you prefer a manual installation:

```bash
mkdir -p /opt/z-ui
cd /opt/z-ui
curl -fsSL https://raw.githubusercontent.com/Zendan-ui/z-ui/main/docker-compose.yml -o docker-compose.yml
docker compose up -d
```

Then configure admin and port manually:

```bash
docker exec z-ui sh -lc "./z-ui admin -username admin -password strongpassword"
docker exec z-ui sh -lc "./z-ui setting -port 2095 -path /app/ -subPort 2096 -subPath /sub/"
```

---

## Upgrade

```bash
z-ui update
```

---

## Logs

```bash
z-ui logs
```

---

## Uninstall

```bash
z-ui uninstall
```

This removes the runtime files but you should verify whether you want to keep or delete persisted data under `/opt/z-ui`.
