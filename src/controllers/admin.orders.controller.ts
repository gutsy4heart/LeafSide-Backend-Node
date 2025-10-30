import { Request, Response } from 'express';
import ordersService from '../services/orders.service';

class AdminOrdersController {
  /**
   * GET /api/admin/orders
   * Получить все заказы (только для админа)
   */
  async getAll(_req: Request, res: Response) {
    try {
      const orders = await ordersService.getAll();
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
      res.status(500).json({ error: error.message || 'Internal server error' });
      return;
    }
  }

  /**
   * GET /api/admin/orders/:id
   * Получить заказ по ID (только для админа)
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'ID заказа обязателен' });
      const order = await ordersService.getById(id);
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
      res.status(500).json({ error: error.message || 'Internal server error' });
      return;
    }
  }

  /**
   * PUT /api/admin/orders/:id/status
   * Обновить статус заказа (только для админа)
   */
  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!id) return res.status(400).json({ error: 'ID заказа обязателен' });
      if (!status) return res.status(400).json({ error: 'Статус обязателен' });
      const order = await ordersService.updateStatus(id, status);
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
      res.status(400).json({ error: error.message || 'Failed to update order status' });
      return;
    }
  }

  /**
   * DELETE /api/admin/orders/:id
   * Удалить заказ (только для админа)
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'ID заказа обязателен' });
      const deleted = await ordersService.delete(id);
      if (!deleted) return res.status(404).json({ error: 'Заказ не найден' });
      res.status(204).send();
      return;
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete order' });
      return;
    }
  }
}

export default new AdminOrdersController();

