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
      <div className="row g-4">
      <div className="col-lg-4">
      <div className="card shadow-sm border-0 mb-4 p-4 bg-white">
  <div className="row align-items-center">
    <div className="col-md-8">
      <h2 className="text-primary fw-bold mb-2">
        <i className="bi bi-kanban-fill me-2 text-dark"></i>{project.name}
      </h2>
      <p className="mb-1 text-muted">{project.description || "No description provided."}</p>
      <div className="small text-secondary">
        <span className="me-3"><strong>Status:</strong> <span className={`badge bg-${getStatusBadge(project.status)}`}>{project.status}</span></span>
        <span className="me-3"><div></div>
          <strong>Start:</strong> {new Date(project.start_date).toLocaleDateString()}</span>
        <span><strong>Due:</strong> {project.due_date ? new Date(project.due_date).toLocaleDateString() : "Not set"}</span>
      </div>
    </div>
    <div className="col-md-4 d-flex justify-content-md-end justify-content-start mt-3 mt-md-0 gap-2">
      <Link to="/projects" className="btn btn-outline-secondary btn-sm">Back</Link>
      {isOwner && (
        <>
          <Link to={`/projects/${id}/edit`} className="btn btn-warning btn-sm">Edit</Link>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
        </>
      )}
    </div>
  </div>
</div>


<div className="card mt-4 shadow border-0">
  <div className="card-header bg-light d-flex align-items-center justify-content-between">
    <h6 className="mb-0 text-dark"><i className="bi bi-wallet2 me-2 text-primary"></i> Budget Overview</h6>
  </div>
  <div className="card-body">
    <div className="row align-items-center mb-3">
      <div className="col-6">
        <p className="mb-1 text-muted">Total Budget</p>
        <h5 className="fw-bold text-dark">₱{Number(project.budget || 0).toLocaleString()}</h5>
      </div>
      <div className="col-6 text-end">
        <p className="mb-1 text-muted">Spent</p>
        <h5 className="fw-bold text-danger">₱{actualCost.toLocaleString()}</h5>
      </div>
    </div>

    <div className="progress mb-3" style={{ height: '20px' }}>
      <div
        className={`progress-bar ${actualCost > project.budget ? 'bg-danger' : 'bg-success'}`}
        style={{ width: `${Math.min((actualCost / (project.budget || 1)) * 100, 100)}%` }}
        role="progressbar"
        aria-valuenow={(actualCost / (project.budget || 1)) * 100}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        {Math.round((actualCost / (project.budget || 1)) * 100)}%
      </div>
    </div>

    <div className="d-flex justify-content-between small text-muted">
      <span>Remaining: <strong className="text-dark">₱{Math.max((project.budget - actualCost), 0).toLocaleString()}</strong></span>
      <span>Status: {actualCost > project.budget 
        ? <span className="text-danger fw-bold">Over Budget</span> 
        : <span className="text-success fw-bold">Within Budget</span>}
      </span>
    </div>

    {isOwner && (
      <div className="d-grid gap-2 mt-4">
        <Link to={`/projects/${id}/expenditures/add`} className="btn btn-outline-success btn-sm">Add Expenditure</Link>
        <Link to={`/projects/${id}/expenditures`} className="btn btn-outline-primary btn-sm">View Expenditures</Link>
        <Link to={`/projects/${id}/report`} className="btn btn-outline-dark btn-sm">Project Report</Link>
      </div>
    )}
  </div>
</div>


  {/* RISKS & ISSUES - Relocated and Redesigned */}
  <div className="card mt-4 shadow border-warning">
    <div className="card-header bg-warning text-dark d-flex align-items-center justify-content-between">
      <h6 className="mb-0"><i className="bi bi-exclamation-triangle-fill me-2"></i> Risks & Issues</h6>
    </div>
    <div className="card-body">
      <div className="nav nav-tabs mb-3" id="riskIssueTabs" role="tablist">
        <button className="nav-link active" id="view-tab" data-bs-toggle="tab" data-bs-target="#view-issues" type="button" role="tab">View Issues</button>
      </div>
      <div className="tab-content" id="riskIssueTabsContent">
        <div className="tab-pane fade show active" id="view-issues" role="tabpanel">
          <RiskIssuePanel projectId={id} isOwner={isOwner} viewOnly={true} />
        </div>
        
      </div>
    </div>
  </div>
</div>

        

        <div className="col-lg-8">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-primary text-white">Progress</div>
            <div className="card-body">
              <div className="progress mb-3" style={{ height: "30px" }}>
                <div className="progress-bar bg-success" style={{ width: `${completion}%` }}>{completion}%</div>
              </div>
              <div className="row text-center justify-content-center">
  {Object.entries(taskStats).map(([key, val], idx) => (
    <div className="col-6 col-md-2" key={idx}>
      <div className="fs-5 fw-bold">{val}</div>
      <div className="text-muted text-capitalize">{key.replace("_", " ")}</div>
    </div>
  ))}
</div>

            </div>
          </div>

          <div className="card shadow-sm mb-4">
            <div className="card-header bg-info text-white d-flex justify-content-between">
              <span>Project Tasks</span>
              <Link to={`/projects/${id}/tasks`} className="btn btn-sm btn-light">View Tasks</Link>
            </div>
            <div className="card-body">
              {tasks.length === 0 ? <p>No tasks available.</p> : (
                <div className="table-responsive">
                  <table className="table table-striped">
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

          <div className="card shadow-sm mb-4">
  <div className="card-header bg-warning">Gantt Chart</div>
  <div className="card-body">
    <div style={{ overflowX: 'auto' }}>
      <ProjectGanttChart tasks={tasks} />
    </div>
  </div>
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