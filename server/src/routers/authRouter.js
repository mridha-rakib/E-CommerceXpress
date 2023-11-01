// external dependencies
const express = require("express");
const authRouter = express.Router();

// internal dependencies
const runValidation = require("../validators");
const { handleLogin, handleLogout } = require("../controllers/authControllers");

authRouter.post("/login", handleLogin);
authRouter.post("/logout", handleLogout);

module.exports = authRouter;
