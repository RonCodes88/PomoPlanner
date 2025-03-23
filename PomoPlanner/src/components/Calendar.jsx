import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { lightGreen, green } from "@mui/material/colors";
import dayjs from "dayjs";
import React, { useState } from "react";

// Sample task data - replace with your actual task fetching mechanism
const sampleTasks = {
  "2025-03-23": [
    { id: 1, title: "Complete project", time: "10:00 AM" },
    { id: 2, title: "Team meeting", time: "2:00 PM" }
  ],
  "2025-03-24": [
    { id: 3, title: "Doctor appointment", time: "9:30 AM" }
  ]
};

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [showSideView, setShowSideView] = useState(true);
  
  const formattedDate = selectedDate.format('YYYY-MM-DD');
  const tasksForSelectedDate = sampleTasks[formattedDate] || [];
  
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setShowSideView(true);
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
              '& .MuiPickersCalendarHeader-label': {
                color: "black",
              },
              '& .MuiPickersYear-yearButton': {
                color: "black",
              },
              '& .Mui-selected': {
                backgroundColor: `${green[500]} !important`,
                color: 'white !important', // Text color for the selected date
              },
              '& .Mui-selected:hover': {
                backgroundColor: `${green[600]} !important`,
              },
              '& .MuiPickersDay-today': {
                borderColor: lightGreen[500],
              }
            }} 
          />
        </LocalizationProvider>
      </div>
      
      {showSideView && (
        <div className="border p-4 rounded-lg shadow-md w-64">
          <h3 className="text-lg font-semibold mb-2">
            Tasks for {selectedDate.format('MMMM D, YYYY')}
          </h3>
          
          {tasksForSelectedDate.length > 0 ? (
            <ul className="space-y-2">
              {tasksForSelectedDate.map(task => (
                <li key={task.id} className="p-2 text-black bg-gray-50 rounded">
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-gray-600">{task.time}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No tasks for this day</p>
          )}
          
          <button 
            className="mt-4 bg-green-500 text-black px-4 py-2 rounded hover:bg-green-600"
            onClick={() => {/* Add task functionality here */}}
          >
            Add Task
          </button>
        </div>
      )}
    </div>
  );
}