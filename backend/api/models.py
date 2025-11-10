from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = [
        ('student', 'Ученик'),
        ('instructor', 'Инструктор'),
        ('admin', 'Администратор'),
    ]
    
    phone = models.CharField(max_length=20, unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    telegram_id = models.BigIntegerField(null=True, blank=True)
    instructor = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.role})"

class Slot(models.Model):
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='slots')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_available = models.BooleanField(default=True)
    student = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')
    
    class Meta:
        ordering = ['start_time']

class Booking(models.Model):
    STATUS_CHOICES = [
        ('active', 'Активна'),
        ('completed', 'Завершена'),
        ('canceled', 'Отменена'),
    ]
    
    slot = models.ForeignKey(Slot, on_delete=models.CASCADE)
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

class Review(models.Model):
    DURATION_CHOICES = [
        ('short', 'Короткий (1-2 часа)'),
        ('long', 'Длительный (3+ часа)'),
    ]
    
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField()
    duration = models.CharField(max_length=10, choices=DURATION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

class StudentStats(models.Model):
    student = models.OneToOneField(User, on_delete=models.CASCADE)
    total_hours = models.FloatField(default=0)
    completed_lessons = models.IntegerField(default=0)
    total_lessons = models.IntegerField(default=10)
    additional_lessons = models.IntegerField(default=0)
    
    @property
    def progress_percentage(self):
        return min(100, (self.completed_lessons / self.total_lessons) * 100) if self.total_lessons > 0 else 0

# Create your models here.
