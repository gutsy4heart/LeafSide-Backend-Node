import { PrismaClient } from '@prisma/client';

// Создаем один экземпляр Prisma Client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Подключение к базе данных при запуске
prisma.$connect()
  .then(() => {
    console.log('✅ Подключение к базе данных установлено');
  })
  .catch((error) => {
    console.error('❌ Ошибка подключения к базе данных:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;

