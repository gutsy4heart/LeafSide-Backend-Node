import prisma from '../config/database';
import { NotFoundError, BadRequestError } from '../utils/errors';

export interface CreateBookData {
  title: string;
  description: string;
  author: string;
  genre: string;
  publishing: string;
  created: string;
  imageUrl: string;
  price?: number | null;
  isbn?: string | null;
  language?: string | null;
  pageCount: number;
  isAvailable: boolean;
}

export interface UpdateBookData {
  title: string;
  description: string;
  author: string;
  genre: string;
  publishing: string;
  created: string;
  imageUrl: string;
  price?: number | null;
  isbn?: string | null;
  language?: string | null;
  pageCount: number;
  isAvailable: boolean;
}

class BooksService {
  /**
   * Получить все книги
   */
  async getAll() {
    return prisma.book.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Получить книгу по ID
   */
  async getById(id: string) {
    const book = await prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      throw new NotFoundError('Книга не найдена');
    }

    return book;
  }

  /**
   * Создать книгу
   */
  async create(data: CreateBookData) {
    // Логирование для отладки
    console.log('Books Service: Received data:', data);
    console.log('Books Service: Title value:', data?.title);
    console.log('Books Service: Title type:', typeof data?.title);
    console.log('Books Service: Title length:', data?.title?.length);
    
    // Валидация
    if (!data.title || (typeof data.title === 'string' && !data.title.trim())) {
      console.error('Books Service: Validation failed - title is missing or empty');
      throw new BadRequestError('Название книги обязательно');
    }

    if (!data.author || (typeof data.author === 'string' && !data.author.trim())) {
      console.error('Books Service: Validation failed - author is missing or empty');
      throw new BadRequestError('Автор книги обязателен');
    }

    if (data.price !== null && data.price !== undefined && data.price < 0) {
      throw new BadRequestError('Цена не может быть отрицательной');
    }

    const book = await prisma.book.create({
      data: {
        title: data.title,
        description: data.description || '',
        author: data.author,
        genre: data.genre || '',
        publishing: data.publishing || '',
        created: data.created || '',
        imageUrl: data.imageUrl || '',
        price: data.price ? parseFloat(data.price.toString()) : null,
        isbn: data.isbn || '',
        language: data.language || 'Russian',
        pageCount: data.pageCount || 0,
        isAvailable: data.isAvailable !== false, // По умолчанию true
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return book;
  }

  /**
   * Обновить книгу
   */
  async update(id: string, data: UpdateBookData) {
    // Проверяем существование книги
    const existing = await prisma.book.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError('Книга не найдена');
    }

    // Валидация
    if (!data.title || !data.title.trim()) {
      throw new BadRequestError('Название книги обязательно');
    }

    if (!data.author || !data.author.trim()) {
      throw new BadRequestError('Автор книги обязателен');
    }

    if (data.price !== null && data.price !== undefined && data.price < 0) {
      throw new BadRequestError('Цена не может быть отрицательной');
    }

    const updated = await prisma.book.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description || '',
        author: data.author,
        genre: data.genre || '',
        publishing: data.publishing || '',
        created: data.created || '',
        imageUrl: data.imageUrl || '',
        price: data.price ? parseFloat(data.price.toString()) : null,
        isbn: data.isbn || existing.isbn,
        language: data.language || existing.language,
        pageCount: data.pageCount || existing.pageCount,
        isAvailable: data.isAvailable !== false ? data.isAvailable : existing.isAvailable,
        updatedAt: new Date(),
      },
    });

    return updated;
  }

  /**
   * Удалить книгу
   */
  async delete(id: string) {
    // Проверяем существование книги
    const existing = await prisma.book.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError('Книга не найдена');
    }

    await prisma.book.delete({
      where: { id },
    });

    return true;
  }
}

export default new BooksService();

