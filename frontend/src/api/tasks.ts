import api from './auth';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'created' | 'assigned' | 'ongoing' | 'completed';
  completion_percentage: number;
  created_by: number;
  assigned_to: number | null;
  created_by_name: string;
  assigned_to_name: string | null;
  created_at: string;
  updated_at: string;
  due_date: string | null;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  assigned_to?: number;
  due_date?: string;
}

export interface DashboardStats {
  total: number;
  created: number;
  assigned: number;
  ongoing: number;
  completed: number;
  my_tasks?: number;
}

export const tasksAPI = {
  getTasks: async (filters?: { status?: string; assigned_to?: number }): Promise<Task[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assigned_to) params.append('assigned_to', filters.assigned_to.toString());
    
    const response = await api.get(`/tasks/tasks/?${params.toString()}`);
    return response.data.results || response.data;
  },

  getTask: async (id: number): Promise<Task> => {
    const response = await api.get(`/tasks/tasks/${id}/`);
    return response.data;
  },

  createTask: async (data: CreateTaskData): Promise<Task> => {
    const response = await api.post('/tasks/tasks/', data);
    return response.data;
  },

  updateTask: async (id: number, data: Partial<CreateTaskData>): Promise<Task> => {
    const response = await api.patch(`/tasks/tasks/${id}/`, data);
    return response.data;
  },

  updateTaskStatus: async (id: number, status: string): Promise<Task> => {
    const response = await api.patch(`/tasks/tasks/${id}/update_status/`, { status });
    return response.data;
  },

  updateCompletionPercentage: async (id: number, completion_percentage: number): Promise<Task> => {
    const response = await api.patch(`/tasks/tasks/${id}/update_completion_percentage/`, { completion_percentage });
    return response.data;
  },

  deleteTask: async (id: number): Promise<void> => {
    await api.delete(`/tasks/tasks/${id}/`);
  },

  getMyTasks: async (): Promise<Task[]> => {
    const response = await api.get('/tasks/tasks/my_tasks/');
    return response.data.results || response.data;
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/tasks/tasks/dashboard_stats/');
    return response.data;
  },
};
