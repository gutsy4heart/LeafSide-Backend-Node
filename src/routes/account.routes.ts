import { Router } from 'express';
import accountController from '../controllers/account.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Публичные эндпоинты
router.post('/register', accountController.register.bind(accountController));
router.post('/login', accountController.login.bind(accountController));

// Защищенные эндпоинты
router.get('/profile', authenticate, accountController.getProfile.bind(accountController));
router.post('/refresh', authenticate, accountController.refreshToken.bind(accountController));

export default router;

