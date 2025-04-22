import { Routes, Route } from "react-router-dom";
import Calendar from "./components/Calendar";
import Navbar from "./components/NavBar";
import LoginPage from "./pages/LoginPage";
import CreateAccountPage from "./pages/CreateAccountPage";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Calendar />
                </>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/create-account" element={<CreateAccountPage />} />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
