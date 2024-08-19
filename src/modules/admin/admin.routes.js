import { Router } from "express";
import { uploadSingleFile } from "../../utils/fileUpload/multer-cloud.js";
import { validate } from "../../middelwares/validate.js";
import * as adminController from "./admin.controllers.js";
import { auth, isAuthorized } from "../../middelwares/auth.js";
import { roles } from "../../utils/constant/enums.js";

const adminRouter = Router();

adminRouter.post(
  "/addAdmin",
  auth,
  isAuthorized([roles.ADMIN]),
  uploadSingleFile("image"),
  /* validate(),*/ adminController.addAdmin
);

adminRouter.put("/:id", auth, isAuthorized([roles.ADMIN]), adminController.updateUser);
adminRouter.delete("/:id", auth, isAuthorized([roles.ADMIN]), adminController.deleteUser);

export default adminRouter;
