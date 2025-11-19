const API_URL = "http://localhost:5000/api/users";
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const message = document.getElementById("message");
const submitBtn = document.getElementById("submit-btn");
const toggleForm = document.getElementById("toggle-form");
const formTitle = document.getElementById("form-title");

let isLogin = true; // start in login mode

toggleForm.addEventListener("click", () => {
  isLogin = !isLogin;
  if (isLogin) {
    formTitle.textContent = "Login";
    nameInput.classList.add("hide");
    submitBtn.textContent = "Login";
    toggleForm.innerHTML = `Don’t have an account? <span>Register</span>`;
  } else {
    formTitle.textContent = "Register";
    nameInput.classList.remove("hide");
    submitBtn.textContent = "Register";
    toggleForm.innerHTML = `Already have an account? <span>Login</span>`;
  }
});

submitBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  const name = nameInput.value;

  const endpoint = isLogin ? "login" : "register";
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
      window.location.href = "dashboard.html"; // Go to dashboard
    } else {
      message.textContent = data.message || "Something went wrong!";
    }
  } catch (err) {
    message.textContent = "Error connecting to server";
  }
});
