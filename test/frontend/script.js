const API_URL = "http://localhost:5000/api";

const nameInput    = document.getElementById("name");
const emailInput   = document.getElementById("email");
const passwordInput = document.getElementById("password");
const message      = document.getElementById("message");
const submitBtn    = document.getElementById("submit-btn");
const toggleForm   = document.getElementById("toggle-form");
const formTitle    = document.getElementById("form-title");
const formSubtitle = document.getElementById("form-subtitle");
const nameField    = document.getElementById("name-field");

let isLogin = true;

toggleForm.addEventListener("click", () => {
  isLogin = !isLogin;
  message.textContent = "";

  if (isLogin) {
    formTitle.textContent    = "Welcome back";
    formSubtitle.textContent = "Sign in to your workspace";
    nameField.classList.add("hide");
    submitBtn.textContent = "Sign in";
    toggleForm.innerHTML  = `Don't have an account? <span>Create one</span>`;
  } else {
    formTitle.textContent    = "Create account";
    formSubtitle.textContent = "Join TaskFlow and get things done";
    nameField.classList.remove("hide");
    submitBtn.textContent = "Register";
    toggleForm.innerHTML  = `Already have an account? <span>Sign in</span>`;
  }
  message.textContent = "";
});

submitBtn.addEventListener("click", async () => {
  const email    = emailInput.value.trim();
  const password = passwordInput.value;
  const name     = nameInput.value.trim();

  if (!email || !password) {
    message.textContent = "Please fill in all required fields.";
    return;
  }

  const endpoint = isLogin ? "users/login" : "users/register";
  const body     = isLogin ? { email, password } : { name, email, password };

  submitBtn.textContent = isLogin ? "Signing in…" : "Registering…";
  submitBtn.style.opacity = "0.7";

  try {
    const res  = await fetch(`${API_URL}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.name);
      window.location.href = "dashboard.html";
      window.location.href = "dashboard.html";
    } else {
      message.textContent = data.message || "Something went wrong!";
    }
  } catch (err) {
    message.textContent = "Error connecting to server";
    submitBtn.textContent = isLogin ? "Sign in" : "Register";
    submitBtn.style.opacity = "1";
  }
});

