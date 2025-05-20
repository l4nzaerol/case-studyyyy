import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const ExpenditureList = () => {
  const { id } = useParams();
  const [expenditures, setExpenditures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkingOwner, setCheckingOwner] = useState(true);

  const fetchExpenditures = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const projectRes = await axios.get(
        `http://localhost:8000/api/projects/${id}`,
        { headers }
      );
      const userRes = await axios.get("http://localhost:8000/api/user", {
        headers,
      });

      const userId = userRes.data.id;
      const isOwnerMatch = projectRes.data.project.user_id === userId;

      if (!isOwnerMatch) {
        setError("You are not authorized to view this page.");
        setCheckingOwner(false);
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `http://localhost:8000/api/projects/${id}/expenditures`,
        { headers }
      );
      setExpenditures(response.data);
      setLoading(false);
      setCheckingOwner(false);
    } catch (err) {
      setError("Failed to load expenditures or verify ownership.");
      setLoading(false);
      setCheckingOwner(false);
    }
  }, [id]);

  useEffect(() => {
    fetchExpenditures();
  }, [fetchExpenditures]);

  const handleDelete = async (expenditureId) => {
    if (!window.confirm("Are you sure you want to delete this expenditure?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:8000/api/expenditures/${expenditureId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setExpenditures((prev) => prev.filter((exp) => exp.id !== expenditureId));
    } catch (err) {
      alert("Failed to delete expenditure.");
    }
  };

  if (checkingOwner || loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" />
        <p className="mt-2">Checking access...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger mt-4 text-center">{error}</div>;
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark">
          <i className="bi bi-clipboard-data me-2"></i>Expenditure Records
        </h2>
        <div>
          <Link to={`/projects/${id}`} className="btn btn-outline-secondary me-2">
            <i className="bi bi-arrow-left-circle me-1"></i> Back to Project
          </Link>
          <Link to={`/projects/${id}/expenditures/add`} className="btn btn-success">
            <i className="bi bi-plus-circle me-1"></i> Record New
          </Link>
        </div>
      </div>

      {expenditures.length === 0 ? (
        <div className="alert alert-info">No expenditures recorded for this project.</div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Amount (₱)</th>
                    <th scope="col">Description</th>
                    <th scope="col">Date</th>
                    <th scope="col" style={{ width: "100px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenditures.map((exp, index) => (
                    <tr key={exp.id}>
                      <td>{index + 1}</td>
                      <td>₱{Number(exp.amount).toFixed(2)}</td>
                      <td>{exp.description}</td>
                      <td>{new Date(exp.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(exp.id)}
                          title="Delete"
                        >
                          <i className="bi bi-trash3"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenditureList;
