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
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [projectRes, tasksRes, expendituresRes, userRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/projects/${id}`, { headers }),
          axios.get(`http://localhost:8000/api/projects/${id}/tasks`, { headers }),
          axios.get(`http://localhost:8000/api/projects/${id}/expenditures`, { headers }),
          axios.get("http://localhost:8000/api/user", { headers }),
        ]);

        const expenditures = expendituresRes.data;
        const totalCost = expenditures.reduce((sum, exp) => sum + Number(exp.amount), 0);

        setProject(projectRes.data.project);
        setTasks(tasksRes.data.tasks);
        setActualCost(totalCost);
        setIsOwner(projectRes.data.project.user_id === userRes.data.id);
        setLoading(false);
      } catch (err) {
        setError("Failed to load project details.");
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this project and all tasks?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/projects");
    } catch (err) {
      setError("Failed to delete project");
      setTimeout(() => navigate(-1), 3000);
    }
  };

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === "completed").length,
    inProgress: tasks.filter(t => t.status === "in_progress").length,
    todo: tasks.filter(t => t.status === "todo").length,
    review: tasks.filter(t => t.status === "review").length,
  };

  const completion = taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0;

  if (loading) return <div className="text-center py-5"><div className="spinner-border" role="status"></div><p>Loading...</p></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!project) return <div>Project not found.</div>;

 return (
  <div className="container py-4">
    {/* Project Header */}
    <div className="bg-light p-4 rounded shadow-sm mb-4 border">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
        <div>
          <h2 className="text-primary fw-bold mb-1">
            <i className="bi bi-kanban-fill me-2 text-dark"></i>{project.name}
          </h2>
          <div className="text-muted">{project.description || "No description provided."}</div>
          <div className="small mt-2">
            <span className="me-3"><strong>Status:</strong> <span className={`badge bg-${getStatusBadge(project.status)}`}>{project.status}</span></span>
            <span className="me-3"><strong>Start:</strong> {new Date(project.start_date).toLocaleDateString()}</span>
            <span><strong>Due:</strong> {project.due_date ? new Date(project.due_date).toLocaleDateString() : "Not set"}</span>
          </div>
        </div>
        <div className="d-flex mt-3 mt-md-0 gap-2">
          <Link to="/projects" className="btn btn-outline-secondary btn-sm">Back</Link>
          {isOwner && (
            <>
              <Link to={`/projects/${id}/edit`} className="btn btn-warning btn-sm">Edit</Link>
              <button onClick={handleDelete} className="btn btn-danger btn-sm">Delete</button>
            </>
          )}
        </div>
      </div>
    </div>
 
    {/* Budget Overview */}
    <div className="bg-white p-4 rounded shadow-sm mb-4 border">
      <h5 className="text-dark mb-3"><i className="bi bi-wallet2 me-2 text-primary"></i>Budget Tracker</h5>
      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="bg-light p-3 rounded">
            <div className="text-muted small">Total Budget</div>
            <div className="fw-bold text-dark">₱{Number(project.budget || 0).toLocaleString()}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="bg-light p-3 rounded">
            <div className="text-muted small">Actual Spent</div>
            <div className="fw-bold text-danger">₱{actualCost.toLocaleString()}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="bg-light p-3 rounded">
            <div className="text-muted small">Remaining</div>
            <div className={`fw-bold ${actualCost > project.budget ? "text-danger" : "text-success"}`}>
              ₱{Math.max(project.budget - actualCost, 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
 
      <div className="progress" style={{ height: '20px' }}>
        <div
          className={`progress-bar ${actualCost > project.budget ? "bg-danger" : "bg-success"}`}
          role="progressbar"
          style={{ width: `${Math.min((actualCost / (project.budget || 1)) * 100, 100)}%` }}
        >
          {Math.round((actualCost / (project.budget || 1)) * 100)}%
        </div>
      </div>
 
      {isOwner && (
        <div className="mt-4 d-flex flex-wrap gap-2">
          <Link to={`/projects/${id}/expenditures/add`} className="btn btn-outline-success btn-sm">Add Expenditure</Link>
          <Link to={`/projects/${id}/expenditures`} className="btn btn-outline-primary btn-sm">View Expenditures</Link>
          <Link to={`/projects/${id}/report`} className="btn btn-outline-dark btn-sm">Project Report</Link>
        </div>
      )}
    </div>
 
    {/* Tabs for Details */}
    <ul className="nav nav-tabs mb-4" id="projectTab" role="tablist">
      <li className="nav-item" role="presentation">
        <button className="nav-link active" id="progress-tab" data-bs-toggle="tab" data-bs-target="#progress" type="button" role="tab">Progress</button>
      </li>
      <li className="nav-item" role="presentation">
        <button className="nav-link" id="tasks-tab" data-bs-toggle="tab" data-bs-target="#tasks" type="button" role="tab">Tasks</button>
      </li>
      <li className="nav-item" role="presentation">
        <button className="nav-link" id="gantt-tab" data-bs-toggle="tab" data-bs-target="#gantt" type="button" role="tab">Gantt</button>
      </li>
      <li className="nav-item" role="presentation">
        <button className="nav-link" id="risks-tab" data-bs-toggle="tab" data-bs-target="#risks" type="button" role="tab">Risks & Issues</button>
      </li>
    </ul>
 
    <div className="tab-content" id="projectTabContent">
      {/* Progress Tab */}
      <div className="tab-pane fade show active" id="progress" role="tabpanel">
        <div className="bg-white p-4 rounded shadow-sm border mb-4">
          <h6 className="text-dark mb-3"><i className="bi bi-graph-up-arrow me-2"></i>Project Progress</h6>
          <div className="progress mb-3" style={{ height: "30px" }}>
            <div className="progress-bar bg-success" style={{ width: `${completion}%` }}>{completion}%</div>
          </div>
          <div className="row text-center">
            {Object.entries(taskStats).map(([key, val], idx) => (
              <div className="col-6 col-md-2 mb-2" key={idx}>
                <div className="fw-bold">{val}</div>
                <small className="text-muted text-capitalize">{key.replace("_", " ")}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
 
      {/* Tasks Tab */}
      <div className="tab-pane fade" id="tasks" role="tabpanel">
        <div className="bg-white p-4 rounded shadow-sm border mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="text-dark mb-0"><i className="bi bi-list-check me-2"></i>Task Overview</h6>
            <Link to={`/projects/${id}/tasks`} className="btn btn-sm btn-outline-primary">View All Tasks</Link>
          </div>
          {tasks.length === 0 ? <p>No tasks available.</p> : (
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
                  {tasks.slice(0, 5).map(task => (
                    <tr key={task.id}>
                      <td>{task.title}</td>
                      <td><span className={`badge bg-${getStatusBadge(task.status)}`}>{task.status.replace("_", " ")}</span></td>
                      <td><span className={`badge bg-${getPriorityBadge(task.priority)}`}>{task.priority}</span></td>
                      <td>{task.assignedUser?.name || "Unassigned"}</td>
                      <td>{task.due_time ? new Date(task.due_time).toLocaleDateString() : "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
 
      {/* Gantt Tab */}
      <div className="tab-pane fade" id="gantt" role="tabpanel">
        <div className="bg-white p-4 rounded shadow-sm border">
          <h6 className="text-dark mb-3"><i className="bi bi-calendar-range me-2"></i>Timeline View</h6>
          <div style={{ overflowX: "auto" }}>
            <ProjectGanttChart tasks={tasks} />
          </div>
        </div>
      </div>
 
      {/* Risks Tab */}
      <div className="tab-pane fade" id="risks" role="tabpanel">
        <div className="bg-white p-4 rounded shadow-sm border">
          <h6 className="text-warning mb-3"><i className="bi bi-exclamation-triangle-fill me-2"></i>Project Risks & Issues</h6>
          <RiskIssuePanel projectId={id} isOwner={isOwner} viewOnly={true} />
        </div>
      </div>
    </div>
  </div>
);
};

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