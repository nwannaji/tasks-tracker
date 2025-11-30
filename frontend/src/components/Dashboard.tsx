import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import type { Task, DashboardStats } from "../api/tasks";
import { tasksAPI } from "../api/tasks";
import {
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import TaskForm from "./TaskForm.tsx";
import TaskTable from "./TaskTable.tsx";
import EditTaskForm from "./EditTaskForm.tsx";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedStatus]);

  const loadData = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      const [statsData, tasksData] = await Promise.all([
        tasksAPI.getDashboardStats(),
        tasksAPI.getTasks(
          selectedStatus === "all" ? {} : { status: selectedStatus }
        ),
      ]);
      setStats(statsData);
      setTasks(tasksData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedStatus]);

  const retryLoad = () => {
    loadData();
  };

  const handleTaskCreated = () => {
    setShowTaskForm(false);
    loadData(true);
  };

  const handleTaskUpdated = () => {
    loadData(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const statusOptions = useMemo(() => [
    { value: "all", label: "All Tasks" },
    { value: "created", label: "Created" },
    { value: "assigned", label: "Assigned" },
    { value: "ongoing", label: "On-going" },
    { value: "completed", label: "Completed" },
  ], []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={retryLoad}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 sm:pt-16">
      <div className="py-4 sm:py-6 bg-linear-to-br from-slate-50 to-slate-100 min-h-screen">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Task Management System
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              Manage and track your daily tasks efficiently
            </p>
          </div>
          <div className="w-full sm:w-auto">
            {user?.is_manager && (
              <button
                onClick={() => setShowTaskForm(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Task
              </button>
            )}
            {!user?.is_manager && (
              <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-right">
                You can only report on tasks assigned to you
              </div>
            )}
          </div>
        </div>
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white overflow-hidden shadow-sm sm:shadow rounded-lg border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="p-4 sm:p-5">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <UserGroupIcon
                        className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                  <div className="ml-3 sm:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                        Total Tasks
                      </dt>
                      <dd className="text-xl sm:text-lg font-bold text-gray-900">
                        {stats.total}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm sm:shadow rounded-lg border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="p-4 sm:p-5">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <ClockIcon
                        className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                  <div className="ml-3 sm:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                        Assigned
                      </dt>
                      <dd className="text-xl sm:text-lg font-bold text-gray-900">
                        {stats.assigned}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm sm:shadow rounded-lg border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="p-4 sm:p-5">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className="p-2 bg-yellow-50 rounded-lg">
                      <div className="h-5 w-5 sm:h-6 sm:w-6 bg-yellow-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="ml-3 sm:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                        On-going
                      </dt>
                      <dd className="text-xl sm:text-lg font-bold text-gray-900">
                        {stats.ongoing}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm sm:shadow rounded-lg border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="p-4 sm:p-5">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <CheckCircleIcon
                        className="h-5 w-5 sm:h-6 sm:w-6 text-green-600"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                  <div className="ml-3 sm:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                        Completed
                      </dt>
                      <dd className="text-xl sm:text-lg font-bold text-gray-900">
                        {stats.completed}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Filter */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedStatus(option.value)}
                disabled={isRefreshing}
                className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedStatus === option.value
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                {option.label}
              </button>
            ))}
            {isRefreshing && (
              <div className="flex items-center px-3 py-2 text-xs text-gray-500">
                <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400 mr-2"></div>
                Refreshing...
              </div>
            )}
          </div>
        </div>

        {/* Tasks Table */}
        <TaskTable
          tasks={tasks}
          onTaskUpdated={handleTaskUpdated}
          onTaskEdit={handleEditTask}
        />

        {/* Task Form Modal */}
        {showTaskForm && (
          <TaskForm
            onClose={() => setShowTaskForm(false)}
            onTaskCreated={handleTaskCreated}
          />
        )}

        {/* Edit Task Form Modal */}
        {editingTask && (
          <EditTaskForm
            task={editingTask}
            onClose={() => setEditingTask(null)}
            onTaskUpdated={handleTaskUpdated}
          />
        )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
