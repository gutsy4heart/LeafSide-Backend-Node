import { Request, Response } from 'express';
import cartService from '../services/cart.service';

class AdminCartController {
  /**
   * GET /api/admin/carts
   * Получить все корзины (только для админа)
   */
  async getAll(_req: Request, res: Response) {
    try {
      const carts = await cartService.getAll();
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
      res.status(200).json(response);
      return;
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Internal server error' });
      return;
    }
  }

  /**
   * GET /api/admin/carts/user/:userId
   * Получить корзину пользователя по userId (только для админа)
   */
  async getByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      if (!userId) return res.status(400).json({ error: 'ID пользователя обязателен' });
      const cart = await cartService.getByUserId(userId);
      if (!cart) return res.status(404).json({ error: 'Корзина не найдена' });
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
      res.status(200).json(response);
      return;
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Internal server error' });
      return;
    }
  }
}

export default new AdminCartController();

