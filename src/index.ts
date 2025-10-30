import express, { Express } from 'express';
import cors from 'cors';
import { config } from './config/app';
import { errorHandler } from './middleware/errorHandler';

// Импорт роутов
import accountRoutes from './routes/account.routes';
import booksRoutes from './routes/books.routes';
import cartRoutes from './routes/cart.routes';
import ordersRoutes from './routes/orders.routes';
import adminRoutes from './routes/admin.routes';
import userStatsRoutes from './routes/userstats.routes';

const app: Express = express();

// Middleware
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check (строго по .NET)
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    selectedBase: 'PostgreSQL',
  });
});

// API Routes
app.use('/api/account', accountRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/Books', booksRoutes);// для совместимости с фронтом
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/userstats', userStatsRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Эндпоинт не найден',
  });
});

// Error handler (должен быть последним)
app.use(errorHandler);

// Запуск сервера
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📍 Environment: ${config.nodeEnv}`);
  console.log(`🌐 CORS origin: ${config.cors.origin}`);
});

export default app;

