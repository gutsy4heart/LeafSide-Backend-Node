import { Request, Response } from 'express';
import { UnauthorizedError, BadRequestError } from './errors';

/**
 * Проверка наличия пользователя в запросе
 */
export function requireUser(req: Request): void {
  if (!req.user) {
    throw new UnauthorizedError('Пользователь не найден в запросе');
  }
}

/**
 * Получение ID из параметров запроса с валидацией
 */
export function getRequiredParam(req: Request, paramName: string): string {
  const value = req.params[paramName];
  if (!value) {
    throw new BadRequestError(`${paramName} обязателен`);
  }
  return value;
}

/**
 * Обработка ошибок контроллера
 */
export function handleControllerError(error: any, res: Response, defaultMessage: string, defaultStatus: number = 500): void {
  const status = error.statusCode || defaultStatus;
  const message = error.message || defaultMessage;
  res.status(status).json({ error: message });
}

/**
 * Успешный ответ
 */
export function sendSuccess<T>(res: Response, data: T, status: number = 200): void {
  res.status(status).json(data);
}

/**
 * Успешный ответ без содержимого
 */
export function sendNoContent(res: Response): void {
  res.status(204).send();
}

/**
 * Нормализация полей запроса (поддержка camelCase и PascalCase)
 */
export function normalizeBodyFields<T extends Record<string, any>>(
  body: any,
  fields: readonly (keyof T)[]
): Partial<T> {
  const normalized: Partial<T> = {};
  
  for (const field of fields) {
    const fieldStr = String(field);
    const camelCase = fieldStr.charAt(0).toLowerCase() + fieldStr.slice(1);
    const pascalCase = fieldStr.charAt(0).toUpperCase() + fieldStr.slice(1);
    
    normalized[field] = body[fieldStr] ?? body[camelCase] ?? body[pascalCase];
  }
  
  return normalized;
}

