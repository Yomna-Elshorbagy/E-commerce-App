import User from "../../../database/models/user.model.js";
import { AppError, catchAsyncError } from "../../utils/catchError.js";
import { status } from "../../utils/constant/enums.js";
import { messages } from "../../utils/constant/messages.js";
import cloudinary from "../../utils/fileUpload/cloudinary.js";
import { hashedPass } from "../../utils/hash-compare.js";

export const addAdmin = catchAsyncError(async (req, res, next) => {
  //get data from req
  const { userName, email, mobileNumber, role, password } = req.body;
  //check user admin
  const userExist = await User.findOne({ email });
  if (userExist) {
    return next(new AppError(messages.user.alreadyExisist, 409));
  }
  //prepare data
  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: "user" }
    );
    req.body.image = { secure_url, public_id };
  }
  const hashedPassword = hashedPass({ password: password || "e-commerce" });

  const createdUser = await User.create({
    userName,
    email,
    mobileNumber,
    role,
    password: hashedPassword,
    status: status.VERIFIED,
    isVerified: true,
    image: req.body.image,
  });
  if (!createdUser) {
    return next(new AppError(messages.user.failToCreate, 500));
  }
  res
    .status(201)
    .json({
      message: messages.user.createdSucessfully,
      sucess: true,
      data: createdUser,
    });
});

export const updateUser = catchAsyncError(async (req, res, next) => {
  const {id} = req.params;
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
  updatedUser.password = undefined;
  res.status(200).json({
    message: messages.user.updatedSucessfully,
    sucess: true,
    data: updatedUser,
  });
});

export const deleteUser = catchAsyncError(async (req, res, next) => {
  const {id} = req.params;
  const user = await User.findById(id);
  if (!user) return next(new AppError(messages.user.notFound, 404));

  const deletedUser = await User.deleteOne({_id: id});
  if (!deletedUser) {
    return next(new AppError(messages.user.failToDelete, 500));
  }
  res
    .status(200)
    .json({ message: messages.user.deletedSucessfully, sucess: true });
});
