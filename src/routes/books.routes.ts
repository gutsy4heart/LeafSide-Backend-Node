import { Router } from 'express';
import booksController from '../controllers/books.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Публичные эндпоинты
router.get('/', booksController.getAll.bind(booksController));
router.get('/:id', booksController.getById.bind(booksController));

// Защищенные эндпоинты (требуют аутентификации и роли Admin)
router.post('/', authenticate, requireAdmin, booksController.create.bind(booksController));
router.put('/:id', authenticate, requireAdmin, booksController.update.bind(booksController));
router.delete('/:id', authenticate, requireAdmin, booksController.delete.bind(booksController));

export default router;

