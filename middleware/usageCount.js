const usageCount = async (req, res, next) => {
  //dates
  const today = new Date();
  const readableToday = today.toISOString().split("T")[0];
  let tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  tomorrow = tomorrow.toISOString().split("T")[0];

  const db = req.app.locals.db;
  try {
    const row = await db.get("SELECT * FROM apiKeys WHERE id = ?", [
      req.apiKeyId,
    ]);

    // free tie checks

    if (row.date == readableToday) {
      // STILL TODAY, NEEDS CHECKING
      if (row.requestsToday + 1 > process.env.FREE_PLAN_MAX_USAGE) {
        // TOO MANY REQUESTS
        const error = new Error(`{
          "error": "Daily request limit reached",
          "limit": ${process.env.FREE_PLAN_MAX_USAGE},
          "reset": "${tomorrow}T00:00:00Z"
        }`);
        error.status = 429;
        return next(error);
      } else {
        // STILL IN QUOTA, INCREASE USAGE
        await db.run("UPDATE apiKeys SET requestsToday = ? WHERE id = ?", [
          row.requestsToday + 1,
          req.apiKeyId,
        ]);
        return next();
      }
    } else {
      // A DAY HAS PASSED, RESET
      await db.run(
        "UPDATE apiKeys SET requestsToday = ?, date = ? WHERE id = ?",
        [1, tomorrow, req.apiKeyId],
      );
      return next();
    }
  } catch (err) {
    const error = new Error("Database error");
    error.status = 500;
    return next(error);
  }
};

export default usageCount;
