import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import useTaskStore from '../store/taskStore';
import TaskList from '../components/TaskList';
import DailyQuote from '../components/DailyQuote';
import PomodoroTimer from '../components/PomodoroTimer';
import Loading from '../components/Loading';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { tasks, subscribeToTasks, unsubscribeFromTasks, loading, error: taskError } = useTaskStore();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [activeTasks, setActiveTasks] = useState([]);
  const [tasksByStatus, setTasksByStatus] = useState({
    labels: ['To Do', 'In Progress', 'Completed'],
    data: [0, 0, 0]
  });
  
  // Set up real-time listener for tasks when component mounts
  useEffect(() => {
    console.log("Dashboard: Setting up real-time task listener for user:", currentUser?.uid);
    
    if (currentUser?.uid) {
      subscribeToTasks(currentUser.uid);
      
      // Set initial load state to false after a short delay
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 2000);
      
      return () => {
        console.log("Dashboard: Cleaning up task subscription");
        unsubscribeFromTasks();
        clearTimeout(timer);
      };
    } else {
      setIsInitialLoad(false);
    }
  }, [currentUser?.uid, subscribeToTasks, unsubscribeFromTasks]);
  
  // Process tasks when they change
  useEffect(() => {
    console.log("Dashboard: Processing tasks, count:", tasks.length);
    
    if (tasks.length > 0) {
      // Filter out the active tasks (not completed)
      const filteredActiveTasks = tasks.filter(task => task.status !== 'completed');
      setActiveTasks(filteredActiveTasks);
      
      // Calculate task statistics for the chart
      const todoCount = tasks.filter(task => task.status === 'to-do').length;
      const inProgressCount = tasks.filter(task => task.status === 'in-progress').length;
      const completedCount = tasks.filter(task => task.status === 'completed').length;
      
      setTasksByStatus({
        labels: ['To Do', 'In Progress', 'Completed'],
        data: [todoCount, inProgressCount, completedCount]
      });
    } else {
      setActiveTasks([]);
      setTasksByStatus({
        labels: ['To Do', 'In Progress', 'Completed'],
        data: [0, 0, 0]
      });
    }
  }, [tasks]);
  
  // Check if user is logged in
  if (!currentUser) {
    return (
      <div className="text-center p-8">
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Please log in to view your dashboard.
        </p>
      </div>
    );
  }
  
  // Show loading state on initial load
  if ((loading && tasks.length === 0) || isInitialLoad) {
    return <Loading message="Loading your dashboard..." />;
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
  
  // Chart configuration
  const statusChartData = {
    labels: tasksByStatus.labels,
    datasets: [
      {
        label: 'Tasks by Status',
        data: tasksByStatus.data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          font: {
            size: 10
          }
        }
      },
      tooltip: {
        enabled: true
      }
    },
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        <button 
          onClick={() => subscribeToTasks(currentUser.uid)}
          className="btn btn-outline btn-sm flex items-center gap-1"
          title="Refresh tasks"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column - Takes 7/12 of the space */}
        <div className="md:col-span-7 space-y-6">
          <div className="card p-4">
            <h2 className="text-xl font-bold mb-4">My Tasks</h2>
            {activeTasks.length > 0 ? (
              <TaskList tasks={activeTasks} showActions={true} />
            ) : (
              <p className="text-gray-500 dark:text-gray-400">You have no active tasks. Add some tasks to get started!</p>
            )}
          </div>
          
          <div className="card p-4">
            <h2 className="text-xl font-bold mb-4">Daily Inspiration</h2>
            <DailyQuote />
          </div>
        </div>
        
        {/* Right Column - Takes 5/12 of the space */}
        <div className="md:col-span-5 space-y-6">
          <div className="card p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Task Overview</h2>
              <div className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                Total: {tasks.length}
              </div>
            </div>
            <div className="h-60">
              <Pie data={statusChartData} options={chartOptions} />
            </div>
            
            <div className="mt-4 space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium flex items-center">
                    <span className="inline-block w-3 h-3 mr-2 rounded-full bg-red-400"></span>
                    To Do
                  </span>
                  <span className="text-sm font-medium">
                    {tasks.filter(task => task.status === 'to-do').length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div 
                    className="bg-red-400 h-2 rounded-full" 
                    style={{ 
                      width: `${tasks.length > 0 ? (tasks.filter(task => task.status === 'to-do').length / tasks.length) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium flex items-center">
                    <span className="inline-block w-3 h-3 mr-2 rounded-full bg-blue-400"></span>
                    In Progress
                  </span>
                  <span className="text-sm font-medium">
                    {tasks.filter(task => task.status === 'in-progress').length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div 
                    className="bg-blue-400 h-2 rounded-full" 
                    style={{ 
                      width: `${tasks.length > 0 ? (tasks.filter(task => task.status === 'in-progress').length / tasks.length) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium flex items-center">
                    <span className="inline-block w-3 h-3 mr-2 rounded-full bg-green-400"></span>
                    Completed
                  </span>
                  <span className="text-sm font-medium">
                    {tasks.filter(task => task.status === 'completed').length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div 
                    className="bg-green-400 h-2 rounded-full" 
                    style={{ 
                      width: `${tasks.length > 0 ? (tasks.filter(task => task.status === 'completed').length / tasks.length) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card p-4">
            <h2 className="text-xl font-bold mb-4">Pomodoro Timer</h2>
            <PomodoroTimer compact={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
