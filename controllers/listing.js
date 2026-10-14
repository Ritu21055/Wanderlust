const Listing = require("../models/listing");
// If you have a Cloudinary config in a utility for deletion, import it here
 const cloudinary = require("../cloudConfig.js"); // Assuming you export cloudinary instance from cloudConfig

// --- INDEX - Display all listings ---
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

// --- RENDER NEW FORM - Show form to create a new listing ---
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// --- SHOW LISTING - Display a single listing ---
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author", // Populate the author of each review
            },
        })
        .populate("owner"); // Populate the owner of the listing

    // If listing not found, flash error and redirect
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings"); // Use return to stop execution
    }
    console.log(listing); // Optional: for debugging, remove in production
    res.render("listings/show.ejs", { listing });
};

// --- CREATE LISTING - Handle POST request to create a new listing ---
module.exports.createListing = async (req, res, next) => {
    console.log("--- controllers/listing.js: createListing Controller ---");
    console.log("req.body.listing received by controller:", req.body.listing);

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    // Handle image upload from multer
    if (req.file) {
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    console.log("New Listing object BEFORE save():", newListing);

    try {
        await newListing.save(); // Save the new listing to the database
        console.log("New Listing saved SUCCESSFULLY!");

        req.flash("success", "New Listing Created!");
        return res.redirect("/listings"); // Added 'return' for explicit clarity
    } catch (err) {
        // Log the specific error if save() fails
        console.error("Error during newListing.save():", err);

        // This will pass the error to your global error handler
        // or to wrapAsync if it wraps this function
        // It's good practice to ensure error messages are flashed
        if (err.name === 'ValidationError') {
            let errorMessage = "Validation Error: ";
            for (let field in err.errors) {
                errorMessage += err.errors[field].message + "; ";
            }
            req.flash("error", errorMessage);
            return res.redirect("/listings/new"); // Redirect back to form on validation error
        }
        // For any other unexpected error, pass it to the general error handler
        next(err); // Pass the error along
    }
};

// --- RENDER EDIT LISTING - Show form to edit an existing listing ---
module.exports.renderEditListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    // Optional: Transform image URL for display if needed (e.g., add 'q_auto,f_auto' for optimization)
    // let originalImageUrl = listing.image.url;
    // originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250"); // Example: resize for edit form preview
    res.render("listings/edit.ejs", { listing }); // Pass listing to the edit form
};

// --- UPDATE LISTING - Handle PUT request to update a listing ---
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    
    // Prepare update data
    const updateData = { ...req.body.listing };
    
    // If a new image was uploaded, update the image field
    if (req.file) {
        updateData.image = {
            url: req.file.path,
            filename: req.file.filename
        };
        
        // Optional: Delete old image from Cloudinary if it exists
        const oldListing = await Listing.findById(id);
        if (oldListing && oldListing.image && oldListing.image.filename) {
            try {
                await cloudinary.uploader.destroy(oldListing.image.filename);
            } catch (err) {
                console.error("Error deleting old image from Cloudinary:", err);
            }
        }
    }
    
    const listing = await Listing.findByIdAndUpdate(id, updateData, { new: true }); // {new: true} returns the updated doc

    req.flash("success", "Listing Updated!");
    return res.redirect(`/listings/${id}`); // Redirect to the updated listing's show page
};

// --- DELETE LISTING - Handle DELETE request to delete a listing ---
module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    // Find the listing to get its image filename before deleting
    let deletedListing = await Listing.findByIdAndDelete(id);

    // Optional: Delete image from Cloudinary as well
    // if (deletedListing.image && deletedListing.image.filename) {
    //     await cloudinary.uploader.destroy(deletedListing.image.filename);
    // }

    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};