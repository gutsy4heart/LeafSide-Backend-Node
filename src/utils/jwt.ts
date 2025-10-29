import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/app';

export interface JWTPayload {
  userId: string;
  email: string;
  roles: string[];
}

/**
 * Генерация JWT токена
 */
export function generateToken(payload: JWTPayload): string {
  const options: SignOptions = {
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
    expiresIn: config.jwt.expiresIn as unknown as number,
  };
  return jwt.sign(
    {
      sub: payload.userId,
      email: payload.email,
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': payload.roles,
    },
    config.jwt.secret,
    options
  );
}

/**
 * Верификация JWT токена
 */
export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, config.jwt.secret, {
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    }) as any;

    // Извлекаем роли из токена
    let roles: string[] = [];
    const rolesClaim = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    if (rolesClaim) {
      roles = Array.isArray(rolesClaim) ? rolesClaim : [rolesClaim];
    }

    return {
      userId: decoded.sub || decoded.userId,
      email: decoded.email || decoded.sub,
      roles,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Токен истек');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Неверный токен');
    }
    throw error;
  }
}

/**
 * Обновление JWT токена
 */
export function refreshToken(oldToken: string): string {
  const payload = verifyToken(oldToken);
  return generateToken(payload);
}

