function notFound(req, res) {
  res.status(404).json({
    success: false,
    error: { message: `Route ${req.method} ${req.originalUrl} was not found.` },
    requestId: req.requestId
  });
}

function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
  let status = error.statusCode || error.status || 500;
  let message = error.message || "Something went wrong on the server.";
  let details = error.details;

  if (error.name === "ValidationError") {
    status = 400;
    details = Object.values(error.errors).map((entry) => entry.message);
    message = "Please correct the submitted data.";
  }
  if (error.name === "CastError") {
    status = 400;
    message = "The supplied resource id is invalid.";
  }
  if (error.code === 11000) {
    status = 409;
    message = "A record with this unique value already exists.";
  }

  if (status >= 500) console.error(error);
  res.status(status).json({ success: false, error: { message, details }, requestId: req.requestId });
}

module.exports = { notFound, errorHandler };
