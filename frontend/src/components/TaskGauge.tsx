import React from 'react';

interface TaskGaugeProps {
  percentage: number;
  title?: string;
  size?: number;
}

const TaskGauge: React.FC<TaskGaugeProps> = ({ 
  percentage, 
  title = 'Task Completion', 
  size = 120 
}) => {
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference * 0.75; // 270 degrees (3/4 circle)
  
  const getColor = (percentage: number) => {
    if (percentage >= 80) return '#10b981'; // green-500
    if (percentage >= 60) return '#3b82f6'; // blue-500
    if (percentage >= 40) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  const getTextColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeLinecap="round"
            transform={`rotate(135 ${size / 2} ${size / 2})`}
          />
          
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getColor(percentage)}
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(135 ${size / 2} ${size / 2})`}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${getTextColor(percentage)}`}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      
      {title && (
        <div className="mt-2 text-center">
          <p className="text-sm font-medium text-gray-700">{title}</p>
        </div>
      )}
    </div>
  );
};

export default TaskGauge;
