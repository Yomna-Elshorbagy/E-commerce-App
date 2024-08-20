import joi from "joi";
import { generalFields } from "../../middelwares/validate.js";

export const addProductVal = joi.object({
    title : generalFields.name.required(),
    description: generalFields.description.required(),
    category: generalFields.objectId.required(),
    subcategory: generalFields.objectId.required(),
    brand: generalFields.objectId.required(),
    price: generalFields.price.required(),
    size: generalFields.size,
    colors: generalFields.colors,
    stock: generalFields.stock,
    discount: generalFields.discount.optional(),
}).required()

export const updateProductVal = joi.object({
    title : generalFields.name,
    description: generalFields.description,
    category: generalFields.objectId,
    subcategory: generalFields.objectId,
    brand: generalFields.objectId,
    price: generalFields.price,
    size: generalFields.size,
    colors: generalFields.colors,
    stock: generalFields.stock,
    discount: generalFields.discount,
    id : generalFields.objectId.required()
}).required()