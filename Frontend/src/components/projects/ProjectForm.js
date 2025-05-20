import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    due_date: "",
    status: "planning",
    budget: "",
  });

  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditing) {
      const fetchProject = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            `http://localhost:8000/api/projects/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const project = response.data.project;
          setFormData({
            name: project.name,
            description: project.description || "",
            start_date: project.start_date?.split("T")[0] || "",
            due_date: project.due_date?.split("T")[0] || "",
            status: project.status,
            budget: project.budget || "",
          });
          setLoading(false);
        } catch (err) {
          setError("Failed to fetch project details");
          setLoading(false);
        }
      };

      fetchProject();
    }
  }, [id, isEditing]);

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
        ? `http://localhost:8000/api/projects/${id}`
        : "http://localhost:8000/api/projects";

      await axios({
        method,
        url,
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/projects");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "You don't have permission to perform this action."
      );
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading Form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-header bg-gradient bg-primary text-white py-3 rounded-top-4">
          <h3 className="mb-0">
            {isEditing ? " Edit Project" : "Create New Project"}
          </h3>
        </div>
        <div className="card-body p-4">
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} className="needs-validation" noValidate>
            <div className="mb-3">
              <label htmlFor="name" className="form-label fw-semibold">
                Project Name
              </label>
              <input
                type="text"
                className="form-control shadow-sm"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter project title"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="description" className="form-label fw-semibold">
                Description
              </label>
              <textarea
                className="form-control shadow-sm"
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description about the project"
              ></textarea>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="start_date" className="form-label fw-semibold">
                  Start Date
                </label>
                <input
                  type="date"
                  className="form-control shadow-sm"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="due_date" className="form-label fw-semibold">
                  Due Date
                </label>
                <input
                  type="date"
                  className="form-control shadow-sm"
                  id="due_date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="status" className="form-label fw-semibold">
                Status
              </label>
              <select
                className="form-select shadow-sm"
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="budget" className="form-label fw-semibold">
                Budget (₱)
              </label>
              <input
                type="number"
                className="form-control shadow-sm"
                id="budget"
                name="budget"
                min="0"
                step="0.01"
                value={formData.budget}
                onChange={handleChange}
                placeholder="e.g. 50000"
              />
            </div>

            <div className="d-flex gap-3">
              <button type="submit" className="btn btn-success px-4">
                {isEditing ? "Update Project" : "Create Project"}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate("/projects")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectForm;
