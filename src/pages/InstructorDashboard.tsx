import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { instructorAPI, slotsAPI, User, Booking, Slot } from '@/lib/api';
import { toast } from 'sonner';
import { Calendar, Users, Clock, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const InstructorDashboard = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [schedule, setSchedule] = useState<Booking[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [newSlot, setNewSlot] = useState({ start_time: '', end_time: '' });
  const [bulkSlots, setBulkSlots] = useState({
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    days: [] as number[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsRes, scheduleRes, slotsRes] = await Promise.all([
        instructorAPI.getStudents(),
        instructorAPI.getSchedule(),
        slotsAPI.getAll(),
      ]);
      setStudents(studentsRes.data);
      setSchedule(scheduleRes.data);
      setSlots(slotsRes.data);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  };

  const handleCreateSlot = async () => {
    try {
      await slotsAPI.create(newSlot);
      toast.success('Слот создан');
      setNewSlot({ start_time: '', end_time: '' });
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка создания слота');
    }
  };

  const handleBulkCreateSlots = async () => {
    try {
      const timeSlots = [{
        start: bulkSlots.start_time,
        end: bulkSlots.end_time,
      }];

      await slotsAPI.bulkCreate({
        start_date: bulkSlots.start_date,
        end_date: bulkSlots.end_date,
        time_slots: timeSlots,
        days: bulkSlots.days,
      });

      toast.success('Слоты созданы по шаблону');
      setBulkSlots({
        start_date: '',
        end_date: '',
        start_time: '',
        end_time: '',
        days: [],
      });
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка создания слотов');
    }
  };

  const handleDeleteSlot = async (slotId: number) => {
    try {
      await slotsAPI.delete(slotId);
      toast.success('Слот удален');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка удаления слота');
    }
  };

  const toggleDay = (day: number) => {
    setBulkSlots(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const daysOfWeek = [
    { value: 0, label: 'Пн' },
    { value: 1, label: 'Вт' },
    { value: 2, label: 'Ср' },
    { value: 3, label: 'Чт' },
    { value: 4, label: 'Пт' },
    { value: 5, label: 'Сб' },
    { value: 6, label: 'Вс' },
  ];

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Личный кабинет инструктора</h1>

        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="schedule">Расписание</TabsTrigger>
            <TabsTrigger value="slots">Слоты</TabsTrigger>
            <TabsTrigger value="students">Ученики</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Мое расписание
                </CardTitle>
                <CardDescription>Ваши предстоящие и прошедшие занятия</CardDescription>
              </CardHeader>
              <CardContent>
                {schedule.length === 0 ? (
                  <p className="text-muted-foreground">Нет записей</p>
                ) : (
                  <div className="space-y-3">
                    {schedule.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={booking.status === 'completed' ? 'secondary' : 'default'}>
                              {booking.status === 'completed' && 'Завершено'}
                              {booking.status === 'active' && 'Активно'}
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
                          {booking.slot.student_name && (
                            <p className="text-sm">Ученик: {booking.slot.student_name}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="slots" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Добавить слот
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Начало</Label>
                    <Input
                      id="start_time"
                      type="datetime-local"
                      value={newSlot.start_time}
                      onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time">Конец</Label>
                    <Input
                      id="end_time"
                      type="datetime-local"
                      value={newSlot.end_time}
                      onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleCreateSlot} className="w-full">
                    Создать слот
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Создать по шаблону</CardTitle>
                  <CardDescription>Массовое создание слотов</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Начало периода</Label>
                      <Input
                        type="date"
                        value={bulkSlots.start_date}
                        onChange={(e) => setBulkSlots({ ...bulkSlots, start_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Конец периода</Label>
                      <Input
                        type="date"
                        value={bulkSlots.end_date}
                        onChange={(e) => setBulkSlots({ ...bulkSlots, end_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Время начала</Label>
                      <Input
                        type="time"
                        value={bulkSlots.start_time}
                        onChange={(e) => setBulkSlots({ ...bulkSlots, start_time: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Время конца</Label>
                      <Input
                        type="time"
                        value={bulkSlots.end_time}
                        onChange={(e) => setBulkSlots({ ...bulkSlots, end_time: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Дни недели</Label>
                    <div className="flex gap-2 flex-wrap">
                      {daysOfWeek.map((day) => (
                        <Button
                          key={day.value}
                          variant={bulkSlots.days.includes(day.value) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleDay(day.value)}
                        >
                          {day.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleBulkCreateSlots} className="w-full">
                    Создать по шаблону
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Мои слоты</CardTitle>
              </CardHeader>
              <CardContent>
                {slots.length === 0 ? (
                  <p className="text-muted-foreground">Нет слотов</p>
                ) : (
                  <div className="space-y-2">
                    {slots.map((slot) => (
                      <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(slot.start_time).toLocaleString('ru-RU')}
                            {' - '}
                            {new Date(slot.end_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {!slot.is_available && (
                            <Badge variant="secondary">Занят</Badge>
                          )}
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteSlot(slot.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Мои ученики
                </CardTitle>
                <CardDescription>Список ваших учеников</CardDescription>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <p className="text-muted-foreground">Нет учеников</p>
                ) : (
                  <div className="space-y-3">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">
                            {student.first_name} {student.last_name}
                          </p>
                          {student.phone && (
                            <p className="text-sm text-muted-foreground">{student.phone}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InstructorDashboard;