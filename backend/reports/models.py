from django.db import models
from django.conf import settings

class TaskReport(models.Model):
    task = models.ForeignKey('tasks.Task', on_delete=models.CASCADE, related_name='reports')
    reported_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Report for {self.task.title} by {self.reported_by.username}"
