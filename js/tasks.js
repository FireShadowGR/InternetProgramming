// js/tasks.js

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

if (typeof getStoredActivity === 'undefined') {
  window.getStoredActivity = function () {
    try {
      const data = localStorage.getItem('taskforge-activity');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };
}

function saveTasks(tasks) {
  localStorage.setItem('taskforge-tasks', JSON.stringify(tasks));
}

function addActivityEntry(type, title, description) {
  const activity = getStoredActivity();
  activity.push({
    type,
    title,
    description,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('taskforge-activity', JSON.stringify(activity));
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('taskForm');
  const taskIdInput = document.getElementById('taskId');
  const nameInput = document.getElementById('taskName');
  const descriptionInput = document.getElementById('taskDescription');
  const dueDateInput = document.getElementById('taskDueDate');
  const priorityInput = document.getElementById('taskPriority');
  const cancelEditBtn = document.getElementById('cancelEditBtn');

  const filterStatus = document.getElementById('filterStatus');
  const filterPriority = document.getElementById('filterPriority');
  const sortBy = document.getElementById('sortBy');

  const tableBody = document.getElementById('tasksTableBody');
  const noTasksMessage = document.getElementById('noTasksMessage');

  const summaryTotal = document.getElementById('summaryTotal');
  const summaryCompleted = document.getElementById('summaryCompleted');
  const summaryPending = document.getElementById('summaryPending');

  const clearAllBtn = document.getElementById('clearAllTasksBtn');

  let tasks = getStoredTasks();

  function updateSummary() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = total - completed;
    if (summaryTotal) summaryTotal.textContent = total;
    if (summaryCompleted) summaryCompleted.textContent = completed;
    if (summaryPending) summaryPending.textContent = pending;
  }

  function renderTasks() {
    const statusFilter = filterStatus.value;
    const priorityFilter = filterPriority.value;
    const sortOption = sortBy.value;

    let visibleTasks = tasks.slice();

    visibleTasks = visibleTasks.filter(task => {
      let ok = true;
      if (statusFilter !== 'all') ok = ok && task.status === statusFilter;
      if (priorityFilter !== 'all') ok = ok && task.priority === priorityFilter;
      return ok;
    });

    visibleTasks.sort((a, b) => {
      switch (sortOption) {
        case 'dueDateAsc':
          return (a.dueDate || '').localeCompare(b.dueDate || '');
        case 'dueDateDesc':
          return (b.dueDate || '').localeCompare(a.dueDate || '');
        case 'nameAsc':
          return a.name.localeCompare(b.name);
        case 'nameDesc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    tableBody.innerHTML = '';

    if (visibleTasks.length === 0) {
      noTasksMessage.classList.remove('d-none');
    } else {
      noTasksMessage.classList.add('d-none');
    }

    visibleTasks.forEach(task => {
      const tr = document.createElement('tr');
      const priorityBadgeClass =
        task.priority === 'high'
          ? 'bg-danger'
          : task.priority === 'medium'
          ? 'bg-warning text-dark'
          : 'bg-success';

      const statusBadgeClass =
        task.status === 'completed' ? 'bg-success' : 'bg-secondary';

      tr.innerHTML = `
        <td>
          <span class="${task.status === 'completed' ? 'text-decoration-line-through' : ''}">
            ${task.name}
          </span>
        </td>
        <td class="d-none d-md-table-cell">${task.description || ''}</td>
        <td>${task.dueDate || ''}</td>
        <td>
          <span class="badge ${priorityBadgeClass} text-uppercase">${task.priority}</span>
        </td>
        <td>
          <span class="badge ${statusBadgeClass} text-capitalize">${task.status}</span>
        </td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-success me-1" data-action="toggle-complete" data-id="${task.id}">
            ${task.status === 'completed' ? 'Mark pending' : 'Mark done'}
          </button>
          <button class="btn btn-sm btn-outline-primary me-1" data-action="edit" data-id="${task.id}">Edit</button>
          <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${task.id}">Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    updateSummary();
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    event.stopPropagation();
    form.classList.add('was-validated');
    if (!form.checkValidity()) return;

    const id = taskIdInput.value;
    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();
    const dueDate = dueDateInput.value;
    const priority = priorityInput.value;

    if (!name || !dueDate || !priority) return;

    if (id) {
      const index = tasks.findIndex(t => t.id === id);
      if (index !== -1) {
        tasks[index].name = name;
        tasks[index].description = description;
        tasks[index].dueDate = dueDate;
        tasks[index].priority = priority;
        addActivityEntry('Task updated', name, 'Task updated with new details.');
      }
    } else {
      const newTask = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        name,
        description,
        dueDate,
        priority,
        status: 'pending'
      };
      tasks.push(newTask);
      addActivityEntry('Task created', name, `New task created with priority ${priority}.`);
    }

    saveTasks(tasks);
    resetForm();
    renderTasks();
  });

  function resetForm() {
    form.reset();
    form.classList.remove('was-validated');
    taskIdInput.value = '';
    cancelEditBtn.hidden = true;
  }

  form.addEventListener('reset', () => {
    form.classList.remove('was-validated');
  });

  cancelEditBtn.addEventListener('click', e => {
    e.preventDefault();
    resetForm();
  });

  tableBody.addEventListener('click', event => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const action = target.getAttribute('data-action');
    const id = target.getAttribute('data-id');
    if (!action || !id) return;

    if (action === 'edit') {
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      taskIdInput.value = task.id;
      nameInput.value = task.name;
      descriptionInput.value = task.description || '';
      dueDateInput.value = task.dueDate || '';
      priorityInput.value = task.priority || 'medium';
      cancelEditBtn.hidden = false;
      nameInput.focus();
    }

    if (action === 'delete') {
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      if (!confirm(`Delete task "${task.name}"?`)) return;
      tasks = tasks.filter(t => t.id !== id);
      saveTasks(tasks);
      addActivityEntry('Task deleted', task.name, 'Task was deleted.');
      renderTasks();
    }

    if (action === 'toggle-complete') {
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      task.status = task.status === 'completed' ? 'pending' : 'completed';
      saveTasks(tasks);
      addActivityEntry(
        task.status === 'completed' ? 'Task completed' : 'Task marked pending',
        task.name,
        `Task status changed to ${task.status}.`
      );
      renderTasks();
    }
  });

  filterStatus.addEventListener('change', renderTasks);
  filterPriority.addEventListener('change', renderTasks);
  sortBy.addEventListener('change', renderTasks);

  clearAllBtn.addEventListener('click', () => {
    if (tasks.length === 0) return;
    if (!confirm('Are you sure you want to clear all tasks?')) return;
    tasks = [];
    saveTasks(tasks);
    addActivityEntry('All tasks cleared', 'All tasks', 'All tasks were removed.');
    renderTasks();
  });

  renderTasks();
});
