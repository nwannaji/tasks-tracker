from rest_framework import permissions

class IsManagerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # Only managers can create, update, or delete tasks
        return request.user.is_authenticated and request.user.is_manager
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Only managers can edit or delete tasks
        if request.user.is_manager:
            return True
            
        # Employees can only update status of tasks assigned to them
        return obj.assigned_to == request.user and request.method in ['PATCH'] and 'status' in request.data
