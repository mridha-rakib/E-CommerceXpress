const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
// internal dependencies
const User = require("../models/userModel");
const { successResponse } = require("./responseController");
const { createJSONWebToken } = require("../helper/jsonwebtoken");
const { jwtAccessKey } = require("../secret");

const handleLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      throw createError(404, "User does not exist, please register first");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createError(401, "Incorrect password");
    }

    if (user.isBanned) {
      throw createError(
        403,
        "You are Banned. Please contact your administrator"
      );
    }

    const accessToken = createJSONWebToken(
      { _id: user._id },
      jwtAccessKey,
      "10m"
    );
    res.cookie("accessToken", accessToken, {
      maxAge: 15 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return successResponse(res, {
      statusCode: 200,
      message: "User logged in successfully",
      payload: {},
    });
  } catch (error) {
    next(error);
  }
};

const handleLogout = async (req, res, next) => {
  try {
    res.clearCookie("accessToken");
    return successResponse(res, {
      statusCode: 200,
      message: "User logout successfully",
      payload: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { handleLogin, handleLogout };
