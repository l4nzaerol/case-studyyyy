import React, { useEffect, useState } from "react";
import axios from "axios";
import 'bootstrap-icons/font/bootstrap-icons.css';

const NotificationPanel = () => {
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState(null);
  const [highlightedIds, setHighlightedIds] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8000/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const newData = response.data;

        setActivities((prev) => {
          const newIds = newData
            .filter((item) => !prev.some((existing) => existing.id === item.id))
            .map((item) => item.id);

          setHighlightedIds(newIds);

          return newData;
        });
      } catch (err) {
        setError("Failed to load notifications.");
      }
    };

    fetchNotifications(); // initial fetch

    const interval = setInterval(fetchNotifications, 5000); // poll every 5s

    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return date.toLocaleString();
  };

  return (
    <div className="card shadow-sm border-info mb-4">
      <div className="card-header bg-info text-white d-flex align-items-center">
        <i className="bi bi-bell-fill me-2"></i> Recent Activity
      </div>
      <div className="card-body p-0">
        {error && <div className="alert alert-danger m-3">{error}</div>}

        {activities.length === 0 ? (
          <div className="p-3 text-muted text-center">No recent activity.</div>
        ) : (
          <ul className="list-group list-group-flush">
            {activities.map((activity) => (
              <li
                key={activity.id}
                className={`list-group-item d-flex justify-content-between align-items-start ${
                  highlightedIds.includes(activity.id) ? "bg-light border-start border-success border-4" : ""
                }`}
              >
                <div className="ms-2 me-auto">
                  <div className="fw-semibold">
                    <i className="bi bi-person-fill text-primary me-1"></i>
                    {activity.user?.name || "Unknown"}
                  </div>
                  {activity.description}
                  <div className="small text-muted mt-1">
                    <i className="bi bi-clock me-1"></i>{formatTime(activity.created_at)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
