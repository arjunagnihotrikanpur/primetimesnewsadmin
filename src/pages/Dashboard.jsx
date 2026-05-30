import { useEffect, useMemo, useState } from "react";

import Sidebar from "../components/Sidebar";

import { getCategories } from "../services/categories";

import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

import { db } from "../services/firebase";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";

const COLORS = [
  "#3B82F6",
  "#8B5CF6",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#EF4444",
];

export default function Dashboard() {
  const [categories, setCategories] = useState([]);

  const [scheduledFor, setScheduledFor] = useState("");

  const loadCategories = async () => {
    const data = await getCategories();

    setCategories(data);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const allVideos = categories.flatMap((category) => category.videos || []);

  const totalViews = allVideos.reduce(
    (sum, video) => sum + (video.views || 0),
    0,
  );

  const featuredVideos = allVideos.filter((video) => video.featured).length;

  const hiddenVideos = allVideos.filter((video) => video.hidden).length;

  const categoryChartData = useMemo(() => {
    return categories.map((category) => ({
      name: category.title,
      videos: category.videos?.length || 0,
    }));
  }, [categories]);

  const topVideosData = useMemo(() => {
    return [...allVideos]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map((video) => ({
        name:
          video.title?.length > 18
            ? video.title.slice(0, 18) + "..."
            : video.title,
        views: video.views || 0,
      }));
  }, [allVideos]);

  return (
    <div
      className="layout"
      style={{
        background: "#050816",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <Sidebar />

      <div
        className="content"
        style={{
          padding: "28px",
        }}
      >
        <div
          className="topbar"
          style={{
            marginBottom: "30px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "36px",
              fontWeight: "800",
              color: "#fff",
            }}
          >
            Dashboard
          </h1>

          <p
            style={{
              marginTop: "10px",
              color: "#94a3b8",
              fontSize: "15px",
            }}
          >
            Overview of your platform analytics and content.
          </p>
        </div>

        <div
          className="stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "22px",
            marginBottom: "32px",
          }}
        >
          <StatCard
            title="Categories"
            value={categories.length}
            gradient="linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)"
          />

          <StatCard
            title="Total Videos"
            value={allVideos.length}
            gradient="linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)"
          />

          <StatCard
            title="Total Views"
            value={totalViews.toLocaleString()}
            gradient="linear-gradient(135deg, #059669 0%, #10b981 100%)"
          />

          <StatCard
            title="Featured Videos"
            value={featuredVideos}
            gradient="linear-gradient(135deg, #d97706 0%, #f59e0b 100%)"
          />

          <StatCard
            title="Hidden Videos"
            value={hiddenVideos}
            gradient="linear-gradient(135deg, #dc2626 0%, #ef4444 100%)"
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
          }}
        >
          {/* Videos Per Category */}
          <div style={chartCard}>
            <h2
              style={{
                marginTop: 0,
                marginBottom: "20px",
                fontSize: "22px",
                fontWeight: "700",
              }}
            >
              Videos Per Category
            </h2>

            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />

                  <XAxis dataKey="name" stroke="#94a3b8" />

                  <YAxis stroke="#94a3b8" />

                  <Tooltip />

                  <Bar
                    dataKey="videos"
                    fill="#3B82F6"
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Videos */}
          <div style={chartCard}>
            <h2
              style={{
                marginTop: 0,
                marginBottom: "20px",
                fontSize: "22px",
                fontWeight: "700",
              }}
            >
              Top Videos
            </h2>

            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={topVideosData}
                    dataKey="views"
                    nameKey="name"
                    outerRadius={110}
                  >
                    {topVideosData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, gradient }) {
  return (
    <div
      style={{
        background: "linear-gradient(180deg, #0f172a 0%, #111827 100%)",
        border: "1px solid #1e293b",
        borderRadius: "24px",
        padding: "24px",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
      }}
    >
      <div
        style={{
          width: "58px",
          height: "58px",
          borderRadius: "18px",
          background: gradient,
          marginBottom: "20px",
        }}
      />

      <h2
        style={{
          margin: 0,
          fontSize: "34px",
          fontWeight: "800",
          color: "#fff",
        }}
      >
        {value}
      </h2>

      <p
        style={{
          marginTop: "10px",
          color: "#94a3b8",
          fontSize: "15px",
        }}
      >
        {title}
      </p>
    </div>
  );
}

const chartCard = {
  background: "linear-gradient(180deg, #0f172a 0%, #111827 100%)",
  border: "1px solid #1e293b",
  borderRadius: "28px",
  padding: "26px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
};
