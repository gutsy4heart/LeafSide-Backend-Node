# Инструкция по синхронизации с существующей БД

## Шаг 1: Убедитесь, что база данных запущена

```bash
cd ../LeafSide-backend
docker-compose up -d
```

## Шаг 2: Создайте .env файл с правильным DATABASE_URL

```bash
cd ../leafside-backend-node
# Убедитесь, что в .env есть:
# DATABASE_URL="postgresql://leafuser:leafpass@localhost:5432/leafsidedb?schema=public"
```

## Шаг 3: Выполните introspection (автоматическое создание схемы из БД)

```bash
npx prisma db pull --force
```

**Внимание:** Это перезапишет текущий `schema.prisma`!

## Шаг 4: После pull нужно будет:

1. **Переименовать модели** из ASP.NET Identity:
   - `AspNetUsers` → `User`
   - `AspNetRoles` → `Role`
   - `AspNetUserRoles` → `UserRole`

2. **Исправить связи** между моделями

3. **Удалить ненужные таблицы** Identity (если они не используются):
   - `AspNetUserClaims`
   - `AspNetRoleClaims`
   - `AspNetUserLogins`
   - и т.д.

4. **Сгенерировать Prisma Client**:
   ```bash
   npm run prisma:generate
   ```

## Альтернатива: Ручная настройка

Если `db pull` создаст слишком сложную схему, можно вручную обновить `schema.prisma`, чтобы использовать существующие таблицы с правильными именами.

