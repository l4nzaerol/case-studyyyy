import React from 'react';
import { Gantt, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ProjectGanttChart.css';

const ProjectGanttChart = ({ tasks }) => {
  if (!Array.isArray(tasks)) {
    console.warn('Tasks prop is not an array');
    return <div className="alert alert-warning">No valid tasks to display</div>;
  }

  const ganttTasks = tasks.reduce((acc, task) => {
    if (!task || !task.start_time || !task.due_time) {
      console.warn('Skipping invalid task:', task);
      return acc;
    }

    const startDate = new Date(task.start_time);
    const endDate = new Date(task.due_time);

    if (isNaN(startDate) || isNaN(endDate)) {
      console.warn('Invalid date format in task:', task);
      return acc;
    }

    const ganttTask = {
      start: startDate,
      end: endDate,
      name: task.title || 'Untitled Task',
      id: task.id ? task.id.toString() : Math.random().toString(36).substr(2, 9),
      type: 'task',
      progress: task.status === 'completed' ? 100 : 0,
      isDisabled: true,
    };

    acc.push(ganttTask);
    return acc;
  }, []);

  if (ganttTasks.length === 0) {
    return <div className="alert alert-warning">No valid tasks to display</div>;
  }

  return (
    <div className="gantt-card">
      <div className="gantt-header text-white px-4 py-3">
        <h4 className="fw-bold mb-0">🗓️ Project Timeline Overview</h4>
      </div>
      <div className="gantt-body">
        <div className="gantt-scroll">
        <Gantt
  tasks={ganttTasks}
  viewMode={ViewMode.Day}
  locale="en"
  listCellWidth="220px"
  barProgressColor="#0d6efd"
  barBackgroundColor="#adb5bd"
  fontSize="14"
  columnWidth={60}
  listColumns={[
    {
      title: "Task", // 👈 Change column header here
      width: "220px",
      value: "name", // 👈 This tells it to show the task name
    }
  ]}
/>

        </div>
      </div>
    </div>
  );
};

export default ProjectGanttChart;
