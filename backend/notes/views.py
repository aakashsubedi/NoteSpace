from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from .models import Note
from .serializers import NoteSerializer, UserSerializer
import logging

logger = logging.getLogger(__name__)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['get'])
    def me(self, request):
        if request.user.is_authenticated:
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        return Response(status=status.HTTP_401_UNAUTHORIZED)

    def create(self, request, *args, **kwargs):
        logger.info(f"User create request: method={request.method}, path={request.path}, data={request.data}")
        return super().create(request, *args, **kwargs)

class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        try:
            logger.info(f"Creating note for user {self.request.user.id}")
            serializer.save(user=self.request.user)
        except Exception as e:
            logger.error(f"Error creating note: {str(e)}")
            raise

    def create(self, request, *args, **kwargs):
        logger.info(f"Note create request: user={request.user}, method={request.method}, path={request.path}, data={request.data}")
        try:
            logger.info(f"Create note request received: {request.data}")
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error in create note: {str(e)}")
            return Response(
                {"detail": f"Error creating note: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_update(self, serializer):
        try:
            logger.info(f"Updating note for user {self.request.user.id}")
            serializer.save(user=self.request.user)
        except Exception as e:
            logger.error(f"Error updating note: {str(e)}")
            raise

    def update(self, request, *args, **kwargs):
        logger.info(f"Note update request: user={request.user}, method={request.method}, path={request.path}, data={request.data}")
        return super().update(request, *args, **kwargs)
