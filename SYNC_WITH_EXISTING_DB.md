# Синхронизация Prisma с существующей базой данных

## Важно!

C# проект использует **ASP.NET Identity**, который создает таблицы:
- `AspNetUsers` (вместо `users`)
- `AspNetRoles` (вместо `roles`)
- `AspNetUserRoles` (вместо `user_roles`)
- `AspNetUserClaims`, `AspNetRoleClaims` и др.

## Варианты решения:

### Вариант 1: Использовать Prisma db pull (рекомендуется)

Это автоматически сгенерирует схему Prisma на основе существующих таблиц:

```bash
# Убедитесь, что база данных запущена
cd ../LeafSide-backend
docker-compose up -d

# Вернитесь в Node.js проект
cd ../leafside-backend-node

# Автоматически сгенерировать схему из существующей БД
npx prisma db pull

# Генерация Prisma Client
npm run prisma:generate
```

**Внимание:** После `db pull` нужно будет:
- Переименовать модели (AspNetUsers -> User)
- Исправить связи
- Удалить ненужные таблицы Identity (если они не нужны)

### Вариант 2: Использовать существующие таблицы с ручной настройкой

Обновить `schema.prisma`, чтобы он соответствовал реальным именам таблиц ASP.NET Identity:

```prisma
model User {
  id            String   @id @default(uuid()) @map("Id")
  email         String   @map("Email")
  // ... другие поля из AspNetUsers
  @@map("AspNetUsers")
}
```

### Вариант 3: Использовать raw SQL запросы через Prisma

Не использовать Prisma модели, а работать напрямую с SQL:

```typescript
const users = await prisma.$queryRaw`SELECT * FROM "AspNetUsers"`;
```

## Рекомендация

Для начала лучше использовать **Вариант 1** (`prisma db pull`), а затем вручную доработать схему под ваши нужды.

