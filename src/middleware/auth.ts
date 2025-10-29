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
export function authenticate(req: Request, res: Response, next: NextFunction) {
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
 * Middleware для проверки роли администратора
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new UnauthorizedError('Не авторизован'));
  }

  if (!req.user.roles.includes('Admin')) {
    return next(new ForbiddenError('Требуются права администратора'));
  }

  next();
}

/**
 * Middleware для проверки роли пользователя или администратора
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  authenticate(req, res, next);
}

