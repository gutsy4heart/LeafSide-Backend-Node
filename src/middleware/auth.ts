import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

// Расширяем Request для добавления user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware для проверки аутентификации
 */
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Токен не предоставлен');
    }

    const token = authHeader.substring(7); // Убираем "Bearer "
    const payload = verifyToken(token);

    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return next(error);
    }
    return next(new UnauthorizedError('Неверный токен'));
  }
}

/**
 * Middleware для проверки роли администратора (Admin или SuperAdmin)
 */
export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new UnauthorizedError('Не авторизован'));
  }

  const hasAdminRole = req.user.roles.includes('Admin') || req.user.roles.includes('SuperAdmin');
  if (!hasAdminRole) {
    return next(new ForbiddenError('Требуются права администратора'));
  }

  next();
}

/**
 * Middleware для проверки роли суперадмина
 */
export function requireSuperAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new UnauthorizedError('Не авторизован'));
  }

  if (!req.user.roles.includes('SuperAdmin')) {
    return next(new ForbiddenError('Требуются права суперадмина'));
  }

  next();
}

/**
 * Проверка, является ли пользователь суперадмином
 */
export function isSuperAdmin(user: JWTPayload | undefined): boolean {
  return user?.roles.includes('SuperAdmin') ?? false;
}

/**
 * Проверка, является ли пользователь админом (Admin или SuperAdmin)
 */
export function isAdmin(user: JWTPayload | undefined): boolean {
  if (!user) return false;
  return user.roles.includes('Admin') || user.roles.includes('SuperAdmin');
}

/**
 * Middleware для проверки роли пользователя или администратора
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  authenticate(req, res, next);
}

