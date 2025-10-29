import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { config } from '../config/app';

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Если ошибка уже обработана, пропускаем
  if (res.headersSent) {
    return next(err);
  }

  // Логирование ошибки
  console.error('Error:', err);

  // Если это наша кастомная ошибка
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(config.nodeEnv === 'development' && { stack: err.stack }),
    });
  }

  // Обработка ошибок Prisma
  if (err.name === 'PrismaClientKnownRequestError') {
    // Ошибка уникального ограничения
    if ((err as any).code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'Запись с такими данными уже существует',
      });
    }
    // Ресурс не найден
    if ((err as any).code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Ресурс не найден',
      });
    }
  }

  // Общая обработка ошибок
  return res.status(500).json({
    success: false,
    error: config.nodeEnv === 'development' ? err.message : 'Внутренняя ошибка сервера',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
}

