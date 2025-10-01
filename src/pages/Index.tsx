import { useAuth } from '@/contexts/AuthContext';
import StudentDashboard from './StudentDashboard';
import InstructorDashboard from './InstructorDashboard';
import AdminDashboard from './AdminDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle className="text-center">Загрузка...</CardTitle>
            <CardDescription className="text-center">
              Подключаемся к Telegram
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle className="text-center">Ошибка авторизации</CardTitle>
            <CardDescription className="text-center">
              Не удалось авторизоваться через Telegram. Убедитесь, что приложение открыто через Telegram.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Рендер в зависимости от роли
  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'instructor':
      return <InstructorDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Card className="w-[400px]">
            <CardHeader>
              <CardTitle className="text-center">Неизвестная роль</CardTitle>
              <CardDescription className="text-center">
                Обратитесь к администратору
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      );
  }
};

export default Index;