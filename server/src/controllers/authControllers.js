const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
// internal dependencies
const User = require("../models/userModel");
const { successResponse } = require("./responseController");
const { createJSONWebToken } = require("../helper/jsonwebtoken");
const { jwtAccessKey, jwtRefreshKey } = require("../secret");

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
      "1m"
    );
    res.cookie("accessToken", accessToken, {
      maxAge: 1 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    const refreshToken = createJSONWebToken(
      { _id: user._id },
      jwtRefreshKey,
      "15m"
    );

    res.cookie("refreshToken", refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    const userWithoutPass = await User.findOne({ email: email }).select(
      "-password"
    );

    return successResponse(res, {
      statusCode: 200,
      message: "User logged in successfully",
      payload: { userWithoutPass },
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

const handleRefreshToken = async (req, res, next) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;

    // verify old refresh token
    const decodedToken = jwt.verify(oldRefreshToken, jwtRefreshKey);

    if (!decodedToken) {
      throw createError(401, "Invalid refresh token, please login again");
    }

    const accessToken = createJSONWebToken(
      { _id: decodedToken._id },
      jwtAccessKey,
      "1m"
    );

    res.cookie("accessToken", accessToken, {
      maxAge: 1 * 60 * 1000,
      httpOnly: true,
      sameSite: "none",
    });

    return successResponse(res, {
      statusCode: 200,
      message: "new access token generated successfully",
      payload: {},
    });
  } catch (error) {
    next(error);
  }
};

const handleProtectedRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    // verify old refresh token
    const decodedToken = jwt.verify(accessToken, jwtAccessKey);

    if (!decodedToken) {
      throw createError(401, "Invalid access token, please login again");
    }

    return successResponse(res, {
      statusCode: 200,
      message: "protected resources accessed successfully",
      payload: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleLogin,
  handleLogout,
  handleRefreshToken,
  handleProtectedRoute,
};
