import { Link } from "react-router-dom";

function Navbar() {
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
          <li>
            <Link to="/login">Login</Link>
          </li>
          <li>
            <Link to="/create-account">Create Account</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
