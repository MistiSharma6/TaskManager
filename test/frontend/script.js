const API_URL = "https://taskmanager-8-mdf1.onrender.com/api";

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const message = document.getElementById("message");
const submitBtn = document.getElementById("submit-btn");
const btnLabel = document.getElementById("btn-label");
const toggleForm = document.getElementById("toggle-form");
const formTitle = document.getElementById("form-title");
const formSubtitle = document.getElementById("form-subtitle");
const nameField = document.getElementById("name-field");

let isLogin = true;

toggleForm.addEventListener("click", () => {
  isLogin = !isLogin;
  message.textContent = "";

  if (isLogin) {
    formTitle.textContent = "Welcome back";
    formSubtitle.textContent = "Sign in to continue to your workspace";
    nameField.classList.add("hidden");
    btnLabel.textContent = "Sign In";
    toggleForm.innerHTML = `Don't have an account? <span>Create one</span>`;
  } else {
    formTitle.textContent = "Create account";
    formSubtitle.textContent = "Start managing your tasks today";
    nameField.classList.remove("hidden");
    btnLabel.textContent = "Create Account";
    toggleForm.innerHTML = `Already have an account? <span>Sign in</span>`;
  }
});

submitBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const name = nameInput ? nameInput.value.trim() : "";

  if (!email || !password) {
    showMessage("Please fill in all fields", "error");
    return;
  }

  submitBtn.disabled = true;
  btnLabel.textContent = isLogin ? "Signing in…" : "Creating account…";

  const endpoint = isLogin ? "users/login" : "users/register";
  const body = isLogin ? { email, password } : { name, email, password };

  try {
    const res = await fetch(`${API_URL}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.name);
      window.location.href = "dashboard.html";
    } else {
      showMessage(data.message || "Something went wrong", "error");
    }
  } catch (err) {
    showMessage("Unable to connect to server", "error");
  } finally {
    submitBtn.disabled = false;
    btnLabel.textContent = isLogin ? "Sign In" : "Create Account";
  }
});

function showMessage(text, type = "error") {
  message.textContent = text;
  message.className = "auth-message" + (type === "success" ? " success" : "");
}

// Enter key support
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") submitBtn.click();
});
