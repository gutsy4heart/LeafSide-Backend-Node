import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Хеширование пароля
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Проверка пароля
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

