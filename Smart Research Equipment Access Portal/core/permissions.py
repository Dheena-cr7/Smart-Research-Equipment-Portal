from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """Object-level permission: only the owner of a booking can access it."""
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class IsAdminUser(permissions.BasePermission):
    """Custom admin check using our role field (not Django's is_staff)."""
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'admin'
        )


class IsFacultyOrAdmin(permissions.BasePermission):
    """Faculty or Admin role required."""
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in ['faculty', 'admin']
        )
