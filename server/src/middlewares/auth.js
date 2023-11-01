const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const { jwtAccessKey } = require("../secret");
const isLoggedIn = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      throw createError(401, "Access token not found");
    }

    const decoded = jwt.verify(token, jwtAccessKey);
    if (!decoded) {
      throw createError(401, "Invalid access token, Login again.");
    }
    req.body.userId = decoded._id;
    next();
    f;
  } catch (error) {
    next(error);
  }
};

module.exports = { isLoggedIn };
