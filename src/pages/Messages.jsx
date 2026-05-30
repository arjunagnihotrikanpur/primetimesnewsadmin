import { useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "../services/firebase";

import Sidebar from "../components/Sidebar";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadMessages = async () => {
    try {
      const q = query(
        collection(db, "contactMessages"),
        orderBy("createdAt", "desc"),
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMessages(data);
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return "";

    const date = timestamp.toDate();

    return date.toLocaleString();
  };

  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      const value = search.toLowerCase();

      return (
        msg.name?.toLowerCase().includes(value) ||
        msg.email?.toLowerCase().includes(value) ||
        msg.message?.toLowerCase().includes(value)
      );
    });
  }, [messages, search]);

  const toggleSelect = (id) => {
    setSelectedMessages((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    if (selectedMessages.length === filteredMessages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(filteredMessages.map((msg) => msg.id));
    }
  };

  const deleteMessage = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this message?",
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "contactMessages", id));

      setMessages((prev) => prev.filter((msg) => msg.id !== id));

      setSelectedMessages((prev) =>
        prev.filter((selectedId) => selectedId !== id),
      );
    } catch (error) {
      console.log(error);
    }
  };

  const deleteSelected = async () => {
    if (selectedMessages.length === 0) return;

    const confirmDelete = window.confirm(
      `Delete ${selectedMessages.length} selected message(s)?`,
    );

    if (!confirmDelete) return;

    try {
      await Promise.all(
        selectedMessages.map((id) => deleteDoc(doc(db, "contactMessages", id))),
      );

      setMessages((prev) =>
        prev.filter((msg) => !selectedMessages.includes(msg.id)),
      );

      setSelectedMessages([]);
    } catch (error) {
      console.log(error);
    }
  };

  const exportToCSV = () => {
    const rows = filteredMessages.map((msg) => ({
      Name: msg.name || "",
      Email: msg.email || "",
      Message: msg.message || "",
      Date: formatDate(msg.createdAt),
    }));

    const csvContent = [
      Object.keys(rows[0] || {}).join(","),
      ...rows.map((row) =>
        Object.values(row)
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "contact-messages.csv");

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "32px",
                fontWeight: "800",
                color: "#fff",
              }}
            >
              Contact Messages
            </h1>

            <p
              style={{
                marginTop: "8px",
                color: "#94a3b8",
              }}
            >
              Manage, search, export and delete messages.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <button onClick={selectAll} style={buttonStyle}>
              {selectedMessages.length === filteredMessages.length &&
              filteredMessages.length > 0
                ? "Unselect All"
                : "Select All"}
            </button>

            <button
              onClick={exportToCSV}
              style={{
                ...buttonStyle,
                background: "#2563eb",
                color: "#fff",
              }}
            >
              Export CSV
            </button>

            <button
              onClick={deleteSelected}
              disabled={selectedMessages.length === 0}
              style={{
                ...buttonStyle,
                background:
                  selectedMessages.length === 0 ? "#334155" : "#dc2626",
                color: "#fff",
                cursor:
                  selectedMessages.length === 0 ? "not-allowed" : "pointer",
              }}
            >
              Delete Selected
            </button>
          </div>
        </div>

        <div
          style={{
            marginBottom: "24px",
          }}
        >
          <input
            type="text"
            placeholder="Search by name, email or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "14px 18px",
              borderRadius: "14px",
              border: "1px solid #1e293b",
              outline: "none",
              fontSize: "15px",
              background: "#111827",
              color: "#fff",
              boxSizing: "border-box",
            }}
          />
        </div>

        {loading ? (
          <div className="admin-card" style={emptyCardStyle}>
            <h3>Loading messages...</h3>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="admin-card" style={emptyCardStyle}>
            <h3>No messages found</h3>
          </div>
        ) : (
          <div
            className="card-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "22px",
            }}
          >
            {filteredMessages.map((msg) => {
              const isSelected = selectedMessages.includes(msg.id);

              return (
                <div
                  key={msg.id}
                  className="admin-card"
                  style={{
                    background: "#111827",
                    borderRadius: "22px",
                    padding: "22px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                    border: isSelected
                      ? "2px solid #2563eb"
                      : "1px solid #1e293b",
                    transition: "0.2s ease",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(msg.id)}
                        style={{
                          width: "18px",
                          height: "18px",
                          cursor: "pointer",
                        }}
                      />

                      <div>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: "20px",
                            color: "#fff",
                          }}
                        >
                          {msg.name}
                        </h3>

                        <p
                          style={{
                            marginTop: "6px",
                            fontWeight: "600",
                            color: "#60a5fa",
                            wordBreak: "break-word",
                          }}
                        >
                          {msg.email}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteMessage(msg.id)}
                      style={{
                        border: "none",
                        background: "rgba(220,38,38,0.15)",
                        color: "#ef4444",
                        padding: "10px 14px",
                        borderRadius: "12px",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      Delete
                    </button>
                  </div>

                  <div
                    style={{
                      marginTop: "18px",
                      padding: "16px",
                      background: "#0f172a",
                      borderRadius: "16px",
                      border: "1px solid #1e293b",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        lineHeight: "1.8",
                        color: "#d1d5db",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {msg.message}
                    </p>
                  </div>

                  <div
                    style={{
                      marginTop: "18px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        color: "#94a3b8",
                        fontSize: "14px",
                      }}
                    >
                      {formatDate(msg.createdAt)}
                    </span>

                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(
                          `
Name: ${msg.name}
Email: ${msg.email}

${msg.message}
                        `,
                        )
                      }
                      style={{
                        border: "none",
                        background: "#2563eb",
                        color: "#fff",
                        padding: "10px 14px",
                        borderRadius: "12px",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const buttonStyle = {
  border: "1px solid #1e293b",
  padding: "12px 18px",
  borderRadius: "14px",
  fontWeight: "700",
  cursor: "pointer",
  background: "#111827",
  color: "#fff",
  boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
};

const emptyCardStyle = {
  background: "#111827",
  borderRadius: "22px",
  padding: "40px",
  textAlign: "center",
  border: "1px solid #1e293b",
  color: "#94a3b8",
  boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
};
