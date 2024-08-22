import { Router } from "express";
import * as authControllers from "./auth.controllers.js";
import { validate } from "../../middelwares/validate.js";
import { uploadSingleFile } from "../../utils/fileUpload/multer-cloud.js";
import { signUpVal } from "./auth.validation.js";
import { auth } from "../../middelwares/auth.js";

const authRouter = Router();

authRouter.post("/signup",uploadSingleFile('image'),validate(signUpVal), authControllers.signup)
authRouter.get('/verify/:token', authControllers.verifyAccount );
authRouter.post('/login', authControllers.logIn );
authRouter.post('/logout', auth,authControllers.logout );
authRouter.post('/verifyOtp',authControllers.verifyOtp );
authRouter.put('/forgetPass', authControllers.forgetPassword)
authRouter.put('/changePass', authControllers.changePassword)

authRouter
  .route("/:id")
  .get()
  .put(uploadSingleFile('logo'), validate(),)
  .delete();

export default authRouter;
