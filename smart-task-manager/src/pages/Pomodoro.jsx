import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import usePomodoroStore from '../store/pomodoroStore';
import PomodoroTimer from '../components/PomodoroTimer';
import Loading from '../components/Loading';

const Pomodoro = () => {
  const { currentUser } = useAuth();
  const { loading } = usePomodoroStore();
  
  if (loading) {
    return <Loading />;
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pomodoro Timer</h1>
      
      <div className="mx-auto max-w-4xl">
        <div className="card">
          <PomodoroTimer />
        </div>
      </div>
    </div>
  );
};

export default Pomodoro;
