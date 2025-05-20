import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const RiskIssuePanel = ({ projectId, isOwner }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePopover, setActivePopover] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    type: "issue",
    title: "",
    description: "",
    impact_level: "medium",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(
          `http://localhost:8000/api/projects/${projectId}/risks-issues`,
          { headers }
        );
        setItems(res.data);
      } catch (err) {
        console.error(err.response?.data || err.message);
        setError("Failed to load risks/issues.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(
        `http://localhost:8000/api/projects/${projectId}/risks-issues`,
        { headers }
      );
      setItems(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError("Failed to load risks/issues.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (item, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(
        `http://localhost:8000/api/risks-issues/${item.id}`,
        { ...item, status: newStatus },
        { headers }
      );
      fetchItems();
      setActivePopover(null);
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(
        `http://localhost:8000/api/projects/${projectId}/risks-issues`,
        form,
        { headers }
      );
      setItems((prev) => [res.data, ...prev]);
      setShowModal(false);
      setForm({
        type: "issue",
        title: "",
        description: "",
        impact_level: "medium",
      });
    } catch (err) {
      alert(err.response?.data?.error || "Failed to submit.");
    }
  };

  const StatusPopover = ({ item }) => {
    const popoverRef = useRef(null);
    const nextStatus = item.status === "closed" ? "open" : "closed";

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (popoverRef.current && !popoverRef.current.contains(event.target)) {
          setActivePopover(null);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <div
        ref={popoverRef}
        className="position-absolute bg-white border rounded shadow p-2"
        style={{ zIndex: 1000, minWidth: "150px" }}
      >
        <button
          className="btn btn-sm btn-outline-primary w-100"
          onClick={() => handleChangeStatus(item, nextStatus)}
        >
          Set {nextStatus}
        </button>
      </div>
    );
  };

  // Separate the data for risks and issues
  const risks = items.filter((item) => item.type === "risk");
  const issues = items.filter((item) => item.type === "issue");

  if (loading) return <div>Loading Risks/Issues...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container my-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Project Risks & Issues</h4>
          <button className="btn btn-light btn-sm" onClick={() => setShowModal(true)}>
            Report New
          </button>
        </div>
        <div className="card-body">
          <div className="row">
            {/* Risks Column */}
            <div className="col-md-6 mb-4">
              <h5 className="border-bottom pb-2">Risks</h5>
              {risks.length === 0 ? (
                <p className="text-muted">No risks reported.</p>
              ) : (
                risks.map((risk) => (
                  <div key={risk.id} className="card mb-3">
                    <div className="card-body d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="card-title mb-1">{risk.title}</h6>
                        <p className="card-text text-muted mb-1">{risk.description}</p>
                        <small className="text-secondary">
                          <strong>Impact:</strong> {risk.impact_level}
                        </small>
                      </div>
                      <div className="text-end position-relative">
                        <span
                          className={`badge ${
                            risk.status === "open"
                              ? "bg-danger"
                              : "bg-success"
                          }`}
                        >
                          {risk.status.toUpperCase()}
                        </span>
                        {isOwner && (
                          <button
                            className="btn btn-link text-decoration-none ms-2"
                            onClick={() =>
                              setActivePopover(activePopover === risk.id ? null : risk.id)
                            }
                          >
                            <small>Change Status</small>
                          </button>
                        )}
                        {activePopover === risk.id && <StatusPopover item={risk} />}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Issues Column */}
            <div className="col-md-6 mb-4">
              <h5 className="border-bottom pb-2">Issues</h5>
              {issues.length === 0 ? (
                <p className="text-muted">No issues reported.</p>
              ) : (
                issues.map((issue) => (
                  <div key={issue.id} className="card mb-3">
                    <div className="card-body d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="card-title mb-1">{issue.title}</h6>
                        <p className="card-text text-muted mb-1">{issue.description}</p>
                        <small className="text-secondary">
                          <strong>Impact:</strong> {issue.impact_level}
                        </small>
                      </div>
                      <div className="text-end position-relative">
                        <span
                          className={`badge ${
                            issue.status === "open"
                              ? "bg-danger"
                              : "bg-success"
                          }`}
                        >
                          {issue.status.toUpperCase()}
                        </span>
                        <button
                          className="btn btn-link text-decoration-none ms-2"
                          onClick={() =>
                            setActivePopover(activePopover === issue.id ? null : issue.id)
                          }
                        >
                          <small>Change Status</small>
                        </button>
                        {activePopover === issue.id && <StatusPopover item={issue} />}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="card-footer text-muted text-end">
          Updated just now
        </div>
      </div>

      {/* Modal Section */}
      {showModal && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-secondary text-white">
                <h5 className="modal-title">Report New Risk/Issue</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Type</label>
                    <select
                      className="form-select"
                      name="type"
                      value={form.type}
                      onChange={handleInputChange}
                      disabled={!isOwner}
                    >
                      <option value="issue">Issue</option>
                      <option value="risk">Risk</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={form.title}
                      onChange={handleInputChange}
                      placeholder="Enter title"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={form.description}
                      onChange={handleInputChange}
                      placeholder="Enter details"
                      rows="3"
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Impact Level</label>
                    <select
                      className="form-select"
                      name="impact_level"
                      value={form.impact_level}
                      onChange={handleInputChange}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSubmit}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskIssuePanel;
