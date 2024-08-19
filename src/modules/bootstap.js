import { json } from 'express';
import cors from "cors";
import { dbConnection } from '../../database/dbConnection.js';
import { AppError } from '../utils/catchError.js';
import { globalError } from '../utils/globalError.js';

export const bootstrap = (app) => {
  process.on("uncaughtException", (err) => {
    console.log("ERROR in code: ", err);
  });

  app.use(json());
  app.use(cors());
  dbConnection();

  
  app.use("*", (req, res, next) => {
    next(new AppError(`Route Not Found ${req.originalUrl}`, 404));
  });
  app.use(globalError);

  process.on("unhandledRejection", (err) => {
    console.log("ERROR: ", err);
  });
};
