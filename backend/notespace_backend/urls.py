from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from notes.views import UserViewSet, NoteViewSet
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({"status": "healthy"})

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'notes', NoteViewSet, basename='note')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', health_check, name='health_check'),
]
