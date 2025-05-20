import React, { useState } from 'react';
import { Gantt, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ProjectGanttChart.css';

const statusColor = {
  completed: '#51cf66',
  ongoing: '#339af0',
  pending: '#fab005',
  default: '#ced4da',
};

const ProjectGanttChart = ({ tasks }) => {
  const [viewMode, setViewMode] = useState(ViewMode.Week);

  if (!Array.isArray(tasks)) {
    return <div className="alert alert-warning">No valid tasks to display</div>;
  }

  const ganttTasks = tasks.reduce((acc, task) => {
    if (!task || !task.start_time || !task.due_time) return acc;

    const startDate = new Date(task.start_time);
    const endDate = new Date(task.due_time);
    if (isNaN(startDate) || isNaN(endDate)) return acc;

    const status = task.status?.toLowerCase() || 'default';
    const emoji = status === 'completed' ? '✅' :
                  status === 'ongoing' ? '🚧' :
                  status === 'pending' ? '🕒' : '📄';

    acc.push({
      start: startDate,
      end: endDate,
      name: `${emoji} ${task.title || 'Untitled Task'}`,
      id: task.id ? task.id.toString() : Math.random().toString(36).substr(2, 9),
      type: 'task',
      progress: status === 'completed' ? 100 : status === 'ongoing' ? 50 : 0,
      styles: {
        progressColor: `linear-gradient(to right, ${statusColor[status] || statusColor.default}, #fff)`,
        backgroundColor: '#e9ecef',
        backgroundSelectedColor: '#dee2e6',
        progressSelectedColor: '#ff6b6b',
      },
      isDisabled: true,
    });

    return acc;
  }, []);

  const total = ganttTasks.length;
  const completed = ganttTasks.filter(task => task.progress === 100).length;
  const ongoing = ganttTasks.filter(task => task.progress === 50).length;
  const pending = total - completed - ongoing;

  if (total === 0) {
    return <div className="alert alert-warning">No valid tasks to display</div>;
  }

  return (
    <div className="gantt-container shadow rounded">
      {/* Header */}
      <div className="gantt-header text-white p-3 rounded-top d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-1 fw-bold"><i className="bi bi-bar-chart-steps me-2"></i>Project Timeline</h4>
          <small>Creative Gantt View of Task Execution</small>
        </div>
        <div>
          <select
            className="form-select form-select-sm"
            style={{ width: '140px' }}
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
          >
            <option value={ViewMode.Day}>📅 Day View</option>
            <option value={ViewMode.Week}>📆 Week View</option>
            <option value={ViewMode.Month}>🗓️ Month View</option>
          </select>
        </div>
      </div>

      {/* Summary Panel */}
      <div className="gantt-stats bg-light py-2 px-4 border-bottom">
        <div className="row text-center">
          <div className="col"><span className="badge bg-success">{completed}</span><div className="small">Completed</div></div>
          <div className="col"><span className="badge bg-primary">{ongoing}</span><div className="small">Ongoing</div></div>
          <div className="col"><span className="badge bg-warning text-dark">{pending}</span><div className="small">Pending</div></div>
          <div className="col"><span className="fw-bold">{total}</span><div className="small">Total</div></div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="gantt-scroll">
        <Gantt
          tasks={ganttTasks}
          viewMode={viewMode}
          locale="en"
          listCellWidth="260px"
          columnWidth={80}
          fontSize="13"
          barCornerRadius={6}
          rowHeight={42}
          listColumns={[
            {
              title: '📋 Task Title',
              value: 'name',
              width: '260px',
            }
          ]}
        />
      </div>
    </div>
  );
};

export default ProjectGanttChart;
