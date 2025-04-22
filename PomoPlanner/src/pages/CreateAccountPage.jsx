import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateAccountPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setNotification(null);

    try {
      const response = await fetch("http://localhost:5000/api/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success case
        setNotification({ type: "success", message: data.message });
        setEmail("");
        setPassword("");
        setTimeout(() => {
          navigate("/"); // Redirect to home page after showing success message
        }, 2000);
      } else {
        // Error case
        setNotification({ type: "error", message: data.message });
      }
    } catch (error) {
      setNotification({
        type: "error",
        message: "An error occurred. Please try again.",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Create Account</h1>

      {notification && (
        <div
          className={`p-3 mb-4 rounded-md w-full max-w-md text-center ${
            notification.type === "success"
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-red-100 text-red-700 border border-red-300"
          }`}
        >
          {notification.message}
        </div>
      )}

      <form
        onSubmit={handleCreateAccount}
        className="flex flex-col space-y-4 w-80"
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border rounded"
          disabled={isLoading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 border rounded"
          disabled={isLoading}
        />
        <button
          type="submit"
          className={`p-2 ${isLoading ? "bg-gray-400" : "bg-green-500"} text-white`}
          disabled={isLoading}
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}

export default CreateAccountPage;
