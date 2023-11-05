// external dependencies
const express = require("express");
const authRouter = express.Router();

// internal dependencies
const runValidation = require("../validators");
const {
  handleLogin,
  handleLogout,
  handleRefreshToken,
} = require("../controllers/authControllers");
const { isLoggedOut, isLoggedIn } = require("../middlewares/auth");
const { validateUserLogin } = require("../validators/auth");

authRouter.post(
  "/login",
  validateUserLogin,
  runValidation,
  isLoggedOut,
  handleLogin
);
authRouter.post("/logout", isLoggedIn, handleLogout);
authRouter.get("/refresh-token", handleRefreshToken);

module.exports = authRouter;
