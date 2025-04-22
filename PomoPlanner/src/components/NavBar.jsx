import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="p-4 w-full">
      <div className="flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <img
            src="/favicon.ico"
            alt="PomoPlanner logo"
            className="w-6 h-6 mr-2"
          />
          <h1 className="text-2xl font-bold">PomoPlanner</h1>
        </Link>
        <ul className="flex space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-green-700">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800 hover:underline"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <li>
                <Link to="/login" className="hover:text-green-500">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/create-account" className="hover:text-green-500">
                  Create Account
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
