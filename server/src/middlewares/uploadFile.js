const multer = require("multer");
const createError = require("http-errors");

const { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } = require("../config/constants");

const storage = multer.memoryStorage({
  filename: function (req, file, cb) {
    const uniqueFileName = Date.now() + "-" + file.originalname;
    cb(null, uniqueFileName);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"), false);
  }

  if (file.size > MAX_FILE_SIZE) {
    return cb(new Error("Too large image file size"), false);
  }

  if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    return cb(new Error("File type not allowed"), false);
  }

  cb(null, true);
};
const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;
