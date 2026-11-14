export const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Mongoose duplicate key error (e.g. email already used)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ message: `${field} already in use` });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(", ") });
  }

  // Multer errors (file too large, unexpected field, etc.)
  if (err.name === "MulterError") {
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "File too large. Maximum size is 5 MB"
      : err.code === "LIMIT_UNEXPECTED_FILE" ?
        'Unexpected file field. Use the field name "resume"'
      : err.message;
    return res.status(400).json({ message });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || "Server error",
  });
};
