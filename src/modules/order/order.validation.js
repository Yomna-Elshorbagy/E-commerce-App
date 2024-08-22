import joi from "joi";
import { generalFields } from "../../middelwares/validate.js";
import { orderStatus, payments } from "../../utils/constant/enums.js";

export const createOrderVal = joi.object({
    address: joi.string().required(),
    phone: generalFields.mobileNumber.required(),
    payment: joi.string().valid(...Object.values(payments)), //array
    coupon: joi.string(),
}).required();

export const OrderProductVal = joi.object({
    address: joi.string().required(),
    phone: generalFields.mobileNumber.required(),
    payment: joi.string().valid(...Object.values(payments)), //array
    coupon: joi.string(),
    products: joi.array().required()
}).required();

export const checkoutSessionVal = joi.object({
    id: generalFields.objectId.required(),  
}).required();

export const cancelOrderVal = joi.object({
    id: generalFields.objectId.required(),
}).required();

export const getPaymentStatusVal = joi.object({
    id: generalFields.objectId.required(),
}).required();

export const bulkUpdateStatusVal = joi.object({
    orderIds: joi.array().items(generalFields.objectId.required()).required(),
    status: joi.string().valid(...Object.values(orderStatus)).required(),
}).required();