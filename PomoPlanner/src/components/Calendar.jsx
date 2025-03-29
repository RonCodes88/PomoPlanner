import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { lightGreen, green } from "@mui/material/colors";
import dayjs from "dayjs";
import React, { useState } from "react";

import TaskItem from "./TaskItem";
import EditTaskForm from "./EditTaskForm";
import AddTaskForm from "./AddTaskForm";
import { timeToMinutes } from "../utils/timeUtils";

// API base URL
const API_URL = "http://localhost:5000/api";

// Sample task data
const sampleTasks = {
  "2025-03-23": [
    { id: 1, title: "Complete project", time: "10:00 AM", completed: false, pomodoros: 2 },
    { id: 2, title: "Team meeting", time: "2:00 PM", completed: false, pomodoros: 1  },
  ],
  "2025-03-24": [
    { id: 3, title: "Doctor appointment", time: "9:30 AM", completed: false, pomodoros: 2 },
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

  // Send POST request to API but use local state for UI
  const handleAddTask = async (title, time, pomodoros = 0) => {
    console.log("Adding task with:", title, time, pomodoros);  // Debugging log

    try {
        setLoading(true);

        const newTask = {
            date: formattedDate,
            title: title,
            time: time || "No time set",
            completed: false,
            pomodoros: pomodoros  // Include pomodoros
        };

        await fetch(`${API_URL}/tasks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newTask),
        });

        console.log("Task sent to API:", newTask);  // Debugging log

        const localTask = { ...newTask, id: Date.now() };

        setTasks((prev) => ({
            ...prev,
            [formattedDate]: [...(prev[formattedDate] || []), localTask],
        }));

        setShowAddTaskForm(false);
    } catch (err) {
        console.error("Error adding task:", err);
        setError("Failed to add task. Please try again.");
    } finally {
        setLoading(false);
    }
};

  
  // Send PUT request to API to update task completion status
  const handleTaskCompletionToggle = async (taskId) => {
    try {
      // Find the task to toggle
      const task = tasksForSelectedDate.find((t) => t.id === taskId);
      if (!task) return;

      // Send PUT request to API (just for the server logs)
      await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: !task.completed,
        }),
      });

      // Update local state directly
      setTasks((prev) => ({
        ...prev,
        [formattedDate]: prev[formattedDate].map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        ),
      }));
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task. Please try again.");
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
        time: time || "No time set",
        pomodoros: pomodoros,  // Include Pomodoros
      };
  
      // Send PUT request to API (just for the server logs)
      await fetch(`${API_URL}/tasks/${editingTaskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTaskData),
      });
  
      // Update local state directly
      setTasks((prev) => ({
        ...prev,
        [formattedDate]: prev[formattedDate].map((t) =>
          t.id === editingTaskId ? { ...t, ...updatedTaskData } : t
        ),
      }));
  
      // Exit edit mode
      setEditingTaskId(null);
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