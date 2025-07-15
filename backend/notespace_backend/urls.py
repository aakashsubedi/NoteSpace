from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from notes.views import UserViewSet, NoteViewSet
from django.db import connection
from django.http import JsonResponse

def health_check(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1;")
            db_ok = cursor.fetchone()[0] == 1
    except Exception as e:
        return JsonResponse({"status": "error", "db": False, "error": str(e)}, status=500)
    return JsonResponse({"status": "ok", "db": db_ok})

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'notes', NoteViewSet, basename='note')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('health/', health_check, name='health_check'),
    path('', health_check, name='root_health_check'),
]
