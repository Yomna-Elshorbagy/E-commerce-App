import slugify from "slugify";
import Product from "../../../database/models/product.model.js";
import { AppError, catchAsyncError } from "../../utils/catchError.js";
import { messages } from "../../utils/constant/messages.js";
import cloudinary from "../../utils/fileUpload/cloudinary.js";
import { ApiFeature } from "../../utils/file-feature.js";
import { deleteCloud } from "../../utils/fileUpload/file-functions.js";

export const addproduct = catchAsyncError(async (req, res, next) => {
  let {
    title,
    description,
    imageCover,
    subImages = [],
    price,
    discount,
    stock,
    category,
    subcategory,
    brand,
    size,
    colors,
  } = req.body;

  // uplods
  let failImages = [];
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.files.imageCover[0].path,
    { folder: "e-commerce/product/imageCover" }
  );
  failImages.push(public_id);
  imageCover = { secure_url, public_id };

  for (const file of req.files.subImages) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      { folder: "e-commerce/product/subImages" }
    );
    subImages.push({ secure_url, public_id });
    failImages.push(public_id);
  }
  // add to database
  let newProduct = new Product({
    title,
    description,
    imageCover, //[{}]
    subImages, //[{},{} ]
    // imageCover: req.files.imageCover[0].path,
    // images: req.files.images.map(img => img.path),
    price,
    discount,
    stock,
    category,
    subcategory,
    brand,
    size: size ? JSON.parse(size) : [],
    colors: colors ? JSON.parse(colors) : [],
    createdBy: req.authUser._id,
  });
  const createdPro = await newProduct.save();

  if (!createdPro) {
    req.failImages = public_id;
    return next(new AppError(messages.product.failToCreate, 500));
  }
  res.status(201).json({
    message: messages.product.createdSucessfully,
    sucess: true,
    data: newProduct,
  });
});

export const getAllproducts = catchAsyncError(async (req, res, next) => {
  let Products = await Product.find();
  res.status(200).json({ message: "Products are : ", Products });
});

export const getSpeificproduct = catchAsyncError(async (req, res, next) => {
  let { id } = req.params;
  let product = await Product.findById(id);
  if (!product) return next(new AppError(messages.product.notFound, 404));
  res.status(200).json({ message: "Product is : ", data: product });
});

export const updateproduct = catchAsyncError(async (req, res, next) => {
  let { id } = req.params;
  let { title, imageCover, subImages } = req.body;
  const productExsist = await Product.findById(id);
  if (!productExsist) return next(new AppError(messages.product.notFound, 404));
  if (req.body.slug) req.body.slug = slugify(title, { lower: true });
  if (imageCover) imageCover = req.files.imageCover[0].path;
  if (subImages) subImages = req.files.subImages.map((img) => img.path);
  let updateProduct = await Product.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if (!updateProduct) next(new AppError(messages.product.notFound, 404));
  res.status(200).json({
    message: messages.product.updatedSucessfully,
    data: updateProduct,
  });
});

export const updateproductCloud = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let { title, description, price, discount, stock, category, subcategory, brand, size, colors,
  } = req.body;

  let product = await Product.findById(id);
  if (!product) return next(new AppError(messages.product.notFound, 404));

  let failImages = [];

  if (req.files && req.files.imageCover) {
    deleteCloud(public_id);
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.files.imageCover[0].path,
      { folder: "e-commerce/product/imageCover" }
    );
    failImages.push(public_id);
    product.imageCover = { secure_url, public_id };
    await deleteCloud(product.imageCover.public_id);
  }

  if (req.files && req.files.subImages) {
    product.subImages = [];
    for (const file of req.files.subImages) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        { folder: "e-commerce/product/subImages" }
      );
      product.subImages.push({ secure_url, public_id });
      failImages.push(public_id);
    }
    for (const publicId of oldSubImagesPublicIds) {
      await deleteCloud(publicId);
    }
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    { title, description, imageCover, subImages, price, discount, stock, category, subcategory, brand,
      size: size ? JSON.parse(size) : [],
      colors: colors ? JSON.parse(colors) : [],
      updatedBy: req.authUser._id,
    },
    { new: true }
  );
  if (!updatedProduct) {
    req.failImages = failImages;  
    return next(new AppError(messages.product.failToUpdate, 500));
  }

  res.status(200).json({
    message: messages.product.updatedSucessfully,
    data: updatedProduct,
  });
});

export const deleteproduct = catchAsyncError(async (req, res, next) => {
  let { id } = req.params;
  const product = await Product.findById(id);
  if (!product) return next(new AppError(messages.product.notFound, 404));

  //delete images
  await cloudinary.uploader.destroy(product.imageCover.public_id);
  for (const image of product.subImages) {
    await cloudinary.uploader.destroy(image.public_id);
  }

  let deleteProduct = await Product.findByIdAndDelete(id);
  if (!deleteProduct)
    return next(new AppError(messages.product.failToUpdate, 500));
  res.status(200).json({
    message: messages.product.deletedSucessfully,
    sucess: true,
    data: deleteProduct,
  });
});

// paginate *select *sort *filter
// export const getproductsfilter = catchAsyncError(async (req, res, next) =>{
//     let { page , size , sort , select , ...filter } = req.query;
//     // let filter = {...req.query }
//     // let execlude = ['page', 'size', 'sort', 'select']
//     // execlude.forEach((elem)=>{
//     //     delete filter[elem]
//     // })

//     //filter greterthan ...
//     filter = JSON.parse(JSON.stringify(filter).replace(/gt|gte|lt|lte/g, match => `$${match}`))
//     sort = sort?.replaceAll(',',' ')
//     select = select?.replaceAll(',',' ')
//     //for paginate : need pages - size - skip
//     page = parseInt(page) || 1;
//     size = parseInt(size) || 10;
//     if (page <=0) page=1;
//     if (size <=0) size=2;
//     let skip = (page - 1) * size;
//     let products = await Product.find(filter).skip(skip).limit(size).sort(sort).select( select );
//     res.status(200).json({message: "Products are : ",sucess:true, data: products})
// })

// api feature
export const getproducts = catchAsyncError(async (req, res, next) => {
  const apiFeature = new ApiFeature(Product.find(), req.query)
    .pagination()
    .sort()
    .select()
    .filter();
  console.log("Query:", req.query);
  console.log("Mongoose Query:", apiFeature.mongooseQuery.getQuery());
  console.log("Mongoose Options:", apiFeature.mongooseQuery.getOptions());
  const products = await apiFeature.mongooseQuery;
  console.log("Products:", products);
  return res.json({
    message: messages.coupon.fetchedSuccessfully,
    sucess: true,
    data: products,
  });
});
