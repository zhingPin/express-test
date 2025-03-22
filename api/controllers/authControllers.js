import crypto from "crypto";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import { UserModel } from "../(models)/userSchema.js";

import sendEmail from "../utils/email.js";
import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

//  ---CREATE TOKEN

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE_IN * 24 * 60 * 60 * 1000
    ),
    // secure: true,
    httpOnly: true,
  };

  // if((proccess.env.NODE_ENV = "production")) cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;
  // user.__v = undefined;

  res.status(statusCode).json({
    status: "Success",
    token,
    data: {
      user,
    },
  });
};

// ---SIGN UP

const signup = catchAsync(async (req, res, next) => {
  const newUser = await UserModel.create(req.body);
  // const newUser = await User.create ({
  //     name: req.body.name,
  //     email: req.body.email,
  //     password: req.body.password,
  //     confirmpassword: req.body.confirmpassword,
  // });

  createSendToken(newUser, 201, res);
  // const token = signToken(newUser.id);
  // res.status(201).json({
  //     status: "Success",
  //     token,
  //     data: {
  //         user: newUser,
  //     },
  // });
});

// ---LOGIN USER

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please Provide Your Email & Password"));
  }

  const user = await UserModel.findOne({ email }).select("+password");
  // console.log(user);
  // 123456 === $2a$12$4B786ixGuJM980u3oUjnku/ChpQPhoQtL81og5Y9oa9pRWxW5jvXi

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect Email and Password", 401));
  }

  createSendToken(user, 200, res);
  //     const token = signToken(user.id);
  //     res.status(200).json({
  //         status: "success",
  //         token,
  //     });
});

// ----PROTECTING DATA

const protect = catchAsync(async (req, res, next) => {
  // 1 check token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Login To Gain Access", 401));
  }
  // console.log(token);
  // 2 validate token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  // 3 user exist
  const currentUser = await UserModel.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError("The User Belonging To This Token No Longer Exists", 401)
    );
  }

  // 4 change password
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError("User recently changed the password", 401));
  }

  //---- USER WILL HAVE ACCESS TO PROTECTED DATA
  req.user = currentUser;
  next();
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You Do Not Have Access To Delete This NFT", 403)
      );
    }
    next();
  };
};

// ---PASSWORD UPDATES

// ---FORGOT PASSWORD
const forgotPassword = catchAsync(async (req, res, next) => {
  // 1 Get user based on email provided
  const user = await UserModel.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("We Have No User With This E-mail", 404));
  }

  // 2 Create random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3 Send verification Email to user
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}api/v1/users/resetPassword/${resetToken}`;

  const message = `If you forgot your password, submit updated password request providing your new password and confirmation in: ${resetURL}.\n you will also need to confirm your new password`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your Password reset (Valid For 10 minutes)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (error) {
    (user.passwordResetToken = undefined),
      (user.passwordResetExpires = undefined);
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        "There was an error sending verification email, Try Again later",
        500
      )
    );
  }
});

// ----RESET PASSWORD

const resetPassword = catchAsync(async (req, res, next) => {
  //---1 Get user based on token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await UserModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // ---If token has not expired and there is a user, set new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired, 400"));
  }

  user.password = req.body.password;
  (user.confirmpassword = req.body.confirmpassword),
    (user.passwordResetToken = undefined);
  user.passwordResetExpires = undefined;
  await user.save();

  // ---3 Update changed password for the user

  // ---4 Log the user in and send JWT
  createSendToken(user, 200, res);
  // const token = signToken(user.id);
  // res.status(200).json({
  //     status: "success",
  //     token,
  // });
});

// ---UPDATING PASSWORD

const updatePassword = catchAsync(async (req, res, next) => {
  // 1 Get user from data collection
  const user = await UserModel.findById(req.user.id).select("+password");
  // 2 Check if current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong", 401));
  }
  // 3 If so update the password
  user.password = req.body.password;
  user.confirmpassword = req.body.confirmpassword;
  await user.save();
  // 4 Log user after password change
  createSendToken(user, 200, res);
});

export const authController = {
  updatePassword,
  resetPassword,
  forgotPassword,
  restrictTo,
  protect,
  login,
  signup,
};
