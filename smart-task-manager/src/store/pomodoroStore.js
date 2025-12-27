import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const usePomodoroStore = create(
  persist(
    (set, get) => ({
      isActive: false,
      isPaused: false,
      workDuration: 25 * 60, // 25 minutes in seconds
      breakDuration: 5 * 60, // 5 minutes in seconds
      currentSession: 'work', // 'work' or 'break'
      timeRemaining: 25 * 60,
      completedSessions: 0,
      currentTaskId: null,
      
      startTimer: (taskId = null) => {
        const { isActive, isPaused, currentSession } = get();
        
        // If timer is already active and not paused, do nothing
        if (isActive && !isPaused) return;
        
        // If timer is paused, just unpause it
        if (isActive && isPaused) {
          set({ isPaused: false });
          return;
        }
        
        // Start a new timer
        set({
          isActive: true,
          isPaused: false,
          currentTaskId: taskId,
          timeRemaining: currentSession === 'work' ? get().workDuration : get().breakDuration
        });
      },
      
      pauseTimer: () => {
        const { isActive, isPaused } = get();
        
        // Only pause if timer is active and not already paused
        if (isActive && !isPaused) {
          set({ isPaused: true });
        }
      },
      
      resetTimer: () => {
        const { currentSession } = get();
        set({
          isActive: false,
          isPaused: false,
          timeRemaining: currentSession === 'work' ? get().workDuration : get().breakDuration,
          currentTaskId: null
        });
      },
      
      tick: () => {
        const { timeRemaining, isActive, isPaused } = get();
        
        // Only tick if timer is active and not paused
        if (isActive && !isPaused && timeRemaining > 0) {
          set({ timeRemaining: timeRemaining - 1 });
        }
        
        // If timer reaches zero, switch sessions
        if (timeRemaining <= 0) {
          get().completeSession();
        }
      },
      
      completeSession: () => {
        const { currentSession, completedSessions } = get();
        const newSession = currentSession === 'work' ? 'break' : 'work';
        const newTimeRemaining = newSession === 'work' ? get().workDuration : get().breakDuration;
        
        // Play sound notification
        const audio = new Audio('/notification.mp3');
        audio.play().catch(e => console.log('Audio play failed:', e));
        
        // Show browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(
            currentSession === 'work' ? 'Break Time!' : 'Work Time!', 
            { 
              body: currentSession === 'work' 
                ? 'Good job! Take a break.' 
                : 'Break is over. Time to focus!'
            }
          );
        }
        
        set({
          currentSession: newSession,
          timeRemaining: newTimeRemaining,
          completedSessions: currentSession === 'work' ? completedSessions + 1 : completedSessions,
          currentTaskId: newSession === 'break' ? null : get().currentTaskId
        });
      },
      
      setWorkDuration: (minutes) => {
        const seconds = minutes * 60;
        set({ 
          workDuration: seconds,
          timeRemaining: get().currentSession === 'work' ? seconds : get().timeRemaining
        });
      },
      
      setBreakDuration: (minutes) => {
        const seconds = minutes * 60;
        set({ 
          breakDuration: seconds,
          timeRemaining: get().currentSession === 'break' ? seconds : get().timeRemaining
        });
      }
    }),
    {
      name: 'pomodoro-storage'
    }
  )
);

export default usePomodoroStore;
