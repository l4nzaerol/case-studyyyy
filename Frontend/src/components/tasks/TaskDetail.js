import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const TaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentsError, setCommentsError] = useState(null);
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:8000/api/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTask(response.data.task);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch task details.");
        setLoading(false);
      }
    };

    fetchTask();

    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8000/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user");
      }
    };

    fetchUser();

    const fetchFiles = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:8000/api/tasks/${taskId}/files`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFiles(response.data.files);
      } catch (err) {
        console.error("Failed to fetch files");
      }
    };

    fetchFiles();
  }, [taskId]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:8000/api/tasks/${taskId}/comments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setComments(response.data.comments);
      } catch (err) {
        setCommentsError("Failed to fetch comments.");
      }
    };

    fetchComments();
    const interval = setInterval(fetchComments, 5000);
    return () => clearInterval(interval);
  }, [taskId]);

  const handleStatusChange = async (newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:8000/api/tasks/${taskId}`, { ...task, status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTask({ ...task, status: newStatus });
    } catch (err) {
      setError("Failed to update task status");
      setTimeout(() => navigate(-1), 2000);
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate(`/projects/${task.project_id}/tasks`);
    } catch (err) {
      setError("Failed to delete task");
      setTimeout(() => navigate(-1), 3000);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:8000/api/tasks/${taskId}/comments`,
        { comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) => [response.data.comment, ...prev]);
      setNewComment("");
    } catch (err) {
      setCommentsError("Failed to post comment.");
      setTimeout(() => navigate(-1), 3000);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`http://localhost:8000/api/tasks/${taskId}/files`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setFiles((prev) => [...prev, response.data.file]);
      setFile(null);
      e.target.reset();
    } catch (err) {
      setFileError("Failed to upload file.");
      setTimeout(() => navigate(-1), 3000);
    }
  };

  const handleDownload = async (fileId, filename) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:8000/api/files/${fileId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Download failed. You may not have permission.");
      setTimeout(() => navigate(-1), 3000);
    }
  };

  if (loading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <div>Loading Task Details...</div>
        </div>
      </div>
    );
  }

  if (error) return <div className="alert alert-danger m-3">{error}</div>;
  if (!task) return <div className="alert alert-warning m-3">Task not found</div>;

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Link to={`/projects/${task.project_id}/tasks`} className="text-decoration-none text-muted">
          <i className="bi bi-arrow-left-circle me-2"></i>Back to Tasks
        </Link>
        {user && task.project?.owner_id === user.id && (
          <div className="d-flex gap-2">
            <Link to={`/tasks/${taskId}/edit`} className="btn btn-sm btn-outline-warning">
              <i className="bi bi-pencil-square me-1"></i>Edit
            </Link>
            <button className="btn btn-sm btn-outline-danger" onClick={handleDeleteTask}>
              <i className="bi bi-trash me-1"></i>Delete
            </button>
          </div>
        )}
      </div>
  
      {/* Two-Column Layout */}
      <div className="row g-4">
        {/* Task Info */}
        <div className="col-lg-6">
          <section className="p-4 border rounded-4 shadow-sm h-100 bg-white">
            <h3 className="text-dark mb-3 fw-semibold">{task.title}</h3>
            <p className="text-muted mb-4">{task.description || <em>No description provided.</em>}</p>
  
            <div className="mb-4">
              <h6 className="text-uppercase fw-bold small text-secondary mb-3">Task Details</h6>
              <div className="row gy-2">
                <div className="col-6"><strong>Project:</strong><br />{task.project?.name}</div>
                <div className="col-6"><strong>Assigned:</strong><br />{task.assigned_user?.name || "Unassigned"}</div>
                <div className="col-6"><strong>Due:</strong><br />{task.due_time ? new Date(task.due_time).toLocaleDateString() : "Not set"}</div>
                <div className="col-6"><strong>Created:</strong><br />{new Date(task.created_at).toLocaleDateString()}</div>
                <div className="col-6"><strong>Status:</strong><br />
                  <span className={`badge bg-${getStatusBadge(task.status)}`}>
                    {task.status.replace("_", " ")}
                  </span>
                </div>
                <div className="col-6"><strong>Priority:</strong><br />
                  <span className={`badge bg-${getPriorityBadge(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            </div>
  
            {/* Status Buttons */}
            <div>
              <h6 className="text-uppercase fw-bold small text-secondary mb-2">Update Status</h6>
              <div className="d-flex flex-wrap gap-2">
                {["todo", "in_progress", "review", "completed"].map((status) => (
                  <button
                    key={status}
                    className={`btn btn-sm ${task.status === status ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => handleStatusChange(status)}
                  >
                    {status.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
  
        {/* Files and Comments */}
        <div className="col-lg-6">
          <div className="d-flex flex-column gap-4">
  
            {/* Files */}
            <section className="p-4 border rounded-4 shadow-sm bg-white">
              <h5 className="fw-bold mb-3">📎 Attachments</h5>
              <form onSubmit={handleFileUpload} className="input-group mb-3">
                <input type="file" className="form-control" onChange={(e) => setFile(e.target.files[0])} />
                <button className="btn btn-outline-success" type="submit">Upload</button>
              </form>
              {fileError && <div className="alert alert-danger">{fileError}</div>}
              {files.length === 0 ? (
                <p className="text-muted">No files uploaded yet.</p>
              ) : (
                <ul className="list-unstyled">
                  {files.map((f) => (
                    <li key={f.id} className="d-flex justify-content-between align-items-center border-bottom py-2">
                      <div>
                        <strong>{f.filename}</strong>
                        <div className="small text-muted">by {f.user?.name}</div>
                      </div>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => handleDownload(f.id, f.filename)}
                      >
                        <i className="bi bi-download"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
  
            {/* Comments */}
            <section className="p-4 border rounded-4 shadow-sm bg-white">
              <h5 className="fw-bold mb-3">💬 Comments</h5>
              <form onSubmit={handleCommentSubmit} className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button className="btn btn-outline-primary" type="submit">Post</button>
              </form>
              {commentsError && <div className="alert alert-danger">{commentsError}</div>}
              <div style={{ maxHeight: 250, overflowY: "auto" }} className="small">
                {comments.length === 0 ? (
                  <p className="text-muted">No comments yet.</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="border-bottom mb-3 pb-2">
                      <div className="fw-semibold">{c.user?.name || "Unknown"}</div>
                      <div className="text-muted small">{new Date(c.created_at).toLocaleString()}</div>
                      <div>{c.comment}</div>
                    </div>
                  ))
                )}
              </div>
            </section>
  
          </div>
        </div>
      </div>
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

export default TaskDetail;