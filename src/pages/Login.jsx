import { useState } from "react";

export default function Login() {
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (password === "admin123") {
      localStorage.setItem("admin-auth", "true");

      window.location.reload();
    } else {
      alert("Wrong Password");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Admin Panel</h1>

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}
