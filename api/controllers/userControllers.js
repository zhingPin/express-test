///------USERS
import { UserModel } from "../(models)/userSchema.js";
import AppError from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

const getAllUsers = catchAsync(async (req, res) => {
  const users = await UserModel.find();

  // /SEND QUERY
  res.status(200).json({
    status: "Success",
    results: users.length,
    data: {
      users,
    },
  });
});

const createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};
const getSingleUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};

const updateMe = catchAsync(async (req, res, next) => {
  // ---1 Create error if user updating password
  if (req.body.password || req.body.confirmpassword) {
    return next(
      new AppError(
        "This route is not for password update. Please use /updateMyPassword",
        400
      )
    );
  }
  //---2 Update user data
  const filteredBody = filterObj(req.body, "name", "email");

  const updateUser = await UserModel.findByIdAndUpdate(
    req.user.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "Success",
    data: {
      user: updateUser,
    },
  });
});

const updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};

const deleteMe = catchAsync(async (req, res, next) => {
  await UserModel.findByIdAndUpdate(req.body.id, { active: false });

  res.status(204).json({
    status: "Success",
    data: null,
  });
});

const deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};

export const userController = {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  updateMe,
  deleteMe,
  deleteUser,
};
