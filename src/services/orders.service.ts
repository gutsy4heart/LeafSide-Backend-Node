import prisma from '../config/database';
import { NotFoundError, BadRequestError } from '../utils/errors';
import cartService from './cart.service';

export interface CreateOrderItem {
  bookId: string;
  quantity: number;
}

export interface CreateOrderData {
  items: CreateOrderItem[];
  totalAmount: number;
  shippingAddress?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: string;
}

class OrdersService {
  /**
   * Получить все заказы (для админа)
   */
  async getAll() {
    return prisma.order.findMany({
      include: {
        items: {
          include: {
            book: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Получить заказ по ID
   */
  async getById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            book: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundError('Заказ не найден');
    }

    return order;
  }

  /**
   * Получить заказы пользователя
   */
  async getUserOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            book: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Получить заказ пользователя по ID
   */
  async getUserOrder(userId: string, orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            book: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundError('Заказ не найден');
    }

    if (order.userId !== userId) {
      throw new BadRequestError('Заказ не принадлежит пользователю');
    }

    return order;
  }

  /**
   * Создать заказ из списка товаров
   */
  async create(userId: string, data: CreateOrderData) {
    // Валидация
    if (!data.items || data.items.length === 0) {
      throw new BadRequestError('Список товаров не может быть пустым');
    }

    if (!data.totalAmount || data.totalAmount <= 0) {
      throw new BadRequestError('Сумма заказа должна быть больше 0');
    }

    // Получаем информацию о книгах и рассчитываем сумму
    let calculatedTotal = 0;
    const orderItemsData = [];

    for (const item of data.items) {
      const book = await prisma.book.findUnique({
        where: { id: item.bookId },
      });

      if (!book) {
        throw new BadRequestError(`Книга с ID ${item.bookId} не найдена`);
      }

      if (item.quantity <= 0) {
        throw new BadRequestError(`Количество для книги ${book.title} должно быть больше 0`);
      }

      const unitPrice = book.price ? parseFloat(book.price.toString()) : 0;
      const totalPrice = unitPrice * item.quantity;

      calculatedTotal += totalPrice;

      orderItemsData.push({
        bookId: item.bookId,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      });
    }

    // Проверяем, что переданная сумма соответствует рассчитанной (с небольшой погрешностью)
    if (Math.abs(calculatedTotal - data.totalAmount) > 0.01) {
      throw new BadRequestError('Переданная сумма не соответствует рассчитанной');
    }

    // Создаем заказ
    const order = await prisma.order.create({
      data: {
        userId,
        status: 'Pending',
        totalAmount: data.totalAmount,
        shippingAddress: data.shippingAddress || '',
        customerName: data.customerName || '',
        customerEmail: data.customerEmail || '',
        customerPhone: data.customerPhone || null,
        notes: data.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: {
            book: true,
          },
        },
      },
    });

    return order;
  }

  /**
   * Создать заказ из корзины пользователя
   */
  async createFromCart(
    userId: string,
    shippingAddress?: string,
    customerName?: string,
    customerEmail?: string,
    customerPhone?: string,
    notes?: string
  ) {
    const cart = await cartService.getOrCreate(userId);

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestError('Корзина пуста');
    }

    // Рассчитываем сумму заказа
    let totalAmount = 0;
    const orderItemsData = [];

    for (const cartItem of cart.items) {
      const book = await prisma.book.findUnique({
        where: { id: cartItem.bookId },
      });

      if (!book) {
        continue; // Пропускаем, если книга не найдена
      }

      const unitPrice = cartItem.priceSnapshot
        ? parseFloat(cartItem.priceSnapshot.toString())
        : book.price
        ? parseFloat(book.price.toString())
        : 0;
      const totalPrice = unitPrice * cartItem.quantity;

      totalAmount += totalPrice;

      orderItemsData.push({
        bookId: cartItem.bookId,
        quantity: cartItem.quantity,
        unitPrice,
        totalPrice,
      });
    }

    // Создаем заказ
    const order = await prisma.order.create({
      data: {
        userId,
        status: 'Pending',
        totalAmount,
        shippingAddress: shippingAddress || '',
        customerName: customerName || '',
        customerEmail: customerEmail || '',
        customerPhone: customerPhone || null,
        notes: notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: {
            book: true,
          },
        },
      },
    });

    // Очищаем корзину после создания заказа
    await cartService.clear(userId);

    return order;
  }

  /**
   * Обновить статус заказа (для админа)
   */
  async updateStatus(orderId: string, status: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundError('Заказ не найден');
    }

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestError('Некорректный статус заказа');
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        items: {
          include: {
            book: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Подтвердить доставку заказа пользователем
   */
  async confirmDelivery(userId: string, orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundError('Заказ не найден');
    }

    if (order.userId !== userId) {
      throw new BadRequestError('Заказ не принадлежит пользователю');
    }

    if (order.status !== 'Shipped' && order.status !== 'Pending') {
      throw new BadRequestError('Заказ должен быть в статусе "Отправлен" или "Ожидает обработки" для подтверждения получения');
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'Delivered',
        updatedAt: new Date(),
      },
      include: {
        items: {
          include: {
            book: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Удалить заказ (для админа)
   */
  async delete(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return false;
    }

    await prisma.order.delete({
      where: { id: orderId },
    });

    return true;
  }
}

export default new OrdersService();

