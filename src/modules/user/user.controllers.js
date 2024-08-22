import Token from "../../../database/models/token.model.js";
import User from "../../../database/models/user.model.js";
import { AppError, catchAsyncError } from "../../utils/catchError.js";
import { status } from "../../utils/constant/enums.js";
import { messages } from "../../utils/constant/messages.js";
import { comparePass, hashedPass } from "../../utils/hash-compare.js";

export const getProfile = catchAsyncError(async (req, res, next) => {
  return res.status(200).json({ message: req.authUser });
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword, Cpassword } = req.body;
  const userId = req.authUser._id;

  const match = comparePass({
    password: oldPassword,
    hashPass: req.authUser.password,
  });
  if(!match) return next (new AppError(messages.pasword.notMatch))
  const user = await User.findById(userId);
  if (user.status == status.VERIFIED || user.otpCode !== null) {
    return next(new AppError(messages.user.notVerified, 401));
  }

  if (newPassword != Cpassword)
    return next(new AppError(messages.user.invalidCredential, 401));
  const hashPass = hashedPass(newPassword, Number(process.env.SALT_ROUNDS));
  let updatedUser = await User.findOneAndUpdate(
    { _id: userId },
    {
      password: hashPass,
      passwordChangedAt: Date.now()
    },
    { new: true }
  );
  await Token.updateMany({ userId: user._id }, { isValid: false });

  updatedUser.password = undefined;
  res.status(200).json({
    message: messages.user.updatedSucessfully,
    sucess: true,
    data: updatedUser,
  });
});

export const updateUser = catchAsyncError(async (req, res, next) => {
  const id = req.authUser._id;
  const { userName, recoveryEmail, mobileNumber, DOB } = req.body;

  const user = await User.findById(id);
  if (!user) return next(new AppError(messages.user.notFound, 404));

  if (mobileNumber !== user.mobileNumber) {
    const mobileNumberUsed = await User.findOne({ mobileNumber });
    if (mobileNumberUsed)
      return next(new AppError("Mobile number is already in use", 409));
  }

  const updatedUser = await User.findOneAndUpdate(
    { _id: id },
    {
      userName,
      recoveryEmail,
      mobileNumber,
      DOB,
    },
    { new: true }
  );

  if (!updatedUser) {
    return next(new AppError(messages.user.failToUpdate, 500));
  }
  updatedUser.password = undefined
  res
    .status(200)
    .json({
      message: messages.user.updatedSucessfully,
      sucess: true,
      data: updatedUser,
    });
});

export const deleteUser = catchAsyncError(async (req, res, next) => {
  const id = req.authUser._id;
  const user = await User.findById(id);
  if (!user) return next(new AppError(messages.user.notFound, 404));

  const deletedUser = await User.deleteOne(id);
  if (!deletedUser) {
    return next(new AppError(messages.user.failToDelete, 500));
  }
  res
    .status(200)
    .json({ message: messages.user.deletedSucessfully, sucess: true });
});

export const softDeleteUser = catchAsyncError(async (req, res, next) => {
  const id = req.authUser._id;
  const user = await User.findById(id);
  if (!user) return next(new AppError(messages.user.notFound, 404));

  const softDeletedUser = await User.findByIdAndUpdate(
    id,
    { status: status.DELETED },
    { new: true }
  );
  if (!softDeletedUser) {
    return next(new AppError(messages.user.failToDelete, 500));
  }
  softDeletedUser.password = undefined;
  res.status(200).json({
    message: messages.user.deletedSucessfully,
    success: true,
    data: softDeletedUser 
  });
});

