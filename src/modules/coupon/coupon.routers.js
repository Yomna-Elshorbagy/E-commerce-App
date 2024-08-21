import { Router } from "express";
import { auth, isAuthorized } from "../../middelwares/auth.js";
import { roles } from "../../utils/constant/enums.js";
import { addCouponVal, updateCouponVal } from "./coupon.validation.js";
import * as couponControllers from "./coupon.controllers.js";
import { validate } from "../../middelwares/validate.js";

const couponRouter = Router();

couponRouter.get('/:id', auth, couponControllers.getCoupon);
couponRouter.post('/addcoupon', auth, isAuthorized([roles.ADMIN]), validate(addCouponVal), couponControllers.addCoupon);
couponRouter.post('/valid', auth, couponControllers.validateCoupon);
couponRouter.put('/:id', auth, isAuthorized([roles.ADMIN]), validate(updateCouponVal), couponControllers.updateCoupon);
couponRouter.delete('/:id', auth, isAuthorized([roles.ADMIN]), couponControllers.deletCoupon);

export default couponRouter;