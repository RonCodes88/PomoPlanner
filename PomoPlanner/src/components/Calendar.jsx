import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { lightGreen, green } from "@mui/material/colors";
import dayjs from "dayjs";
import React, { useState } from "react";

// Sample task data - replace with your actual task fetching mechanism
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

  const handleAddTask = () => {
    if (newTaskTitle.trim() === "") return;

    // Only validate and show error when user tries to save
    if (newTaskTime && !validateTime(newTaskTime)) {
      setTimeError("Please enter time in format HH:MM AM/PM (e.g., 10:30 AM)");
      return;
    }

    // Create a new task object
    const newTask = {
      id: Date.now(), // Simple way to generate unique ID
      title: newTaskTitle,
      time: newTaskTime || "No time set",
      completed: false, // Initialize new tasks as not completed
    };

    // Update tasks state
    const updatedTasks = {
      ...tasks,
      [formattedDate]: [...(tasks[formattedDate] || []), newTask],
    };

    setTasks(updatedTasks);

    // Reset form
    setNewTaskTitle("");
    setNewTaskTime("");
    setTimeError("");
    setShowAddTaskForm(false);
  };

  // Add this new function to handle checkbox changes
  const handleTaskCompletionToggle = (taskId) => {
    const updatedTasks = {
      ...tasks,
      [formattedDate]: tasksForSelectedDate.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ),
    };

    setTasks(updatedTasks);
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
                color: "white !important",
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

          {sortedTasks.length > 0 ? (
            <ul className="space-y-2">
              {sortedTasks.map((task) => (
                <li
                  key={task.id}
                  className="p-2 text-black bg-gray-50 rounded flex items-center"
                >
                  <input
                    type="checkbox"
                    className="mr-3 h-4 w-4 text-green-500 border-gray-300 rounded focus:ring-green-400"
                    checked={task.completed}
                    onChange={() => handleTaskCompletionToggle(task.id)}
                  />
                  <div className="flex-grow text-center">
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
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No tasks for this day</p>
          )}

          {showAddTaskForm ? (
            <div className="mt-4 space-y-3">
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
                  className={`w-full p-2 border ${timeError ? "border-red-500" : "border-gray-300"} rounded focus:outline-none focus:ring-2 focus:ring-green-400`}
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
