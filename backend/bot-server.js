import express from 'express';
import axios from 'axios';

const app = express();

app.use(express.json());


const BOT_TOKEN = '8400307208:AAFxptXyviCzKGmkQdgrYjCWqC1xDv_4Huw';
const SERVER_URL = 'https://artestelegramapp.serveo.net';

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

// Стартовая страница
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Telegram Bot Server</title></head>
      <body>
        <h1>Telegram Bot Server работает!</h1>
        <p>URL для вебхука: ${SERVER_URL}/webhook</p>
        <p><a href="/set-webhook">Установить вебхук</a></p>
      </body>
    </html>
  `);
});

// Запуск сервера
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Bot server running on port ${PORT}`);
  console.log(`Webhook URL: ${SERVER_URL}/webhook`);
  console.log(`Set webhook: ${SERVER_URL}/set-webhook`);
});