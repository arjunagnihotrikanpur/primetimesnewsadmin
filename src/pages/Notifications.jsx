import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

import { sendPushNotification } from "../services/notifications";

import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

import { db } from "../services/firebase";

const Notifications = () => {
  const [notificationTitle, setNotificationTitle] = useState("");

  const [notificationBody, setNotificationBody] = useState("");

  const [sendingNotification, setSendingNotification] = useState(false);

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setNotifications(data);
    });

    return unsubscribe;
  }, []);

  const handleSendNotification = async () => {
    if (!notificationTitle || !notificationBody) {
      alert("Please fill all fields");
      return;
    }

    try {
      setSendingNotification(true);

      await sendPushNotification({
        title: notificationTitle,
        body: notificationBody,
      });

      alert("Notification sent");

      setNotificationTitle("");
      setNotificationBody("");
    } catch (error) {
      console.log(error);

      alert("Failed to send notification");
    } finally {
      setSendingNotification(false);
    }
  };

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

      <div className="content">
        <h1
          style={{
            margin: 0,
            fontSize: "36px",
            fontWeight: "800",
            color: "#fff",
          }}
        >
          Notifications
        </h1>

        {/* NOTIFICATION PANEL */}

        <div
          style={{
            background: "linear-gradient(180deg, #0f172a 0%, #111827 100%)",
            border: "1px solid #1e293b",
            borderRadius: "28px",
            padding: "28px",
            marginBottom: "32px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: "20px",
              fontSize: "24px",
              fontWeight: "700",
            }}
          >
            Send Push Notification
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            <input
              type="text"
              placeholder="Notification Title"
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
              style={inputStyle}
            />

            <textarea
              placeholder="Notification Content"
              value={notificationBody}
              onChange={(e) => setNotificationBody(e.target.value)}
              rows={5}
              style={{
                ...inputStyle,
                resize: "none",
                minHeight: "140px",
                paddingTop: "16px",
              }}
            />

            <button
              onClick={handleSendNotification}
              disabled={sendingNotification}
              style={{
                background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
                border: "none",
                borderRadius: "16px",
                padding: "16px",
                color: "#fff",
                fontSize: "16px",
                fontWeight: "700",
                cursor: "pointer",
                opacity: sendingNotification ? 0.7 : 1,
              }}
            >
              {sendingNotification ? "Sending..." : "Send Notification"}
            </button>
          </div>

          {/* HISTORY */}

          <div
            style={{
              marginTop: "34px",
            }}
          >
            <h3
              style={{
                marginBottom: "18px",
                fontSize: "22px",
              }}
            >
              Notification History
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                maxHeight: "420px",
                overflowY: "auto",
              }}
            >
              {notifications.length === 0 && (
                <div
                  style={{
                    color: "#94a3b8",
                  }}
                >
                  No notifications yet.
                </div>
              )}

              {notifications.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: "#020617",
                    border: "1px solid #1e293b",
                    borderRadius: "18px",
                    padding: "18px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <h4
                      style={{
                        margin: 0,
                        color: "#fff",
                        fontSize: "17px",
                      }}
                    >
                      {item.title}
                    </h4>

                    <span
                      style={{
                        color: "#64748b",
                        fontSize: "12px",
                      }}
                    >
                      {item.createdAt?.toDate
                        ? item.createdAt.toDate().toLocaleString()
                        : "Just now"}
                    </span>
                  </div>

                  <p
                    style={{
                      margin: 0,
                      color: "#cbd5e1",
                      lineHeight: "24px",
                    }}
                  >
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;

const inputStyle = {
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: "16px",
  padding: "18px",
  color: "#fff",
  fontSize: "15px",
  outline: "none",
};
