const User = require("../models/userModel");
const data = require("../data");

const seedUser = async (req, res, next) => {
  try {
    // deleting all existing users
    await User.deleteMany({});

    // insert new user
    const users = await User.insertMany(data.users);

    // successful response
    return res.status(201).json({
      users: users,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { seedUser };
