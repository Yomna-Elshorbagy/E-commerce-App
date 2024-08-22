import { roles } from "../../utils/constant/enums.js";

export const orderEndPoint = {
    public: Object.values(roles),
    admin : [roles.ADMIN],
    delivary: [roles.CUSTOMER]
}