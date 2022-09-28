const Review = require('../models/review');
const Campground = require('../models/campground');

module.exports.createReviews = async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    review.author = req.user._id;
    await review.save();
    await campground.save();
    req.flash('success','succesfully created a review');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReviews = async(req,res)=>{
    const {id,reviewId} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {$pull : {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','succesfully deleted a review');
    res.redirect(`/campgrounds/${id}`);
};