import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { lightGreen, green } from "@mui/material/colors";
import dayjs from "dayjs";
import React, { useState } from "react";

// API base URL - change this to match your Flask server
const API_URL = "http://localhost:5000/api";

// Sample task data
const sampleTasks = {
  "2025-03-23": [
    { id: 1, title: "Complete project", time: "10:00 AM", completed: false },
    { id: 2, title: "Team meeting", time: "2:00 PM", completed: false },
  ],
  "2025-03-24": [
    { id: 3, title: "Doctor appointment", time: "9:30 AM", completed: false },
  ],
};

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [showSideView, setShowSideView] = useState(true);
  const [tasks, setTasks] = useState(sampleTasks);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");
  const [timeError, setTimeError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // New states for editing
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingTime, setEditingTime] = useState("");
  const [editingTimeError, setEditingTimeError] = useState("");

  // Get tasks for the selected date and sort them by time
  const formattedDate = selectedDate.format("YYYY-MM-DD");
  const tasksForSelectedDate = tasks[formattedDate] || [];

  // Function to convert time string to minutes for comparison
  const timeToMinutes = (timeStr) => {
    // Handle "No time set" case
    if (timeStr === "No time set") return Number.MAX_SAFE_INTEGER; // Put these at the end

    // Extract hours, minutes, and AM/PM
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s?(AM|PM|am|pm)$/);
    if (!match) return Number.MAX_SAFE_INTEGER; // Invalid format goes to the end

    let [_, hours, minutes, period] = match;
    hours = parseInt(hours);
    minutes = parseInt(minutes);

    // Convert to 24-hour format for proper sorting
    if (period.toUpperCase() === "PM" && hours < 12) {
      hours += 12;
    } else if (period.toUpperCase() === "AM" && hours === 12) {
      hours = 0;
    }

    return hours * 60 + minutes;
  };

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

  const validateTime = (timeStr) => {
    if (!timeStr) return true; // Empty is allowed as it defaults to "No time set"

    // Check for valid time format with AM or PM
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM|am|pm)$/;
    return timeRegex.test(timeStr);
  };

  const handleTimeChange = (e) => {
    const timeValue = e.target.value;
    setNewTaskTime(timeValue);
    // Remove error message when the user changes the input
    // but don't validate until they click save
    if (timeError) {
      setTimeError("");
    }
  };

  const handleEditingTimeChange = (e) => {
    const timeValue = e.target.value;
    setEditingTime(timeValue);
    // Remove error message when the user changes the input
    if (editingTimeError) {
      setEditingTimeError("");
    }
  };

  // Send POST request to API but use local state for UI
  const handleAddTask = async () => {
    if (newTaskTitle.trim() === "") return;

    // Only validate and show error when user tries to save
    if (newTaskTime && !validateTime(newTaskTime)) {
      setTimeError("Please enter time in format HH:MM AM/PM (e.g., 10:30 AM)");
      return;
    }

    try {
      setLoading(true);

      // Create a new task object
      const newTask = {
        date: formattedDate,
        title: newTaskTitle,
        time: newTaskTime || "No time set",
        completed: false,
      };

      // Send POST request to API (just for the server logs)
      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      });

      // Create local task object with a unique ID
      const localTask = {
        ...newTask,
        id: Date.now(), // Simple local ID generation
      };

      // Update local state only
      setTasks((prev) => ({
        ...prev,
        [formattedDate]: [...(prev[formattedDate] || []), localTask],
      }));

      // Reset form
      setNewTaskTitle("");
      setNewTaskTime("");
      setTimeError("");
      setShowAddTaskForm(false);
    } catch (err) {
      console.error("Error adding task:", err);
      setError("Failed to add task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Send PUT request to API but use local state for UI
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
    setEditingTitle(task.title);
    setEditingTime(task.time);
    setEditingTimeError("");
  };

  // Send PUT request to API but use local state for UI
  const saveEditedTask = async () => {
    if (editingTitle.trim() === "") return;

    // Validate time format
    if (editingTime && !validateTime(editingTime)) {
      setEditingTimeError(
        "Please enter time in format HH:MM AM/PM (e.g., 10:30 AM)"
      );
      return;
    }

    try {
      setLoading(true);

      // Find the task being edited
      const task = tasksForSelectedDate.find((t) => t.id === editingTaskId);
      if (!task) return;

      // Create updated task data
      const updatedTaskData = {
        title: editingTitle,
        time: editingTime || "No time set",
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

  // Cancel editing
  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingTimeError("");
  };

  // The rest of your component with the JSX render remains the same
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
            <ul className="space-y-2">
              {sortedTasks.map((task) => (
                <li
                  key={task.id}
                  className="p-2 text-black bg-gray-50 rounded flex items-center"
                >
                  {editingTaskId === task.id ? (
                    // Editing mode
                    <div className="w-full space-y-2">
                      <input
                        type="text"
                        className="w-full p-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-400"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        autoFocus
                      />
                      <div>
                        <input
                          type="text"
                          className={`w-full p-1 border ${
                            editingTimeError
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded focus:outline-none focus:ring-1 focus:ring-green-400`}
                          value={editingTime}
                          onChange={handleEditingTimeChange}
                          placeholder="Time (e.g., 10:30 AM)"
                        />
                        {editingTimeError && (
                          <p className="text-red-500 text-xs mt-1">
                            {editingTimeError}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          className="flex-1 bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-sm"
                          onClick={saveEditedTask}
                        >
                          Save
                        </button>
                        <button
                          className="flex-1 bg-gray-200 text-gray-800 px-2 py-1 rounded hover:bg-gray-300 text-sm"
                          onClick={cancelEditing}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Display mode
                    <>
                      <input
                        type="checkbox"
                        className="mr-3 h-4 w-4 text-green-500 border-gray-300 rounded focus:ring-green-400"
                        checked={task.completed}
                        onChange={() => handleTaskCompletionToggle(task.id)}
                      />
                      <div
                        className="flex-grow text-center cursor-pointer"
                        onClick={() => !task.completed && startEditing(task)}
                      >
                        <p
                          className={`font-medium ${
                            task.completed ? "line-through text-gray-500" : ""
                          }`}
                        >
                          {task.title}
                        </p>
                        <p
                          className={`text-sm text-gray-600 ${
                            task.completed ? "line-through" : ""
                          }`}
                        >
                          {task.time}
                        </p>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No tasks for this day</p>
          )}

          {showAddTaskForm ? (
            <div className="mt-4 space-y-3">
              {/* New task form */}
              <input
                type="text"
                placeholder="Task name"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
              <div>
                <input
                  type="text"
                  placeholder="Time (e.g., 10:30 AM)"
                  className={`w-full p-2 border ${
                    timeError ? "border-red-500" : "border-gray-300"
                  } rounded focus:outline-none focus:ring-2 focus:ring-green-400`}
                  value={newTaskTime}
                  onChange={handleTimeChange}
                />
                {timeError && (
                  <p className="text-red-500 text-xs mt-1">{timeError}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  onClick={handleAddTask}
                >
                  Save
                </button>
                <button
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                  onClick={() => {
                    setShowAddTaskForm(false);
                    setTimeError("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
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
