import { Request, Response, NextFunction } from 'express';
import cartService from '../services/cart.service';
import { BadRequestError } from '../utils/errors';

class CartController {
  /**
   * GET /api/cart
   * Получить корзину текущего пользователя
   */
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new BadRequestError('Пользователь не найден в запросе');
      }

      const cart = await cartService.getOrCreate(req.user.userId);

      // Формируем ответ в формате C# API
      const response = {
        id: cart.id,
        items: cart.items.map((item: any) => ({
          bookId: item.bookId,
          quantity: item.quantity,
          priceSnapshot: item.priceSnapshot ? parseFloat(item.priceSnapshot.toString()) : null,
        })),
      };

      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * POST /api/cart/items
   * Добавить или обновить товар в корзине
   */
  async addOrUpdateItem(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new BadRequestError('Пользователь не найден в запросе');
      }

      const { bookId, quantity } = req.body;

      if (!bookId) {
        throw new BadRequestError('ID книги обязателен');
      }

      if (!quantity || quantity < 1) {
        throw new BadRequestError('Количество должно быть больше 0');
      }

      const cart = await cartService.addOrUpdateItem(req.user.userId, bookId, quantity);

      // Формируем ответ в формате C# API
      const response = {
        id: cart.id,
        items: cart.items.map((item: any) => ({
          bookId: item.bookId,
          quantity: item.quantity,
          priceSnapshot: item.priceSnapshot ? parseFloat(item.priceSnapshot.toString()) : null,
        })),
      };

      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * DELETE /api/cart/items/:bookId
   * Удалить товар из корзины
   */
  async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new BadRequestError('Пользователь не найден в запросе');
      }

      const { bookId } = req.params;

      if (!bookId) {
        throw new BadRequestError('ID книги обязателен');
      }

      const deleted = await cartService.removeItem(req.user.userId, bookId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Товар не найден в корзине',
        });
      }

      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }

  /**
   * DELETE /api/cart
   * Очистить корзину
   */
  async clear(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new BadRequestError('Пользователь не найден в запросе');
      }

      const cleared = await cartService.clear(req.user.userId);

      if (!cleared) {
        return res.status(404).json({
          success: false,
          error: 'Корзина не найдена',
        });
      }

      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }
}

export default new CartController();

