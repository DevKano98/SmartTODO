import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import usePomodoroStore from '../store/pomodoroStore';

const PomodoroTimer = ({ compact = false }) => {
  const { currentUser } = useAuth();
  const { 
    workDuration, 
    breakDuration, 
    incrementCompletedSessions, 
    completedSessions = 0, 
    dailyGoal = 8, 
  } = usePomodoroStore();
  
  const [timeLeft, setTimeLeft] = useState(workDuration);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [progress, setProgress] = useState(100);
  
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  
  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3');
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
  
  useEffect(() => {
    // Reset timer when switching between work and break
    setTimeLeft(isBreak ? breakDuration : workDuration);
    setProgress(100);
  }, [isBreak, workDuration, breakDuration]);
  
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            audioRef.current.play().catch(e => console.log('Audio play failed:', e));
            
            if (!isBreak) {
              incrementCompletedSessions();
            }
            
            // Switch between work and break
            setIsBreak(!isBreak);
            setIsActive(false);
            
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isBreak, incrementCompletedSessions]);
  
  useEffect(() => {
    // Calculate progress percentage
    const totalDuration = isBreak ? breakDuration : workDuration;
    const percentage = (timeLeft / totalDuration) * 100;
    setProgress(percentage);
  }, [timeLeft, isBreak, workDuration, breakDuration]);
  
  const toggleTimer = () => {
    setIsActive(!isActive);
  };
  
  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setTimeLeft(workDuration);
    setProgress(100);
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Generate hourly segments for the day chart
  const generateHourlySegments = () => {
    const segments = [];
    const hoursInDay = 8; // Representing a typical workday
    
    for (let i = 0; i < hoursInDay; i++) {
      // Random value between 0-3 sessions per hour for demonstration
      const value = Math.floor(Math.random() * 3);
      segments.push({ hour: i + 9, sessions: value }); // Starting from 9 AM
    }
    
    return segments;
  };
  
  const hourlyData = generateHourlySegments();
  const currentHour = new Date().getHours();
  
  // Percentage of daily goal completed
  const completionPercentage = Math.min(100, Math.round((completedSessions / dailyGoal) * 100));
  
  // Render a compact version for dashboard
  if (compact) {
    return (
      <div className="flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <div className="relative w-full mx-auto mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              {isBreak ? '🍃 Break' : '⏱️ Focus'}
            </span>
            <div className="text-xl font-bold text-gray-800 dark:text-white">
              {formatTime(timeLeft)}
            </div>
          </div>
          
          <div className="w-full h-2.5 bg-gray-100 rounded-full dark:bg-gray-700 overflow-hidden">
            <div 
              className={`h-2.5 rounded-full transition-all duration-300 ${isBreak ? 'bg-emerald-500' : 'bg-primary-500'}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="mt-3 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2">
            <div className="text-sm">
              <span className="font-medium text-gray-600 dark:text-gray-300">Today:</span>
              <span className="ml-1 font-bold text-primary-600 dark:text-primary-400">{completedSessions}</span>
              <span className="text-gray-500 dark:text-gray-400">/{dailyGoal}</span>
            </div>
            <div className="text-xs px-2 py-1 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 rounded-full font-medium">
              {completionPercentage}% complete
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2 mt-1">
          <button
            onClick={toggleTimer}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex-1 transition-all duration-200 shadow-sm ${
              isActive
                ? 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white'
                : 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white'
            }`}
          >
            {isActive ? '⏸️ Pause' : '▶️ Start'}
          </button>
          
          <button
            onClick={resetTimer}
            className="px-4 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-medium dark:bg-gray-700 dark:hover:bg-gray-600 dark:active:bg-gray-500 dark:text-gray-300 shadow-sm transition-all duration-200"
          >
            🔄 Reset
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
          <span className="mr-2">⏱️</span> Pomodoro Timer
        </h2>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center md:w-1/2">
            <div className="relative mb-6">
              <div className="w-72 h-72 relative">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-full shadow-inner"></div>
                
                <svg className="w-full h-full relative z-10" viewBox="0 0 100 100">
                  {/* Shadow effect for main circle */}
                  <filter id="shadow">
                    <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.3" />
                  </filter>
                  
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="6"
                    className="dark:stroke-gray-700 opacity-50"
                  />
                  
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke={isBreak ? "#10b981" : "#4f46e5"}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray="276"
                    strokeDashoffset={276 - (276 * progress) / 100}
                    transform="rotate(-90 50 50)"
                    filter="url(#shadow)"
                    className="transition-all duration-300"
                  />
                  
                  {/* Tick marks */}
                  {[...Array(12)].map((_, i) => (
                    <line
                      key={i}
                      x1="50"
                      y1="10"
                      x2="50"
                      y2="12"
                      stroke="#d1d5db"
                      strokeWidth="1"
                      className="dark:stroke-gray-600"
                      transform={`rotate(${i * 30} 50 50)`}
                    />
                  ))}
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-700 dark:from-white dark:to-gray-300">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2 bg-gray-100 dark:bg-gray-700 px-4 py-1 rounded-full">
                    {isBreak ? '🍃 Break Time' : '🎯 Focus Time'}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="flex gap-4 mt-4 mb-6">
                  <button
                    onClick={toggleTimer}
                    className={`px-8 py-3 rounded-full font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 shadow-md ${
                      isActive
                        ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500'
                        : 'bg-primary-500 hover:bg-primary-600 text-white focus:ring-primary-500'
                    }`}
                  >
                    {isActive ? '⏸️ Pause' : '▶️ Start'}
                  </button>
                  
                  <button
                    onClick={resetTimer}
                    className="px-8 py-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 shadow-md transition-all duration-200"
                  >
                    🔄 Reset
                  </button>
                </div>
                
                <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  {isBreak ? 
                    "Take a moment to relax and recharge 🧘‍♂️" : 
                    "Stay focused on your current task 🚀"}
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/2">
            <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl overflow-hidden">
              <div className="p-5">
                <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
                  <span className="mr-2">📊</span> Today's Progress
                </h3>
                
                {/* Circular Progress Chart */}
                <div className="mb-6 bg-white dark:bg-gray-800/70 rounded-lg p-5 shadow-sm">
                  <div className="flex items-center justify-center mb-4">
                    <div className="relative w-48 h-48">
                      {/* Background circle */}
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="10"
                          className="dark:stroke-gray-700"
                        />
                        
                        {/* Progress arc */}
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="url(#progressGradient)"
                          strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray="283"
                          strokeDashoffset={283 - (283 * completionPercentage) / 100}
                          transform="rotate(-90 50 50)"
                        />
                        
                        {/* Define gradient */}
                        <defs>
                          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#4f46e5" />
                            <stop offset="100%" stopColor="#6366f1" />
                          </linearGradient>
                        </defs>
                      </svg>
                      
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-5xl font-bold text-primary-600 dark:text-primary-400">
                          {completionPercentage}%
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          of daily goal
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-800 dark:text-white">{completedSessions}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Sessions completed</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-800 dark:text-white">{dailyGoal}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Daily target</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-800 dark:text-white">{dailyGoal - completedSessions}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Sessions left</div>
                    </div>
                  </div>
                </div>
                
                {/* Hourly Activity Chart */}
                <div className="bg-white dark:bg-gray-800/70 rounded-lg p-4 shadow-sm">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                    Hourly Focus Sessions
                  </h4>
                  
                  <div className="flex items-end h-36 justify-between px-3">
                    {hourlyData.map((segment, i) => (
                      <div key={i} className="flex flex-col items-center group relative">
                        <div 
                          className={`w-8 rounded-t-lg transition-all duration-300 ${
                            currentHour === segment.hour ? 'bg-primary-500' : 
                            segment.sessions > 0 ? 'bg-primary-400/70' : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                          style={{ 
                            height: `${Math.max(5, (segment.sessions / 3) * 100)}%`
                          }}
                        ></div>
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 pointer-events-none">
                          {segment.sessions} {segment.sessions === 1 ? 'session' : 'sessions'}
                        </div>
                        
                        <div className={`text-xs mt-2 ${
                          currentHour === segment.hour 
                            ? 'font-bold text-primary-600 dark:text-primary-400' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {segment.hour > 12 ? segment.hour - 12 : segment.hour}{segment.hour >= 12 ? 'PM' : 'AM'}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Focus sessions completed throughout today
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
