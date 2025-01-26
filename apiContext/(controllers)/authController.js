import jwt from "jsonwebtoken";
import User from "../(models)/userModel.js";
import catchAsync from "../(utils)/catchAsync.js";
import AppError from "../(utils)/appError.js";

// Define the controller functions inside the authController object
const authController = {
  signToken: (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  },

  createSendToken: (user, statusCode, req, res) => {
    const token = authController.signToken(user._id);

    res.cookie("jwt", token, {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    });

    res.status(statusCode).json({
      status: "success",
      token,
      data: {
        user,
      },
    });
  },

  validateSignup: (req, res, next) => {
    // Validate address
    if (!req.body.address) {
      return res.status(400).json({ error: "client not connected" });
    }

    next();
  },

  createUser: async (req, res, next) => {
    console.log(req.body);
    const { address } = req.body;

    // Check if user exists
    const user = await User.findOne({ address });

    if (user) {
      console.log("logged in");
      // If user exists, send token to the client
      authController.createSendToken(user, 200, req, res);
      return;
    }

    try {
      if (!req.body.address) {
        return res.status(400).json({
          status: "fail",
          message: "Address is required to sign up",
        });
      }
      const newUser = await User.create(req.body);

      // If all good, send token to the client
      authController.createSendToken(newUser, 201, req, res);
    } catch (error) {
      res.status(500).json({ error });
    }
  },

  getAllUsers: async (req, res, next) => {
    const users = await User.find();

    // Send response
    res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        users,
      },
    });
  },

  getUser: async (req, res, next) => {
    const user = await User.findById(req.params.address);

    // Send response
    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  },

  //--- PROTECTOR
  protect: catchAsync(async (req, res, next) => {
    // 1. Check token
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("login or connect wallet to gain access", 401));
    }

    // 2. Validate token
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if user exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError("This user no longer exists", 401));
    }

    // 4. Check if password was changed after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(new AppError("User recently changed the password", 401));
    }

    // ---- User will have access to protected data
    req.user = currentUser;
    next();
  }),
};

export default authController;
