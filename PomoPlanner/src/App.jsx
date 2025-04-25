import { Routes, Route } from "react-router-dom";
import Calendar from "./components/Calendar";
import Navbar from "./components/NavBar";
import LoginPage from "./pages/LoginPage";
import CreateAccountPage from "./pages/CreateAccountPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import TasksPage from "./pages/TasksPage";
import ChatbotComponent from "./components/ChatbotComponent";

function HomePage() {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 w-full">
        <Calendar />
      </div>
    </div>
  );
}

// Create a separate component to use the auth context
function AppContent() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-col items-center justify-center flex-1 p-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create-account" element={<CreateAccountPage />} />
          <Route path="/tasks" element={<TasksPage />} />
        </Routes>
      </div>

      {/* Floating chatbot icon */}
      {user && <ChatbotComponent />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
