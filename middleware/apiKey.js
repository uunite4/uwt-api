import md5 from "../md5hash.js";

const apiKeyValidator = async (req, res, next) => {
  const apiKey = req.header("x-api-key");

  // CHECK if API key is present
  if (!apiKey) {
    const err = new Error("API key is missing");
    err.status = 401;
    return next(err);
  }

  // HASH it and compare with DB
  const hashedKey = md5(apiKey);

  const db = req.app.locals.db;
  try {
    const row = await db.get(
      "SELECT * FROM apiKeys WHERE hashedKey = ? AND active = 1",
      [hashedKey],
    );

    if (!row) {
      const error = new Error("Invalid API key");
      error.status = 401;
      return next(error);
    }

    // API key is valid
    req.apiKeyId = row.id;
    // MOVE ON TO NEXT MIDDLEWARE / ENDPOINT
    next();
  } catch (err) {
    const error = new Error("Database error");
    error.status = 500;
    return next(error);
  }
};

export default apiKeyValidator;
