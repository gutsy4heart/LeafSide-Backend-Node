import prisma from '../config/database';
import bcrypt from 'bcryptjs';
import { UserWithRoleResponse, CreateUserRequest, UpdateUserRequest } from '../types/admin.user';

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
  async deleteUser(id: string): Promise<boolean> {
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
  async updateUserRole(userId: string, newRole: string): Promise<void> {
    // Найти пользователя и все связи
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true }
    });
    if (!user) throw new Error('User not found');
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
