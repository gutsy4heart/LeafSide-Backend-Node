import { Request, Response, NextFunction } from 'express';
import ordersService, { CreateOrderData } from '../services/orders.service';
import { BadRequestError } from '../utils/errors';

class OrdersController {
  /**
   * POST /api/orders
   * Создать заказ
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new BadRequestError('Пользователь не найден в запросе');
      }

      const { items, totalAmount, shippingAddress, customerName, customerEmail, customerPhone, notes } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new BadRequestError('Список товаров не может быть пустым');
      }

      const orderData: CreateOrderData = {
        items,
        totalAmount: parseFloat(totalAmount),
        shippingAddress,
        customerName,
        customerEmail,
        customerPhone,
        notes,
      };

      const order = await ordersService.create(req.user.userId, orderData);

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

      res.status(201).json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/orders
   * Получить заказы текущего пользователя
   */
  async getUserOrders(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new BadRequestError('Пользователь не найден в запросе');
      }

      const orders = await ordersService.getUserOrders(req.user.userId);

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
   * GET /api/orders/:id
   * Получить заказ по ID (только свой заказ)
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new BadRequestError('Пользователь не найден в запросе');
      }

      const { id } = req.params;

      if (!id) {
        throw new BadRequestError('ID заказа обязателен');
      }

      const order = await ordersService.getUserOrder(req.user.userId, id);

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
   * PUT /api/orders/:id/confirm-delivery
   * Подтвердить доставку заказа
   */
  async confirmDelivery(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new BadRequestError('Пользователь не найден в запросе');
      }

      const { id } = req.params;

      if (!id) {
        throw new BadRequestError('ID заказа обязателен');
      }

      const order = await ordersService.confirmDelivery(req.user.userId, id);

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
}

export default new OrdersController();

