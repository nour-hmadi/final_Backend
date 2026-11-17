import "colors";

// Sends every error as JSON.
// Bad uploads get 400, a wrong id gets 404, and the stack trace is shown only on your laptop.
// In production, server errors (500) say "Server Error" so database details never leak.
const errorHandler = (err, req, res, next) => {
  console.error(`❌ Error: ${err.message}`.red);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Server Error";

  if (err.name === "MulterError" || err.status === 400) statusCode = 400;
  if (err.name === "CastError") {
    statusCode = 404;
    message = "Not found";
  }

  const production = process.env.NODE_ENV === "production";
  if (production && statusCode === 500) message = "Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    stack: production ? null : err.stack,
  });
};

export default errorHandler;
