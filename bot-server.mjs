import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import axios from 'axios';

const app = express();

const BOT_TOKEN = '8400307208:AAFxptXyviCzKGmkQdgrYjCWqC1xDv_4Huw';
const SERVER_URL = 'https://artes.loca.lt';

app.use((req, res, next) => {
  console.log('📥 Incoming ${req.method} ${req.url}');
  next();
}); 

app.use('/api', createProxyMiddleware({
    target: 'http://localhost:8000',
    changeOrigin: true,
    pathRewrite: (path) => {
        const rewritten = '/api${path}';
        console.log('🛣️ Rewriting path: ${path} -> ${rewritten}');
        return rewritten;
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`🔄 Proxying request: ${req.method} ${req.url} -> ${proxyReq.path}`);
    },
    onError: (err, req, res) => {
        console.error('❌ API Proxy error:', err);
        res.status(500).json({ error: 'API Proxy error' });
    }
}));

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Telegram-Init-Data');
  res.header('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    console.log('🔄 Handling OPTIONS request for:', req.url);
    return res.status(200).end();
  }

  next();
});

// Webhook endpoints
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

app.post('/webhook', async (req, res) => {
  const update = req.body;
  
  if (update.message) {
    const chatId = update.message.chat.id;
    const text = update.message.text;
    
    console.log(`Получено сообщение: ${text} от ${chatId}`);
    
    try {
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

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'Bot Server',
        apiProxy: 'http://localhost:8000/api', // Добавлена запятая здесь
        frontend: 'http://localhost:8080'
    });
});

// Статические файлы фронтенда
app.use('/', createProxyMiddleware({
  target: 'http://localhost:8080',
  changeOrigin: true,
  ws: true,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying frontend: ${req.method} ${req.url}`); // Исправлены кавычки
  },
  onError: (err, req, res) => {
    console.error('Frontend proxy error:', err);
    res.status(500).json({ error: 'Frontend proxy error' });
  }
}));  

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Bot server running on port ${PORT} (IPv4/IPv6)`);
  console.log(`🌐 Webhook URL: ${SERVER_URL}/webhook`);
  console.log(`📱 Frontend: ${SERVER_URL} -> http://localhost:8080`);
  console.log(`🔧 API proxy: ${SERVER_URL}/api -> http://localhost:8000/api`);
});