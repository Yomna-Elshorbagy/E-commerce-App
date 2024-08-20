import slugify from "slugify";
import { AppError, catchAsyncError } from "../../utils/catchError.js";
import SubCategory from "../../../database/models/subcategory.model.js";
import { messages } from "../../utils/constant/messages.js";
import { ApiFeature } from "../../utils/file-feature.js";
import Category from "../../../database/models/category.model.js";
import cloudinary from "../../utils/fileUpload/cloudinary.js";

export const addsubcategory = catchAsyncError(async (req, res, next) => {
  let { name, category } = req.body;
  name = name.toLowerCase();
  const categoryExists = await Category.findById(category);
  if (!categoryExists) return next(new AppError(messages.category.notFound, 404));

  const nameExists = await SubCategory.findOne({ name, category });
  if (nameExists)
    return next(new AppError(messages.subcategory.alreadyExisist, 409));

  if (!req.file) {
    return next(new AppError(messages.file.required, 400));
  }
  const newSubCate = new SubCategory({
    name,
    image: { path: req.file.path },
    category,
    createdBy: req.authUser._id,
  });
  if (!newSubCate) {
    return next(new AppError(messages.subcategory.failToCreate, 500));
  }
  await newSubCate.save();
  res.status(201).json({
    message: messages.subcategory.createdSucessfully,
    sucess: true,
    data: newSubCate,
  });
});

export const getAllSubcategories = catchAsyncError(async (req, res, next) => {
  const { categoryId } = req.params
  let subCategories = await SubCategory.find({category :categoryId}).populate('category');
  res
    .status(200)
    .json({
      message: "SubCategories are : ",
      sucess: true,
      data: subCategories,
    });
});

export const getSpeificSubcategory = catchAsyncError(async (req, res, next) => {
  let { id } = req.params;
  let subCategory = await SubCategory.findById(id);
  subCategory || next(new AppError("SubCategory Not Found", 404));
  !subCategory ||
    res
      .status(200)
      .json({ message: "SubCategory is : ", sucess: true, data: subCategory });
});

export const getSubcategories = catchAsyncError(async (req, res, next) => {
  const { categoryId } = req.params;
  let subCategory = await SubCategory.find({ category: categoryId }).populate([
    { path: "category" },
  ]);
  res.status(200).json({ sucess: true, date: subCategory });
});

export const updateSubcategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { name , category,  } = req.body;

  const subCatExisit = await SubCategory.findById(id)
  if(!subCatExisit) return next (new AppError(messages.subcategory.notFound, 404))
    
  if(category){
    const categoryExists = await Category.findById(category);
    if (!categoryExists) return next(new AppError(messages.category.notFound, 404));
  }
  if (name) {
    req.body.slug = slugify(name, { lower: true });
  }
  if (req.file) {
    const {secure_url, public_id} = await cloudinary.uploader.upload(req.file.path,{
      public_id :subCatExisit.image.public_id //overriding the existing image
    });
    subCatExisit.image = {secure_url, public_id}
  }
  let updateSubCategory = await SubCategory.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if(!updateSubCategory) return next(new AppError(messages.subcategory.failToUpdate, 500));
    res.status(200).json({
      message: messages.subcategory.updatedSucessfully,
      sucess: true,
      data: updateSubCategory,
    });
});

export const deleteSubcategory = catchAsyncError(async (req, res, next) => {
  let { id } = req.params;
  const subcategoryExisit = await SubCategory.findById(id);
  if (!subcategoryExisit) return next(new AppError(messages.brand.notFound, 404));

  let deleteSubcategory = await SubCategory.findByIdAndDelete(id);
  if(subcategoryExisit.image && subcategoryExisit.image.public_id){
    // deleteFile(subcategoryExisit.image.path )
    await cloudinary.uploader.destroy(subcategoryExisit.image.public_id);
  }
  if(!deleteSubcategory) return next(new AppError(messages.subcategory.failToDelete, 500));

    res.status(200).json({
        message: messages.subcategory.deletedSucessfully,
        sucess: true,
        data: deleteSubCategory,
      });
});

export const getSubcategory = catchAsyncError(async (req, res, next) =>{
  const apiFeature = new ApiFeature(SubCategory.find(), req.query).pagination().sort().select().filter()
  const subcategory = await apiFeature.mongooseQuery
  return res.json({sucess: true, data: subcategory})
});

export const addsubcategoryCloud = catchAsyncError(async (req, res, next) => {
  let { name, category } = req.body;
  name = name.toLowerCase();
  const categoryExists = await Category.findById(category);
  if (!categoryExists) return next(new AppError(messages.category.notFound, 404));

  const nameExists = await SubCategory.findOne({ name, category });
  if (nameExists)
    return next(new AppError(messages.subcategory.alreadyExisist, 409));

  if (!req.file) {
    return next(new AppError(messages.file.required, 400));
  }
  const {secure_url, public_id} = await cloudinary.uploader.upload(req.file.path,{
    folder: "e-commerce/subcategories"
});
  const newSubCate = new SubCategory({
    name,
    image: {secure_url, public_id},
    category,
    createdBy: req.authUser._id,
  });
  await newSubCate.save();

  if (!newSubCate) {
    await cloudinary.uploader.destroy(public_id); 
    return next(new AppError(messages.subcategory.failToCreate, 500));
  }
  res.status(201).json({
    message: messages.subcategory.createdSucessfully,
    sucess: true,
    data: newSubCate,
  });
});
