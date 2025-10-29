import { Request, Response, NextFunction } from 'express';
import cartService from '../services/cart.service';
import { BadRequestError } from '../utils/errors';

class AdminCartController {
  /**
   * GET /api/admin/carts
   * Получить все корзины (только для админа)
   */
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const carts = await cartService.getAll();

      // Формируем ответ в формате C# API
      const response = carts.map((cart) => ({
        id: cart.id,
        userId: cart.userId,
        items: cart.items.map((item) => ({
          id: item.id,
          bookId: item.bookId,
          quantity: item.quantity,
          priceSnapshot: item.priceSnapshot ? parseFloat(item.priceSnapshot.toString()) : null,
        })),
      }));

      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/carts/user/:userId
   * Получить корзину пользователя по userId (только для админа)
   */
  async getByUserId(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      if (!userId) {
        throw new BadRequestError('ID пользователя обязателен');
      }

      const cart = await cartService.getByUserId(userId);

      // Формируем ответ в формате C# API
      const response = {
        id: cart.id,
        userId: cart.userId,
        items: cart.items.map((item) => ({
          id: item.id,
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
      next(error);
    }
  }
}

export default new AdminCartController();

