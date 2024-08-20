import User from "../../database/models/user.model.js";
import { AppError } from "../utils/catchError.js";
import { messages } from "../utils/constant/messages.js";

export const checkUserEmail =async(req,res,next)=>{
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new AppError(messages.user.notFound, 404));
    return next()
}

export const checkUserId =async(req,res,next)=>{
    const id = req.authUser._id;
    const user = await User.findById(id);
    if (!user) return next(new AppError(messages.user.notFound, 404));
    return next()
}