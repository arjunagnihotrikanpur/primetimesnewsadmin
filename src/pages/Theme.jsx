import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";

import { getThemeSettings, updateThemeSettings } from "../services/settings";

export default function Theme() {
  const [backgroundColor, setBackgroundColor] = useState("#F8F5EE");

  const [headerColor, setHeaderColor] = useState("#4B4C47");

  const [categoryColor, setCategoryColor] = useState("#4B4C47");

  const [homeTitle, setHomeTitle] = useState("Watch Breaking News Anytime");

  const [baseColor, setBaseColor] = useState("#C40000");

  const loadTheme = async () => {
    const data = await getThemeSettings();

    setBackgroundColor(data.backgroundColor);

    setHeaderColor(data.headerColor);

    setHomeTitle(data.homeTitle);

    setBaseColor(data.baseColor);
  };

  useEffect(() => {
    loadTheme();
  }, []);

  const saveTheme = async () => {
    await updateThemeSettings({
      backgroundColor,
      headerColor,
      homeTitle,
      categoryColor,
      baseColor,
    });

    alert("Theme Updated");
  };

  const setDefaultTheme = async () => {
    await updateThemeSettings({
      backgroundColor: "#F8F5EE",
      headerColor: "#4B4C47",
      categoryColor: "#4B4C47",
      homeTitle: "Watch Breaking News Anytime",
      baseColor: "#C40000",
    });

    alert("Default Theme Set!");
  };

  return (
    <div
      className="layout"
      style={{
        background: "#0b1120",
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
            marginBottom: "28px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "34px",
              fontWeight: "800",
              color: "#fff",
            }}
          >
            Theme Settings
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#94a3b8",
            }}
          >
            Customize your application appearance.
          </p>
        </div>

        <div
          className="admin-card"
          style={{
            maxWidth: "560px",
            background: "#111827",
            border: "1px solid #1e293b",
            borderRadius: "24px",
            padding: "28px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          }}
        >
          {/* APP BASE COLOR */}
          <div
            style={{
              marginBottom: "32px",
            }}
          >
            <p
              style={{
                marginBottom: "14px",
                fontWeight: "700",
                color: "#fff",
              }}
            >
              App Base Color
            </p>

            <div
              style={{
                display: "flex",
                gap: "14px",
                alignItems: "center",
              }}
            >
              <input
                type="color"
                value={baseColor}
                onChange={(e) => setBaseColor(e.target.value)}
                style={{
                  width: "70px",
                  height: "50px",
                  padding: 0,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  borderRadius: "12px",
                }}
              />

              <input
                type="text"
                value={baseColor}
                onChange={(e) => setBaseColor(e.target.value)}
                placeholder="#C40000"
                style={darkInput}
              />
            </div>
          </div>

          {/* TITLE */}
          <div
            style={{
              marginBottom: "32px",
            }}
          >
            <p
              style={{
                marginBottom: "14px",
                fontWeight: "700",
                color: "#fff",
              }}
            >
              Home Page Title
            </p>

            <input
              type="text"
              value={homeTitle}
              onChange={(e) => setHomeTitle(e.target.value)}
              placeholder="Watch Breaking News Anytime"
              style={darkInput}
            />
          </div>

          {/* ACTION BUTTONS */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <button onClick={saveTheme} style={primaryButton}>
              Save Theme
            </button>

            <button onClick={setDefaultTheme} style={secondaryButton}>
              Set Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const darkInput = {
  flex: 1,
  background: "#0f172a",
  border: "1px solid #1e293b",
  color: "#fff",
  padding: "13px 14px",
  borderRadius: "14px",
  outline: "none",
  fontSize: "15px",
};

const primaryButton = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "12px 20px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "700",
};

const secondaryButton = {
  background: "#1e293b",
  color: "#fff",
  border: "1px solid #334155",
  padding: "12px 20px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "700",
};
