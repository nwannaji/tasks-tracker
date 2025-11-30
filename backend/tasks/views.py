from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import serializers
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Task
from .serializers import TaskSerializer
from .permissions import IsManagerOrReadOnly

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsManagerOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'assigned_to', 'created_by']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_manager:
            return Task.objects.all()
        else:
            return Task.objects.filter(
                Q(assigned_to=user) | Q(created_by=user)
            )
    
    def perform_create(self, serializer):
        if not self.request.user.is_manager:
            raise serializers.ValidationError("Only managers can create tasks.")
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_status(self, request, pk=None):
        task = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status or new_status not in dict(Task.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if task.assigned_to != request.user and not request.user.is_manager:
            return Response(
                {'error': 'You can only update your assigned tasks'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        task.status = new_status
        task.save()
        serializer = self.get_serializer(task)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_completion_percentage(self, request, pk=None):
        task = self.get_object()
        completion_percentage = request.data.get('completion_percentage')
        
        if completion_percentage is None:
            return Response(
                {'error': 'Completion percentage is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            completion_percentage = int(completion_percentage)
            if not 0 <= completion_percentage <= 100:
                return Response(
                    {'error': 'Completion percentage must be between 0 and 100'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ValueError, TypeError):
            return Response(
                {'error': 'Completion percentage must be a valid number'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if task.assigned_to != request.user and not request.user.is_manager:
            return Response(
                {'error': 'You can only update your assigned tasks'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        task.completion_percentage = completion_percentage
        
        # Auto-update status based on completion percentage
        if completion_percentage == 100 and task.status != 'completed':
            task.status = 'completed'
        elif completion_percentage > 0 and task.status in ['created', 'assigned']:
            task.status = 'ongoing'
        
        task.save()
        serializer = self.get_serializer(task)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_tasks(self, request):
        tasks = Task.objects.filter(assigned_to=request.user)
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        user = request.user
        queryset = self.get_queryset()
        
        stats = {
            'total': queryset.count(),
            'created': queryset.filter(status='created').count(),
            'assigned': queryset.filter(status='assigned').count(),
            'ongoing': queryset.filter(status='ongoing').count(),
            'completed': queryset.filter(status='completed').count(),
        }
        
        if not user.is_manager:
            stats['my_tasks'] = queryset.filter(assigned_to=user).count()
        
        return Response(stats)
