from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import TaskReport
from .serializers import TaskReportSerializer

class TaskReportViewSet(viewsets.ModelViewSet):
    queryset = TaskReport.objects.all()
    serializer_class = TaskReportSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['task', 'reported_by']

    def get_queryset(self):
        user = self.request.user
        if user.is_manager:
            return TaskReport.objects.all()
        else:
            return TaskReport.objects.filter(reported_by=user)

    def perform_create(self, serializer):
        task = serializer.validated_data['task']
        
        # Check if user can submit report for this task
        if task.assigned_to != self.request.user and not self.request.user.is_manager:
            raise serializers.ValidationError("You can only submit reports for tasks assigned to you.")
        
        serializer.save(reported_by=self.request.user)

    @action(detail=False, methods=['get'])
    def my_reports(self, request):
        """Get reports submitted by the current user"""
        reports = TaskReport.objects.filter(reported_by=request.user)
        serializer = self.get_serializer(reports, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def task_reports(self, request):
        """Get reports for a specific task"""
        task_id = request.query_params.get('task_id')
        if not task_id:
            return Response(
                {'error': 'task_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reports = TaskReport.objects.filter(task_id=task_id)
        serializer = self.get_serializer(reports, many=True)
        return Response(serializer.data)
