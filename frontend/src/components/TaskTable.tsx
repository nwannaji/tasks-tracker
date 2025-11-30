import React, { useState } from 'react';
import type { Task } from '../api/tasks';
import { tasksAPI } from '../api/tasks';
import { useAuth } from '../contexts/AuthContext.tsx';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import TaskReport from './TaskReport.tsx';
import TaskCompletionGauge from './TaskCompletionGauge.tsx';

interface TaskTableProps {
  tasks: Task[];
  onTaskUpdated: () => void;
  onTaskEdit: (task: Task) => void;
}

const TaskTable: React.FC<TaskTableProps> = ({ tasks, onTaskUpdated, onTaskEdit }) => {
  const { user } = useAuth();
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    setUpdatingTaskId(taskId);
    try {
      await tasksAPI.updateTaskStatus(taskId, newStatus);
      onTaskUpdated();
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }
    
    setDeletingTaskId(taskId);
    try {
      await tasksAPI.deleteTask(taskId);
      onTaskUpdated();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    } finally {
      setDeletingTaskId(null);
    }
  };

  const canEditTask = () => {
    return user?.is_manager;
  };

  const canDeleteTask = () => {
    return user?.is_manager;
  };

  const isOverdue = (dueDate: string | null, status: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && status !== 'completed';
  };

  const getDueDateColor = (dueDate: string | null, status: string) => {
    if (!dueDate) return 'text-gray-500';
    const due = new Date(dueDate);
    const now = new Date();
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue < 0 && status !== 'completed') {
      return 'text-red-600 font-medium';
    } else if (daysUntilDue <= 2 && status !== 'completed') {
      return 'text-yellow-600 font-medium';
    }
    return 'text-gray-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created':
        return 'bg-gray-100 text-gray-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canUpdateStatus = (task: Task) => {
    return user?.is_manager || task.assigned_to === user?.id;
  };

  const getNextStatuses = (currentStatus: string) => {
    const statusFlow: { [key: string]: string[] } = {
      'created': ['assigned'],
      'assigned': ['ongoing'],
      'ongoing': ['completed'],
      'completed': [],
    };
    return statusFlow[currentStatus] || [];
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6 border border-gray-100">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-base sm:text-lg font-medium">No tasks found</p>
          <p className="text-sm sm:text-base mt-2 text-gray-400">Tasks will appear here once they are created.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden sm:block bg-white shadow-sm overflow-hidden rounded-lg border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task Details
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date & Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expected Completion
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completion
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="max-w-xs">
                      <div className="text-sm font-medium text-gray-900 truncate">{task.title}</div>
                      {task.description && (
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</div>
                      )}
                      <div className="text-xs text-gray-400 mt-2">
                        Task ID: #{task.id}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {task.created_by_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {task.assigned_to_name || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div>{new Date(task.created_at).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-400">{new Date(task.created_at).toLocaleTimeString()}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.due_date ? (
                      <div className={getDueDateColor(task.due_date, task.status)}>
                        <div>{new Date(task.due_date).toLocaleDateString()}</div>
                        <div className="text-xs">{new Date(task.due_date).toLocaleTimeString()}</div>
                        {isOverdue(task.due_date, task.status) && (
                          <div className="text-xs">OVERDUE</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">Not set</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {task.status === 'ongoing' || task.status === 'completed' ? (
                      <TaskCompletionGauge 
                        task={task} 
                        onTaskUpdated={onTaskUpdated} 
                      />
                    ) : (
                      <div className="text-gray-400 text-sm">Not started</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {canUpdateStatus(task) && getNextStatuses(task.status).length > 0 && (
                      <div className="flex space-x-2">
                        {getNextStatuses(task.status).map((nextStatus) => (
                          <button
                            key={nextStatus}
                            onClick={() => handleStatusChange(task.id, nextStatus)}
                            disabled={updatingTaskId === task.id}
                            className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded ${
                              nextStatus === 'completed'
                                ? 'text-white bg-green-600 hover:bg-green-700'
                                : nextStatus === 'ongoing'
                                ? 'text-white bg-yellow-600 hover:bg-yellow-700'
                                : 'text-white bg-blue-600 hover:bg-blue-600'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {updatingTaskId === task.id ? 'Updating...' : `Mark ${nextStatus}`}
                          </button>
                        ))}
                      </div>
                    )}
                    {task.status === 'completed' && (
                      <span className="text-green-600 text-xs font-medium">Completed</span>
                    )}
                    {(canEditTask() || canDeleteTask()) && (
                      <div className="flex space-x-2 mt-2">
                        {canEditTask() && (
                          <button
                            onClick={() => onTaskEdit(task)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit task"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        )}
                        {canDeleteTask() && (
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            disabled={deletingTaskId === task.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            title="Delete task"
                          >
                            {deletingTaskId === task.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-red-600"></div>
                            ) : (
                              <TrashIcon className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white shadow-sm rounded-lg border border-gray-100 overflow-hidden">
            <div className="p-4">
              {/* Task Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">{task.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">Task ID: #{task.id}</p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>

              {/* Task Description */}
              {task.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
              )}

              {/* Task Details Grid */}
              <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                <div>
                  <p className="text-gray-500">Created By:</p>
                  <p className="font-medium text-gray-900">{task.created_by_name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Assigned To:</p>
                  <p className="font-medium text-gray-900">{task.assigned_to_name || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Created:</p>
                  <p className="font-medium text-gray-900">{new Date(task.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Due Date:</p>
                  <p className={`font-medium ${getDueDateColor(task.due_date, task.status)}`}>
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
              </div>

              {/* Completion Gauge */}
              {(task.status === 'ongoing' || task.status === 'completed') && (
                <div className="mb-3">
                  <TaskCompletionGauge 
                    task={task} 
                    onTaskUpdated={onTaskUpdated} 
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col space-y-2">
                {canUpdateStatus(task) && getNextStatuses(task.status).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {getNextStatuses(task.status).map((nextStatus) => (
                      <button
                        key={nextStatus}
                        onClick={() => handleStatusChange(task.id, nextStatus)}
                        disabled={updatingTaskId === task.id}
                        className={`flex-1 px-3 py-2 text-xs font-medium rounded text-white transition-colors duration-200 ${
                          nextStatus === 'completed'
                            ? 'bg-green-600 hover:bg-green-700'
                            : nextStatus === 'ongoing'
                            ? 'bg-yellow-600 hover:bg-yellow-700'
                            : 'bg-blue-600 hover:bg-blue-600'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {updatingTaskId === task.id ? 'Updating...' : `Mark ${nextStatus}`}
                      </button>
                    ))}
                  </div>
                )}
                {(canEditTask() || canDeleteTask()) && (
                  <div className="flex justify-end space-x-3 pt-2 border-t border-gray-100">
                    {canEditTask() && (
                      <button
                        onClick={() => onTaskEdit(task)}
                        className="flex items-center text-xs text-indigo-600 hover:text-indigo-900"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                    )}
                    {canDeleteTask() && (
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        disabled={deletingTaskId === task.id}
                        className="flex items-center text-xs text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        {deletingTaskId === task.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-red-600 mr-1"></div>
                        ) : (
                          <TrashIcon className="h-4 w-4 mr-1" />
                        )}
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Task Report for Employees */}
            {!user?.is_manager && task.assigned_to === user?.id && (
              <div className="border-t border-gray-100">
                <TaskReport 
                  task={task} 
                  onReportSubmitted={onTaskUpdated} 
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add task report rows for desktop */}
      <div className="hidden sm:block">
        {!user?.is_manager && tasks.map((task) => 
          task.assigned_to === user?.id && (
            <div key={`report-${task.id}`} className="bg-white border-t border-gray-100">
              <TaskReport 
                task={task} 
                onReportSubmitted={onTaskUpdated} 
              />
            </div>
          )
        )}
      </div>
    </>
  );
};

export default TaskTable;
