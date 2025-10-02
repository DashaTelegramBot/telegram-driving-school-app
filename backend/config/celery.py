import os
from celery import Celery

# Устанавливаем настройки Django по умолчанию
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Создаем экземпляр Celery
app = Celery('config')

# Загружаем настройки из settings.py с префиксом CELERY_
app.config_from_object('django.conf:settings', namespace='CELERY')

app.conf.result_backend = 'django-db'

# Автоматически находим задачи (tasks.py) во всех приложениях Django
app.autodiscover_tasks()

# Простая задача для тестирования
@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')