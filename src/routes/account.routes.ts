import { Router } from 'express';
import accountController from '../controllers/account.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Публичные эндпоинты
router.post('/register', accountController.register.bind(accountController));
router.post('/login', accountController.login.bind(accountController));

// Защищенные эндпоинты
router.get('/profile', authenticate, accountController.getProfile.bind(accountController));
router.put('/profile', authenticate, accountController.updateProfile.bind(accountController));

// Refresh токена как в .NET [AllowAnonymous]
router.post('/refresh', accountController.refreshToken.bind(accountController));

export default router;

