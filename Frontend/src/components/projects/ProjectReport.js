import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import 'bootstrap-icons/font/bootstrap-icons.css';

const COLORS = ["#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f", "#edc948"];

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

        const [projectRes, tasksRes, expendituresRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/projects/${id}`, { headers }),
          axios.get(`http://localhost:8000/api/projects/${id}/tasks`, { headers }),
          axios.get(`http://localhost:8000/api/projects/${id}/expenditures`, { headers })
        ]);

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

  const barData = expenditures.map((exp) => ({
    date: new Date(exp.created_at).toLocaleDateString(),
    amount: Number(exp.amount)
  }));

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" />
        <div className="mt-2">Loading report...</div>
      </div>
    );

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="mb-5 text-center">
        <h2 className="fw-bold text-dark">
          <i className="bi bi-graph-up-arrow me-2"></i>
          Project Report
        </h2>
        <h5 className="text-muted">{project.name}</h5>
        <p>{project.description}</p>
      </div>

      {/* Metrics Row */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h5 className="text-primary"><i className="bi bi-check2-square me-2"></i>Task Summary</h5>
              <p>Total Tasks: <strong>{tasks.length}</strong></p>
              <p>Completed: <strong>{tasks.filter(t => t.status === "completed").length}</strong></p>
              <div className="progress" style={{ height: "26px" }}>
                <div
                  className="progress-bar bg-success progress-bar-striped"
                  style={{ width: `${completion}%` }}
                >
                  {completion}%
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h5 className="text-success"><i className="bi bi-cash-coin me-2"></i>Budget Summary</h5>
              <p>Budget: ₱{Number(project.budget || 0).toFixed(2)}</p>
              <p>Spent: ₱{totalCost.toFixed(2)}</p>
              <p>Remaining: ₱{(project.budget - totalCost).toFixed(2)}</p>
              <span className={`badge ${totalCost > project.budget ? 'bg-danger' : 'bg-success'}`}>
                {totalCost > project.budget ? 'Over Budget' : 'Within Budget'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h5 className="text-info"><i className="bi bi-pie-chart-fill me-2"></i>Expenditure Breakdown</h5>
              {chartData.length === 0 ? (
                <p className="text-muted">No data to display.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={100}
                      paddingAngle={3}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h5 className="text-warning"><i className="bi bi-bar-chart-line-fill me-2"></i>Spending Over Time</h5>
              {barData.length === 0 ? (
                <p className="text-muted">No data available.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm border-0 mb-5">
        <div className="card-header bg-light">
          <h5 className="mb-0"><i className="bi bi-table me-2"></i>Expenditure Table</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover align-middle">
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

      {/* Back Button */}
      <div className="text-end">
        <Link to={`/projects/${id}`} className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i>Back to Project
        </Link>
      </div>
    </div>
  );
};

export default ProjectReport;
