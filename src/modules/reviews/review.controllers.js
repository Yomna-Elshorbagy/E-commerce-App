// import { Product, Review } from "../../../database/index.js";
import Product from "../../../database/models/product.model.js";
import Review from "../../../database/models/review.model.js";
import { AppError, catchAsyncError } from "../../utils/catchError.js";
import { roles } from "../../utils/constant/enums.js";
import { messages } from "../../utils/constant/messages.js";

//adding review
export const addReview = catchAsyncError(async (req, res, next) => {
  //extract data
  const { comment, rate, product } = req.body;

  //check existnce:
  const productExist = await Product.findById(product);
  if (!productExist) return next(new AppError(messages.product.notFound, 404));
  //todo check has order
  const reviewExist = await Review.findOneAndUpdate(
    { user: req.authUser._id, product: product },
    { comment, rate },
    { new: true }
  );
  // let avgRating = 0;
  if (!reviewExist) {
    const review = new Review({
      comment,
      rate,
      product,
      user: req.authUser._id,
    });

    const createdReview = await review.save();
    if (!createdReview)
      return next(new AppError(messages.review.failToCreate, 500));
  }
  const rating = await Review.find({ product }).select("rate");
  let avgRating = rating.reduce((accumulator, current) => {
    return accumulator + current.rate;
  }, 0);
  avgRating = avgRating / rating.length;
  await Product.findOneAndUpdate(
    { _id: product },
    {
      rate: avgRating,
    },
    { new: true }
  );

  res.status(201).json({
    message: reviewExist
      ? messages.review.updatedSucessfully
      : messages.review.createdSucessfully,
    sucess: true,
    data: { avgRating, rate },
  });
});

//get all user reviews
export const getUserReviews = catchAsyncError(async (req, res, next) => {
  const reviews = await Review.find({ user: req.authUser._id }).populate(
    "product",
    "title price discount"
  );
  res.status(200).json({ success: true, data: reviews });
});

//get all product reviews
export const getproductReviews = catchAsyncError(async (req, res, next) => {
  const { productId } = req.params;
  const productExist = await Product.findById(productId);
  if (!productExist) return next(new AppError(messages.product.notFound, 404));

  const reviews = await Review.find({ product: productId })
    .populate("user", "userName")
    .populate({
      path: "product",
      select: "title",
      options: { lean: true },
    });

  res.status(200).json({ success: true, data: reviews });
});

//get single review
export const getReviewById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const review = await Review.findById(id).populate("user", "userName");
  if (!review) return next(new AppError(messages.review.notFound, 404));
  res.status(200).json({ success: true, data: review });
});

//delete review and recalculate avgRate
export const deletReview = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const reviewExist = await Review.findById(id);
  if (!reviewExist) return next(new AppError(messages.review.notFound, 404));
  if (
    req.authUser._id.toString() != reviewExist.user.toString() &&
    req.authUser.role != roles.ADMIN
  ) {
    return next(new AppError(messages.user.notAllowed, 401));
  }
  const productId = reviewExist.product;
  await Review.deleteOne({ _id: id });
  // delete the rate from avg
  const ratings = await Review.find({ product: id }).select("rate");
  let avgRating =
    ratings.length > 0
      ? ratings.reduce(
          (accumulator, current) => accumulator + current.rate,
          0
        ) / ratings.length
      : 0;
  await Product.findByIdAndUpdate(
    productId,
    { rate: avgRating },
    { new: true }
  );

  res
    .status(200)
    .json({ message: messages.review.deletedSucessfully, sucess: true });
});

export const updateReview = catchAsyncError(async (req, res, next)=>{
  const { comment, rate, product } = req.body;
    //check existnce:
    const productExist = await Product.findById(product);
    if (!productExist) return next(new AppError(messages.product.notFound, 404));
    //todo check has order
    const reviewExist = await Review.findOneAndUpdate(
      { user: req.authUser._id, product: product },
      { comment, rate },
      { new: true }
    );
    const rating = await Review.find({ product }).select("rate");
    let avgRating = rating.reduce((accumulator, current) => {
      return accumulator + current.rate;
    }, 0);
    avgRating = avgRating / rating.length;
    await Product.findOneAndUpdate(
      { _id: product },
      {
        rate: avgRating,
      },
      { new: true }
    );
    res.status(201).json({
      message: messages.review.updatedSucessfully,
      sucess: true,
      data: { avgRating, rate },
    });
});