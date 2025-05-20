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
          <div className="spinner-border text-info" role="status" />
          <p className="mt-3 text-muted">Loading Tasks...</p>
        </div>
      </div>
    );
  }

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="text-dark fw-semibold">
          {projectId ? ` Tasks for ${project?.name}` : "🧾 My Assigned Tasks"}
        </h4>
        {projectId && (
          <div>
            <Link to={`/projects/${projectId}`} className="btn btn-sm btn-outline-dark me-2">
              <i className="bi bi-arrow-left-circle"></i> Back
            </Link>
            {user && project && user.id === project.user_id && (
              <Link to={`/projects/${projectId}/tasks/create`} className="btn btn-sm btn-dark">
                <i className="bi bi-plus-circle"></i> New Task
              </Link>
            )}
          </div>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="alert alert-light border">No tasks found.</div>
      ) : (
        <div className="list-group">
          {tasks.map((task) => (
            <div key={task.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-start py-3 border-bottom">
              <div className="w-100">
                <div className="d-flex justify-content-between">
                  <strong className="text-dark">{task.title}</strong>
                  <small className="text-muted">
                    {task.due_time ? new Date(task.due_time).toLocaleDateString() : "No due date"}
                  </small>
                </div>
                <div className="d-flex gap-2 mt-1 flex-wrap text-muted small">
                  <span className={`badge bg-${getStatusBadge(task.status)}`}>
                    {task.status.replace("_", " ")}
                  </span>
                  <span className={`badge bg-${getPriorityBadge(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span>
                    <i className="bi bi-person-circle me-1"></i>
                    {task.assignedUser?.name || <em>Unassigned</em>}
                  </span>
                </div>
              </div>
              <div className="d-flex gap-2 ms-3 flex-shrink-0">
                <Link to={`/tasks/${task.id}`} className="btn btn-sm btn-outline-secondary">
                  <i className="bi bi-eye"></i>
                </Link>
                {user && project && user.id === project.user_id && (
                  <>
                    <Link to={`/tasks/${task.id}/edit`} className="btn btn-sm btn-outline-warning">
                      <i className="bi bi-pencil-square"></i>
                    </Link>
                    <button onClick={() => handleDeleteTask(task.id)} className="btn btn-sm btn-outline-danger">
                      <i className="bi bi-trash"></i>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
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
