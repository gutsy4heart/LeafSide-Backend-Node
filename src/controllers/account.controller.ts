import { Request, Response, NextFunction } from 'express';
import authService, { RegisterData, LoginData } from '../services/auth.service';
import { BadRequestError } from '../utils/errors';

class AccountController {
  /**
   * POST /api/account/register
   * Регистрация нового пользователя
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName, phoneNumber, countryCode, gender } = req.body;

      // Валидация
      if (!email || !password) {
        throw new BadRequestError('Email и пароль обязательны');
      }

      if (password.length < 6) {
        throw new BadRequestError('Пароль должен содержать минимум 6 символов');
      }

      const registerData: RegisterData = {
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        countryCode,
        gender,
      };

      const result = await authService.register(registerData);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/account/login
   * Авторизация пользователя
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // Валидация
      if (!email || !password) {
        throw new BadRequestError('Email и пароль обязательны');
      }

      const loginData: LoginData = {
        email,
        password,
      };

      const result = await authService.login(loginData);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
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

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
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
        throw new BadRequestError('Токен обязателен');
      }

      // Токен уже проверен в middleware authenticate
      const newToken = await authService.refreshToken(token);

      res.json({
        success: true,
        data: { token: newToken },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AccountController();

