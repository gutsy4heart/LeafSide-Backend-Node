import { Request, Response, NextFunction } from 'express';
import authService, { RegisterData } from '../services/auth.service';
import { normalizeBodyFields, handleControllerError, sendSuccess, sendNoContent } from '../utils/controller-helpers';
import { BadRequestError } from '../utils/errors';

class AccountController {
  /**
   * POST /api/account/register
   * Регистрация нового пользователя
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const fields: (keyof RegisterData)[] = ['email', 'password', 'firstName', 'lastName', 'phoneNumber', 'countryCode', 'gender'];
      const normalized = normalizeBodyFields<RegisterData>(req.body || {}, fields);

      // Все поля обязательны!
      const { email, password, firstName, lastName, phoneNumber, countryCode, gender } = normalized;
      if (!email || !password || !firstName || !lastName || !phoneNumber || !countryCode || !gender) {
        throw new BadRequestError('Все поля email, password, firstName, lastName, phoneNumber, countryCode, gender обязательны');
      }

      if (String(password).length < 6) {
        throw new BadRequestError('Пароль должен содержать минимум 6 символов');
      }

      await authService.register(normalized as RegisterData);
      sendNoContent(res);
    } catch (error: any) {
      if (error instanceof BadRequestError) {
        handleControllerError(error, res, 'Bad Request', 400);
      } else {
        next(error);
      }
    }
  }

  /**
   * POST /api/account/login
   * Авторизация пользователя
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const normalized = normalizeBodyFields<{ email: string; password: string }>(req.body || {}, ['email', 'password']);
      const { email, password } = normalized;

      if (!email || !password) {
        throw new BadRequestError('Email и пароль обязательны');
      }

      const result = await authService.login({ email, password });
      sendSuccess(res, { token: result.token });
    } catch (error: any) {
      if (error.name === 'UnauthorizedError') {
        handleControllerError(error, res, 'Unauthorized', 401);
      } else if (error instanceof BadRequestError) {
        handleControllerError(error, res, 'Bad Request', 400);
      } else {
        next(error);
      }
    }
  }

  /**
   * GET /api/account/profile
   * Получение профиля текущего пользователя
   */
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new BadRequestError('Пользователь не найден в запросе');
      }

      const profile = await authService.getProfile(req.user.userId);
      sendSuccess(res, profile);
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        handleControllerError(error, res, 'User not found', 404);
      } else if (error instanceof BadRequestError) {
        handleControllerError(error, res, 'Ошибка сервера', 401);
      } else {
        next(error);
      }
    }
  }

  /**
   * POST /api/account/refresh
   * Обновление токена
   */
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      if (!token) {
        throw new BadRequestError('Token is required');
      }

      const newToken = await authService.refreshToken(token);
      sendSuccess(res, { token: newToken });
    } catch (error: any) {
      if (error.name === 'UnauthorizedError') {
        handleControllerError(error, res, 'Unauthorized', 401);
      } else if (error instanceof BadRequestError) {
        handleControllerError(error, res, 'Bad Request', 400);
      } else {
        next(error);
      }
    }
  }

  /**
   * PUT /api/account/profile
   * Обновление профиля текущего пользователя
   */
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new BadRequestError('Пользователь не найден в запросе');
      }

      const fields = ['firstName', 'lastName', 'phoneNumber', 'countryCode', 'gender'] as const;
      const normalized = normalizeBodyFields(req.body || {}, fields);
      const profile = await authService.updateProfile(req.user.userId, normalized);
      
      sendSuccess(res, profile);
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        handleControllerError(error, res, 'User not found', 404);
      } else if (error instanceof BadRequestError) {
        handleControllerError(error, res, 'Bad Request', 400);
      } else {
        next(error);
      }
    }
  }
}

export default new AccountController();

