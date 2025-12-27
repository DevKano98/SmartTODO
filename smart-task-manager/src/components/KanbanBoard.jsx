import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import useTaskStore from '../store/taskStore';
import TaskCard from './TaskCard';
import { useAuth } from '../context/AuthContext';

const KanbanBoard = ({ tasks, onEditTask }) => {
  const { updateTask } = useTaskStore();
  const { currentUser } = useAuth();
  
  const [columns] = useState({
    'to-do': {
      id: 'to-do',
      title: 'To Do',
      taskIds: tasks.filter(task => task.status === 'to-do').map(task => task.id)
    },
    'in-progress': {
      id: 'in-progress',
      title: 'In Progress',
      taskIds: tasks.filter(task => task.status === 'in-progress').map(task => task.id)
    },
    'completed': {
      id: 'completed',
      title: 'Completed',
      taskIds: tasks.filter(task => task.status === 'completed').map(task => task.id)
    }
  });
  
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    
    // If there's no destination or the item was dropped back in the same place
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }
    
    const task = tasks.find(task => task.id === draggableId);
    if (!task) return;
    
    // Update task status based on the destination column
    const newStatus = destination.droppableId;
    
    updateTask(task.id, { 
      ...task,
      status: newStatus
    }, currentUser.uid);
  };
  
  const getTasksByColumn = (columnId) => {
    const columnTaskIds = columns[columnId].taskIds;
    // Create a fresh filtered list from current tasks
    // This ensures we see updates even for tasks that weren't in the original columnTaskIds
    return tasks.filter(task => task.status === columnId);
  };
  
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.values(columns).map(column => (
          <div key={column.id} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">
              {column.title} ({getTasksByColumn(column.id).length})
            </h3>
            
            <Droppable droppableId={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-4 min-h-[200px]"
                >
                  {getTasksByColumn(column.id).map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <TaskCard task={task} onEdit={onEditTask} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
