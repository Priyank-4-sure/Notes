from django.urls import path
from . import views

urlpatterns = [
    # Example endpoint for test
    path('test/', views.test_view),
]
