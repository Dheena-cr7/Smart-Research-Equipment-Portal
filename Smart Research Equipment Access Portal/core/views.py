from rest_framework import generics, viewsets, filters, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend

from .serializers import (
    RegisterSerializer,
    UserSerializer,
    LoginSerializer,
    EquipmentSerializer,
    BookingSerializer,
    BookingCreateSerializer,
)
from .models import Equipment, Booking
from .permissions import IsAdminUser, IsFacultyOrAdmin, IsOwner

User = get_user_model()


# ── Auth Views ─────────────────────────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ — open to all."""
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {
                'token': token.key,
                'user': UserSerializer(user).data,
                'role': user.role,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """POST /api/auth/login/ — returns DRF Token."""
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {
                'token': token.key,
                'user': UserSerializer(user).data,
                'role': user.role,
            }
        )


class ProfileView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/auth/profile/ — authenticated user's profile."""
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user


# ── Equipment ViewSet ──────────────────────────────────────────────────────────

class EquipmentViewSet(viewsets.ModelViewSet):
    """
    GET    /api/equipment/         — list all (public)
    GET    /api/equipment/:id/     — retrieve one (public)
    POST   /api/equipment/         — admin only
    PUT    /api/equipment/:id/     — admin only
    PATCH  /api/equipment/:id/     — admin only
    DELETE /api/equipment/:id/     — admin only
    """
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'lab', 'status', 'requires_approval']
    search_fields = ['name', 'lab', 'department', 'description']
    ordering_fields = ['name', 'status', 'department']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]


# ── Booking ViewSet ────────────────────────────────────────────────────────────

class BookingViewSet(viewsets.ModelViewSet):
    """
    GET    /api/bookings/               — own bookings (students), all (faculty/admin)
    POST   /api/bookings/               — authenticated users
    POST   /api/bookings/:id/approve/   — faculty/admin
    POST   /api/bookings/:id/reject/    — faculty/admin
    POST   /api/bookings/:id/cancel/    — booking owner
    """
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Booking.objects.select_related('user', 'equipment', 'approved_by')
        if user.role in ['faculty', 'admin']:
            # Faculty/Admin can filter by status for dashboard
            status_filter = self.request.query_params.get('status')
            if status_filter:
                qs = qs.filter(status=status_filter)
            return qs
        # Students only see their own bookings
        return qs.filter(user=user)

    def get_serializer_class(self):
        if self.action == 'create':
            return BookingCreateSerializer
        return BookingSerializer

    def perform_create(self, serializer):
        equipment = serializer.validated_data['equipment']
        start_time = serializer.validated_data['start_time']
        end_time = serializer.validated_data['end_time']

        # Conflict detection — only confirmed bookings block slots
        overlap = Booking.objects.filter(
            equipment=equipment,
            status='confirmed',
            start_time__lt=end_time,
            end_time__gt=start_time,
        ).exists()

        if overlap:
            from rest_framework.exceptions import ValidationError
            raise ValidationError(
                {'error': 'Slot already booked'},
                code='conflict',
            )

        booking_status = 'pending' if equipment.requires_approval else 'confirmed'
        serializer.save(user=self.request.user, status=booking_status)

    def create(self, request, *args, **kwargs):
        """Override to return 409 on conflict instead of 400."""
        from rest_framework.exceptions import ValidationError as DRFValidationError
        try:
            return super().create(request, *args, **kwargs)
        except DRFValidationError as exc:
            if 'error' in exc.detail and 'Slot already booked' in str(exc.detail):
                return Response(
                    {'error': 'Slot already booked'},
                    status=status.HTTP_409_CONFLICT,
                )
            raise

    @action(detail=True, methods=['post'], permission_classes=[IsFacultyOrAdmin])
    def approve(self, request, pk=None):
        """POST /api/bookings/:id/approve/ — faculty/admin approves a pending booking."""
        booking = self.get_object()
        if booking.status != 'pending':
            return Response(
                {'error': f'Cannot approve a booking with status "{booking.status}"'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        booking.status = 'confirmed'
        booking.approved_by = request.user
        booking.save()
        return Response(BookingSerializer(booking).data)

    @action(detail=True, methods=['post'], permission_classes=[IsFacultyOrAdmin])
    def reject(self, request, pk=None):
        """POST /api/bookings/:id/reject/ — faculty/admin rejects a pending booking."""
        booking = self.get_object()
        if booking.status != 'pending':
            return Response(
                {'error': f'Cannot reject a booking with status "{booking.status}"'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        booking.status = 'rejected'
        booking.approved_by = request.user
        booking.save()
        return Response(BookingSerializer(booking).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def cancel(self, request, pk=None):
        """POST /api/bookings/:id/cancel/ — booking owner cancels their booking."""
        booking = self.get_object()
        # Ownership check
        if booking.user != request.user and request.user.role not in ['faculty', 'admin']:
            return Response(
                {'error': 'You do not have permission to cancel this booking.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        if booking.status in ['cancelled', 'rejected']:
            return Response(
                {'error': f'Booking is already {booking.status}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        booking.status = 'cancelled'
        booking.save()
        return Response(BookingSerializer(booking).data)


# ── Dashboard Stats View ───────────────────────────────────────────────────────

class DashboardStatsView(APIView):
    """GET /api/dashboard/stats/ — faculty/admin dashboard metrics."""
    permission_classes = [IsFacultyOrAdmin]

    def get(self, request):
        total_equipment = Equipment.objects.count()
        available_now = Equipment.objects.filter(status='available').count()
        active_bookings = Booking.objects.filter(status='confirmed').count()
        pending_approvals = Booking.objects.filter(status='pending').count()
        in_maintenance = Equipment.objects.filter(status='maintenance').count()

        recent_bookings = Booking.objects.select_related(
            'user', 'equipment'
        ).order_by('-created_at')[:10]

        return Response({
            'total_equipment': total_equipment,
            'available_now': available_now,
            'active_bookings': active_bookings,
            'pending_approvals': pending_approvals,
            'in_maintenance': in_maintenance,
            'recent_bookings': BookingSerializer(recent_bookings, many=True).data,
        })
