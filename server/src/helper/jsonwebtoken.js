// external dependencies
const jwt = require("jsonwebtoken");

const createJSONWebToken = (payload, secretKey, expiresIn) => {
  let token = jwt.sign(payload, secretKey, { expiresIn });

  return token;
};

module.exports = createJSONWebToken;
