import { Router } from 'express';
import userStatsController from '../controllers/userstats.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/stats', userStatsController.getStats.bind(userStatsController));

export default router;
