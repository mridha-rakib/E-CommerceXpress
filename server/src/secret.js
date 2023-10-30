require("dotenv").config();

const serverPort = process.env.SERVER_PORT || 3000;

const defaultImagePath =
  process.env.DEFAULT_USER_IMAGE_URL || "../public/images/users/default.png";

const mongodbURL =
  process.env.MONGODB_ATLAS_URL || "mongodb://localhost:27017/ecommerceMernDB";

module.exports = {
  serverPort,
  mongodbURL,
  defaultImagePath,
};
