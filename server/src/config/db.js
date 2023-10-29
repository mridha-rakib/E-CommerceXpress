const mongoose = require("mongoose");

// internal dependencies
const { mongodbURL } = require("../secret");

const connectDatabase = async (options = {}) => {
  try {
    await mongoose.connect(mongodbURL, options);
    console.log("Connected to MongoDB successfully established!");
    mongoose.connection.on("error", (error) => {
      console.error("DB connection error: ", error);
    });
  } catch (error) {
    console.log("Could not connect tp db", error.toString());
  }
};

module.exports = connectDatabase;
