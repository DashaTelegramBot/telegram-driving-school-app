from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.contrib.auth import authenticate
from .models import User, StudentStats, Slot, Booking
import jwt
from datetime import datetime, timedelta
from django.conf import settings

JWT_SECRET = settings.SECRET_KEY

def generate_token(user):
    payload = {
        'user_id': user.id,
        'phone': user.phone,
        'role': user.role,
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

# 🔥 ИСПРАВЛЕНО: Упрощенная обработка OPTIONS
def handle_options_request():
    response = HttpResponse()
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Telegram-Init-Data"
    response["Access-Control-Max-Age"] = "86400"
    return response

@csrf_exempt
def login(request):
    # 🔥 ИСПРАВЛЕНО: Убрал @require_http_methods и добавил явную проверку методов
    if request.method == "OPTIONS":
        return handle_options_request()
    
    if request.method != "POST":
        response = JsonResponse({'error': 'Method not allowed'}, status=405)
        response["Access-Control-Allow-Origin"] = "*"
        return response
    
    try:
        print(f"📨 Login request received: {request.method} {request.path}")
        print(f"Content-Type: {request.content_type}")
        
        # Парсим JSON данные
        if request.content_type == 'application/json':
            try:
                data = json.loads(request.body.decode('utf-8'))
            except json.JSONDecodeError as e:
                print(f"❌ JSON decode error: {e}")
                response = JsonResponse({'error': 'Invalid JSON'}, status=400)
                response["Access-Control-Allow-Origin"] = "*"
                return response
        else:
            response = JsonResponse({'error': 'Content-Type must be application/json'}, status=400)
            response["Access-Control-Allow-Origin"] = "*"
            return response
        
        print(f"📋 Parsed data: {data}")
        
        phone = data.get('phone')
        password = data.get('password')
        role = data.get('role')
        
        if not phone or not password:
            response = JsonResponse({'error': 'Phone and password are required'}, status=400)
            response["Access-Control-Allow-Origin"] = "*"
            return response
        
        print(f"🔐 Login attempt: phone={phone}, role={role}")
        
        # Создаем тестовых пользователей при первом запуске
        create_test_users()
        
        # Ищем пользователя по телефону
        try:
            user = User.objects.get(phone=phone)
            print(f"✅ Found user: {user.username}, role: {user.role}")
        except User.DoesNotExist:
            response = JsonResponse({'error': 'Пользователь не найден'}, status=401)
            response["Access-Control-Allow-Origin"] = "*"
            return response
        
        # Проверяем пароль
        if not user.check_password(password):
            response = JsonResponse({'error': 'Неверный пароль'}, status=401)
            response["Access-Control-Allow-Origin"] = "*"
            return response
        
        # Проверяем роль (если указана)
        if role and user.role != role:
            response = JsonResponse({'error': f'Неверная роль. Ваша роль: {user.role}'}, status=401)
            response["Access-Control-Allow-Origin"] = "*"
            return response
        
        # Генерируем токен
        token = generate_token(user)
        
        response_data = {
            'user': {
                'id': user.id,
                'telegram_id': user.telegram_id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone': user.phone,
                'role': user.role,
                'instructor_id': user.instructor.id if user.instructor else None,
            },
            'token': token
        }
        
        print(f"🎉 Login successful for user: {user.username}")
        response = JsonResponse(response_data)
        response["Access-Control-Allow-Origin"] = "*"
        return response
        
    except Exception as e:
        print(f"💥 Login error: {str(e)}")
        import traceback
        print(f"📜 Traceback: {traceback.format_exc()}")
        response = JsonResponse({'error': 'Ошибка сервера'}, status=500)
        response["Access-Control-Allow-Origin"] = "*"
        return response

@csrf_exempt
def get_me(request):
    # 🔥 ИСПРАВЛЕНО: Убрал @require_http_methods
    if request.method == "OPTIONS":
        return handle_options_request()
    
    if request.method != "GET":
        response = JsonResponse({'error': 'Method not allowed'}, status=405)
        response["Access-Control-Allow-Origin"] = "*"
        return response
    
    try:
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            response = JsonResponse({'error': 'Token required'}, status=401)
            response["Access-Control-Allow-Origin"] = "*"
            return response
        
        token = auth_header.split(' ')[1]
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        
        user = User.objects.get(id=payload['user_id'])
        
        response = JsonResponse({
            'id': user.id,
            'telegram_id': user.telegram_id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone': user.phone,
            'role': user.role,
            'instructor_id': user.instructor.id if user.instructor else None,
        })
        response["Access-Control-Allow-Origin"] = "*"
        return response
        
    except jwt.ExpiredSignatureError:
        response = JsonResponse({'error': 'Token expired'}, status=401)
        response["Access-Control-Allow-Origin"] = "*"
        return response
    except jwt.InvalidTokenError:
        response = JsonResponse({'error': 'Invalid token'}, status=401)
        response["Access-Control-Allow-Origin"] = "*"
        return response
    except User.DoesNotExist:
        response = JsonResponse({'error': 'User not found'}, status=404)
        response["Access-Control-Allow-Origin"] = "*"
        return response
    except Exception as e:
        response = JsonResponse({'error': str(e)}, status=500)
        response["Access-Control-Allow-Origin"] = "*"
        return response

def create_test_users():
    """Создает тестовых пользователей при первом запуске"""
    if not User.objects.filter(role='admin').exists():
        admin = User.objects.create_user(
            username='admin',
            phone='79999999999',
            password='admin123',
            first_name='Администратор',
            role='admin'
        )
        print("Created admin user")
    
    if not User.objects.filter(role='instructor').exists():
        instructor = User.objects.create_user(
            username='instructor1',
            phone='79998887766',
            password='instructor123',
            first_name='Иван',
            last_name='Инструкторов',
            role='instructor'
        )
        print("Created instructor user")
    
    if not User.objects.filter(role='student').exists():
        instructor = User.objects.get(role='instructor')
        student = User.objects.create_user(
            username='student1',
            phone='79997776655',
            password='student123',
            first_name='Петр',
            last_name='Учеников',
            role='student',
            instructor=instructor
        )
        
        # Создаем статистику для студента
        StudentStats.objects.create(
            student=student,
            total_hours=5.5,
            completed_lessons=3,
            total_lessons=10,
            additional_lessons=1
        )
        print("Created student user")

# Health check endpoint
def health_check(request):
    # 🔥 ИСПРАВЛЕНО: Убрал @require_http_methods
    if request.method == "OPTIONS":
        return handle_options_request()
    
    if request.method != "GET":
        response = JsonResponse({'error': 'Method not allowed'}, status=405)
        response["Access-Control-Allow-Origin"] = "*"
        return response
    
    return JsonResponse({
        'status': 'OK',
        'service': 'Django API',
        'timestamp': datetime.now().isoformat()
    })

# 🔥 ИСПРАВЛЕНО: Все остальные функции также обновлены
@csrf_exempt
def get_slots(request):
    if request.method == "OPTIONS":
        return handle_options_request()
    
    if request.method != "GET":
        response = JsonResponse({'error': 'Method not allowed'}, status=405)
        response["Access-Control-Allow-Origin"] = "*"
        return response
    
    try:
        slots = Slot.objects.filter(is_available=True)
        slots_data = []
        for slot in slots:
            slots_data.append({
                'id': slot.id,
                'instructor': slot.instructor.id,
                'instructor_name': f"{slot.instructor.first_name} {slot.instructor.last_name}",
                'start_time': slot.start_time.isoformat(),
                'end_time': slot.end_time.isoformat(),
                'is_available': slot.is_available,
            })
        return JsonResponse(slots_data, safe=False)
    except Exception as e:
        print(f"Error getting slots: {e}")
        return JsonResponse([], safe=False)

@csrf_exempt
def create_slot(request):
    if request.method == "OPTIONS":
        return handle_options_request()
    
    if request.method != "POST":
        response = JsonResponse({'error': 'Method not allowed'}, status=405)
        response["Access-Control-Allow-Origin"] = "*"
        return response
    
    return JsonResponse({'message': 'Slot created'})

@csrf_exempt
def bulk_create_slots(request):
    if request.method == "OPTIONS":
        return handle_options_request()
    
    if request.method != "POST":
        response = JsonResponse({'error': 'Method not allowed'}, status=405)
        response["Access-Control-Allow-Origin"] = "*"
        return response
    
    return JsonResponse({'message': 'Slots created'})

@csrf_exempt
def delete_slot(request, slot_id):
    if request.method == "OPTIONS":
        return handle_options_request()
    
    if request.method != "DELETE":
        response = JsonResponse({'error': 'Method not allowed'}, status=405)
        response["Access-Control-Allow-Origin"] = "*"
        return response
    
    return JsonResponse({'message': 'Slot deleted'})

@csrf_exempt
def get_student_schedule(request):
    if request.method == "OPTIONS":
        return handle_options_request()
    
    if request.method != "GET":
        response = JsonResponse({'error': 'Method not allowed'}, status=405)
        response["Access-Control-Allow-Origin"] = "*"
        return response
    
    try:
        # Получаем пользователя
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token required'}, status=401)
        
        token = auth_header.split(' ')[1]
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        user = User.objects.get(id=payload['user_id'])
        
        # Получаем бронирования пользователя
        bookings = Booking.objects.filter(student=user)
        bookings_data = []
        for booking in bookings:
            bookings_data.append({
                'id': booking.id,
                'slot': {
                    'id': booking.slot.id,
                    'start_time': booking.slot.start_time.isoformat(),
                    'end_time': booking.slot.end_time.isoformat(),
                },
                'status': booking.status,
                'created_at': booking.created_at.isoformat(),
            })
        
        return JsonResponse(bookings_data, safe=False)
    except Exception as e:
        print(f"Error getting student schedule: {e}")
        return JsonResponse([], safe=False)

@csrf_exempt
def book_slot(request):
    if request.method == "OPTIONS":
        return handle_options_request()
    
    if request.method != "POST":
        response = JsonResponse({'error': 'Method not allowed'}, status=405)
        response["Access-Control-Allow-Origin"] = "*"
        return response
    
    return JsonResponse({'message': 'Slot booked'})

@csrf_exempt
def cancel_booking(request, booking_id):
    if request.method == "OPTIONS":
        return handle_options_request()
    
    if request.method != "POST":
        response = JsonResponse({'error': 'Method not allowed'}, status=405)
        response["Access-Control-Allow-Origin"] = "*"
        return response
    
    return JsonResponse({'message': 'Booking canceled'})

@csrf_exempt
def get_student_stats(request):
    if request.method == "OPTIONS":
        return handle_options_request()
    
    if request.method != "GET":
        response = JsonResponse({'error': 'Method not allowed'}, status=405)
        response["Access-Control-Allow-Origin"] = "*"
        return response
    
    try:
        # Получаем пользователя из токена
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token required'}, status=401)
        
        token = auth_header.split(' ')[1]
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        user = User.objects.get(id=payload['user_id'])
        
        # Получаем или создаем статистику
        stats, created = StudentStats.objects.get_or_create(student=user)
        
        return JsonResponse({
            'total_hours': stats.total_hours,
            'completed_lessons': stats.completed_lessons,
            'total_lessons': stats.total_lessons,
            'additional_lessons': stats.additional_lessons,
            'progress_percentage': stats.progress_percentage,
        })
        
    except Exception as e:
        print(f"Error getting student stats: {e}")
        return JsonResponse({
            'total_hours': 0,
            'completed_lessons': 0,
            'total_lessons': 10,
            'additional_lessons': 0,
            'progress_percentage': 0,
        })

@csrf_exempt
def get_instructors(request):
    if request.method == "OPTIONS":
        return handle_options_request()
    
    if request.method != "GET":
        response = JsonResponse({'error': 'Method not allowed'}, status=405)
        response["Access-Control-Allow-Origin"] = "*"
        return response
    
    return JsonResponse({'instructors': []})

@csrf_exempt
def create_review(request):
    if request.method == "OPTIONS":
        return handle_options_request()
    
    if request.method != "POST":
        response = JsonResponse({'error': 'Method not allowed'}, status=405)
        response["Access-Control-Allow-Origin"] = "*"
        return response
    
    return JsonResponse({'message': 'Review created'})

@csrf_exempt
def get_instructor_students(request):
    if request.method == "OPTIONS":
        return handle_options_request()
    
    if request.method != "GET":
        response = JsonResponse({'error': 'Method not allowed'}, status=405)
        response["Access-Control-Allow-Origin"] = "*"
        return response
    
    return JsonResponse({'students': []})

@csrf_exempt
def get_instructor_schedule(request):
    if request.method == "OPTIONS":
        return handle_options_request()
    
    if request.method != "GET":
        response = JsonResponse({'error': 'Method not allowed'}, status=405)
        response["Access-Control-Allow-Origin"] = "*"
        return response
    
    return JsonResponse({'schedule': []})

@csrf_exempt
def update_student_stats(request, student_id):
    if request.method == "OPTIONS":
        return handle_options_request()
    
    if request.method != "PATCH":
        response = JsonResponse({'error': 'Method not allowed'}, status=405)
        response["Access-Control-Allow-Origin"] = "*"
        return response
    
    return JsonResponse({'message': 'Stats updated'})
