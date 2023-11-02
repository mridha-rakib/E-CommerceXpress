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
  updateUserById,
} = require("../controllers/userController");

const upload = require("../middlewares/uploadFile");

const { validateUserRegistration } = require("../validators/auth");
const runValidation = require("../validators/index");
const { isLoggedIn, isLoggedOut, isAdmin } = require("../middlewares/auth");

userRouter.post(
  "/process-register",
  upload.single("image"),
  isLoggedOut,
  validateUserRegistration,
  runValidation,
  processRegister
);
userRouter.post("/activate", isLoggedOut, activateUserAccount);
userRouter.get("/", isLoggedIn, isAdmin, getUsers);
userRouter.get("/:id", isLoggedIn, getUserById);
userRouter.delete("/:id", isLoggedIn, deleteUserById);
userRouter.put("/:id", upload.single("image"), isLoggedIn, updateUserById);

module.exports = userRouter;

// runValidation,
