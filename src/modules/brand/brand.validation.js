import joi from "joi";
import { generalFields } from "../../middelwares/validate.js";

export const addBrandVal = joi.object({
    name : generalFields.name.required(),
}).required()

export const updateBrandVal = joi.object({
    name : generalFields.name,
    id : generalFields.objectId.required()
}).required()