import { Request, Response } from 'express';
import booksService, { CreateBookData } from '../services/books.service';
import { handleControllerError, sendSuccess, sendNoContent, getRequiredParam } from '../utils/controller-helpers';
import { NotFoundError } from '../utils/errors';

class BooksController {
  /**
   * Нормализация данных книги (обработка цены)
   */
  private normalizeBookData(body: any): CreateBookData {
    return {
      ...body,
      price: body.price !== undefined ? parseFloat(body.price) : null,
    };
  }

  /**
   * GET /api/books
   * Получить все книги
   */
  async getAll(_req: Request, res: Response) {
    try {
      const books = await booksService.getAll();
      sendSuccess(res, books);
    } catch (error: any) {
      handleControllerError(error, res, 'Ошибка сервера');
    }
  }

  /**
   * GET /api/books/:id
   * Получить книгу по ID
   */
  async getById(req: Request, res: Response) {
    try {
      const id = getRequiredParam(req, 'id');
      const book = await booksService.getById(id);
      
      if (!book) {
        throw new NotFoundError('Книга не найдена');
      }

      sendSuccess(res, book);
    } catch (error: any) {
      handleControllerError(error, res, 'Ошибка сервера');
    }
  }

  /**
   * POST /api/books
   * Создать книгу (требует права Admin)
   */
  async create(req: Request, res: Response) {
    try {
      const bookData: CreateBookData = this.normalizeBookData(req.body);
      const created = await booksService.create(bookData);
      sendSuccess(res, created, 201);
    } catch (error: any) {
      handleControllerError(error, res, 'Ошибка создания книги', 400);
    }
  }

  /**
   * PUT /api/books/:id
   * Обновить книгу (требует права Admin)
   */
  async update(req: Request, res: Response) {
    try {
      const id = getRequiredParam(req, 'id');
      const updated = await booksService.update(id, this.normalizeBookData(req.body));
      
      if (!updated) {
        throw new NotFoundError('Книга не найдена');
      }

      sendSuccess(res, updated);
    } catch (error: any) {
      handleControllerError(error, res, 'Ошибка обновления книги', 400);
    }
  }

  /**
   * DELETE /api/books/:id
   * Удалить книгу (требует права Admin)
   */
  async delete(req: Request, res: Response) {
    try {
      const id = getRequiredParam(req, 'id');
      const deleted = await booksService.delete(id);
      
      if (!deleted) {
        throw new NotFoundError('Книга не найдена');
      }

      sendNoContent(res);
    } catch (error: any) {
      handleControllerError(error, res, 'Ошибка удаления книги');
    }
  }
}

export default new BooksController();

