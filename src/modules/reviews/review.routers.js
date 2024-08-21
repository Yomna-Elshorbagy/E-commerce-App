import { Router } from "express";
import { auth, isAuthorized } from "../../middelwares/auth.js";
import * as reviewController from "./review.controllers.js";
import { validate } from "../../middelwares/validate.js";
import { addReviewVal, updateReviewVal } from "./review.validation.js";
import { roles } from "../../utils/constant/enums.js";

const reviewRouter = Router();
reviewRouter.get('/userReviews', auth ,reviewController.getUserReviews )
reviewRouter.get('/productReviews/:productId', auth ,reviewController.getproductReviews )
reviewRouter.get('/:id', auth ,reviewController.getReviewById )

reviewRouter.post('/addReview', auth,validate(addReviewVal) ,reviewController.addReview )
reviewRouter.put('/updateReview', auth,validate(updateReviewVal) ,reviewController.updateReview )
reviewRouter.delete('/:id', auth,isAuthorized([roles.ADMIN, roles.USER]),reviewController.deletReview )

export default reviewRouter;