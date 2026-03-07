const userID = userId;
const apikey = apiKey;
const logoutBtn = document.getElementById("logout");

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

logoutBtn.addEventListener("click", () => {
  fetch("/db/logout", {
    method: "POST",
  }).then(() => {
    window.location.href = "/";
  });
});
