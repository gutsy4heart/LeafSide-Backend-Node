import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log(' Начало заполнения базы данных...');

  // Создание ролей
  const adminRole = await prisma.role.upsert({
    where: { normalizedName: 'ADMIN' },
    update: {},
    create: {
      name: 'Admin',
      normalizedName: 'ADMIN',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { normalizedName: 'USER' },
    update: {},
    create: {
      name: 'User',
      normalizedName: 'USER',
    },
  });

  console.log(' Роли созданы');

  // Создание администратора
  const adminPasswordHash = await bcrypt.hash('Admin12345!', 10);

  const adminUser = await prisma.user.upsert({
    where: { normalizedUserName: 'ADMIN@LEAFSIDE.LOCAL' },
    update: {},
    create: {
      email: 'admin@leafside.local',
      userName: 'admin@leafside.local',
      normalizedUserName: 'ADMIN@LEAFSIDE.LOCAL',
      normalizedEmail: 'ADMIN@LEAFSIDE.LOCAL',
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'LeafSide',
      emailConfirmed: true,
      lockoutEnabled: false,
      accessFailedCount: 0,
      twoFactorEnabled: false,
      phoneNumberConfirmed: false,
      countryCode: '',
      gender: '',
      createdAt: new Date(),
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

  console.log(' Администратор создан');
  console.log('   Email: admin@leafside.local');
  console.log('   Password: Admin12345!');

  // Создание тестового пользователя
  const userPasswordHash = await bcrypt.hash('User12345!', 10);

  const testUser = await prisma.user.upsert({
    where: { normalizedUserName: 'USER@LEAFSIDE.LOCAL' },
    update: {},
    create: {
      email: 'user@leafside.local',
      userName: 'user@leafside.local',
      normalizedUserName: 'USER@LEAFSIDE.LOCAL',
      normalizedEmail: 'USER@LEAFSIDE.LOCAL',
      passwordHash: userPasswordHash,
      firstName: 'Test',
      lastName: 'User',
      emailConfirmed: true,
      lockoutEnabled: false,
      accessFailedCount: 0,
      twoFactorEnabled: false,
      phoneNumberConfirmed: false,
      countryCode: '',
      gender: '',
      createdAt: new Date(),
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

  console.log('Тестовый пользователь создан');
  console.log('   Email: user@leafside.local');
  console.log('   Password: User12345!');

  console.log('Заполнение базы данных завершено');
}

main()
  .catch((e) => {
    console.error('Ошибка при заполнении базы данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

