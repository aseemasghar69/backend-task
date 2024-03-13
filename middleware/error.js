const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // Log to console for dev
  console.log(err.message);

  //  bad ObjectId
  if (err.name === "CastError") {
    const message = `Resource not found`;
    error = new ErrorResponse(message, 404);
  }

  //  validation error
  if (err.name === "SequelizeUniqueConstraintError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  if (error.name == "PrismaClientKnownRequestError") {
    const lines = error.message.split("\n");
    const message = lines[lines.length - 1];
    return res.status(error.statusCode || 500).json({
      success: false,
      message: message || "Server Error",
    });
  }
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
  });
};

module.exports = errorHandler;
