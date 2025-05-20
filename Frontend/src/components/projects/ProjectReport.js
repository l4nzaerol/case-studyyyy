import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import 'bootstrap-icons/font/bootstrap-icons.css';

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#d0ed57"];

const ProjectReport = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const projectRes = await axios.get(`http://localhost:8000/api/projects/${id}`, { headers });
        const tasksRes = await axios.get(`http://localhost:8000/api/projects/${id}/tasks`, { headers });
        const expendituresRes = await axios.get(`http://localhost:8000/api/projects/${id}/expenditures`, { headers });

        setProject(projectRes.data.project);
        setTasks(tasksRes.data.tasks);
        setExpenditures(expendituresRes.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load report data.");
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const totalCost = expenditures.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const completion = tasks.length
    ? Math.round((tasks.filter((t) => t.status === "completed").length / tasks.length) * 100)
    : 0;

  const chartData = expenditures.reduce((acc, exp) => {
    const existing = acc.find((item) => item.name === exp.description);
    if (existing) {
      existing.value += Number(exp.amount);
    } else {
      acc.push({ name: exp.description, value: Number(exp.amount) });
    }
    return acc;
  }, []);

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" />
        <div className="mt-2">Loading report...</div>
      </div>
    );

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container py-4">
      {/* Hero Header */}
      <div className="bg-dark text-white p-4 rounded mb-4 shadow">
        <h2 className="fw-bold"><i className="bi bi-bar-chart-fill me-2"></i>Project Report</h2>
        <h5 className="text-light">{project.name}</h5>
        <p className="text-muted">{project.description}</p>
      </div>

      {/* Summary Section */}
      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title text-primary"><i className="bi bi-check2-circle me-2"></i>Task Progress</h5>
              <ul className="list-group list-group-flush mb-3">
                <li className="list-group-item">Total Tasks: <strong>{tasks.length}</strong></li>
                <li className="list-group-item">Completed Tasks: <strong>{tasks.filter(t => t.status === "completed").length}</strong></li>
              </ul>
              <div className="progress" style={{ height: "28px" }}>
                <div
                  className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                  style={{ width: `${completion}%` }}
                  role="progressbar"
                >
                  {completion}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title text-success"><i className="bi bi-wallet2 me-2"></i>Budget Overview</h5>
              <ul className="list-group list-group-flush mb-3">
                <li className="list-group-item">Budget: ₱{Number(project.budget || 0).toFixed(2)}</li>
                <li className="list-group-item">Actual Cost: ₱{totalCost.toFixed(2)}</li>
                <li className="list-group-item">Remaining: ₱{(project.budget - totalCost).toFixed(2)}</li>
              </ul>
              <span className={`badge px-3 py-2 ${totalCost > project.budget ? 'bg-danger' : 'bg-success'}`}>
                {totalCost > project.budget ? "Over Budget" : "Within Budget"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Chart and Table */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-light border-bottom">
          <ul className="nav nav-tabs card-header-tabs" id="reportTabs" role="tablist">
            <li className="nav-item">
              <button className="nav-link active" id="chart-tab" data-bs-toggle="tab" data-bs-target="#chart"
                type="button" role="tab">Expenditure Chart</button>
            </li>
            <li className="nav-item">
              <button className="nav-link" id="table-tab" data-bs-toggle="tab" data-bs-target="#table"
                type="button" role="tab">Expenditure Details</button>
            </li>
          </ul>
        </div>
        <div className="card-body tab-content">
          <div className="tab-pane fade show active" id="chart" role="tabpanel">
            {chartData.length === 0 ? (
              <p className="text-muted">No expenditures to visualize.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    label
                    isAnimationActive
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="tab-pane fade" id="table" role="tabpanel">
            <div className="table-responsive mt-3">
              <table className="table table-hover table-bordered align-middle">
                <thead className="table-secondary">
                  <tr>
                    <th>#</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {expenditures.map((exp, i) => (
                    <tr key={exp.id}>
                      <td>{i + 1}</td>
                      <td>{exp.description}</td>
                      <td>₱{Number(exp.amount).toFixed(2)}</td>
                      <td>{new Date(exp.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="text-end">
        <Link to={`/projects/${id}`} className="btn btn-outline-dark">
          <i className="bi bi-arrow-left-circle me-1"></i>Back to Project
        </Link>
      </div>
    </div>
  );
};

export default ProjectReport;
