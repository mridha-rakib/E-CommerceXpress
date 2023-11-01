// external dependencies
const express = require("express");
const authRouter = express.Router();

// internal dependencies
const runValidation = require("../validators");
const { handleLogin } = require("../controllers/authControllers");

authRouter.post("/login", handleLogin);

module.exports = authRouter;
