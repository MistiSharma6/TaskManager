const API_URL = "https://taskmanager-8-mdf1.onrender.com/api/tasks";
const token = localStorage.getItem("token");
const userName = localStorage.getItem("userName");

if (!token) {
  window.location.href = "index.html"; // no token = no access
}

document.getElementById("user-name").textContent = userName;

const taskList = document.getElementById("task-list");
const addTaskBtn = document.getElementById("add-task");
const titleInput = document.getElementById("task-title");
const descInput = document.getElementById("task-desc");

// Load all tasks
async function loadTasks() {
  const res = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const tasks = await res.json();

  taskList.innerHTML = "";
  tasks.forEach((t) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <b>${t.title}</b> - ${t.description} (${t.status})
      <button onclick="markDone('${t._id}')">✅</button>
      <button onclick="deleteTask('${t._id}')">🗑️</button>
    `;
    taskList.appendChild(li);
  });
}

loadTasks();

// Add task
addTaskBtn.addEventListener("click", async () => {
  const title = titleInput.value;
  const description = descInput.value;

  await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, description }),
  });

  titleInput.value = "";
  descInput.value = "";
  loadTasks();
});

// Mark task as done
async function markDone(id) {
  await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status: "completed" }),
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
