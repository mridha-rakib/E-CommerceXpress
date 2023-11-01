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
const { isLoggedIn } = require("../middlewares/auth");

userRouter.post(
  "/process-register",
  upload.single("image"),
  validateUserRegistration,
  runValidation,
  processRegister
);
userRouter.post("/activate", activateUserAccount);
userRouter.get("/", getUsers);
userRouter.get("/:id", isLoggedIn, getUserById);
userRouter.delete("/:id", deleteUserById);
userRouter.put("/:id", upload.single("image"), updateUserById);

module.exports = userRouter;

// runValidation,
