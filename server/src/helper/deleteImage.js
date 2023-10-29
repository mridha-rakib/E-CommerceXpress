const fs = require("fs").promises;

const deleteImage = async (userImagePath) => {
  try {
    await fs.access(userImagePath);
    await fs.unlink(userImagePath);
    console.log("user image was deleted successfully");
  } catch (error) {
    console.log("User image doesn't exist.");
  }
};

module.exports = { deleteImage };
