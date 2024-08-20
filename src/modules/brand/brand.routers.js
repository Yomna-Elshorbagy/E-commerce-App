import { Router } from "express";
import * as brandControllers from "./brand.controllers.js";
import { validate } from "../../middelwares/validate.js";
import { addBrandVal, updateBrandVal } from "./brand.validation.js";
import { uploadSingleFile } from "../../utils/fileUpload/multer-cloud.js";
import { auth, isAuthorized } from "../../middelwares/auth.js";
import { roles } from "../../utils/constant/enums.js";

const brandRouter = Router();
brandRouter.get('/getBrands', brandControllers.getBrands)

brandRouter
  .route("/")
  .post(auth,isAuthorized([roles.ADMIN, roles.SELLER]),uploadSingleFile('logo'),validate(addBrandVal),brandControllers.addBrand)
  .get(brandControllers.getAllBrands);

brandRouter
  .route("/:id")
  .get(brandControllers.getSpeificBrand)
  .put(auth,isAuthorized([roles.ADMIN, roles.SELLER]),uploadSingleFile('logo'), validate(updateBrandVal), brandControllers.updateBrand)
  .delete(auth,isAuthorized([roles.ADMIN, roles.SELLER]),brandControllers.deleteBrand);

export default brandRouter;
