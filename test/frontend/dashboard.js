const API_URL = "https://taskmanager-8-mdf1.onrender.com/api/tasks";
const token = localStorage.getItem("token");
const userName = localStorage.getItem("userName");

if (!token) window.location.href = "index.html";

// DOM
const userNameEl = document.getElementById("user-name");
const taskList = document.getElementById("task-list");
const addTaskBtn = document.getElementById("add-task");
const titleInput = document.getElementById("task-title");
const descInput = document.getElementById("task-desc");
const emptyState = document.getElementById("empty-state");
const filterBtns = document.querySelectorAll(".filter-btn");
const statTotal = document.getElementById("stat-total");
const statDone = document.getElementById("stat-done");
const countAll = document.getElementById("count-all");
const countPending = document.getElementById("count-pending");
const countDone = document.getElementById("count-done");
const headerDate = document.getElementById("header-date");
const sectionLabel = document.getElementById("tasks-section-label");

// State
let allTasks = [];
let activeFilter = "all";

// Init
userNameEl.textContent = userName || "User";
headerDate.textContent = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

// Filter buttons
filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    sectionLabel.textContent = btn.textContent.trim().replace(/\d+/g, "").trim();
    renderTasks();
  });
});

// Load tasks
async function loadTasks() {
  try {
    const res = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    allTasks = await res.json();
    updateStats();
    renderTasks();
  } catch {
    showToast("Failed to load tasks");
  }
}

function updateStats() {
  const total = allTasks.length;
  const done = allTasks.filter(t => t.status === "completed").length;
  const pending = total - done;

  statTotal.textContent = total;
  statDone.textContent = done;
  countAll.textContent = total;
  countPending.textContent = pending;
  countDone.textContent = done;
}

function renderTasks() {
  const filtered = allTasks.filter(t => {
    if (activeFilter === "all") return true;
    if (activeFilter === "pending") return t.status !== "completed";
    if (activeFilter === "completed") return t.status === "completed";
    return true;
  });

  taskList.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.classList.add("visible");
    return;
  }

  emptyState.classList.remove("visible");

  filtered.forEach((t, i) => {
    const isDone = t.status === "completed";
    const li = document.createElement("li");
    li.className = "task-item" + (isDone ? " completed" : "");
    li.style.animationDelay = `${i * 0.04}s`;
    li.innerHTML = `
      <div class="task-check" onclick="markDone('${t._id}', ${isDone})">
        <svg viewBox="0 0 12 12" fill="none" stroke="white" stroke-width="2.5"><polyline points="2 6 5 9 10 3"/></svg>
      </div>
      <div class="task-body">
        <div class="task-title">${escHtml(t.title)}</div>
        ${t.description ? `<div class="task-desc">${escHtml(t.description)}</div>` : ""}
      </div>
      <span class="task-status-badge ${isDone ? 'badge-completed' : 'badge-pending'}">${isDone ? "Done" : "Pending"}</span>
      <div class="task-actions">
        ${!isDone ? `<button class="task-btn btn-done" onclick="markDone('${t._id}', false)" title="Mark done">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </button>` : ""}
        <button class="task-btn btn-delete" onclick="deleteTask('${t._id}')" title="Delete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

// Add task
addTaskBtn.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const description = descInput.value.trim();
  if (!title) { titleInput.focus(); return; }

  addTaskBtn.disabled = true;

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, description }),
    });
    titleInput.value = "";
    descInput.value = "";
    await loadTasks();
    showToast("Task added");
  } catch {
    showToast("Failed to add task");
  } finally {
    addTaskBtn.disabled = false;
  }
});

// Enter key in inputs
[titleInput, descInput].forEach(el => {
  el.addEventListener("keydown", e => { if (e.key === "Enter") addTaskBtn.click(); });
});

// Mark done / undo
async function markDone(id, isDone) {
  const newStatus = isDone ? "pending" : "completed";
  try {
    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus }),
    });
    await loadTasks();
    showToast(isDone ? "Task reopened" : "Task completed ✓");
  } catch {
    showToast("Failed to update task");
  }
}

// Delete task
async function deleteTask(id) {
  try {
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    await loadTasks();
    showToast("Task deleted");
  } catch {
    showToast("Failed to delete task");
  }
}

// Logout
document.getElementById("logout").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "index.html";
});

// Toast
let toastTimeout;
function showToast(text) {
  const toast = document.getElementById("toast");
  document.getElementById("toast-text").textContent = text;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2500);
}

// HTML escape
function escHtml(str) {
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// Expose to onclick
window.markDone = markDone;
window.deleteTask = deleteTask;

loadTasks();
