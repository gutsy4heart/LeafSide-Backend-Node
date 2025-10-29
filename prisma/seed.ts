import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начало заполнения базы данных...');

  // Создание ролей
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'User' },
    update: {},
    create: {
      name: 'User',
    },
  });

  console.log('✅ Роли созданы');

  // Создание администратора
  const bcrypt = require('bcryptjs');
  const adminPasswordHash = await bcrypt.hash('Admin12345!', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@leafside.local' },
    update: {},
    create: {
      email: 'admin@leafside.local',
      username: 'admin@leafside.local',
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'LeafSide',
      emailConfirmed: true,
    },
  });

  // Связываем админа с ролью Admin
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  console.log('✅ Администратор создан');
  console.log('   Email: admin@leafside.local');
  console.log('   Password: Admin12345!');

  // Создание тестового пользователя
  const userPasswordHash = await bcrypt.hash('User12345!', 10);

  const testUser = await prisma.user.upsert({
    where: { email: 'user@leafside.local' },
    update: {},
    create: {
      email: 'user@leafside.local',
      username: 'user@leafside.local',
      passwordHash: userPasswordHash,
      firstName: 'Test',
      lastName: 'User',
      emailConfirmed: true,
    },
  });

  // Связываем тестового пользователя с ролью User
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: testUser.id,
        roleId: userRole.id,
      },
    },
    update: {},
    create: {
      userId: testUser.id,
      roleId: userRole.id,
    },
  });

  console.log('✅ Тестовый пользователь создан');
  console.log('   Email: user@leafside.local');
  console.log('   Password: User12345!');

  console.log('✅ Заполнение базы данных завершено');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении базы данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

