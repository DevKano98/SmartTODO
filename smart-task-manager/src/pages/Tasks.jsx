import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import useTaskStore from '../store/taskStore';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import KanbanBoard from '../components/KanbanBoard';
import Loading from '../components/Loading';

const Tasks = () => {
  const { currentUser } = useAuth();
  const { 
    tasks, 
    subscribeToTasks, 
    unsubscribeFromTasks, 
    loading,
    error: taskError
  } = useTaskStore();
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
  const [showAddTask, setShowAddTask] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Set up real-time listener for tasks when component mounts
  useEffect(() => {
    console.log("Tasks component mounted, current user:", currentUser?.uid);
    
    if (currentUser?.uid) {
      console.log("Subscribing to tasks for user:", currentUser.uid);
      subscribeToTasks(currentUser.uid);
      
      // Set initial load state to false after a short delay
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 2000);
      
      return () => {
        console.log("Unsubscribing from tasks");
        unsubscribeFromTasks();
        clearTimeout(timer);
      };
    } else {
      setIsInitialLoad(false);
    }
  }, [currentUser?.uid, subscribeToTasks, unsubscribeFromTasks]);
  
  // Apply filters whenever tasks or filter criteria change
  useEffect(() => {
    // Apply filters
    let filtered = [...tasks];
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }
    
    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title?.toLowerCase().includes(query) || 
        (task.description && task.description.toLowerCase().includes(query))
      );
    }
    
    setFilteredTasks(filtered);
  }, [tasks, filterStatus, filterPriority, searchQuery]);
  
  const handleAddTaskClick = () => {
    setShowAddTask(true);
  };
  
  const handleTaskAdded = () => {
    console.log("Task added callback triggered");
    setShowAddTask(false);
  };
  
  // Check if user is logged in
  if (!currentUser) {
    return (
      <div className="text-center p-8">
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Please log in to view and manage your tasks.
        </p>
      </div>
    );
  }
  
  // Show loading state only on initial load
  if ((loading && tasks.length === 0) || isInitialLoad) {
    return <Loading message="Loading your tasks..." />;
  }
  
  // Show error if there is one
  if (taskError) {
    return (
      <div className="text-center p-4 bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-100 rounded-md">
        <p>Error loading tasks: {taskError}</p>
        <button 
          onClick={() => subscribeToTasks(currentUser.uid)}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <button
            onClick={() => setViewMode('list')}
            className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline'}`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`btn ${viewMode === 'kanban' ? 'btn-primary' : 'btn-outline'}`}
          >
            Kanban View
          </button>
          <button
            onClick={handleAddTaskClick}
            className="btn btn-primary"
          >
            Add Task
          </button>
        </div>
      </div>
      
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0 mb-6">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
            />
          </div>
          
          <div className="flex space-x-4">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                id="status-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input"
              >
                <option value="all">All</option>
                <option value="to-do">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="priority-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                id="priority-filter"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="input"
              >
                <option value="all">All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
        
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No tasks found. Add your first task to get started!
          </div>
        ) : viewMode === 'list' ? (
          <TaskList tasks={filteredTasks} showActions={true} />
        ) : (
          <KanbanBoard tasks={tasks} />
        )}
      </div>
      
      {showAddTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Task</h2>
              <button
                onClick={() => setShowAddTask(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <TaskForm onTaskAdded={handleTaskAdded} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
