from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from .models import Equipment, Booking

User = get_user_model()


# ── User Serializers ──────────────────────────────────────────────────────────

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'department')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'role', 'department')

    def validate_role(self, value):
        allowed = ['student', 'faculty', 'admin']
        if value not in allowed:
            raise serializers.ValidationError(
                f"Role must be one of: {', '.join(allowed)}"
            )
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role=validated_data.get('role', 'student'),
            department=validated_data.get('department', ''),
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(
            username=data['username'],
            password=data['password'],
        )
        if not user:
            raise serializers.ValidationError('Invalid credentials')
        if not user.is_active:
            raise serializers.ValidationError('Account is disabled')
        data['user'] = user
        return data


# ── Equipment Serializer ───────────────────────────────────────────────────────

class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipment
        fields = '__all__'


# ── Booking Serializers ────────────────────────────────────────────────────────

class BookingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    equipment_details = EquipmentSerializer(source='equipment', read_only=True)
    approved_by_details = UserSerializer(source='approved_by', read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ('status', 'user', 'approved_by', 'created_at', 'updated_at')

    def validate(self, data):
        start = data.get('start_time')
        end = data.get('end_time')
        if start and end and start >= end:
            raise serializers.ValidationError(
                {'end_time': 'End time must be after start time.'}
            )
        return data


class BookingCreateSerializer(serializers.ModelSerializer):
    """Serializer used only for creating bookings — strips read-only nested fields."""

    class Meta:
        model = Booking
        fields = ('equipment', 'start_time', 'end_time', 'purpose')

    def validate(self, data):
        start = data.get('start_time')
        end = data.get('end_time')
        if start and end and start >= end:
            raise serializers.ValidationError(
                {'end_time': 'End time must be after start time.'}
            )
        return data
