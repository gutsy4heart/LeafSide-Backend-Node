import prisma from '../config/database';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateToken, verifyToken, JWTPayload } from '../utils/jwt';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../utils/errors';

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  countryCode?: string;
  gender?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  /**
   * Регистрация нового пользователя
   */
  async register(data: RegisterData) {
    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestError('Пользователь с таким email уже существует');
    }

    // Хешируем пароль
    const passwordHash = await hashPassword(data.password);

    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.email, // Используем email как username
        passwordHash,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phoneNumber: data.phoneNumber || '',
        countryCode: data.countryCode || '',
        gender: data.gender || '',
        emailConfirmed: false,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    // Назначаем роль User по умолчанию
    let userRole = await prisma.role.findUnique({
      where: { name: 'User' },
    });

    // Если роль не существует, создаем её
    if (!userRole) {
      userRole = await prisma.role.create({
        data: { name: 'User' },
      });
    }

    // Связываем пользователя с ролью
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: userRole.id,
      },
    });

    // Генерируем токен
    const roles = ['User'];
    const token = generateToken({
      userId: user.id,
      email: user.email,
      roles,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  /**
   * Авторизация пользователя
   */
  async login(data: LoginData) {
    // Находим пользователя
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError('Неверный email или пароль');
    }

    // Проверяем пароль
    const isValidPassword = await verifyPassword(data.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Неверный email или пароль');
    }

    // Получаем роли пользователя
    const roles = user.roles.map((ur: any) => ur.role.name);

    // Генерируем токен
    const token = generateToken({
      userId: user.id,
      email: user.email,
      roles,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles,
      },
    };
  }

  /**
   * Получение профиля пользователя
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        countryCode: true,
        gender: true,
        createdAt: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    const roles = user.roles.map((ur: any) => ur.role.name);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      countryCode: user.countryCode,
      gender: user.gender,
      roles,
      createdAt: user.createdAt,
    };
  }

  /**
   * Обновление токена
   */
  async refreshToken(oldToken: string): Promise<string> {
    // Верифицируем старый токен и получаем payload
    const payload = verifyToken(oldToken);
    
    // Проверяем, что пользователь все еще существует
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    // Получаем актуальные роли пользователя
    const roles = user.roles.map((ur: any) => ur.role.name);

    // Генерируем новый токен с актуальными данными
    return generateToken({
      userId: user.id,
      email: user.email,
      roles,
    });
  }
}

export default new AuthService();

