import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";

const AddExpenditure = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:8000/api/projects/${id}/expenditures`,
        { amount, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/projects/${id}/expenditures`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to add expenditure. Please try again."
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary">
          <i className="bi bi-cash-stack me-2"></i>New Expenditure
        </h2>
        <Link to={`/projects/${id}/expenditures`} className="btn btn-outline-dark">
          <i className="bi bi-arrow-left-circle me-1"></i> Back to List
        </Link>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-body p-5">
              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="description" className="form-label fw-semibold">
                    Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control rounded-3"
                    id="description"
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    disabled={submitting}
                    placeholder="Enter detailed description of the expenditure..."
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label htmlFor="amount" className="form-label fw-semibold">
                    Amount (₱) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control rounded-3"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    disabled={submitting}
                    placeholder="0.00"
                  />
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-success btn-lg" disabled={submitting}>
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Recording...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-plus-circle me-2"></i>Record Expenditure
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddExpenditure;
