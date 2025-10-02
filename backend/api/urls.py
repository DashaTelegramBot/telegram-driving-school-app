from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()

urlpatterns = [
    # Auth endpoints
    path('auth/login/', views.login, name='login'),
    path('auth/me/', views.get_me, name='get_me'),

    path('', include(router.urls)),
    path('auth/', include('authentication.urls')),
    
    # Slots endpoints
    path('slots/', views.get_slots, name='get_slots'),
    path('slots/bulk-create/', views.bulk_create_slots, name='bulk_create_slots'),
    path('slots/<int:slot_id>/', views.delete_slot, name='delete_slot'),
    
    # Bookings endpoints
    path('bookings/my-schedule/', views.get_student_schedule, name='get_student_schedule'),
    path('bookings/book/', views.book_slot, name='book_slot'),
    path('bookings/<int:booking_id>/cancel/', views.cancel_booking, name='cancel_booking'),
    
    # Students endpoints
    path('students/stats/', views.get_student_stats, name='get_student_stats'),
    path('students/instructors/', views.get_instructors, name='get_instructors'),
    
    # Reviews endpoints
    path('reviews/', views.create_review, name='create_review'),
    
    # Instructor endpoints
    path('instructor/students/', views.get_instructor_students, name='get_instructor_students'),
    path('instructor/schedule/', views.get_instructor_schedule, name='get_instructor_schedule'),
    path('instructor/students/<int:student_id>/stats/', views.update_student_stats, name='update_student_stats'),
]