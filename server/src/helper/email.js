const nodemailer = require("nodemailer");

// internal
const { smtpUsername, smtpPassword } = require("../secret");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: smtpUsername,
    pass: smtpPassword,
  },
});

const emailWithNodeMailer = async (emailData) => {
  try {
    const mailOptions = {
      from: smtpUsername,
      to: emailData.email,
      subject: emailData.subject,
      html: emailData.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sen: %s", info.response);
  } catch (error) {
    console.error("Error occurred while sending email: ", error);
    throw error;
  }
};

module.exports = { emailWithNodeMailer };
