const API_URL  = "http://localhost:5000/api/tasks";
const token    = localStorage.getItem("token");
const userName = localStorage.getItem("userName");

if (!token) window.location.href = "index.html";

// Set user info
document.getElementById("user-name").textContent = userName || "User";
const avatarEl = document.getElementById("user-avatar");
if (userName) avatarEl.textContent = userName.charAt(0).toUpperCase();

const taskList   = document.getElementById("task-list");
const addTaskBtn = document.getElementById("add-task");
const titleInput = document.getElementById("task-title");
const descInput  = document.getElementById("task-desc");

let allTasks   = [];
let activeFilter = "all";

// Filter tabs
document.querySelectorAll(".filter-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    activeFilter = tab.dataset.filter;
    renderTasks();
  });
});

function updateStats(tasks) {
  const total   = tasks.length;
  const done    = tasks.filter(t => t.status === "completed").length;
  const pending = total - done;
  document.getElementById("stat-total").textContent   = total;
  document.getElementById("stat-done").textContent    = done;
  document.getElementById("stat-pending").textContent = pending;
}

function renderTasks() {
  const filtered = allTasks.filter(t => {
    if (activeFilter === "all")       return true;
    if (activeFilter === "pending")   return t.status !== "completed";
    if (activeFilter === "completed") return t.status === "completed";
    return true;
  });

  taskList.innerHTML = "";

  if (filtered.length === 0) {
    taskList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <p>${activeFilter === "all" ? "No tasks yet. Add one above!" : `No ${activeFilter} tasks.`}</p>
      </div>`;
    return;
  }

  filtered.forEach((t, i) => {
    const li = document.createElement("li");
    li.className = `task-item${t.status === "completed" ? " completed" : ""}`;
    li.style.animationDelay = `${i * 40}ms`;

    const isDone = t.status === "completed";

    li.innerHTML = `
      <div class="task-check${isDone ? " done" : ""}" onclick="markDone('${t._id}', ${isDone})" title="${isDone ? "Mark pending" : "Mark done"}"></div>
      <div class="task-body">
        <div class="task-title-text">${escapeHtml(t.title)}</div>
        ${t.description ? `<div class="task-desc-text">${escapeHtml(t.description)}</div>` : ""}
      </div>
      <span class="task-badge ${isDone ? "badge-completed" : "badge-pending"}">${isDone ? "Done" : "Pending"}</span>
      <button class="btn-delete" onclick="deleteTask('${t._id}')" title="Delete task">
        <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
        </svg>
      </button>
    `;
    taskList.appendChild(li);
  });
}

function escapeHtml(str) {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

async function loadTasks() {
  try {
    const res   = await fetch(API_URL, { headers: { Authorization: `Bearer ${token}` } });
    allTasks    = await res.json();
    updateStats(allTasks);
    renderTasks();
  } catch (e) {
    taskList.innerHTML = `<div class="empty-state"><p>Failed to load tasks.</p></div>`;
  }
}

loadTasks();

// Add task
addTaskBtn.addEventListener("click", async () => {
  const title       = titleInput.value.trim();
  const description = descInput.value.trim();
  if (!title) { titleInput.focus(); return; }

  addTaskBtn.textContent = "Adding…";
  addTaskBtn.style.opacity = "0.7";

  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title, description }),
  });

  titleInput.value = "";
  descInput.value  = "";
  addTaskBtn.textContent = "+ Add";
  addTaskBtn.style.opacity = "1";
  loadTasks();
});

titleInput.addEventListener("keydown", e => { if (e.key === "Enter") addTaskBtn.click(); });

// Toggle done / pending
async function markDone(id, currentlyDone) {
  const newStatus = currentlyDone ? "pending" : "completed";
  await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status: newStatus }),
  });
  loadTasks();
}

// Delete task
async function deleteTask(id) {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  loadTasks();
}

// Logout
document.getElementById("logout").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "index.html";
});
