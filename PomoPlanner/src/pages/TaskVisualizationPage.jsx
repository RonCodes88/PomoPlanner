import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2"; 
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Button, Typography } from "@mui/material";
import { getUserId } from "../utils/dbUtils";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_URL = "http://localhost:5000/api";

export default function TaskVisualizationPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const userId = getUserId();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/tasks?userId=${userId}`);

      if (response.ok) {
        const tasksList = await response.json();

        // Set tasks state to all tasks (no date filter)
        setTasks(tasksList);
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
  };

  useEffect(() => {
    if (userId) {
      fetchTasks();
    }
  }, [userId]);

  // Prepare data for the chart
  const completedTasksCount = tasks.filter((task) => task.completed).length; // Count completed tasks
  const pendingTasksCount = tasks.filter((task) => !task.completed).length; // Count pending tasks

  const chartData = {
    labels: ["Completed Tasks", "Pending Tasks"], // Labels for the chart
    datasets: [
      {
        label: "Task Status",
        data: [completedTasksCount, pendingTasksCount], // Number of completed and pending tasks
        backgroundColor: ["#1976d2", "#f44336"], // Blue for completed, Red for pending
        borderColor: ["#1976d2", "#f44336"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="task-visualization-container" style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      <Typography variant="h4" style={{ textAlign: "center", marginBottom: "20px" }}>
        Task Progress for All Tasks
      </Typography>

      {loading ? (
        <p style={{ textAlign: "center" }}>Loading tasks...</p>
      ) : error ? (
        <p style={{ textAlign: "center", color: "red" }}>{error}</p>
      ) : (
        <div>
          <Bar data={chartData} options={{ responsive: true }} /> 
        </div>
      )}

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <Button variant="outlined" onClick={fetchTasks} style={{ fontWeight: "bold" }}>
          Refresh Data
        </Button>
      </div>
    </div>
  );
}
