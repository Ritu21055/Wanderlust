const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapasync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require("multer"); // Import multer
const { storage } = require("../cloudConfig.js"); // Import your Cloudinary storage
const upload = multer({ storage }); // Configure multer with your storage

// --- ROUTE FOR ALL LISTINGS (INDEX) AND CREATING A NEW LISTING ---
router.route("/")
    // GET: Display all listings
    .get(wrapAsync(listingController.index))
    // POST: Create a new listing
    .post(
        isLoggedIn, // Check if user is logged in
        upload.single("listing[image]"), // Multer middleware to process the image upload
        // Custom middleware to attach Cloudinary image data to req.body.listing
        (req, res, next) => {
            // Optional: console.log for debugging, remove in production
            console.log(req.body);
            console.log("--- routes/listing.js: Image Processing Middleware ---");
            console.log("req.file (from Multer):", req.file);

            if (!req.file) {
                // If no file was uploaded, flash an error and redirect
                req.flash("error", "Please upload an image for the listing.");
                return res.redirect("/listings/new");
            }
            // Attach the Cloudinary URL and filename to the listing object
            req.body.listing.image = {
                url: req.file.path, // Cloudinary provides the full URL here
                filename: req.file.filename // Cloudinary provides a unique filename/ID
            };
            console.log("req.body.listing.image after processing:", req.body.listing.image);
            next(); // Pass control to the next middleware (validateListing)
        },
        validateListing, // Validate the entire listing data (now includes image)
        wrapAsync(listingController.createListing) // Call the controller to save
    );

// --- ROUTE FOR RENDERING NEW LISTING FORM ---
// This route must come BEFORE /:id routes to avoid "/new" being treated as an ID
router.get("/new", isLoggedIn, listingController.renderNewForm);

// --- ROUTES FOR A SPECIFIC LISTING (SHOW, UPDATE, DELETE) ---
router.route("/:id")
    // GET: Display a single listing
    .get(wrapAsync(listingController.showListing))
    // PUT: Update a specific listing
    .put(
        isLoggedIn,
        isOwner,
        upload.single("listing[image]"), // Allow image update
        (req, res, next) => {
            // If a new file was uploaded during an update, update the image field
            if (req.file) {
                req.body.listing.image = {
                    url: req.file.path,
                    filename: req.file.filename
                };
                // Optional: You might want to delete the old image from Cloudinary here
                // if (!req.body.listing.image.url && !req.file) {
                //     // If no image provided at all, maybe set a default or handle validation
                // }
            }
            next();
        },
        validateListing, // Validate updated listing data
        wrapAsync(listingController.updateListing)
    )
    // DELETE: Delete a specific listing
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

// --- ROUTE FOR RENDERING EDIT LISTING FORM ---
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditListing));

module.exports = router;

