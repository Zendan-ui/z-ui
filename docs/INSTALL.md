# نصب و راه‌اندازی Z-UI

## نصب سریع

دستور زیر را اجرا کنید:

```bash
sudo bash -c "$(curl -sL https://github.com/Zendan-ui/z-ui/raw/main/scripts/install.sh)" @ install
```

### پس از نصب

- داکر نصب و Z-UI به کمک داکر اجرا می‌شود.
- دستور `z-ui` در دسترس خواهد بود.
- داده‌ها در `/var/lib/z-ui` ذخیره می‌شوند.
- فایل‌های اپلیکیشن در `/opt/z-ui` قرار می‌گیرند.
- داشبورد روی پورت ۸۴۴۳ اجرا می‌شود.

ساخت ادمین:

```bash
z-ui admin create --sudo
```

## دستورات CLI

```bash
z-ui help
```

### مدیریت پنل

```bash
z-ui start           # شروع
z-ui stop            # توقف
z-ui restart         # ری‌استارت
z-ui status          # وضعیت + اطلاعات سیستم
z-ui logs            # مشاهده لاگ
z-ui update          # بروزرسانی
z-ui info            # آدرس پنل
```

### مدیریت ادمین

```bash
z-ui admin create --sudo    # ساخت ادمین
z-ui admin list             # لیست ادمین‌ها
z-ui admin delete <name>    # حذف ادمین
```

### مدیریت کاربران

```bash
z-ui user create              # ساخت کاربر (اینتراکتیو)
z-ui user list                # لیست کاربران
z-ui user delete <name>       # حذف کاربر
z-ui user suspend <name>      # تعلیق
z-ui user activate <name>     # فعال‌سازی
z-ui user reset-traffic <name> # ریست ترافیک
```

### تنظیمات

```bash
z-ui config edit          # ویرایش
z-ui config show          # نمایش (رمزها مخفی)
z-ui config set KEY VAL   # تنظیم
z-ui config get KEY       # خواندن
z-ui config reset-password # ریست رمز ادمین
z-ui config set-port      # تغییر پورت
```

### Xray

```bash
z-ui xray restart    # ری‌استارت
z-ui xray version    # نسخه
z-ui xray config     # نمایش کانفیگ
z-ui xray update     # بروزرسانی
```

### SSL / شبکه

```bash
z-ui ssl issue <domain>   # صدور گواهی
z-ui ssl renew             # تمدید
z-ui bbr                   # فعال‌سازی BBR
z-ui warp                  # نصب WARP
z-ui speedtest             # تست سرعت
z-ui geo-update            # بروزرسانی GeoIP
```

### فایروال

```bash
z-ui firewall status     # وضعیت
z-ui firewall open 443   # باز کردن پورت
z-ui firewall enable     # فعال‌سازی
z-ui firewall disable    # غیرفعال‌سازی
```

### پشتیبان‌گیری

```bash
z-ui backup              # ساخت پشتیبان
z-ui restore <file>      # بازگردانی
```

### سایر

```bash
z-ui health              # بررسی سلامت
z-ui completion install  # نصب autocomplete
z-ui uninstall           # حذف
z-ui                     # منوی اینتراکتیو
```

## منوی اینتراکتیو

با اجرای `z-ui` بدون آرگومان، منوی عددی نمایش داده می‌شود:

```
  Z-UI Panel Management — @Zendan_Ui
  0.  Exit
  ─────────
  1.  Update Z-UI
  2.  Start
  3.  Stop
  4.  Restart
  5.  Status
  6.  Logs
  ─────────
  7.  Create Admin
  8.  Create User
  9.  Reset Password
  10. Change Port
  11. View Config
  ─────────
  12. Enable BBR
  13. Issue SSL
  14. Update Geo Files
  15. Firewall Menu
  16. Install WARP
  17. Speedtest
  ─────────
  18. Backup
  19. Update Xray
  20. Health Check
  21. System Info
  22. Uninstall
```

## نصب با Docker Compose

```bash
git clone https://github.com/Zendan-ui/z-ui.git
cd z-ui
cp .env.example .env
nano .env
docker compose up -d
```

## نصب دستی

پیش‌نیازها: Go 1.22+, Node.js 20+, Xray-core

```bash
# نصب Xray
bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install

# کلون پروژه
git clone https://github.com/Zendan-ui/z-ui.git
cd z-ui

# بیلد بکاند
cd backend && go build -tags musl -o ../bin/z-ui ./cmd/server && cd ..

# بیلد فرانت‌اند
cd frontend && npm install && npm run build && cd ..

# اجرا
cp .env.example .env
nano .env
./bin/z-ui
```

## متغیرهای محیطی

فایل `.env` را ویرایش کنید:

| متغیر | پیش‌فرض | توضیح |
|---|---|---|
| `ZUI_PORT` | 8443 | پورت پنل |
| `ZUI_DB_TYPE` | sqlite | نوع دیتابیس |
| `ZUI_ADMIN_USER` | admin | نام ادمین |
| `ZUI_ADMIN_PASS` | admin | رمز ادمین |
| `ZUI_TELEGRAM_ENABLED` | false | فعال‌سازی بات |
| `ZUI_TELEGRAM_TOKEN` | | توکن بات |
| `ZUI_DEFAULT_THEME` | amoled | تم پیش‌فرض |

## پشتیبانی

- GitHub: [github.com/Zendan-ui/z-ui](https://github.com/Zendan-ui/z-ui)
- Telegram: [@Zendan_Ui](https://t.me/Zendan_Ui)
