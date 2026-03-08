import express from "express";
import { rateLimit } from "express-rate-limit";
import "dotenv/config";

import apiRouter from "./routes/api.js";
import pagesRouter from "./routes/pages.js";
import dbRouter from "./routes/db.js";

import errorHandler from "./middleware/error.js";
import apiKeyValidator from "./middleware/apiKey.js";
import usageCount from "./middleware/usageCount.js";
import session from "express-session";

import { openDB } from "./db/dbHandler.js";

const app = express();

const db = await openDB();
app.locals.db = db;

// CONFIG EJS
app.set("view engine", "ejs");
app.set("views", "views");
// public folder (for js, css and imgs)
app.use(express.static("public"));

//CONFIG RATE LIMITER
const limiter = rateLimit({
  windowMs: 15 * 60000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// MIDDLEWARE
app.use(express.json({ limit: "10kb" })); // json + limiter
app.use("/api/", apiKeyValidator); // apikey validation for /api/*
app.use("/api/", usageCount); // apikey usage limit for /api/*
app.use(limiter);
app.use(
  // sessions
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      maxAge: 600000 * 60, // 1 hour
    },
  }),
);

//DB
app.use("/db/", dbRouter);

// PAGES (home page, login, signup, dashboard)
app.use("/", pagesRouter);

// API ENDPOINTS
app.use("/api/", apiRouter);

// ERROR HANDLER
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`UWB API listening at http://localhost:${process.env.PORT}`);
});
