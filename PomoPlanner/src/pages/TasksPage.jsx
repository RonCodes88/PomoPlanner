import { useState, useEffect, useCallback, useRef } from "react";
import dayjs from "dayjs";
import { getUserId } from "../utils/dbUtils";
import TaskItem from "../components/TaskItem";
import { Button, Typography } from "@mui/material";

const API_URL = "http://localhost:5000/api";

export default function TodayTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const userId = getUserId();

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [pomodoroState, setPomodoroState] = useState({});
  const pomodoroStateRef = useRef({});
  const selectedTaskIdRef = useRef(null);

  const [isWorkSession, setIsWorkSession] = useState(true);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalIdRef = useRef(null);
  const lastSessionWasWork = useRef(false); // Added to track session type before transition

  const fetchTodaysTasks = useCallback(async () => {
    const today = dayjs().format("YYYY-MM-DD"); // Today's date in the format "YYYY-MM-DD"
    
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/tasks?userId=${userId}`);
      console.log("Today’s date:", today);  // Logs the date you're checking against
  
      if (response.ok) {
        const tasksList = await response.json();
  
        // Filter tasks to only include those for today
        const todaysTasks = tasksList.filter((task) =>
          dayjs(task.date).isSame(today, "day") // Only include tasks for today
        );
  
        // Set tasks state to today's tasks
        setTasks(todaysTasks);
  
        // Initialize Pomodoro state
        const initialPomodoroState = todaysTasks.reduce((acc, task) => {
          acc[task.id] = 0; // Initialize each task's Pomodoro state
          return acc;
        }, {});
        setPomodoroState(initialPomodoroState);
        pomodoroStateRef.current = initialPomodoroState;
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to load today's tasks");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Network error when loading today's tasks");
    } finally {
      setLoading(false);
    }
  }, [userId]);
  
  useEffect(() => {
    if (userId) {
      fetchTodaysTasks();
    }
  }, [userId, fetchTodaysTasks]);
  
  

  const handleTaskSelect = (taskId) => {
    setSelectedTaskId(taskId);
    selectedTaskIdRef.current = taskId;
    setPomodoroState((prev) => {
      const newState = {
        ...prev,
        [taskId]: prev[taskId] || 0,
      };
      pomodoroStateRef.current = newState;
      return newState;
    });
  };

  const toggleTimer = () => {
    if (isRunning) {
      clearInterval(intervalIdRef.current);
    } else {
      intervalIdRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalIdRef.current);
            setIsRunning(false);

            if (!isWorkSession) {
              // Just finished a break — now count the Pomodoro
              if (lastSessionWasWork.current) {
                const taskId = selectedTaskIdRef.current;
                if (taskId) {
                  const newCount = (pomodoroStateRef.current[taskId] || 0) + 1;
                  const updatedState = {
                    ...pomodoroStateRef.current,
                    [taskId]: newCount,
                  };
                  setPomodoroState(updatedState);
                  pomodoroStateRef.current = updatedState;
                }
              }
            }

            lastSessionWasWork.current = isWorkSession;
            setIsWorkSession((prev) => !prev);
            setTimeLeft(!isWorkSession ? 25 * 60 : 5 * 60);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    clearInterval(intervalIdRef.current);
    setIsRunning(false);
    setIsWorkSession(true);
    setTimeLeft(25 * 60);
  };

  const fastForward = () => {
    clearInterval(intervalIdRef.current);
    setIsRunning(false);

    if (!isWorkSession && lastSessionWasWork.current) {
      // Finished break, increment Pomodoro
      const taskId = selectedTaskIdRef.current;
      if (taskId) {
        const newCount = (pomodoroStateRef.current[taskId] || 0) + 1;
        const updatedState = {
          ...pomodoroStateRef.current,
          [taskId]: newCount,
        };
        setPomodoroState(updatedState);
        pomodoroStateRef.current = updatedState;
      }
    }

    lastSessionWasWork.current = isWorkSession;
    setIsWorkSession((prev) => !prev);
    setTimeLeft(!isWorkSession ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <div className="tasks-container" style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Today's Tasks</h2>

      <div
  style={{
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#fdfdfd",
    textAlign: "center",
  }}
>
  <Typography variant="h6" style={{ fontWeight: "600", marginBottom: "10px" }}>
    {isWorkSession ? "Work Session" : "Break Time"}
  </Typography>

  <Typography
    variant="h3"
    style={{
      fontFamily: "'Courier New', Courier, monospace",
      marginBottom: "20px",
      color: isWorkSession ? "#1976d2" : "#43a047",
    }}
  >
    {formatTime(timeLeft)}
  </Typography>

  <div style={{ marginBottom: "15px" }}>
    <Button
      variant="contained"
      color={isRunning ? "secondary" : "primary"}
      onClick={toggleTimer}
      style={{ marginRight: "10px", fontWeight: "bold" }}
    >
      {isRunning ? "Pause" : "Start"}
    </Button>

    <Button
      variant="outlined"
      color="error"
      onClick={resetTimer}
      style={{ fontWeight: "bold" }}
    >
      Reset
    </Button>
  </div>

  <Button
    variant="outlined"
    color="info"
    onClick={fastForward}
    disabled={!isRunning}
    style={{ fontWeight: "bold" }}
  >
    Fast Forward to {isWorkSession ? "Break" : "Work"}
  </Button>
</div>


      {loading ? (
        <p style={{ textAlign: "center" }}>Loading today's tasks...</p>
      ) : error ? (
        <p style={{ textAlign: "center", color: "red" }}>{error}</p>
      ) : tasks.length > 0 ? (
        <div className="border p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2" style={{ textAlign: "center" }}>
            Tasks for {dayjs().format("MMMM D, YYYY")}
          </h3>
          <ul className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleTaskSelect(task.id)}
                style={{
                  cursor: "pointer",
                  border: task.id === selectedTaskId ? "2px solid blue" : "none",
                  padding: "10px",
                }}
              >
                <TaskItem
                  task={task}
                  onToggleComplete={() => console.log("Toggle complete")}
                  onStartEditing={(task) => console.log("Start editing", task)}
                />
                {task.id === selectedTaskId && (
                  <div>
                    <Typography variant="body2" style={{ textAlign: "right", marginTop: "5px" }}>
                      Pomodoros: {pomodoroState[task.id] || 0}
                    </Typography>
                  </div>
                )}
              </div>
            ))}
          </ul>
        </div>
      ) : (
        <p style={{ textAlign: "center", color: "gray" }}>No tasks for today</p>
      )}
    </div>
  );
}
