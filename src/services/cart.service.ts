import prisma from '../config/database';
import { NotFoundError, BadRequestError } from '../utils/errors';

class CartService {
  /**
   * Получить или создать корзину для пользователя
   */
  async getOrCreate(userId: string) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            book: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
        },
        include: {
          items: {
            include: {
              book: true,
            },
          },
        },
      });
    }

    return cart;
  }

  /**
   * Добавить или обновить товар в корзине
   */
  async addOrUpdateItem(userId: string, bookId: string, quantity: number) {
    // Валидация количества
    if (quantity < 1) {
      throw new BadRequestError('Количество должно быть больше 0');
    }

    // Проверяем существование книги
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundError('Книга не найдена');
    }

    if (!book.isAvailable) {
      throw new BadRequestError('Книга недоступна для покупки');
    }

    // Получаем или создаем корзину
    const cart = await this.getOrCreate(userId);

    // Проверяем, есть ли уже этот товар в корзине
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        bookId: bookId,
      },
    });

    const priceSnapshot = book.price ? parseFloat(book.price.toString()) : null;

    if (existingItem) {
      // Обновляем существующий товар
      await prisma.cartItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity,
          priceSnapshot,
        },
      });
    } else {
      // Создаем новый элемент корзины
      // Проверяем, что такой элемент еще не существует (race condition защита)
      try {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            bookId: bookId,
            quantity,
            priceSnapshot,
          },
        });
      } catch (error: any) {
        // Если элемент уже существует (нарушение уникальности), обновляем его
        if (error.code === 'P2002') {
          const item = await prisma.cartItem.findFirst({
            where: {
              cartId: cart.id,
              bookId: bookId,
            },
          });

          if (item) {
            await prisma.cartItem.update({
              where: { id: item.id },
              data: {
                quantity,
                priceSnapshot,
              },
            });
          }
        } else {
          throw error;
        }
      }
    }

    // Возвращаем обновленную корзину
    return this.getOrCreate(userId);
  }

  /**
   * Удалить товар из корзины
   */
  async removeItem(userId: string, bookId: string) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      return false;
    }

    const item = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        bookId: bookId,
      },
    });

    if (!item) {
      return false;
    }

    await prisma.cartItem.delete({
      where: {
        id: item.id,
      },
    });

    return true;
  }

  /**
   * Очистить корзину
   */
  async clear(userId: string) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      return false;
    }

    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return true;
  }

  /**
   * Получить все корзины (для админа)
   */
  async getAll() {
    return prisma.cart.findMany({
      include: {
        items: {
          include: {
            book: true,
          },
        },
      },
    });
  }

  /**
   * Получить корзину пользователя по userId (для админа)
   */
  async getByUserId(userId: string) {
    return this.getOrCreate(userId);
  }
}

export default new CartService();

