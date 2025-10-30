import { Request, Response } from 'express';
import booksService, { CreateBookData } from '../services/books.service';

class BooksController {
  /**
   * GET /api/books
   * Получить все книги
   */
  async getAll(_req: Request, res: Response) {
    try {
      const books = await booksService.getAll();
      res.status(200).json(books);
      return;
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Ошибка сервера' });
      return;
    }
  }

  /**
   * GET /api/books/:id
   * Получить книгу по ID
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'ID книги обязателен' });
      const book = await booksService.getById(id);
      if (!book) return res.status(404).json({ error: 'Книга не найдена' });
      res.status(200).json(book);
      return;
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Ошибка сервера' });
      return;
    }
  }

  /**
   * POST /api/books
   * Создать книгу (требует права Admin)
   */
  async create(req: Request, res: Response) {
    try {
      const bookData: CreateBookData = { ...req.body, price: req.body.price !== undefined ? parseFloat(req.body.price) : null };
      const created = await booksService.create(bookData);
      res.status(201).json(created);
      return;
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Ошибка создания книги' });
      return;
    }
  }

  /**
   * PUT /api/books/:id
   * Обновить книгу (требует права Admin)
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'ID книги обязателен' });
      const updated = await booksService.update(id, { ...req.body, price: req.body.price !== undefined ? parseFloat(req.body.price) : null });
      if (!updated) return res.status(404).json({ error: 'Книга не найдена' });
      res.status(200).json(updated);
      return;
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Ошибка обновления книги' });
      return;
    }
  }

  /**
   * DELETE /api/books/:id
   * Удалить книгу (требует права Admin)
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'ID книги обязателен' });
      const deleted = await booksService.delete(id);
      if (!deleted) return res.status(404).json({ error: 'Книга не найдена' });
      res.status(204).send();
      return;
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Ошибка удаления книги' });
      return;
    }
  }
}

export default new BooksController();

