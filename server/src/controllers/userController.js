// external dependencies
const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// internal dependencies
const User = require("../models/userModel");
const { successResponse } = require("./responseController");
const { findWithId } = require("../services/findItem");
const {
  jwtActivationKey,
  clientURL,
  jwtResetPasswordKey,
} = require("../secret");
const { createJSONWebToken } = require("../helper/jsonwebtoken");
const { emailWithNodeMailer } = require("../helper/email");

// router
const getUsers = async (req, res, next) => {
  try {
    const search = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 3;

    const searchRegExp = new RegExp(".*" + search + ".*", "i");

    const filter = {
      isAdmin: { $ne: true },
      $or: [
        { name: { $regex: searchRegExp } },
        { email: { $regex: searchRegExp } },
        { phone: { $regex: searchRegExp } },
      ],
    };
    const options = { password: 0 };

    const users = await User.find(filter, options)
      .limit(limit)
      .skip((page - 1) * limit);

    const count = await User.find(filter).countDocuments();

    if (!users) {
      throw createError(404, "user not found");
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Users were returned successfully",
      payload: {
        users: users,
        pagination: {
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          previousPage: page - 1 > 0 ? page - 1 : null,
          nextPage: page + 1 <= Math.ceil(count / limit) ? page + 1 : null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// get single user
const getUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const options = { password: 0 };
    const user = await findWithId(User, id, options);

    return successResponse(res, {
      statusCode: 200,
      message: "User returned successfully",
      payload: { user },
    });
  } catch (error) {
    next(error);
  }
};

// delete single user
const deleteUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const options = { password: 0 };
    const user = await findWithId(User, id, options);

    // const userImagePath = user.image; comment out for memory storage

    // deleteImage3(userImagePath);

    await User.findByIdAndDelete({
      _id: id,
      isAdmin: false,
    });

    return successResponse(res, {
      statusCode: 200,
      message: "User was delete successfully",
      payload: {},
    });
  } catch (error) {
    next(error);
  }
};

// registration process
const processRegister = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    const image = req.file;
    if (!image) {
      throw createError(400, "Image file is required");
    }
    if (image.size > 1024 * 1024 * 2) {
      throw createError(400, "Image file must be at less then 2mb");
    }
    const imageBufferString = image.buffer.toString("base64");

    const userExists = await User.exists({ email: email });

    if (userExists) {
      throw createError(409, "User email already exist, try another one.");
    }

    // create jwt
    const token = createJSONWebToken(
      { name, email, password, phone, address, image: imageBufferString },
      jwtActivationKey,
      "10m"
    );

    // prepare email
    const emailData = {
      email,
      subject: "Account Activation Email",
      html: `
        <h2> Hello ${name} </h2>
        <p> Please click here to 
          <a href="${clientURL}/api/users/activate/${token}" target="_blank"> activate your account</a> link 
        </p>
      `,
    };

    // send email with nodemailer
    try {
      await emailWithNodeMailer(emailData);
    } catch (error) {
      next(createError(500, "Failed to send verification email"));
      return;
    }

    return successResponse(res, {
      statusCode: 200,
      message: `Please go to your ${email} for completing registration process.`,
      payload: { token },
    });
  } catch (error) {
    next(error);
  }
};

const activateUserAccount = async (req, res, next) => {
  try {
    const token = req.body.token;
    if (!token) throw createError(404, "token not found");

    try {
      const decodedData = jwt.verify(token, jwtActivationKey);

      if (!decodedData) throw createError(401, "User was not verified");

      const userExists = await User.exists({ email: decodedData.email });
      if (userExists) {
        throw createError(409, "User email already exist, try another one.");
      }

      User.create(decodedData);

      return successResponse(res, {
        statusCode: 201,
        message: "User was registered successfully",
      });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw createError(401, "Token has expired");
      } else if (error.name === "JsonWebTokenError") {
        throw createError(401, "Invalid token");
      } else {
        throw error;
      }
    }
  } catch (error) {
    next(error);
  }
};

// delete single user
const updateUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const options = { password: 0 };
    await findWithId(User, userId, options);
    const updateOptions = { new: true, runValidators: true, context: "query" };

    let updates = {};
    // name, pass, phone, address
    for (let key in req.body) {
      if (["name", "password", "phone", "address"].includes(key)) {
        updates[key] = req.body[key];
      } else if (["email"].includes(key)) {
        throw new Error("Updating email is not allowed.");
      }
    }

    const image = req.file;
    if (image) {
      if (image.size > 1024 * 1024 * 2) {
        throw createError(400, "Image file less than 2MB");
      }
      updates.image = image.buffer.toString("base64");
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      updateOptions,
      select: "-password -_id -__v",
    });

    if (!updatedUser) {
      throw createError(404, "user with this ID does not exist");
    }
    return successResponse(res, {
      statusCode: 200,
      message: "user update successfully",
      payload: { updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

const handleBanUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const options = { password: 0 };
    await findWithId(User, userId, options);
    const updates = { isBanned: true };
    const updateOptions = { new: true, runValidators: true, context: "query" };

    const updateUser = await User.findByIdAndUpdate(
      userId,
      updates,
      updateOptions
    ).select("-password");

    if (!updateUser) {
      throw createError(400, "User with this id does not banned successfully");
    }

    return successResponse(res, {
      statusCode: 200,
      message: "User was banned successfully",
      payload: {},
    });
  } catch (error) {
    next(error);
  }
};

const handleUnbanUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const options = { password: 0 };
    await findWithId(User, userId, options);
    const updates = { isBanned: false };
    const updateOptions = { new: true, runValidators: true, context: "query" };

    const updateUser = await User.findByIdAndUpdate(
      userId,
      updates,
      updateOptions
    ).select("-password");

    if (!updateUser) {
      throw createError(
        400,
        "User with this id does not unbanned successfully"
      );
    }

    return successResponse(res, {
      statusCode: 200,
      message: "User was unbanned successfully",
      payload: { updateUser },
    });
  } catch (error) {
    next(error);
  }
};

const handleUpdatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.params.id;
    const user = await findWithId(User, userId);
    if (!user) {
      throw createError(404, "User not found");
    }
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      throw createError(401, "Password didn't match");
    }

    const updatePassword = { $set: { password: newPassword } };
    const updateOptions = { new: true };

    const updateUser = await User.findByIdAndUpdate(
      userId,
      updatePassword,
      updateOptions
    ).select("-password");
    // Respond with a success message

    return successResponse(res, {
      statusCode: 200,
      message: "User password updated successfully",
      payload: { updateUser },
    });
  } catch (error) {
    next(error);
  }
};

const handleForgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const userData = await User.findOne({ email: email });
    if (!userData) {
      throw createError(
        404,
        "Email is incorrect or your email address is not verified, please register first"
      );
    }

    const token = createJSONWebToken({ email }, jwtResetPasswordKey, "10m");

    const emailData = {
      email,
      subject: "Reset password email",
      html: `
        <h2> Hello ${userData.name}! </h2>
        <p> Please click here to 
          <a href="${clientURL}/api/users/reset-password/${token}" target="_blank"> 
            reset your password
          </a>  
        </p>
      `,
    };

    // send email with nodemailer
    try {
      await emailWithNodeMailer(emailData);
    } catch (error) {
      next(createError(500, "Failed to send reset password email"));
      return;
    }

    return successResponse(res, {
      statusCode: 200,
      message: `please goto your ${email} for reset your password`,
      payload: { token },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  deleteUserById,
  processRegister,
  activateUserAccount,
  updateUserById,
  handleBanUserById,
  handleUnbanUserById,
  handleUpdatePassword,
  handleForgetPassword,
};
