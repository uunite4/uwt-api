const errorHandler = (err, req, res, next) => {
  let errorRes;
  if (isValidjson(err.message)) {
    errorRes = JSON.parse(err.message);
  } else {
    errorRes = { error: err.message };
  }

  if (err.status) {
    return res.status(err.status).send(errorRes);
  }

  res.status(500).send(errorRes);
};

export default errorHandler;

function isValidjson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
