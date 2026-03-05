// js/main.js

// --- Dark mode toggle ---
(function () {
  const html = document.documentElement;
  const toggleBtn = document.getElementById('darkModeToggle');

  const savedTheme = localStorage.getItem('taskflow-theme');
  if (savedTheme === 'dark') {
    html.setAttribute('data-theme', 'dark');
  }

  if (toggleBtn) {
    const current = html.getAttribute('data-theme') || 'light';
    toggleBtn.textContent = current === 'dark' ? '☀️' : '🌙';

    toggleBtn.addEventListener('click', () => {
      const now = html.getAttribute('data-theme') || 'light';
      const next = now === 'light' ? 'dark' : 'light';
      html.setAttribute('data-theme', next);
      localStorage.setItem('taskflow-theme', next);
      toggleBtn.textContent = next === 'dark' ? '☀️' : '🌙';
    });
  }
})();

// --- Footer year ---
(function () {
  const yearSpan = document.getElementById('footerYear');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
})();

// --- Task helpers (shared) ---
function getStoredTasks() {
  try {
    const data = localStorage.getItem('taskflow-tasks');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to parse tasks from localStorage', e);
    return [];
  }
}

function getStoredActivity() {
  try {
    const data = localStorage.getItem('taskflow-activity');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to parse activity from localStorage', e);
    return [];
  }
}

// --- Home wiring: counts + latest activity ---
(function () {
  const totalEl = document.getElementById('homeTotalTasks');
  const completedEl = document.getElementById('homeCompletedTasks');
  const pendingEl = document.getElementById('homePendingTasks');
  const latestActivityList = document.getElementById('latestActivityList');
  const noActivityMessage = document.getElementById('noActivityMessage');

  if (!totalEl && !latestActivityList) return; // not on home page

  const tasks = getStoredTasks();
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const pending = total - completed;

  if (totalEl) totalEl.textContent = total;
  if (completedEl) completedEl.textContent = completed;
  if (pendingEl) pendingEl.textContent = pending;

  if (latestActivityList && noActivityMessage) {
    const activity = getStoredActivity().slice(-5).reverse();
    latestActivityList.innerHTML = '';

    if (activity.length === 0) {
      noActivityMessage.classList.remove('d-none');
      return;
    }

    noActivityMessage.classList.add('d-none');

    activity.forEach(item => {
      const el = document.createElement('div');
      el.className = 'list-group-item list-group-item-action';
      el.innerHTML = `
        <div class="d-flex w-100 justify-content-between">
          <h3 class="h6 mb-1">${item.title}</h3>
          <small class="text-muted">${new Date(item.timestamp).toLocaleString()}</small>
        </div>
        <p class="mb-1">${item.description || ''}</p>
        <small class="text-muted">${item.type}</small>
      `;
      latestActivityList.appendChild(el);
    });
  }
})();

// --- Motivational quotes ---
(function () {
  const quoteText = document.getElementById('quoteText');
  const quoteAuthor = document.getElementById('quoteAuthor');
  if (!quoteText) return;

  fetch('https://type.fit/api/quotes')
    .then(res => res.json())
    .then(quotes => {
      if (!Array.isArray(quotes) || !quotes.length) {
        quoteText.textContent = 'Stay focused and keep shipping.';
        quoteAuthor.textContent = 'TaskForge';
        return;
      }
      const random = quotes[Math.floor(Math.random() * quotes.length)];
      quoteText.textContent = random.text || 'Stay focused and keep shipping.';
      quoteAuthor.textContent = random.author || 'Unknown';
    })
    .catch(() => {
      quoteText.textContent = 'Productivity is never an accident.';
      quoteAuthor.textContent = 'TaskForge';
    });
})();

// --- Home analytics overview numbers ---
(function () {
  const totalEl = document.getElementById('overviewTotalTasks');
  const completedEl = document.getElementById('overviewCompletedTasks');
  const pendingEl = document.getElementById('overviewPendingTasks');

  if (!totalEl && !completedEl && !pendingEl) return; // not on home page

  const tasks = getStoredTasks();
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const pending = total - completed;

  if (totalEl) totalEl.textContent = total;
  if (completedEl) completedEl.textContent = completed;
  if (pendingEl) pendingEl.textContent = pending;
})();
