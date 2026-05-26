<p align="center">
  <img src="assets/logo.svg" width="120" alt="Z-UI" />
</p>

<h1 align="center">Z-UI</h1>

<p align="center">
  پنل مدیریت پروکسی · Proxy Management Panel · Панель управления прокси
</p>

<p align="center">
  <a href="#نصب">فارسی</a> · <a href="#install">English</a> · <a href="#установка">Русский</a> · <a href="https://t.me/Zendan_Ui">Telegram</a>
</p>

---

## نصب

```bash
sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/Zendan-ui/z-ui/main/scripts/install.sh)" -- install
```

نصاب به‌صورت خودکار این کارها را انجام می‌دهد:
- نصب Docker در صورت نیاز
- دریافت آخرین ایمیج Z-UI
- ساخت مسیرهای اجرایی در `/opt/z-ui`
- پرسیدن نام کاربری و رمز ادمین
- تنظیم پورت پنل و پورت سابسکریپشن
- نصب دستور مدیریتی `z-ui`

آدرس پیش‌فرض بعد از نصب:

```
http://SERVER_IP:2095/app/
```

فرمان‌های اصلی:

```
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

مسیرها:
- Runtime: `/opt/z-ui`
- Database: `/opt/z-ui/db`
- Certificates: `/opt/z-ui/cert`

راهنمای کامل‌تر نصب در `docs/INSTALL.md` قرار دارد.

---

## Install

```bash
sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/Zendan-ui/z-ui/main/scripts/install.sh)" -- install
```

The installer will automatically:
- install Docker if needed
- pull the latest Z-UI image
- create the runtime directory under `/opt/z-ui`
- ask for admin username and password
- configure panel and subscription ports
- install the `z-ui` helper command

Default access URL after installation:

```
http://SERVER_IP:2095/app/
```

Main commands:

```
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

Paths:
- Runtime: `/opt/z-ui`
- Database: `/opt/z-ui/db`
- Certificates: `/opt/z-ui/cert`

See `docs/INSTALL.md` for the full installation guide.

---

## Установка

```bash
sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/Zendan-ui/z-ui/main/scripts/install.sh)" -- install
```

Установщик автоматически:
- установит Docker при необходимости
- скачает последний образ Z-UI
- создаст рабочую директорию `/opt/z-ui`
- запросит логин и пароль администратора
- настроит порт панели и подписки
- установит управляющую команду `z-ui`

Стандартный адрес после установки:

```
http://SERVER_IP:2095/app/
```

Основные команды:

```
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

Пути:
- Runtime: `/opt/z-ui`
- Database: `/opt/z-ui/db`
- Certificates: `/opt/z-ui/cert`

Подробная инструкция находится в `docs/INSTALL.md`.

---

<p align="center">MIT License</p>
