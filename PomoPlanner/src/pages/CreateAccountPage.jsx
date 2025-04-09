import { useState } from "react";

function CreateAccountPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:5000/api/create-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    alert(data.message);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Create Account</h1>
      <form onSubmit={handleCreateAccount} className="flex flex-col space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 border"
        />
        <button type="submit" className="p-2 bg-green-500 text-white">
          Create Account
        </button>
      </form>
    </div>
  );
}

export default CreateAccountPage;
