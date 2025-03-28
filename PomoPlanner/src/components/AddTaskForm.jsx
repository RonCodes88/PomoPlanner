import React, { useState } from "react";

const AddTaskForm = ({ onAddTask, onCancel }) => {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [pomodoros, setPomodoros] = useState(0);
  const [timeError, setTimeError] = useState("");

  const handleTimeChange = (e) => {
    const timeValue = e.target.value;
    setTime(timeValue);
    if (timeError) setTimeError("");
  };

  const handleSubmit = () => {
    if (title.trim() === "") return;

    // Validate time format
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM|am|pm)$/;
    if (time && !timeRegex.test(time)) {
      setTimeError("Please enter time in format HH:MM AM/PM (e.g., 10:30 AM)");
      return;
    }

    onAddTask(title, time, parseInt(pomodoros, 10)); // Include pomodoros
    setTitle("");
    setTime("");
    setPomodoros(0);
  };

  return (
    <div className="mt-4 space-y-3">
      <input
        type="text"
        placeholder="Task name"
        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div>
        <input
          type="text"
          placeholder="Time (e.g., 10:30 AM)"
          className={`w-full p-2 border ${
            timeError ? "border-red-500" : "border-gray-300"
          } rounded focus:outline-none focus:ring-2 focus:ring-green-400`}
          value={time}
          onChange={handleTimeChange}
        />
        {timeError && <p className="text-red-500 text-xs mt-1">{timeError}</p>}
      </div>
      <div>
        <input
          type="number"
          placeholder="Pomodoros (default: 0)"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          value={pomodoros}
          onChange={(e) => setPomodoros(e.target.value)}
          min="0"
        />
      </div>
      <div className="flex space-x-2">
        <button
          className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={handleSubmit}
        >
          Save
        </button>
        <button
          className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
          onClick={() => onCancel()}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddTaskForm;
