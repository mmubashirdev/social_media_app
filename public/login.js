let currentUser = null;
let socket = null;



function initSocket() {
  if (!socket) {
    socket = io();
  }
}
let form = document.getElementById("loginForm");
let email = document.getElementById("email");
let emailError = document.getElementById("emailError");
let password = document.getElementById("password");
let passwordError = document.getElementById("passwordError");
let popupEmail = document.getElementById("popupEmail");
let togglePass = document.getElementById("togglePass");
let popupEmailError = document.getElementById("popupEmailError");
const overlay = document.getElementById("loadingOverlay");
let submitBtn = document.getElementById("submitBtn");

let errorElement = document.getElementById("forgetPass");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  let formData = new FormData(form);
  let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    email.classList.add("is-invalid");
    emailError.style.display = "block";
    emailError.textContent = "Invalid Email";
    return;
  }
  if (password.value.trim() === "" || password.value.length <= 7) {
    password.classList.add("is-invalid");
    passwordError.style.display = "block";
    togglePass.classList.add("d-none");

    passwordError.textContent = "Invalid Password";
    return;
  }
  let data = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  submitBtn.disabled = true;
  overlay.classList.remove("d-none");
  spinner.classList.remove("d-none");

  try {
    let res = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });
    let result = await res.json();
    if (res.ok) {
      setTimeout(() => {
        window.location.href = "./dashboard-feed.html";
      }, 200);
    }else {
      errorElement.textContent = result.message;
      errorElement.style.color = "red";
    }
  } catch (error) {
    errorElement.textContent = "An error occured";
  } finally {
    submitBtn.disabled = false;
    spinner.style.display = "none";
    overlay.classList.add("d-none");
  }
});

function setTogglePass(input, toggle) {
  toggle.addEventListener("click", () => {
    let type = input.type === "password" ? "text" : "password";
    input.type = type;
    toggle.classList.toggle("bi bi-eye");
    toggle.classList.toggle("bi bi-eye-slash");
  });
}

if (togglePass && password) {
  togglePass.addEventListener("click", () => {
    if (password.type === "password") {
      password.type = "text";
      togglePass.classList.remove("bi-eye-slash");
      togglePass.classList.add("bi-eye");
    } else {
      password.type = "password";
      togglePass.classList.remove("bi-eye");
      togglePass.classList.add("bi-eye-slash");
    }
  });
}

function showForgetPasswordPopup() {
  document.getElementById("popupOverlay").classList.remove("d-none");
  document.getElementById("loginForm").classList.add("d-none");
  document.getElementById("forgetPasswordForm").classList.remove("d-none");
}

function closeForgetPasswordPopup() {
  document.getElementById("popupOverlay").classList.add("d-none");
  document.getElementById("forgetPasswordForm").classList.add("d-none");
  document.getElementById("loginForm").classList.remove("d-none");
}

function submitForgetPasswordPopup() {
  let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(popupEmail.value)) {
    popupEmail.classList.add("is-invalid");
    popupEmailError.style.display = "block";
    popupEmailError.textContent = "Please enter a valid email.";
    return;
  }
  closeForgetPasswordPopup();
  forgetPassword(popupEmail.value);
}

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
function forgetPassword(email) {
  fetch("http://localhost:8000/forget-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.message && data.message.includes("mail doesn't exist")) {
        document.getElementById("forgetPass").style.color = "red";
      } else {
        document.getElementById("forgetPass").style.color = "green";
      }
      document.getElementById("forgetPass").textContent = data.message;
    });
}

document.getElementById("email").addEventListener("input", () => {
  errorElement.textContent = "";
});

popupEmail.addEventListener("click", () => {
  popupEmailError.textContent = "";
  popupEmail.classList.remove("is-invalid");
});

function emailErrorRemover() {
  emailError.textContent = "";
  email.classList.remove("is-invalid");
}

email.addEventListener("input", emailErrorRemover);
email.addEventListener("click", emailErrorRemover);

function passwordErrorRemover() {
  password.classList.remove("is-invalid");
  passwordError.style.display = "none";
  togglePass.classList.remove("d-none");
}

password.addEventListener("input", passwordErrorRemover);
password.addEventListener("focus", passwordErrorRemover);
