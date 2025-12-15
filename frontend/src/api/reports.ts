import api from './auth';

export interface TaskReportData {
  task: number;
  content: string;
}

export interface TaskReport {
  id: number;
  task: number;
  reported_by: number;
  reported_by_name: string;
  reported_by_username: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const reportsAPI = {
  createReport: async (data: TaskReportData): Promise<TaskReport> => {
    const response = await api.post('/reports/reports/', data);
    return response.data;
  },

  getTaskReports: async (taskId: number): Promise<TaskReport[]> => {
    const response = await api.get(`/reports/reports/task_reports/?task_id=${taskId}`);
    return response.data;
  },

  getMyReports: async (): Promise<TaskReport[]> => {
    const response = await api.get('/reports/reports/my_reports/');
    return response.data;
  },

  getAllReports: async (): Promise<TaskReport[]> => {
    const response = await api.get('/reports/reports/');
    return response.data;
  },

  getEmployeeReports: async (employeeId?: number): Promise<TaskReport[]> => {
    const params = employeeId ? `?employee_id=${employeeId}` : '';
    const response = await api.get(`/reports/reports/employee_reports/${params}`);
    return response.data;
  },

  getManagerDashboardReports: async (): Promise<TaskReport[]> => {
    const response = await api.get('/reports/reports/manager_dashboard/');
    return response.data;
  },
};
