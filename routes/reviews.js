const express = require("express");
//?? as the id is defined in the cafe routes, we have to merge it before we can access the id here
const router = express.Router({mergeParams: true}); 
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware")
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Cafe = require("../models/cafe"); // Cafe represents the "Cafe" model, which is defined in the file located at "./models/cafe"
const Review = require("../models/review");
const reviews = require("../controllers/reviews");


router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;