import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import useTaskStore from '../store/taskStore';

const TaskForm = ({ onTaskAdded }) => {
  const { currentUser } = useAuth();
  const { addTask, loading: storeLoading, error: storeError } = useTaskStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('to-do');
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Combined loading state from store and local
  const loading = localLoading || storeLoading || submitting;

  // Reset error when inputs change
  useEffect(() => {
    if (error) setError(null);
  }, [title, description, dueDate, priority, status]);

  // Check if user is authenticated
  if (!currentUser || !currentUser.uid) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 p-3 rounded-md text-sm">
        You need to be logged in to add tasks.
      </div>
    );
  }

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('medium');
    setStatus('to-do');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Process dueDate to ensure proper date handling
      let formattedDueDate = null;
      if (dueDate) {
        try {
          // Convert string date to Date object
          formattedDueDate = new Date(dueDate);
          // Set time to end of day to avoid timezone issues (11:59:59 PM)
          formattedDueDate.setHours(23, 59, 59, 999);
          
          console.log('Formatted due date:', formattedDueDate);
          console.log('Raw due date from form:', dueDate);
          
          // Verify it's a valid date
          if (isNaN(formattedDueDate.getTime())) {
            console.error('Invalid date format:', dueDate);
            formattedDueDate = null;
          }
        } catch (err) {
          console.error('Error parsing due date:', err);
          formattedDueDate = null;
        }
      }
      
      // Create a clean task object
      const taskData = {
        title: title.trim(),
        description: description.trim() || '',
        priority,
        status,
        dueDate: formattedDueDate
      };
      
      console.log('Adding task with data:', taskData);
      console.log('User ID:', currentUser.uid);
      
      // Add the task
      const result = await addTask(taskData, currentUser.uid);
      console.log('Task added successfully:', result);
      
      // Reset form on success
      resetForm();
      
      // Notify parent component
      if (onTaskAdded) {
        onTaskAdded();
      }
    } catch (error) {
      console.error('Failed to add task:', error);
      setError(error.message || 'Failed to add task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Display store error if any
  const displayError = error || storeError;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {displayError && (
        <div className="bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-100 p-3 rounded-md text-sm">
          {displayError}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Title *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input w-full"
          placeholder="Enter task title"
          required
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input w-full h-24"
          placeholder="Enter task description"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Due Date
        </label>
        <input
          type="date"
          id="dueDate"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="input w-full"
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="input w-full"
            disabled={loading}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input w-full"
            disabled={loading}
          >
            <option value="to-do">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary relative"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding...
            </span>
          ) : 'Add Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm; 