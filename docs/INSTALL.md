# راه‌اندازی Z-UI

## نصب سریع (پیشنهادی)

### نکات قبل از نصب

با اجرای دستور نصب سریع:

- داکر بر روی ماشین شما نصب خواهد شد و Z-UI به کمک داکر اجرا خواهد شد.
- دستور `z-ui` بر روی ماشین شما در دسترس خواهد بود.
- داده‌های Z-UI در مسیر `/var/lib/z-ui` ذخیره خواهند شد.
- فایل‌های اپلیکیشن Z-UI (`docker-compose.yml` و `.env`) در مسیر `/opt/z-ui` ذخیره خواهند شد.

ابتدا دستور زیر را اجرا کنید:

```bash
sudo bash -c "$(curl -sL https://github.com/Zendan-ui/z-ui/raw/main/scripts/install.sh)" @ install
```

### بعد از نصب

- لاگ‌های Z-UI نمایش داده خواهد شد که با فشردن `Ctrl+C` می‌توانید آن را متوقف کنید.
- داشبورد به صورت پیش‌فرض روی پورت ۸۴۴۳ اجرا خواهد شد.
- آدرس داشبورد: `http://YOUR_SERVER_IP:8443/dashboard/`

در مرحله بعد، می‌توانید با اجرای دستور زیر یک ادمین سودو (مدیر کل) بسازید:

```bash
z-ui admin create --sudo
```

### لیست کامل دستورات CLI

```bash
z-ui help
```

خروجی:

```
  Z-UI — The Future of Proxy Management
  github.com/Zendan-ui/z-ui | @Zendan_Ui

  USAGE:
    z-ui <command> [args...]

  CORE:
    start                       Start Z-UI
    stop                        Stop Z-UI
    restart                     Restart Z-UI
    status                      Show status
    logs [lines]                View logs (default: 100)
    update                      Update to latest version
    info                        Show panel URL & info

  ADMIN:
    admin create [--sudo]       Create admin account
    admin list                  List admins
    admin delete <username>     Delete admin

  USER:
    user create                 Create user (interactive)
    user list                   List users
    user delete <username>      Delete user
    user suspend <username>     Suspend user
    user activate <username>    Activate user
    user reset-traffic <user>   Reset user traffic

  CONFIG:
    config edit                 Edit .env file
    config show                 Show config (masked)
    config set KEY VALUE        Set config value
    config get KEY              Get config value

  XRAY:
    xray restart                Restart Xray-core
    xray version                Show Xray version
    xray config                 Show Xray config
    xray update                 Update Xray-core

  SSL:
    ssl issue [domain]          Issue Let's Encrypt cert
    ssl renew                   Renew certificates

  DATA:
    backup                      Create backup
    restore <file>              Restore from backup

  SYSTEM:
    uninstall                   Uninstall Z-UI
    completion install          Install bash completion
    help                        Show this help
    version                     Show version
```

### تنظیمات

برای تغییر تنظیمات:

```bash
# ویرایش مستقیم فایل
z-ui config edit

# یا با nano
nano /opt/z-ui/.env

# مشاهده تنظیمات فعلی (رمزها مخفی)
z-ui config show

# تنظیم یک مقدار خاص
z-ui config set ZUI_PORT 443

# خواندن یک مقدار
z-ui config get ZUI_PORT
```

بعد از تغییر تنظیمات، ری‌استارت کنید:

```bash
z-ui restart
```

### SSL / HTTPS

```bash
# صدور گواهی SSL با Let's Encrypt
z-ui ssl issue yourdomain.com

# تمدید خودکار
z-ui ssl renew
```

### بکاپ و ریستور

```bash
# ساخت بکاپ
z-ui backup

# ریستور از بکاپ
z-ui restore /var/lib/z-ui/backups/z-ui-backup-manual-20260524.tar.gz
```

### آپدیت

```bash
z-ui update
```

### حذف کامل

```bash
z-ui uninstall
```

---

## نصب دستی (پیشرفته)

### ⚠ توجه

نصب Z-UI به صورت دستی فقط به افراد حرفه‌ای پیشنهاد می‌شود.

### پیش‌نیازها

- Go 1.22+
- Node.js 20+
- Xray-core
- Git

### نصب Xray

```bash
bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install
```

### کلون و بیلد

```bash
git clone https://github.com/Zendan-ui/z-ui.git
cd z-ui

# Backend
cd backend && go build -o ../bin/z-ui ./cmd/server && cd ..

# Frontend
cd frontend && npm ci && npm run build && cd ..
```

### اجرا

```bash
cp .env.example .env
nano .env          # تنظیمات خود را وارد کنید

./bin/z-ui
```

Z-UI به طور پیش‌فرض روی پورت ۸۴۴۳ اجرا خواهد شد.

---

## پشتیبانی

- GitHub: [github.com/Zendan-ui/z-ui](https://github.com/Zendan-ui/z-ui)
- Telegram: [@Zendan_Ui](https://t.me/Zendan_Ui)

**Z-UI — The Future of Proxy Management** 🚀
