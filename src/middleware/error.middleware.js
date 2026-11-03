
const errorHandler = (err, req, res, next) => {
  console.error("API Error:", {
    message: err.message,
    code: err.code,
    path: req.originalUrl,
  });

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  let errors = null;

  // Prisma known database errors
  switch (err.code) {
    // Duplicate record
    case "P2002":
      statusCode = 409;
      message = "This record already exists";
      break;

    // Foreign key constraint failed
    case "P2003":
      statusCode = 400;
      message = "Invalid related record reference";
      break;

    // Record not found during update/delete
    case "P2025":
      statusCode = 404;
      message = "Requested record not found";
      break;

    // Invalid database value
    case "P2023":
      statusCode = 400;
      message = "Invalid ID or database value";
      break;

    // Required field missing
    case "P2011":
      statusCode = 400;
      message = "A required database field is missing";
      break;

    // Invalid relation operation
    case "P2014":
      statusCode = 400;
      message = "Related records cannot be changed in this way";
      break;
  }

  // Zod validation errors
  if (err.name === "ZodError") {
    statusCode = 400;
    message = "Validation failed";

    errors = err.issues?.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
  }

  // Invalid JSON request body
  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    "body" in err
  ) {
    statusCode = 400;
    message = "Invalid JSON request body";
  }

  // Hide unexpected internal errors
  if (statusCode >= 500) {
    message = "Internal server error";
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};

export default errorHandler;
