import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Folder, CheckCircle, Clipboard } from "react-feather";

const Dashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const projectsResponse = await axios.get(
          "http://localhost:8000/api/projects?limit=5",
          { headers }
        );
        setProjects(projectsResponse.data.projects);

        const tasksResponse = await axios.get(
          "http://localhost:8000/api/tasks?assigned_to_me=1&limit=5",
          { headers }
        );
        setTasks(tasksResponse.data.tasks);

        setLoading(false);
      } catch (err) {
        setError("Failed to fetch dashboard data");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="mt-2">Loading dashboard...</div>
        </div>
      </div>
    );

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container py-4 dashboard">
      <div className="mb-5 text-center">
        <h1 className="fw-bold display-5 text-primary">Klick Inc. Project Management System</h1>
        <p className="lead text-muted">Track your progress, manage your tasks, and stay on top of your work.</p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-light h-100">
            <div className="card-body text-center">
              <Folder size={32} className="mb-2 text-primary" />
              <h5 className="card-title">New Project</h5>
              <p className="card-text text-muted">Start a new project and organize your team.</p>
              <Link to="/projects/create" className="btn btn-outline-primary btn-sm">Create Project</Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-light h-100">
            <div className="card-body text-center">
              <Clipboard size={32} className="mb-2 text-info" />
              <h5 className="card-title">Manage Projects</h5>
              <p className="card-text text-muted">View all ongoing and past projects.</p>
              <Link to="/projects" className="btn btn-outline-info btn-sm">View Projects</Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 bg-light h-100">
            <div className="card-body text-center">
              <CheckCircle size={32} className="mb-2 text-success" />
              <h5 className="card-title">My Tasks</h5>
              <p className="card-text text-muted">Check your tasks and stay productive.</p>
              <Link to="/tasks" className="btn btn-outline-success btn-sm">View Tasks</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Projects</h5>
              <Link to="/projects" className="btn btn-outline-light btn-sm">All Projects</Link>
            </div>
            <div className="card-body">
              {projects.length === 0 ? (
                <p className="text-muted">No projects found.</p>
              ) : (
                <div className="list-group">
                  {projects.map((project) => (
                    <Link
                      key={project.id}
                      to={`/projects/${project.id}`}
                      className="list-group-item list-group-item-action list-group-item-light d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <h6 className="mb-1">{project.name}</h6>
                        <small className="text-muted">{project.description?.substring(0, 50) || "No description"}...</small>
                      </div>
                      <span className={`badge rounded-pill bg-${getStatusBadge(project.status)}`}>
                        {project.status}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">My Tasks</h5>
              <Link to="/tasks" className="btn btn-outline-light btn-sm">All Tasks</Link>
            </div>
            <div className="card-body">
              {tasks.length === 0 ? (
                <p className="text-muted">No tasks assigned to you.</p>
              ) : (
                <div className="list-group">
                  {tasks.map((task) => (
                    <Link
                      key={task.id}
                      to={`/tasks/${task.id}`}
                      className="list-group-item list-group-item-action list-group-item-light d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <h6 className="mb-1">{task.title}</h6>
                        <small className="text-muted">Project: {task.project?.name || `#${task.project_id}`}</small>
                      </div>
                      <div className="d-flex flex-column align-items-end">
                        <span className={`badge bg-${getStatusBadge(task.status)} rounded-pill`}>
                          {task.status.replace("_", " ")}
                        </span>
                        <small className="text-muted mt-1">
                          Due: {task.due_time ? new Date(task.due_time).toLocaleDateString() : "Not set"}
                        </small>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getStatusBadge = (status) => {
  switch (status) {
    case "planning":
      return "secondary";
    case "active":
      return "primary";
    case "completed":
      return "success";
    case "on_hold":
      return "warning";
    case "todo":
      return "secondary";
    case "in_progress":
      return "info";
    case "review":
      return "dark";
    default:
      return "light";
  }
};

export default Dashboard;
