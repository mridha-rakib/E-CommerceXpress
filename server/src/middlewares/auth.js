const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const { jwtAccessKey } = require("../secret");
const User = require("../models/userModel");
const { findWithId } = require("../services/findItem");

const isLoggedIn = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      throw createError(401, "Access token not found, Please login");
    }

    const decoded = jwt.verify(accessToken, jwtAccessKey);
    console.log(decoded);
    if (!decoded) {
      throw createError(401, "Invalid access token, Login again.");
    }
    req.user_id = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

const isLoggedOut = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (accessToken) {
      throw createError(400, "User already logged in");
    }
    next();
  } catch (error) {
    next(error);
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const id = req.user_id;
    const options = { password: 0 };
    const user = await findWithId(User, id, options);
    if (!user.isAdmin) {
      throw createError(
        403,
        "Forbidden. You must be an admin to access this resource"
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { isLoggedIn, isLoggedOut, isAdmin };
