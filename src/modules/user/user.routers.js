import { Router } from "express";
import * as userController from './user.controllers.js'
import { auth } from "../../middelwares/auth.js";
import { validate } from "../../middelwares/validate.js";
import { resetPassVal } from "./user.validation.js";
const userRouter = Router();

userRouter.get('/profile', auth , userController.getProfile )
userRouter.put('/reset-pass', auth , validate(resetPassVal), userController.resetPassword )
userRouter.put('/', auth , userController.updateUser )
userRouter.delete('/', auth , userController.deleteUser )

export default userRouter;