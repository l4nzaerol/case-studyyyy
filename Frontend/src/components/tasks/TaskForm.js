import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const TaskForm = () => {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!taskId;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project_id: projectId || "",
    assigned_to: "",
    status: "todo",
    priority: "medium",
    start_time: "",
    due_time: "",
  });

  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        let resolvedProjectId = projectId;

        if (isEditing) {
          const taskResponse = await axios.get(
            `http://localhost:8000/api/tasks/${taskId}`,
            { headers }
          );
          const task = taskResponse.data.task;

          setFormData({
            title: task.title,
            description: task.description || "",
            project_id: task.project_id,
            assigned_to: task.assigned_to || "",
            status: task.status,
            priority: task.priority,
            start_time: task.start_time ? task.start_time.slice(0, 16) : "",
            due_time: task.due_time ? task.due_time.slice(0, 16) : "",
          });

          resolvedProjectId = task.project_id;
        }

        if (resolvedProjectId) {
          const membersResponse = await axios.get(
            `http://localhost:8000/api/projects/${resolvedProjectId}/members`,
            { headers }
          );
          setUsers(membersResponse.data.members);
        }

        const projectsResponse = await axios.get(
          "http://localhost:8000/api/projects",
          { headers }
        );
        setProjects(projectsResponse.data.projects);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load form data");
        setLoading(false);
      }
    };

    fetchData();
  }, [taskId, projectId, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const method = isEditing ? "put" : "post";
      const url = isEditing
        ? `http://localhost:8000/api/tasks/${taskId}`
        : "http://localhost:8000/api/tasks";

      await axios({
        method,
        url,
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate(`/projects/${formData.project_id}/tasks`);
    } catch (err) {
      setError("Failed to save task");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-grow text-info" style={{ width: "3rem", height: "3rem" }}></div>
          <p className="mt-2 fw-semibold text-info">Preparing your task form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="mx-auto shadow rounded-4 p-4" style={{ maxWidth: "800px", backgroundColor: "#fdfdfd" }}>
        <h3 className="text-center mb-4">{isEditing ? "✏️ Edit Task" : "📝 Create New Task"}</h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label fw-bold">Task Title</label>
            <input
              type="text"
              className="form-control rounded-pill px-4"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter a title for the task"
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold">Description</label>
            <textarea
              className="form-control rounded-3"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="What needs to be done?"
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold">Project</label>
            <select
              className="form-select rounded-pill px-3"
              name="project_id"
              value={formData.project_id}
              onChange={handleChange}
              required
              disabled={!!projectId}
            >
              <option value="">-- Select a Project --</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-md-6">
              <label className="form-label fw-bold">Status</label>
              <select
                className="form-select rounded-pill"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={formData.status === "completed"}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold">Priority</label>
              <select
                className="form-select rounded-pill"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-md-6">
              <label className="form-label fw-bold">Assign To</label>
              <select
                className="form-select rounded-pill"
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleChange}
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold">Start Time</label>
              <input
                type="datetime-local"
                className="form-control rounded-pill"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold">Due Time</label>
            <input
              type="datetime-local"
              className="form-control rounded-pill"
              name="due_time"
              value={formData.due_time}
              onChange={handleChange}
            />
          </div>

          <div className="d-flex justify-content-end gap-3 mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary rounded-pill px-4"
              onClick={() => navigate(`/projects/${formData.project_id}/tasks`)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-success rounded-pill px-4">
              {isEditing ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
