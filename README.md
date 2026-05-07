# Home Rank

MVP-платформа Home Rank для аналитики недвижимости с двухуровневым доступом:

- Бесплатный каталог и расширенный поиск
- Разовая покупка полного аналитического отчёта по объекту
- Роли: гость, пользователь, риелтор, администратор

## Стек

- Frontend: React 18, TypeScript, Tailwind CSS, Zustand, React Query, React Hook Form, Zod, Recharts
- Backend: Node.js, Express, TypeScript, Prisma, PostgreSQL/PostGIS-ready schema, JWT-ready auth
- Интеграции MVP: Mapbox, Kaspi/Stripe, Redis, Playwright и Bull заложены на уровне архитектуры

## Структура

- `client` — витрина, каталог, карточка объекта, отчёты, аналитика, кабинет, admin UI
- `server` — REST API, сидовые данные, фильтрация, отчёты, Prisma schema

## Быстрый старт

1. Установить зависимости:
   - `./npm install`
2. Запустить backend:
   - `./npm run dev:server`
3. Запустить frontend:
   - `./npm run dev:client`

Локальные обёртки `./node` и `./npm` используют установленный в проект `.tools/node-v22.22.2-darwin-arm64`, поэтому системный Node.js не требуется.

## Переменные окружения

### Client

- `VITE_API_URL=http://localhost:4000/api`
- `VITE_MAPBOX_TOKEN=your_mapbox_token`

### Server

- `PORT=4000`
- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kz_property_mvp`
- `JWT_SECRET=dev-secret`
- `CLIENT_URL=http://localhost:5173`

## Что уже покрыто в MVP

- Каталог с фильтрами по жилой недвижимости
- Карточка объекта с бесплатной и платной частью
- Публичная аналитика рынка
- Кабинет с купленными отчётами и избранным
- Админ-панель с обзором ingest и платежей
- Backend API с mock-данными, готовый к подключению Prisma/PostgreSQL

## Следующие шаги

- Подключить реальную PostgreSQL + PostGIS
- Добавить Playwright-парсер Krisha/OLX и очередь обновлений
- Реализовать Kaspi Pay / Stripe checkout
- Генерация PDF-отчёта и реальная авторизация JWT
