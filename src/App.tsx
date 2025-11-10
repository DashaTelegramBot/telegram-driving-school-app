// src/App.tsx
import React, { useEffect } from "react";
import { RouterProvider } from "@tanstack/react-router";
import { initTelegramWebApp } from "@/lib/telegram";

interface AppProps {
  router: any; // Замените 'any' на соответствующий тип, если необходимо
}

function App({ router }: AppProps) {
  useEffect(() => {
    try {
      console.log('🔄 Инициализация Telegram WebApp...');
      const webApp = initTelegramWebApp();
      console.log('✅ Telegram WebApp инициализирован:', webApp);
      webApp.setBackgroundColor('#1C1A1B');
      webApp.setHeaderColor('#1C1A1B');
      console.log('🎨 Цвета Telegram WebApp установлены');
    } catch (error) {
      console.error('❌ Ошибка инициализации Telegram WebApp:', error);
    }
  }, []);

  return (
    <RouterProvider router={router} />
  );
}

export default App;





