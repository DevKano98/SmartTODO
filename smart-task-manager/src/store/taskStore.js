import { create } from 'zustand';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../services/firebase';

const useTaskStore = create((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  unsubscribe: null,
  
  // Start real-time listener for tasks
  subscribeToTasks: (userId) => {
    if (!userId) {
      console.error('No user ID provided for subscribing to tasks');
      return;
    }
    
    // Clear any existing subscription
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
    }
    
    set({ loading: true, error: null });
    
    try {
      console.log('[TaskStore] Setting up real-time listener for user tasks:', userId);
      console.log('[TaskStore] Collection path:', `users/${userId}/tasks`);
      
      // Create a reference to the user's tasks collection
      const tasksRef = collection(db, 'users', userId, 'tasks');
      
      // Set up real-time listener
      const newUnsubscribe = onSnapshot(
        tasksRef,
        (snapshot) => {
          console.log('[TaskStore] Received task update, docs count:', snapshot.docs.length);
          console.log('[TaskStore] Firestore snapshot metadata:', {
            fromCache: snapshot.metadata.fromCache,
            hasPendingWrites: snapshot.metadata.hasPendingWrites
          });
          
          if (snapshot.docs.length === 0) {
            console.log('[TaskStore] No tasks found in Firestore for user:', userId);
            set({ tasks: [], loading: false });
            return;
          }
          
          const tasksData = snapshot.docs.map(doc => {
            const data = doc.data();
            console.log('[TaskStore] Raw task data from Firestore:', { id: doc.id, ...data });
            
            const processedTask = {
              id: doc.id,
              ...data,
              // Convert timestamps to JS Date objects
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
              dueDate: data.dueDate?.toDate() || null,
              completedAt: data.completedAt?.toDate() || null
            };
            
            console.log('[TaskStore] Processed task:', {
              id: processedTask.id,
              title: processedTask.title,
              dueDate: processedTask.dueDate ? processedTask.dueDate.toISOString() : null,
              status: processedTask.status,
              completed: processedTask.completed
            });
            
            return processedTask;
          });
          
          console.log('[TaskStore] All processed tasks:', tasksData.map(t => ({
            id: t.id,
            title: t.title,
            dueDate: t.dueDate ? t.dueDate.toISOString() : null,
            status: t.status,
            completed: t.completed
          })));
          
          set({ 
            tasks: tasksData, 
            loading: false 
          });
        },
        (error) => {
          console.error('[TaskStore] Error subscribing to tasks:', error);
          set({ error: 'Failed to load tasks', loading: false });
        }
      );
      
      // Store the unsubscribe function
      set({ unsubscribe: newUnsubscribe });
      
      return newUnsubscribe;
    } catch (error) {
      console.error('Error setting up tasks subscription:', error);
      set({ error: 'Failed to subscribe to tasks', loading: false });
    }
  },
  
  // Clean up subscription when component unmounts
  unsubscribeFromTasks: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      console.log('Cleaning up task subscription');
      unsubscribe();
      set({ unsubscribe: null });
    }
  },
  
  fetchTasks: async (userId) => {
    set({ loading: true, error: null });
    try {
      const tasksRef = collection(db, 'users', userId, 'tasks');
      const querySnapshot = await getDocs(tasksRef);
      
      const tasksData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert timestamps to JS Date objects
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        dueDate: doc.data().dueDate?.toDate() || null,
        completedAt: doc.data().completedAt?.toDate() || null
      }));
      
      set({ tasks: tasksData, loading: false });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      set({ error: 'Failed to fetch tasks', loading: false });
    }
  },
  
  addTask: async (taskData, userId) => {
    if (!userId) {
      console.error('No user ID provided for adding task');
      set({ error: 'User not authenticated', loading: false });
      throw new Error('User not authenticated');
    }
    
    set({ loading: true, error: null });
    
    try {
      console.log('Processing dueDate before saving:', taskData.dueDate);
      
      // Ensure dueDate is properly formatted
      let formattedDueDate = null;
      if (taskData.dueDate) {
        if (typeof taskData.dueDate === 'string') {
          // If it's a string (from form input), convert to Date
          formattedDueDate = new Date(taskData.dueDate);
          console.log('Converted string dueDate to Date:', formattedDueDate);
        } else if (taskData.dueDate instanceof Date) {
          formattedDueDate = taskData.dueDate;
          console.log('Using existing Date object for dueDate:', formattedDueDate);
        }
      }
      
      // Create a task object for Firestore with all essential fields
      const task = {
        title: taskData.title,
        description: taskData.description || '',
        priority: taskData.priority || 'medium',
        status: taskData.status || 'to-do',
        completed: taskData.status === 'completed',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Store dueDate without modifying the time - let filtering logic handle time comparison
        dueDate: formattedDueDate
      };
      
      // If task is completed, add completedAt timestamp
      if (task.status === 'completed') {
        task.completedAt = new Date();
      }
      
      console.log('Adding task to Firestore:', task);
      
      // Get direct reference to the user's tasks collection
      const userTasksCollection = collection(db, 'users', userId, 'tasks');
      
      // Add document to Firestore
      const docRef = await addDoc(userTasksCollection, task);
      console.log('Task added with ID:', docRef.id);
      
      // Add ID to the task object
      const newTask = { id: docRef.id, ...task };
      
      // Update local state immediately
      set(state => ({
        tasks: [...state.tasks, newTask],
        loading: false
      }));
      
      return newTask;
    } catch (error) {
      console.error('Error adding task:', error);
      set({ error: error.message || 'Failed to add task', loading: false });
      throw error;
    }
  },
  
  updateTask: async (taskId, taskData, userId) => {
    if (!userId || !taskId) {
      console.error('Missing user ID or task ID for updating task');
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      console.log(`Updating task ${taskId} for user ${userId}:`, taskData);
      
      // Use the correct document path
      const taskRef = doc(db, 'users', userId, 'tasks', taskId);
      
      // Update the task in Firestore
      await updateDoc(taskRef, {
        ...taskData,
        updatedAt: new Date()
      });
      
      // Update local state
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === taskId ? { ...task, ...taskData, updatedAt: new Date() } : task
        ),
        loading: false
      }));
    } catch (error) {
      console.error('Error updating task:', error);
      set({ error: 'Failed to update task', loading: false });
    }
  },
  
  deleteTask: async (taskId, userId) => {
    if (!userId || !taskId) {
      console.error('Missing user ID or task ID for deleting task');
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      console.log(`Deleting task ${taskId} for user ${userId}`);
      
      // Use the correct document path
      await deleteDoc(doc(db, 'users', userId, 'tasks', taskId));
      
      // Update local state
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== taskId),
        loading: false
      }));
    } catch (error) {
      console.error('Error deleting task:', error);
      set({ error: 'Failed to delete task', loading: false });
    }
  },
  
  toggleTaskCompletion: async (taskId, userId) => {
    if (!userId || !taskId) {
      console.error('Missing user ID or task ID for toggling task completion');
      return;
    }
    
    const { tasks } = get();
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) return;
    
    const updatedCompletion = !task.completed;
    
    try {
      const updateData = { completed: updatedCompletion };
      
      // Synchronize status field with completed state
      if (updatedCompletion) {
        // If marking as completed, update status to 'completed' and add completedAt timestamp
        updateData.status = 'completed';
        updateData.completedAt = new Date();
      } else if (task.status === 'completed') {
        // If un-completing a task that was marked 'completed', set back to 'in-progress'
        updateData.status = 'in-progress';
        // Don't remove completedAt if it exists, as it's useful for historical data
      }
      
      await get().updateTask(taskId, updateData, userId);
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  },
  
  updateTaskStatus: async (taskId, status, userId) => {
    if (!userId) {
      const { currentUser } = get();
      userId = currentUser?.uid;
      
      if (!userId) {
        console.error('Missing user ID for updating task status');
        return;
      }
    }
    
    try {
      const updateData = { status };
      
      // If status is 'completed', also update the completed field and add completedAt timestamp
      if (status === 'completed') {
        updateData.completed = true;
        updateData.completedAt = new Date();
      } else {
        // If moving from completed to another status, update the completed field
        updateData.completed = false;
        // Don't remove completedAt if it exists, as it's useful for historical data
      }
      
      await get().updateTask(taskId, updateData, userId);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  },
  
  updateTaskPriority: async (taskId, priority, userId) => {
    if (!userId) {
      const { currentUser } = get();
      userId = currentUser?.uid;
      
      if (!userId) {
        console.error('Missing user ID for updating task priority');
        return;
      }
    }
    
    try {
      await get().updateTask(taskId, { priority }, userId);
    } catch (error) {
      console.error('Error updating task priority:', error);
    }
  }
}));

export default useTaskStore;
