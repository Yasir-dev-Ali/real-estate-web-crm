export function notFound(_req, res, _next) {
  res.status(404).json({ message: "Route not found" });
}

export function errorHandler(err, _req, res, _next) {
  const status =
    err.status ||
    (err.name === "ValidationError" || err.name === "CastError" ? 400 : err.code === 11000 ? 409 : 500);
  const message =
    status === 500 && process.env.NODE_ENV === "production"
      ? "Internal server error"
      : status === 400 && (err.name === "CastError" || err.name === "ValidationError")
        ? "One or more values are invalid."
        : status === 409 && err.code === 11000
          ? "A record with these details already exists."
          : err.message || "Internal server error";
  if (status >= 500 && process.env.NODE_ENV !== "test") {
    console.error(err);
  }
  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
