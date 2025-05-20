import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import 'bootstrap-icons/font/bootstrap-icons.css';

const TaskList = () => {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const userResponse = await axios.get("http://localhost:8000/api/user", { headers });
        setUser(userResponse.data);

        let tasksResponse;
        if (projectId) {
          tasksResponse = await axios.get(`http://localhost:8000/api/projects/${projectId}/tasks`, { headers });
          const projectResponse = await axios.get(`http://localhost:8000/api/projects/${projectId}`, { headers });
          setProject(projectResponse.data.project);
        } else {
          tasksResponse = await axios.get(`http://localhost:8000/api/tasks?assigned_to_me=1`, { headers });
        }

        setTasks(tasksResponse.data.tasks);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (err) {
      setError("Failed to delete task");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-info" style={{ width: '3rem', height: '3rem' }} role="status" />
          <p className="mt-3 text-muted">Loading Tasks...</p>
        </div>
      </div>
    );
  }

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark">
          {projectId ? `📋 Tasks for ${project?.name}` : "🧾 My Assigned Tasks"}
        </h2>
        {projectId && (
          <div>
            <Link to={`/projects/${projectId}`} className="btn btn-outline-secondary me-2">
              <i className="bi bi-arrow-left-circle me-1"></i> Back to Project
            </Link>
            {user && project && user.id === project.user_id && (
              <Link to={`/projects/${projectId}/tasks/create`} className="btn btn-outline-primary">
                <i className="bi bi-plus-circle me-1"></i> New Task
              </Link>
            )}
          </div>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="alert alert-info">No tasks found.</div>
      ) : (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover align-middle border rounded">
            <thead className="table-light">
              <tr className="text-muted">
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Assigned To</th>
                <th className="text-center"></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td className="fw-semibold">{task.title}</td>
                  <td>
                    <span className={`badge rounded-pill bg-${getStatusBadge(task.status)}`}>
                      {task.status.replace("_", " ")}
                    </span>
                  </td>
                  <td>
                    <span className={`badge bg-${getPriorityBadge(task.priority)} text-uppercase`}>
                      {task.priority}
                    </span>
                  </td>
                  <td>
                    {task.due_time
                      ? new Date(task.due_time).toLocaleDateString()
                      : <span className="text-muted">Not set</span>}
                  </td>
                  <td>{task.assignedUser?.name || <em className="text-muted">Unassigned</em>}</td>
                  <td className="text-center">
                  <div className="d-flex justify-content-center gap-2 flex-wrap">
  <Link to={`/tasks/${task.id}`} className="btn btn-outline-info btn-sm">
    <i className="bi bi-eye me-1"></i> View
  </Link>
  {user && project && user.id === project.user_id && (
    <>
      <Link to={`/tasks/${task.id}/edit`} className="btn btn-outline-warning btn-sm">
        <i className="bi bi-pencil-square me-1"></i> Edit
      </Link>
      <button
        className="btn btn-outline-danger btn-sm"
        onClick={() => handleDeleteTask(task.id)}
      >
        <i className="bi bi-trash me-1"></i> Delete
      </button>
    </>
  )}
</div>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const getStatusBadge = (status) => {
  switch (status) {
    case "todo": return "secondary";
    case "in_progress": return "primary";
    case "review": return "info";
    case "completed": return "success";
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

export default TaskList;
