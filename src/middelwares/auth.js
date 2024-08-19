import jwt from "jsonwebtoken";
import { AppError, catchAsyncError } from "../utils/catchError.js";
import User from "../../database/models/user.model.js";
import { verifyToken } from "../utils/token.js";
import { status } from "../utils/constant/enums.js";
import { messages } from "../utils/constant/messages.js";

export const auth = catchAsyncError( async(req, res, next) => {

  const { authentication } = req.headers;
  let result = ''
  if (!authentication) return next(new AppError("please signIn first", 401));
  let [key, token] = authentication.split(" ");
  const validPrefixes = ["access-token", "reset-password", "bearer"];
  if (!validPrefixes.includes(key)) {
    return next(new AppError("Invalid token prefix", 401));
  }
    //check token verification
    if (key === "access-token"){
      result = verifyToken({token, secretKey: process.env.SECRETKEYACESSTOKEN })
    }else if (key === "reset-password"){
      result = verifyToken({token, secretKey: process.env.SECRETKEYRESETPASS})
    }else if (key === "bearer"){
      result = verifyToken({token, secretKey: process.env.SECRET_KEY})
    }
    //check user
    if(result.errorMessage){
      return next(new AppError(result.errorMessage))
    }
    let user = await User.findOne({ _id: result._id, status: status.VERIFIED}).select('-password');
    
    if(!user || !user.isActive || user.blacklistedTokens.includes(token)) { 
      return next(new AppError('please signUp first', 401))
    };

    let time = parseInt(user.passwordChangedAt.getTime()/1000)
    if(time > result.iat) return next(new AppError('invalid token please login..', 401))
    req.authUser = user;
    next();
});

export const isAuthorized = (roles = [])=>{
  return (req, res, next)=>{
    const user = req.authUser;
    if(!roles.includes(user.role)){
      return next(new AppError(messages.user.notAuthorized, 401))
    }
    next()
  }
}