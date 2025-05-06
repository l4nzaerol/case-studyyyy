import React, { useState, useEffect } from "react";
import ProjectGanttChart from "./ProjectGanttChart";
import RiskIssuePanel from "./RiskIssuePanel";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actualCost, setActualCost] = useState(0);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const projectResponse = await axios.get(
          `http://localhost:8000/api/projects/${id}`,
          { headers }
        );
        const tasksResponse = await axios.get(
          `http://localhost:8000/api/projects/${id}/tasks`,
          { headers }
        );
        const expendituresResponse = await axios.get(
          `http://localhost:8000/api/projects/${id}/expenditures`,
          { headers }
        );

        const expenditures = expendituresResponse.data;
        const totalCost = expenditures.reduce(
          (sum, exp) => sum + Number(exp.amount),
          0
        );

        const userResponse = await axios.get("http://localhost:8000/api/user", {
          headers,
        });
        const currentUserId = userResponse.data.id;

        setProject(projectResponse.data.project);
        setIsOwner(projectResponse.data.project.user_id === currentUserId);
        setActualCost(totalCost);
        setTasks(tasksResponse.data.tasks);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch project details");
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id]);

  const handleDeleteProject = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this project and all associated tasks?"
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/projects");
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to delete project";
      setError(message);
      setTimeout(() => {
        navigate(-1);
      }, 3000);
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="mt-2">Loading Project Detail...</div>
        </div>
      </div>
    );

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!project) return <div>Project not found</div>;

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "completed").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    todo: tasks.filter((t) => t.status === "todo").length,
    review: tasks.filter((t) => t.status === "review").length,
  };

  const completionPercentage =
    taskStats.total > 0
      ? Math.round((taskStats.completed / taskStats.total) * 100)
      : 0;

  return (
    <div className="container py-5">
      <div className="bg-light rounded shadow-lg p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="fw-bold text-primary">
            <i className="bi bi-kanban-fill me-2"></i>
            {project.name}
          </h2>
          <div>
            <Link to="/projects" className="btn btn-outline-secondary me-2">
              <i className="bi bi-arrow-left-circle"></i> Back
            </Link>
            {isOwner && (
              <>
                <Link
                  to={`/projects/${id}/edit`}
                  className="btn btn-warning me-2"
                >
                  <i className="bi bi-pencil-square"></i> Edit
                </Link>
                <button
                  onClick={handleDeleteProject}
                  className="btn btn-danger"
                >
                  <i className="bi bi-trash3-fill"></i> Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-gradient bg-primary text-white">
              <h5 className="mb-0">Project Details</h5>
            </div>
            <div className="card-body">
              <p>
                <strong>Description:</strong> {project.description || "No description"}
              </p>
              <div className="row">
                <div className="col-sm-6">
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className={`badge bg-${getStatusBadge(project.status)}`}>
                      {project.status}
                    </span>
                  </p>
                  <p>
                    <strong>Start:</strong>{" "}
                    {new Date(project.start_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="col-sm-6">
                  <p>
                    <strong>Due:</strong>{" "}
                    {project.due_date
                      ? new Date(project.due_date).toLocaleDateString()
                      : "Not set"}
                  </p>
                  <p>
                    <strong>Members:</strong>{" "}
                    <Link
                      to={`/projects/${id}/members`}
                      className="btn btn-sm btn-outline-info ms-2"
                    >
                      Manage
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-gradient bg-dark text-white">
              <h5 className="mb-0">Progress & Budget</h5>
            </div>
            <div className="card-body">
              <div className="progress mb-3" style={{ height: "25px" }}>
                <div
                  className="progress-bar bg-success"
                  role="progressbar"
                  style={{ width: `${completionPercentage}%` }}
                >
                  {completionPercentage}%
                </div>
              </div>

              <p><strong>Budget:</strong> ₱{Number(project.budget || 0).toFixed(2)}</p>
              <p><strong>Spent:</strong> ₱{Number(actualCost).toFixed(2)}</p>
              <p>
                <strong>Remaining:</strong>{" "}
                ₱{Number(project.budget - actualCost).toFixed(2)}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {actualCost > project.budget ? (
                  <span className="text-danger fw-bold">Over Budget</span>
                ) : (
                  <span className="text-success fw-bold">Within Budget</span>
                )}
              </p>

              {isOwner && (
                <div className="d-grid gap-2 mt-3">
                  <Link
                    to={`/projects/${id}/expenditures`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    View Expenditures
                  </Link>
                  <Link
                    to={`/projects/${id}/expenditures/add`}
                    className="btn btn-outline-success btn-sm"
                  >
                    Add Expenditure
                  </Link>
                  <Link
                    to={`/projects/${id}/report`}
                    className="btn btn-outline-dark btn-sm"
                  >
                    View Report
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-gradient bg-info text-white">
          <h5 className="mb-0">Task Overview</h5>
        </div>
        <div className="card-body">
          <div className="row text-center">
            {["todo", "inProgress", "review", "completed"].map((key, idx) => (
              <div className="col-3" key={idx}>
                <div className="fs-4 fw-bold">{taskStats[key]}</div>
                <div className="text-muted text-capitalize">{key.replace("_", " ")}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-gradient bg-secondary text-white d-flex justify-content-between">
          <h5 className="mb-0">Top Tasks</h5>
          <Link to={`/projects/${id}/tasks`} className="btn btn-light btn-sm">
            Manage Tasks
          </Link>
        </div>
        <div className="card-body">
          {tasks.length === 0 ? (
            <p>No tasks found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Assigned</th>
                    <th>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.slice(0, 5).map((task) => (
                    <tr key={task.id}>
                      <td>{task.title}</td>
                      <td>
                        <span className={`badge bg-${getStatusBadge(task.status)}`}>
                          {task.status.replace("_", " ")}
                        </span>
                      </td>
                      <td>
                        <span className={`badge bg-${getPriorityBadge(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td>{task.assignedUser?.name || "Unassigned"}</td>
                      <td>
                        {task.due_time
                          ? new Date(task.due_time).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {tasks.length > 5 && (
                <div className="text-center mt-2">
                  <Link to={`/projects/${id}/tasks`} className="btn btn-link">
                    View All Tasks ({tasks.length})
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-gradient bg-warning text-dark">
          <h5 className="mb-0">Gantt Chart</h5>
        </div>
        <div className="card-body">
          <ProjectGanttChart tasks={tasks} />
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-5">
        <div className="card-header bg-gradient bg-danger text-white">
          <h5 className="mb-0">Risks & Issues</h5>
        </div>
        <div className="card-body">
          <RiskIssuePanel projectId={id} isOwner={isOwner} />
        </div>
      </div>
    </div>
  );
};

// Utility Functions
const getStatusBadge = (status) => {
  switch (status) {
    case "planning": return "secondary";
    case "active": return "primary";
    case "completed": return "success";
    case "on_hold": return "warning";
    case "todo": return "secondary";
    case "in_progress": return "primary";
    case "review": return "info";
    default: return "light";
  }
};

const getPriorityBadge = (priority) => {
  switch (priority) {
    case "low": return "success";
    case "medium": return "info";
    case "high": return "warning";
    case "urgent": return "danger";
    default: return "secondary";
  }
};

export default ProjectDetail;
