import mongoose from "mongoose";
import { AppError } from "../utils/catchError.js";
import Category from "../../database/models/category.model.js";
import Brand from "../../database/models/brand.model.js";
import SubCategory from "../../database/models/subcategory.model.js";
import { messages } from "../utils/constant/messages.js";

export const checkCategoryId = async (req, res, next) => {
  let { category } = req.body;
  const categoryExists = await Category.findById(category);
  if (!categoryExists) return next(new AppError(messages.category.notFound, 404));
  next();
};

export const checkSubCatId = async (req, res, next) => {
  let { subcategory } = req.body;
  const subcategoryExists = await SubCategory.findById(subcategory);
  if (!subcategoryExists) return next(new AppError(messages.subcategory.notFound, 404));
  next();
};

export const checkBrandtId = async (req, res, next) => {
  let { brand } = req.body;
  const brandExists = await Brand.findById(brand);
  if (!brandExists) return next(new AppError(messages.brand.notFound, 404));
  next();
};

export const checkProId = async (req, res, next) => {
  let { category, brand, subcategory } = req.body;

  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    return next(new AppError(messages.category.notFound, 404));
  }
  const subcategoryExists = await SubCategory.findById(subcategory);
  if (!subcategoryExists)
    return next(new AppError(messages.subcategory.notFound, 404));

  const bbrandExists = await Brand.findById(brand);
  if (!bbrandExists) return next(new AppError(messages.brand.notFound, 404));

  next();
};
