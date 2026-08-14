from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    RegisterView,
    LoginView,
    ProfileView,
    EquipmentViewSet,
    BookingViewSet,
    DashboardStatsView,
)

router = DefaultRouter()
router.register(r'equipment', EquipmentViewSet, basename='equipment')
router.register(r'bookings', BookingViewSet, basename='booking')

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', LoginView.as_view(), name='auth_login'),
    path('auth/profile/', ProfileView.as_view(), name='auth_profile'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('', include(router.urls)),
]
