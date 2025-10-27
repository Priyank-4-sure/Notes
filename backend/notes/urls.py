from django.urls import path
from . import views
from .views import UserRegistrationView
from .views import ReactAppView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import NoteListCreate, NoteDetail

urlpatterns = [
    # Example endpoint for test
    path('', ReactAppView.as_view(), name='home'),
    path('test/', views.test_view),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('notes/', NoteListCreate.as_view(), name='notes-list-create'),
    path('notes/<int:pk>/', NoteDetail.as_view(), name='note-detail'),
    path('register/', UserRegistrationView.as_view(), name='register'),
]
