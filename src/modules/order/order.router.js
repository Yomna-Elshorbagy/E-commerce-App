import { Router } from "express";
import { auth, isAuthorized } from "../../middelwares/auth.js";
import * as orderControllers from "./order.controllers.js";
import { orderEndPoint } from "./order.endpint.js";
import { validate } from "../../middelwares/validate.js";
import { bulkUpdateStatusVal, cancelOrderVal, checkoutSessionVal, createOrderVal, getPaymentStatusVal, OrderProductVal } from "./order.validation.js";

const orderRouter = Router()

orderRouter.get('/', auth, isAuthorized(orderEndPoint.public),orderControllers.getUserOrders);
orderRouter.post('/add-order', 
    auth, 
    isAuthorized(orderEndPoint.public),
    validate(createOrderVal),
    orderControllers.createOrder);

orderRouter.post('/order-product', 
    auth, 
    isAuthorized(orderEndPoint.public),
    validate(OrderProductVal),
    orderControllers.createOrderProduct);
    
orderRouter.get('/analytics', auth, isAuthorized(orderEndPoint.admin),orderControllers.getOrderAnalytics);
orderRouter.get('/:id', auth, isAuthorized(orderEndPoint.public),orderControllers.getOrderById);
orderRouter.get('/payment-status/:id', 
    auth, 
    isAuthorized(orderEndPoint.public),
    validate(getPaymentStatusVal),
    orderControllers.getPaymentStatus);

orderRouter.put('/bulk-update', 
    auth, 
    isAuthorized(orderEndPoint.admin,orderEndPoint.delivary ),
    validate(bulkUpdateStatusVal),
    orderControllers.bulkUpdateStatus);
    
orderRouter.post('/checkSession/:id', auth, validate(checkoutSessionVal),orderControllers.createCheckoutSession);
orderRouter.put('/cancel/:id', auth,validate(cancelOrderVal),orderControllers.cancelOrder);


export default orderRouter