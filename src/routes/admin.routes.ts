import { Router } from 'express';
import adminCartController from '../controllers/admin.cart.controller';
import adminOrdersController from '../controllers/admin.orders.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Все эндпоинты требуют аутентификации и роль Admin
router.use(authenticate);
router.use(requireAdmin);

// Cart routes
router.get('/carts', adminCartController.getAll.bind(adminCartController));
router.get('/carts/user/:userId', adminCartController.getByUserId.bind(adminCartController));

// Orders routes
router.get('/orders', adminOrdersController.getAll.bind(adminOrdersController));
router.get('/orders/:id', adminOrdersController.getById.bind(adminOrdersController));
router.put('/orders/:id/status', adminOrdersController.updateStatus.bind(adminOrdersController));
router.delete('/orders/:id', adminOrdersController.delete.bind(adminOrdersController));

export default router;

