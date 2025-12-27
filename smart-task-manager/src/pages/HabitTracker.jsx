import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import Loading from '../components/Loading';

const HabitTracker = () => {
  const { currentUser } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: '',
    goal: 1,
    frequency: 'daily', // daily, weekly, monthly
    color: '#3B82F6' // default color
  });
  
  // Get current date and week dates
  const today = new Date();
  const dayOfWeek = today.getDay();
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOfWeek + i);
    return date;
  });
  
  useEffect(() => {
    if (currentUser?.uid) {
      console.log("HabitTracker: Fetching habits for user:", currentUser.uid);
      fetchHabits();
    } else {
      setLoading(false);
    }
  }, [currentUser?.uid]);
  
  const fetchHabits = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Create a reference to the user's habits collection
      const habitsRef = collection(db, 'users', currentUser.uid, 'habits');
      const querySnapshot = await getDocs(habitsRef);
      
      const habitsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log("HabitTracker: Fetched habits count:", habitsData.length);
      
      // Fetch habit logs for each habit
      for (const habit of habitsData) {
        // Use the user-specific path for habit logs
        const logsRef = collection(db, 'users', currentUser.uid, 'habitLogs');
        const logsQuery = query(logsRef, where('habitId', '==', habit.id));
        
        const logsSnapshot = await getDocs(logsQuery);
        habit.logs = logsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      }
      
      setHabits(habitsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching habits:', error);
      setError('Failed to fetch habits. Please try again.');
      setLoading(false);
    }
  };
  
  const handleAddHabit = async (e) => {
    e.preventDefault();
    
    if (!newHabit.name.trim()) {
      setError('Habit name is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const habitData = {
        name: newHabit.name.trim(),
        goal: Number(newHabit.goal) || 1,
        frequency: newHabit.frequency,
        color: newHabit.color,
        userId: currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log("HabitTracker: Adding new habit:", habitData.name);
      
      // Use the user-specific path for habits
      const habitsRef = collection(db, 'users', currentUser.uid, 'habits');
      const docRef = await addDoc(habitsRef, habitData);
      
      // Update local state with new habit
      setHabits([...habits, {
        id: docRef.id,
        ...habitData,
        logs: []
      }]);
      
      // Reset form
      setNewHabit({
        name: '',
        goal: 1,
        frequency: 'daily',
        color: '#3B82F6'
      });
      
      setShowAddHabit(false);
      setLoading(false);
    } catch (error) {
      console.error('Error adding habit:', error);
      setError('Failed to add habit. Please try again.');
      setLoading(false);
    }
  };
  
  const handleDeleteHabit = async (habitId) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      setLoading(true);
      
      try {
        // Use the user-specific path for habits
        const habitRef = doc(db, 'users', currentUser.uid, 'habits', habitId);
        await deleteDoc(habitRef);
        
        // Also delete all logs for this habit
        const logsRef = collection(db, 'users', currentUser.uid, 'habitLogs');
        const logsQuery = query(logsRef, where('habitId', '==', habitId));
        
        const logsSnapshot = await getDocs(logsQuery);
        const deletePromises = logsSnapshot.docs.map(doc => 
          deleteDoc(doc.ref)
        );
        
        await Promise.all(deletePromises);
        
        // Update local state
        setHabits(habits.filter(habit => habit.id !== habitId));
        setLoading(false);
      } catch (error) {
        console.error('Error deleting habit:', error);
        setError('Failed to delete habit. Please try again.');
        setLoading(false);
      }
    }
  };
  
  const toggleHabitCompletion = async (habit, date) => {
    const dateString = date.toISOString().split('T')[0];
    
    // Check if there's already a log for this date
    const existingLog = habit.logs.find(log => 
      log.date === dateString
    );
    
    try {
      // Use the user-specific path for habit logs
      const logsRef = collection(db, 'users', currentUser.uid, 'habitLogs');
      
      if (existingLog) {
        // If log exists, update the progress or delete if it would be 0
        const newProgress = existingLog.progress + 1 > habit.goal ? 0 : existingLog.progress + 1;
        
        if (newProgress === 0) {
          // Delete the log
          const logRef = doc(db, 'users', currentUser.uid, 'habitLogs', existingLog.id);
          await deleteDoc(logRef);
          
          // Update local state
          const updatedHabits = habits.map(h => {
            if (h.id === habit.id) {
              return {
                ...h,
                logs: h.logs.filter(log => log.id !== existingLog.id)
              };
            }
            return h;
          });
          
          setHabits(updatedHabits);
        } else {
          // Update the log
          const logRef = doc(db, 'users', currentUser.uid, 'habitLogs', existingLog.id);
          await updateDoc(logRef, {
            progress: newProgress,
            updatedAt: new Date()
          });
          
          // Update local state
          const updatedHabits = habits.map(h => {
            if (h.id === habit.id) {
              return {
                ...h,
                logs: h.logs.map(log => 
                  log.id === existingLog.id 
                    ? { ...log, progress: newProgress } 
                    : log
                )
              };
            }
            return h;
          });
          
          setHabits(updatedHabits);
        }
      } else {
        // If no log exists, create a new one
        const logData = {
          habitId: habit.id,
          date: dateString,
          progress: 1,
          userId: currentUser.uid,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Add a new log document
        const docRef = await addDoc(logsRef, logData);
        
        // Update local state
        const updatedHabits = habits.map(h => {
          if (h.id === habit.id) {
            return {
              ...h,
              logs: [...h.logs, { id: docRef.id, ...logData }]
            };
          }
          return h;
        });
        
        setHabits(updatedHabits);
      }
    } catch (error) {
      console.error('Error updating habit completion:', error);
      setError('Failed to update habit completion');
    }
  };
  
  const getHabitProgress = (habit, date) => {
    const dateString = date.toISOString().split('T')[0];
    const log = habit.logs.find(log => log.date === dateString);
    return log ? log.progress : 0;
  };
  
  // Show loading state
  if (!currentUser) {
    return (
      <div className="text-center p-8">
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Please log in to track your habits.
        </p>
      </div>
    );
  }
  
  if (loading && habits.length === 0) {
    return <Loading message="Loading your habits..." />;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Habit Tracker</h1>
        
        <button
          onClick={() => setShowAddHabit(true)}
          disabled={loading}
          className="mt-4 sm:mt-0 btn btn-primary"
        >
          Add Habit
        </button>
      </div>
      
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {habits.length === 0 ? (
        <div className="card">
          <div className="text-center py-8">
            <h2 className="text-xl font-bold mb-2">No Habits Yet</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Start tracking your habits to build consistency and achieve your goals.
            </p>
            <button
              onClick={() => setShowAddHabit(true)}
              className="btn btn-primary"
            >
              Create Your First Habit
            </button>
          </div>
        </div>
      ) : (
        <div className="card overflow-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Habit</th>
                {weekDates.map(date => (
                  <th key={date.toISOString()} className="px-4 py-2 text-center">
                    <div className="text-sm font-medium">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-xs">
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {habits.map(habit => (
                <tr key={habit.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                        style={{ backgroundColor: habit.color }}
                      ></div>
                      <div>
                        <div className="font-medium">{habit.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Goal: {habit.goal} times {habit.frequency}
                        </div>
                      </div>
                    </div>
                  </td>
                  {weekDates.map(date => {
                    const progress = getHabitProgress(habit, date);
                    const isComplete = progress >= habit.goal;
                    
                    return (
                      <td 
                        key={date.toISOString()} 
                        className="px-4 py-4 text-center"
                        onClick={() => toggleHabitCompletion(habit, date)}
                      >
                        <button 
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
                            ${isComplete 
                              ? 'bg-green-500 text-white hover:bg-green-600' 
                              : progress > 0 
                                ? 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300' 
                                : 'bg-gray-200 text-gray-400 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                        >
                          {progress > 0 ? progress : '·'}
                        </button>
                      </td>
                    );
                  })}
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {showAddHabit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Habit</h2>
              <button
                onClick={() => setShowAddHabit(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddHabit} className="space-y-4">
              <div>
                <label htmlFor="habit-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Habit Name *
                </label>
                <input
                  type="text"
                  id="habit-name"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                  className="input w-full"
                  placeholder="E.g., Drink water, Exercise, Read"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="habit-goal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Daily Goal
                  </label>
                  <input
                    type="number"
                    id="habit-goal"
                    value={newHabit.goal}
                    onChange={(e) => setNewHabit({ ...newHabit, goal: Math.max(1, parseInt(e.target.value)) })}
                    className="input w-full"
                    min="1"
                    max="10"
                  />
                </div>
                
                <div>
                  <label htmlFor="habit-frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Frequency
                  </label>
                  <select
                    id="habit-frequency"
                    value={newHabit.frequency}
                    onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value })}
                    className="input w-full"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="habit-color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color
                </label>
                <div className="flex space-x-2">
                  {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewHabit({ ...newHabit, color })}
                      className={`w-8 h-8 rounded-full ${newHabit.color === color ? 'ring-2 ring-offset-2 ring-gray-500' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddHabit(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Adding...' : 'Add Habit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitTracker;
