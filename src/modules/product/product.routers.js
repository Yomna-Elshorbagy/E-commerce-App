import { Router } from "express";
import * as productControllers from "./product.controllers.js";
import { checkProId } from "../../middelwares/checkId.js";
import { addProductVal } from "./product.validation.js";
import { validate } from "../../middelwares/validate.js";
import { uploadMixFiles } from "../../utils/fileUpload/multer-cloud.js";
import { auth, isAuthorized } from "../../middelwares/auth.js";
import { roles } from "../../utils/constant/enums.js";

const productRouter = Router();
productRouter.get('/getproducts', productControllers.getproducts)
// productRouter.get('/getproductsfilter', productControllers.getproductsfilter)

productRouter
  .route("/")
  .post(
    auth,
    isAuthorized([roles.ADMIN, roles.SELLER]),
    uploadMixFiles([{ name: 'imageCover', maxCount: 1 }, { name: 'subImages', maxCount: 8 }]), 
    checkProId,
    validate(addProductVal),
    productControllers.addproduct)
  .get(productControllers.getAllproducts);

productRouter
  .route("/:id")
  .get(productControllers.getSpeificproduct)
  .put(
    auth,
    isAuthorized([roles.ADMIN, roles.SELLER]),
    uploadMixFiles([{ name: 'imageCover', maxCount: 1 }, { name: 'images', maxCount: 8 }]) ,
    productControllers.updateproductCloud)
  .delete( 
    auth,
    isAuthorized([roles.ADMIN, roles.SELLER]),
    productControllers.deleteproduct);

export default productRouter;
