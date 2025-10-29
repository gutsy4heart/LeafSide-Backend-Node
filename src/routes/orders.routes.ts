import { Router } from 'express';
import ordersController from '../controllers/orders.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Все эндпоинты требуют аутентификации
router.use(authenticate);

router.post('/', ordersController.create.bind(ordersController));
router.get('/', ordersController.getUserOrders.bind(ordersController));
router.get('/:id', ordersController.getById.bind(ordersController));
router.put('/:id/confirm-delivery', ordersController.confirmDelivery.bind(ordersController));

export default router;

