import { Request, Response, NextFunction } from 'express';
import booksService, { CreateBookData, UpdateBookData } from '../services/books.service';
import { BadRequestError } from '../utils/errors';

class BooksController {
  /**
   * GET /api/books
   * Получить все книги
   */
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const books = await booksService.getAll();

      res.json({
        success: true,
        data: books,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/books/:id
   * Получить книгу по ID
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new BadRequestError('ID книги обязателен');
      }

      const book = await booksService.getById(id);

      res.json({
        success: true,
        data: book,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/books
   * Создать книгу (требует права Admin)
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        title,
        description,
        author,
        genre,
        publishing,
        created,
        imageUrl,
        price,
        isbn,
        language,
        pageCount,
        isAvailable,
      } = req.body;

      const bookData: CreateBookData = {
        title,
        description,
        author,
        genre,
        publishing,
        created,
        imageUrl,
        price: price !== undefined ? parseFloat(price) : null,
        isbn,
        language,
        pageCount: pageCount || 0,
        isAvailable: isAvailable !== false,
      };

      const book = await booksService.create(bookData);

      res.status(201).json({
        success: true,
        data: book,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/books/:id
   * Обновить книгу (требует права Admin)
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new BadRequestError('ID книги обязателен');
      }

      const {
        title,
        description,
        author,
        genre,
        publishing,
        created,
        imageUrl,
        price,
        isbn,
        language,
        pageCount,
        isAvailable,
      } = req.body;

      const bookData: UpdateBookData = {
        title,
        description,
        author,
        genre,
        publishing,
        created,
        imageUrl,
        price: price !== undefined ? parseFloat(price) : null,
        isbn,
        language,
        pageCount: pageCount || 0,
        isAvailable: isAvailable !== false,
      };

      const book = await booksService.update(id, bookData);

      res.json({
        success: true,
        data: book,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/books/:id
   * Удалить книгу (требует права Admin)
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new BadRequestError('ID книги обязателен');
      }

      await booksService.delete(id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new BooksController();

