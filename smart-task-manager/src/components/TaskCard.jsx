import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import useTaskStore from '../store/taskStore';
import { useAuth } from '../context/AuthContext';

const TaskCard = ({ task, showActions = true }) => {
  const { updateTask, deleteTask } = useTaskStore();
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setIsLoading(true);
    try {
      await updateTask(task.id, { ...task, status: newStatus }, currentUser.uid);
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    setIsLoading(true);
    try {
      await updateTask(task.id, { ...task, priority: newPriority }, currentUser.uid);
    } catch (error) {
      console.error('Error updating task priority:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editedTitle.trim()) {
      alert('Task title is required');
      return;
    }
    
    setIsLoading(true);
    try {
      await updateTask(
        task.id, 
        {
          ...task,
          title: editedTitle.trim(),
          description: editedDescription.trim(),
          updatedAt: new Date()
        },
        currentUser.uid
      );
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsLoading(true);
      try {
        await deleteTask(task.id, currentUser.uid);
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  };

  const statusColors = {
    'to-do': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
    'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  };

  // Format date if it exists and is valid
  const formatDate = (date) => {
    if (!date) return null;
    
    try {
      // Handle different date formats
      let dateObj;
      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'string') {
        dateObj = new Date(date);
      } else if (date && date.seconds) {
        // Handle Firestore Timestamp
        dateObj = new Date(date.seconds * 1000);
      } else {
        console.error('Unknown date format:', date);
        return null;
      }
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        console.error('Invalid date:', date);
        return null;
      }
      
      return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', date, error);
      return null;
    }
  };

  const createdAtFormatted = formatDate(task.createdAt);
  const dueDateFormatted = formatDate(task.dueDate);
  
  // Check if task is overdue
  const isOverdue = () => {
    if (!task.dueDate) return false;
    
    try {
      // Convert dueDate to Date object if needed
      let dueDate;
      if (task.dueDate instanceof Date) {
        dueDate = task.dueDate;
      } else if (typeof task.dueDate === 'string') {
        dueDate = new Date(task.dueDate);
      } else if (task.dueDate && task.dueDate.seconds) {
        dueDate = new Date(task.dueDate.seconds * 1000);
      } else {
        return false;
      }
      
      // Task is overdue if:
      // 1. Status is not 'completed'
      // 2. Due date is in the past
      const now = new Date();
      return task.status !== 'completed' && dueDate < now;
    } catch (error) {
      console.error('Error checking if overdue:', error);
      return false;
    }
  };
  
  const taskIsOverdue = isOverdue();

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${isLoading ? 'opacity-70' : ''}`}>
      {isEditing ? (
        <div className="space-y-4">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="input w-full"
            placeholder="Task title"
            disabled={isLoading}
          />
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="input w-full h-24"
            placeholder="Task description"
            disabled={isLoading}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="btn btn-outline"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate mr-2">
              {task.title}
            </h3>
            {showActions && (
              <div className="flex items-center shrink-0 space-x-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
                  disabled={isLoading}
                  aria-label="Edit task"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={handleDelete}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 p-1"
                  disabled={isLoading}
                  aria-label="Delete task"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {task.description && (
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mt-2">
            {showActions ? (
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={`px-2 py-1 rounded-full text-sm font-medium ${statusColors[task.status]}`}
                disabled={isLoading}
              >
                <option value="to-do">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            ) : (
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${statusColors[task.status]}`}>
                {task.status === 'to-do' ? 'To Do' : 
                 task.status === 'in-progress' ? 'In Progress' : 'Completed'}
              </span>
            )}

            {showActions ? (
              <select
                value={task.priority}
                onChange={(e) => handlePriorityChange(e.target.value)}
                className={`px-2 py-1 rounded-full text-sm font-medium ${priorityColors[task.priority]}`}
                disabled={isLoading}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            ) : (
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${priorityColors[task.priority]}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            )}
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex flex-col gap-1">
            {createdAtFormatted && (
              <div>Created {createdAtFormatted}</div>
            )}
            {dueDateFormatted && (
              <div className={taskIsOverdue ? 'text-red-500 dark:text-red-400' : ''}>
                Due {dueDateFormatted}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TaskCard;
