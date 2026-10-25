# Интернет-магазин

React 18 / TypeScript, Redux Toolkit + RTK Query, React Router, Webpack и Express. Каталог с фильтрами, карточки товаров, сохраняемая корзина, регистрация, cookie-сессии и страница профиля. Это демонстрация без оформления заказов и оплаты.

## Запуск

Нужен Node.js 24 (`nvm use`).

```sh
npm ci
npm --prefix server ci
cp .env.example .env
npm start
```

Frontend: http://localhost:4173; API: http://localhost:3080/api. Webpack отправляет `/api` на локальный backend. Корневой `.env` загружается командами `npm start`/`npm run server`; `server/.env` может переопределять серверные настройки. Тестовый вход: `admin@test.com` / `123456`. `DEMO_PASSWORD` задаётся до первого создания файла пользователей.

## Проверки

```sh
npm run typecheck
npm test -- --runInBand
npm run test:server
npm run build
npx playwright install chromium
npm run e2e
```

E2E проверяют production-сборку на порту4373, включая каталог/корзину, регистрацию, сохранение сессии после reload, профиль и logout. Для dev-проверки: `E2E_PREVIEW=false npm run e2e`; для другого frontend-порта: `WEB_PORT=... npm run e2e`. GitHub Actions выполняет установку обоих lock-файлов, проверки типов, unit/API, audit, build и production E2E на Node24.

`npm run dev` запускает только Webpack; `npm run server` — только API. `npm run preview` после build запускает static dist и API на одном origin (4173), поэтому просмотр production-сборки поддерживает авторизацию и каталог.

## Vercel + Render

Frontend размещается на Vercel, backend — отдельным Node-сервисом Render. В браузере все REST-запросы идут на **`/api` frontend-домена**: Vercel function `api/proxy.js` пересылает запросы в Render и возвращает cookie. Поэтому сессии остаются first-party даже при блокировке сторонних cookie.

Vercel: подключить `betrayalove/ecommerce-shop`, branch `main`, Node24. `vercel.json` задаёт build/dist и SPA fallback. Переменная **`API_ORIGIN`** — HTTPS-origin backend без `/api`, например `https://ecommerce-shop-47tg.onrender.com`. Старую `VITE_API_URL` больше использовать не нужно. Gateway имеет fallback на существующее демо; при переносе задайте API_ORIGIN явно. Frontend не получает серверных секретов.

Render: существующий сервис можно настроить вручную или использовать `render.yaml` (free). Root directory `server`, build `npm ci`, start `npm start`, health `/health`, Node24. Обязателен уникальный `JWT_SECRET` минимум32байта; production не стартует с отсутствующим/коротким ключом. Blueprint генерирует ключ. `CORS_ORIGIN` — разрешённые frontend-origin через запятую, включая canonical production. Проверенный gateway пересылает canonical Origin (`GATEWAY_ORIGIN`, по умолчанию production URL магазина), поэтому preview не требует wildcard-доступа backend. Backend отклоняет изменения с чужим Origin; gateway тоже проверяет origin. Не включайте wildcard с credentials.

Пароли сохраняются как salted scrypt-хеши, JWT находятся в httpOnly Secure SameSite=Strict cookie, logout отзывает активные сессии пользователя. API проверяет типы/границы данных и ограничивает неудачные попытки входа/регистрации. Данные пользователей атомарно сохраняются в `server/data/users.json` либо в `DATA_FILE`; этот файл исключён из Git. Повреждённый файл не перезаписывается молча.

На бесплатном Render файловая система временная: данные переживают refresh и обычную работу процесса, но могут сбрасываться при redeploy/замене инстанса. Для постоянного хранения нужен внешний store или подключённый persistent disk; платные ресурсы автоматически не создаются.

Git integration Vercel запускает deployment после push. GitHub CI проверяется отдельно; для строго последовательного выпуска используйте защищённую main с обязательным CI или отдельный deployment workflow. Верификация демо: открыть `/catalog` и `/account` напрямую, войти, обновить страницу, проверить профиль и выход.
