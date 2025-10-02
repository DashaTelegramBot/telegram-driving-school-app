import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

// Получаем __dirname для ES модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

// Ваш токен бота
const BOT_TOKEN = '8400307208:AAFxptXyviCzKGmkQdgrYjCWqC1xDv_4Huw';
const SERVER_URL = 'https://artestelegramapp.serveo.net';

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Обслуживание статических файлов из папки dist
app.use(express.static(path.join(__dirname, 'dist')));

// Установка вебхука
app.get('/set-webhook', async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${SERVER_URL}/webhook`
    );
    res.json(response.data);
  } catch (error) {
    console.error('Webhook setup error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Удаление вебхука (для разработки)
app.get('/delete-webhook', async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`
    );
    res.json(response.data);
  } catch (error) {
    console.error('Webhook delete error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Информация о боте
app.get('/bot-info', async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.telegram.org/bot${BOT_TOKEN}/getMe`
    );
    res.json(response.data);
  } catch (error) {
    console.error('Bot info error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Обработка вебхуков от Telegram
app.post('/webhook', async (req, res) => {
  const update = req.body;
  
  console.log('Received webhook:', JSON.stringify(update, null, 2));
  
  if (update.message) {
    const chatId = update.message.chat.id;
    const text = update.message.text;
    
    console.log(`Получено сообщение: "${text}" от ${chatId}`);
    
    try {
      await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        chat_id: chatId,
        text: `Эхо: ${text}`,
        reply_markup: {
          inline_keyboard: [[
            {
              text: 'Открыть приложение',
              web_app: { url: SERVER_URL }
            }
          ]]
        }
      });
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error.message);
    }
  }
  
  res.sendStatus(200);
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Bot server is running',
    timestamp: new Date().toISOString()
  });
});

// Главная страница - отдаем React приложение
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Для всех остальных маршрутов также отдаем React приложение
// ИСПРАВЛЕНИЕ: используем регулярное выражение вместо '*'
app.get(/^(?!\/api|\/set-webhook|\/delete-webhook|\/bot-info|\/webhook).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Bot server running on port ${PORT}`);
  console.log(`🌐 Webhook URL: ${SERVER_URL}/webhook`);
  console.log(`⚙️ Set webhook: ${SERVER_URL}/set-webhook`);
  console.log(`🗑️ Delete webhook: ${SERVER_URL}/delete-webhook`);
  console.log(`🤖 Bot info: ${SERVER_URL}/bot-info`);
  console.log(`📱 React app: ${SERVER_URL}`);
  console.log(`❤️ Health check: ${SERVER_URL}/api/health`);
});