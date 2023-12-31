const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
      minlength: [3, "user name lenght can be maximum character"],
      maxlength: [31, "user name lenght can be maximum character"],
    },
    email: {
      type: String,
      required: [true, "User email is required"],
      trim: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          // This regular expression validates the email format
          return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(v);
        },
        message: "Invalid email format",
      },
    },

    password: {
      type: String,
      required: [true, "User password is required"],
      minlength: [6, "password length minimum 6 characters"],
      set: (v) => bcrypt.hashSync(v, bcrypt.genSaltSync(10)),
    },
    image: {
      type: Buffer,
      contentType: String,
      required: [true, "User image is required"],
    },
    address: {
      type: String,
      required: [true, "User address is required"],
      minlength: [6, "address length minimum 4 characters"],
    },
    phone: {
      type: String,
      required: [true, "user phone is required"],
      minlength: 10,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User = model("Users", userSchema);

module.exports = User;
