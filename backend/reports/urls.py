from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'reports', views.TaskReportViewSet, basename='taskreport')

urlpatterns = [
    path('', include(router.urls)),
]
