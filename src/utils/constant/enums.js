export const roles = {
    USER: "user",
    CUSTOMER: "customer",
    ADMIN: "admin",
    SELLER: "seller",
};
Object.freeze(roles)

export const status = {
    BLOCKED: "blocked",
    PENDING: "pending",
    VERIFIED: "verified",
    DELETED: "deleted"
};
Object.freeze(status)

export const couponTypes = {
    FIXED_AMOUNT: "fixedAmount",
    PERCENTAGE: "percentage",
};
Object.freeze(couponTypes)