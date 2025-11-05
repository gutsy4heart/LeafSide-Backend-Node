# 🚀 Быстрый старт LeafSide Backend (Node.js)

## Шаг 1: Запуск базы данных

База данных уже запущена! Если нужно перезапустить:

```bash
# Запуск базы данных
npm run db:up
# или
docker-compose up -d db_node
```

## Шаг 2: Применение миграций

Миграции уже применены. Если нужно применить заново:

```bash
npm run prisma:migrate
```

## Шаг 3: (Опционально) Заполнение начальными данными

```bash
npm run prisma:seed
```

## Шаг 4: Запуск сервера

```bash
npm run dev
```

Сервер будет доступен на: `http://localhost:5233`

## ✅ Проверка работоспособности

### Health Check
```bash
curl http://localhost:5233/api/health
```

Должен вернуть:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "selectedBase": "PostgreSQL"
}
```

### Тест аутентификации
```bash
# Регистрация
curl -X POST http://localhost:5233/api/account/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "phoneNumber": "+1234567890",
    "countryCode": "US",
    "gender": "M"
  }'
```

## 📋 Полезные команды

```bash
# Запуск базы данных
npm run db:up

# Остановка базы данных
npm run db:down

# Генерация Prisma Client
npm run prisma:generate

# Применение миграций
npm run prisma:migrate

# Заполнение начальными данными
npm run prisma:seed

# Prisma Studio (GUI для базы данных)
npm run prisma:studio

# Запуск в режиме разработки
npm run dev

# Сборка проекта
npm run build

# Запуск продакшен версии
npm start
```

## 🔧 Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```env
PORT=5233
NODE_ENV=development
DATABASE_URL=postgresql://leafuser:leafpass@localhost:5433/leafsidedb_node?schema=public
JWT_SECRET=your-secret-key-change-in-production
JWT_ISSUER=LeafSide
JWT_AUDIENCE=LeafSide
JWT_EXPIRES_IN=60m
CORS_ORIGIN=http://localhost:3000
```

## ⚠️ Устранение проблем

### Ошибка "Can't reach database server"

1. Проверьте, что контейнер запущен:
```bash
docker ps --filter name=leafside_db_node
```

2. Если контейнер не запущен, запустите его:
```bash
npm run db:up
```

3. Подождите несколько секунд, чтобы база данных полностью запустилась

4. Проверьте подключение:
```bash
docker exec -it leafside_db_node psql -U leafuser -d leafsidedb_node
```

### Ошибка миграций

Если миграции не применяются:

```bash
# Принудительное применение миграций
npx prisma migrate deploy
```

### Ошибка Prisma Client

Если Prisma Client не сгенерирован:

```bash
npm run prisma:generate
```

