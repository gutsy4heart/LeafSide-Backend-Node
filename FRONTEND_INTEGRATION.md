# Интеграция с фронтендом LeafSide.Frontend

## ✅ Выполненные изменения

### 1. Добавлены альтернативные маршруты для совместимости

Node.js бэкенд теперь поддерживает оба варианта именования путей:

**Основные маршруты (маленькие буквы):**
- `/api/account/*`
- `/api/books/*`
- `/api/cart/*`
- `/api/orders/*`
- `/api/admin/*`
- `/api/userstats/*`

**Альтернативные маршруты (большие буквы - для совместимости с фронтендом):**
- `/api/Account/*` → соответствует `/api/account/*`
- `/api/Books/*` → соответствует `/api/books/*`
- `/api/Cart/*` → соответствует `/api/cart/*`
- `/api/Orders/*` → соответствует `/api/orders/*`
- `/api/Admin/*` → соответствует `/api/admin/*`
- `/api/UserStats/*` → соответствует `/api/userstats/*`

**Специальные маршруты (C# стиль именования):**
- `/api/AdminUsers/*` → соответствует `/api/admin/*` (для `/api/AdminUsers/users`)
- `/api/UserProfile/*` → соответствует `/api/account/*` (для `/api/UserProfile/profile`)

### 2. Конфигурация

**Порт бэкенда:** `5233` (по умолчанию)  
**Порт фронтенда:** `3000` (по умолчанию)

**CORS настроен для:** `http://localhost:3000`

## 📋 Соответствие эндпоинтов

| Фронтенд запрашивает | Бэкенд обрабатывает | Статус |
|----------------------|---------------------|--------|
| `POST /api/Account/register` | ✅ `/api/account/register` | ✅ |
| `POST /api/Account/login` | ✅ `/api/account/login` | ✅ |
| `GET /api/Account/profile` | ✅ `/api/account/profile` | ✅ |
| `PUT /api/Account/profile` | ✅ `/api/account/profile` | ✅ |
| `POST /api/Account/refresh` | ✅ `/api/account/refresh` | ✅ |
| `GET /api/Books` | ✅ `/api/books` | ✅ |
| `GET /api/Books/:id` | ✅ `/api/books/:id` | ✅ |
| `POST /api/Books` | ✅ `/api/books` (Admin) | ✅ |
| `PUT /api/Books/:id` | ✅ `/api/books/:id` (Admin) | ✅ |
| `DELETE /api/Books/:id` | ✅ `/api/books/:id` (Admin) | ✅ |
| `GET /api/Cart` | ✅ `/api/cart` | ✅ |
| `POST /api/Cart/items` | ✅ `/api/cart/items` | ✅ |
| `DELETE /api/Cart/items/:bookId` | ✅ `/api/cart/items/:bookId` | ✅ |
| `DELETE /api/Cart` | ✅ `/api/cart` | ✅ |
| `POST /api/Orders` | ✅ `/api/orders` | ✅ |
| `GET /api/Orders` | ✅ `/api/orders` | ✅ |
| `GET /api/Orders/:id` | ✅ `/api/orders/:id` | ✅ |
| `PUT /api/Orders/:id/confirm-delivery` | ✅ `/api/orders/:id/confirm-delivery` | ✅ |
| `GET /api/AdminUsers/users` | ✅ `/api/admin/users` | ✅ |
| `POST /api/AdminUsers/users` | ✅ `/api/admin/users` | ✅ |
| `GET /api/AdminUsers/users/:userId` | ✅ `/api/admin/users/:userId` | ✅ |
| `PUT /api/AdminUsers/users/:userId` | ✅ `/api/admin/users/:userId` | ✅ |
| `PUT /api/AdminUsers/users/:userId/role` | ✅ `/api/admin/users/:userId/role` | ✅ |
| `DELETE /api/AdminUsers/users/:userId` | ✅ `/api/admin/users/:userId` | ✅ |
| `GET /api/Admin/orders` | ✅ `/api/admin/orders` | ✅ |
| `GET /api/Admin/carts` | ✅ `/api/admin/carts` | ✅ |
| `GET /api/UserStats/stats` | ✅ `/api/userstats/stats` | ✅ |
| `GET /api/UserProfile/profile` | ✅ `/api/account/profile` | ✅ |
| `PUT /api/UserProfile/profile` | ✅ `/api/account/profile` | ✅ |

## 🔧 Настройка переменных окружения

### Фронтенд (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5233
NEXT_PUBLIC_API_BASE_URL=http://localhost:5233
NEXT_PUBLIC_BACKEND_URL=http://localhost:5233
NEXT_PUBLIC_ORIGIN=http://localhost:3000
```

### Бэкенд (.env)

```env
PORT=5233
NODE_ENV=development
DATABASE_URL=postgresql://leafuser:leafpass@localhost:5433/leafsidedb_node?schema=public
JWT_SECRET=your-secret-key-here
JWT_ISSUER=LeafSide
JWT_AUDIENCE=LeafSide
JWT_EXPIRES_IN=60m
CORS_ORIGIN=http://localhost:3000
```

## 🚀 Запуск

### 1. Запуск бэкенда

```bash
cd Leafside-backend-node
npm install
npm run dev
```

Бэкенд будет доступен на `http://localhost:5233`

### 2. Запуск фронтенда

```bash
cd LeafSide.Frontend
npm install
npm run dev
```

Фронтенд будет доступен на `http://localhost:3000`

## 🔍 Проверка интеграции

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
curl -X POST http://localhost:5233/api/Account/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Вход
curl -X POST http://localhost:5233/api/Account/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## ⚠️ Важные замечания

1. **Регистр путей**: Бэкенд поддерживает оба варианта (маленькие и большие буквы), но рекомендуется использовать единый стиль.

2. **Формат данных**: 
   - Все запросы должны использовать `Content-Type: application/json`
   - Все ответы возвращаются в формате JSON
   - Имена полей используют camelCase (например, `firstName`, `lastName`)

3. **Аутентификация**:
   - Токен передается в заголовке `Authorization: Bearer <token>`
   - Токен автоматически обновляется через `/api/Account/refresh`

4. **CORS**: Настроен для `http://localhost:3000` по умолчанию. Для продакшена необходимо обновить `CORS_ORIGIN`.

## 📝 Дополнительная информация

Все эндпоинты полностью соответствуют C# версии бэкенда и готовы к работе с фронтендом Next.js.

