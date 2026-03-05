import express from "express";

import apiRouter from "./routes/api.js";
import pagesRouter from "./routes/pages.js";
import dbRouter from "./routes/db.js";

import errorHandler from "./middleware/error.js";
import apiKeyValidator from "./middleware/apiKey.js";
import session from "express-session";

import { openDB } from "./db/dbHandler.js";

const app = express();
const port = 3000;

const db = await openDB();
app.locals.db = db;

// CONFIG EJS
app.set("view engine", "ejs");
app.set("views", "views");
// public folder (for js, css and imgs)
app.use(express.static("public"));

// MIDDLEWARE
app.use(express.json({ limit: "10kb" })); // json + limiter
app.use("/api/", apiKeyValidator); // apikey validation for /api/*
// add rate limiter HERE
app.use(
  // sessions
  session({
    secret: "secret-session-key",
    resave: false,
    saveUninitialized: true,
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

app.listen(port, () => {
  console.log(`UWB API listening at http://localhost:${port}`);
});
