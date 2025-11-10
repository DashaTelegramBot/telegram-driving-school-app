import { useState, useEffect } from 'react';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { bookingsAPI, slotsAPI, studentsAPI, Booking, Slot, StudentStats } from '@/lib/api';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Clock, TrendingUp, Award } from 'lucide-react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StudentDashboard = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
    loadMyBookings();
  }, []);

  useEffect(() => {
    loadAvailableSlots();
  }, [selectedDate]);

  const loadStats = async () => {
    try {
      const response = await studentsAPI.getStats();
      console.log('📊 Stats response:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
      // Устанавливаем статистику по умолчанию при ошибке
      setStats({
        total_hours: 0,
        completed_lessons: 0,
        total_lessons: 10,
        additional_lessons: 0,
        progress_percentage: 0,
      });
    }
  };

  const loadAvailableSlots = async () => {
    try {
      setLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await slotsAPI.getAll({ date: dateStr });
      console.log('📅 Available slots response:', response.data);
      // Проверяем, что response.data является массивом
      const slots = Array.isArray(response.data) ? response.data : [];
      setAvailableSlots(slots.filter(slot => slot.is_available));
    } catch (error) {
      console.error('Ошибка загрузки слотов:', error);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMyBookings = async () => {
    try {
      const response = await bookingsAPI.getStudentSchedule();
      console.log('📋 My bookings response:', response.data);
      // Проверяем, что response.data является массивом
      setMyBookings(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Ошибка загрузки расписания:', error);
      setMyBookings([]);
    }
  };

  const handleBookSlot = async (slotId: number) => {
    try {
      await bookingsAPI.book(slotId);
      toast.success('Занятие успешно забронировано!');
      loadAvailableSlots();
      loadMyBookings();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка бронирования');
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    try {
      await bookingsAPI.cancel(bookingId);
      toast.success('Бронирование отменено');
      loadMyBookings();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка отмены');
    }
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success text-success-foreground';
      case 'active': return 'bg-primary text-primary-foreground';
      case 'canceled': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Создаем безопасные данные для графика
  const progressData = {
    labels: ['Пройдено', 'Осталось'],
    datasets: [{
      data: [
        stats?.completed_lessons || 0, 
        (stats?.total_lessons || 10) - (stats?.completed_lessons || 0)
      ],
      backgroundColor: ['hsl(var(--success))', 'hsl(var(--muted))'],
      borderWidth: 0,
    }]
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Личный кабинет ученика</h1>

        <Tabs defaultValue="booking" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="booking">Запись</TabsTrigger>
            <TabsTrigger value="schedule">Расписание</TabsTrigger>
            <TabsTrigger value="stats">Статистика</TabsTrigger>
          </TabsList>

          <TabsContent value="booking" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Выберите дату и время
                </CardTitle>
                <CardDescription>
                  Выберите удобное время для занятия
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <Calendar
                    onChange={(value) => setSelectedDate(value as Date)}
                    value={selectedDate}
                    minDate={new Date()}
                    locale="ru-RU"
                    className="rounded-lg border"
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Доступные слоты на {selectedDate.toLocaleDateString('ru-RU')}</h3>
                  {loading ? (
                    <p className="text-muted-foreground">Загрузка...</p>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-muted-foreground">Нет доступных слотов</p>
                  ) : (
                    <div className="grid gap-2">
                      {availableSlots.map((slot) => (
                        <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {new Date(slot.start_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                              {' - '}
                              {new Date(slot.end_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {slot.instructor_name && (
                              <span className="text-sm text-muted-foreground">
                                • {slot.instructor_name}
                              </span>
                            )}
                          </div>
                          <Button onClick={() => handleBookSlot(slot.id)} size="sm">
                            Забронировать
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Мои занятия</CardTitle>
                <CardDescription>История и предстоящие занятия</CardDescription>
              </CardHeader>
              <CardContent>
                {myBookings.length === 0 ? (
                  <p className="text-muted-foreground">У вас пока нет записей</p>
                ) : (
                  <div className="space-y-3">
                    {myBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getBookingStatusColor(booking.status)}>
                              {booking.status === 'completed' && 'Завершено'}
                              {booking.status === 'active' && 'Предстоит'}
                              {booking.status === 'canceled' && 'Отменено'}
                            </Badge>
                            <span className="font-medium">
                              {new Date(booking.slot.start_time).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.slot.start_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            {' - '}
                            {new Date(booking.slot.end_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {booking.status === 'active' && new Date(booking.slot.start_time) > new Date() && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            Отменить
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Пройдено часов
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_hours || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Прогресс
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.completed_lessons || 0} / {stats?.total_lessons || 10}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {((stats?.completed_lessons || 0) / (stats?.total_lessons || 10) * 100).toFixed(0)}% завершено
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Доп. занятия
                  </CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.additional_lessons || 0}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Прогресс обучения</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="w-64 h-64">
                  <Doughnut
                    data={progressData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;