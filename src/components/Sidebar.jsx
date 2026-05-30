import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div>
        <h2>Prime Time News</h2>

        <nav>
          <Link to="/">Dashboard</Link>

          <Link to="/channels">Channels</Link>

          <Link to="/categories">Categories</Link>

          <Link to="/videos">Videos</Link>

          <Link to="/messages">Messages</Link>

          <Link to="/theme">Theme</Link>

          <Link to="/notifications">Notifications</Link>
        </nav>
      </div>

      <button>Logout</button>
    </div>
  );
}
