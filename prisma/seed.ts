import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log(' Начало заполнения базы данных...');

  // Создание ролей
  const superAdminRole = await prisma.role.upsert({
    where: { normalizedName: 'SUPERADMIN' },
    update: {},
    create: {
      name: 'SuperAdmin',
      normalizedName: 'SUPERADMIN',
    },
  });

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

  // Создание суперадмина
  const superAdminPasswordHash = await bcrypt.hash('SuperAdmin12345!', 10);

  const superAdminUser = await prisma.user.upsert({
    where: { normalizedUserName: 'SUPERADMIN@LEAFSIDE.LOCAL' },
    update: {
      // Обновляем все поля при каждом запуске seed
      firstName: 'Super',
      lastName: 'Admin',
      phoneNumber: '+1234567890',
      countryCode: 'US',
      gender: 'Male',
    },
    create: {
      email: 'superadmin@leafside.local',
      userName: 'superadmin@leafside.local',
      normalizedUserName: 'SUPERADMIN@LEAFSIDE.LOCAL',
      normalizedEmail: 'SUPERADMIN@LEAFSIDE.LOCAL',
      passwordHash: superAdminPasswordHash,
      firstName: 'Super',
      lastName: 'Admin',
      phoneNumber: '+1234567890',
      countryCode: 'US',
      gender: 'Male',
      emailConfirmed: true,
      lockoutEnabled: false,
      accessFailedCount: 0,
      twoFactorEnabled: false,
      phoneNumberConfirmed: false,
      createdAt: new Date(),
    },
  });

  // Удаляем все роли суперадмина (если есть) и назначаем роль SuperAdmin
  await prisma.userRole.deleteMany({
    where: { userId: superAdminUser.id }
  });

  // Создаем связь с ролью SuperAdmin
  await prisma.userRole.create({
    data: {
      userId: superAdminUser.id,
      roleId: superAdminRole.id,
    },
  });


  // Создание обычного администратора
  const adminPasswordHash = await bcrypt.hash('Admin12345!', 10);

  const adminUser = await prisma.user.upsert({
    where: { normalizedUserName: 'ADMIN@LEAFSIDE.LOCAL' },
    update: {
      // Обновляем все поля при каждом запуске seed
      firstName: 'Admin',
      lastName: 'LeafSide',
      phoneNumber: '+1234567891',
      countryCode: 'US',
      gender: 'Male',
    },
    create: {
      email: 'admin@leafside.local',
      userName: 'admin@leafside.local',
      normalizedUserName: 'ADMIN@LEAFSIDE.LOCAL',
      normalizedEmail: 'ADMIN@LEAFSIDE.LOCAL',
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'LeafSide',
      phoneNumber: '+1234567891',
      countryCode: 'US',
      gender: 'Male',
      emailConfirmed: true,
      lockoutEnabled: false,
      accessFailedCount: 0,
      twoFactorEnabled: false,
      phoneNumberConfirmed: false,
      createdAt: new Date(),
    },
  });

  // Удаляем все роли админа (если есть) и назначаем роль Admin
  await prisma.userRole.deleteMany({
    where: { userId: adminUser.id }
  });

  // Создаем связь с ролью Admin
  await prisma.userRole.create({
    data: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  // Создание тестового пользователя
  const userPasswordHash = await bcrypt.hash('User12345!', 10);

  const testUser = await prisma.user.upsert({
    where: { normalizedUserName: 'USER@LEAFSIDE.LOCAL' },
    update: {
      // Обновляем все поля при каждом запуске seed
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '+1234567892',
      countryCode: 'US',
      gender: 'Female',
    },
    create: {
      email: 'user@leafside.local',
      userName: 'user@leafside.local',
      normalizedUserName: 'USER@LEAFSIDE.LOCAL',
      normalizedEmail: 'USER@LEAFSIDE.LOCAL',
      passwordHash: userPasswordHash,
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '+1234567892',
      countryCode: 'US',
      gender: 'Female',
      emailConfirmed: true,
      lockoutEnabled: false,
      accessFailedCount: 0,
      twoFactorEnabled: false,
      phoneNumberConfirmed: false,
      createdAt: new Date(),
    },
  });

  // Удаляем все роли тестового пользователя (если есть) и назначаем роль User
  await prisma.userRole.deleteMany({
    where: { userId: testUser.id }
  });

  // Создаем связь с ролью User
  await prisma.userRole.create({
    data: {
      userId: testUser.id,
      roleId: userRole.id,
    },
  });

}

main()
  .catch((e) => {
    console.error('Ошибка при заполнении базы данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

