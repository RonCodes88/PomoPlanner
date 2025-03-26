import React, { useState } from "react";

const EditTaskForm = ({ task, onSave, onCancel }) => {
  const [title, setTitle] = useState(task.title);
  const [time, setTime] = useState(task.time);
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

    onSave(title, time);
  };

  return (
    <div className="w-full space-y-2">
      <input
        type="text"
        className="w-full p-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-400"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />
      <div>
        <input
          type="text"
          className={`w-full p-1 border ${
            timeError ? "border-red-500" : "border-gray-300"
          } rounded focus:outline-none focus:ring-1 focus:ring-green-400`}
          value={time}
          onChange={handleTimeChange}
          placeholder="Time (e.g., 10:30 AM)"
        />
        {timeError && <p className="text-red-500 text-xs mt-1">{timeError}</p>}
      </div>
      <div className="flex space-x-2">
        <button
          className="flex-1 bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-sm"
          onClick={handleSubmit}
        >
          Save
        </button>
        <button
          className="flex-1 bg-gray-200 text-gray-800 px-2 py-1 rounded hover:bg-gray-300 text-sm"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditTaskForm;