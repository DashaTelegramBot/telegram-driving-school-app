import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import { toast } from 'sonner';

interface User {
  id: number;
  telegram_id?: number;
  first_name: string;
  last_name?: string;
  phone?: string;
  role: 'student' | 'instructor' | 'admin';
  instructor_id?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  autoLoginAttempted: boolean;
  login: (phone: string, password: string, role: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);

  // Функция для сохранения учетных данных
  const saveCredentials = (phone: string, password: string, role: string) => {
    const credentials = { phone, password, role };
    localStorage.setItem('auto_login_credentials', JSON.stringify(credentials));
  };

  // Функция для получения сохраненных учетных данных
  const getSavedCredentials = () => {
    const saved = localStorage.getItem('auto_login_credentials');
    return saved ? JSON.parse(saved) : null;
  };

  // Функция для очистки сохраненных учетных данных
  const clearCredentials = () => {
    localStorage.removeItem('auto_login_credentials');
  };

  // Автоматический вход при загрузке приложения
  useEffect(() => {
    autoLogin();
  }, []);

  const autoLogin = async () => {
    try {
      const savedCredentials = getSavedCredentials();
      if (savedCredentials && !user) {
        console.log('🔐 Attempting auto-login...');
        const { phone, password, role } = savedCredentials;
        
        const response = await authAPI.login({ phone, password, role });
        const responseData = response.data;
        
        if (responseData && responseData.user && responseData.token) {
          setUser(responseData.user);
          localStorage.setItem('auth_token', responseData.token);
          console.log('✅ Auto-login successful');
        }
      }
    } catch (error) {
      console.log('❌ Auto-login failed, clearing saved credentials');
      clearCredentials();
    } finally {
      setLoading(false);
      setAutoLoginAttempted(true);
    }
  };

  const login = async (phone: string, password: string, role: string) => {
    try {
      setLoading(true);
      console.log('📤 Sending login request:', { phone, password, role });
      
      const response = await authAPI.login({ phone, password, role });
      console.log('📥 Login response:', response.data);

      const responseData = response.data;
      
      if (responseData && responseData.user && responseData.token) {
        setUser(responseData.user);
        localStorage.setItem('auth_token', responseData.token);
        
        // Сохраняем учетные данные для авто-входа
        saveCredentials(phone, password, role);
        
        toast.success('Успешный вход!');
      } else {
        throw new Error('Неверная структура ответа от сервера');
      }
    } catch (error: any) {
      console.error('Ошибка авторизации:', error);
      
      // При ошибке очищаем сохраненные учетные данные
      clearCredentials();
      
      const errorMessage = error.response?.data?.error || 'Ошибка авторизации. Проверьте данные.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_token');
    clearCredentials(); // Очищаем учетные данные при выходе
    toast.info('Вы вышли из системы');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout,
      autoLoginAttempted 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};