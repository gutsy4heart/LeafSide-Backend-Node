import { Router } from 'express';
import cartController from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Все эндпоинты требуют аутентификации
router.use(authenticate);

router.get('/', cartController.get.bind(cartController));
router.post('/items', cartController.addOrUpdateItem.bind(cartController));
router.delete('/items/:bookId', cartController.removeItem.bind(cartController));
router.delete('/', cartController.clear.bind(cartController));

export default router;

