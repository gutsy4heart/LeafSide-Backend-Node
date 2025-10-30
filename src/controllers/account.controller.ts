import { Request, Response, NextFunction } from 'express';
import authService, { RegisterData } from '../services/auth.service';

class AccountController {
  /**
   * POST /api/account/register
   * Регистрация нового пользователя
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body || {};
      const email = body.email ?? body.Email;
      const password = body.password ?? body.Password;
      const firstName = body.firstName ?? body.FirstName;
      const lastName = body.lastName ?? body.LastName;
      const phoneNumber = body.phoneNumber ?? body.PhoneNumber;
      const countryCode = body.countryCode ?? body.CountryCode;
      const gender = body.gender ?? body.Gender;

      // Все поля обязательны!
      if (!email || !password || !firstName || !lastName || !phoneNumber || !countryCode || !gender) {
        return res.status(400).json({ error: 'Все поля email, password, firstName, lastName, phoneNumber, countryCode, gender обязательны' });
      }
      if (String(password).length < 6) {
        return res.status(400).json({ error: 'Пароль должен содержать минимум 6 символов' });
      }
      const registerData: RegisterData = {
        email, password, firstName, lastName, phoneNumber, countryCode, gender,
      };
      try {
        await authService.register(registerData);
        return res.status(200).send();
      } catch (error: any) {
        return res.status(400).json({ error: error.message || 'Bad Request' });
      }
    } catch (error) {
      return next(error);
    }
  }

  /**
   * POST /api/account/login
   * Авторизация пользователя
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body || {};
      const email = body.email ?? body.Email;
      const password = body.password ?? body.Password;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email и пароль обязательны' });
      }
      try {
        const result = await authService.login({ email, password });
        // .NET: возвращает только Token
        return res.status(200).json({ token: result.token });
      } catch (error: any) {
        if (error.name === 'UnauthorizedError') {
          return res.status(401).json({ error: error.message || 'Unauthorized' });
        }
        return res.status(400).json({ error: error.message || 'Bad Request' });
      }
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/account/profile
   * Получение профиля текущего пользователя
   */
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Пользователь не найден в запросе' });
      }
      try {
        const profile = await authService.getProfile(req.user.userId);
        return res.status(200).json(profile);
      } catch (error: any) {
        if (error.name === 'NotFoundError') {
          return res.status(404).json({ error: error.message || 'User not found' });
        }
        return res.status(500).json({ error: error.message || 'Ошибка сервера' });
      }
    } catch (error) {
      return next(error);
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
        return res.status(400).json({ error: 'Token is required' });
      }
      try {
        const newToken = await authService.refreshToken(token);
        // .NET: возвращает { Token }
        return res.status(200).json({ token: newToken });
      } catch (error: any) {
        if (error.name === 'UnauthorizedError') {
          return res.status(401).json({ error: error.message || 'Unauthorized' });
        }
        return res.status(400).json({ error: error.message || 'Bad Request' });
      }
    } catch (error) {
      return next(error);
    }
  }

  // PUT /api/account/profile
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Пользователь не найден в запросе' });
      }
      try {
        const body = req.body || {};
        const normalized = {
          firstName: body.firstName ?? body.FirstName,
          lastName: body.lastName ?? body.LastName,
          phoneNumber: body.phoneNumber ?? body.PhoneNumber,
          countryCode: body.countryCode ?? body.CountryCode,
          gender: body.gender ?? body.Gender,
        };
        const profile = await authService.updateProfile(req.user.userId, normalized);
        return res.status(200).json(profile);
      } catch (error: any) {
        if (error.name === 'NotFoundError') {
          return res.status(404).json({ error: error.message || 'User not found' });
        }
        return res.status(400).json({ error: error.message || 'Bad Request' });
      }
    } catch (error) {
      return next(error);
    }
  }
}

export default new AccountController();

