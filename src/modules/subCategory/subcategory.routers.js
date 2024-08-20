import { Router } from "express";
import * as subCategoryControllers from "./subCategory.controllers.js";
import { validate } from "../../middelwares/validate.js";
import { addSubcategoryVal } from "./subcategory.validation.js";
// import { uploadSingleFile } from "../../utils/fileUpload/multer.js";
import { auth, isAuthorized } from "../../middelwares/auth.js";
import { roles } from "../../utils/constant/enums.js";
import { uploadSingleFile } from "../../utils/fileUpload/multer-cloud.js";

const subCategoryRouter = Router();
subCategoryRouter.get('/getsubcategory', subCategoryControllers.getSubcategory)

subCategoryRouter.post(
    auth,isAuthorized([roles.ADMIN, roles.SELLER]),
    uploadSingleFile('image'),
    validate( addSubcategoryVal ),subCategoryControllers.addsubcategoryCloud)
subCategoryRouter.get("/:categoryId", subCategoryControllers.getAllSubcategories);

subCategoryRouter.get('/:categoryId',subCategoryControllers.getSubcategories )
subCategoryRouter
  .route("/:id")
  .get(subCategoryControllers.getSpeificSubcategory)
  .put(auth,isAuthorized([roles.ADMIN, roles.SELLER]), subCategoryControllers.updateSubcategory)
  .delete(auth,isAuthorized([roles.ADMIN, roles.SELLER]),subCategoryControllers.deleteSubcategory);

export default subCategoryRouter;
