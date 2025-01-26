import User from "../(models)/userModel.js";
import catchAsync from "../(utils)/catchAsync.js";
import AppError from "../(utils)/appError.js";

// Utility function to filter object keys
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

export const updateMe = catchAsync(async (req, res, next) => {
  // ---1: Create error if user attempts to update password
  if (req.body.password || req.body.confirmpassword) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword",
        400
      )
    );
  }

  // ---2: Ensure `address` is provided either in the body or as part of the authenticated user.
  const address = req.body.address || req.user?.address; // Assuming `req.user.address` is available after the `protect` middleware

  if (!address) {
    return next(
      new AppError("Address is required for updating user details", 400)
    );
  }

  // ---3: Filter the allowed fields for update (name, email, profilePic)
  const filteredBody = filterObj(req.body, "name", "email", "profilePic");

  // ---4: Find and update user by address
  const updatedUser = await User.findOneAndUpdate(
    { address }, // Find user by address
    filteredBody, // Update allowed fields
    { new: true, runValidators: true } // Options: return updated user, run validators
  );

  // ---5: Handle case where user is not found
  if (!updatedUser) {
    return next(new AppError("User not found", 404));
  }

  // ---6: Send response with the updated user data
  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});
