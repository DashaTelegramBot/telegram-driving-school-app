import express from 'express';
import axios from 'axios';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
app.use(express.json());

const BOT_TOKEN = '8400307208:AAFxptXyviCzKGmkQdgrYjCWqC1xDv_4Huw';
const SERVER_URL = 'https://artes.loca.lt';

// 🔥 ВАЖНО: Прокси для API ДОЛЖЕН быть ПЕРВЫМ
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:8000',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    console.log('🔁 Proxying API:', req.method, req.url, '->', proxyReq.path);
  }
}));

// Остальные маршруты...
app.get('/set-webhook', async (req, res) => {
  // ... ваш код
});

app.post('/webhook', async (req, res) => {
  // ... ваш код
});

app.get('/', (req, res) => {
  res.send('Bot server is running');
});

const PORT = 3000; // Измените порт на 3000
app.listen(PORT, () => {
  console.log(`Bot server running on port ${PORT}`);
});