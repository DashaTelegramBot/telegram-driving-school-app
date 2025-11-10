import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const BOT_TOKEN = '8400307208:AAFxptXyviCzKGmkQdgrYjCWqC1xDv_4Huw';
const SERVER_URL = 'https://artes.loca.lt';

// Middleware для парсинга JSON
app.use(express.json());

// Установка вебхука
app.get('/set-webhook', async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${SERVER_URL}/webhook`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обработка вебхуков от Telegram
app.post('/webhook', async (req, res) => {
  const update = req.body;
  
  // Обработка сообщений
  if (update.message) {
    const chatId = update.message.chat.id;
    const text = update.message.text;
    
    console.log(`Получено сообщение: ${text} от ${chatId}`);
    
    try {
      // Ответ бота
      await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        chat_id: chatId,
        text: `Вы сказали: ${text}`
      });
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error.message);
    }
  }
  
  res.sendStatus(200);
});

// Прокси для API запросов к Django
app.use('/api', createProxyMiddleware({
    target: 'http://localhost:8000',
    changeOrigin: true,
    pathRewrite: {
        '^/api': '/api',
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log('🔁 Proxying API request:', req.method, req.url);
    }
}));

// Прокси для админки Django
app.use('/admin', createProxyMiddleware({
    target: 'http://localhost:8000',
    changeOrigin: true,
}));

// Прокси для статических файлов Django
app.use('/static', createProxyMiddleware({
    target: 'http://localhost:8000',
    changeOrigin: true,
}));

// Статические файлы фронтенда (после сборки)
app.use(express.static(join(__dirname, 'dist')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Все остальные запросы на фронтенд
app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Unified server running on port ${PORT}`);
    console.log(`🌐 React app: http://localhost:${PORT}`);
    console.log(`🔗 API proxy: http://localhost:${PORT}/api -> http://localhost:8000/api`);
    console.log(`🤖 Bot webhook: ${SERVER_URL}/webhook`);
    console.log(`⚙️ Set webhook: ${SERVER_URL}/set-webhook`);
});