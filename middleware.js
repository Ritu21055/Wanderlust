const Listing = require("./models/listing"); // Assuming your models are in a 'models' folder relative to middleware.js
const Review = require("./models/review"); 
const ExpressError = require("./utils/ExpressError");
const { listingSchema, reviewSchema } = require("./schema.js"); // Import Joi schemas

// Middleware to check if the user is authenticated
module.exports.isLoggedIn = (req, res, next) => {
    // console.log("REQ.USER:", req.user); // Debugging current user
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl; // Save the URL they were trying to access
        req.flash("error", "You must be logged in to create a listing!");
        return res.redirect("/login"); // Crucial: use 'return' to stop execution
    }
    next();
};

// Middleware to save the redirect URL after login
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

// Middleware to check if the current user is the owner of the listing
module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "You are not the owner of this listing.");
        return res.redirect(`/listings/${id}`); // Crucial: use 'return' to stop execution
    }
    next();
};

// In middleware.js
module.exports.isReviewAuthor = async (req, res, next) => {
    let { reviewId } = req.params;

    try {
        let review = await Review.findById(reviewId);

        if (!review) {
            req.flash("error", "Review not found.");
            return res.redirect("/listings");
        }

        if (!review.author.equals(req.user._id)) {
            req.flash("error", "You are not the author of this review.");
            return res.redirect(`/listings/${review.listing}`);
        }

        next();
    } catch (err) {
        // --- ADD THIS LINE ---
        console.error("ERROR IN ISREVIEWAUTHOR MIDDLEWARE:", err); 
        // --- END ADDED LINE ---
        req.flash("error", "Something went wrong.");
        return res.redirect("/listings");
    }
};


// Middleware to validate listing data using Joi
module.exports.validateListing = (req, res, next) => {
    // --- START NEW DEBUG CONSOLE LOGS (KEEP THESE FOR NOW) ---
    console.log("-----------------------------------------");
    console.log("--- Inside validateListing middleware ---");
    console.log("req.body received by validateListing:", req.body);
    console.log("req.body.listing received by validateListing:", req.body.listing);
    console.log("-----------------------------------------");
    // --- END NEW DEBUG CONSOLE LOGS ---

    // Validate req.body, as your Joi schema has 'listing' as the top-level key
    const { error } = listingSchema.validate(req.body);

    if (error) {
        // --- START NEW DEBUG CONSOLE LOG FOR ERROR DETAILS (KEEP THESE FOR NOW) ---
        console.error("!!!! Joi Validation Error Detected !!!!");
        console.error("Full Joi Error Object:", error); // Log the entire error object
        console.error("Joi Validation Error Details Array:", error.details); // Specifically the details array
        console.error("-----------------------------------------");
        // --- END NEW DEBUG CONSOLE LOG FOR ERROR DETAILS ---

        // Extract and join error messages for flashing
        let errMsg = error.details.map((el) => el.message).join(", ");
        req.flash("error", errMsg);
        return res.redirect("/listings/new"); // Crucial: use 'return' to stop execution
    } else {
        console.log("Joi validation PASSED for listing."); // Debugging success
        next();
    }
};

// Middleware to validate review data using Joi
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);

    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg); // For review errors, you might throw or redirect
    } else {
        next();
    }
};