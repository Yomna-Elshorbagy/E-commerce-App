import Category from "../../../database/models/category.model.js";
import Product from "../../../database/models/product.model.js";
import SubCategory from "../../../database/models/subcategory.model.js";
import { AppError, catchAsyncError } from "../../utils/catchError.js";
import { messages } from "../../utils/constant/messages.js";
import { ApiFeature } from "../../utils/file-feature.js";
import { deleteFile } from "../../utils/fileUpload/file-functions.js";
import cloudinary from "../../utils/fileUpload/cloudinary.js";

export const addCategory = catchAsyncError(async (req, res, next) => {
  let { name } = req.body; //distruct from req
  name = name.toLowerCase(); //toLowerCase
  //check file:
  if (!req.file) {
    return next(new AppError(messages.file.required, 400));
  }
  //check existance:
  const catExist = await Category.findOne({ name }); //{}, null
  if (catExist) {
    return next(new AppError(messages.category.alreadyExisist, 409));
  }
  //prepare data
  const category = new Category({
    name,
    image: { path: req.file.path },
    createdBy: req.authUser._id,
  });
  //sending to database
  const newCate = await category.save(); //{} null
  if (!newCate) {
    return next(new AppError(messages.category.failToCreate, 500));
  }
  res.status(201).json({
    message: messages.category.createdSucessfully,
    sucess: true,
    data: newCate,
  });
});

export const updateCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  // check category exisist
  const categoryExisist = await Category.findById(id);
  if (!categoryExisist) return next(new AppError(messages.category.notFound, 404));
  // check name exisit
  const nameExisist = await Category.findOne({name , _id :{$ne: id} })
  if (nameExisist) return next(new AppError(messages.category.alreadyExisist, 404));

  //prepare data
  if (name) {
    categoryExisist.name = name
  }
  //update image
  if (req.file) {
    deleteFile(categoryExisist.image.path )
    categoryExisist.markModified('image')
    categoryExisist.image = { path: req.file.path }
  };
  //prepare to db:
  let updateCategory = await categoryExisist.save();

  if (!updateCategory) return next(new AppError(messages.category.failToUpdate, 500));
  return res.status(200).json({ 
        message: messages.category.updatedSucessfully, 
        sucess: true ,
        data: updateCategory 
      });
});

export const deleteCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let categoryExisist = await Category.findById(id);
  if (!categoryExisist) return next(new AppError(messages.category.notFound, 404));

  //delete subcategory
  const subcategoriesDeleted = await SubCategory.deleteMany({ category: id });
  if (subcategoriesDeleted.deletedCount === 0) {
    console.warn(`No subcategories found for category with id ${id}`);
  } 
  //delete image file
  if (categoryExisist.image && categoryExisist.image.path) {
    deleteFile(categoryExisist.image.path);
  }
  //delete products with images
  const productsToDeleted = await Product.find({ category: id}).select('images imageCover')
  const productIds = productsToDeleted.map(prod => prod.i_id)
  await Product.deleteMany({_id: {$in: productIds}}) 
  //todo delete images

  //delete category
  const deleteCategory = await categoryExisist.deleteOne();
  deleteCategory || next(new AppError(messages.category.notFound, 404));

  !deleteCategory ||
    res
      .status(200)
      .json({ 
        message: messages.category.deletedSucessfully, 
        sucess: true ,
        data: deleteCategory 
      });
});

export const getAllCategories = catchAsyncError(async (req, res, next) => {
  const categories = await Category.find().populate([{path: 'subcategories'}]);
  // const categories = await Category.aggregate([ //with mongodb aggregate
  //   {
  //     $lookup:{
  //       from: 'subcategories',
  //       localField: '_id',
  //       foreignField: 'category',
  //       as: 'subcategories'
  //     }
  //   }
  // ]);

  res.status(200).json({ message: "Categories are : ", data: categories });
});

export const getSpeificCategory = catchAsyncError(async (req, res, next) => {
  let { id } = req.params;
  let category = await Category.findById(id);
  category || next(new AppError(messages.category.notFound, 404));
  !category || res.status(200).json({ message: "Category is : ", data: category });
});

export const getCategories = catchAsyncError(async (req, res, next) =>{
  const apiFeature = new ApiFeature(Category.find(), req.query).pagination().sort().select().filter()
  const category = await apiFeature.mongooseQuery
  return res.json({sucess: true, data: category})
});

export const addCategoryCloud = catchAsyncError(async (req, res, next) => {
  let { name } = req.body; //distruct from req
  name = name.toLowerCase(); //toLowerCase
  //check file:
  if (!req.file) {
    return next(new AppError(messages.file.required, 400));
  }
  //check existance:
  const catExist = await Category.findOne({ name }); //{}, null
  if (catExist) {
    return next(new AppError(messages.category.alreadyExisist, 409));
  }
  //prepare data
  const {secure_url, public_id} = await cloudinary.uploader.upload(req.file.path,{
    folder: "e-commerce/category"
});
  const category = new Category({
    name,
    image: {secure_url, public_id},
    createdBy: req.authUser._id,
  });
  //sending to database
  const newCate = await category.save(); //{} null
  if (!newCate) {
    await cloudinary.uploader.destroy(public_id); 
    return next(new AppError(messages.category.failToCreate, 500));
  }
  res.status(201).json({
    message: messages.category.createdSucessfully,
    sucess: true,
    data: newCate,
  });
});

export const deleteCategoryCloud = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let categoryExisist = await Category.findByIdAndDelete(id);
  if (!categoryExisist) return next(new AppError(messages.category.notFound, 404));

  //prepare ids
  const subcategories = await SubCategory.find({ category: id }).select('image');
  const products = await Product.find({ category: id }).select('imageCover subImages');
  const imagePaths =[]
  const subcategoriyIds = []
    subcategories.forEach(sub => {
    imagePaths.push(prod.imageCover)
    subcategoriyIds.push(sub._id) 
  })
  const productIds = []
    products.forEach(prod => {
    imagePaths.push(prod.imageCover)
    imagePaths.push(...prod.subImages)
    productIds.push(prod._id)
  })
  await SubCategory.deleteMany({_id: {$in: subcategoriyIds}}) 
  await Product.deleteMany({_id: {$in: productIds}}) 

  for(let i =0 ; i< imagePaths.length ; i++){
    if (typeof(imagePaths[i] === "string")){
      deleteFile(imagePaths)
    }else{
      await cloudinary.uploader.destroy(imagePaths[i].puplic_id)
    }
  }

    res.status(200).json({ 
        message: messages.category.deletedSucessfully, 
        sucess: true ,
        data: deleteCategory 
      });
});

export const updateCategoryCloud = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  // check category exisist
  const categoryExisist = await Category.findById(id);
  if (!categoryExisist) return next(new AppError(messages.category.notFound, 404));
  // check name exisit
  const nameExisist = await Category.findOne({name , _id :{$ne: id} })
  if (nameExisist) return next(new AppError(messages.category.alreadyExisist, 404));

  //prepare data
  if (name) {
    categoryExisist.name = name
  }
  //update image
  if (req.file) {
    //replace by override
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {public_id: categoryExisist.image.public_id})
    categoryExisist.image = { secure_url, public_id}
  };

  let updateCategory = await categoryExisist.save();
  if (!updateCategory) {
    if (req.file) {
      await cloudinary.uploader.destroy(categoryExisist.image.public_id);
    }
    return next(new AppError(messages.category.failToUpdate, 500));
  }
  return res.status(200).json({ 
        message: messages.category.updatedSucessfully, 
        sucess: true ,
        data: updateCategory 
      });
});