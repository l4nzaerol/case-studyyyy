import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/projects', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProjects(response.data.projects);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch projects');
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className="text-center">
        <div className="spinner-border text-info" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="mt-3 text-muted">Fetching Projects...</div>
      </div>
    </div>
  );

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark">Projects</h2>
        <Link to="/projects/create" className="btn btn-outline-primary">
          <i className="bi bi-plus-lg me-2"></i> Create Project
        </Link>
      </div>

      <div className="row">
        {projects.length === 0 ? (
          <div className="text-center text-muted">
            <p>No projects found. Start by creating a new one!</p>
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="col-lg-4 col-md-6 mb-4">
              <div className="card shadow-sm project-card h-100 border-0">
                <div className="card-body">
                  <h5 className="card-title text-primary fw-semibold">{project.name}</h5>
                  <p className="card-text text-secondary small">{project.description}</p>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className={`badge bg-${getStatusBadge(project.status)} text-uppercase`}>
                      {project.status.replace('_', ' ')}
                    </span>
                    <small className="text-muted">
                      <i className="bi bi-calendar-event me-1"></i>
                      {new Date(project.due_date).toLocaleDateString()}
                    </small>
                  </div>

                  <div className="d-flex gap-2">
                    <Link to={`/projects/${project.id}`} className="btn btn-sm btn-outline-info">
                      <i className="bi bi-eye me-1"></i> View
                    </Link>
                    <Link to={`/projects/${project.id}/edit`} className="btn btn-sm btn-outline-warning">
                      <i className="bi bi-pencil-square me-1"></i> Edit
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'planning': return 'secondary';
    case 'active': return 'primary';
    case 'completed': return 'success';
    case 'on_hold': return 'warning';
    default: return 'info';
  }
};

export default ProjectList;
