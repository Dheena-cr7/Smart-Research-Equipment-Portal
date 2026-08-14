from django.contrib import admin
from django.contrib.auth import get_user_model
from .models import Equipment, Booking

User = get_user_model()


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'department', 'is_active', 'date_joined')
    list_filter = ('role', 'is_active')
    search_fields = ('username', 'email', 'department')
    ordering = ('-date_joined',)


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'lab', 'department', 'status', 'requires_approval')
    list_filter = ('status', 'department', 'requires_approval')
    search_fields = ('name', 'lab', 'department')
    ordering = ('name',)


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('user', 'equipment', 'start_time', 'end_time', 'status', 'approved_by', 'created_at')
    list_filter = ('status', 'equipment__department')
    search_fields = ('user__username', 'equipment__name', 'purpose')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
