const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const createError = require("http-errors");
const xssClean = require("xss-clean");
const rateLimit = require("express-rate-limit");
const rateLimiter = rateLimit({
  widowMs: 1 * 60 * 1000,
  max: 5,
  message: "To many requests from this IP. Please try again later",
});

// Internal dependecies
const userRouter = require("./routers/userRouter");
const seedRouter = require("./routers/seedRouter");
const { errorResponse } = require("./controllers/responseController");
const authRouter = require("./routers/authRouter");
// app initialization
const app = express();
app.use(cookieParser());
app.use(rateLimiter);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// route handling
app.use("/api/users", userRouter);
app.use("/api/seed", seedRouter);
app.use("/api/auth", authRouter);

// error handling
app.use((req, res, next) => {
  next(createError(404, "route not found"));
});

app.use((err, req, res, next) => {
  return errorResponse(res, { statusCode: err.status, message: err.message });
});

module.exports = app;
