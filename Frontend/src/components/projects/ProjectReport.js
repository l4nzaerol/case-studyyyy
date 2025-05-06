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
        <div>Loading report...</div>
      </div>
    );

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-1"><i className="bi bi-clipboard-data me-2"></i>Project Report</h2>
        <h5 className="text-muted">{project.name}</h5>
        <p>{project.description}</p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card border-primary shadow-sm">
            <div className="card-header bg-primary text-white">
              <i className="bi bi-graph-up-arrow me-2"></i>Progress
            </div>
            <div className="card-body">
              <p><strong>Total Tasks:</strong> {tasks.length}</p>
              <p><strong>Completed:</strong> {tasks.filter(t => t.status === "completed").length}</p>
              <p><strong>Progress:</strong></p>
              <div className="progress" style={{ height: "24px" }}>
                <div
                  className="progress-bar bg-success"
                  role="progressbar"
                  style={{ width: `${completion}%` }}
                  aria-valuenow={completion}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  {completion}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-success shadow-sm">
            <div className="card-header bg-success text-white">
              <i className="bi bi-cash-coin me-2"></i>Budget
            </div>
            <div className="card-body">
              <p><strong>Budget:</strong> ₱{Number(project.budget || 0).toFixed(2)}</p>
              <p><strong>Actual Cost:</strong> ₱{totalCost.toFixed(2)}</p>
              <p><strong>Remaining Budget:</strong> ₱{(project.budget - totalCost).toFixed(2)}</p>
              <p>
                <strong>Status:</strong>{" "}
                {totalCost > project.budget ? (
                  <span className="badge bg-danger">Over Budget</span>
                ) : (
                  <span className="badge bg-success">Within Budget</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-info text-white">
          <i className="bi bi-pie-chart-fill me-2"></i>Expenditure Breakdown
        </div>
        <div className="card-body">
          {chartData.length === 0 ? (
            <p className="text-muted">No expenditures to display.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  dataKey="value"
                  isAnimationActive
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
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
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-secondary text-white">
          <i className="bi bi-list-ul me-2"></i>Detailed Expenditures
        </div>
        <div className="card-body table-responsive">
          <table className="table table-striped table-hover table-bordered">
            <thead className="table-light">
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

      <div className="mt-4">
        <Link to={`/projects/${id}`} className="btn btn-outline-dark">
          <i className="bi bi-arrow-left-circle me-1"></i>Back to Project
        </Link>
      </div>
    </div>
  );
};

export default ProjectReport;
