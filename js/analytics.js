// js/analytics.js

if (typeof getStoredTasks === 'undefined') {
  window.getStoredTasks = function () {
    try {
      const data = localStorage.getItem('taskforge-tasks');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };
}

document.addEventListener('DOMContentLoaded', () => {
  const tasks = getStoredTasks();

  const totalEl = document.getElementById('analyticsTotalTasks');
  const completedEl = document.getElementById('analyticsCompletedTasks');
  const pendingEl = document.getElementById('analyticsPendingTasks');

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const pending = total - completed;

  if (totalEl) totalEl.textContent = total;
  if (completedEl) completedEl.textContent = completed;
  if (pendingEl) pendingEl.textContent = pending;

  const statusCtx = document.getElementById('analyticsStatusChart');
  const priorityCtx = document.getElementById('analyticsPriorityChart');

  const high = tasks.filter(t => t.priority === 'high').length;
  const medium = tasks.filter(t => t.priority === 'medium').length;
  const low = tasks.filter(t => t.priority === 'low').length;

  if (statusCtx && window.Chart) {
    new Chart(statusCtx, {
      type: 'bar',
      data: {
        labels: ['Completed', 'Pending'],
        datasets: [
          {
            label: 'Tasks',
            data: [completed, pending],
            backgroundColor: ['#198754', '#6c757d']
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
      }
    });
  }

  if (priorityCtx && window.Chart) {
    new Chart(priorityCtx, {
      type: 'pie',
      data: {
        labels: ['High', 'Medium', 'Low'],
        datasets: [
          {
            data: [high, medium, low],
            backgroundColor: ['#dc3545', '#ffc107', '#198754']
          }
        ]
      },
      options: {
        responsive: true
      }
    });
  }

  const upcomingList = document.getElementById('upcomingTasksList');
  const noUpcomingMsg = document.getElementById('noUpcomingTasksMessage');

  if (upcomingList && noUpcomingMsg) {
    const upcoming = tasks
      .filter(t => t.status !== 'completed' && t.dueDate)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 5);

    upcomingList.innerHTML = '';

    if (upcoming.length === 0) {
      noUpcomingMsg.classList.remove('d-none');
    } else {
      noUpcomingMsg.classList.add('d-none');
      upcoming.forEach(task => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
          <div>
            <div class="fw-semibold">${task.name}</div>
            <div class="small text-muted">${task.description || ''}</div>
          </div>
          <span class="badge bg-secondary">${task.dueDate}</span>
        `;
        upcomingList.appendChild(li);
      });
    }
  }
});
