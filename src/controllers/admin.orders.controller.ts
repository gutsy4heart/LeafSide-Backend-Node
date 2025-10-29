import { Request, Response, NextFunction } from 'express';
import ordersService from '../services/orders.service';
import { BadRequestError } from '../utils/errors';

class AdminOrdersController {
  /**
   * GET /api/admin/orders
   * Получить все заказы (только для админа)
   */
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await ordersService.getAll();

      // Формируем ответ в формате C# API
      const response = orders.map((order) => ({
        id: order.id,
        userId: order.userId,
        status: order.status,
        totalAmount: parseFloat(order.totalAmount.toString()),
        shippingAddress: order.shippingAddress,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        notes: order.notes,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items.map((item) => ({
          id: item.id,
          bookId: item.bookId,
          bookTitle: item.book?.title || 'Unknown',
          quantity: item.quantity,
          unitPrice: parseFloat(item.unitPrice.toString()),
          totalPrice: parseFloat(item.totalPrice.toString()),
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
   * GET /api/admin/orders/:id
   * Получить заказ по ID (только для админа)
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new BadRequestError('ID заказа обязателен');
      }

      const order = await ordersService.getById(id);

      // Формируем ответ в формате C# API
      const response = {
        id: order.id,
        userId: order.userId,
        status: order.status,
        totalAmount: parseFloat(order.totalAmount.toString()),
        shippingAddress: order.shippingAddress,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        notes: order.notes,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items.map((item) => ({
          id: item.id,
          bookId: item.bookId,
          bookTitle: item.book?.title || 'Unknown',
          quantity: item.quantity,
          unitPrice: parseFloat(item.unitPrice.toString()),
          totalPrice: parseFloat(item.totalPrice.toString()),
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

  /**
   * PUT /api/admin/orders/:id/status
   * Обновить статус заказа (только для админа)
   */
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id) {
        throw new BadRequestError('ID заказа обязателен');
      }

      if (!status) {
        throw new BadRequestError('Статус обязателен');
      }

      const order = await ordersService.updateStatus(id, status);

      // Формируем ответ в формате C# API
      const response = {
        id: order.id,
        userId: order.userId,
        status: order.status,
        totalAmount: parseFloat(order.totalAmount.toString()),
        shippingAddress: order.shippingAddress,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        notes: order.notes,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items.map((item) => ({
          id: item.id,
          bookId: item.bookId,
          bookTitle: item.book?.title || 'Unknown',
          quantity: item.quantity,
          unitPrice: parseFloat(item.unitPrice.toString()),
          totalPrice: parseFloat(item.totalPrice.toString()),
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

  /**
   * DELETE /api/admin/orders/:id
   * Удалить заказ (только для админа)
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new BadRequestError('ID заказа обязателен');
      }

      const deleted = await ordersService.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Заказ не найден',
        });
      }

      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }
}

export default new AdminOrdersController();

