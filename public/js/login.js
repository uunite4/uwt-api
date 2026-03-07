const connectBtn = document.getElementById("connect");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorP = document.getElementById("error-msg");

connectBtn.addEventListener("click", async () => {
  // EMAIL CHECK
  const email = emailInput.value.trim();
  if (!email) {
    errorP.textContent = "Please enter a valid email address.";
    return;
  }

  // PASSWORD CHECK
  const password = passwordInput.value.trim();
  if (!password) {
    errorP.textContent = "Please enter a password.";
    return;
  }

  try {
    const response = await fetch("/db/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      if (response.status === 404) {
        errorP.textContent = "User not found. Redirecting to signup...";
        setTimeout(() => {
          window.location.href = data.redirect || "/signup";
        }, 2000);
        return;
      }
      if (response.status === 401) {
        errorP.textContent = data.error || "Invalid Credentials";
        return;
      }
      errorP.textContent = data.error || "Something went wrong";
      return;
    }

    // Store user ID in session storage
    sessionStorage.setItem("userId", data.userId);
    // redirect to dashboard
    window.location.href = "/dashboard";
  } catch (err) {
    errorP.textContent = "Network error";
  }
});
