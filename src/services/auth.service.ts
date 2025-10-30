import prisma from '../config/database';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateToken, verifyToken } from '../utils/jwt';
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
    // Проверяем, существует ли пользователь (по normalizedEmail)
    const normalizedEmail = data.email.toUpperCase();
    const existingUser = await prisma.user.findFirst({
      where: { normalizedEmail },
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
        userName: data.email, // Используем email как username
        normalizedUserName: data.email.toUpperCase(),
        normalizedEmail: data.email.toUpperCase(),
        passwordHash,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phoneNumber: data.phoneNumber || '',
        countryCode: data.countryCode || '',
        gender: data.gender || '',
        emailConfirmed: false,
        lockoutEnabled: false,
        accessFailedCount: 0,
        twoFactorEnabled: false,
        phoneNumberConfirmed: false,
        createdAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    // Назначаем роль User по умолчанию (ищем по нормализованному имени)
    const normalizedRoleName = 'USER';
    let userRole = await prisma.role.findFirst({
      where: { normalizedName: normalizedRoleName },
    });

    // Если роль не существует, создаем её
    if (!userRole) {
      userRole = await prisma.role.create({
        data: { 
          name: 'User',
          normalizedName: normalizedRoleName,
        },
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
      email: user.email ?? '',
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
    // Находим пользователя по email (ищем по normalizedEmail)
    const normalizedEmail = data.email.toUpperCase();
    const user = await prisma.user.findFirst({
      where: { normalizedEmail },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Неверный email или пароль');
    }

    // Проверяем пароль
    const isValidPassword = await verifyPassword(data.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Неверный email или пароль');
    }

    // Получаем роли пользователя (фильтруем null значения)
    const roles = user.roles
      .map((ur: any) => ur.role?.name)
      .filter((name: string | null) => name !== null) as string[];

    // Генерируем токен
    const token = generateToken({
      userId: user.id,
      email: user.email ?? '',
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
    });

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    const roles = user.roles
      .map((ur: any) => ur.role?.name)
      .filter((name: string | null) => name !== null) as string[];

    return {
      id: user.id,
      email: user.email ?? '',
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
    const roles = user.roles
      .map((ur: any) => ur.role?.name)
      .filter((name: string | null) => name !== null) as string[];

    // Генерируем новый токен с актуальными данными
    return generateToken({
      userId: user.id,
      email: user.email ?? '',
      roles,
    });
  }

  async updateProfile(userId: string, update: Partial<RegisterData>) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: { role: true }
        }
      }
    });
    if (!user) throw new NotFoundError('Пользователь не найден');
    // Только указанные ниже поля разрешено обновлять
    const data: any = {};
    if (typeof update.firstName === 'string') data.firstName = update.firstName;
    if (typeof update.lastName === 'string') data.lastName = update.lastName;
    if (typeof update.phoneNumber === 'string') data.phoneNumber = update.phoneNumber;
    if (typeof update.countryCode === 'string') data.countryCode = update.countryCode;
    if (typeof update.gender === 'string') data.gender = update.gender;
    await prisma.user.update({ where: { id: userId }, data });
    // Возвращаем обновленный профиль (соответствует getProfile)
    const updated = await prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } } }
    });
    const roles = updated?.roles.map((ur: any) => ur.role?.name).filter((name: string|null) => name !== null) as string[];
    return {
      id: updated!.id,
      email: updated!.email ?? '',
      firstName: updated!.firstName,
      lastName: updated!.lastName,
      phoneNumber: updated!.phoneNumber,
      countryCode: updated!.countryCode,
      gender: updated!.gender,
      roles,
      createdAt: updated!.createdAt,
    };
  }
}

export default new AuthService();

