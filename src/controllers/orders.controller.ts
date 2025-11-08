import { Request, Response } from 'express';
import ordersService, { CreateOrderData } from '../services/orders.service';
import { requireUser, handleControllerError, sendSuccess, getRequiredParam } from '../utils/controller-helpers';
import { BadRequestError, NotFoundError } from '../utils/errors';

class OrdersController {
  /**
   * Форматирование заказа для ответа
   */
  private formatOrder(order: any) {
    return {
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
      items: order.items.map((item: any) => ({
        id: item.id,
        bookId: item.bookId,
        bookTitle: item.book?.title || 'Unknown',
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice.toString()),
        totalPrice: parseFloat(item.totalPrice.toString()),
      })),
    };
  }

  /**
   * POST /api/orders
   * Создать заказ
   */
  async create(req: Request, res: Response) {
    try {
      requireUser(req);
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

      const order = await ordersService.create(req.user!.userId, orderData);
      sendSuccess(res, this.formatOrder(order));
    } catch (error: any) {
      handleControllerError(error, res, 'Ошибка создания заказа', 400);
    }
  }

  /**
   * GET /api/orders
   * Получить заказы текущего пользователя
   */
  async getUserOrders(req: Request, res: Response) {
    try {
      requireUser(req);
      const orders = await ordersService.getUserOrders(req.user!.userId);
      sendSuccess(res, orders.map(order => this.formatOrder(order)));
    } catch (error: any) {
      handleControllerError(error, res, 'Ошибка получения списка заказов');
    }
  }

  /**
   * GET /api/orders/:id
   * Получить заказ по ID (только свой заказ)
   */
  async getById(req: Request, res: Response) {
    try {
      requireUser(req);
      const id = getRequiredParam(req, 'id');
      const order = await ordersService.getUserOrder(req.user!.userId, id);
      
      if (!order) {
        throw new NotFoundError('Заказ не найден');
      }

      sendSuccess(res, this.formatOrder(order));
    } catch (error: any) {
      handleControllerError(error, res, 'Ошибка получения заказа', 404);
    }
  }

  /**
   * PUT /api/orders/:id/confirm-delivery
   * Подтвердить доставку заказа
   */
  async confirmDelivery(req: Request, res: Response) {
    try {
      requireUser(req);
      const id = getRequiredParam(req, 'id');
      const order = await ordersService.confirmDelivery(req.user!.userId, id);
      
      if (!order) {
        throw new NotFoundError('Заказ не найден или не принадлежит пользователю');
      }

      sendSuccess(res, this.formatOrder(order));
    } catch (error: any) {
      handleControllerError(error, res, 'Ошибка подтверждения заказа', 400);
    }
  }
}

export default new OrdersController();

