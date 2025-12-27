import React from 'react';
import TaskCard from './TaskCard';

const TaskList = ({ tasks = [], showActions = true }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No tasks found. Add a new task to get started!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <TaskCard 
          key={task.id} 
          task={task}
          showActions={showActions}
        />
      ))}
    </div>
  );
};

export default TaskList; 