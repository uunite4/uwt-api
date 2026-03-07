const userID = sessionStorage.getItem("userId");
const apikey = sessionStorage.getItem("apiKey");

if (!userID) {
  // No user ID, Redirect to error page
  window.location.href = "/error?msg=Unauthorized%20Access";
}

if (apikey) {
  document.getElementById("apiKey").textContent = apikey || "Not Found";
} else {
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
