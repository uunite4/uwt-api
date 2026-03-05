const apiKeyValidator = (req, res, next) => {
  const apiKey = req.header("x-api-key");

  if (!apiKey) {
    const err = new Error("API key is missing");
    err.status = 401;
    return next(err);
  }

  // TODO: VALIDATE KEY

  next();
};

export default apiKeyValidator;
