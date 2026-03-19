let currentUser = null;
let socket = null;

async function checkAuthAndInit(callback) {
  try {
    let res = await fetch("/verify-auth", { credentials: "include" });
    if (!res.ok) {
      window.location.href = "./login.html";
      return;
    }
    let data = await res.json();
    currentUser = data.user;
    if (typeof callback === "function") callback();
  } catch (err) {
    window.location.href = "./login.html";
  }
}

function initSocket() {
  if (!socket) {
    socket = io();
  }
}
let form = document.getElementById("signupForm");

let submitBtn = document.getElementById("submitBtn");
let username = document.getElementById("username");
let email = document.getElementById("email");
let password = document.getElementById("password");
let conditions = document.getElementById("conditions");
let togglePass = document.getElementById("togglePass");
let toggleConfirmPass = document.getElementById("toggleConfirmPass");
let emailError = document.getElementById("emailError");
let confirmPassword = document.getElementById("confirmPassword");
let confirmPassError = document.getElementById("confirmPassError");
let spinner = document.getElementById("spinner");
const overlay = document.getElementById("loadingOverlay");


confirmPassword.addEventListener("input", function () {
  if (password.value === confirmPassword.value) {
    confirmPassword.classList.remove("is-invalid");
    confirmPassError.textContent = "";
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  let formData = new FormData(form);
  if (formData.get("password") !== formData.get("confirmPassword")) {
    confirmPassword.classList.add("is-invalid");
    confirmPassError.textContent = "Passwords do not match.";
    return;
  } else {
    confirmPassword.classList.remove("is-invalid");
    confirmPassError.textContent = "";
  }
  let userRegex = /^[a-zA-Z0-9_]{3,30}$/;
  if (!userRegex.test(formData.get("username"))) {
    username.classList.add("is-invalid");
    return;
  }
  let emailRegex = /^[a-zA-Z0-9._%+-]{3,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(formData.get("email"))) {
    email.classList.add("is-invalid");
    emailError.style.display = "block";
    emailError.textContent = "Invalid Email";
    return;
  }

  let val = password.value;
  let valid =
    val.length >= 8 &&
    /[A-Z]/.test(val) &&
    /[a-z]/.test(val) &&
    /\d/.test(val) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(val);
  if (!valid) {
    conditions.classList.remove("d-none");
    conditions.classList.add("show");
    return;
  } else {
    conditions.classList.remove("show");
    setTimeout(() => conditions.classList.add("d-none"), 300);
  }

  submitBtn.disabled = true;
  overlay.classList.remove("d-none");
  spinner.classList.remove("d-none");

  try {
    let data = {
      name: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
    };
    let res = await fetch("http://localhost:8000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      window.location.href = "./login.html";
      return;
    }
    let error = await res.json();
    if (error.message && error.message.includes("email")) {
      email.classList.add("is-invalid");
      emailError.style.display = "block";
      emailError.textContent = "";
      emailError.textContent = error.message;
    }
  } catch (err) {
    emailError.style.display = "block";
    emailError.textContent = "an error occured";
  } finally {
    submitBtn.disabled = false;
    spinner.style.display = "none";
    overlay.classList.add("d-none");
  }
});

function setupPasswordToggle(input, toggle) {
  toggle.addEventListener("click", () => {
    let type = input.type === "password" ? "text" : "password";
    input.type = type;
    toggle.classList.toggle("bi-eye");
    toggle.classList.toggle("bi-eye-slash");
  });
}

setupPasswordToggle(password, togglePass);
setupPasswordToggle(confirmPassword, toggleConfirmPass);

password.addEventListener("input", () => {
  confirmPassError.textContent = "";
  validatePassword();
});

document.addEventListener("mousedown", function (e) {
  const inputGroup = document.getElementById("inputGroup");
  if (!inputGroup.contains(e.target)) {
    conditions.classList.add("d-none");
  }
});

username.addEventListener("focus", () => {
  username.classList.remove("is-invalid");
});
email.addEventListener("focus", () => {
  email.classList.remove("is-invalid");
  emailError.textContent = "";
  spinner.classList.add("d-none");
});
email.addEventListener("input", () => {
  email.classList.remove("is-invalid");
  emailError.textContent = "";
  spinner.classList.add("d-none");
});
confirmPassword.addEventListener("click", () => {});
function validatePassword() {
  let conditions = document.querySelectorAll("#conditions p");
  let val = password.value;
  if (val.length >= 8) {
    conditions[0].classList.remove("text-danger", "text-secondary");
    conditions[0].classList.add("text-success");
  } else {
    conditions[0].classList.remove("text-success", "text-secondary");
    conditions[0].classList.add("text-danger");
  }
  if (/[A-Z]/.test(val)) {
    conditions[1].classList.remove("text-danger", "text-secondary");
    conditions[1].classList.add("text-success");
  } else {
    conditions[1].classList.remove("text-success", "text-secondary");
    conditions[1].classList.add("text-danger");
  }
  if (/[a-z]/.test(val)) {
    conditions[2].classList.remove("text-danger", "text-secondary");
    conditions[2].classList.add("text-success");
  } else {
    conditions[2].classList.remove("text-success", "text-secondary");
    conditions[2].classList.add("text-danger");
  }
  if (/\d/.test(val)) {
    conditions[3].classList.remove("text-danger", "text-secondary");
    conditions[3].classList.add("text-success");
  } else {
    conditions[3].classList.remove("text-success", "text-secondary");
    conditions[3].classList.add("text-danger");
  }
  if (/[!@#$%^&*(),.?":{}|<>]/.test(val)) {
    conditions[4].classList.remove("text-danger", "text-secondary");
    conditions[4].classList.add("text-success");
  } else {
    conditions[4].classList.remove("text-success", "text-secondary");
    conditions[4].classList.add("text-danger");
  }
}
