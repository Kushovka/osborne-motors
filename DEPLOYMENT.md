# Osborne Motors — передача на сервер

В проекте сохранены исходная архитектура сайта, Docker-конфигурация и схема базы данных. Секреты намеренно не включены.

## Настройка сервера

1. Создать `backend/.env` на основе `backend/.env.example` и задать значения подключения к базе, пароль, CORS-домен и, если используется, адрес формы `BASIN_FORM_ACTION`.
2. При настройке публичного домена задать в backend `.env` переменную `PUBLIC_SITE_URL` — она используется для формирования sitemap.
3. Перед сборкой фронтенда создать `frontend/.env`:
   ```env
   VITE_API_URL=https://<домен>/api
   VITE_META_PIXEL_ID=
   VITE_MAINTENANCE_MODE=false
   ```
4. Настроить Nginx/Apache для домена сайта: отдавать собранный фронтенд, а `/api` проксировать на backend-порт `8001`.
5. Из папки `backend` выполнить:
   ```bash
   docker compose up -d --build
   ```

## Секреты

`backend/.env` и `frontend/.env` не включать в архив или публичные артефакты.
