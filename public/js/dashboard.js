const userID = userId;
const apikey = apiKey;
const logoutBtn = document.getElementById("logout");

if (apikey) {
  document.getElementById("apiKey").textContent = apikey || "Not Found";
} else {
  document.getElementById("apiKey").textContent =
    "******************************** (Hidden for security)";
}

async function renderUserInfo() {
  // Fetch user email from server
  data = await fetch("/db/users/" + userID);
  data = await data.json();
  // Fetch max requsests from env variable
  const maxRequests = await fetch("/db/maxrequests");
  const maxData = await maxRequests.json();
  document.getElementById("email").textContent = data.user.email;
  document.getElementById("plan").textContent = data.user.plan;
  document.getElementById("requestsToday").textContent =
    `${data.apiKey.requestsToday} / ${maxData.free}`;
  document.getElementById("progress").value = data.apiKey.requestsToday;
  document.getElementById("progress").max = maxData.free;
}

renderUserInfo();

logoutBtn.addEventListener("click", () => {
  fetch("/db/logout", {
    method: "POST",
  }).then(() => {
    window.location.href = "/";
  });
});
