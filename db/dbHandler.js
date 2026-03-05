import sqlite3 from "sqlite3";
import { open } from "sqlite";
import md5 from "../md5hash.js";

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
        usageCount INTEGER DEFAULT 0,
        usageResetDate TEXT,
        active INTEGER DEFAULT 1,
        FOREIGN KEY (userId) REFERENCES users(id)
      );
  `);

  console.log("Table created!");
  return db;
}

export async function createUser(db, email, password) {
  const createdAt = new Date().toISOString();
  await db.run(
    "INSERT INTO users (email, hashedPass, plan, stripeCustomerId, createdAt) VALUES (?, ?, ?, ?, ?)",
    [email, md5(password), "free", null, createdAt],
  );
  // RETRIEVE USER ID
  const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
  // CALCULATE RESET DATE (1 MONTH FROM CREATION)
  const usageResetDate = new Date(createdAt);
  usageResetDate.setMonth(usageResetDate.getMonth() + 1);

  // Generate API key (unhashed)
  const unhashedApiKey = createRandomString(32);
  const hashedApiKey = md5(unhashedApiKey);

  await db.run(
    "INSERT INTO apiKeys (userId, hashedKey, usageResetDate) VALUES (?, ?, ?)",
    [user.id, hashedApiKey, usageResetDate.toISOString()],
  );

  return { userId: user.id, apiKey: unhashedApiKey };
}

// API KEY GENERATION
function createRandomString(length) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
