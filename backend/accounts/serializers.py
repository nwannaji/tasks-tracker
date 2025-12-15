from rest_framework import serializers
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError
from .models import User, PasswordResetToken

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 'role')
        
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_manager', 'created_at')
        read_only_fields = ('id', 'created_at', 'is_manager')


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
    
    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise ValidationError("No user found with this email address.")
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.UUIDField()
    new_password = serializers.CharField(min_length=8, write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise ValidationError("Passwords do not match.")
        return attrs
    
    def validate_token(self, value):
        try:
            token = PasswordResetToken.objects.get(token=value)
            if token.is_used or token.is_expired():
                raise ValidationError("Invalid or expired token.")
        except PasswordResetToken.DoesNotExist:
            raise ValidationError("Invalid token.")
        return value
