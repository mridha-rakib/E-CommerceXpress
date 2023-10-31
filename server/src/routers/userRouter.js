// external dependencies
const express = require("express");
const userRouter = express.Router();

// internal dependencies
const {
  getUsers,
  getUserById,
  deleteUserById,
  processRegister,
  activateUserAccount,
} = require("../controllers/userController");

const upload = require("../middlewares/uploadFile");

const { validateUserRegistration } = require("../validators/auth");
const runValidation = require("../validators/index");

userRouter.post(
  "/process-register",
  validateUserRegistration,
  runValidation,
  upload.single("image"),
  processRegister
);
userRouter.post("/verify", activateUserAccount);
userRouter.get("/", getUsers);
userRouter.get("/:id", getUserById);
userRouter.delete("/:id", deleteUserById);

module.exports = userRouter;

// runValidation,
