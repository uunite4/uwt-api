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
router.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

export default router;
