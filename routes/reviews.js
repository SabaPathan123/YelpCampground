const express = require('express');
const router = express.Router({mergeParams : true});
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const reviews = require('../controllers/reviews');
const { isLoggedIn,validateReview,isReviewAuthor } = require('../middleware');


router.post('/',isLoggedIn,validateReview,catchAsync(reviews.createReviews));

router.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(reviews.deleteReviews));

module.exports = router;