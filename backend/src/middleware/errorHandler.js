export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error(err);

  if (err?.code === 11000) {
    return res.status(409).json({ error: "A record with that value already exists." });
  }
  if (err?.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }

  const status = err.status ?? 500;
  res.status(status).json({ error: err.message ?? "Internal server error." });
}
