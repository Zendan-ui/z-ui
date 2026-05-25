# نصب Z-UI

## نصب سریع

```bash
sudo bash -c "$(curl -sL https://github.com/Zendan-ui/z-ui/raw/main/scripts/install.sh)" @ install
```

### بعد از نصب

لاگ‌ها نمایش داده می‌شود. با `Ctrl+C` متوقف کنید.

ساخت ادمین:

```bash
z-ui admin create --sudo
```

داشبورد: `http://YOUR_IP:8443/dashboard/`

### ساختار فایل‌ها

| مسیر | محتوا |
|---|---|
| `/opt/z-ui/.env` | تنظیمات |
| `/opt/z-ui/docker-compose.yml` | فایل داکر |
| `/var/lib/z-ui/db/` | دیتابیس SQLite |
| `/var/lib/z-ui/xray/` | کانفیگ Xray |
| `/var/lib/z-ui/certs/` | گواهی SSL |
| `/var/lib/z-ui/backups/` | پشتیبان‌ها |
| `/var/lib/z-ui/logs/` | لاگ‌ها |

### تغییر تنظیمات

```bash
z-ui config edit
z-ui restart
```

### دستورات

```
z-ui start        شروع
z-ui stop         توقف
z-ui restart      ری‌استارت
z-ui status       وضعیت
z-ui logs         لاگ
z-ui update       بروزرسانی
z-ui info         آدرس پنل
z-ui admin create ساخت ادمین
z-ui config edit  ویرایش تنظیمات
z-ui config show  نمایش تنظیمات
z-ui backup       پشتیبان
z-ui uninstall    حذف
```

### پشتیبانی

- Telegram: [@Zendan_Ui](https://t.me/Zendan_Ui)
- GitHub: [github.com/Zendan-ui/z-ui](https://github.com/Zendan-ui/z-ui)
