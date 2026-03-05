const userID = sessionStorage.getItem("userId");
const source = sessionStorage.getItem("source");

if (source == "signup") {
  // Get API key from session storage
  const apiKey = sessionStorage.getItem("apiKey");
  document.getElementById("apiKey").textContent = apiKey || "Not Found";
} else if (source == "login") {
  document.getElementById("apiKey").textContent =
    "******************************** (Hidden for security)";
}

// Fetch user email from server
fetch("/db/users/" + userID)
  .then((r) => r.json())
  .then((data) => {
    document.getElementById("email").textContent = data.email;
    document.getElementById("plan").textContent = data.plan;
  });
