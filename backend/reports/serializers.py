from rest_framework import serializers
from .models import TaskReport

class TaskReportSerializer(serializers.ModelSerializer):
    reported_by_name = serializers.CharField(source='reported_by.get_full_name', read_only=True)
    reported_by_username = serializers.CharField(source='reported_by.username', read_only=True)

    class Meta:
        model = TaskReport
        fields = ['id', 'task', 'reported_by', 'reported_by_name', 'reported_by_username', 'content', 'created_at', 'updated_at']
        read_only_fields = ['reported_by', 'created_at', 'updated_at']
