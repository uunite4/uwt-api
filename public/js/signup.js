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
    const response = await fetch("/db/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      if (response.status === 409) {
        errorP.textContent = "Email already exists. Redirecting to login...";
        setTimeout(() => {
          window.location.href = data.redirect || "/login";
        }, 2000);
        return;
      }
      errorP.textContent = data.error || "Something went wrong";
      return;
    }

    // redirect to dashboard
    window.location.href = "/dashboard";
  } catch (err) {
    errorP.textContent = "Network error";
  }
});
