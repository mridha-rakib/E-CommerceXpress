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
  handleBanUserById,
  handleUnbanUserById,
  handleUpdatePassword,
  handleForgetPassword,
  handleResetPassword,
} = require("../controllers/userController");

const upload = require("../middlewares/uploadFile");

const {
  validateUserRegistration,
  validateUserPasswordUpdate,
  validateUserForgetPassword,
  validateUserResetPassword,
} = require("../validators/auth");
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
userRouter.put(
  "/reset-password",
  validateUserResetPassword,
  runValidation,
  handleResetPassword
);
userRouter.put("/:id", upload.single("image"), isLoggedIn, updateUserById);
userRouter.put("/ban-user/:id", isLoggedIn, isAdmin, handleBanUserById);
userRouter.put("/unban-user/:id", isLoggedIn, isAdmin, handleUnbanUserById);
userRouter.post(
  "/forget-password",
  validateUserForgetPassword,
  runValidation,
  handleForgetPassword
);

userRouter.put(
  "/update-password/:id",
  validateUserPasswordUpdate,
  runValidation,
  isLoggedIn,
  handleUpdatePassword
);

module.exports = userRouter;

// runValidation,
