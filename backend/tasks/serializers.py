from rest_framework import serializers
from .models import Task
from django.contrib.auth import get_user_model

User = get_user_model()

class TaskSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'status', 'completion_percentage', 'created_by', 'assigned_to',
            'created_by_name', 'assigned_to_name', 'created_at', 'updated_at', 'due_date'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
        
    def validate_assigned_to(self, value):
        if value and value.is_manager:
            raise serializers.ValidationError("Tasks can only be assigned to employees, not managers.")
        return value
    
    def validate_completion_percentage(self, value):
        if not 0 <= value <= 100:
            raise serializers.ValidationError("Completion percentage must be between 0 and 100.")
        return value

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']
