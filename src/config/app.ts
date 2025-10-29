import dotenv from 'dotenv';

// Загрузка переменных окружения
dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '5233', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://leafuser:leafpass@localhost:5432/leafsidedb?schema=public',

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'super_secret_development_key_change_me',
    issuer: process.env.JWT_ISSUER || 'LeafSide',
    audience: process.env.JWT_AUDIENCE || 'LeafSide',
    expiresIn: process.env.JWT_EXPIRES_IN || '60m',
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
};

// Валидация обязательных переменных окружения
const requiredEnvVars = ['DATABASE_URL'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`⚠️  Предупреждение: ${envVar} не установлена`);
  }
}

export default config;

