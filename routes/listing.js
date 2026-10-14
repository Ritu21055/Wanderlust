const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// Index route - Show all listings
router.get("/", listingController.index);

// New listing form
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Show single listing
router.get("/:id", listingController.showListing);

// Create new listing
router.post("/", isLoggedIn, upload.single("listing[image]"), validateListing, listingController.createListing);

// Edit listing form
router.get("/:id/edit", isLoggedIn, isOwner, listingController.renderEditListing);

// Update listing
router.put("/:id", isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, listingController.updateListing);

// Delete listing
router.delete("/:id", isLoggedIn, isOwner, listingController.deleteListing);

module.exports = router;
