import joi from "joi";
import { generalFields } from "../../middelwares/validate.js";

export const addSubcategoryVal = joi.object({
    name : generalFields.name.required(),
    category : generalFields.objectId.required()
}).required()

export const updateSubcategoryVal = joi.object({
    name : generalFields.name,
    category : generalFields.objectId,
    id : generalFields.objectId.required()
}).required()