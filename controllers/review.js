const Listing = require("../models/listing");
const Review = require("../models/review");
// No need to import middleware here, they are used in routes.

module.exports.createReview = async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success","New Review Created!");
    res.redirect(`/listings/${listing._id}`);
}

module.exports.deleteReview = async(req,res)=>{
    // Get both listing ID ('id') and review ID ('reviewId') from req.params
    // 'id' comes from the /listings/:id part of the route.
    let { id, reviewId } = req.params; // <-- CRITICAL CHANGE HERE

    // Optional but recommended: A defensive check to ensure the review actually exists
    // (Though isReviewAuthor should ideally handle this, it's good practice)
    let review = await Review.findById(reviewId);
    if (!review) {
        req.flash("error", "Review not found."); // A more specific error message
        return res.redirect(`/listings/${id}`); // Redirect back to the listing page
    }

    // Pull the reviewId from the listing's 'reviews' array
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    
    // Delete the review document itself
    await Review.findByIdAndDelete(reviewId);
    
    req.flash("success","Review deleted!");
    res.redirect(`/listings/${id}`); // Use the listing ID from params for redirect
}