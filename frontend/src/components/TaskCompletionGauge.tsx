import React, { useState } from 'react';
import TaskGauge from './TaskGauge';
import { tasksAPI } from '../api/tasks';
import type { Task } from '../api/tasks';
import { useAuth } from '../contexts/AuthContext.tsx';

interface TaskCompletionGaugeProps {
  task: Task;
  onTaskUpdated: () => void;
}

const TaskCompletionGauge: React.FC<TaskCompletionGaugeProps> = ({ task, onTaskUpdated }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(task.completion_percentage);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  const canUpdateCompletion = () => {
    return user?.id === task.assigned_to && task.status !== 'completed';
  };

  const handleUpdate = async () => {
    if (!canUpdateCompletion()) return;

    setIsUpdating(true);
    setError('');

    try {
      await tasksAPI.updateCompletionPercentage(task.id, completionPercentage);
      setIsEditing(false);
      onTaskUpdated();
    } catch (error: any) {
      console.error('Error updating completion percentage:', error);
      setError(error.response?.data?.error || 'Failed to update completion percentage');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setCompletionPercentage(task.completion_percentage);
    setIsEditing(false);
    setError('');
  };

  if (!canUpdateCompletion()) {
    return (
      <div className="flex items-center space-x-4">
        <TaskGauge 
          percentage={task.completion_percentage} 
          title="Task Completion"
          size={80}
        />
        <div className="text-sm text-gray-600">
          {task.status === 'completed' ? 'Task completed' : 'Cannot update completion'}
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Completion Percentage
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="100"
                value={completionPercentage}
                onChange={(e) => setCompletionPercentage(parseInt(e.target.value))}
                className="flex-1"
                disabled={isUpdating}
              />
              <input
                type="number"
                min="0"
                max="100"
                value={completionPercentage}
                onChange={(e) => setCompletionPercentage(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                disabled={isUpdating}
              />
              <span className="text-sm font-medium text-gray-600">%</span>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              disabled={isUpdating}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isUpdating ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <TaskGauge 
        percentage={task.completion_percentage} 
        title="Task Completion"
        size={100}
      />
      {canUpdateCompletion() && (
        <button
          onClick={() => setIsEditing(true)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Update Progress
        </button>
      )}
    </div>
  );
};

export default TaskCompletionGauge;
