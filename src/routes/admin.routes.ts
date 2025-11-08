import { Router } from 'express';
import adminCartController from '../controllers/admin.cart.controller';
import adminOrdersController from '../controllers/admin.orders.controller';
import adminUsersController from '../controllers/admin.users.controller';
import booksController from '../controllers/books.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Все эндпоинты требуют аутентификации и роль Admin
router.use(authenticate);
router.use(requireAdmin);

// User management
router.get('/users', adminUsersController.getAllUsers.bind(adminUsersController));
router.get('/users/:userId', adminUsersController.getUserById.bind(adminUsersController));
router.post('/users', adminUsersController.createUser.bind(adminUsersController));
router.put('/users/:userId', adminUsersController.updateUser.bind(adminUsersController));
router.put('/users/:userId/role', adminUsersController.updateUserRole.bind(adminUsersController));
router.get('/roles', adminUsersController.getAvailableRoles.bind(adminUsersController));
router.delete('/users/:userId', adminUsersController.deleteUser.bind(adminUsersController));

// Cart routes
router.get('/carts', adminCartController.getAll.bind(adminCartController));
router.get('/carts/user/:userId', adminCartController.getByUserId.bind(adminCartController));

// Orders routes
router.get('/orders', adminOrdersController.getAll.bind(adminOrdersController));
router.get('/orders/:id', adminOrdersController.getById.bind(adminOrdersController));
router.put('/orders/:id/status', adminOrdersController.updateStatus.bind(adminOrdersController));
router.delete('/orders/:id', adminOrdersController.delete.bind(adminOrdersController));

// Books routes (admin endpoints)
router.get('/books', booksController.getAll.bind(booksController));
router.get('/books/:id', booksController.getById.bind(booksController));
router.post('/books', booksController.create.bind(booksController));
router.put('/books/:id', booksController.update.bind(booksController));
router.delete('/books/:id', booksController.delete.bind(booksController));

export default router;

