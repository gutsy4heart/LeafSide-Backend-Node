import prisma from '../config/database';
import bcrypt from 'bcryptjs';
import { UserWithRoleResponse, CreateUserRequest, UpdateUserRequest } from '../types/admin.user';
import { JWTPayload } from '../utils/jwt';

class AdminUsersService {
  // Получить всех пользователей с ролями
  async getAllUsers(): Promise<UserWithRoleResponse[]> {
    const users = await prisma.user.findMany({
      include: {
        roles: { include: { role: true } }
      }
    });
    return users.map(this.mapUserToResponse);
  }

  // Получить одного пользователя по ID
  async getUserById(id: string): Promise<UserWithRoleResponse | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        roles: { include: { role: true } }
      }
    });
    return user ? this.mapUserToResponse(user) : null;
  }

  // Создать пользователя (и добавить роль "User" по умолчанию)
  async createUser(data: CreateUserRequest): Promise<UserWithRoleResponse> {
    // Проверка: нельзя создать суперадмина через API (он создается только через seed)
    // Если в запросе явно указана роль SuperAdmin, выбрасываем ошибку
    if ((data as any).role === 'SuperAdmin') {
      throw new Error('Нельзя создать суперадмина через API. Суперадмин создается только через seed базы данных');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    // Берем ID роли "USER" (normalizedName)
    const userRole = await prisma.role.findUnique({ where: { normalizedName: 'USER' } });
    if (!userRole) throw new Error('Default role USER not found');
    const user = await prisma.user.create({
      data: {
        email: data.email,
        userName: data.email,
        normalizedUserName: data.email.toUpperCase(),
        normalizedEmail: data.email.toUpperCase(),
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber || '',
        countryCode: data.countryCode || '',
        gender: data.gender || '',
        emailConfirmed: true,
        lockoutEnabled: false,
        accessFailedCount: 0,
        twoFactorEnabled: false,
        phoneNumberConfirmed: false,
        createdAt: new Date(),
        roles: {
          create: [{ roleId: userRole.id }]
        }
      },
      include: {
        roles: { include: { role: true } }
      }
    });
    return this.mapUserToResponse(user);
  }

  // Обновить пользователя (profile info; нельзя обновить email/password отсюда)
  async updateUser(id: string, data: UpdateUserRequest): Promise<UserWithRoleResponse | null> {
    const user = await prisma.user.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode,
        gender: data.gender,
      },
      include: {
        roles: { include: { role: true } }
      }
    });
    return this.mapUserToResponse(user);
  }

  // Удалить пользователя
  // currentUser - текущий пользователь, который выполняет операцию
  async deleteUser(id: string, currentUser: JWTPayload): Promise<boolean> {
    // Проверка: нельзя удалить самого себя
    if (id === currentUser.userId) {
      throw new Error('Нельзя удалить самого себя');
    }

    // Найти пользователя и проверить его роли
    const user = await prisma.user.findUnique({
      where: { id },
      include: { 
        roles: { 
          include: { role: true } 
        } 
      }
    });

    if (!user) {
      return false;
    }

    // Проверка: нельзя удалить суперадмина
    const userRoles = user.roles.map(ur => ur.role.normalizedName);
    if (userRoles.includes('SUPERADMIN')) {
      throw new Error('Нельзя удалить суперадмина');
    }

    try {
      await prisma.user.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  // Получить список всех ролей (по аналогии с C# Enum UserRole)
  async getAvailableRoles(): Promise<string[]> {
    const roles = await prisma.role.findMany();
    // normalizedName или name? C# возвращает Enum, тут используем name (но можно и normalizedName)
    return roles.map(r => r.name || '');
  }

  // Обновить РОЛЬ пользователя (удалить старые, назначить новую)
  // currentUser - текущий пользователь, который выполняет операцию
  async updateUserRole(userId: string, newRole: string, currentUser: JWTPayload): Promise<void> {
    // Проверка: суперадмин и админ могут изменять роли
    const isSuperAdmin = currentUser.roles.includes('SuperAdmin');
    const isAdmin = currentUser.roles.includes('Admin');
    
    if (!isSuperAdmin && !isAdmin) {
      throw new Error('Недостаточно прав для изменения роли пользователя');
    }

    // Найти пользователя и все связи
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        roles: { 
          include: { role: true } 
        } 
      }
    });
    
    if (!user) throw new Error('User not found');

    const userRoles = user.roles.map(ur => ur.role.normalizedName);
    const isTargetSuperAdmin = userRoles.includes('SUPERADMIN');

    // Проверка: нельзя изменить роль суперадмина (только сам суперадмин может, но не админы)
    if (isTargetSuperAdmin && !isSuperAdmin) {
      throw new Error('Недостаточно прав для изменения роли суперадмина');
    }

    // Проверка: нельзя назначить роль SuperAdmin обычным админам (только суперадмин может)
    if (newRole === 'SuperAdmin' && !isSuperAdmin) {
      throw new Error('Только суперадмин может назначать роль SuperAdmin');
    }

    // Проверка: суперадмин может быть только один
    // Если пытаемся назначить роль SuperAdmin, проверяем, есть ли уже суперадмин
    if (newRole === 'SuperAdmin' || newRole === 'SUPERADMIN') {
      // Проверяем, есть ли уже другой суперадмин (не тот, чью роль мы меняем)
      const existingSuperAdmin = await prisma.user.findFirst({
        where: {
          id: { not: userId }, // Исключаем текущего пользователя
          roles: {
            some: {
              role: {
                normalizedName: 'SUPERADMIN'
              }
            }
          }
        }
      });

      if (existingSuperAdmin) {
        throw new Error('Суперадмин уже существует в системе. Не может быть более одного суперадмина');
      }
    }

    const targetRole = await prisma.role.findFirst({
      where: { OR: [{ name: newRole }, { normalizedName: newRole.toUpperCase() }] },
    });
    if (!targetRole) throw new Error('Role not found');
    
    // удалить все роли
    await prisma.userRole.deleteMany({ where: { userId } });
    // добавить новую роль
    await prisma.userRole.create({ data: { userId, roleId: targetRole.id } });
  }

  private mapUserToResponse(user: any): UserWithRoleResponse {
    return {
      id: user.id,
      email: user.email || '',
      userName: user.userName || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phoneNumber: user.phoneNumber || '',
      countryCode: user.countryCode || '',
      gender: user.gender || '',
      roles: user.roles ? user.roles.map((ur: any) => ur.role?.name || '') : [],
      createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
    };
  }
}

export default new AdminUsersService();
