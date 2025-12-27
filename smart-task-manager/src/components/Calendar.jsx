import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

const Calendar = ({ tasks, onSelectDate, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });
  
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const getTasksForDate = (date) => {
    return tasks.filter(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), date)
    );
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        
        <div className="flex space-x-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
          >
            <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
          >
            <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-7 text-center text-xs leading-6 text-gray-500 dark:text-gray-400">
          <div className="py-2">Sun</div>
          <div className="py-2">Mon</div>
          <div className="py-2">Tue</div>
          <div className="py-2">Wed</div>
          <div className="py-2">Thu</div>
          <div className="py-2">Fri</div>
          <div className="py-2">Sat</div>
        </div>
        
        <div className="grid grid-cols-7 text-sm">
          {Array(daysInMonth[0].getDay()).fill(null).map((_, index) => (
            <div key={`empty-${index}`} className="py-2 px-3 text-center text-gray-400 dark:text-gray-600"></div>
          ))}
          
          {daysInMonth.map((day) => {
            const tasksForDay = getTasksForDate(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div 
                key={day.toString()}
                className={`py-2 px-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  !isSameMonth(day, currentMonth) ? 'text-gray-400 dark:text-gray-600' : ''
                } ${isSelected ? 'bg-primary-100 dark:bg-primary-900' : ''}`}
                onClick={() => onSelectDate(day)}
              >
                <div className="flex flex-col items-center">
                  <span className={`text-center ${
                    isToday ? 'bg-primary-500 text-white rounded-full w-7 h-7 flex items-center justify-center' : ''
                  }`}>
                    {format(day, 'd')}
                  </span>
                  
                  {tasksForDay.length > 0 && (
                    <div className="mt-1 h-1 w-1 rounded-full bg-primary-500"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
