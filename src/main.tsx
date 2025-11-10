// src/main.tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routes/routeTree';
import App from './App';

const router = createRouter({ routeTree });

// Регистрируем router для TypeScript
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App router={router} />
  </React.StrictMode>,
);