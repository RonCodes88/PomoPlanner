import React from "react";

const TaskItem = ({ task, onToggleComplete, onStartEditing }) => {
  return (
    <li className="p-2 text-black bg-gray-50 rounded flex items-center">
      <input
        type="checkbox"
        className="mr-3 h-4 w-4 text-green-500 border-gray-300 rounded focus:ring-green-400"
        checked={task.completed}
        onChange={() => onToggleComplete(task.id)}
      />
      <div
        className="flex-grow text-center cursor-pointer"
        onClick={() => !task.completed && onStartEditing(task)}
      >
        <p
          className={`font-medium ${task.completed ? "line-through text-gray-500" : ""}`}
        >
          {task.title}
        </p>
        <p
          className={`text-sm text-gray-600 ${task.completed ? "line-through" : ""}`}
        >
          {task.time}
        </p>
        {task.pomodoros > 0 && (
          <p className="text-xs text-green-600 mt-1">
            ⌚ {task.pomodoros} Pomodoros
          </p>
        )}
      </div>
    </li>
  );
};

export default TaskItem;
