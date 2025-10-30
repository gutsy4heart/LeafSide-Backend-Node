import { Request, Response } from 'express';
import ordersService, { CreateOrderData } from '../services/orders.service';

class OrdersController {
  /**
   * POST /api/orders
   * Создать заказ
   */
  async create(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Пользователь не найден в запросе' });
      const { items, totalAmount, shippingAddress, customerName, customerEmail, customerPhone, notes } = req.body;
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Список товаров не может быть пустым' });
      }
      const orderData: CreateOrderData = {
        items, totalAmount: parseFloat(totalAmount), shippingAddress, customerName, customerEmail, customerPhone, notes
      };
      const order = await ordersService.create(req.user.userId, orderData);
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
      res.status(200).json(response);
      return;
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Ошибка создания заказа' });
      return;
    }
  }

  /**
   * GET /api/orders
   * Получить заказы текущего пользователя
   */
  async getUserOrders(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Пользователь не найден в запросе' });
      const orders = await ordersService.getUserOrders(req.user.userId);
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
      res.status(200).json(response);
      return;
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Ошибка получения списка заказов' });
      return;
    }
  }

  /**
   * GET /api/orders/:id
   * Получить заказ по ID (только свой заказ)
   */
  async getById(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Пользователь не найден в запросе' });
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'ID заказа обязателен' });
      const order = await ordersService.getUserOrder(req.user.userId, id);
      if (!order) return res.status(404).json({ error: 'Заказ не найден' });
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
      res.status(200).json(response);
      return;
    } catch (error: any) {
      res.status(404).json({ error: error.message || 'Ошибка получения заказа' });
      return;
    }
  }

  /**
   * PUT /api/orders/:id/confirm-delivery
   * Подтвердить доставку заказа
   */
  async confirmDelivery(req: Request, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Пользователь не найден в запросе' });
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'ID заказа обязателен' });
      const order = await ordersService.confirmDelivery(req.user.userId, id);
      if (!order) return res.status(404).json({ error: 'Заказ не найден или не принадлежит пользователю' });
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
      res.status(200).json(response);
      return;
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Ошибка подтверждения заказа' });
      return;
    }
  }
}

export default new OrdersController();

