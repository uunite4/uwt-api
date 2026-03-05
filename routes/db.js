import express from "express";
import { createUser } from "../db/dbHandler.js";
import md5 from "../md5hash.js";

const router = express.Router();

router.post("/users", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // EMAIL AND PASS CHECK
    if (!email) {
      const err = new Error("Email required");
      err.status = 400;
      return next(err);
    }

    if (!password) {
      const err = new Error("Password required");
      err.status = 400;
      return next(err);
    }

    // CHECK if user already exists
    const db = req.app.locals.db;
    const existingUser = await db.get("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (existingUser) {
      res.status(409).json({ redirect: "/login" });
      return;
    }

    // Call the DB function
    const { userId, apiKey } = await createUser(db, email, password);

    // Create session
    req.session.userId = userId;

    // Send back the unhashed key (only shown once!)
    res.status(201).json({ userId, email, apiKey });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // EMAIL AND PASS CHECK
    if (!email) {
      const err = new Error("Email required");
      err.status = 400;
      return next(err);
    }

    if (!password) {
      const err = new Error("Password required");
      err.status = 400;
      return next(err);
    }

    const db = req.app.locals.db;
    const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);

    if (!user) {
      // User not found → redirect to signup
      res.status(404).json({ redirect: "/signup" });
      return;
    }

    // CHECK password
    if (user.hashedPass !== md5(password)) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }

    // password is fine, create session
    req.session.userId = user.id;

    res.status(200).json({ userId: user.id, email: user.email });
  } catch (err) {
    next(err);
  }
});

router.get("/users/:id", async (req, res, next) => {
  if (!req.session.userId || req.session.userId != req.params.id) {
    const err = new Error("Unauthorized");
    err.status = 403;
    return next(err);
  }

  const db = req.app.locals.db;
  const user = await db.get("SELECT email, plan FROM users WHERE id = ?", [
    req.params.id,
  ]);
  res.json(user);
});

// FOR DEBUGGING ONLY
router.get("/all", async (req, res, next) => {
  try {
    const db = req.app.locals.db;

    // Get all users
    const users = await db.all("SELECT * FROM users");

    // For each user, get their API key info
    const usersWithKeys = await Promise.all(
      users.map(async (user) => {
        const apiKeyInfo = await db.get(
          "SELECT * FROM apiKeys WHERE userId = ?",
          [user.id],
        );
        return {
          ...user,
          apiKey: apiKeyInfo,
        };
      }),
    );

    res.json(usersWithKeys);
  } catch (err) {
    next(err);
  }
});

export default router;
