from django.utils.deprecation import MiddlewareMixin
from django.http import HttpResponse

class CorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Telegram-Init-Data"
        response["Access-Control-Allow-Credentials"] = "true"
        
        return response

class DisableCSRF:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        setattr(request, '_dont_enforce_csrf_checks', True)
        return self.get_response(request)

class FaviconMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        
        # Кэшируем favicon на 24 часа
        if request.path == '/favicon.ico':
            return HttpResponse(status=204)
        return self.get_response(request)
            
        return response