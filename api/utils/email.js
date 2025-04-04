import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  // 1 Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2 Define verification email options
  const mailOptions = {
    from: "Jon Dough <hello@jdough.com",
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html
  };

  // 3 Active send email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
