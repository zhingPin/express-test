import crypto from "crypto";
import mongoose from "mongoose";
import slugify from "slugify";
import validator from "validator";
import bcrypt from "bcryptjs";

// name, email, password, passwordConfirmed

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, "Please State Your Name"],
  },
  email: {
    type: String,
    required: [true, "Please Provide Your Email Address"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please Provide A VALID EMAIL Address!"],
  },
  photo: String,
  role: {
    type: String,
    enum: ["user", "creator", "admin", "guide"],
    default: "user",
  },

  password: {
    type: String,
    required: [true, "Please Provide A Password"],
    minlength: 6,
    select: false,
  },
  confirmpassword: {
    type: String,
    required: [true, "Please Confirm Your PASSWORD"],
    validate: {
      //THIS WILL ONLY WORK ON SAVE NOT FIND
      validator: function (el) {
        return el === this.password; //abc === abc true, abc === acb false
      },
      message: "Passwords Do NOT Match!!!",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,

  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// ---ENCRYPTION

userSchema.pre("save", async function (next) {
  // Password modified check
  if (!this.isModified("password")) return next();
  // ----HASH THIS CODE
  this.password = await bcrypt.hash(this.password, 14);
  // ---DELETE CONFIRMED PASSWORD
  this.confirmpassword = undefined;

  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimeStamp; // 300 < 200

    // console.log(changedTimeStamp, JWTTimestamp);
  }
  // BY DEFAULT WE WANT TO RETURN FALSE, MEANS NOT CHANGED
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

export const UserModel = mongoose.model("User", userSchema);
