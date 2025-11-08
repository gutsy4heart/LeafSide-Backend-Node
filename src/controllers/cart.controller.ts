import { Request, Response } from 'express';
import cartService from '../services/cart.service';
import { requireUser, handleControllerError, sendSuccess, sendNoContent, getRequiredParam } from '../utils/controller-helpers';
import { BadRequestError, NotFoundError } from '../utils/errors';

class CartController {
  /**
   * Форматирование корзины для ответа
   */
  private formatCart(cart: any) {
    return {
      id: cart.id,
      items: cart.items.map((item: any) => ({
        bookId: item.bookId,
        quantity: item.quantity,
        priceSnapshot: item.priceSnapshot ? parseFloat(item.priceSnapshot.toString()) : null,
      })),
    };
  }

  /**
   * GET /api/cart
   * Получить корзину текущего пользователя
   */
  async get(req: Request, res: Response) {
    try {
      requireUser(req);
      const cart = await cartService.getOrCreate(req.user!.userId);
      sendSuccess(res, this.formatCart(cart));
    } catch (error: any) {
      handleControllerError(error, res, 'Ошибка сервера');
    }
  }

  /**
   * POST /api/cart/items
   * Добавить или обновить товар в корзине
   */
  async addOrUpdateItem(req: Request, res: Response) {
    try {
      requireUser(req);
      const { bookId, quantity } = req.body;
      
      if (!bookId) {
        throw new BadRequestError('ID книги обязателен');
      }
      if (!quantity || quantity < 1) {
        throw new BadRequestError('Количество должно быть больше 0');
      }

      const cart = await cartService.addOrUpdateItem(req.user!.userId, bookId, quantity);
      sendSuccess(res, this.formatCart(cart));
    } catch (error: any) {
      handleControllerError(error, res, 'Ошибка обновления корзины', 400);
    }
  }

  /**
   * DELETE /api/cart/items/:bookId
   * Удалить товар из корзины
   */
  async removeItem(req: Request, res: Response) {
    try {
      requireUser(req);
      const bookId = getRequiredParam(req, 'bookId');
      const deleted = await cartService.removeItem(req.user!.userId, bookId);
      
      if (!deleted) {
        throw new NotFoundError('Товар не найден в корзине');
      }

      sendNoContent(res);
    } catch (error: any) {
      handleControllerError(error, res, 'Ошибка удаления товара из корзины');
    }
  }

  /**
   * DELETE /api/cart
   * Очистить корзину
   */
  async clear(req: Request, res: Response) {
    try {
      requireUser(req);
      const cleared = await cartService.clear(req.user!.userId);
      
      if (!cleared) {
        throw new NotFoundError('Корзина не найдена');
      }

      sendNoContent(res);
    } catch (error: any) {
      handleControllerError(error, res, 'Ошибка очистки корзины');
    }
  }
}

export default new CartController();

