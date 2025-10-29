/**
 * Кастомные классы ошибок
 */

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Ресурс не найден') {
    super(message, 404);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Неверный запрос') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Не авторизован') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Доступ запрещен') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Конфликт данных') {
    super(message, 409);
  }
}

