import Cart from "../../../database/models/cart.model.js";
import Coupon from "../../../database/models/coupon.model.js";
import Order from "../../../database/models/order.model.js";
import Product from "../../../database/models/product.model.js";
import { AppError, catchAsyncError } from "../../utils/catchError.js";
import {
  couponTypes,
  orderStatus,
  payments,
} from "../../utils/constant/enums.js";
import { messages } from "../../utils/constant/messages.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// create order from cart
export const createOrder = catchAsyncError(async (req, res, next) => {
  const { address, phone, coupon, payment } = req.body;

  // check coupon existance - valid
  let couponExist;
  if (coupon) {
    couponExist = await Coupon.findOne({ code: coupon });
    if (!couponExist) return next(new AppError(messages.coupon.notFound, 404));
    if (couponExist.fromDate > Date.now() || couponExist.expire < Date.now()) {
      return next(new AppError(messages.coupon.notValid, 404));
    }
  }

  // check cart :
  const cart = await Cart.findOne({ user: req.authUser._id }).populate(
    "products.productId"
  );
  if (!cart) return next(new AppError(messages.cart.notFound, 400));
  const products = cart.products;
  if (products <= 0) {
    return next(new AppError(messages.cart.empty, 404));
  }

  // check product
  let orderProduct = [];
  let orderPrice = 0;
  let finalPrice = 0;
  for (const product of products) {
    const productExist = await Product.findById(product.productId);
    if (!productExist) {
      return next(new AppError(messages.product.notFound, 404));
    }
    if (!productExist.instock(product.quentity)) {
      return next(new AppError(messages.product.outStock, 404));
    }
    orderProduct.push({
      productId: productExist._id,
      title: productExist.title,
      price: productExist.price,
      quentity: product.quentity,
      discount: productExist?.discount,
      final_Price: product.quentity * productExist.finalPrice,
    });
    orderPrice += product.quentity * productExist.finalPrice;
  }

  couponExist.type == couponTypes.FIXED_AMOUNT
    ? (finalPrice = orderPrice - couponExist.discount)
    : (finalPrice =
        orderPrice - (orderPrice * (couponExist?.discount || 0)) / 100);

  const order = new Order({
    user: req.authUser._id,
    products: orderProduct,
    address,
    phone,
    coupon: {
      couponId: couponExist?._id,
      code: couponExist?.code,
      discount: couponExist?.discount,
    },
    status: orderStatus.PLACED,
    payment,
    orderPrice,
    finalPrice,
  });
  //save to dataBase
  const orderCreated = await order.save();
  if (!orderCreated)
    return next(new AppError(messages.order.failToCreate, 500));

  //payment integration gateway
  if (payment === payments.VISA) {
    const lineItems = orderProduct.map((product) => ({
      price_data: {
        currency: "egp",
        product_data: {
          name: product.title,
        },
        unit_amount: product.final_Price * 100,
      },
      quantity: product.quentity,
    }));

    const checkOut = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.SUCCESS_URL}`,
      cancel_url: `${process.env.CANCEL_URL}`,
      metadata: { orderId: orderCreated._id.toString() },
      line_items: lineItems,
    });

    return res.status(201).json({
      message: messages.order.createdSucessfully,
      success: true,
      data: {
        order: orderCreated,
        url: checkOut.url,
      },
    });
  }

  return res.status(201).json({
    message: messages.order.createdSucessfully,
    sucess: true,
    data: orderCreated,
  });
});

export const createCheckoutSession = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  //from order
  let cart = await Cart.findById(id);
  if (!cart) return next(new AppError(messages.cart.notFound, 404));
  let totalCartPrice = cart.totalPrice;
  //from order
  let order = await Order.findById(id);
  if (!order) return next(new AppError(messages.order.notFound, 404));
  let totalOrderPrice = order.finalPrice;

  let session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "egp",
          unit_amount: totalOrderPrice * 100,
          product_data: {
            name: req.authUser.email,
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: "https://www.google.com/",
    cancel_url: "https://www.facebook.com/",
    customer_email: req.authUser.email,
    client_reference_id: req.params.id,
    metadata: req.body.shippingAddress,
  });

  res.status(200).json({ message: "sucess", data: session });
});

// create order from products direct
export const createOrderProduct = catchAsyncError(async (req, res, next) => {
  const { address, phone, coupon, payment, products } = req.body;
  let couponExist;
  if (coupon) {
    couponExist = await Coupon.findOne({ code: coupon });
    if (!couponExist) return next(new AppError(messages.coupon.notFound, 404));
  }

  //check products
  if (!products || products.length === 0) {
    return next(new AppError("No products provided for the order.", 400));
  }

  let orderProducts = [];
  let orderPrice = 0;
  let finalPrice = 0;

  for (const product of products) {
    const productExist = await Product.findById(product.productId);
    if(!productExist) return next(new AppError(messages.product.notFound, 404));
    if (!productExist.instock(product.quentity)){
      return next(new AppError(messages.product.outStock, 404));
    }

    orderProducts.push({
      productId: productExist._id,
      title: productExist.title,
      price: productExist.price,
      quentity: product.quentity,
      discount: productExist?.discount,
      final_Price: product.quentity * productExist.finalPrice,
    });
    orderPrice += product.quentity * productExist.price
  }

  couponExist.type == couponTypes.FIXED_AMOUNT
  ? (finalPrice = orderPrice - couponExist.discount)
  : (finalPrice =
      orderPrice - (orderPrice * (couponExist?.discount || 0)) / 100);

const order = new Order({
  user: req.authUser._id,
  products: orderProducts,
  address,
  phone,
  coupon: {
    couponId: couponExist?._id,
    code: couponExist?.code,
    discount: couponExist?.discount,
  },
  status: orderStatus.PLACED,
  payment,
  orderPrice,
  finalPrice,
});
//save to dataBase
const orderCreated = await order.save();
if (!orderCreated)
  return next(new AppError(messages.order.failToCreate, 500));

  if (payment === payments.VISA) {
    const lineItems = orderProducts.map((product) => ({
      price_data: {
        currency: "egp",
        product_data: {
          name: product.title,
        },
        unit_amount: product.final_Price * 100,
      },
      quantity: product.quentity,
    }));

    const checkOut = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.SUCCESS_URL}`,
      cancel_url: `${process.env.CANCEL_URL}`,
      metadata: { orderId: orderCreated._id.toString() },
      line_items: lineItems,
    });

    return res.status(201).json({
      message: messages.order.createdSucessfully,
      success: true,
      data: {
        order: orderCreated,
        url: checkOut.url,
      },
    });
  }
  return res.status(201).json({
    message: messages.order.createdSucessfully,
    sucess: true,
    data: orderProducts,
  });
});

