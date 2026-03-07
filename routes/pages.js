import express from "express";
const router = express.Router();

// HOME PAGE
router.get("/", (req, res) => {
  res.render("homepage");
});

// SIGNUP
router.get("/signup", (req, res) => {
  res.render("signup");
});

// LOGIN
router.get("/login", (req, res) => {
  res.render("login");
});

// DASHBOARD
router.get("/dashboard", validateSession, (req, res) => {
  res.render("dashboard", {
    userId: req.session.userId,
    apiKey: req.session.apiKey,
  });
});

// ERROR PAGE
router.get("/error", (req, res) => {
  const msg = req.query.msg || "An error occurred";
  res.render("error", { message: msg });
});

// SESSION VALIDATOR
function validateSession(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.redirect("/error?msg=Unauthorized");
  }
  next();
}

export default router;
