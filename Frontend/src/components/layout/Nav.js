import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell } from 'react-feather';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './navigation.css';

const Navigation = ({ user, onLogout }) => {
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [hasNew, setHasNew] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8000/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data;
        if (data.length > notifications.length) setHasNew(true);
        setNotifications(data);
      } catch (err) {
        console.error("Failed to fetch notifications.");
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [notifications.length]);

  const toggleModal = () => {
    setShowModal(!showModal);
    setHasNew(false);
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg custom-navbar shadow-sm">
        <div className="container-fluid align-items-center">

          {/* Dropdown menu on the left */}
          <div className="dropdown me-auto">
            <button className="btn btn-light dropdown-toggle fw-semibold" type="button" data-bs-toggle="dropdown">
              Menu
            </button>
            <ul className="dropdown-menu">
              <li>
                <Link className={`dropdown-item ${location.pathname === '/' ? 'active-dropdown' : ''}`} to="/">Dashboard</Link>
              </li>
              <li>
                <Link className={`dropdown-item ${location.pathname.includes('/projects') ? 'active-dropdown' : ''}`} to="/projects">Projects</Link>
              </li>
            </ul>
          </div>

          {/* Centered brand */}
          <div className="mx-auto">
            <Link className="navbar-brand text-primary title-centered" to="/"></Link>
          </div>

          {/* Notifications and logout on the right */}
          <div className="d-flex align-items-center gap-3">
            <div className="position-relative">
              <button className="btn btn-outline-secondary btn-sm rounded-circle p-2" onClick={toggleModal}>
                <Bell size={18} />
                {hasNew && <span className="notify-dot"></span>}
              </button>
            </div>
            <button onClick={onLogout} className="btn btn-outline-danger btn-sm">Logout</button>
          </div>
        </div>
      </nav>

      {/* Notifications Modal */}
      {showModal && (
        <div className="modal-backdrop-custom" onClick={toggleModal}>
          <div className="custom-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header border-bottom">
              <h5 className="modal-title">Recent Activity</h5>
              <button type="button" className="btn-close" onClick={toggleModal}></button>
            </div>
            <div className="modal-body">
              {notifications.length === 0 ? (
                <p>No recent activity.</p>
              ) : (
                <ul className="list-group">
                  {notifications.map((activity) => (
                    <li key={activity.id} className="list-group-item">
                      <strong>{activity.user?.name || "Unknown"} – {activity.description}</strong><br />
                      <small className="text-muted">{new Date(activity.created_at).toLocaleString()}</small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
