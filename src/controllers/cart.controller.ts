import { Request, Response } from 'express';
import cartService from '../services/cart.service';

class CartController {
  /**
   * GET /api/cart
   * Получить корзину текущего пользователя
   */
  async get(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Пользователь не найден в запросе' });
      const cart = await cartService.getOrCreate(req.user.userId);
      const response = {
        id: cart.id,
        items: cart.items.map((item: any) => ({
          bookId: item.bookId,
          quantity: item.quantity,
          priceSnapshot: item.priceSnapshot ? parseFloat(item.priceSnapshot.toString()) : null,
        })),
      };
      res.status(200).json(response);
      return;
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Ошибка сервера' });
      return;
    }
  }

  /**
   * POST /api/cart/items
   * Добавить или обновить товар в корзине
   */
  async addOrUpdateItem(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Пользователь не найден в запросе' });
      const { bookId, quantity } = req.body;
      if (!bookId) return res.status(400).json({ error: 'ID книги обязателен' });
      if (!quantity || quantity < 1) return res.status(400).json({ error: 'Количество должно быть больше 0' });
      const cart = await cartService.addOrUpdateItem(req.user.userId, bookId, quantity);
      const response = {
        id: cart.id,
        items: cart.items.map((item: any) => ({
          bookId: item.bookId,
          quantity: item.quantity,
          priceSnapshot: item.priceSnapshot ? parseFloat(item.priceSnapshot.toString()) : null,
        })),
      };
      res.status(200).json(response);
      return;
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Ошибка обновления корзины' });
      return;
    }
  }

  /**
   * DELETE /api/cart/items/:bookId
   * Удалить товар из корзины
   */
  async removeItem(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Пользователь не найден в запросе' });
      const { bookId } = req.params;
      if (!bookId) return res.status(400).json({ error: 'ID книги обязателен' });
      const deleted = await cartService.removeItem(req.user.userId, bookId);
      if (!deleted) return res.status(404).json({ error: 'Товар не найден в корзине' });
      res.status(204).send();
      return;
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Ошибка удаления товара из корзины' });
      return;
    }
  }

  /**
   * DELETE /api/cart
   * Очистить корзину
   */
  async clear(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Пользователь не найден в запросе' });
      const cleared = await cartService.clear(req.user.userId);
      if (!cleared) return res.status(404).json({ error: 'Корзина не найдена' });
      res.status(204).send();
      return;
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Ошибка очистки корзины' });
      return;
    }
  }
}

export default new CartController();

