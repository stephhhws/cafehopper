const Cafe = require("../models/cafe");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
    const cafe = await Cafe.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    cafe.reviews.push(review);
    await review.save();
    await cafe.save();
    req.flash("success", "Great! A new review created!")
    res.redirect(`/cafes/${cafe._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId  } = req.params;
    // pull: removes an existing array all instances of a value or values that match a specified condition
    await Cafe.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted the review!")
    res.redirect(`/cafes/${id}`);
}