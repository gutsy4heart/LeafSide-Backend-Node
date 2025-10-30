import { Request, Response } from 'express';
import adminUsersService from '../services/admin.users.service';
import { CreateUserRequest, UpdateUserRequest, UpdateUserRoleRequest } from '../types/admin.user';

class AdminUsersController {
  // GET /api/admin/users
  async getAllUsers(_req: Request, res: Response) {
    try {
      const users = await adminUsersService.getAllUsers();
      return res.status(200).json(users);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // GET /api/admin/users/:id
  async getUserById(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      if (!userId) return res.status(400).json({ error: 'Invalid user ID' });
      const user = await adminUsersService.getUserById(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.status(200).json(user);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // POST /api/admin/users
  async createUser(req: Request, res: Response) {
    try {
      const data = req.body as CreateUserRequest;
      if (!data.email || !data.password || !data.firstName || !data.lastName) {
        return res.status(400).json({ error: 'Email, password, firstName, lastName are required' });
      }
      const user = await adminUsersService.createUser(data);
      return res.status(201).json(user);
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Failed to create user' });
    }
  }

  // PUT /api/admin/users/:userId
  async updateUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      if (!userId) return res.status(400).json({ error: 'Invalid user ID' });
      const user = await adminUsersService.updateUser(userId, req.body as UpdateUserRequest);
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.status(200).json(user);
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Internal server error' });
    }
  }

  // PUT /api/admin/users/:userId/role
  async updateUserRole(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { role } = req.body as UpdateUserRoleRequest;
      if (!userId || !role) return res.status(400).json({ error: 'userId and role are required' });
      await adminUsersService.updateUserRole(userId, role);
      return res.status(200).json({ message: `User role updated to ${role}` });
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Failed to update user role' });
    }
  }

  // GET /api/admin/roles
  async getAvailableRoles(_req: Request, res: Response) {
    try {
      const roles = await adminUsersService.getAvailableRoles();
      return res.status(200).json(roles);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // DELETE /api/admin/users/:userId
  async deleteUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      if (!userId) return res.status(400).json({ error: 'Invalid user ID' });
      const deleted = await adminUsersService.deleteUser(userId);
      if (!deleted) return res.status(404).json({ error: 'User not found' });
      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}

export default new AdminUsersController();
