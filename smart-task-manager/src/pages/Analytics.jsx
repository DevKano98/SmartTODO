import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import useTaskStore from '../store/taskStore';
import usePomodoroStore from '../store/pomodoroStore';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Loading from '../components/Loading';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const { currentUser } = useAuth();
  const { tasks, fetchTasks, loading } = useTaskStore();
  const { completedSessions } = usePomodoroStore();
  
  const [tasksByStatus, setTasksByStatus] = useState({
    labels: ['To Do', 'In Progress', 'Completed'],
    data: [0, 0, 0]
  });
  
  const [tasksByPriority, setTasksByPriority] = useState({
    labels: ['High', 'Medium', 'Low'],
    data: [0, 0, 0]
  });
  
  const [taskCompletionByDay, setTaskCompletionByDay] = useState({
    labels: [],
    data: []
  });
  
  useEffect(() => {
    if (currentUser) {
      fetchTasks(currentUser.uid);
    }
  }, [currentUser, fetchTasks]);
  
  useEffect(() => {
    if (tasks.length > 0) {
      // Calculate tasks by status
      const todoCount = tasks.filter(task => task.status === 'to-do').length;
      const inProgressCount = tasks.filter(task => task.status === 'in-progress').length;
      const completedCount = tasks.filter(task => task.status === 'completed').length;
      
      setTasksByStatus({
        labels: ['To Do', 'In Progress', 'Completed'],
        data: [todoCount, inProgressCount, completedCount]
      });
      
      // Calculate tasks by priority
      const highCount = tasks.filter(task => task.priority === 'high').length;
      const mediumCount = tasks.filter(task => task.priority === 'medium').length;
      const lowCount = tasks.filter(task => task.priority === 'low').length;
      
      setTasksByPriority({
        labels: ['High', 'Medium', 'Low'],
        data: [highCount, mediumCount, lowCount]
      });
      
      // Calculate task completion by day (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date;
      }).reverse();
      
      const dayLabels = last7Days.map(date => {
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      });
      
      const completionData = last7Days.map(date => {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        return tasks.filter(task => {
          if (!task.completedAt) return false;
          
          // Convert completedAt to Date object if it's a Firestore timestamp
          let completedDate;
          if (task.completedAt instanceof Date) {
            completedDate = task.completedAt;
          } else if (typeof task.completedAt === 'string') {
            completedDate = new Date(task.completedAt);
          } else if (task.completedAt && task.completedAt.seconds) {
            // Handle Firestore Timestamp
            completedDate = new Date(task.completedAt.seconds * 1000);
          } else {
            return false;
          }
          
          return completedDate >= startOfDay && completedDate <= endOfDay;
        }).length;
      });
      
      setTaskCompletionByDay({
        labels: dayLabels,
        data: completionData
      });
    }
  }, [tasks]);
  
  if (loading && tasks.length === 0) {
    return <Loading />;
  }
  
  // Chart configurations
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
  
  const priorityChartData = {
    labels: tasksByPriority.labels,
    datasets: [
      {
        label: 'Tasks by Priority',
        data: tasksByPriority.data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const completionChartData = {
    labels: taskCompletionByDay.labels,
    datasets: [
      {
        label: 'Tasks Completed',
        data: taskCompletionByDay.data,
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Tasks by Status</h2>
          <div className="h-64">
            <Pie data={statusChartData} options={chartOptions} />
          </div>
        </div>
        
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Tasks by Priority</h2>
          <div className="h-64">
            <Pie data={priorityChartData} options={chartOptions} />
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Task Completion (Last 7 Days)</h2>
        <div className="h-80">
          <Line data={completionChartData} options={chartOptions} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Total Tasks</h2>
          <p className="text-4xl font-bold text-primary-600 dark:text-primary-400">{tasks.length}</p>
        </div>
        
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Completion Rate</h2>
          <p className="text-4xl font-bold text-green-600 dark:text-green-400">
            {tasks.length > 0 
              ? `${Math.round((tasks.filter(task => task.status === 'completed').length / tasks.length) * 100)}%` 
              : '0%'}
          </p>
        </div>
        
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Pomodoro Sessions</h2>
          <p className="text-4xl font-bold text-primary-600 dark:text-primary-400">{completedSessions}</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
