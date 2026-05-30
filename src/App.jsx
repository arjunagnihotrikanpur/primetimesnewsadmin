import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import Videos from "./pages/Videos";
import Messages from "./pages/Messages";
import Theme from "./pages/Theme";
import Notifications from "./pages/Notifications";
import Channels from "./pages/Channels";

export default function App() {
  const isAuthenticated = localStorage.getItem("admin-auth");

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />

      <Route path="/categories" element={<Categories />} />

      <Route path="/videos" element={<Videos />} />

      <Route path="/messages" element={<Messages />} />

      <Route path="/theme" element={<Theme />} />

      <Route path="/notifications" element={<Notifications />} />

      <Route path="/channels" element={<Channels />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
