const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapasync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js"); 
const {validateReview, isLoggedIn,isReviewAuthor} = require("../middleware.js");

const reviewController = require("../controllers/review.js");
console.log("Value of reviewController in routes/review.js:", reviewController);
// --- END DEBUG LINE ---


//Reviews 
//Post Review route
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));

console.log("isLoggedIn:", isLoggedIn);
console.log("isReviewAuthor:", isReviewAuthor);
console.log("wrapAsync:", wrapAsync);
console.log("reviewController.deleteReview:", reviewController.deleteReview);



// Delete Review Route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.deleteReview));

module.exports = router;
