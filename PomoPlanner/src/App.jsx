import { Routes, Route } from "react-router-dom";
import Calendar from "./components/Calendar";
import Navbar from "./components/NavBar";
import LoginPage from "./pages/LoginPage";
import CreateAccountPage from "./pages/CreateAccountPage";

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <h1 className="text-3xl font-bold mb-5">PomoPlanner</h1>
              <Calendar />
            </>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create-account" element={<CreateAccountPage />} />
      </Routes>
    </div>
  );
}

export default App;