export const getUserOrders = catchAsyncError(async (req, res, next) => {
  const orders = await Order.find({ user: req.authUser._id });
  if (!orders || orders.length === 0)
    return next(new AppError(messages.order.notFound, 404));

  return res.status(200).json({
    message: messages.order.fetchedSuccessfully,
    success: true,
    data: orders,
  });
});

export const getOrderById = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError(messages.order.notFound, 404));

  return res.status(200).json({
    message: messages.order.fetchedSuccessfully,
    success: true,
    data: order,
  });
});

export const cancelOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: orderStatus.CANCELED },
    { new: true }
  );
  if (!order) return next(new AppError(messages.order.notFound, 404));

  return res.status(200).json({
    message: messages.order.canceledSuccessfully,
    success: true,
    data: order,
  });
});

export const getPaymentStatus = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError(messages.order.notFound, 404));

  const paymentIntent = await stripe.paymentIntents.retrieve(
    order.paymentIntentId
  );
  res.status(200).json({
    message: "Payment status fetched successfully",
    success: true,
    data: paymentIntent.status,
  });
});

//admins & delivary update status of multipli orders
export const bulkUpdateStatus = catchAsyncError(async (req, res, next) => {
  const { orderIds, status } = req.body;
  const result = await Order.updateMany(
    { _id: { $in: orderIds } },
    { $set: { status } }
  );
  if (result.nModified === 0)
    return next(new AppError("No orders updated", 400));

  return res.status(200).json({
    message: "Orders updated successfully",
    success: true,
    data: result,
  });
});

export const getOrderAnalytics = catchAsyncError(async (req, res, next) => {
  const [totalOrders, totalRevenue, averageOrderValue, popularProducts] =
    await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, totalRevenue: { $sum: "$finalPrice" } } },
      ]),
      Order.aggregate([
        { $group: { _id: null, avgOrderValue: { $avg: "$finalPrice" } } },
      ]),
      Order.aggregate([
        { $unwind: "$products" },
        {
          $group: {
            _id: "$products.productId",
            count: { $sum: "$products.quentity" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        { $unwind: "$productDetails" },
        {
          $project: {
            _id: 0,
            productId: "$_id",
            title: "$productDetails.title",
            count: 1,
          },
        },
      ]),
    ]);

  return res.status(200).json({
    message: "Order analytics fetched successfully",
    success: true,
    data: {
      totalOrders,
      totalRevenue: totalRevenue[0]?.totalRevenue || 0,
      averageOrderValue: averageOrderValue[0]?.avgOrderValue || 0,
      popularProducts,
    },
  });
});
