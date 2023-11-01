require("dotenv").config();

const serverPort = process.env.SERVER_PORT || 3000;

const defaultImagePath =
  process.env.DEFAULT_USER_IMAGE_URL || "../public/images/users/default.png";

const mongodbURL =
  process.env.MONGODB_ATLAS_URL || "mongodb://localhost:27017/ecommerceMernDB";

const jwtActivationKey = process.env.JWT_ACTIVATION_KEY;
const jwtAccessKey = process.env.JWT_ACCESS_KEY;

const smtpUsername = process.env.SMTP_USERNAME || "";
const smtpPassword = process.env.SMTP_PASSWORD || "";

const clientURL = process.env.CLIENT_URL || "";

module.exports = {
  serverPort,
  mongodbURL,
  defaultImagePath,
  jwtActivationKey,
  jwtAccessKey,
  smtpUsername,
  smtpPassword,
  clientURL,
};
