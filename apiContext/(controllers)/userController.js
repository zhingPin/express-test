const jwt = require("jsonwebtoken");
const User = require("../(models)/userModel");
const catchAsync = require("../(utils)/catchAsync");
const AppError = require("../(utils)/appError");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // ---1 Create error if user updating password
  if (req.body.password || req.body.confirmpassword) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword",
        400
      )
    );
  }

  //---2 Update user data
  const filteredBody = filterObj(req.body, "name", "email", "profilePic");

  // Find and update user based on address
  const updateUser = await User.findOneAndUpdate(
    { address: req.body.address }, // Find user by address
    filteredBody, // Data to update
    { new: true, runValidators: true } // Options: return updated user and run validators
  );

  if (!updateUser) {
    return next(new AppError("User not found", 404));
  }
  //   console.log("req", req);
  res.status(200).json({
    status: "Success",
    data: {
      user: updateUser,
    },
  });
});

// exports.updateMe = catchAsync(async (req, res, next) => {
//   // ---1 Create error if user updating password
//   if (req.body.password || req.body.confirmpassword) {
//     return next(
//       new AppError(
//         "This route is not for password updates. Please use /updateMyPassword",
//         400
//       )
//     );
//   }
//   //---2 Update user data
//   const filteredBody = filterObj(req.body, "name", "email", "profilePic");

//   const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
//     new: true,
//     runValidators: true,
//   });

//   res.status(200).json({
//     status: "Success",
//     data: {
//       user: updateUser,
//     },
//   });
// });
