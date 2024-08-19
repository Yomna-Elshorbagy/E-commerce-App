import User from "../../../database/models/user.model.js";
import { AppError, catchAsyncError } from "../../utils/catchError.js";
import { messages } from "../../utils/constant/messages.js";
import { comparePass, hashedPass } from "../../utils/hash-compare.js";
import { sendEmail, sendResetPasswordMail } from "../../utils/email.js";
import { generateToken, verifyToken } from "../../utils/token.js";
import { status } from "../../utils/constant/enums.js";
import Cart from "../../../database/models/cart.model.js";
import { generateOTP } from "../../utils/otp.js";

export const signup = catchAsyncError(async (req, res, next) => {
  //get data from req
  let {
    userName,
    email,
    password,
    Cpassword,
    recoveryEmail,
    mobileNumber,
    DOB,
  } = req.body;
  //check exisiting
  const userExisting = await User.findOne({
    $or: [{ email }, { mobileNumber }],
  });
  if (userExisting)
    return next(new AppError(messages.user.alreadyExisist, 409));
  if (password != Cpassword)
    return next(
      new AppError("password annd confirmed password doesnot Match", 401)
    );
  //prepare data
  const hashedpassword = hashedPass({
    password,
    saltRounds: Number(process.env.SALT_ROUNDS),
  });

  const { otpCode, otpExpire } = generateOTP();
  const user = new User({
    userName,
    email,
    password: hashedpassword,
    recoveryEmail,
    mobileNumber,
    DOB,
    otpCode,
    otpExpire,
    passwordChangedAt:Date.now()
  });

  let createdUser = await user.save();
  if (!createdUser) return next(new AppError(messages.user.failToCreate, 500));

  const token = generateToken({
    payload: {
      _id: createdUser._id,
      email: createdUser.email,
      password: createdUser.password,
    },
    secretKey: process.env.EMAIL_KEY,
  });
  createdUser.password = undefined;
  await sendEmail(createdUser._id, email, otpCode);
  return res.status(201).json({
    message: messages.user.createdSucessfully,
    sucess: true,
    data: createdUser,
  });
});

export const verifyAccount = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;
  const decoded = verifyToken({ token, secretKey: process.env.EMAIL_KEY });
  if (!decoded || !decoded._id) {
    return next(new AppError("Invalid Token or Signature...", 401));
  }
  const user = await User.findOneAndUpdate(
    { _id: decoded._id , status: status.PENDING},
    {
      status: status.VERIFIED,
      isVerified: true,
      otpCode: null,
      otpExpire: null,
    },
    {
      new: true,
    }
  );
  if (!user) return next(new AppError(messages.user.notFound, 404));
  //create cart when verification
  await Cart.create({ user: user._id, products: [] });
  res.json({
    message: messages.user.verifiedSucessfully,
    sucess: true,
    data: decoded.email,
  });
});

export const verifyOtp = catchAsyncError(async (req, res, next) => {
  const { email, otpCode } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new AppError(messages.user.notFound, 404));
  if (user.otpCode !== otpCode)
    return next(new AppError(messages.user.invalidOTP, 401));
  if (user.otpExpire < new Date())
    return next(new AppError(messages.user.expireOTP, 400));
  await User.findOneAndUpdate(
    { email },
    { isVerified: true, otpCode: null, otpExpire: null, status:status.VERIFIED },
    { new: true }
  );
  res.json({ message: messages.user.verifiedSucessfully });
});

export const logIn = catchAsyncError(async (req, res, next) => {
  let { email, mobileNumber, password } = req.body;
  //check existance
  const userExist = await User.findOne({
    $or: [{ email }, { mobileNumber }],
    status: status.VERIFIED //must verfied to login
  });
  if (!userExist ) {
    return next(new AppError(messages.user.invalidCredential, 401))};
  //check password
  const isMatch = comparePass({ password: password.trim(), hashPass: userExist.password });

  if (!isMatch ) {
    return next(new AppError(messages.user.invalidCredential, 401))};

  if (userExist.status !== status.VERIFIED || userExist.otpCode != null) {
    return next(new AppError(messages.user.notVerified, 401));
  }

  await User.findByIdAndUpdate(userExist._id, {
    isActive: true,
    status: status.VERIFIED,
    blacklistedTokens : []
  });
  await userExist.save();

  const accessToken = generateToken({
    payload: {
      _id: userExist._id,
      email: userExist.email,
      role: userExist.role,
    },
  });
  res.json({
    message: messages.user.logedInSucessfully,
    sucess: true,
    accessToken,
  });
});

export const forgetPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  const userExist = await User.findOne({ email });
  //check existance
  if (!userExist) return next(new (messages.user.notFound, 404)());
  // if has otp
  if (userExist.otpCode && userExist.otpExpire > Date.now()) {
    return next(new AppError(messages.user.hasOTP), 404);
  }
  const { otpCode, otpExpire } = generateOTP();
  //update user OTP;
  userExist.otpCode = otpCode;
  userExist.otpExpire = otpExpire;
  await userExist.save();
  await sendResetPasswordMail(email, otpCode);
  // return res
  return res.json({ message: "check your email", sucess: true });
});

export const changePassword = catchAsyncError(async (req, res, next) => {
  //get data from req
  const { otp, newPass, email } = req.body;
  //check email
  const user = await User.findOne({ email })
  if(!user) return next(new AppError(messages.user.notFound, 404));
  if (user.otpCode !== otp) return next (new AppError(messages.user.invalidOTP,));
  if (user.otpExpire < Date.now()) {
    const { otpCode, otpExpire } = generateOTP()
    user.otpCode = otpCode;
    user.otpExpire = otpExpire;
    await user.save();
    await sendResetPasswordMail(email, otpCode);
    return res.status(200).json({message: 'check your email', sucess: true});
  }
  //hash new Password
  const hashPass = hashedPass({password: newPass});
  await User.updateOne({email},{
    password : hashPass,
    otpCode: null, 
    otpExpire: null,
    passwordChangedAt:Date.now()
    })
  return res.status(200).json({message: messages.pasword.updatedSucessfully, sucess: true});
});

export const logout = catchAsyncError(async (req, res, next) => {
  const { _id } = req.authUser;
  const token = req.headers.authentication.split(" ")[1];

  await User.findByIdAndUpdate(_id, {
    $addToSet: { blacklistedTokens: token }, 
    isActive: false,
  });

  res.status(200).json({
    message: messages.user.loggedOutSuccessfully,
    success: true,
  });
});
