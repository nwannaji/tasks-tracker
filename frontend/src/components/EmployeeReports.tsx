import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { TaskReport } from '../api/reports';
import type { Task } from '../api/tasks';
import { reportsAPI } from '../api/reports';
import { tasksAPI } from '../api/tasks';
import {
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowPathIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

interface EmployeeReportsProps {
  onTaskSelect?: (task: Task) => void;
}

const EmployeeReports: React.FC<EmployeeReportsProps> = React.memo(({ onTaskSelect }) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<TaskReport[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<{id: number, name: string}[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const loadData = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const [reportsData, tasksData] = await Promise.all([
        selectedEmployee || selectedTask 
          ? selectedEmployee 
            ? reportsAPI.getEmployeeReports(selectedEmployee)
            : reportsAPI.getTaskReports(selectedTask!)
          : reportsAPI.getManagerDashboardReports(),
        tasksAPI.getTasks(),
      ]);

      setReports(reportsData);
      setTasks(tasksData);

      // Extract unique employees from reports - memoized
      const uniqueEmployees = Array.from(
        new Map(
          reportsData.map(report => [
            report.reported_by,
            { id: report.reported_by, name: report.reported_by_name }
          ])
        ).values()
      );
      setEmployees(uniqueEmployees);

    } catch (error) {
      console.error('Error loading employee reports:', error);
      setError('Failed to load employee reports. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedEmployee, selectedTask]);

  useEffect(() => {
    if (user?.is_manager) {
      loadData();
    }
  }, [user, loadData]);

  const filteredReports = useMemo(() => {
    let filtered = reports;
    
    if (selectedEmployee) {
      filtered = filtered.filter(report => report.reported_by === selectedEmployee);
    }
    
    if (selectedTask) {
      filtered = filtered.filter(report => report.task === selectedTask);
    }
    
    return filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [reports, selectedEmployee, selectedTask]);

  const taskTitleMap = useMemo(() => {
    const map = new Map<number, string>();
    tasks.forEach(task => {
      map.set(task.id, task.title);
    });
    return map;
  }, [tasks]);

  const getTaskTitle = useCallback((taskId: number) => {
    return taskTitleMap.get(taskId) || `Task #${taskId}`;
  }, [taskTitleMap]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedEmployee(null);
    setSelectedTask(null);
  }, []);

  if (!user?.is_manager) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading employee reports...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <DocumentTextIcon className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Reports</h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => loadData()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <DocumentTextIcon className="h-5 w-5 text-indigo-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Employee Reports</h2>
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {filteredReports.length} reports
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <FunnelIcon className="h-4 w-4 mr-1" />
              Filters
              <ChevronDownIcon className={`h-4 w-4 ml-1 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Employee
                </label>
                <select
                  value={selectedEmployee || ''}
                  onChange={(e) => setSelectedEmployee(e.target.value ? Number(e.target.value) : null)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="">All Employees</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Task
                </label>
                <select
                  value={selectedTask || ''}
                  onChange={(e) => setSelectedTask(e.target.value ? Number(e.target.value) : null)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="">All Tasks</option>
                  {tasks.map(task => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {(selectedEmployee || selectedTask) && (
              <div className="mt-3">
                <button
                  onClick={clearFilters}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reports List */}
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {filteredReports.length === 0 ? (
          <div className="p-6 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedEmployee || selectedTask 
                ? 'Try adjusting your filters to see more results.'
                : 'Employee reports will appear here once submitted.'}
            </p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div key={report.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {report.reported_by_name}
                    </span>
                    <span className="mx-2 text-gray-300">•</span>
                    <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500">
                      {formatDate(report.created_at)}
                    </span>
                  </div>
                  <div className="mb-2">
                    <button
                      onClick={() => {
                        const task = tasks.find(t => t.id === report.task);
                        if (task && onTaskSelect) {
                          onTaskSelect(task);
                        }
                      }}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      {getTaskTitle(report.task)}
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {report.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

EmployeeReports.displayName = 'EmployeeReports';

export default EmployeeReports;
