import React, { useState } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import type { Task } from '../api/tasks';
import { tasksAPI } from '../api/tasks';
import type { TaskReportData } from '../api/reports';
import { reportsAPI } from '../api/reports';
import { useAuth } from '../contexts/AuthContext.tsx';

interface TaskReportProps {
  task: Task;
  onReportSubmitted: () => void;
}

const TaskReport: React.FC<TaskReportProps> = ({ task, onReportSubmitted }) => {
  const { user } = useAuth();
  const [report, setReport] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report.trim()) {
      setError('Please enter a report before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      // Create the report
      const reportData: TaskReportData = {
        task: task.id,
        content: report,
      };
      
      console.log('Submitting report for task:', task.id, 'Content:', report);
      console.log('User:', user?.id, 'Assigned to:', task.assigned_to);
      
      await reportsAPI.createReport(reportData);
      
      // Update task status if needed
      let newStatus = task.status;
      if (task.status === 'created' || task.status === 'assigned') {
        newStatus = 'ongoing';
      }
      
      if (newStatus !== task.status) {
        await tasksAPI.updateTaskStatus(task.id, newStatus);
      }
      
      setSuccess(true);
      setReport('');
      
      setTimeout(() => {
        onReportSubmitted();
      }, 1500);
    } catch (error: any) {
      console.error('Error submitting report:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.detail || 
                          error.response?.data?.content?.[0] ||
                          'Failed to submit report. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canReport = () => {
    return user?.id === task.assigned_to && task.status !== 'completed';
  };

  if (!canReport()) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
      <h4 className="text-sm font-medium text-gray-900 mb-3">Submit Task Report</h4>
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded mb-3">
          Report submitted successfully!
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded mb-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="report" className="block text-sm font-medium text-gray-700 mb-1">
            Your Report
          </label>
          <textarea
            id="report"
            rows={3}
            value={report}
            onChange={(e) => setReport(e.target.value)}
            placeholder="Describe your progress, challenges, or any updates on this task..."
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                Submit Report
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskReport;
