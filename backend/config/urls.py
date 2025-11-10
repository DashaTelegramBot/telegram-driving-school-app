"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.views.decorators.cache import cache_control  # Добавьте эту строку
from django.views.static import serve  # Добавьте эту строку
from api.views import health_check

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),  
    path('health/', health_check, name='health'),
    path('favicon.ico', cache_control(max_age=86400)(serve), {'path': 'app/favicon.ico'}),
    re_path(r'^(?!api/|admin/|health/).*$', TemplateView.as_view(template_name='index.html')),
]
