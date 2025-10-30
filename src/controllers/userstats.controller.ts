import { Request, Response } from 'express';
import ordersService from '../services/orders.service';
import cartService from '../services/cart.service';

class UserStatsController {
  // GET /api/userstats/stats
  async getStats(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Пользователь не найден' });
      const userId = req.user.userId;

      const orders = await ordersService.getUserOrders(userId);
      const totalOrders = orders.length;
      const totalBooksPurchased = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);

      const cart = await cartService.getByUserId(userId);
      const itemsInCart = cart ? (cart.items?.length ?? 0) : 0;

      const favoritesCount = 0;

      res.status(200).json({
        totalOrders,
        totalBooksPurchased,
        itemsInCart,
        favoritesCount,
      });
      return;
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Ошибка при получении статистики' });
      return;
    }
  }
}

export default new UserStatsController();
