import sqlite3 from "sqlite3";
import { open } from "sqlite";
import md5 from "../md5hash.js";
import crypto, { randomBytes } from "crypto";

export async function openDB() {
  // This opens a connection and creates 'library.db' if it doesn't exist
  const db = await open({
    filename: "./db/uwt.db",
    driver: sqlite3.Database,
  });

  // We write our SQL inside db.exec()
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        hashedPass TEXT,
        plan TEXT,
        stripeCustomerId TEXT,
        createdAt TEXT
    );
    CREATE TABLE IF NOT EXISTS apiKeys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        hashedKey TEXT,
        requestsToday INTEGER,
        date TEXT,
        active INTEGER DEFAULT 1,
        FOREIGN KEY (userId) REFERENCES users(id)
      );
  `);

  console.log("Table created!");
  return db;
}

export async function createUser(db, email, password) {
  const createdAt = new Date().toISOString().split("T")[0];
  await db.run(
    "INSERT INTO users (email, hashedPass, plan, stripeCustomerId, createdAt) VALUES (?, ?, ?, ?, ?)",
    [email, md5(password), "free", null, createdAt],
  );
  // RETRIEVE USER ID
  const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);

  // Generate API key
  const { apikey, hashedApiKey } = await generateApiKey(db);

  await db.run(
    "INSERT INTO apiKeys (userId, hashedKey, requestsToday, date) VALUES (?, ?, ?, ?)",
    [user.id, hashedApiKey, 0, createdAt],
  );

  return { userId: user.id, apiKey: apikey };
}

// API KEY GENERATION
async function generateApiKey(db) {
  const apikey = randomBytes(16).toString("hex");
  const hashedApiKey = md5(apikey);

  // Ensure API key is unique
  const presentApiKey = await db.get(
    "SELECT * FROM apiKeys WHERE hashedKey = ?",
    [hashedApiKey],
  );

  if (presentApiKey) {
    // theres already an api key like that in the db
    return await generateApiKey(db);
  } else {
    return { apikey, hashedApiKey };
  }
}
