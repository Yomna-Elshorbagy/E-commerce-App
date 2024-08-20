import Brand from "../../../database/models/brand.model.js";
import { AppError, catchAsyncError } from "../../utils/catchError.js";
import { messages } from "../../utils/constant/messages.js";
import { ApiFeature } from "../../utils/file-feature.js";
import { deleteFile } from "../../utils/fileUpload/file-functions.js";
import cloudinary from "../../utils/fileUpload/cloudinary.js";

export const addBrand = catchAsyncError(async (req, res, next) => {
  let { name } = req.body;
  name = name.toLowerCase();

  if (!req.file) {
    return next(new AppError(messages.file.required, 400));
  }
  const brandExisist = await Brand.findOne({ name });
  if (brandExisist) return next(new AppError(messages.brand.alreadyExisist, 409));

  //prepare data:
  const {secure_url, public_id} = await cloudinary.uploader.upload(req.file.path,{
    folder: 'e-commerce/brand'
  });

  let brand = new Brand({
    name,
    logo: {secure_url, public_id},
    // logo: { path: req.file.path },
    // createdBy: req.user.userId, todo
  });
  const newBrand = await brand.save();
  if (!newBrand) {
    await cloudinary.uploader.destroy(public_id); //delete the uploaded image
    return next(new AppError(messages.brand.failToCreate, 500));
  }
  res.status(201).json({
      message: messages.brand.createdSucessfully,
      sucess: true,
      data: newBrand,
    });
});

export const getAllBrands = catchAsyncError(async (req, res, next) => {
  let Brands = await Brand.find();
  res.status(200).json({ message: "Brands are : ", data: Brands });
});

export const getSpeificBrand = catchAsyncError(async (req, res, next) => {
  let { id } = req.params;
  let brand = await Brand.findById(id);
  brand || next(new AppError("Brand Not Found", 404));
  !brand || res.status(200).json({ message: "Brand is : ", data: brand });
});

export const updateBrand = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let { name } = req.body;
  name = name.toLowerCase();

  const existingBrand = await Brand.findById(id);
  if (!existingBrand) return next(new AppError(messages.brand.notFound, 404));

  if (name) {
    const nameExisist = await Brand.findOne({name , _id :{$ne: id} })
    if (nameExisist) return next(new AppError(messages.brand.alreadyExisist, 409));

    existingBrand.name = name
  }
  if (req.file) {
    // await cloudinary.uploader.destroy(existingBrand.logo.public_id); 
    const {secure_url, public_id} = await cloudinary.uploader.upload(req.file.path,{
      public_id :existingBrand.logo.public_id //overriding the existing image
    });
    existingBrand.logo = {secure_url, public_id}
    // if using filesystem: 
    // deleteFile(existingBrand.logo.path )
    // existingBrand.logo = { path: req.file.path }
  };
  let updateBrand = await existingBrand.save();

  if (!updateBrand){
    if (req.file) {
      await cloudinary.uploader.destroy(existingBrand.logo.public_id);
    };
    return next(new AppError(messages.brand.notFound, 404));
  }
    return res.status(200).json({ message: messages.brand.updatedSucessfully, sucess: true, data:updateBrand });
});

export const deleteBrand = catchAsyncError(async (req, res, next) => {
  let { id } = req.params;
  const existingBrand = await Brand.findById(id);
  if (!existingBrand) return next(new AppError(messages.brand.notFound, 404));

  let deleteBrand = await existingBrand.deleteOne();
  if(existingBrand.logo && existingBrand.logo.public_id){
    // deleteFile(existingBrand.logo.path )
    await cloudinary.uploader.destroy(existingBrand.logo.public_id);
  }

  deleteBrand || next(new AppError(messages.brand.notFound, 404));
  !deleteBrand ||
    res.status(200).json({ 
      message: messages.brand.deletedSucessfully , 
      sucess:true , 
      data: deleteBrand 
    });
});

export const getBrands = catchAsyncError(async (req, res, next) =>{
  const apiFeature = new ApiFeature(Brand.find(), req.query).pagination().sort().select().filter()
  const brands = await apiFeature.mongooseQuery
  return res.json({sucess: true, data: brands})
})
