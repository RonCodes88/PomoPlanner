import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { lightGreen, green } from "@mui/material/colors";
import dayjs from "dayjs";
import React, { useState, useEffect } from "react"; // Import useEffect

import TaskItem from "./TaskItem";
import EditTaskForm from "./EditTaskForm";
import AddTaskForm from "./AddTaskForm";
import { timeToMinutes } from "../utils/timeUtils";
import { getUserId } from "../utils/dbUtils";

// API base URL
const API_URL = "http://localhost:5000/api";

// Sample task data
const sampleTasks = {
  "2025-03-23": [
    {
      id: 1,
      title: "Complete project",
      time: "10:00 AM",
      completed: false,
      pomodoros: 2,
    },
    {
      id: 2,
      title: "Team meeting",
      time: "2:00 PM",
      completed: false,
      pomodoros: 1,
    },
  ],
  "2025-03-24": [
    {
      id: 3,
      title: "Doctor appointment",
      time: "9:30 AM",
      completed: false,
      pomodoros: 2,
    },
  ],
};

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [showSideView, setShowSideView] = useState(true);
  const [tasks, setTasks] = useState(sampleTasks);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);

  const userId = getUserId();

  // Define fetchUserTasks inside useEffect or use useCallback
  const fetchUserTasks = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/tasks?userId=${userId}`);

      if (response.ok) {
        const tasksList = await response.json();

        // Group tasks by date
        const tasksByDate = {};
        tasksList.forEach((task) => {
          if (!tasksByDate[task.date]) {
            tasksByDate[task.date] = [];
          }
          tasksByDate[task.date].push(task);
        });

        setTasks(tasksByDate);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to load tasks");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Network error when loading tasks");
    } finally {
      setLoading(false);
    }
  }, [userId]); // Add userId as a dependency for useCallback

  // Now the effect uses the memoized callback
  useEffect(() => {
    if (userId) {
      fetchUserTasks();
    }
  }, [userId, fetchUserTasks]); // Add fetchUserTasks to dependencies

  // Get tasks for the selected date and sort them by time
  const formattedDate = selectedDate.format("YYYY-MM-DD");
  const tasksForSelectedDate = tasks[formattedDate] || [];

  // Sort tasks by time (earliest first)
  const sortedTasks = [...tasksForSelectedDate].sort((a, b) => {
    return timeToMinutes(a.time) - timeToMinutes(b.time);
  });

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setShowSideView(true);
    // Cancel any editing when changing dates
    setEditingTaskId(null);
  };

  const handleAddTask = async (task) => {
    try {
      // Use the currently selected date from the calendar
      const taskWithDate = {
        ...task,
        date: selectedDate.format("YYYY-MM-DD"),
      };

      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskWithDate),
      });

      if (response.ok) {
        const newTask = await response.json();

        // Update tasks by date correctly
        setTasks((prevTasks) => {
          const taskDate = newTask.date;
          return {
            ...prevTasks,
            [taskDate]: [...(prevTasks[taskDate] || []), newTask],
          };
        });

        setShowAddTaskForm(false);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to add task");
        console.error("Failed to add task:", errorData.message);
      }
    } catch (error) {
      console.error("Error adding task:", error);
      setError("Network error while adding task");
    }
  };

  // Send PUT request to API to update task completion status
  const handleTaskCompletionToggle = async (taskId) => {
    try {
      // Find the task to toggle
      const task = tasksForSelectedDate.find((t) => t.id === taskId);
      if (!task) return;

      // Send PUT request to API
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: !task.completed,
        }),
      });

      if (response.ok) {
        const updatedTask = await response.json();

        // Update local state with the server response
        setTasks((prev) => ({
          ...prev,
          [formattedDate]: prev[formattedDate].map((t) =>
            t.id === taskId ? updatedTask : t
          ),
        }));
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update task");
        console.error("Error toggling task completion:", errorData.message);
      }
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task. Please try again.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setTasks((prev) => {
          // Remove the task from the correct date array
          const updated = { ...prev };
          updated[formattedDate] = updated[formattedDate].filter(
            (t) => t.id !== taskId
          );
          return updated;
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to delete task");
      }
    } catch (error) {
      setError("Network error while deleting task");
    }
  };

  // Start editing a task
  const startEditing = (task) => {
    setEditingTaskId(task.id);
  };

  // Send PUT request to API to save edited task
  const saveEditedTask = async (title, time, pomodoros) => {
    try {
      setLoading(true);

      // Find the task being edited
      const task = tasksForSelectedDate.find((t) => t.id === editingTaskId);
      if (!task) return;

      // Create updated task data
      const updatedTaskData = {
        title: title,
        time: time || "",
        pomodoros: parseInt(pomodoros, 10) || 0,
        // Keep the date and userId the same
        date: task.date,
        userId: task.userId || userId,
      };

      // Send PUT request to API
      const response = await fetch(`${API_URL}/tasks/${editingTaskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTaskData),
      });

      if (response.ok) {
        const updatedTask = await response.json();

        // Update local state with the server response
        setTasks((prev) => ({
          ...prev,
          [formattedDate]: prev[formattedDate].map((t) =>
            t.id === editingTaskId ? updatedTask : t
          ),
        }));

        // Exit edit mode
        setEditingTaskId(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update task");
        console.error("Error from server:", errorData.message);
      }
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Render task items with conditional editing
  const renderTaskItems = () => {
    return sortedTasks.map((task) => {
      if (editingTaskId === task.id) {
        // Return the edit form for the task currently being edited
        return (
          <li key={task.id} className="p-2 text-black bg-gray-50 rounded">
            <EditTaskForm
              task={task}
              onSave={saveEditedTask}
              onCancel={() => setEditingTaskId(null)}
            />
          </li>
        );
      } else {
        // Return regular task items for all other tasks
        return (
          <TaskItem
            key={task.id}
            task={task}
            onToggleComplete={handleTaskCompletionToggle}
            onStartEditing={startEditing}
            onDelete={handleDeleteTask} 
          />
        );
      }
    });
  };

  return (
    <div className="flex">
      <div className="mr-4">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar
            value={selectedDate}
            onChange={handleDateChange}
            sx={{
              bgcolor: lightGreen[50],
              "& .MuiPickersCalendarHeader-label": {
                color: "black",
              },
              "& .MuiPickersYear-yearButton": {
                color: "black",
              },
              "& .Mui-selected": {
                backgroundColor: `${green[500]} !important`,
              },
              "& .Mui-selected:hover": {
                backgroundColor: `${green[600]} !important`,
              },
              "& .MuiPickersDay-today": {
                borderColor: lightGreen[500],
              },
            }}
          />
        </LocalizationProvider>
      </div>

      {showSideView && (
        <div className="border p-4 rounded-lg shadow-md w-64">
          <h3 className="text-lg font-semibold mb-2">
            Tasks for {selectedDate.format("MMMM D, YYYY")}
          </h3>

          {loading ? (
            <p>Loading tasks...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : sortedTasks.length > 0 ? (
            <ul className="space-y-2">{renderTaskItems()}</ul>
          ) : (
            <p className="text-gray-500">No tasks for this day</p>
          )}

          {showAddTaskForm ? (
            <AddTaskForm
              onAddTask={handleAddTask}
              onCancel={() => setShowAddTaskForm(false)}
              userId={userId}
            />
          ) : (
            <button
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
              onClick={() => setShowAddTaskForm(true)}
            >
              Add Task
            </button>
          )}
        </div>
      )}
    </div>
  );
}
