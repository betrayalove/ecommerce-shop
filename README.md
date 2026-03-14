# Интернет-магазин

## Описание

Учебный pet-проект одностраничного приложения (SPA) интернет-магазина. Включает каталог товаров с фильтрами, корзину, регистрацию и вход. Демонстрирует работу с Redux Toolkit, SASS, Feature-Sliced Design (FSD), REST API и авторизацией по JWT (httpOnly cookie).

## Возможности

- Каталог товаров с фильтрами по категории
- Страница товара, добавление в корзину
- Корзина с сохранением в localStorage
- Регистрация и вход (JWT в httpOnly cookie)
- Защищённый маршрут «Мой аккаунт»
- Переключение светлой/тёмной темы
- Адаптивная вёрстка

## Стек

- **Фронтенд:** React 18, TypeScript, Redux Toolkit, RTK Query, SASS, Webpack, React Router v6
- **Бэкенд:** Node.js, Express, JWT, cookie-parser
- **Тесты:** Jest, React Testing Library (unit); Playwright (E2E)

## Переменные окружения

См. [.env.example](.env.example). Скопируйте в `.env` и при необходимости измените.

## Команды

- `npm install` — установка зависимостей
- `npm run dev` — только фронтенд (Webpack dev server)
- `npm run build` — сборка для продакшена
- `npm start` — запуск API и фронта одной командой (основной способ)
- `npm run server` — только API (порт 3080)
- `npm run test` — unit-тесты (Jest)
- `npm run e2e` — E2E (Playwright)
- `npm run e2e:ui` — E2E с UI Playwright
- `npm run preview` — просмотр собранной сборки (dist)

## Авторизация

JWT хранится в **httpOnly cookie**. При успешном `POST /api/auth/login` и `POST /api/auth/register` сервер устанавливает cookie (`auth_token`) с флагами HttpOnly, SameSite=Strict, Path=/. Фронтенд не пишет токен в localStorage; все запросы к API выполняются с `credentials: 'include'`. Проверка сессии — через `GET /api/auth/me`. Выход — `POST /api/auth/logout` (сброс cookie) и очистка состояния на клиенте.

## Запуск backend

В корне проекта: `npm run server` (или `npm start` для API + фронт). Либо из папки `server`: `npm run start`. API: http://localhost:3080. Тестовый пользователь: email `admin@test.com`, пароль `123456`.

## Структура проекта

- **src/app** — провайдеры, роутер, store, глобальные стили
- **src/pages** — страницы: каталог, товар, корзина, логин, регистрация, «О нас»
- **src/features** — сценарии: auth, корзина, фильтры
- **src/entities** — сущности: user, product, cart-item
- **src/shared** — UI, API, утилиты, стили (переменные, миксины, tokens.ts)
- **server** — backend Node.js + Express: auth (login, register, logout, /auth/me), products, CORS, cookie-parser
