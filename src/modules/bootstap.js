import { dbConnection } from '../../database/dbConnection.js';
import { AppError } from '../utils/catchError.js';
import { globalError } from '../utils/globalError.js';
import * as allRouters from './index.js'
import { scheduleUserCleanup } from "../utils/cleanup-jobs.js";

export const bootstrap = (app) => {
  process.on("uncaughtException", (err) => {
    console.log("ERROR in code: ", err);
  });

  dbConnection();

  scheduleUserCleanup();

  app.use("/api/auth", allRouters.authRouter);
  app.use("/api/admin", allRouters.adminRouter);
  app.use("/api/user", allRouters.userRouter);
  app.use("/api/categories", allRouters.categoryRouter);
  app.use("/api/subcategories", allRouters.subCategoryRouter);
  app.use("/api/products", allRouters.productRouter);
  app.use("/api/brands", allRouters.brnadRouter);
  app.use("/api/reviews", allRouters.reviewRouter);
  app.use("/api/coupons", allRouters.couponRouter);
  app.use("/api/wishlist", allRouters.wishlistRouter);
  app.use("/api/cart", allRouters.cartRouter);
  app.use("/api/orders", allRouters.orderRouter);

  app.use("*", (req, res, next) => {
    next(new AppError(`Route Not Found ${req.originalUrl}`, 404));
  });
  app.use(globalError);

  process.on("unhandledRejection", (err) => {
    console.log("ERROR: ", err);
  });
};
