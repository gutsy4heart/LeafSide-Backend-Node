import { Request, Response, NextFunction } from 'express';
import adminUsersService from '../services/admin.users.service';
import { CreateUserRequest, UpdateUserRequest, UpdateUserRoleRequest } from '../types/admin.user';

class AdminUsersController {
  // GET /api/admin/users
  async getAllUsers(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await adminUsersService.getAllUsers();
      return res.json(users);
    } catch (error) {
      return next(error);
    }
  }

  // GET /api/admin/users/:id
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      if (!userId) return res.status(400).json({ message: 'Invalid user ID' });
      const user = await adminUsersService.getUserById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json(user);
    } catch (error) {
      return next(error);
    }
  }

  // POST /api/admin/users
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateUserRequest;
      // Простейшая валидация
      if (!data.email || !data.password || !data.firstName || !data.lastName) {
        return res.status(400).json({ message: 'Email, password, firstName, lastName are required' });
      }
      // TODO: уникальность email (обработка в сервисе как исключение)
      const user = await adminUsersService.createUser(data);
      return res.status(201).json(user);
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Failed to create user' }); // подробности при ошибке
    }
  }

  // PUT /api/admin/users/:userId
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      if (!userId) return res.status(400).json({ message: 'Invalid user ID' });
      const user = await adminUsersService.updateUser(userId, req.body as UpdateUserRequest);
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json(user);
    } catch (error) {
      return next(error);
    }
  }

  // PUT /api/admin/users/:userId/role
  async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { role } = req.body as UpdateUserRoleRequest;
      if (!userId || !role) return res.status(400).json({ message: 'userId and role are required' });
      await adminUsersService.updateUserRole(userId, role);
      return res.json({ message: `User role updated to ${role}` });
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Failed to update user role' });
    }
  }

  // GET /api/admin/roles
  async getAvailableRoles(_req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await adminUsersService.getAvailableRoles();
      return res.json(roles);
    } catch (error) {
      return next(error);
    }
  }

  // DELETE /api/admin/users/:userId
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      if (!userId) return res.status(400).json({ message: 'Invalid user ID' });
      const deleted = await adminUsersService.deleteUser(userId);
      if (!deleted) return res.status(404).json({ message: 'User not found' });
      return res.json({ message: 'User deleted successfully' });
    } catch (error) {
      return next(error);
    }
  }
}

export default new AdminUsersController();
