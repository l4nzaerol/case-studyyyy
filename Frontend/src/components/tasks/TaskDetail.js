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
    <div className="container py-5">
      <div className="bg-white rounded shadow p-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-4">
          <div>
            <h3 className="mb-2 text-primary">{task.title}</h3>
            <p className="text-muted">{task.description || "No description provided"}</p>
          </div>
          <div>
            <Link to={`/projects/${task.project_id}/tasks`} className="btn btn-outline-secondary me-2">
              <i className="bi bi-arrow-left"></i> Back
            </Link>
            {user && task.project?.owner_id === user.id && (
              <>
                <Link to={`/tasks/${taskId}/edit`} className="btn btn-outline-warning me-2">Edit</Link>
                <button className="btn btn-outline-danger" onClick={handleDeleteTask}>Delete</button>
              </>
            )}
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-6">
            <ul className="list-group">
              <li className="list-group-item"><strong>Project:</strong> {task.project?.name}</li>
              <li className="list-group-item"><strong>Status:</strong> <span className={`badge bg-${getStatusBadge(task.status)}`}>{task.status.replace("_", " ")}</span></li>
              <li className="list-group-item"><strong>Priority:</strong> <span className={`badge bg-${getPriorityBadge(task.priority)}`}>{task.priority}</span></li>
              <li className="list-group-item"><strong>Assigned To:</strong> {task.assigned_user?.name || "Unassigned"}</li>
              <li className="list-group-item"><strong>Due Date:</strong> {task.due_time ? new Date(task.due_time).toLocaleDateString() : "Not set"}</li>
              <li className="list-group-item"><strong>Created:</strong> {new Date(task.created_at).toLocaleDateString()}</li>
            </ul>

            <div className="mt-4">
              <h5>Update Status</h5>
              <div className="btn-group w-100">
                {["todo", "in_progress", "review", "completed"].map((status) => (
                  <button
                    key={status}
                    className={`btn ${task.status === status ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => handleStatusChange(status)}
                  >
                    {status.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="mb-4">
              <h5>Attachments</h5>
              {fileError && <div className="alert alert-danger">{fileError}</div>}
              <form onSubmit={handleFileUpload} className="input-group mb-3">
                <input type="file" className="form-control" onChange={(e) => setFile(e.target.files[0])} />
                <button type="submit" className="btn btn-outline-success">Upload</button>
              </form>
              <ul className="list-group">
                {files.length === 0 ? (
                  <li className="list-group-item">No files uploaded.</li>
                ) : (
                  files.map((f) => (
                    <li key={f.id} className="list-group-item d-flex justify-content-between">
                      <div>
                        <strong>{f.filename}</strong><br />
                        <small>Uploaded by {f.user?.name}</small>
                      </div>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => handleDownload(f.id, f.filename)}>Download</button>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div>
              <h5>Comments</h5>
              {commentsError && <div className="alert alert-danger">{commentsError}</div>}
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
              <ul className="list-group">
                {comments.length === 0 ? (
                  <li className="list-group-item">No comments yet.</li>
                ) : (
                  comments.map((comment) => (
                    <li key={comment.id} className="list-group-item">
                      <strong>{comment.user?.name || "Unknown User"}</strong><br />
                      <small className="text-muted">{new Date(comment.created_at).toLocaleString()}</small>
                      <p className="mb-0 mt-1">{comment.comment}</p>
                    </li>
                  ))
                )}
              </ul>
            </div>
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